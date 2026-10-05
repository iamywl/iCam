import Foundation
import CoreImage
import AVFoundation

#if canImport(UIKit)
import UIKit
#endif

/// Camera hardware service managing AVCaptureSession and frame delivery
public final class CameraService: NSObject, @unchecked Sendable {
    public static let shared = CameraService()

    public private(set) var isRunning: Bool = false
    public var onFrameCaptured: (@Sendable (CIImage) -> Void)?

    #if os(iOS)
    private let captureSession = AVCaptureSession()
    private let videoOutput = AVCaptureVideoDataOutput()
    private let photoOutput = AVCapturePhotoOutput()
    private let sessionQueue = DispatchQueue(label: "com.icam.camera.sessionQueue")
    private var currentPosition: AVCaptureDevice.Position = .front
    private var photoCompletion: ((CIImage?) -> Void)?

    public override init() {
        super.init()
    }

    public func checkPermission(completion: @escaping (Bool) -> Void) {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            completion(true)
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async { completion(granted) }
            }
        default:
            completion(false)
        }
    }

    public func startSession() {
        sessionQueue.async { [weak self] in
            guard let self = self, !self.captureSession.isRunning else { return }
            self.configureSession()
            self.captureSession.startRunning()
            self.isRunning = self.captureSession.isRunning
        }
    }

    public func stopSession() {
        sessionQueue.async { [weak self] in
            guard let self = self, self.captureSession.isRunning else { return }
            self.captureSession.stopRunning()
            self.isRunning = false
        }
    }

    public func flipCamera() {
        sessionQueue.async { [weak self] in
            guard let self = self else { return }
            self.currentPosition = (self.currentPosition == .back) ? .front : .back
            self.configureSession()
        }
    }

    private func configureSession() {
        captureSession.beginConfiguration()
        captureSession.sessionPreset = .photo

        // Remove existing inputs
        for input in captureSession.inputs {
            captureSession.removeInput(input)
        }

        // Add device input
        let discovery = AVCaptureDevice.DiscoverySession(
            deviceTypes: [.builtInWideAngleCamera],
            mediaType: .video,
            position: currentPosition
        )
        guard let device = discovery.devices.first,
              let input = try? AVCaptureDeviceInput(device: device) else {
            captureSession.commitConfiguration()
            return
        }

        if captureSession.canAddInput(input) {
            captureSession.addInput(input)
        }

        // Add video output for live filtering
        if captureSession.canAddOutput(videoOutput) {
            videoOutput.alwaysDiscardsLateVideoFrames = true
            videoOutput.videoSettings = [
                kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32BGRA)
            ]
            videoOutput.setSampleBufferDelegate(self, queue: sessionQueue)
            captureSession.addOutput(videoOutput)
        }

        // Add photo output
        if captureSession.canAddOutput(photoOutput) {
            captureSession.addOutput(photoOutput)
        }

        captureSession.commitConfiguration()
    }

    public func capturePhoto(completion: @escaping (CIImage?) -> Void) {
        sessionQueue.async { [weak self] in
            guard let self = self else {
                completion(nil)
                return
            }
            self.photoCompletion = completion
            let settings = AVCapturePhotoSettings()
            self.photoOutput.capturePhoto(with: settings, delegate: self)
        }
    }

    #else
    public override init() { super.init() }
    public func checkPermission(completion: @escaping (Bool) -> Void) { completion(true) }
    public func startSession() { isRunning = true }
    public func stopSession() { isRunning = false }
    public func flipCamera() {}
    public func capturePhoto(completion: @escaping (CIImage?) -> Void) {
        // Fallback test sample
        let color = CIColor(red: 0.9, green: 0.8, blue: 0.7)
        let sample = CIImage(color: color).cropped(to: CGRect(x: 0, y: 0, width: 1200, height: 1600))
        completion(sample)
    }
    #endif
}

#if os(iOS)
extension CameraService: AVCaptureVideoDataOutputSampleBufferDelegate, AVCapturePhotoCaptureDelegate {
    public func captureOutput(
        _ output: AVCaptureOutput,
        didOutput sampleBuffer: CMSampleBuffer,
        from connection: AVCaptureConnection
    ) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
        onFrameCaptured?(ciImage)
    }

    public func photoOutput(
        _ output: AVCapturePhotoOutput,
        didFinishProcessingPhoto photo: AVCapturePhoto,
        error: Error?
    ) {
        guard error == nil,
              let data = photo.fileDataRepresentation(),
              let ciImage = CIImage(data: data) else {
            photoCompletion?(nil)
            return
        }
        DispatchQueue.main.async { [weak self] in
            self?.photoCompletion?(ciImage)
        }
    }
}
#endif
