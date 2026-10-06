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

    // MARK: - 1. 写ルンです 1986 Original (후지 1986 오리지널)
    public struct FujiQuickSnap1986Filter: CameraFilter {
        public let id = "quicksnap-86"
        public let name = "QuickSnap 1986 Original"
        public let localizedName = "写ルンです 1986 오리지널"
        public let cameraCategory = CameraCategory.fujiQuickSnap
        public let filterDescription = "후지 Superia 400 특유의 청록색 암부 틴트와 단렌즈 플라스틱 광학의 따뜻한 소프트함"
        public let iconName = "camera.viewfinder"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.08 * intensity),
                contrast: Float(1.0 + 0.12 * intensity),
                saturation: Float(1.0 + 0.24 * intensity)
            )

            // Fuji signature emerald green shadow & amber highlight shift
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6200, y: -6)
            )

            // Plastic lens edge softness & vignette
            let bloom = FilterHelpers.applyBloom(image: img, radius: 5.0, intensity: Float(0.22 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.35 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.55 * intensity), radius: 1.15)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.045 * intensity))
            return img
        }
    }

    // MARK: - 2. 深夜の直焚きフラッシュ (Night Direct Flash)
    public struct FujiQuickSnapFlashFilter: CameraFilter {
        public let id = "quicksnap-flash"
        public let name = "Night Direct Flash"
        public let localizedName = "深夜の直焚き 플래시"
        public let cameraCategory = CameraCategory.fujiQuickSnap
        public let filterDescription = "1980년대 도쿄 심야 거리의 거친 플라스틱 직광 플래시와 강렬한 비네팅"
        public let iconName = "bolt.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.18 * intensity),
                contrast: Float(1.0 + 0.32 * intensity),
                saturation: Float(1.0 + 0.15 * intensity)
            )

            // Flash hotspot falloff
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.85 * intensity), radius: 0.95)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.055 * intensity))
            return img
        }
    }

    // MARK: - 3. ノスタルジック・メモリー (Nostalgic Memory)
    public struct FujiQuickSnapNostalgiaFilter: CameraFilter {
        public let id = "quicksnap-nostalgia"
        public let name = "Nostalgic Memory"
        public let localizedName = "노스탤직 메모리"
        public let cameraCategory = CameraCategory.fujiQuickSnap
        public let filterDescription = "오래된 앨범 속 바랜 감열 인화지와 따스한 쇼와-헤이세이 레트로 골드 톤"
        public let iconName = "sun.dust.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.04 * intensity),
                contrast: Float(1.0 - 0.04 * intensity),
                saturation: Float(1.0 + 0.10 * intensity)
            )

            // Warm golden amber wash
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5200, y: 10)
            )

            let bloom = FilterHelpers.applyBloom(image: img, radius: 6.0, intensity: Float(0.28 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.38 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.48 * intensity), radius: 1.3)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.05 * intensity))
            return img
        }
    }

    // MARK: - 4. 六本木ネオン 1988 (Roppongi Neon 1988)
    public struct FujiQuickSnapNeonFilter: CameraFilter {
        public let id = "quicksnap-neon"
        public let name = "Roppongi Neon 1988"
        public let localizedName = "六本木 네온 1988"
        public let cameraCategory = CameraCategory.fujiQuickSnap
        public let filterDescription = "1988년 버블 절정기 롯폰기 나이트라이프의 사이언과 마젠타 네온 발색"
        public let iconName = "sparkles"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.10 * intensity),
                contrast: Float(1.0 + 0.22 * intensity),
                saturation: Float(1.0 + 0.40 * intensity)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.60 * intensity), radius: 1.1)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.04 * intensity))
            return img
        }
    }
}
