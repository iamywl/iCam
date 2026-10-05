import Foundation
import CoreImage

/// Protocol defining a modular camera filter.
/// Any filter pack (e.g. Canon, Sony, Fuji, ColorStudio) implements this protocol.
public protocol CameraFilter: Identifiable, Sendable {
    /// Unique identifier (e.g. "ixy_peach_glow")
    var id: String { get }

    /// Human-readable English name
    var name: String { get }

    /// Localized / Korean display name
    var localizedName: String { get }

    /// Category matching one of the 6 iconic camera systems
    var cameraCategory: CameraCategory { get }

    /// Detailed description of the filter's visual characteristics
    var filterDescription: String { get }

    /// System SF Symbol or icon identifier
    var iconName: String { get }

    /// Tunable parameters (warmth, grain, contrast, etc.)
    var parameters: [FilterParameter] { get }

    /// Core Image rendering implementation
    /// - Parameters:
    ///   - inputImage: The original live camera feed or captured still CIImage
    ///   - context: CIContext for processing
    ///   - intensity: Global effect intensity (0.0 to 1.0)
    /// - Returns: Processed CIImage with the authentic camera characteristics applied
    func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage
}

public extension CameraFilter {
    var parameters: [FilterParameter] {
        [FilterParameter(key: "intensity", displayName: "강도", defaultValue: 1.0)]
    }
}
