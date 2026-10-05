import Foundation
import CoreImage

/// Modular optical lens filters that can be detached or attached to any camera body
public enum OpticalLensFilterPack {

    public static var allFilters: [any OpticalFilter] {
        [
            BlackMistFilter(),
            CrossStarFilter(),
            BlueStreakFilter(),
            PrismSpectrumFilter(),
            CPLPolarizerFilter()
        ]
    }

    // MARK: - 1. Black Mist (블랙 미스트)
    public struct BlackMistFilter: OpticalFilter {
        public let id = "lens_black_mist"
        public let name = "Black Mist"
        public let localizedName = "블랙 미스트"
        public let filterDescription = "하이라이트 할레이션(블룸) & 인물 피부결 소프트닝"
        public let iconName = "sparkles"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, strength: Double) -> CIImage {
            let bloomed = FilterHelpers.applyBloom(
                image: inputImage,
                radius: Float(16.0 * strength),
                intensity: Float(0.75 * strength)
            )
            return FilterHelpers.blendWithAlpha(foreground: bloomed, background: inputImage, alpha: Float(0.55 * strength))
        }
    }

    // MARK: - 2. Cross Star 4X (크로스 스타)
    public struct CrossStarFilter: OpticalFilter {
        public let id = "lens_cross_star"
        public let name = "Cross Star 4X"
        public let localizedName = "크로스 스타"
        public let filterDescription = "점광원 및 야경 다이아몬드 별빛 4방향 회절광"
        public let iconName = "star.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, strength: Double) -> CIImage {
            // Highlight extraction
            guard let highlight = CIFilter(name: "CIColorControls") else { return inputImage }
            highlight.setValue(inputImage, forKey: kCIInputImageKey)
            highlight.setValue(Float(0.3 * strength), forKey: kCIInputBrightnessKey)
            highlight.setValue(Float(1.5 * strength), forKey: kCIInputContrastKey)

            guard let highImg = highlight.outputImage else { return inputImage }

            // Directional cross-blur
            guard let blurH = CIFilter(name: "CIMotionBlur"),
                  let blurV = CIFilter(name: "CIMotionBlur") else { return inputImage }

            blurH.setValue(highImg, forKey: kCIInputImageKey)
            blurH.setValue(Float(25.0 * strength), forKey: kCIInputRadiusKey)
            blurH.setValue(0.0, forKey: kCIInputAngleKey)

            blurV.setValue(highImg, forKey: kCIInputImageKey)
            blurV.setValue(Float(25.0 * strength), forKey: kCIInputRadiusKey)
            blurV.setValue(Double.pi / 2, forKey: kCIInputAngleKey)

            guard let hImg = blurH.outputImage, let vImg = blurV.outputImage else { return inputImage }

            // Combine star lines
            guard let addStar = CIFilter(name: "CIAdditionCompositing") else { return inputImage }
            addStar.setValue(hImg, forKey: kCIInputImageKey)
            addStar.setValue(vImg, forKey: kCIInputBackgroundImageKey)

            guard let stars = addStar.outputImage,
                  let screenBlend = CIFilter(name: "CIScreenBlendMode") else { return inputImage }

            screenBlend.setValue(stars, forKey: kCIInputImageKey)
            screenBlend.setValue(inputImage, forKey: kCIInputBackgroundImageKey)

            return screenBlend.outputImage?.cropped(to: inputImage.extent) ?? inputImage
        }
    }

    // MARK: - 3. Blue Streak (블루 스트릭)
    public struct BlueStreakFilter: OpticalFilter {
        public let id = "lens_blue_streak"
        public let name = "Blue Streak"
        public let localizedName = "블루 스트릭"
        public let filterDescription = "아나모픽 렌즈 특유의 네온 사이언 수평 플레어"
        public let iconName = "rays"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, strength: Double) -> CIImage {
            // Horizontal flare
            guard let motionBlur = CIFilter(name: "CIMotionBlur") else { return inputImage }
            motionBlur.setValue(inputImage, forKey: kCIInputImageKey)
            motionBlur.setValue(Float(40.0 * strength), forKey: kCIInputRadiusKey)
            motionBlur.setValue(0.0, forKey: kCIInputAngleKey) // Horizontal

            guard let streak = motionBlur.outputImage else { return inputImage }

            // Tint cyan / blue
            guard let tint = CIFilter(name: "CIColorMonochrome") else { return inputImage }
            tint.setValue(streak, forKey: kCIInputImageKey)
            tint.setValue(CIColor(red: 0.1, green: 0.65, blue: 1.0), forKey: kCIInputColorKey)
            tint.setValue(Float(0.8 * strength), forKey: kCIInputIntensityKey)

            guard let cyanStreak = tint.outputImage,
                  let screen = CIFilter(name: "CIScreenBlendMode") else { return inputImage }

            screen.setValue(cyanStreak, forKey: kCIInputImageKey)
            screen.setValue(inputImage, forKey: kCIInputBackgroundImageKey)
            return screen.outputImage?.cropped(to: inputImage.extent) ?? inputImage
        }
    }

    // MARK: - 4. Prism Spectrum (프리즘 스펙트럼)
    public struct PrismSpectrumFilter: OpticalFilter {
        public let id = "lens_prism_spectrum"
        public let name = "Prism Spectrum"
        public let localizedName = "프리즘 스펙트럼"
        public let filterDescription = "무지개 색수차 분광 및 에지 프리즘 림라이트"
        public let iconName = "triangle.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, strength: Double) -> CIImage {
            // Edge chromatic shift
            let offset = CGFloat(4.0 * strength)
            let redShifted = inputImage.transformed(by: CGAffineTransform(translationX: offset, y: 0))
            let blueShifted = inputImage.transformed(by: CGAffineTransform(translationX: -offset, y: 0))

            // Composite shifted channels
            let rMat = FilterHelpers.applyColorMatrix(
                image: redShifted,
                rVector: CIVector(x: 1, y: 0, z: 0, w: 0),
                gVector: CIVector(x: 0, y: 0, z: 0, w: 0),
                bVector: CIVector(x: 0, y: 0, z: 0, w: 0)
            )
            let gMat = FilterHelpers.applyColorMatrix(
                image: inputImage,
                rVector: CIVector(x: 0, y: 0, z: 0, w: 0),
                gVector: CIVector(x: 0, y: 1, z: 0, w: 0),
                bVector: CIVector(x: 0, y: 0, z: 0, w: 0)
            )
            let bMat = FilterHelpers.applyColorMatrix(
                image: blueShifted,
                rVector: CIVector(x: 0, y: 0, z: 0, w: 0),
                gVector: CIVector(x: 0, y: 0, z: 0, w: 0),
                bVector: CIVector(x: 0, y: 0, z: 1, w: 0)
            )

            guard let add1 = CIFilter(name: "CIAdditionCompositing"),
                  let add2 = CIFilter(name: "CIAdditionCompositing") else { return inputImage }

            add1.setValue(rMat, forKey: kCIInputImageKey)
            add1.setValue(gMat, forKey: kCIInputBackgroundImageKey)
            guard let rg = add1.outputImage else { return inputImage }

            add2.setValue(bMat, forKey: kCIInputImageKey)
            add2.setValue(rg, forKey: kCIInputBackgroundImageKey)

            guard let chromatic = add2.outputImage else { return inputImage }
            return FilterHelpers.blendWithAlpha(foreground: chromatic, background: inputImage, alpha: Float(0.7 * strength))
        }
    }

    // MARK: - 5. CPL Polarizer (CPL 편광)
    public struct CPLPolarizerFilter: OpticalFilter {
        public let id = "lens_cpl_polarizer"
        public let name = "CPL Polarizer"
        public let localizedName = "CPL 편광"
        public let filterDescription = "반사광 억제 및 콘트라스트 & 하늘 채도 극대화"
        public let iconName = "sun.max.trianglebadge.exclamationmark.fill"

        public init() {}

        public func apply(to inputImage: CIImage, context: CIContext, strength: Double) -> CIImage {
            return FilterHelpers.adjustColorControls(
                image: inputImage,
                brightness: Float(-0.03 * strength),
                contrast: Float(1.0 + 0.22 * strength),
                saturation: Float(1.0 + 0.35 * strength)
            )
        }
    }
}
