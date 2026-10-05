import Foundation
import CoreImage

/// Modular filter pack for Olympus μ [mju:] II (Stylus Epic 35mm F2.8)
public enum OlympusMjuFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            OlympusMjuStandardFilter(),
            OlympusMjuFlashFilter(),
            OlympusMjuGold200Filter(),
            OlympusMjuTokyoStreetFilter()
        ]
    }

    // MARK: - 1. Olympus μ Standard (뮤 표준 컬러)
    public struct OlympusMjuStandardFilter: CameraFilter {
        public let id = "olympus_mju_standard"
        public let name = "Olympus μ Standard"
        public let localizedName = "μ 표준 스냅"
        public let cameraCategory = CameraCategory.olympusMju
        public let filterDescription = "35mm F2.8 단렌즈의 선명한 중심부 묘사와 자연스러운 일상 스냅 톤"
        public let iconName = "camera.aperture"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.10 * intensity),
                saturation: Float(1.0 + 0.08 * intensity)
            )

            // Warm natural daylight balance
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5900, y: 4)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.40 * intensity), radius: 1.4)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.045 * intensity))
            return img
        }
    }

    // MARK: - 2. Olympus μ Direct Flash (뮤 직광 플래시)
    public struct OlympusMjuFlashFilter: CameraFilter {
        public let id = "olympus_mju_flash"
        public let name = "μ Direct Flash"
        public let localizedName = "뮤 직광 플래시"
        public let cameraCategory = CameraCategory.olympusMju
        public let filterDescription = "어둠 속에서 피사체를 강렬하게 비추는 90년대 빈티지 컴팩트 직광 플래시 룩"
        public let iconName = "bolt.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.06 * intensity),
                contrast: Float(1.0 + 0.26 * intensity),
                saturation: Float(1.0 + 0.12 * intensity)
            )

            // Punchy flash highlight glow
            let bloom = FilterHelpers.applyBloom(image: img, radius: 4.0, intensity: Float(0.25 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.35 * intensity))

            // Deep vignette falloff imitating small built-in flash drop-off
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.85 * intensity), radius: 1.1)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.05 * intensity))
            return img
        }
    }

    // MARK: - 3. Olympus μ Gold 200 (뮤 골드 200)
    public struct OlympusMjuGold200Filter: CameraFilter {
        public let id = "olympus_mju_gold_200"
        public let name = "μ Gold 200 Warm"
        public let localizedName = "뮤 골드 200"
        public let cameraCategory = CameraCategory.olympusMju
        public let filterDescription = "황금빛 햇살과 따스한 감성을 머금은 아날로그 컬러 네거티브 필름 감성"
        public let iconName = "sun.dust.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.03 * intensity),
                contrast: Float(1.0 + 0.12 * intensity),
                saturation: Float(1.0 + 0.20 * intensity)
            )

            // Golden amber temperature
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5100, y: 12)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.50 * intensity), radius: 1.3)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.065 * intensity))
            return img
        }
    }

    // MARK: - 4. Olympus μ Tokyo Street (뮤 도쿄 스트리트)
    public struct OlympusMjuTokyoStreetFilter: CameraFilter {
        public let id = "olympus_mju_tokyo_street"
        public let name = "μ Tokyo Street"
        public let localizedName = "뮤 도쿄 스트리트"
        public let cameraCategory = CameraCategory.olympusMju
        public let filterDescription = "차분하고 차가운 아스팔트와 시네마틱한 일본 감성 빈티지 스냅 톤"
        public let iconName = "building.2.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.01 * intensity),
                contrast: Float(1.0 + 0.16 * intensity),
                saturation: Float(1.0 - 0.14 * intensity)
            )

            // Cool urban slate tint
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 7100, y: -8)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.45 * intensity), radius: 1.35)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.055 * intensity))
            return img
        }
    }
}
