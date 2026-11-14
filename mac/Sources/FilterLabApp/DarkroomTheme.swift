import SwiftUI
import AppKit

enum DarkroomTheme {
    /// Obsidian Matte outer chrome (#0E0F12)
    static let chromeBg = Color(red: 14.0 / 255.0, green: 15.0 / 255.0, blue: 18.0 / 255.0)
    /// Elevated inspector card surface (#141519)
    static let surfaceBg = Color(red: 20.0 / 255.0, green: 21.0 / 255.0, blue: 25.0 / 255.0)
    /// Pure achromatic neutral darkroom mat (#181818, exact R=G=B) for zero simultaneous contrast bias
    static let darkroomMat = Color(red: 24.0 / 255.0, green: 24.0 / 255.0, blue: 24.0 / 255.0)
    static let darkroomMatNS = NSColor(srgbRed: 24.0 / 255.0, green: 24.0 / 255.0, blue: 24.0 / 255.0, alpha: 1.0)

    static let hairline = Color.white.opacity(0.08)
    static let hairlineBright = Color.white.opacity(0.24)
    static let hairlineDropHover = Color.white.opacity(0.45)

    static let textPrimary = Color(red: 244.0 / 255.0, green: 244.0 / 255.0, blue: 245.0 / 255.0)
    static let textSecondary = Color(red: 142.0 / 255.0, green: 142.0 / 255.0, blue: 147.0 / 255.0)
    static let textMuted = Color(red: 99.0 / 255.0, green: 99.0 / 255.0, blue: 102.0 / 255.0)

    /// Anodized silver accent — zero neon glows or plastic gradients
    static let silverAccent = Color(red: 212.0 / 255.0, green: 212.0 / 255.0, blue: 216.0 / 255.0)
}
