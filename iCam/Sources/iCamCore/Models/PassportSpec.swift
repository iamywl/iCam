import Foundation

/// Official ID and Passport Specifications (ICAO & Korean Ministry of Foreign Affairs)
public struct PassportSpec: Identifiable, Hashable, Sendable {
    public let id: String
    public let name: String
    public let dimensionsMM: String
    public let aspectRatio: Double // width / height
    public let crownLineRatio: Double // distance from top (0.0 to 1.0)
    public let eyeLineRatio: Double
    public let chinLineRatio: Double
    public let shoulderLineRatio: Double

    public static let standardSpecs: [PassportSpec] = [
        PassportSpec(
            id: "kr_passport",
            name: "대한민국 여권",
            dimensionsMM: "35 x 45 mm",
            aspectRatio: 35.0 / 45.0,
            crownLineRatio: 0.16,
            eyeLineRatio: 0.38,
            chinLineRatio: 0.68,
            shoulderLineRatio: 0.82
        ),
        PassportSpec(
            id: "kr_id_card",
            name: "주민등록증 / 운전면허",
            dimensionsMM: "35 x 45 mm",
            aspectRatio: 35.0 / 45.0,
            crownLineRatio: 0.14,
            eyeLineRatio: 0.36,
            chinLineRatio: 0.70,
            shoulderLineRatio: 0.84
        ),
        PassportSpec(
            id: "half_card",
            name: "반명함판",
            dimensionsMM: "30 x 40 mm",
            aspectRatio: 30.0 / 40.0,
            crownLineRatio: 0.18,
            eyeLineRatio: 0.40,
            chinLineRatio: 0.68,
            shoulderLineRatio: 0.80
        ),
        PassportSpec(
            id: "us_visa",
            name: "미국 비자 (Square)",
            dimensionsMM: "50 x 50 mm",
            aspectRatio: 1.0,
            crownLineRatio: 0.18,
            eyeLineRatio: 0.42,
            chinLineRatio: 0.68,
            shoulderLineRatio: 0.85
        )
    ]
}
