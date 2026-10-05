import Foundation
import CoreImage

/// Modular filter pack for Ricoh GR Digital (28mm Street Snap Engine)
public enum RicohGRFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            RicohGRHighContrastBWFilter(),
            RicohGRPositiveFilmFilter(),
            RicohGRCrossProcessFilter(),
            RicohGRSnapColorFilter()
        ]
    }

    // MARK: - 1. GR High-Contrast B&W (GR 고대비 흑백 - 다이도 모리야마 스타일)
    public struct RicohGRHighContrastBWFilter: CameraFilter {
        public let id = "ricoh_gr_high_contrast_bw"
        public let name = "GR High-Contrast B&W"
        public let localizedName = "GR 고대비 흑백"
        public let cameraCategory = CameraCategory.ricohGR
        public let filterDescription = "모리야마 다이도 풍의 거칠고 강렬한 흑백 대비와 도회적인 그레인 텍스처"
        public let iconName = "camera.metering.spot"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            let bw = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(-0.02 * intensity),
                contrast: Float(1.0 + 0.65 * intensity),
                saturation: 0.0
            )

            var img = FilterHelpers.blendWithAlpha(
                foreground: bw,
                background: inputImage,
                alpha: Float(intensity)
            )

            // Heavy gritty urban grain
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.095 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.55 * intensity), radius: 1.2)
            return img
        }
    }

    // MARK: - 2. GR Positive Film (GR 포지티브 필름)
    public struct RicohGRPositiveFilmFilter: CameraFilter {
        public let id = "ricoh_gr_positive_film"
        public let name = "GR Positive Film"
        public let localizedName = "GR 포지티브 필름"
        public let cameraCategory = CameraCategory.ricohGR
        public let filterDescription = "리코 GR 시리즈의 상징인 깊은 발색과 농밀한 원색, 포지티브 슬라이드 필름 룩"
        public let iconName = "paintpalette.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            // High saturation, rich contrast, deep punchy shadows
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(-0.01 * intensity),
                contrast: Float(1.0 + 0.28 * intensity),
                saturation: Float(1.0 + 0.35 * intensity)
            )

            // Punchy slide film warm highlights & deep cool shadows
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5800, y: 6)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.40 * intensity), radius: 1.4)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.04 * intensity))
            return img
        }
    }

    // MARK: - 3. GR Cross Process (GR 크로스 프로세스)
    public struct RicohGRCrossProcessFilter: CameraFilter {
        public let id = "ricoh_gr_cross_process"
        public let name = "GR Cross Process"
        public let localizedName = "GR 크로스 프로세스"
        public let cameraCategory = CameraCategory.ricohGR
        public let filterDescription = "독특한 옐로우/그린 틴트와 비현실적이고 몽환적인 스트리트 스냅 색감"
        public let iconName = "wand.and.stars"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.03 * intensity),
                contrast: Float(1.0 + 0.22 * intensity),
                saturation: Float(1.0 + 0.15 * intensity)
            )

            // Shift colors towards cross-processed yellow-green cast
            let rVec = CIVector(x: 1.15, y: 0.05, z: -0.10, w: 0)
            let gVec = CIVector(x: 0.00, y: 1.20, z: 0.05, w: 0)
            let bVec = CIVector(x: -0.10, y: 0.05, z: 0.85, w: 0)
            let crossProcessed = FilterHelpers.applyColorMatrix(image: img, rVector: rVec, gVector: gVec, bVector: bVec)

            img = FilterHelpers.blendWithAlpha(foreground: crossProcessed, background: img, alpha: Float(intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.45 * intensity), radius: 1.3)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.05 * intensity))
            return img
        }
    }

    // MARK: - 4. GR Standard Snap (GR 표준 스냅)
    public struct RicohGRSnapColorFilter: CameraFilter {
        public let id = "ricoh_gr_snap_color"
        public let name = "GR Standard Snap"
        public let localizedName = "GR 표준 스냅"
        public let cameraCategory = CameraCategory.ricohGR
        public let filterDescription = "28mm 화각의 신속한 스냅샷을 위한 칼같은 선예도와 중립적인 스트리트 톤"
        public let iconName = "viewfinder.circle.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: 0.0,
                contrast: Float(1.0 + 0.12 * intensity),
                saturation: Float(1.0 + 0.04 * intensity)
            )

            // Neutral street lighting
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6400, y: 0)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.25 * intensity), radius: 1.6)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.03 * intensity))
            return img
        }
    }
}
