import Foundation
import CoreImage
import CoreGraphics

public enum LUTExporter {
    /// Evaluates Stages 1–3 across a N³ lattice via MetalFilterProcessor and outputs a standard `.cube` 3D LUT file.
    public static func exportCubeLUT(
        processor: MetalFilterProcessor,
        recipe: AestheticRecipe,
        dimension: Int = 33
    ) throws -> String {
        let total = dimension * dimension * dimension
        var latticeRGB8 = [UInt8](repeating: 255, count: total * 4)

        // Generate canonical .cube lattice (R fastest, then G, then B slowest)
        var idx = 0
        let denom = Float(max(1, dimension - 1))
        for b in 0..<dimension {
            let bf = UInt8((Float(b) / denom * 255.0).rounded())
            for g in 0..<dimension {
                let gf = UInt8((Float(g) / denom * 255.0).rounded())
                for r in 0..<dimension {
                    let rf = UInt8((Float(r) / denom * 255.0).rounded())
                    latticeRGB8[idx] = rf
                    latticeRGB8[idx + 1] = gf
                    latticeRGB8[idx + 2] = bf
                    latticeRGB8[idx + 3] = 255
                    idx += 4
                }
            }
        }

        let width = dimension * dimension
        let height = dimension
        let data = Data(latticeRGB8)
        guard let provider = CGDataProvider(data: data as CFData),
              let latticeCG = CGImage(
                width: width,
                height: height,
                bitsPerComponent: 8,
                bitsPerPixel: 32,
                bytesPerRow: width * 4,
                space: processor.displaySRGBSpace,
                bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue),
                provider: provider,
                decode: nil,
                shouldInterpolate: false,
                intent: .defaultIntent
              ) else {
            throw NSError(domain: "FilterEngine.LUTExporter", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to build LUT lattice image."])
        }

        // Disable spatial passes when baking the pure point-wise 3D color LUT
        var colorOnly = recipe
        colorOnly.halation.enabled = false
        colorOnly.blackMist.enabled = false
        colorOnly.opticsAndGrain.microContrast = 0
        colorOnly.opticsAndGrain.edgeSoftness = 0
        colorOnly.opticsAndGrain.grainAmount = 0
        colorOnly.opticsAndGrain.vignetteStrength = 0
        colorOnly.opticsAndGrain.flashCenterBoost = 0
        colorOnly.opticsAndGrain.lightLeakStrength = 0

        let outCG = try processor.renderCGImage(input: CIImage(cgImage: latticeCG), recipe: colorOnly, seed: 0)
        guard let outData = outCG.dataProvider?.data as Data? else {
            throw NSError(domain: "FilterEngine.LUTExporter", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to read baked LUT image pixels."])
        }

        var lines: [String] = [
            "TITLE \"\(recipe.name)\"",
            "LUT_3D_SIZE \(dimension)",
            "DOMAIN_MIN 0.0 0.0 0.0",
            "DOMAIN_MAX 1.0 1.0 1.0"
        ]
        lines.reserveCapacity(total + 8)

        let bytes = [UInt8](outData)
        for i in 0..<total {
            let p = i * 4
            let r = Float(bytes[p]) / 255.0
            let g = Float(bytes[p + 1]) / 255.0
            let b = Float(bytes[p + 2]) / 255.0
            lines.append(String(format: "%.6f %.6f %.6f", r, g, b))
        }
        return lines.joined(separator: "\n") + "\n"
    }
}
