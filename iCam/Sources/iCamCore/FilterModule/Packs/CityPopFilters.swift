import Foundation
import CoreImage

/// Modular filter pack for 80s Japanese City Pop & Cassette Aesthetic
public enum CityPopFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            CityPopPacificSunsetFilter(),
            CityPopNeonShinjukuFilter(),
            CityPopPlasticLoveFilter(),
            CityPopTokyo1986Filter()
        ]
    }

    // MARK: - 1. Pacific Sunset (퍼시픽 선셋 1986)
    public struct CityPopPacificSunsetFilter: CameraFilter {
        public let id = "city_pop_pacific_sunset"
        public let name = "Pacific Sunset"
        public let localizedName = "퍼시픽 선셋 1986"
        public let cameraCategory = CameraCategory.cityPop80s
        public let filterDescription = "80년대 시티팝 앨범 자켓의 황혼 마젠타-코발트 석양과 따스한 감성"
        public let iconName = "sunset.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.04 * intensity),
                contrast: Float(1.0 + 0.16 * intensity),
                saturation: Float(1.0 + 0.28 * intensity)
            )

            // Sunset magenta and golden glow
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 4800, y: 22)
            )

            let bloom = FilterHelpers.applyBloom(image: img, radius: 9.0, intensity: Float(0.35 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.35 * intensity))
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.05 * intensity))
            return img
        }
    }

    // MARK: - 2. Neon Shinjuku (네온 신주쿠 나이트)
    public struct CityPopNeonShinjukuFilter: CameraFilter {
        public let id = "city_pop_neon_shinjuku"
        public let name = "Neon Shinjuku"
        public let localizedName = "네온 신주쿠 나이트"
        public let cameraCategory = CameraCategory.cityPop80s
        public let filterDescription = "80년대 신주쿠의 찬란한 네온사인과 일렉트로닉 핑크/사이언 대비"
        public let iconName = "sparkles.tv.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.25 * intensity),
                saturation: Float(1.0 + 0.35 * intensity)
            )

            // Neon matrix shift: boost cyan in shadows, magenta in highlights
            let rVec = CIVector(x: 1.15, y: -0.05, z: 0.05, w: 0)
            let gVec = CIVector(x: -0.05, y: 1.05, z: 0.10, w: 0)
            let bVec = CIVector(x: 0.10, y: -0.05, z: 1.20, w: 0)
            let matrixImg = FilterHelpers.applyColorMatrix(image: img, rVector: rVec, gVector: gVec, bVector: bVec)

            img = FilterHelpers.blendWithAlpha(foreground: matrixImg, background: img, alpha: Float(intensity))
            let bloom = FilterHelpers.applyBloom(image: img, radius: 6.0, intensity: Float(0.40 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.30 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.50 * intensity), radius: 1.3)
            return img
        }
    }

    // MARK: - 3. Plastic Love Cassette (플라스틱 러브 카세트)
    public struct CityPopPlasticLoveFilter: CameraFilter {
        public let id = "city_pop_plastic_love"
        public let name = "Plastic Love Cassette"
        public let localizedName = "플라스틱 러브 카세트"
        public let cameraCategory = CameraCategory.cityPop80s
        public let filterDescription = "타케우치 마리야 감성의 아날로그 카세트 테이프 질감과 멜랑콜리한 레트로 파스텔 톤"
        public let iconName = "music.note"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.05 * intensity),
                contrast: Float(1.0 + 0.06 * intensity),
                saturation: Float(1.0 + 0.10 * intensity)
            )

            // Nostalgic pastel tone
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5800, y: 14)
            )

            let bloom = FilterHelpers.applyBloom(image: img, radius: 7.0, intensity: Float(0.25 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.30 * intensity))
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.065 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.35 * intensity), radius: 1.45)
            return img
        }
    }

    // MARK: - 4. Tokyo 1986 (도쿄 1986 아날로그)
    public struct CityPopTokyo1986Filter: CameraFilter {
        public let id = "city_pop_tokyo_1986"
        public let name = "Tokyo 1986"
        public let localizedName = "도쿄 1986 아날로그"
        public let cameraCategory = CameraCategory.cityPop80s
        public let filterDescription = "호황기 1986년 도쿄의 화려함과 버블 경제 시대의 클래식 필름 톤"
        public let iconName = "building.columns.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.15 * intensity),
                saturation: Float(1.0 + 0.20 * intensity)
            )

            // Warm golden daylight
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5400, y: 6)
            )

            img = FilterHelpers.applyGrain(image: img, amount: Float(0.045 * intensity))
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.30 * intensity), radius: 1.5)
            return img
        }
    }
}
