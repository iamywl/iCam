import Foundation
import CoreImage

/// Modular filter pack for Kyocera Samurai X3.0 (1988 Cyber Half-Frame 72-Shot SLR)
public enum KyoceraSamuraiFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            KyoceraSamuraiHalfFrameFilter(),
            KyoceraSamuraiCyber1988Filter(),
            KyoceraSamuraiBubbleTwilightFilter(),
            KyoceraSamuraiTitaniumFilter()
        ]
    }

    // MARK: - 1. Half-Frame Crisp 72 (하프프레임 72분할)
    public struct KyoceraSamuraiHalfFrameFilter: CameraFilter {
        public let id = "samurai-half"
        public let name = "Half-Frame Crisp 72"
        public let localizedName = "하프프레임 크리스프 72"
        public let cameraCategory = CameraCategory.kyoceraSamurai
        public let filterDescription = "야시카 광학 줌 렌즈의 또렷한 선예도와 세로 분할 72컷 하프프레임"
        public let iconName = "square.split.2x1"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.08 * intensity),
                contrast: Float(1.0 + 0.18 * intensity),
                saturation: Float(1.0 + 0.22 * intensity)
            )

            // Sharp clean Yashica glass feel
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6400, y: -2)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.35 * intensity), radius: 1.35)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.03 * intensity))
            return img
        }
    }

    // MARK: - 2. Bubble High-Tech '88 (버블 하이테크 1988)
    public struct KyoceraSamuraiCyber1988Filter: CameraFilter {
        public let id = "samurai-cyber"
        public let name = "Bubble High-Tech '88"
        public let localizedName = "버블 하이테크 '88"
        public let cameraCategory = CameraCategory.kyoceraSamurai
        public let filterDescription = "1988년 도쿄 하이테크 열풍의 미래지향 에메랄드 HUD와 맑은 선예도"
        public let iconName = "cpu"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.10 * intensity),
                contrast: Float(1.0 + 0.20 * intensity),
                saturation: Float(1.0 + 0.24 * intensity)
            )

            // High-tech emerald tint
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6700, y: -8)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.40 * intensity), radius: 1.2)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.025 * intensity))
            return img
        }
    }

    // MARK: - 3. Shinjuku Golden Hour (신주쿠 골든아워)
    public struct KyoceraSamuraiBubbleTwilightFilter: CameraFilter {
        public let id = "samurai-tokyo"
        public let name = "Shinjuku Golden Hour"
        public let localizedName = "신주쿠 골든아워"
        public let cameraCategory = CameraCategory.kyoceraSamurai
        public let filterDescription = "신주쿠 마천루에 반사되는 찬란한 황혼의 황금빛 햇살과 고급스러운 웜톤"
        public let iconName = "building.2.crop.circle"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.08 * intensity),
                contrast: Float(1.0 + 0.16 * intensity),
                saturation: Float(1.0 + 0.30 * intensity)
            )

            // Warm golden hour sunlight
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5200, y: 12)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.45 * intensity), radius: 1.25)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.035 * intensity))
            return img
        }
    }

    // MARK: - 4. Ryuichi B&W 1988 (사카모토 류이치 흑백 1988)
    public struct KyoceraSamuraiTitaniumFilter: CameraFilter {
        public let id = "samurai-titanium"
        public let name = "Ryuichi B&W 1988"
        public let localizedName = "류이치 흑백 1988"
        public let cameraCategory = CameraCategory.kyoceraSamurai
        public let filterDescription = "80s 뉴웨이브 사카모토 류이치 감성의 지적이고 정제된 하이콘트라스트 흑백"
        public let iconName = "shield.lefthalf.filled"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.04 * intensity),
                contrast: Float(1.0 + 0.45 * intensity),
                saturation: Float(1.0 - 1.0 * intensity)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.40 * intensity), radius: 1.2)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.03 * intensity))
            return img
        }
    }
}
