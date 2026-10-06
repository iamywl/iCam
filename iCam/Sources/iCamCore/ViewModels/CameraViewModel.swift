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

    // Color Studio Live Background State
    @Published public var selectedPersonalColor: PersonalColorSwatch = PersonalColorPalette.best8[0]
    @Published public var studioSubjectName: String = "Portrait"
    @Published public var isLiveMattingEnabled: Bool = true

    // Passport State
    @Published public var selectedPassportSpec: PassportSpec = PassportSpec.standardSpecs[0]
    @Published public var showPassportGuideLines: Bool = true

    // Camera Controls & QuickTake Video
    @Published public var isFlashEnabled: Bool = false
    @Published public var isGridEnabled: Bool = true
    @Published public var timerDuration: Int = 0 // 0, 3, 10
    @Published public var isShutterFlashing: Bool = false
    @Published public var isQuickTakeRecording: Bool = false
    @Published public var recordingDurationSeconds: Int = 0

    // Captured Result & Gallery
    @Published public var lastCapturedPhoto: CGImage? = nil
    @Published public var galleryItems: [GalleryItem] = []
    @Published public var showPhotoPreviewSheet: Bool = false
    @Published public var showOpticalLensModal: Bool = false
    @Published public var showPrintSheetModal: Bool = false
    @Published public var showGalleryModal: Bool = false
    @Published public var showCameraBagModal: Bool = false
    @Published public var selectedCameraGroup: CameraGroup = .all

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

    // MARK: - Camera Switching (4-Tier Ergonomic Architecture)
    public func selectCategory(_ category: CameraCategory) {
        guard category != selectedCategory else { return }
        selectedCategory = category
        selectedCameraGroup = category.group
        haptics.dialTick()
    }

    public func switchNextCamera() {
        let allCases = CameraCategory.allCases
        guard let currentIndex = allCases.firstIndex(of: selectedCategory) else { return }
        let nextIndex = (currentIndex + 1) % allCases.count
        selectCategory(allCases[nextIndex])
    }

    public func switchPrevCamera() {
        let allCases = CameraCategory.allCases
        guard let currentIndex = allCases.firstIndex(of: selectedCategory) else { return }
        let prevIndex = (currentIndex - 1 + allCases.count) % allCases.count
        selectCategory(allCases[prevIndex])
    }

    public func selectGroup(_ group: CameraGroup) {
        selectedCameraGroup = group
        guard group != .all else { return }
        let matching = CameraCategory.allCases.filter { $0.group == group }
        guard let first = matching.first else { return }
        if !matching.contains(selectedCategory) {
            selectCategory(first)
        } else if let currIdx = matching.firstIndex(of: selectedCategory) {
            let nextIdx = (currIdx + 1) % matching.count
            selectCategory(matching[nextIdx])
        }
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

                if self.selectedCategory == .colorStudio && self.isLiveMattingEnabled {
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

                    // Generate rich EXIF metadata
                    let exif = ExifMetadata(
                        cameraName: self.selectedCategory.displayName,
                        categoryRaw: self.selectedCategory.rawValue,
                        lensModel: self.lensModelForCategory(self.selectedCategory),
                        filterName: self.activeFilter.name,
                        filterIntensity: self.filterIntensity,
                        opticalLensName: self.activeOpticalFilter?.name,
                        opticalStrength: self.activeOpticalFilter != nil ? self.opticalStrength : nil,
                        shutterSpeed: self.simulatedShutterSpeed(),
                        aperture: self.simulatedAperture(),
                        iso: self.simulatedISO(),
                        focalLength: self.simulatedFocalLength(),
                        flashFired: self.isFlashEnabled,
                        captureDate: Date(),
                        width: cgImage.width,
                        height: cgImage.height
                    )

                    let galleryItem = GalleryItem(image: cgImage, metadata: exif)
                    self.galleryItems.insert(galleryItem, at: 0)

                    self.showPhotoPreviewSheet = true
                    self.haptics.successNotification()
                }
            }
        }
    }

    // MARK: - QuickTake Long-Press Live Video Recording
    public func startQuickTakeRecording() {
        guard !isQuickTakeRecording else { return }
        isQuickTakeRecording = true
        recordingDurationSeconds = 0
        haptics.buttonClick()
    }

    public func stopQuickTakeRecording() {
        guard isQuickTakeRecording else { return }
        isQuickTakeRecording = false
        haptics.successNotification()
    }

    public func deleteGalleryItem(id: UUID) {
        galleryItems.removeAll { $0.id == id }
        haptics.buttonClick()
    }

    public func openGallery() {
        showGalleryModal = true
        haptics.buttonClick()
    }

    public func flipCamera() {
        cameraService.flipCamera()
        haptics.buttonClick()
    }

    // MARK: - EXIF Optics Helper Simulators
    private func lensModelForCategory(_ cat: CameraCategory) -> String {
        switch cat {
        case .canonIXY: return "Canon Zoom Lens 5.8-17.4mm f/2.8-4.9"
        case .sonyHandycam: return "Carl Zeiss Vario-Sonnar 3.7-37mm f/1.8"
        case .sonyCybershot: return "Carl Zeiss Vario-Tessar 3x Zoom f/2.8"
        case .fujiInstax: return "Fujinon 60mm f/12.7 Instant Lens"
        case .colorStudio: return "Portrait Studio Prime 85mm f/1.4"
        case .passportID: return "Official Spec Studio Prime 50mm f/4.0"
        case .olympusMju: return "Olympus Lens 35mm f/2.8 4 Elements"
        case .contaxT2: return "Carl Zeiss Sonnar 38mm f/2.8 T*"
        case .ricohGR: return "GR Lens 28mm f/2.8 High-Res"
        case .leicaM: return "Leica Summilux-M 50mm f/1.4 ASPH."
        case .cityPop80s: return "Retro Cine 50mm f/1.8 Amber Coated"
        case .oldFilm: return "Vintage Prime 35mm f/2.0 Halation Coated"
        case .hasselblad: return "Carl Zeiss Planar 80mm f/2.8 T* CB"
        case .polaroidSX70: return "Polaroid 116mm f/8 4-Element Glass"
        case .fujiQuickSnap: return "Fujinon 32mm f/11 Plastic Meniscus Lens"
        case .kyoceraSamurai: return "Yashica Zoom 25-75mm f/3.5-4.3 Macro"
        }
    }

    private func simulatedShutterSpeed() -> String {
        switch selectedCategory {
        case .sonyHandycam: return "1/60s"
        case .ricohGR: return "1/500s"
        case .leicaM: return "1/1000s"
        case .hasselblad, .kyoceraSamurai: return "1/250s"
        case .fujiQuickSnap: return "1/100s"
        default: return "1/125s"
        }
    }

    private func simulatedAperture() -> String {
        switch selectedCategory {
        case .leicaM: return "f/1.4"
        case .fujiQuickSnap: return "f/11"
        case .kyoceraSamurai: return "f/3.5"
        case .contaxT2, .olympusMju, .hasselblad, .canonIXY: return "f/2.8"
        case .polaroidSX70: return "f/8.0"
        default: return "f/2.8"
        }
    }

    private func simulatedISO() -> String {
        switch selectedCategory {
        case .oldFilm: return "ISO 800"
        case .fujiQuickSnap, .ricohGR, .polaroidSX70: return "ISO 400"
        default: return "ISO 100"
        }
    }

    private func simulatedFocalLength() -> String {
        switch selectedCategory {
        case .hasselblad: return "80mm eq."
        case .ricohGR: return "28mm eq."
        case .fujiQuickSnap: return "32mm eq."
        case .leicaM, .colorStudio, .passportID: return "50mm eq."
        case .polaroidSX70: return "116mm eq."
        default: return "35mm eq."
        }
    }
}
