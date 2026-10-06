import Foundation
import CoreGraphics

/// Rich EXIF and optics metadata captured with each photo
public struct ExifMetadata: Identifiable, Codable, Sendable {
    public let id: UUID
    public let cameraName: String
    public let categoryRaw: String
    public let lensModel: String
    public let filterName: String
    public let filterIntensity: Double
    public let opticalLensName: String?
    public let opticalStrength: Double?
    public let shutterSpeed: String
    public let aperture: String
    public let iso: String
    public let focalLength: String
    public let flashFired: Bool
    public let captureDate: Date
    public let width: Int
    public let height: Int
    public let colorSpace: String

    public var aspectRatio: String {
        return "\(width):\(height) (3:4)"
    }

    public init(
        id: UUID = UUID(),
        cameraName: String,
        categoryRaw: String,
        lensModel: String,
        filterName: String,
        filterIntensity: Double,
        opticalLensName: String? = nil,
        opticalStrength: Double? = nil,
        shutterSpeed: String = "1/250s",
        aperture: String = "f/2.8",
        iso: String = "ISO 100",
        focalLength: String = "38mm eq.",
        flashFired: Bool = false,
        captureDate: Date = Date(),
        width: Int = 780,
        height: Int = 1040,
        colorSpace: String = "sRGB Display P3"
    ) {
        self.id = id
        self.cameraName = cameraName
        self.categoryRaw = categoryRaw
        self.lensModel = lensModel
        self.filterName = filterName
        self.filterIntensity = filterIntensity
        self.opticalLensName = opticalLensName
        self.opticalStrength = opticalStrength
        self.shutterSpeed = shutterSpeed
        self.aperture = aperture
        self.iso = iso
        self.focalLength = focalLength
        self.flashFired = flashFired
        self.captureDate = captureDate
        self.width = width
        self.height = height
        self.colorSpace = colorSpace
    }

    public var resolutionDisplay: String {
        "\(width) × \(height) (\(String(format: "%.1f", Double(width * height) / 1_000_000.0)) MP)"
    }

    public var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy.MM.dd HH:mm:ss"
        return formatter.string(from: captureDate)
    }

    public var exposureSummary: String {
        "\(shutterSpeed) • \(aperture) • \(iso)"
    }
}

/// Gallery item representing a captured photograph and its provenance
public struct GalleryItem: Identifiable, Sendable {
    public let id: UUID
    public let image: CGImage
    public let metadata: ExifMetadata
    public let createdAt: Date

    public init(id: UUID = UUID(), image: CGImage, metadata: ExifMetadata) {
        self.id = id
        self.image = image
        self.metadata = metadata
        self.createdAt = metadata.captureDate
    }
}
