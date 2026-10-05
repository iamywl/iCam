import Foundation
import CoreImage

/// Modular filter pack for Authentic Old Analog Film Cameras (CineStill, Portra, Superia, Light Leaks)
public enum OldFilmFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            OldFilmCineStill800TFilter(),
            OldFilmPortra400WarmFilter(),
            OldFilmSuperiaGreenFilter(),
            OldFilmLightLeak1984Filter()
        ]
    }

    // MARK: - 1. CineStill 800T Red Halation (시네스틸 800T 할레이션)
    public struct OldFilmCineStill800TFilter: CameraFilter {
        public let id = "old_film_cinestill_800t"
        public let name = "CineStill 800T Red Halation"
        public let localizedName = "시네스틸 800T 할레이션"
        public let cameraCategory = CameraCategory.oldFilm
        public let filterDescription = "텅스텐 밸런스의 차가운 밤거리와 고광택 하이라이트에 번지는 특유의 붉은 할레이션"
        public let iconName = "flame.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            // Cool tungsten blue-cyan night base
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.01 * intensity),
                contrast: Float(1.0 + 0.22 * intensity),
                saturation: Float(1.0 + 0.15 * intensity)
            )

            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 7500, y: -10)
            )

            // Red warm halation bloom
            let bloom = FilterHelpers.applyBloom(image: img, radius: 8.0, intensity: Float(0.40 * intensity))
            // Tint bloom reddish
            let rVec = CIVector(x: 1.30, y: 0.10, z: 0.00, w: 0)
            let gVec = CIVector(x: 0.00, y: 0.70, z: 0.00, w: 0)
            let bVec = CIVector(x: 0.00, y: 0.00, z: 0.60, w: 0)
            let redBloom = FilterHelpers.applyColorMatrix(image: bloom, rVector: rVec, gVector: gVec, bVector: bVec)

            img = FilterHelpers.blendWithAlpha(foreground: redBloom, background: img, alpha: Float(0.35 * intensity))
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.065 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.40 * intensity), radius: 1.35)
            return img
        }
    }

    // MARK: - 2. Kodak Portra 400 Warm (코닥 포트라 400 웜)
    public struct OldFilmPortra400WarmFilter: CameraFilter {
        public let id = "old_film_portra_400_warm"
        public let name = "Kodak Portra 400 Warm"
        public let localizedName = "코닥 포트라 400 웜"
        public let cameraCategory = CameraCategory.oldFilm
        public let filterDescription = "전 세계 포토그래퍼들이 사랑하는 부드러운 스킨 톤과 자연스러운 따뜻한 필름 질감"
        public let iconName = "film"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.03 * intensity),
                contrast: Float(1.0 + 0.10 * intensity),
                saturation: Float(1.0 + 0.12 * intensity)
            )

            // Gentle Portra warmth
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5500, y: 8)
            )

            let bloom = FilterHelpers.applyBloom(image: img, radius: 5.0, intensity: Float(0.20 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.25 * intensity))
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.045 * intensity))
            return img
        }
    }

    // MARK: - 3. Fuji Superia Green Tint (후지 수페리아 400)
    public struct OldFilmSuperiaGreenFilter: CameraFilter {
        public let id = "old_film_superia_green"
        public let name = "Fuji Superia Green Tint"
        public let localizedName = "후지 수페리아 400"
        public let cameraCategory = CameraCategory.oldFilm
        public let filterDescription = "특유의 에메랄드 그린/마젠타 섀도우 톤과 청량하고 서정적인 후지 필름 감성"
        public let iconName = "leaf.arrow.triangle.circlepath"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.18 * intensity),
                saturation: Float(1.0 + 0.08 * intensity)
            )

            // Fuji cool green tone
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6700, y: -8)
            )

            img = FilterHelpers.applyGrain(image: img, amount: Float(0.055 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.35 * intensity), radius: 1.4)
            return img
        }
    }

    // MARK: - 4. Light Leak 1984 (빛바랜 라이트 리크 1984)
    public struct OldFilmLightLeak1984Filter: CameraFilter {
        public let id = "old_film_light_leak_1984"
        public let name = "Light Leak 1984"
        public let localizedName = "빛바랜 라이트 리크 1984"
        public let cameraCategory = CameraCategory.oldFilm
        public let filterDescription = "오래된 필름 카메라의 챔버 틈새로 스며든 붉은 오렌지빛 빛샘과 빈티지한 아날로그 향수"
        public let iconName = "sun.and.horizon.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            // Lift blacks slightly and add warm haze
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.05 * intensity),
                contrast: Float(1.0 - 0.05 * intensity),
                saturation: Float(1.0 + 0.10 * intensity)
            )

            // Warm leak gradient in upper corner
            let extent = inputImage.extent
            let center = CIVector(x: extent.minX, y: extent.maxY)
            if let radial = CIFilter(name: "CIRadialGradient") {
                radial.setValue(center, forKey: "inputCenter")
                radial.setValue(0.0, forKey: "inputRadius0")
                radial.setValue(max(extent.width, extent.height) * 0.7, forKey: "inputRadius1")
                radial.setValue(CIColor(red: 1.0, green: 0.45, blue: 0.1, alpha: 0.5), forKey: "inputColor0")
                radial.setValue(CIColor(red: 1.0, green: 0.2, blue: 0.1, alpha: 0.0), forKey: "inputColor1")

                if let leak = radial.outputImage?.cropped(to: extent),
                   let blend = CIFilter(name: "CIScreenBlendMode") {
                    blend.setValue(leak, forKey: kCIInputImageKey)
                    blend.setValue(img, forKey: kCIInputBackgroundImageKey)
                    if let output = blend.outputImage?.cropped(to: extent) {
                        img = FilterHelpers.blendWithAlpha(foreground: output, background: img, alpha: Float(intensity))
                    }
                }
            }

            img = FilterHelpers.applyGrain(image: img, amount: Float(0.075 * intensity))
            return img
        }
    }
}
