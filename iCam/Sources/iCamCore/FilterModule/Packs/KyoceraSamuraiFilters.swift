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

    // MARK: - 1. Half-Frame 72 Split (하프프레임 72 분할)
    public struct KyoceraSamuraiHalfFrameFilter: CameraFilter {
        public let id = "samurai-half"
        public let name = "Half-Frame 72 Split"
        public let localizedName = "하프프레임 72컷 분할"
        public let cameraCategory = CameraCategory.kyoceraSamurai
        public let filterDescription = "세로 분할 하프프레임 72컷과 고선명 야시카 줌 렌즈 콘트라스트"
        public let iconName = "square.split.2x1"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.05 * intensity),
                contrast: Float(1.0 + 0.25 * intensity),
                saturation: Float(1.0 + 0.15 * intensity)
            )

            // Sharp multi-coated Yashica glass feel
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6400, y: -2)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.40 * intensity), radius: 1.3)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.035 * intensity))
            return img
        }
    }

    // MARK: - 2. サイバー・トーキョー 1988 (Cyber Tokyo 1988)
    public struct KyoceraSamuraiCyber1988Filter: CameraFilter {
        public let id = "samurai-cyber"
        public let name = "Cyber Tokyo 1988"
        public let localizedName = "사이버 도쿄 1988"
        public let cameraCategory = CameraCategory.kyoceraSamurai
        public let filterDescription = "미래지향 에메랄드 그린 HUD와 하이테크 사이버펑크 고대비 톤"
        public let iconName = "cpu"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.08 * intensity),
                contrast: Float(1.0 + 0.28 * intensity),
                saturation: Float(1.0 + 0.22 * intensity)
            )

            // High-tech emerald HUD tint
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6800, y: -10)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.50 * intensity), radius: 1.1)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.03 * intensity))
            return img
        }
    }

    // MARK: - 3. バブル・トワイライト (Bubble Twilight)
    public struct KyoceraSamuraiBubbleTwilightFilter: CameraFilter {
        public let id = "samurai-tokyo"
        public let name = "Bubble Twilight"
        public let localizedName = "버블 트ワイライト"
        public let cameraCategory = CameraCategory.kyoceraSamurai
        public let filterDescription = "신주쿠 고층빌딩 매직아워의 쿨블루 섀도우와 황금빛 가로등 대비"
        public let iconName = "building.2.crop.circle"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.20 * intensity),
                saturation: Float(1.0 + 0.30 * intensity)
            )

            // Cool blue shadows & warm streetlamp golden highlights
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 7200, y: -4)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.60 * intensity), radius: 1.2)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.04 * intensity))
            return img
        }
    }

    // MARK: - 4. チタン・ハードトーン (Titanium Hard Tone)
    public struct KyoceraSamuraiTitaniumFilter: CameraFilter {
        public let id = "samurai-titanium"
        public let name = "Titanium Hard Tone"
        public let localizedName = "티타늄 하드 톤"
        public let cameraCategory = CameraCategory.kyoceraSamurai
        public let filterDescription = "다크 그래파이트 티타늄 바디의 묵직한 하드 콘트라스트와 딥 블랙"
        public let iconName = "shield.lefthalf.filled"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(-0.04 * intensity),
                contrast: Float(1.0 + 0.38 * intensity),
                saturation: Float(1.0 - 0.15 * intensity)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.65 * intensity), radius: 1.05)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.03 * intensity))
            return img
        }
    }
}
