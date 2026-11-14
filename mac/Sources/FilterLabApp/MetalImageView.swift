import SwiftUI
import MetalKit
import CoreImage
import FilterEngine

/// Hardware-accelerated Metal canvas rendering a `CIImage` directly through `MetalFilterProcessor`
/// into an `MTKView` with zero CPU readback overhead.
struct MetalImageView: NSViewRepresentable {
    let processor: MetalFilterProcessor
    let sourceImage: CIImage
    let recipe: AestheticRecipe
    let seed: UInt32
    let debugMaskMode: DebugMaskMode
    let isLiveStream: Bool

    func makeCoordinator() -> Coordinator {
        Coordinator(processor: processor)
    }

    func makeNSView(context: Context) -> MTKView {
        let mtkView = MTKView(frame: .zero, device: processor.device)
        mtkView.delegate = context.coordinator
        mtkView.colorPixelFormat = .bgra8Unorm
        mtkView.colorspace = processor.displaySRGBSpace
        mtkView.framebufferOnly = false
        mtkView.layer?.isOpaque = true
        mtkView.layer?.backgroundColor = DarkroomTheme.darkroomMatNS.cgColor
        mtkView.enableSetNeedsDisplay = !isLiveStream
        mtkView.isPaused = !isLiveStream
        mtkView.preferredFramesPerSecond = 60
        context.coordinator.update(
            sourceImage: sourceImage,
            recipe: recipe,
            seed: seed,
            debugMaskMode: debugMaskMode
        )
        return mtkView
    }

    func updateNSView(_ mtkView: MTKView, context: Context) {
        let streamModeChanged = mtkView.isPaused == isLiveStream
        if streamModeChanged {
            mtkView.enableSetNeedsDisplay = !isLiveStream
            mtkView.isPaused = !isLiveStream
        }
        let changed = context.coordinator.update(
            sourceImage: sourceImage,
            recipe: recipe,
            seed: seed,
            debugMaskMode: debugMaskMode
        )
        if !isLiveStream && changed {
            mtkView.setNeedsDisplay(mtkView.bounds)
        }
    }

    final class Coordinator: NSObject, MTKViewDelegate {
        private let processor: MetalFilterProcessor
        private var sourceImage: CIImage?
        private var recipe: AestheticRecipe = .stockBaseline
        private var seed: UInt32 = 42
        private var debugMaskMode: DebugMaskMode = .normal
        private var lastRenderKey: Int = 0

        init(processor: MetalFilterProcessor) {
            self.processor = processor
        }

        @discardableResult
        func update(
            sourceImage: CIImage,
            recipe: AestheticRecipe,
            seed: UInt32,
            debugMaskMode: DebugMaskMode
        ) -> Bool {
            var hasher = Hasher()
            hasher.combine(ObjectIdentifier(sourceImage))
            hasher.combine(sourceImage.extent.width)
            hasher.combine(sourceImage.extent.height)
            hasher.combine(recipe)
            hasher.combine(seed)
            hasher.combine(debugMaskMode)
            let newKey = hasher.finalize()

            let didChange = (newKey != lastRenderKey)
            self.sourceImage = sourceImage
            self.recipe = recipe
            self.seed = seed
            self.debugMaskMode = debugMaskMode
            self.lastRenderKey = newKey
            return didChange
        }

        func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {
            if view.isPaused {
                view.setNeedsDisplay(view.bounds)
            }
        }

        func draw(in view: MTKView) {
            guard let sourceImage,
                  sourceImage.extent.width > 1,
                  sourceImage.extent.height > 1,
                  view.drawableSize.width >= 2,
                  view.drawableSize.height >= 2,
                  let drawable = view.currentDrawable,
                  let cmdBuf = processor.commandQueue.makeCommandBuffer() else { return }

            do {
                try processor.renderIntoTexture(
                    commandBuffer: cmdBuf,
                    inputCIImage: sourceImage,
                    targetTexture: drawable.texture,
                    recipe: recipe,
                    seed: seed,
                    debugMaskMode: debugMaskMode,
                    encodeSRGB: true
                )
                cmdBuf.present(drawable)
                cmdBuf.commit()
            } catch {
                // Skip invalid transient drawable frame cleanly
            }
        }
    }
}
