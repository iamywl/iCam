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
    case hasselblad = "hasselblad_500cm"
    case polaroidSX70 = "polaroid_sx70"
    case fujiQuickSnap = "fuji_quicksnap"
    case kyoceraSamurai = "kyocera_samurai"

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
        case .hasselblad: return "Hasselblad 500C/M"
        case .polaroidSX70: return "Polaroid SX-70"
        case .fujiQuickSnap: return "Fuji QuickSnap (写ルンです)"
        case .kyoceraSamurai: return "Kyocera Samurai X3.0"
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
        case .hasselblad: return "Planar 80mm 6x6 Medium Format"
        case .polaroidSX70: return "1972 Vintage Folding Land Camera"
        case .fujiQuickSnap: return "1986 Bubble Disposable Icon"
        case .kyoceraSamurai: return "1988 Cyber Half-Frame 72-Shot SLR"
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
        case .hasselblad: return "#9A8C98"
        case .polaroidSX70: return "#C9A227"
        case .fujiQuickSnap: return "#00E676"
        case .kyoceraSamurai: return "#00E5FF"
        }
    }
}

/// Ergonomic Era Grouping for 4-Tier Camera Switching
public enum CameraGroup: String, CaseIterable, Identifiable, Sendable {
    case all = "all"
    case bubble = "bubble"
    case y2k = "y2k"
    case medium = "medium"
    case studio = "studio"

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .all: return "전체 16종"
        case .bubble: return "🇯🇵 버블&필름"
        case .y2k: return "💿 Y2K 디카"
        case .medium: return "🪐 중형&즉석"
        case .studio: return "🎨 스튜디오"
        }
    }
}

extension CameraCategory {
    public var group: CameraGroup {
        switch self {
        case .fujiQuickSnap, .kyoceraSamurai, .cityPop80s, .oldFilm, .contaxT2, .olympusMju:
            return .bubble
        case .canonIXY, .sonyHandycam, .sonyCybershot, .ricohGR, .leicaM:
            return .y2k
        case .hasselblad, .polaroidSX70, .fujiInstax:
            return .medium
        case .colorStudio, .passportID:
            return .studio
        }
    }
}
