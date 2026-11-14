import Foundation
import AVFoundation
import CoreImage

private final class CameraFrameBox: @unchecked Sendable {
    private let lock = NSLock()
    private var latestPixelBuffer: CVPixelBuffer?
    var onFrame: (@Sendable (CIImage) -> Void)?

    func store(_ pb: CVPixelBuffer) -> (@Sendable (CIImage) -> Void)? {
        lock.lock()
        latestPixelBuffer = pb
        let cb = onFrame
        lock.unlock()
        return cb
    }

    func latestImage() -> CIImage? {
        lock.lock()
        let pb = latestPixelBuffer
        lock.unlock()
        guard let pb else { return nil }
        return CIImage(cvPixelBuffer: pb)
    }
}

private final class CaptureSessionBox: @unchecked Sendable {
    let session = AVCaptureSession()
}

@MainActor
final class CameraCaptureService: NSObject, ObservableObject {
    @Published var availableDevices: [AVCaptureDevice] = []
    @Published var selectedDeviceID: String?
    @Published var isRunning: Bool = false
    @Published var errorMessage: String?

    private let sessionBox = CaptureSessionBox()
    private let videoOutput = AVCaptureVideoDataOutput()
    private let sampleQueue = DispatchQueue(label: "com.icam.filterlab.camera", qos: .userInteractive)
    private var currentInput: AVCaptureDeviceInput?
    private let frameBox = CameraFrameBox()

    var onFrame: (@Sendable (CIImage) -> Void)? {
        get { frameBox.onFrame }
        set { frameBox.onFrame = newValue }
    }

    override init() {
        super.init()
        refreshDevices()
    }

    func refreshDevices() {
        var types: [AVCaptureDevice.DeviceType] = [.builtInWideAngleCamera, .external]
        if #available(macOS 14.0, *) {
            types.append(.continuityCamera)
        }
        let discovery = AVCaptureDevice.DiscoverySession(deviceTypes: types, mediaType: .video, position: .unspecified)
        availableDevices = discovery.devices
        if selectedDeviceID == nil || !availableDevices.contains(where: { $0.uniqueID == selectedDeviceID }) {
            selectedDeviceID = availableDevices.first?.uniqueID
        }
    }

    func start() {
        refreshDevices()
        guard let deviceID = selectedDeviceID,
              let device = availableDevices.first(where: { $0.uniqueID == deviceID }) ?? availableDevices.first else {
            errorMessage = "사용 가능한 맥 카메라 또는 연속성 iPhone 카메라가 없습니다."
            return
        }

        let status = AVCaptureDevice.authorizationStatus(for: .video)
        if status == .notDetermined {
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                Task { @MainActor in
                    if granted { self?.configureAndRun(device: device) }
                    else { self?.errorMessage = "카메라 권한이 거부되었습니다 (시스템 설정에서 허용 필요)." }
                }
            }
            return
        } else if status != .authorized {
            errorMessage = "카메라 권한이 거부되었습니다 (시스템 설정 > 개인정보 보호에서 허용해 주세요)."
            return
        }

        configureAndRun(device: device)
    }

    func selectDevice(_ id: String) {
        selectedDeviceID = id
        if isRunning {
            stop()
            start()
        }
    }

    func stop() {
        guard isRunning else { return }
        let box = sessionBox
        DispatchQueue.global(qos: .userInitiated).async {
            box.session.stopRunning()
        }
        isRunning = false
    }

    func grabLatestCIImage() -> CIImage? {
        frameBox.latestImage()
    }

    private func configureAndRun(device: AVCaptureDevice) {
        errorMessage = nil
        let session = sessionBox.session
        session.beginConfiguration()
        session.sessionPreset = .high

        if let existing = currentInput {
            session.removeInput(existing)
            currentInput = nil
        }

        do {
            let input = try AVCaptureDeviceInput(device: device)
            if session.canAddInput(input) {
                session.addInput(input)
                currentInput = input
            }
        } catch {
            session.commitConfiguration()
            errorMessage = "카메라 입력 초기화 실패: \(error.localizedDescription)"
            return
        }

        videoOutput.alwaysDiscardsLateVideoFrames = true
        videoOutput.videoSettings = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA
        ]
        videoOutput.setSampleBufferDelegate(self, queue: sampleQueue)
        if !session.outputs.contains(videoOutput), session.canAddOutput(videoOutput) {
            session.addOutput(videoOutput)
        }
        session.commitConfiguration()

        let box = sessionBox
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            box.session.startRunning()
            let running = box.session.isRunning
            Task { @MainActor [weak self] in
                self?.isRunning = running
            }
        }
    }
}

extension CameraCaptureService: AVCaptureVideoDataOutputSampleBufferDelegate {
    nonisolated func captureOutput(
        _ output: AVCaptureOutput,
        didOutput sampleBuffer: CMSampleBuffer,
        from connection: AVCaptureConnection
    ) {
        guard let pb = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        if let callback = frameBox.store(pb) {
            callback(CIImage(cvPixelBuffer: pb))
        }
    }
}
