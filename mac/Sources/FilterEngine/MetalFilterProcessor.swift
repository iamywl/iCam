import Foundation
import Metal
import CoreImage
import CoreGraphics
import simd

private struct BlurUniforms {
    var sigma: Float
    var texelStepX: Float
    var texelStepY: Float
    var unused: Float = 0
}

/// Thread-safe, iOS-portable Metal GPU pipeline for 16-bit half-float scene-referred film & optical processing.
public final class MetalFilterProcessor: @unchecked Sendable {
    public let device: MTLDevice
    public let commandQueue: MTLCommandQueue
    public let ciContext: CIContext

    private let prePassPSO: MTLComputePipelineState
    private let downsamplePSO: MTLComputePipelineState
    private let blurHPSO: MTLComputePipelineState
    private let blurVPSO: MTLComputePipelineState
    private let compositePSO: MTLComputePipelineState

    public let linearSRGBSpace: CGColorSpace
    public let displaySRGBSpace: CGColorSpace
    public let displayP3Space: CGColorSpace

    private final class ScratchTextures {
        var width: Int = 0
        var height: Int = 0
        var halfW: Int = 0
        var halfH: Int = 0
        var inputLinear: MTLTexture?
        var graded: MTLTexture?
        var glowSrc: MTLTexture?
        var outputEncoded: MTLTexture?
        var halA: MTLTexture?
        var halB: MTLTexture?
        var mistA: MTLTexture?
        var mistB: MTLTexture?
        var lowA: MTLTexture?
        var lowB: MTLTexture?
    }

    private let scratch = ScratchTextures()
    private let lock = NSLock()

    public init(device: MTLDevice? = MTLCreateSystemDefaultDevice()) throws {
        guard let dev = device, let queue = dev.makeCommandQueue() else {
            throw NSError(domain: "FilterEngine", code: 1, userInfo: [NSLocalizedDescriptionKey: "Metal GPU device unavailable."])
        }
        self.device = dev
        self.commandQueue = queue
        self.linearSRGBSpace = CGColorSpace(name: CGColorSpace.extendedLinearSRGB)!
        self.displaySRGBSpace = CGColorSpace(name: CGColorSpace.sRGB)!
        self.displayP3Space = CGColorSpace(name: CGColorSpace.displayP3) ?? CGColorSpace(name: CGColorSpace.sRGB)!

        self.ciContext = CIContext(
            mtlDevice: dev,
            options: [
                .workingColorSpace: linearSRGBSpace,
                .workingFormat: CIFormat.RGBAh,
                .cacheIntermediates: false
            ]
        )

        let options = MTLCompileOptions()
        options.fastMathEnabled = true
        let library = try dev.makeLibrary(source: OpticalShaderSource.mslSource, options: options)

        func makePSO(_ name: String) throws -> MTLComputePipelineState {
            guard let fn = library.makeFunction(name: name) else {
                throw NSError(domain: "FilterEngine", code: 2, userInfo: [NSLocalizedDescriptionKey: "Missing MSL kernel '\(name)'"])
            }
            return try dev.makeComputePipelineState(function: fn)
        }

        self.prePassPSO = try makePSO("opticalPrePassKernel")
        self.downsamplePSO = try makePSO("downsampleGlowKernel")
        self.blurHPSO = try makePSO("blurHorizontalKernel")
        self.blurVPSO = try makePSO("blurVerticalKernel")
        self.compositePSO = try makePSO("opticalCompositeKernel")
    }

    /// Renders a `CIImage` through `recipe` using the 8-stage linear Metal pipeline, returning a display-ready `CGImage`.
    public func renderCGImage(
        input: CIImage,
        recipe: AestheticRecipe,
        maxDimension: Int? = nil,
        seed: UInt32 = 42,
        debugMaskMode: DebugMaskMode = .normal
    ) throws -> CGImage {
        lock.lock()
        defer { lock.unlock() }

        var workingImage = input
        if let maxDim = maxDimension {
            let maxSide = max(workingImage.extent.width, workingImage.extent.height)
            if maxSide > CGFloat(maxDim) {
                let scale = CGFloat(maxDim) / maxSide
                workingImage = workingImage.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
            }
        }

        // Normalize origin cleanly to (0, 0)
        let origin = workingImage.extent.origin
        if origin.x != 0 || origin.y != 0 {
            workingImage = workingImage.transformed(by: CGAffineTransform(translationX: -origin.x, y: -origin.y))
        }

        let width = max(2, Int(workingImage.extent.width.rounded()))
        let height = max(2, Int(workingImage.extent.height.rounded()))
        try ensureTextures(width: width, height: height)

        guard let cmdBuf = commandQueue.makeCommandBuffer(),
              let inputTex = scratch.inputLinear,
              let outTex = scratch.outputEncoded else {
            throw NSError(domain: "FilterEngine", code: 3, userInfo: [NSLocalizedDescriptionKey: "Failed to allocate Metal command buffer."])
        }

        // Render CoreImage source into linear RGBA16Float texture (top-left Metal orientation via isFlipped = true)
        let dest = CIRenderDestination(mtlTexture: inputTex, commandBuffer: cmdBuf)
        dest.colorSpace = linearSRGBSpace
        dest.isFlipped = true
        _ = try ciContext.startTask(toRender: workingImage, from: CGRect(x: 0, y: 0, width: width, height: height), to: dest, at: .zero)

        try encodeFilterPasses(
            commandBuffer: cmdBuf,
            inputLinear: inputTex,
            outputTexture: outTex,
            recipe: recipe,
            seed: seed,
            debugMaskMode: debugMaskMode,
            encodeSRGB: true
        )

        cmdBuf.commit()
        cmdBuf.waitUntilCompleted()

        if let err = cmdBuf.error {
            throw err
        }

        return try makeCGImage(fromEncodedSRGBTexture: outTex, width: width, height: height)
    }

    /// Executes GPU compute passes inside an existing command buffer (zero-copy friendly for live MTKView / camera frames).
    public func renderIntoTexture(
        commandBuffer: MTLCommandBuffer,
        inputCIImage: CIImage,
        targetTexture: MTLTexture,
        recipe: AestheticRecipe,
        seed: UInt32,
        debugMaskMode: DebugMaskMode = .normal,
        encodeSRGB: Bool = true
    ) throws {
        lock.lock()
        defer { lock.unlock() }

        let width = targetTexture.width
        let height = targetTexture.height
        try ensureTextures(width: width, height: height)

        guard let inputTex = scratch.inputLinear else { return }

        var normalized = inputCIImage
        let origin = normalized.extent.origin
        if origin.x != 0 || origin.y != 0 {
            normalized = normalized.transformed(by: CGAffineTransform(translationX: -origin.x, y: -origin.y))
        }

        let sx = CGFloat(width) / max(normalized.extent.width, 1)
        let sy = CGFloat(height) / max(normalized.extent.height, 1)
        if abs(sx - 1) > 0.001 || abs(sy - 1) > 0.001 {
            normalized = normalized.transformed(by: CGAffineTransform(scaleX: sx, y: sy))
        }

        let dest = CIRenderDestination(mtlTexture: inputTex, commandBuffer: commandBuffer)
        dest.colorSpace = linearSRGBSpace
        dest.isFlipped = true
        _ = try ciContext.startTask(toRender: normalized, from: CGRect(x: 0, y: 0, width: width, height: height), to: dest, at: .zero)

        try encodeFilterPasses(
            commandBuffer: commandBuffer,
            inputLinear: inputTex,
            outputTexture: targetTexture,
            recipe: recipe,
            seed: seed,
            debugMaskMode: debugMaskMode,
            encodeSRGB: encodeSRGB
        )
    }

    private func encodeFilterPasses(
        commandBuffer: MTLCommandBuffer,
        inputLinear: MTLTexture,
        outputTexture: MTLTexture,
        recipe: AestheticRecipe,
        seed: UInt32,
        debugMaskMode: DebugMaskMode,
        encodeSRGB: Bool
    ) throws {
        guard let graded = scratch.graded,
              let glowSrc = scratch.glowSrc,
              let halA = scratch.halA,
              let halB = scratch.halB,
              let mistA = scratch.mistA,
              let mistB = scratch.mistB,
              let lowA = scratch.lowA,
              let lowB = scratch.lowB else { return }

        var uniforms = MetalRecipeUniforms(recipe: recipe, seed: seed, debugMaskMode: debugMaskMode, encodeSRGB: encodeSRGB)

        let fullW = inputLinear.width
        let fullH = inputLinear.height
        let halfW = halA.width
        let halfH = halA.height
        let minDim = Float(min(fullW, fullH))

        // Pass 1: Stages 1-3 + Glow Extraction
        if let enc = commandBuffer.makeComputeCommandEncoder() {
            enc.setComputePipelineState(prePassPSO)
            enc.setTexture(inputLinear, index: 0)
            enc.setTexture(graded, index: 1)
            enc.setTexture(glowSrc, index: 2)
            enc.setBytes(&uniforms, length: MemoryLayout<MetalRecipeUniforms>.stride, index: 0)
            dispatch(encoder: enc, pso: prePassPSO, width: fullW, height: fullH)
            enc.endEncoding()
        }

        // Pass 2: Downsample to half-res glow buffers
        if let enc = commandBuffer.makeComputeCommandEncoder() {
            enc.setComputePipelineState(downsamplePSO)
            enc.setTexture(graded, index: 0)
            enc.setTexture(glowSrc, index: 1)
            enc.setTexture(halA, index: 2)
            enc.setTexture(mistA, index: 3)
            enc.setTexture(lowA, index: 4)
            dispatch(encoder: enc, pso: downsamplePSO, width: halfW, height: halfH)
            enc.endEncoding()
        }

        // Pass 3A: Separable Blur for Halation (independent X/Y anisotropy for CCD blooming)
        if recipe.halation.enabled && recipe.halation.strength > 0.001 {
            let baseSigma = max(0.8, recipe.halation.radiusNorm * minDim * 0.5)
            encodeSeparableBlur(commandBuffer: commandBuffer, src: halA, tmp: halB, dst: halA, sigmaX: baseSigma, sigmaY: baseSigma * recipe.halation.verticalAnisotropy)
        }

        // Pass 3B: Separable Blur for Black Mist highlight diffusion
        if recipe.blackMist.enabled && recipe.blackMist.strength > 0.001 {
            let mistSigma = max(1.0, recipe.blackMist.radiusNorm * minDim * 0.5)
            encodeSeparableBlur(commandBuffer: commandBuffer, src: mistA, tmp: mistB, dst: mistA, sigmaX: mistSigma, sigmaY: mistSigma)
        }

        // Pass 3C: Low-frequency buffer blur (for Editorial 3D Pop, Skin Chroma Smooth, Lo-Fi peripheral softness)
        let needsLowFreq = recipe.colorScience.skinChromaSmooth > 0.001 || recipe.opticsAndGrain.microContrast > 0.001 || recipe.opticsAndGrain.edgeSoftness > 0.001
        if needsLowFreq {
            let lowSigma = max(1.0, minDim * 0.006 * 0.5)
            encodeSeparableBlur(commandBuffer: commandBuffer, src: lowA, tmp: lowB, dst: lowA, sigmaX: lowSigma, sigmaY: lowSigma)
        }

        // Pass 4: Final Stages 4-8 Composite
        if let enc = commandBuffer.makeComputeCommandEncoder() {
            enc.setComputePipelineState(compositePSO)
            enc.setTexture(inputLinear, index: 0)
            enc.setTexture(graded, index: 1)
            enc.setTexture(halA, index: 2)
            enc.setTexture(mistA, index: 3)
            enc.setTexture(lowA, index: 4)
            enc.setTexture(glowSrc, index: 5)
            enc.setTexture(outputTexture, index: 6)
            enc.setBytes(&uniforms, length: MemoryLayout<MetalRecipeUniforms>.stride, index: 0)
            dispatch(encoder: enc, pso: compositePSO, width: fullW, height: fullH)
            enc.endEncoding()
        }
    }

    private func encodeSeparableBlur(
        commandBuffer: MTLCommandBuffer,
        src: MTLTexture,
        tmp: MTLTexture,
        dst: MTLTexture,
        sigmaX: Float,
        sigmaY: Float
    ) {
        let w = src.width
        let h = src.height
        var buX = BlurUniforms(sigma: sigmaX, texelStepX: 1.0 / Float(w), texelStepY: 0)
        var buY = BlurUniforms(sigma: sigmaY, texelStepX: 0, texelStepY: 1.0 / Float(h))

        if let enc = commandBuffer.makeComputeCommandEncoder() {
            enc.setComputePipelineState(blurHPSO)
            enc.setTexture(src, index: 0)
            enc.setTexture(tmp, index: 1)
            enc.setBytes(&buX, length: MemoryLayout<BlurUniforms>.stride, index: 0)
            dispatch(encoder: enc, pso: blurHPSO, width: w, height: h)
            enc.endEncoding()
        }
        if let enc = commandBuffer.makeComputeCommandEncoder() {
            enc.setComputePipelineState(blurVPSO)
            enc.setTexture(tmp, index: 0)
            enc.setTexture(dst, index: 1)
            enc.setBytes(&buY, length: MemoryLayout<BlurUniforms>.stride, index: 0)
            dispatch(encoder: enc, pso: blurVPSO, width: w, height: h)
            enc.endEncoding()
        }
    }

    private func dispatch(encoder: MTLComputeCommandEncoder, pso: MTLComputePipelineState, width: Int, height: Int) {
        let tw = max(1, min(pso.threadExecutionWidth, 16))
        let th = max(1, min(pso.maxTotalThreadsPerThreadgroup / tw, 16))
        let tgSize = MTLSize(width: tw, height: th, depth: 1)
        let gridSize = MTLSize(width: width, height: height, depth: 1)
        encoder.dispatchThreads(gridSize, threadsPerThreadgroup: tgSize)
    }

    private func ensureTextures(width: Int, height: Int) throws {
        let halfW = max(1, (width + 1) / 2)
        let halfH = max(1, (height + 1) / 2)
        if scratch.width == width && scratch.height == height && scratch.inputLinear != nil {
            return
        }

        func makeTex(_ w: Int, _ h: Int, usage: MTLTextureUsage) -> MTLTexture? {
            let desc = MTLTextureDescriptor.texture2DDescriptor(pixelFormat: .rgba16Float, width: w, height: h, mipmapped: false)
            desc.usage = usage
            desc.storageMode = .shared
            return device.makeTexture(descriptor: desc)
        }

        let rw: MTLTextureUsage = [.shaderRead, .shaderWrite, .renderTarget]
        let srw: MTLTextureUsage = [.shaderRead, .shaderWrite]
        scratch.width = width
        scratch.height = height
        scratch.halfW = halfW
        scratch.halfH = halfH
        scratch.inputLinear = makeTex(width, height, usage: rw)
        scratch.graded = makeTex(width, height, usage: srw)
        scratch.glowSrc = makeTex(width, height, usage: srw)
        scratch.outputEncoded = makeTex(width, height, usage: rw)
        scratch.halA = makeTex(halfW, halfH, usage: srw)
        scratch.halB = makeTex(halfW, halfH, usage: srw)
        scratch.mistA = makeTex(halfW, halfH, usage: srw)
        scratch.mistB = makeTex(halfW, halfH, usage: srw)
        scratch.lowA = makeTex(halfW, halfH, usage: srw)
        scratch.lowB = makeTex(halfW, halfH, usage: srw)
    }

    private func makeCGImage(fromEncodedSRGBTexture tex: MTLTexture, width: Int, height: Int) throws -> CGImage {
        // Wrap encoded sRGB values in CIImage (untagged linear copy into sRGB context preserves exact encoded bytes)
        let floatBytesPerRow = width * 4 * MemoryLayout<UInt16>.size
        var rawHalf = [UInt16](repeating: 0, count: width * height * 4)
        tex.getBytes(&rawHalf, bytesPerRow: floatBytesPerRow, from: MTLRegionMake2D(0, 0, width, height), mipmapLevel: 0)

        var rgba8 = [UInt8](repeating: 255, count: width * height * 4)
        let count = width * height * 4
        for i in 0..<count {
            let f16 = Float16(bitPattern: rawHalf[i])
            let clamped = max(0.0, min(1.0, Float(f16)))
            rgba8[i] = UInt8((clamped * 255.0).rounded())
        }

        let data = Data(rgba8)
        guard let provider = CGDataProvider(data: data as CFData),
              let cg = CGImage(
                width: width,
                height: height,
                bitsPerComponent: 8,
                bitsPerPixel: 32,
                bytesPerRow: width * 4,
                space: displaySRGBSpace,
                bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue),
                provider: provider,
                decode: nil,
                shouldInterpolate: true,
                intent: .defaultIntent
              ) else {
            throw NSError(domain: "FilterEngine", code: 4, userInfo: [NSLocalizedDescriptionKey: "Failed to build CGImage from GPU texture."])
        }
        return cg
    }
}
