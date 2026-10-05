import Foundation
import CoreImage

/// Modular filter pack for Canon IXY Digital 50 (Y2K CCD Warm)
public enum CanonIXYFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            PeachGlowFilter(),
            FlashPopFilter(),
            LoFiPastelFilter(),
            NightNoiseFilter()
        ]
    }

    // MARK: - 1. Peach Glow (Y2K 얼짱 스킨)
    public struct PeachGlowFilter: CameraFilter {
        public let id = "canon_ixy_peach_glow"
        public let name = "Peach Glow"
        public let localizedName = "피치 글로우"
        public let cameraCategory = CameraCategory.canonIXY
        public let filterDescription = "2000년대 얼짱 디카 특유의 뽀샤시하고 맑은 피부 톤과 복숭아빛 웜 블러시"
        public let iconName = "sparkles"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            // 1. Color controls: Slight brightness boost, gentle contrast, warm saturation
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.04 * intensity),
                contrast: Float(1.0 + 0.08 * intensity),
                saturation: Float(1.0 + 0.12 * intensity)
            )

            // 2. White balance / Warm peach temperature: shift to 5200K
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5200 + (1.0 - intensity) * 1300, y: 15 * intensity)
            )

            // 3. Highlight bloom for peach softness
            let bloomed = FilterHelpers.applyBloom(image: img, radius: Float(8.0 * intensity), intensity: Float(0.35 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloomed, background: img, alpha: Float(0.6 * intensity))

            // 4. Subtle center vignette
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.3 * intensity), radius: 1.4)

            return img
        }
    }

    // MARK: - 2. Flash Pop (직광 플래시)
    public struct FlashPopFilter: CameraFilter {
        public let id = "canon_ixy_flash_pop"
        public let name = "Flash Pop"
        public let localizedName = "플래시 팝"
        public let cameraCategory = CameraCategory.canonIXY
        public let filterDescription = "디카 직광 플래시 스냅: 쨍한 중앙 대비와 주변부 섀도우 감락"
        public let iconName = "bolt.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.06 * intensity),
                contrast: Float(1.0 + 0.22 * intensity),
                saturation: Float(1.0 + 0.15 * intensity)
            )

            // Strong flash vignette
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.75 * intensity), radius: 0.95)

            // Slight highlight clip
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.03 * intensity))
            return img
        }
    }

    // MARK: - 3. Lo-Fi Pastel (싸이월드 파스텔)
    public struct LoFiPastelFilter: CameraFilter {
        public let id = "canon_ixy_lofi_pastel"
        public let name = "Lo-Fi Pastel"
        public let localizedName = "로우파이 파스텔"
        public let cameraCategory = CameraCategory.canonIXY
        public let filterDescription = "채도가 살짝 빠진 몽환적인 2000년대 감성 파스텔 톤"
        public let iconName = "heart.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.08 * intensity),
                contrast: Float(1.0 - 0.12 * intensity),
                saturation: Float(1.0 - 0.25 * intensity)
            )

            // Lift shadows with a slight cyan/pastel bias
            img = FilterHelpers.applyColorMatrix(
                image: img,
                rVector: CIVector(x: 1.0, y: 0.05, z: 0.0, w: 0),
                gVector: CIVector(x: 0.0, y: 1.0, z: 0.05, w: 0),
                bVector: CIVector(x: 0.05, y: 0.0, z: 1.05, w: 0),
                biasVector: CIVector(x: 0.04 * intensity, y: 0.04 * intensity, z: 0.06 * intensity, w: 0)
            )

            return img
        }
    }

    // MARK: - 4. Night Noise (ISO 1600 컬러 노이즈)
    public struct NightNoiseFilter: CameraFilter {
        public let id = "canon_ixy_night_noise"
        public let name = "Night Noise"
        public let localizedName = "나이트 노이즈"
        public let cameraCategory = CameraCategory.canonIXY
        public let filterDescription = "밤거리 감성의 고감도 ISO 컬러 노이즈와 텅스텐 가로등 앰버 톤"
        public let iconName = "moon.stars.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(-0.04 * intensity),
                contrast: Float(1.0 + 0.18 * intensity),
                saturation: Float(1.0 + 0.08 * intensity)
            )

            // Warm amber street tone
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 4200, y: 0)
            )

            // Heavy CCD sensor noise
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.09 * intensity))
            return img
        }
    }
}
