import Foundation
import CoreImage

/// Protocol defining a detachable optical lens filter (Black Mist, Star Filter, Anamorphic Streak, etc.)
public protocol OpticalFilter: Identifiable, Sendable {
    var id: String { get }
    var name: String { get }
    var localizedName: String { get }
    var filterDescription: String { get }
    var iconName: String { get }

    /// Apply optical lens physics/simulation to the frame
    func apply(to inputImage: CIImage, context: CIContext, strength: Double) -> CIImage
}
