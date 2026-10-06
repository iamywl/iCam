import Foundation
import CoreImage

/// Modular filter pack for Hasselblad 500C/M (Carl Zeiss Planar 80mm F2.8 & 6x6 Medium Format)
public enum HasselbladFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            HasselbladPlanarFilter(),
            HasselbladTriXBWSilverFilter(),
            HasselbladAstiaSkinFilter(),
            HasselbladChromiumFilter()
        ]
    }

    // MARK: - 1. Planar 80mm Soft-Pop (중형 플라나 인물 룩)
    public struct HasselbladPlanarFilter: CameraFilter {
        public let id = "hasselblad_planar_80mm"
        public let name = "Planar 80mm Soft-Pop"
        public let localizedName = "플라나 80mm 소프트 팝"
        public let cameraCategory = CameraCategory.hasselblad
        public let filterDescription = "중형 칼자이스 플라나 80mm F2.8 특유의 얕은 피사계 심도와 우아한 인물 묘사"
        public let iconName = "camera.macro"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.16 * intensity),
                saturation: Float(1.0 + 0.10 * intensity)
            )

            // Natural Carl Zeiss Medium Format daylight tone
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6100, y: 2)
            )

            // Gentle highlight bloom simulating soft Zeiss Planar falloff
            let bloom = FilterHelpers.applyBloom(image: img, radius: 5.0, intensity: Float(0.20 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.25 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.30 * intensity), radius: 1.6)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.03 * intensity))
            return img
        }
    }

    // MARK: - 2. Tri-X 400 Medium Format (중형 은염 흑백)
    public struct HasselbladTriXBWSilverFilter: CameraFilter {
        public let id = "hasselblad_trix_400_mf"
        public let name = "Tri-X 400 Medium Format"
        public let localizedName = "트라이X 400 중형 흑백"
        public let cameraCategory = CameraCategory.hasselblad
        public let filterDescription = "120 롤필름 특유의 고운 그레인과 묵직하게 가라앉는 깊은 섀도우 은염 계조"
        public let iconName = "circle.lefthalf.filled"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            let bw = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.0 * intensity),
                contrast: Float(1.0 + 0.35 * intensity),
                saturation: 0.0
            )

            let vignetted = FilterHelpers.applyVignette(image: bw, intensity: Float(0.40 * intensity), radius: 1.4)
            let grained = FilterHelpers.applyGrain(image: vignetted, amount: Float(0.04 * intensity))
            return FilterHelpers.blendWithAlpha(foreground: grained, background: inputImage, alpha: Float(intensity))
        }
    }

    // MARK: - 3. Astia 100F Soft Slide (아스티아 100F 소프트 슬라이드)
    public struct HasselbladAstiaSkinFilter: CameraFilter {
        public let id = "hasselblad_astia_100f"
        public let name = "Astia 100F Soft Slide"
        public let localizedName = "아스티아 100F 소프트 슬라이드"
        public let cameraCategory = CameraCategory.hasselblad
        public let filterDescription = "스튜디오 인물 전용 포트레이트 리버설 슬라이드 필름의 부드러운 스킨 톤"
        public let iconName = "sparkles"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.03 * intensity),
                contrast: Float(1.0 + 0.12 * intensity),
                saturation: Float(1.0 + 0.14 * intensity)
            )

            // Warm pastel portrait slide balance
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5900, y: 4)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.25 * intensity), radius: 1.8)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.025 * intensity))
            return img
        }
    }

    // MARK: - 4. Chromium Silver (크로미움 실버)
    public struct HasselbladChromiumFilter: CameraFilter {
        public let id = "hasselblad_chromium_silver"
        public let name = "Chromium Silver"
        public let localizedName = "크로미움 실버"
        public let cameraCategory = CameraCategory.hasselblad
        public let filterDescription = "스웨덴 명품 핫셀블라드 바디의 정밀한 금속성 질감과 투명하고 차가운 톤"
        public let iconName = "square.stack.3d.down.right"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.01 * intensity),
                contrast: Float(1.0 + 0.24 * intensity),
                saturation: Float(1.0 - 0.15 * intensity)
            )

            // Crisp Nordic cool tint
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 7200, y: -2)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.45 * intensity), radius: 1.3)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.035 * intensity))
            return img
        }
    }
}
