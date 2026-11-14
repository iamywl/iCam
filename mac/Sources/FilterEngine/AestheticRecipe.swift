import Foundation
import simd

public enum GrainMode: String, Codable, Sendable, CaseIterable, Hashable {
    case silverHalide
    case ccdSensor
}

public enum DebugMaskMode: Int32, CaseIterable, Sendable, Identifiable, Hashable {
    case normal = 0
    case skinMask = 1
    case halationMask = 2
    case blackMistMask = 3
    case grainBellCurve = 4

    public var id: Int32 { rawValue }

    public var title: String {
        switch self {
        case .normal: return "Normal"
        case .skinMask: return "Skin Mask (25°)"
        case .halationMask: return "Halation Mask"
        case .blackMistMask: return "Black Mist Mask"
        case .grainBellCurve: return "Grain Midtone"
        }
    }
}

public struct ToneParameters: Codable, Sendable, Equatable, Hashable {
    public var exposureEV: Float
    public var wbTempShift: Float
    public var wbTintShift: Float
    public var blackFloor: [Float]
    public var toeSoftness: Float
    public var midContrast: Float
    public var shoulderStart: Float
    public var shoulderSoftness: Float
    public var highlightDesat: Float
}

public struct MonochromeParameters: Codable, Sendable, Equatable, Hashable {
    public var enabled: Bool
    public var rgbWeights: [Float]
    public var skinLumBoost: Float
    public var skyLumPull: Float
}

public struct ColorScienceParameters: Codable, Sendable, Equatable, Hashable {
    public var skinCenterDeg: Float
    public var skinWidthDeg: Float
    public var skinHueShiftDeg: Float
    public var skinSatDelta: Float
    public var skinLumDelta: Float
    public var skinTintShield: Float
    public var skinChromaSmooth: Float
    public var greenHueShiftDeg: Float
    public var greenSatDelta: Float
    public var greenLumDelta: Float
    public var blueHueShiftDeg: Float
    public var blueSatDelta: Float
    public var redSatDelta: Float
    public var vibrance: Float
    public var saturation: Float
    public var shadowTintRGB: [Float]
    public var shadowTintStrength: Float
    public var highlightTintRGB: [Float]
    public var highlightTintStrength: Float
}

public struct HalationParameters: Codable, Sendable, Equatable, Hashable {
    public var enabled: Bool
    public var threshold: Float
    public var knee: Float
    public var radiusNorm: Float
    public var strength: Float
    public var tintRGB: [Float]
    public var verticalAnisotropy: Float
}

public struct BlackMistParameters: Codable, Sendable, Equatable, Hashable {
    public var enabled: Bool
    public var threshold: Float
    public var knee: Float
    public var radiusNorm: Float
    public var strength: Float
    public var veil: Float
}

public struct OpticsAndGrainParameters: Codable, Sendable, Equatable, Hashable {
    public var microContrast: Float
    public var edgeSoftness: Float
    public var grainMode: GrainMode
    public var grainAmount: Float
    public var grainSizeNorm: Float
    public var grainChromaRatio: Float
    public var vignetteStrength: Float
    public var vignettePower: Float
    public var flashCenterBoost: Float
    public var lightLeakStrength: Float
}

public struct AestheticRecipe: Codable, Sendable, Identifiable, Equatable, Hashable {
    public var id: String
    public var shortLabel: String
    public var name: String
    public var koreanName: String
    public var moodCue: String
    public var persona: String
    public var intensity: Float?
    public var tone: ToneParameters
    public var monochrome: MonochromeParameters
    public var colorScience: ColorScienceParameters
    public var halation: HalationParameters
    public var blackMist: BlackMistParameters
    public var opticsAndGrain: OpticsAndGrainParameters

    public var effectiveIntensity: Float {
        intensity ?? 1.0
    }

    public static let stockBaseline = AestheticRecipe(
        id: "00_stock_original",
        shortLabel: "00 STOCK",
        name: "Stock Original",
        koreanName: "원본 (기카)",
        moodCue: "Unmodified Reference",
        persona: "Reference Baseline",
        intensity: 1.0,
        tone: ToneParameters(
            exposureEV: 0,
            wbTempShift: 0,
            wbTintShift: 0,
            blackFloor: [0, 0, 0],
            toeSoftness: 0,
            midContrast: 1.0,
            shoulderStart: 1.0,
            shoulderSoftness: 0,
            highlightDesat: 0
        ),
        monochrome: MonochromeParameters(
            enabled: false,
            rgbWeights: [0.2126, 0.7152, 0.0722],
            skinLumBoost: 0,
            skyLumPull: 0
        ),
        colorScience: ColorScienceParameters(
            skinCenterDeg: 25,
            skinWidthDeg: 20,
            skinHueShiftDeg: 0,
            skinSatDelta: 0,
            skinLumDelta: 0,
            skinTintShield: 1,
            skinChromaSmooth: 0,
            greenHueShiftDeg: 0,
            greenSatDelta: 0,
            greenLumDelta: 0,
            blueHueShiftDeg: 0,
            blueSatDelta: 0,
            redSatDelta: 0,
            vibrance: 0,
            saturation: 1,
            shadowTintRGB: [0, 0, 0],
            shadowTintStrength: 0,
            highlightTintRGB: [1, 1, 1],
            highlightTintStrength: 0
        ),
        halation: HalationParameters(
            enabled: false,
            threshold: 0.95,
            knee: 0.05,
            radiusNorm: 0.01,
            strength: 0,
            tintRGB: [1, 0.2, 0.03],
            verticalAnisotropy: 1
        ),
        blackMist: BlackMistParameters(
            enabled: false,
            threshold: 0.8,
            knee: 0.15,
            radiusNorm: 0.01,
            strength: 0,
            veil: 0
        ),
        opticsAndGrain: OpticsAndGrainParameters(
            microContrast: 0,
            edgeSoftness: 0,
            grainMode: .silverHalide,
            grainAmount: 0,
            grainSizeNorm: 1,
            grainChromaRatio: 0,
            vignetteStrength: 0,
            vignettePower: 2,
            flashCenterBoost: 0,
            lightLeakStrength: 0
        )
    )
}

public struct RecipeCatalog: Codable, Sendable, Equatable, Hashable {
    public var schemaVersion: Int
    public var updatedAt: String
    public var aesthetics: [AestheticRecipe]

    public init(schemaVersion: Int, updatedAt: String, aesthetics: [AestheticRecipe]) {
        self.schemaVersion = schemaVersion
        self.updatedAt = updatedAt
        self.aesthetics = aesthetics
    }
}
