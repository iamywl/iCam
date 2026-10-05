import Foundation
import CoreImage

/// Modular filter pack for Sony Cyber-shot DSC-P10 (Y2K Cyber Cool CCD)
public enum SonyCybershotFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            CCDCoolBlueFilter(),
            CyberMagentaFilter(),
            FlashSharpFilter(),
            MatrixGreenFilter()
        ]
    }

    // MARK: - 1. CCD Cool Blue (아이코닉 메모리스틱 쿨블루)
    public struct CCDCoolBlueFilter: CameraFilter {
        public let id = "cybershot_ccd_cool_blue"
        public let name = "CCD Cool Blue"
        public let localizedName = "CCD 쿨 블루"
        public let cameraCategory = CameraCategory.sonyCybershot
        public let filterDescription = "차가운 블루 틴트 & 투명하고 하얀 쿨톤 피부, 차가운 섀도우"
        public let iconName = "snowflake"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.04 * intensity),
                contrast: Float(1.0 + 0.18 * intensity),
                saturation: Float(1.0 + 0.05 * intensity)
            )

            // Cool temperature: shift to 7800K
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 7800, y: -8)
            )

            // Cool blue shadows via color matrix
            img = FilterHelpers.applyColorMatrix(
                image: img,
                rVector: CIVector(x: 0.95, y: 0.0, z: 0.0, w: 0),
                gVector: CIVector(x: 0.0, y: 1.0, z: 0.0, w: 0),
                bVector: CIVector(x: 0.05, y: 0.05, z: 1.15, w: 0),
                biasVector: CIVector(x: -0.02, y: 0.0, z: 0.05 * intensity, w: 0)
            )

            return img
        }
    }

    // MARK: - 2. Cyber Magenta (테크노 마젠타)
    public struct CyberMagentaFilter: CameraFilter {
        public let id = "cybershot_cyber_magenta"
        public let name = "Cyber Magenta"
        public let localizedName = "사이버 마젠타"
        public let cameraCategory = CameraCategory.sonyCybershot
        public let filterDescription = "2000년대 테크노 마젠타 하이라이트 & 네온 글로우"
        public let iconName = "flame.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.24 * intensity),
                saturation: Float(1.0 + 0.30 * intensity)
            )

            // Magenta tint shift
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 6000, y: 45 * intensity)
            )

            let bloomed = FilterHelpers.applyBloom(image: img, radius: 12.0, intensity: Float(0.4 * intensity))
            return FilterHelpers.blendWithAlpha(foreground: bloomed, background: img, alpha: Float(0.5 * intensity))
        }
    }

    // MARK: - 3. Flash Sharp (선명 직광 플래시)
    public struct FlashSharpFilter: CameraFilter {
        public let id = "cybershot_flash_sharp"
        public let name = "Flash Sharp"
        public let localizedName = "플래시 샤프"
        public let cameraCategory = CameraCategory.sonyCybershot
        public let filterDescription = "어둠 속에서 피사체만 쨍하게 얼려버리는 직광 플래시와 크리스탈 선예도"
        public let iconName = "bolt.circle.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.07 * intensity),
                contrast: Float(1.0 + 0.32 * intensity),
                saturation: Float(1.0 + 0.12 * intensity)
            )

            // Edge sharpness
            guard let sharpen = CIFilter(name: "CISharpenLuminance") else { return img }
            sharpen.setValue(img, forKey: kCIInputImageKey)
            sharpen.setValue(Float(0.8 * intensity), forKey: kCIInputSharpnessKey)
            img = sharpen.outputImage?.cropped(to: img.extent) ?? img

            // Dramatic edge falloff
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.8 * intensity), radius: 0.95)
            return img
        }
    }

    // MARK: - 4. Matrix Green (사이버 매트릭스)
    public struct MatrixGreenFilter: CameraFilter {
        public let id = "cybershot_matrix_green"
        public let name = "Matrix Green"
        public let localizedName = "매트릭스 그린"
        public let cameraCategory = CameraCategory.sonyCybershot
        public let filterDescription = "세기말 SF 사이버펑크 틴트 & 차가운 미래주의 섀도우"
        public let iconName = "cpu.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(-0.02 * intensity),
                contrast: Float(1.0 + 0.20 * intensity),
                saturation: Float(1.0 - 0.15 * intensity)
            )

            // Matrix green color matrix
            img = FilterHelpers.applyColorMatrix(
                image: img,
                rVector: CIVector(x: 0.85, y: 0.05, z: 0.0, w: 0),
                gVector: CIVector(x: 0.10, y: 1.15, z: 0.05, w: 0),
                bVector: CIVector(x: 0.0, y: 0.10, z: 0.90, w: 0),
                biasVector: CIVector(x: -0.02, y: 0.04 * intensity, z: -0.02, w: 0)
            )

            return img
        }
    }
}
