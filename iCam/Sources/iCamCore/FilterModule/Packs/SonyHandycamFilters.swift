import Foundation
import CoreImage

/// Modular filter pack for Sony DCR Handycam (90s-00s MiniDV / Hi8 Camcorder)
public enum SonyHandycamFilterPack {

    public static var allFilters: [any CameraFilter] {
        [
            MiniDVClassicFilter(),
            Hi8VHSTapeFilter(),
            Super8CineFilter(),
            NightShotGreenFilter()
        ]
    }

    // MARK: - 1. MiniDV Classic (90년대 3CCD 원색)
    public struct MiniDVClassicFilter: CameraFilter {
        public let id = "handycam_minidv_classic"
        public let name = "MiniDV Classic"
        public let localizedName = "미니DV 클래식"
        public let cameraCategory = CameraCategory.sonyHandycam
        public let filterDescription = "90년대 소니 3CCD 캠코더 특유의 묵직하고 진한 원색 대비 질감"
        public let iconName = "video.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.02 * intensity),
                contrast: Float(1.0 + 0.16 * intensity),
                saturation: Float(1.0 + 0.28 * intensity)
            )

            // Warm video tape bias
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 5800, y: 5)
            )

            // Subtle tape grain
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.04 * intensity))
            return img
        }
    }

    // MARK: - 2. Hi8 VHS Tape (수평 스캔라인 & 테이프 질감)
    public struct Hi8VHSTapeFilter: CameraFilter {
        public let id = "handycam_hi8_vhs"
        public let name = "Hi8 VHS Tape"
        public let localizedName = "Hi8 비디오 테이프"
        public let cameraCategory = CameraCategory.sonyHandycam
        public let filterDescription = "아날로그 브라운관 비디오테이프 수평 스캔라인 글리치 & 따스한 색 번짐"
        public let iconName = "tv.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            // Analog contrast and boosted red-orange chroma bleed
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.03 * intensity),
                contrast: Float(1.0 + 0.22 * intensity),
                saturation: Float(1.0 + 0.18 * intensity)
            )

            // Chroma bleed: matrix shift red slightly right/down
            img = FilterHelpers.applyColorMatrix(
                image: img,
                rVector: CIVector(x: 1.08, y: 0.02, z: 0.0, w: 0),
                gVector: CIVector(x: 0.0, y: 0.98, z: 0.02, w: 0),
                bVector: CIVector(x: 0.0, y: 0.02, z: 1.02, w: 0),
                biasVector: CIVector(x: 0.02, y: 0.01, z: 0.01, w: 0)
            )

            // VHS tape grain & soft bloom
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.07 * intensity))
            return img
        }
    }

    // MARK: - 3. Super 8 Cine (70s 홈무비 골든 앰버)
    public struct Super8CineFilter: CameraFilter {
        public let id = "handycam_super8_cine"
        public let name = "Super 8 Cine"
        public let localizedName = "슈퍼8 시네 필름"
        public let cameraCategory = CameraCategory.sonyHandycam
        public let filterDescription = "1970년대 홈무비 시네 필름 비네팅 & 골든 앰버 톤"
        public let iconName = "film.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            var img = FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(0.01 * intensity),
                contrast: Float(1.0 + 0.14 * intensity),
                saturation: Float(1.0 - 0.10 * intensity)
            )

            // Golden amber temperature
            img = FilterHelpers.adjustTemperatureAndTint(
                image: img,
                neutral: CIVector(x: 6500, y: 0),
                targetNeutral: CIVector(x: 4800, y: -10)
            )

            // Heavy cine vignette
            img = FilterHelpers.applyVignette(image: img, intensity: Float(0.85 * intensity), radius: 0.9)

            // Film grain
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.06 * intensity))
            return img
        }
    }

    // MARK: - 4. NightShot Green (0 Lux 적외선 그린)
    public struct NightShotGreenFilter: CameraFilter {
        public let id = "handycam_nightshot_green"
        public let name = "NightShot Green"
        public let localizedName = "나이트샷 그린"
        public let cameraCategory = CameraCategory.sonyHandycam
        public let filterDescription = "소니 특유의 적외선 0 Lux 야간 투시 그린 나이트샷"
        public let iconName = "flashlight.on.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            // First convert to high-contrast monochrome
            guard let mono = CIFilter(name: "CIColorMonochrome") else { return inputImage }
            mono.setValue(inputImage, forKey: kCIInputImageKey)
            mono.setValue(CIColor(red: 0.15, green: 0.95, blue: 0.25), forKey: kCIInputColorKey)
            mono.setValue(Float(intensity), forKey: kCIInputIntensityKey)

            guard let greenImage = mono.outputImage else { return inputImage }

            // High boost contrast for night-vision look
            var img = FilterHelpers.adjustColorControls(
                image: greenImage,
                brightness: Float(0.08 * intensity),
                contrast: Float(1.0 + 0.35 * intensity),
                saturation: 1.0
            )

            // High sensor noise
            img = FilterHelpers.applyGrain(image: img, amount: Float(0.12 * intensity))
            return img
        }
    }
}
