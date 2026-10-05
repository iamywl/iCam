import Foundation
import CoreImage

/// Modular filter pack for Standard ID & Passport Cam (Official Specification Studio)
public enum PassportIDFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            PassportNeutralFilter(),
            PassportSharpStudioFilter(),
            PassportStandardBWFilter(),
            PassportWarmToneFilter()
        ]
    }

    // MARK: - 1. Passport Neutral (5000K 표준 규격)
    public struct PassportNeutralFilter: CameraFilter {
        public let id = "passport_neutral"
        public let name = "Passport Neutral 5000K"
        public let localizedName = "외교부 표준 5000K"
        public let cameraCategory = CameraCategory.passportID
        public let filterDescription = "외교부 및 ICAO 규격을 준수하는 표준 주광색 5000K 사실적 무왜곡 발색"
        public let iconName = "person.crop.square.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            // True tone: accurate color fidelity, neutral contrast
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.05 * intensity),
                saturation: Float(1.0)
            )

            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5200, y: 0)
            )

            return img
        }
    }

    // MARK: - 2. Passport Sharp Studio (스튜디오 소프트박스)
    public struct PassportSharpStudioFilter: CameraFilter {
        public let id = "passport_sharp_studio"
        public let name = "Sharp Studio Softbox"
        public let localizedName = "스튜디오 소프트박스"
        public let cameraCategory = CameraCategory.passportID
        public let filterDescription = "소프트박스 조명 분산과 깔끔한 윤곽선 선예도"
        public let iconName = "lightbulb.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            let img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.04 * intensity),
                contrast: Float(1.0 + 0.10 * intensity),
                saturation: Float(1.0 + 0.04 * intensity)
            )

            // Clarity / Sharpen
            guard let sharpen = CIFilter(name: "CISharpenLuminance") else { return img }
            sharpen.setValue(img, forKey: kCIInputImageKey)
            sharpen.setValue(Float(0.4 * intensity), forKey: kCIInputSharpnessKey)
            return sharpen.outputImage?.cropped(to: img.extent) ?? img
        }
    }

    // MARK: - 3. Passport Standard B&W (공식 흑백 증명)
    public struct PassportStandardBWFilter: CameraFilter {
        public let id = "passport_bw"
        public let name = "Official Monochrome"
        public let localizedName = "공식 흑백 증명"
        public let cameraCategory = CameraCategory.passportID
        public let filterDescription = "명암 구분이 뚜렷한 공식 문서 규격 고선명 흑백 모드"
        public let iconName = "doc.text.image.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            let img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: 0.0,
                contrast: Float(1.0 + 0.20 * intensity),
                saturation: 0.0
            )
            return img
        }
    }

    // MARK: - 4. Passport Warm Tone (소프트 웜 비자)
    public struct PassportWarmToneFilter: CameraFilter {
        public let id = "passport_warm"
        public let name = "Soft Warm ID"
        public let localizedName = "소프트 웜 ID"
        public let cameraCategory = CameraCategory.passportID
        public let filterDescription = "온화하고 편안한 인상의 소프트 웜톤 증명사진"
        public let iconName = "person.fill.viewfinder"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.03 * intensity),
                contrast: Float(1.0 + 0.06 * intensity),
                saturation: Float(1.0 + 0.08 * intensity)
            )

            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5500, y: 5)
            )

            return img
        }
    }
}
