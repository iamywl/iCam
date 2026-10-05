import Foundation
import CoreImage
#if canImport(CoreImage.CIFilterBuiltins)
import CoreImage.CIFilterBuiltins
#endif

/// Reusable CoreImage processing helpers for modular filters
public enum FilterHelpers {

    /// Adjust color controls (brightness, contrast, saturation)
    public static func adjustColorControls(
        image: CIImage,
        brightness: Float = 0.0,
        contrast: Float = 1.0,
        saturation: Float = 1.0
    ) -> CIImage {
        guard let filter = CIFilter(name: "CIColorControls") else { return image }
        filter.setValue(image, forKey: kCIInputImageKey)
        filter.setValue(brightness, forKey: kCIInputBrightnessKey)
        filter.setValue(contrast, forKey: kCIInputContrastKey)
        filter.setValue(saturation, forKey: kCIInputSaturationKey)
        return filter.outputImage?.cropped(to: image.extent) ?? image
    }

    /// Adjust color temperature and tint (Kelvin)
    public static func adjustTemperatureAndTint(
        image: CIImage,
        neutral: CIVector = CIVector(x: 6500, y: 0),
        targetNeutral: CIVector = CIVector(x: 5500, y: 0)
    ) -> CIImage {
        guard let filter = CIFilter(name: "CITemperatureAndTint") else { return image }
        filter.setValue(image, forKey: kCIInputImageKey)
        filter.setValue(neutral, forKey: "inputNeutral")
        filter.setValue(targetNeutral, forKey: "inputTargetNeutral")
        return filter.outputImage?.cropped(to: image.extent) ?? image
    }

    /// Apply natural optical vignette
    public static func applyVignette(
        image: CIImage,
        intensity: Float = 0.6,
        radius: Float = 1.2
    ) -> CIImage {
        guard let filter = CIFilter(name: "CIVignette") else { return image }
        filter.setValue(image, forKey: kCIInputImageKey)
        filter.setValue(intensity, forKey: kCIInputIntensityKey)
        filter.setValue(radius, forKey: kCIInputRadiusKey)
        return filter.outputImage?.cropped(to: image.extent) ?? image
    }

    /// Apply analog film grain / noise
    public static func applyGrain(
        image: CIImage,
        amount: Float = 0.05
    ) -> CIImage {
        guard amount > 0.001 else { return image }
        guard let noise = CIFilter(name: "CIRandomGenerator")?.outputImage else { return image }

        let croppedNoise = noise.cropped(to: image.extent)
        guard let monochromeNoise = CIFilter(name: "CIColorMonochrome") else { return image }
        monochromeNoise.setValue(croppedNoise, forKey: kCIInputImageKey)
        monochromeNoise.setValue(CIColor(red: 0.5, green: 0.5, blue: 0.5), forKey: kCIInputColorKey)
        monochromeNoise.setValue(1.0, forKey: kCIInputIntensityKey)

        guard let monoImage = monochromeNoise.outputImage else { return image }

        // Blend overlay with original
        guard let blend = CIFilter(name: "CIOverlayBlendMode") else { return image }
        blend.setValue(monoImage, forKey: kCIInputImageKey)
        blend.setValue(image, forKey: kCIInputBackgroundImageKey)

        // Mix by amount
        guard let mixed = blend.outputImage else { return image }
        return blendWithAlpha(foreground: mixed, background: image, alpha: amount)
    }

    /// Apply highlight halation / bloom (for Black Mist & vintage glow)
    public static func applyBloom(
        image: CIImage,
        radius: Float = 10.0,
        intensity: Float = 0.8
    ) -> CIImage {
        guard let filter = CIFilter(name: "CIBloom") else { return image }
        filter.setValue(image, forKey: kCIInputImageKey)
        filter.setValue(radius, forKey: kCIInputRadiusKey)
        filter.setValue(intensity, forKey: kCIInputIntensityKey)
        return filter.outputImage?.cropped(to: image.extent) ?? image
    }

    /// Color matrix adjustment (for cross-processing, CCD color casts)
    public static func applyColorMatrix(
        image: CIImage,
        rVector: CIVector,
        gVector: CIVector,
        bVector: CIVector,
        aVector: CIVector = CIVector(x: 0, y: 0, z: 0, w: 1),
        biasVector: CIVector = CIVector(x: 0, y: 0, z: 0, w: 0)
    ) -> CIImage {
        guard let filter = CIFilter(name: "CIColorMatrix") else { return image }
        filter.setValue(image, forKey: kCIInputImageKey)
        filter.setValue(rVector, forKey: "inputRVector")
        filter.setValue(gVector, forKey: "inputGVector")
        filter.setValue(bVector, forKey: "inputBVector")
        filter.setValue(aVector, forKey: "inputAVector")
        filter.setValue(biasVector, forKey: "inputBiasVector")
        return filter.outputImage?.cropped(to: image.extent) ?? image
    }

    /// Blend foreground and background with given alpha
    public static func blendWithAlpha(
        foreground: CIImage,
        background: CIImage,
        alpha: Float
    ) -> CIImage {
        let clampedAlpha = max(0.0, min(1.0, alpha))
        if clampedAlpha >= 0.999 { return foreground }
        if clampedAlpha <= 0.001 { return background }

        guard let alphaFilter = CIFilter(name: "CIColorMatrix") else { return foreground }
        alphaFilter.setValue(foreground, forKey: kCIInputImageKey)
        alphaFilter.setValue(CIVector(x: 0, y: 0, z: 0, w: CGFloat(clampedAlpha)), forKey: "inputAVector")

        guard let alphaImage = alphaFilter.outputImage,
              let blend = CIFilter(name: "CISourceOverCompositing") else { return foreground }
        blend.setValue(alphaImage, forKey: kCIInputImageKey)
        blend.setValue(background, forKey: kCIInputBackgroundImageKey)
        return blend.outputImage?.cropped(to: background.extent) ?? foreground
    }
}
