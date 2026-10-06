import Foundation
import CoreImage

/// Modular filter pack for Polaroid SX-70 (1972 Vintage Folding Land Camera)
public enum PolaroidSX70FilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            PolaroidSX70VintageFadeFilter(),
            PolaroidSX70Color600Filter(),
            PolaroidSX70Expired1979Filter(),
            PolaroidSX70SepiaDreamFilter()
        ]
    }

    // MARK: - 1. SX-70 Vintage Fade (빈티지 페이드 1972)
    public struct PolaroidSX70VintageFadeFilter: CameraFilter {
        public let id = "polaroid_sx70_vintage_fade"
        public let name = "SX-70 Vintage Fade"
        public let localizedName = "SX-70 빈티지 페이드"
        public let cameraCategory = CameraCategory.polaroidSX70
        public let filterDescription = "1972년 오리지널 SX-70 유제 특유의 따뜻하게 바랜 세피아-앰버 섀도우와 부드러운 톤"
        public let iconName = "photo.on.rectangle.angled"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.04 * intensity),
                contrast: Float(1.0 - 0.05 * intensity),
                saturation: Float(1.0 - 0.12 * intensity)
            )

            // Vintage aged emulsion shift
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5500, y: 8)
            )

            let bloom = FilterHelpers.applyBloom(image: img, radius: 4.0, intensity: Float(0.18 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.3 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.50 * intensity), radius: 1.2)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.05 * intensity))
            return img
        }
    }

    // MARK: - 2. Color Protection 600 (컬러 프로텍션 600)
    public struct PolaroidSX70Color600Filter: CameraFilter {
        public let id = "polaroid_sx70_color_600"
        public let name = "Color Protection 600"
        public let localizedName = "컬러 프로텍션 600"
        public let cameraCategory = CameraCategory.polaroidSX70
        public let filterDescription = "진한 사이언 블루 섀도우와 마젠타 하이라이트의 레트로 즉석사진 발색"
        public let iconName = "paintpalette.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.18 * intensity),
                saturation: Float(1.0 + 0.22 * intensity)
            )

            // Cyan shadow, magenta highlight crossover
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6300, y: -4)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.60 * intensity), radius: 1.1)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.04 * intensity))
            return img
        }
    }

    // MARK: - 3. Expired Film 1979 (유통기한 만료 필름 1979)
    public struct PolaroidSX70Expired1979Filter: CameraFilter {
        public let id = "polaroid_sx70_expired_1979"
        public let name = "Expired Film 1979"
        public let localizedName = "만료 필름 1979"
        public let cameraCategory = CameraCategory.polaroidSX70
        public let filterDescription = "오래 보관된 즉석 필름의 화학 반응 변색, 들뜬 암부와 황록색 빈티지 톤"
        public let iconName = "hourglass.bottomhalf.filled"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.06 * intensity),
                contrast: Float(1.0 - 0.10 * intensity),
                saturation: Float(1.0 - 0.25 * intensity)
            )

            // Yellow-greenish expired chemical tint
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5200, y: -6)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.70 * intensity), radius: 1.0)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.065 * intensity))
            return img
        }
    }

    // MARK: - 4. Sepia Dream (세피아 드림)
    public struct PolaroidSX70SepiaDreamFilter: CameraFilter {
        public let id = "polaroid_sx70_sepia_dream"
        public let name = "Sepia Dream"
        public let localizedName = "세피아 드림"
        public let cameraCategory = CameraCategory.polaroidSX70
        public let filterDescription = "아날로그 즉석 사진의 클래식 브라운 세피아 모노크롬과 몽환적인 소프트 포커스"
        public let iconName = "moon.stars.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            // First adjust to sepia tone curve
            let sepia = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.15 * intensity),
                saturation: Float(1.0 - 0.70 * intensity)
            )

            let tinted = FilterHelpers.adjustTemperatureAndTint(
                image: sepia,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 4800, y: 12)
            )

            let bloom = FilterHelpers.applyBloom(image: tinted, radius: 6.0, intensity: Float(0.35 * intensity))
            let blended = FilterHelpers.blendWithAlpha(foreground: bloom, background: tinted, alpha: Float(0.40 * intensity))
            let vignetted = FilterHelpers.applyVignette(image: blended, intensity: Float(0.55 * intensity), radius: 1.3)
            return FilterHelpers.applyGrain(image: vignetted, amount: Float(0.045 * intensity))
        }
    }
}
