import Foundation

/// The iconic camera categories supported by iCam
public enum CameraCategory: String, CaseIterable, Codable, Sendable {
    case canonIXY = "canon_ixy"
    case sonyHandycam = "sony_handycam"
    case sonyCybershot = "sony_cybershot"
    case fujiInstax = "fuji_instax"
    case colorStudio = "color_studio"
    case passportID = "passport_id"
    case olympusMju = "olympus_mju"
    case contaxT2 = "contax_t2"
    case ricohGR = "ricoh_gr"
    case leicaM = "leica_m"
    case cityPop80s = "city_pop_80s"
    case oldFilm = "old_film"

    public var displayName: String {
        switch self {
        case .canonIXY: return "Canon IXY"
        case .sonyHandycam: return "Sony Handycam"
        case .sonyCybershot: return "Cyber-shot"
        case .fujiInstax: return "Instax Polaroid"
        case .colorStudio: return "Color Studio"
        case .passportID: return "Passport ID"
        case .olympusMju: return "Olympus μ [mju:] II"
        case .contaxT2: return "Contax T2"
        case .ricohGR: return "Ricoh GR Digital"
        case .leicaM: return "Leica M"
        case .cityPop80s: return "City Pop 1986"
        case .oldFilm: return "Old Film Lab"
        }
    }

    public var subtitle: String {
        switch self {
        case .canonIXY: return "Digital 50 (CCD Warm)"
        case .sonyHandycam: return "DCR-PC100 (Tape VHS)"
        case .sonyCybershot: return "DSC-P10 (Cyber Cool)"
        case .fujiInstax: return "Mini 90 (Instant Film)"
        case .colorStudio: return "Color Studio (퍼스널 컬러 스튜디오)"
        case .passportID: return "3.5x4.5cm Official Spec"
        case .olympusMju: return "35mm F2.8 Film Flash"
        case .contaxT2: return "Carl Zeiss T* Titanium"
        case .ricohGR: return "28mm High-Contrast Snap"
        case .leicaM: return "Summilux 35mm F1.4 Rangefinder"
        case .cityPop80s: return "Cassette & Sunset Vibes"
        case .oldFilm: return "CineStill & Portra 35mm"
        }
    }

    public var badgeColorHex: String {
        switch self {
        case .canonIXY: return "#E85D04"
        case .sonyHandycam: return "#D00000"
        case .sonyCybershot: return "#00B4D8"
        case .fujiInstax: return "#52B788"
        case .colorStudio: return "#E76F51"
        case .passportID: return "#3A86FF"
        case .olympusMju: return "#E0A96D"
        case .contaxT2: return "#8D99AE"
        case .ricohGR: return "#D90429"
        case .leicaM: return "#E63946"
        case .cityPop80s: return "#FF007F"
        case .oldFilm: return "#D4A373"
        }
    }
}
