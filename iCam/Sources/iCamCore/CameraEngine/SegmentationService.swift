import Foundation
import CoreImage
#if canImport(Vision)
import Vision
#endif

/// Real-time on-device person segmentation service using Apple Vision framework
public final class SegmentationService: @unchecked Sendable {
    public static let shared = SegmentationService()

    #if canImport(Vision)
    private var segmentationRequest: VNGeneratePersonSegmentationRequest?

    public init() {
        let request = VNGeneratePersonSegmentationRequest()
        request.qualityLevel = .balanced
        request.outputPixelFormat = kCVPixelFormatType_OneComponent8
        self.segmentationRequest = request
    }

    /// Generates a CIImage person matte from the input image
    public func generateMatte(from inputImage: CIImage) -> CIImage? {
        guard let request = self.segmentationRequest else { return nil }

        let handler = VNImageRequestHandler(ciImage: inputImage, options: [:])
        do {
            try handler.perform([request])
            guard let result = request.results?.first else { return nil }
            let pixelBuffer = result.pixelBuffer
            return CIImage(cvPixelBuffer: pixelBuffer)
        } catch {
            print("Segmentation error: \(error.localizedDescription)")
            return nil
        }
    }
    #else
    public init() {}
    public func generateMatte(from inputImage: CIImage) -> CIImage? {
        return nil
    }
    #endif
}
