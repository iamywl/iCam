import Foundation
import CoreImage

/// Modular filter pack for Fuji QuickSnap (写ルンです, 1986 Japanese Bubble Economy Disposable Camera)
public enum FujiQuickSnapFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            FujiQuickSnap1986Filter(),
            FujiQuickSnapFlashFilter(),
            FujiQuickSnapNostalgiaFilter(),
            FujiQuickSnapNeonFilter()
        ]
    }

    // MARK: - 1. 写ルンです 1986 Daylight (우츠룬데스 1986 데이라이트)
    public struct FujiQuickSnap1986Filter: CameraFilter {
        public let id = "quicksnap-86"
        public let name = "QuickSnap 1986 Daylight"
        public let localizedName = "写ルンです 1986 데이라이트"
        public let cameraCategory = CameraCategory.fujiQuickSnap
        public let filterDescription = "1986년 원작 우츠룬데스의 청량한 에메랄드 풀잎과 맑은 피부톤"
        public let iconName = "camera.viewfinder"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.10 * intensity),
                contrast: Float(1.0 + 0.12 * intensity),
                saturation: Float(1.0 + 0.28 * intensity)
            )

            // Fuji signature emerald green shadow & crisp clean highlights
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6300, y: -4)
            )

            // Plastic lens edge softness & vignette
            let bloom = FilterHelpers.applyBloom(image: img, radius: 5.0, intensity: Float(0.20 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.30 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.45 * intensity), radius: 1.2)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.04 * intensity))
            return img
        }
    }

    // MARK: - 2. Sun Flash Pop (한낮의 직광 플래시)
    public struct FujiQuickSnapFlashFilter: CameraFilter {
        public let id = "quicksnap-flash"
        public let name = "Sun Flash Pop"
        public let localizedName = "한낮의 직광 플래시"
        public let cameraCategory = CameraCategory.fujiQuickSnap
        public let filterDescription = "버블시대 거리와 카페에서 터뜨린 또렷하고 화사한 고광량 직광 플래시"
        public let iconName = "bolt.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.16 * intensity),
                contrast: Float(1.0 + 0.22 * intensity),
                saturation: Float(1.0 + 0.18 * intensity)
            )

            // Flash hotspot falloff
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.65 * intensity), radius: 1.05)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.045 * intensity))
            return img
        }
    }

    // MARK: - 3. Bubble Resort '87 (버블 리조트 '87)
    public struct FujiQuickSnapNostalgiaFilter: CameraFilter {
        public let id = "quicksnap-nostalgia"
        public let name = "Bubble Resort '87"
        public let localizedName = "버블 리조트 '87"
        public let cameraCategory = CameraCategory.fujiQuickSnap
        public let filterDescription = "80년대 버블 부유층의 여름 별장 휴양지 따사로운 햇살과 비비드 톤"
        public let iconName = "sun.max.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.08 * intensity),
                contrast: Float(1.0 + 0.14 * intensity),
                saturation: Float(1.0 + 0.26 * intensity)
            )

            // Warm golden amber wash
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5600, y: 8)
            )

            let bloom = FilterHelpers.applyBloom(image: img, radius: 6.0, intensity: Float(0.24 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.32 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.42 * intensity), radius: 1.3)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.045 * intensity))
            return img
        }
    }

    // MARK: - 4. Showa Memory '86 (쇼와 메모리 '86)
    public struct FujiQuickSnapNeonFilter: CameraFilter {
        public let id = "quicksnap-neon"
        public let name = "Showa Memory '86"
        public let localizedName = "쇼와 메모리 '86"
        public let cameraCategory = CameraCategory.fujiQuickSnap
        public let filterDescription = "선명한 오렌지 쿼츠데이트와 따스한 쇼와 61년 아날로그 인화지 감성"
        public let iconName = "sparkles"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.08 * intensity),
                contrast: Float(1.0 + 0.10 * intensity),
                saturation: Float(1.0 + 0.20 * intensity)
            )

            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5800, y: 6)
            )
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.48 * intensity), radius: 1.2)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.04 * intensity))
            return img
        }
    }
}
