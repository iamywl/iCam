import Foundation

/// The 6 iconic camera categories supported by iCam
public enum CameraCategory: String, CaseIterable, Codable, Sendable {
    case canonIXY = "canon_ixy"
    case sonyHandycam = "sony_handycam"
    case sonyCybershot = "sony_cybershot"
    case fujiInstax = "fuji_instax"
    case sihyunhada = "sihyunhada"
    case passportID = "passport_id"

    public var displayName: String {
        switch self {
        case .canonIXY: return "Canon IXY"
        case .sonyHandycam: return "Sony Handycam"
        case .sonyCybershot: return "Cyber-shot"
        case .fujiInstax: return "Instax Polaroid"
        case .sihyunhada: return "시현하다 Studio"
        case .passportID: return "Passport ID"
        }
    }

    public var subtitle: String {
        switch self {
        case .canonIXY: return "Digital 50 (CCD Warm)"
        case .sonyHandycam: return "DCR-PC100 (Tape VHS)"
        case .sonyCybershot: return "DSC-P10 (Cyber Cool)"
        case .fujiInstax: return "Mini 90 (Instant Film)"
        case .sihyunhada: return "Personal Color Studio"
        case .passportID: return "3.5x4.5cm Official Spec"
        }
    }

    public var badgeColorHex: String {
        switch self {
        case .canonIXY: return "#E85D04"
        case .sonyHandycam: return "#D00000"
        case .sonyCybershot: return "#00B4D8"
        case .fujiInstax: return "#52B788"
        case .sihyunhada: return "#E76F51"
        case .passportID: return "#3A86FF"
        }
    }
}
