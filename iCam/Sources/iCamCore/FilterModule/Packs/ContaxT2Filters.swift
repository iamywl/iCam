import Foundation
import CoreImage

/// Modular filter pack for Contax T2 (Carl Zeiss Sonnar 38mm F2.8 T*)
public enum ContaxT2FilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            ContaxT2ZeissColorFilter(),
            ContaxT2TitaniumFilter(),
            ContaxT2PortraSoftFilter(),
            ContaxT2MonochromeFilter()
        ]
    }

    // MARK: - 1. Zeiss Sonnar T* Color (자이스 조나 T*)
    public struct ContaxT2ZeissColorFilter: CameraFilter {
        public let id = "contax_t2_zeiss_color"
        public let name = "Zeiss Sonnar T*"
        public let localizedName = "자이스 조나 T*"
        public let cameraCategory = CameraCategory.contaxT2
        public let filterDescription = "칼 자이스 특유의 뛰어난 입체감과 깊은 암부 묘사, 선명한 콘트라스트"
        public let iconName = "circle.circle.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            // High micro-contrast and saturated primary colors
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.01 * intensity),
                contrast: Float(1.0 + 0.22 * intensity),
                saturation: Float(1.0 + 0.12 * intensity)
            )

            // Zeiss signature neutral-cool crispness with deep cyan/magenta balance
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6200, y: 3)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.35 * intensity), radius: 1.5)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.035 * intensity))
            return img
        }
    }

    // MARK: - 2. Contax T2 Titanium (티타늄 실버 톤)
    public struct ContaxT2TitaniumFilter: CameraFilter {
        public let id = "contax_t2_titanium"
        public let name = "T2 Titanium Tone"
        public let localizedName = "티타늄 실버 톤"
        public let cameraCategory = CameraCategory.contaxT2
        public let filterDescription = "고급 티타늄 바디의 차분함과 세련된 은빛 하이라이트 그라데이션"
        public let iconName = "shield.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.03 * intensity),
                contrast: Float(1.0 + 0.14 * intensity),
                saturation: Float(1.0 - 0.08 * intensity)
            )

            // Silvery cool highlight balance
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6700, y: -4)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.30 * intensity), radius: 1.6)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.03 * intensity))
            return img
        }
    }

    // MARK: - 3. Contax T2 Portra Soft (T2 포트라 400)
    public struct ContaxT2PortraSoftFilter: CameraFilter {
        public let id = "contax_t2_portra_soft"
        public let name = "T2 Portra 400 Soft"
        public let localizedName = "T2 포트라 400"
        public let cameraCategory = CameraCategory.contaxT2
        public let filterDescription = "자이스 렌즈와 포트라 필름의 조화: 우아하고 부드러운 인물 피부 톤과 파스텔 감성"
        public let iconName = "person.crop.rectangle.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.04 * intensity),
                contrast: Float(1.0 + 0.08 * intensity),
                saturation: Float(1.0 + 0.06 * intensity)
            )

            // Creamy golden skin tone
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5600, y: 8)
            )

            // Subtle highlight halation roll-off
            let bloom = FilterHelpers.applyBloom(image: img, radius: 6.0, intensity: Float(0.18 * intensity))
            img = FilterHelpers.blendWithAlpha(foreground: bloom, background: img, alpha: Float(0.30 * intensity))

            img = FilterHelpers.applyGrain(image: img, amount: Float(0.04 * intensity))
            return img
        }
    }

    // MARK: - 4. Contax T2 Monochrome (자이스 딥 흑백)
    public struct ContaxT2MonochromeFilter: CameraFilter {
        public let id = "contax_t2_monochrome"
        public let name = "Zeiss Deep B&W"
        public let localizedName = "자이스 딥 흑백"
        public let cameraCategory = CameraCategory.contaxT2
        public let filterDescription = "풍부한 계조와 묵직한 블랙이 돋보이는 칼 자이스 명품 흑백 스냅"
        public let iconName = "circle.lefthalf.filled"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            let gray = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.01 * intensity),
                contrast: Float(1.0 + 0.35 * intensity),
                saturation: 0.0
            )

            var img = FilterHelpers.blendWithAlpha(
                foreground: gray,
                background: inputImage,
                alpha: Float(intensity)
            )

            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.40 * intensity), radius: 1.4)
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.05 * intensity))
            return img
        }
    }
}
