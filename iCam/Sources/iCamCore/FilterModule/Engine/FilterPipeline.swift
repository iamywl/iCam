import Foundation
import CoreImage

/// Pipeline executor that chains modular camera filters, optical filters, and live backgrounds
public final class FilterPipeline: @unchecked Sendable {
    public static let shared = FilterPipeline()

    private let ciContext: CIContext

    public init(ciContext: CIContext? = nil) {
        if let ctx = ciContext {
            self.ciContext = ctx
        } else {
            // High performance GPU context
            self.ciContext = CIContext(options: [
                .useSoftwareRenderer: false,
                .priorityRequestLow: false
            ])
        }
    }

    /// Process a frame through the modular filter chain
    /// - Parameters:
    ///   - inputImage: Source CIImage from camera or still photo
    ///   - filter: Active modular CameraFilter
    ///   - opticalFilter: Optional attached OpticalFilter (e.g. Black Mist)
    ///   - opticalStrength: Strength of optical filter (0.0 to 1.0)
    ///   - filterIntensity: Intensity of camera filter (0.0 to 1.0)
    ///   - backgroundMatte: Optional segmentation matte for live backdrop replacement
    ///   - backgroundColorHex: Optional hex color for personal color studio
    /// - Returns: Processed output CIImage
    public func process(
        inputImage: CIImage,
        filter: any CameraFilter,
        opticalFilter: (any OpticalFilter)? = nil,
        opticalStrength: Double = 1.0,
        filterIntensity: Double = 1.0,
        backgroundMatte: CIImage? = nil,
        backgroundColorHex: String? = nil
    ) -> CIImage {
        var currentImage = inputImage

        // Step 1: Live background color replacement (if matte & color are provided)
        if let matte = backgroundMatte, let hex = backgroundColorHex, let bgColor = CIColor(hexString: hex) {
            currentImage = blendBackground(
                foreground: currentImage,
                matte: matte,
                backgroundColor: bgColor
            )
        }

        // Step 2: Apply modular camera filter
        currentImage = filter.apply(
            to: currentImage,
            context: ciContext,
            intensity: filterIntensity
        )

        // Step 3: Apply optical lens filter (if mounted)
        if let optical = opticalFilter, opticalStrength > 0.001 {
            currentImage = optical.apply(
                to: currentImage,
                context: ciContext,
                strength: opticalStrength
            )
        }

        return currentImage
    }

    /// Blend subject with a personal color studio background using person mask
    private func blendBackground(
        foreground: CIImage,
        matte: CIImage,
        backgroundColor: CIColor
    ) -> CIImage {
        // Create solid background image with radial gradient studio lighting
        let extent = foreground.extent
        let center = CIVector(x: extent.midX, y: extent.midY)
        let radius = max(extent.width, extent.height) * 0.85

        // Lighter center color for radial studio soft light
        let lighterColor = CIColor(
            red: min(1.0, backgroundColor.red * 1.15 + 0.05),
            green: min(1.0, backgroundColor.green * 1.15 + 0.05),
            blue: min(1.0, backgroundColor.blue * 1.15 + 0.05)
        )

        guard let radial = CIFilter(name: "CIRadialGradient") else { return foreground }
        radial.setValue(center, forKey: "inputCenter")
        radial.setValue(0.0, forKey: "inputRadius0")
        radial.setValue(radius, forKey: "inputRadius1")
        radial.setValue(lighterColor, forKey: "inputColor0")
        radial.setValue(backgroundColor, forKey: "inputColor1")

        guard let bgLayer = radial.outputImage?.cropped(to: extent),
              let blendWithMask = CIFilter(name: "CIBlendWithMask") else { return foreground }

        // Resize or scale matte to match extent if needed
        let scaleX = extent.width / matte.extent.width
        let scaleY = extent.height / matte.extent.height
        let scaledMatte = matte.transformed(by: CGAffineTransform(scaleX: scaleX, y: scaleY))

        blendWithMask.setValue(foreground, forKey: kCIInputImageKey)
        blendWithMask.setValue(bgLayer, forKey: kCIInputBackgroundImageKey)
        blendWithMask.setValue(scaledMatte, forKey: kCIInputMaskImageKey)

        return blendWithMask.outputImage?.cropped(to: extent) ?? foreground
    }

    /// Render CIImage to CGImage
    public func render(image: CIImage) -> CGImage? {
        return ciContext.createCGImage(image, from: image.extent)
    }
}

// MARK: - CIColor Hex Extension
public extension CIColor {
    convenience init?(hexString: String) {
        var cleanHex = hexString.trimmingCharacters(in: .whitespacesAndNewlines)
        if cleanHex.hasPrefix("#") {
            cleanHex.removeFirst()
        }
        guard cleanHex.count == 6, let rgb = UInt64(cleanHex, radix: 16) else {
            return nil
        }
        let r = CGFloat((rgb >> 16) & 0xFF) / 255.0
        let g = CGFloat((rgb >> 8) & 0xFF) / 255.0
        let b = CGFloat(rgb & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}
