import Foundation
import CoreImage

/// Modular filter pack for Color Studio (Personal Color Profile Camera)
public enum ColorStudioFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            SpringWarmBlossomFilter(),
            SummerCoolSkyFilter(),
            AutumnMutedSageFilter(),
            WinterDeepCrimsonFilter()
        ]
    }

    // MARK: - 1. Spring Warm Blossom (화사한 생기 봄웜)
    public struct SpringWarmBlossomFilter: CameraFilter {
        public let id = "color_studio_spring_warm"
        public let name = "Spring Warm (Blossom)"
        public let localizedName = "봄 웜톤 (블라썸)"
        public let cameraCategory = CameraCategory.colorStudio
        public let filterDescription = "화사하고 생기 넘치는 피치 코랄 톤과 맑은 피부결 보정"
        public let iconName = "sun.max.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            // Brighten slightly, soft contrast, warm vibrant saturation
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.06 * intensity),
                contrast: Float(1.0 + 0.08 * intensity),
                saturation: Float(1.0 + 0.16 * intensity)
            )

            // Warm golden-peach balance
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5400, y: 12)
            )

            // Studio soft-box skin glow
            let bloomed = FilterHelpers.applyBloom(image: img, radius: 5.0, intensity: Float(0.20 * intensity))
            return FilterHelpers.blendWithAlpha(foreground: bloomed, background: img, alpha: Float(0.4 * intensity))
        }
    }

    // MARK: - 2. Summer Cool Sky (투명하고 깨끗한 여쿨)
    public struct SummerCoolSkyFilter: CameraFilter {
        public let id = "color_studio_summer_cool"
        public let name = "Summer Cool (Sky)"
        public let localizedName = "여름 쿨톤 (스카이)"
        public let cameraCategory = CameraCategory.colorStudio
        public let filterDescription = "투명하고 하얗게 정돈된 쿨톤 피부와 청량한 파스텔 블루 조화"
        public let iconName = "cloud.sun.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.08 * intensity),
                contrast: Float(1.0 + 0.06 * intensity),
                saturation: Float(1.0 - 0.05 * intensity)
            )

            // Cool clear sky balance
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 7200, y: -6)
            )

            return img
        }
    }

    // MARK: - 3. Autumn Muted Sage (우아하고 차분한 가을뮤트)
    public struct AutumnMutedSageFilter: CameraFilter {
        public let id = "color_studio_autumn_muted"
        public let name = "Autumn Muted (Sage)"
        public let localizedName = "가을 뮤트 (세이지)"
        public let cameraCategory = CameraCategory.colorStudio
        public let filterDescription = "고급스럽고 차분한 분위기의 올리브 세이지 & 오트 베이지 조화"
        public let iconName = "leaf.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.12 * intensity),
                saturation: Float(1.0 - 0.12 * intensity)
            )

            // Muted earth tone temperature
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5000, y: -4)
            )

            return img
        }
    }

    // MARK: - 4. Winter Deep Crimson (선명하고 딥한 겨쿨)
    public struct WinterDeepCrimsonFilter: CameraFilter {
        public let id = "color_studio_winter_deep"
        public let name = "Winter Deep (Crimson)"
        public let localizedName = "겨울 딥 (크림슨)"
        public let cameraCategory = CameraCategory.colorStudio
        public let filterDescription = "강렬한 흑백 대비와 딥 버건디 와인의 모던하고 시크한 프로필 톤"
        public let iconName = "sparkle"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.03 * intensity),
                contrast: Float(1.0 + 0.28 * intensity),
                saturation: Float(1.0 + 0.22 * intensity)
            )

            // Deep cool contrast
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6800, y: 15)
            )

            return img
        }
    }
}
