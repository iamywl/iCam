import Foundation
#if canImport(UIKit)
import UIKit
#endif

/// Tactile haptic feedback manager for mechanical shutter, dial clicks, and toggles
public final class HapticFeedbackManager: @unchecked Sendable {
    public static let shared = HapticFeedbackManager()

    public func dialTick() {
        #if canImport(UIKit)
        DispatchQueue.main.async {
            let generator = UISelectionFeedbackGenerator()
            generator.selectionChanged()
        }
        #endif
    }

    public func shutterImpact() {
        #if canImport(UIKit)
        DispatchQueue.main.async {
            let generator = UIImpactFeedbackGenerator(style: .heavy)
            generator.impactOccurred()
        }
        #endif
    }

    public func buttonClick() {
        #if canImport(UIKit)
        DispatchQueue.main.async {
            let generator = UIImpactFeedbackGenerator(style: .medium)
            generator.impactOccurred()
        }
        #endif
    }

    public func successNotification() {
        #if canImport(UIKit)
        DispatchQueue.main.async {
            let generator = UINotificationFeedbackGenerator()
            generator.notificationOccurred(.success)
        }
        #endif
    }
}
