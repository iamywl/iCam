import Foundation
import SwiftUI

/// Authentic Studio Personal Color Swatches
public struct PersonalColorSwatch: Identifiable, Hashable, Sendable {
    public let id: String
    public let name: String
    public let englishName: String
    public let hex: String
    public let season: String

    public init(id: String, name: String, englishName: String, hex: String, season: String) {
        self.id = id
        self.name = name
        self.englishName = englishName
        self.hex = hex
        self.season = season
    }
}

public enum PersonalColorPalette {
    public static let best8: [PersonalColorSwatch] = [
        PersonalColorSwatch(id: "blossom_pink", name: "블라썸 핑크", englishName: "Blossom Pink", hex: "#F38B95", season: "Spring Warm"),
        PersonalColorSwatch(id: "sage_olive", name: "세이지 올리브", englishName: "Sage Olive", hex: "#80926C", season: "Autumn Muted"),
        PersonalColorSwatch(id: "soft_sky", name: "소프트 스카이", englishName: "Soft Sky", hex: "#89B6D7", season: "Summer Cool"),
        PersonalColorSwatch(id: "oat_beige", name: "오트 베이지", englishName: "Oat Beige", hex: "#DFCBB5", season: "Autumn Warm"),
        PersonalColorSwatch(id: "crimson_wine", name: "크림슨 와인", englishName: "Crimson Wine", hex: "#781F2F", season: "Winter Deep"),
        PersonalColorSwatch(id: "pop_fuchsia", name: "팝 퓨샤", englishName: "Pop Fuchsia", hex: "#E93B81", season: "Winter Cool"),
        PersonalColorSwatch(id: "camel_ochre", name: "카멜 오커", englishName: "Camel Ochre", hex: "#C89A58", season: "Autumn Deep"),
        PersonalColorSwatch(id: "muted_lavender", name: "뮤티드 라벤더", englishName: "Muted Lavender", hex: "#9B8CB4", season: "Summer Muted")
    ]
}
