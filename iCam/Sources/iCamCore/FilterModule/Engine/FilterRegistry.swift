import Foundation
import CoreImage

/// Central modular registry for all camera filters and optical filters.
/// Designed for maximum extensibility and maintainability.
public final class FilterRegistry: @unchecked Sendable {
    public static let shared = FilterRegistry()

    private let lock = NSLock()
    private var registeredFilters: [String: any CameraFilter] = [:]
    private var filtersByCategory: [CameraCategory: [any CameraFilter]] = [:]
    private var registeredOpticalFilters: [String: any OpticalFilter] = [:]
    private var opticalFilterOrder: [String] = []

    public init() {
        registerBuiltInFilters()
    }

    // MARK: - Registration API

    /// Register a single camera filter
    public func register(filter: any CameraFilter) {
        lock.lock()
        defer { lock.unlock() }

        registeredFilters[filter.id] = filter
        var list = filtersByCategory[filter.cameraCategory] ?? []
        if let idx = list.firstIndex(where: { $0.id == filter.id }) {
            list[idx] = filter
        } else {
            list.append(filter)
        }
        filtersByCategory[filter.cameraCategory] = list
    }

    /// Register multiple filters
    public func register(filters: [any CameraFilter]) {
        for f in filters {
            register(filter: f)
        }
    }

    /// Register an optical lens filter
    public func register(opticalFilter: any OpticalFilter) {
        lock.lock()
        defer { lock.unlock() }

        registeredOpticalFilters[opticalFilter.id] = opticalFilter
        if !opticalFilterOrder.contains(opticalFilter.id) {
            opticalFilterOrder.append(opticalFilter.id)
        }
    }

    // MARK: - Query API

    /// Retrieve all filters for a given camera category
    public func filters(for category: CameraCategory) -> [any CameraFilter] {
        lock.lock()
        defer { lock.unlock() }
        return filtersByCategory[category] ?? []
    }

    /// Get filter by ID
    public func filter(id: String) -> (any CameraFilter)? {
        lock.lock()
        defer { lock.unlock() }
        return registeredFilters[id]
    }

    /// Default filter for a camera category
    public func defaultFilter(for category: CameraCategory) -> any CameraFilter {
        lock.lock()
        defer { lock.unlock() }
        if let first = filtersByCategory[category]?.first {
            return first
        }
        // Fallback dummy
        return DefaultPassThroughFilter(category: category)
    }

    /// All registered optical filters
    public func opticalFilters() -> [any OpticalFilter] {
        lock.lock()
        defer { lock.unlock() }
        return opticalFilterOrder.compactMap { registeredOpticalFilters[$0] }
    }

    /// Optical filter by ID
    public func opticalFilter(id: String) -> (any OpticalFilter)? {
        lock.lock()
        defer { lock.unlock() }
        return registeredOpticalFilters[id]
    }

    // MARK: - Built-in Registration
    private func registerBuiltInFilters() {
        // Canon IXY Pack
        register(filters: CanonIXYFilterPack.allFilters)

        // Sony Handycam Pack
        register(filters: SonyHandycamFilterPack.allFilters)

        // Sony Cyber-shot Pack
        register(filters: SonyCybershotFilterPack.allFilters)

        // Fuji Instax Pack
        register(filters: FujiInstaxFilterPack.allFilters)

        // Color Studio Pack (Personal Color)
        register(filters: ColorStudioFilterPack.allFilters)

        // Passport ID Pack
        register(filters: PassportIDFilterPack.allFilters)

        // Olympus μ [mju:] II Pack
        register(filters: OlympusMjuFilterPack.allFilters)

        // Contax T2 Pack
        register(filters: ContaxT2FilterPack.allFilters)

        // Ricoh GR Digital Pack
        register(filters: RicohGRFilterPack.allFilters)

        // Leica M Pack
        register(filters: LeicaMFilterPack.allFilters)

        // 80s City Pop Pack
        register(filters: CityPopFilterPack.allFilters)

        // Old Analog Film Pack
        register(filters: OldFilmFilterPack.allFilters)

        // Hasselblad 500C/M Pack
        register(filters: HasselbladFilterPack.allFilters)

        // Polaroid SX-70 Pack
        register(filters: PolaroidSX70FilterPack.allFilters)

        // Fuji QuickSnap Pack (1986 Japanese Bubble Economy)
        register(filters: FujiQuickSnapFilterPack.allFilters)

        // Kyocera Samurai X3.0 Pack (1988 Cyber Half-Frame SLR)
        register(filters: KyoceraSamuraiFilterPack.allFilters)

        // Optical Lenses Pack
        for opt in OpticalLensFilterPack.allFilters {
            register(opticalFilter: opt)
        }
    }
}

/// Fallback pass-through filter
public struct DefaultPassThroughFilter: CameraFilter {
    public let id: String
    public let name: String = "Standard Pass"
    public let localizedName: String = "표준 패스스루"
    public let cameraCategory: CameraCategory
    public let filterDescription: String = "기본 무보정 필터"
    public let iconName: String = "camera"

    public init(category: CameraCategory) {
        self.cameraCategory = category
        self.id = "\(category.rawValue)_default"
    }

    public func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
        return inputImage
    }
}
