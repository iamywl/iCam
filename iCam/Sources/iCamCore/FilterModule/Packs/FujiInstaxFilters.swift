import Foundation
import CoreImage

/// Modular filter pack for Fuji Instax & Polaroid (Instant Film)
public enum FujiInstaxFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            InstaxMiniSoftFilter(),
            Polaroid600SquareFilter(),
            WarmMonochromeFilter(),
            RainbowBorderFilter()
        ]
    }

    // MARK: - 1. Instax Mini Soft (인스탁스 미니 소프트)
    public struct InstaxMiniSoftFilter: CameraFilter {
        public let id = "instax_mini_soft"
        public let name = "Instax Mini Soft"
        public let localizedName = "인스탁스 미니 소프트"
        public let cameraCategory = CameraCategory.fujiInstax
        public let filterDescription = "부드럽고 화사한 파스텔 톤과 자연스럽게 들뜬 섀도우"
        public let iconName = "photo.stack.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.05 * intensity),
                contrast: Float(1.0 - 0.08 * intensity),
                saturation: Float(1.0 + 0.10 * intensity)
            )

            // Warm pastel shift
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5700, y: 10)
            )

            // Instant film softness / gentle bloom
            let bloomed = FilterHelpers.applyBloom(image: img, radius: 6.0, intensity: Float(0.25 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloomed, background: img, alpha: Float(0.5 * intensity))

            // Subtle organic grain
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.03 * intensity))
            return img
        }
    }

    // MARK: - 2. Polaroid 600 Square (폴라로이드 600)
    public struct Polaroid600SquareFilter: CameraFilter {
        public let id = "instax_polaroid_600"
        public let name = "Polaroid 600"
        public let localizedName = "폴라로이드 600"
        public let cameraCategory = CameraCategory.fujiInstax
        public let filterDescription = "묵직하고 따스한 클래식 정방형 즉석인화 톤과 빈티지 케미컬 발색"
        public let iconName = "square.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.16 * intensity),
                saturation: Float(1.0 + 0.14 * intensity)
            )

            // Polaroid amber-green chemical tone
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5200, y: -5)
            )

            // Chemical film vignette
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.65 * intensity), radius: 1.05)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.05 * intensity))
            return img
        }
    }

    // MARK: - 3. Warm Monochrome (아날로그 흑백)
    public struct WarmMonochromeFilter: CameraFilter {
        public let id = "instax_warm_monochrome"
        public let name = "Warm Monochrome"
        public let localizedName = "웜 모노크롬"
        public let cameraCategory = CameraCategory.fujiInstax
        public let filterDescription = "은염 인화 느낌의 깊이 있는 클래식 아날로그 흑백 즉석 사진"
        public let iconName = "circle.lefthalf.filled"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            // Sepia / warm monochrome
            guard let sepia = CIFilter(name: "CISepiaTone") else { return inputImage }
            sepia.setValue(inputImage, forKey: kCIInputImageKey)
            sepia.setValue(Float(0.35 * intensity), forKey: kCIInputIntensityKey)

            guard let sepiaImage = sepia.outputImage else { return inputImage }

            var img = FilterHelpers.adjustColorControls(
                image: sepiaImage,
                brightness: 0.0,
                contrast: Float(1.0 + 0.25 * intensity),
                saturation: Float(1.0 - 0.9 * intensity)
            )

            img = FilterHelpers.applyGrain(image: img, amount: Float(0.06 * intensity))
            return img
        }
    }

    // MARK: - 4. Rainbow Border (비비드 레트로)
    public struct RainbowBorderFilter: CameraFilter {
        public let id = "instax_rainbow_border"
        public let name = "Rainbow Vivid"
        public let localizedName = "레인보우 비비드"
        public let cameraCategory = CameraCategory.fujiInstax
        public let filterDescription = "생동감 넘치는 고채도 컬러 발색과 팝아트 즉석 사진"
        public let iconName = "rainbow"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.05 * intensity),
                contrast: Float(1.0 + 0.20 * intensity),
                saturation: Float(1.0 + 0.40 * intensity)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.4 * intensity), radius: 1.3)
            return img
        }
    }
}
