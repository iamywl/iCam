import Foundation
import CoreImage

/// Modular filter pack for Leica M Rangefinder Series (Summilux 35mm & Monochrom)
public enum LeicaMFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            LeicaSummiluxRichShadowFilter(),
            LeicaMonochromClassicFilter(),
            LeicaGermanGlassFilter(),
            LeicaRedDotColorFilter()
        ]
    }

    // MARK: - 1. Leica Summilux 35mm Rich Shadow (라이카 주밀룩스 리치 섀도우)
    public struct LeicaSummiluxRichShadowFilter: CameraFilter {
        public let id = "leica_summilux_rich_shadow"
        public let name = "Leica Summilux 35mm Rich Shadow"
        public let localizedName = "라이카 주밀룩스 리치 섀도우"
        public let cameraCategory = CameraCategory.leicaM
        public let filterDescription = "F1.4 최대개방의 입체감과 깊이 있는 섀도우 톤, 독일 수제 렌즈 특유의 영혼"
        public let iconName = "camera.aperture"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.01 * intensity),
                contrast: Float(1.0 + 0.20 * intensity),
                saturation: Float(1.0 + 0.08 * intensity)
            )

            // Leica signature neutral-warm balance
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6100, y: 3)
            )

            let bloom = FilterHelpers.applyBloom(image: img, radius: 5.0, intensity: Float(0.18 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.25 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.35 * intensity), radius: 1.5)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.03 * intensity))
            return img
        }
    }

    // MARK: - 2. Leica Monochrom Classic (라이카 모노크롬 클래식)
    public struct LeicaMonochromClassicFilter: CameraFilter {
        public let id = "leica_monochrom_classic"
        public let name = "Leica Monochrom Classic"
        public let localizedName = "라이카 모노크롬 클래식"
        public let cameraCategory = CameraCategory.leicaM
        public let filterDescription = "컬러 필터 어레이가 없는 라이카 M 모노크롬 센서의 극도로 미세한 그레이스케일 계조"
        public let iconName = "circle.lefthalf.filled"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            let bw = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.32 * intensity),
                saturation: 0.0
            )

            var img = FilterHelpers.blendWithAlpha(foreground: bw, background: inputImage, alpha: Float(intensity))
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.04 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.30 * intensity), radius: 1.6)
            return img
        }
    }

    // MARK: - 3. Vintage German Glass (빈티지 저먼 글래스)
    public struct LeicaGermanGlassFilter: CameraFilter {
        public let id = "leica_german_glass"
        public let name = "Vintage German Glass"
        public let localizedName = "빈티지 저먼 글래스"
        public let cameraCategory = CameraCategory.leicaM
        public let filterDescription = "1960년대 라이츠(Leitz) 렌즈의 올드 코팅 플레어와 따뜻하고 촉촉한 색채 렌더링"
        public let iconName = "sparkles"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.03 * intensity),
                contrast: Float(1.0 + 0.10 * intensity),
                saturation: Float(1.0 + 0.12 * intensity)
            )

            // Warm golden Leitz optical tint
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5500, y: 8)
            )

            let bloom = FilterHelpers.applyBloom(image: img, radius: 8.0, intensity: Float(0.30 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.35 * intensity))
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.05 * intensity))
            return img
        }
    }

    // MARK: - 4. Leica Red Dot Color (라이카 레드 닷 내추럴)
    public struct LeicaRedDotColorFilter: CameraFilter {
        public let id = "leica_red_dot_color"
        public let name = "Leica Red Dot Color"
        public let localizedName = "라이카 레드 닷 내추럴"
        public let cameraCategory = CameraCategory.leicaM
        public let filterDescription = "라이카 M 디지털 센서의 사실적이면서도 깊이감 있는 시그니처 레드/피부 발색"
        public let iconName = "circle.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: 0.0,
                contrast: Float(1.0 + 0.18 * intensity),
                saturation: Float(1.0 + 0.14 * intensity)
            )

            // Crisp European daylight
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6300, y: 2)
            )

            img = FilterHelpers.applyGrain(image: img, amount: Float(0.025 * intensity))
            return img
        }
    }
}
