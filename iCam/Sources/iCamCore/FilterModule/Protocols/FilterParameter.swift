import Foundation

/// Represents a configurable parameter for a camera filter (e.g., intensity, warmth, grain)
public struct FilterParameter: Identifiable, Hashable, Codable, Sendable {
    public var id: String { key }
    public let key: String
    public let displayName: String
    public let minValue: Double
    public let maxValue: Double
    public let defaultValue: Double
    public var currentValue: Double

    public init(
        key: String,
        displayName: String,
        minValue: Double = 0.0,
        maxValue: Double = 1.0,
        defaultValue: Double = 1.0,
        currentValue: Double? = nil
    ) {
        self.key = key
        self.displayName = displayName
        self.minValue = minValue
        self.maxValue = maxValue
        self.defaultValue = defaultValue
        self.currentValue = currentValue ?? defaultValue
    }
}
