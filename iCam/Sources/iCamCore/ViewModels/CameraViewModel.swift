import Foundation
import SwiftUI
import CoreImage
import Combine

#if canImport(UIKit)
import UIKit
#endif

/// Main view model driving the iCam multi-camera studio experience
@MainActor
public final class CameraViewModel: ObservableObject {

    // MARK: - Published Properties
    @Published public var selectedCategory: CameraCategory = .canonIXY {
        didSet {
            onCameraCategoryChanged()
        }
    }

    @Published public var availableFilters: [any CameraFilter] = []
    @Published public var selectedFilterId: String = ""
    @Published public var filterIntensity: Double = 1.0

    @Published public var availableOpticalFilters: [any OpticalFilter] = []
    @Published public var selectedOpticalFilterId: String? = nil
    @Published public var opticalStrength: Double = 0.8

    // Sihyunhada Live Background State
    @Published public var selectedPersonalColor: PersonalColorSwatch = PersonalColorPalette.best8[0]
    @Published public var studioSubjectName: String = "Sihyun"
    @Published public var isLiveMattingEnabled: Bool = true

    // Passport State
    @Published public var selectedPassportSpec: PassportSpec = PassportSpec.standardSpecs[0]
    @Published public var showPassportGuideLines: Bool = true

    // Camera Controls
    @Published public var isFlashEnabled: Bool = false
    @Published public var isGridEnabled: Bool = true
    @Published public var timerDuration: Int = 0 // 0, 3, 10
    @Published public var isShutterFlashing: Bool = false

    // Captured Result
    @Published public var lastCapturedPhoto: CGImage? = nil
    @Published public var showPhotoPreviewSheet: Bool = false
    @Published public var showOpticalLensModal: Bool = false
    @Published public var showPrintSheetModal: Bool = false

    // Dependencies
    private let registry = FilterRegistry.shared
    private let pipeline = FilterPipeline.shared
    private let cameraService = CameraService.shared
    private let segmentationService = SegmentationService.shared
    private let haptics = HapticFeedbackManager.shared

    public init() {
        self.availableOpticalFilters = registry.opticalFilters()
        onCameraCategoryChanged()
    }

    // MARK: - Camera Switching
    public func selectCategory(_ category: CameraCategory) {
        guard category != selectedCategory else { return }
        selectedCategory = category
        haptics.dialTick()
    }

    private func onCameraCategoryChanged() {
        let filters = registry.filters(for: selectedCategory)
        self.availableFilters = filters
        if let first = filters.first {
            self.selectedFilterId = first.id
        }
    }

    public var activeFilter: any CameraFilter {
        if let found = availableFilters.first(where: { $0.id == selectedFilterId }) {
            return found
        }
        return registry.defaultFilter(for: selectedCategory)
    }

    public var activeOpticalFilter: (any OpticalFilter)? {
        guard let optId = selectedOpticalFilterId else { return nil }
        return registry.opticalFilter(id: optId)
    }

    public func selectFilter(id: String) {
        selectedFilterId = id
        haptics.buttonClick()
    }

    public func toggleOpticalFilter(id: String) {
        if selectedOpticalFilterId == id {
            selectedOpticalFilterId = nil
        } else {
            selectedOpticalFilterId = id
        }
        haptics.buttonClick()
    }

    public func selectPersonalColor(_ swatch: PersonalColorSwatch) {
        selectedPersonalColor = swatch
        haptics.buttonClick()
    }

    // MARK: - Shutter Action
    public func triggerShutter() {
        haptics.shutterImpact()
        isShutterFlashing = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
            self?.isShutterFlashing = false
        }

        cameraService.capturePhoto { [weak self] rawImage in
            guard let self = self, let raw = rawImage else { return }

            Task { @MainActor in
                var matte: CIImage? = nil
                var bgHex: String? = nil

                if self.selectedCategory == .sihyunhada && self.isLiveMattingEnabled {
                    matte = self.segmentationService.generateMatte(from: raw)
                    bgHex = self.selectedPersonalColor.hex
                }

                let processedCI = self.pipeline.process(
                    inputImage: raw,
                    filter: self.activeFilter,
                    opticalFilter: self.activeOpticalFilter,
                    opticalStrength: self.opticalStrength,
                    filterIntensity: self.filterIntensity,
                    backgroundMatte: matte,
                    backgroundColorHex: bgHex
                )

                if let cgImage = self.pipeline.render(image: processedCI) {
                    self.lastCapturedPhoto = cgImage
                    self.showPhotoPreviewSheet = true
                    self.haptics.successNotification()
                }
            }
        }
    }

    public func flipCamera() {
        cameraService.flipCamera()
        haptics.buttonClick()
    }
}
