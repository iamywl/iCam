import SwiftUI
import AppKit
import CoreImage
import ImageIO
import UniformTypeIdentifiers
import FilterEngine

enum LabViewMode: Int, CaseIterable, Identifiable {
    case grid = 1
    case compare = 2
    case solo = 3
    case camera = 4

    var id: Int { rawValue }

    var title: String {
        switch self {
        case .grid: return "1 · Contact Grid"
        case .compare: return "2 · Split"
        case .solo: return "3 · Solo"
        case .camera: return "4 · Live Cam"
        }
    }
}

enum CompareLayout: String, CaseIterable, Identifiable {
    case splitCurtain = "Curtain"
    case sideBySide = "2-Up"

    var id: String { rawValue }
}

struct TestPhoto: Identifiable {
    let id: UUID
    let name: String
    let fullImage: CIImage
    let previewImage: CIImage
    let thumbImage: CIImage
    let cgPreviewIcon: CGImage?
    let aspectRatio: CGFloat
    let seed: UInt32
}

struct GridTileRender: Identifiable {
    let id: String
    let label: String
    let moodCue: String
    let recipe: AestheticRecipe
    let isStock: Bool
    var image: CGImage?
}

@MainActor
final class FilterLabStore: ObservableObject {
    @Published var catalog: RecipeCatalog
    @Published var activeId: String = "01_vintage_35mm"
    @Published var compareLeftId: String = "stock"
    @Published var compareRightId: String = "01_vintage_35mm"
    @Published var viewMode: LabViewMode = .grid
    @Published var compareLayout: CompareLayout = .splitCurtain
    @Published var splitFraction: CGFloat = 0.5
    @Published var blindShuffleEnabled: Bool = false
    @Published var blindRevealAnswer: Bool = false
    @Published var blindPairOrder: (left: String, right: String) = ("stock", "01_vintage_35mm")

    @Published var isBypassed: Bool = false
    @Published var debugMaskMode: DebugMaskMode = .normal
    @Published var zoomScale: CGFloat = 1.0
    @Published var panOffset: CGSize = .zero

    @Published var photos: [TestPhoto] = []
    @Published var selectedPhotoID: UUID?
    @Published var gridTiles: [GridTileRender] = []
    @Published var isRenderingGrid: Bool = false

    @Published var liveCameraFrame: CIImage?
    @Published var statusBanner: String?

    static let publicWebCameraURL = "https://iamywl.github.io/iCam/"

    let processor: MetalFilterProcessor
    let cameraService = CameraCaptureService()
    private var gridRenderTask: Task<Void, Never>?
    private var gridDebounceTask: Task<Void, Never>?
    private var liveFramePending = false

    init() {
        do {
            self.processor = try MetalFilterProcessor()
        } catch {
            fatalError("Metal GPU unavailable on this Mac: \(error)")
        }

        do {
            self.catalog = try RecipeLoader.loadCatalog()
        } catch {
            self.catalog = RecipeCatalog(schemaVersion: 2, updatedAt: "", aesthetics: [.stockBaseline])
            self.statusBanner = "recipes.json 로드 실패: \(error.localizedDescription)"
        }

        if let first = catalog.aesthetics.first {
            self.activeId = first.id
            self.compareRightId = first.id
        }

        cameraService.onFrame = { [weak self] ciImage in
            Task { @MainActor [weak self] in
                guard let self else { return }
                self.liveCameraFrame = ciImage
            }
        }

        loadCalibrationPortraitSample()
    }

    var selectedPhoto: TestPhoto? {
        photos.first(where: { $0.id == selectedPhotoID }) ?? photos.first
    }

    var activeRecipe: AestheticRecipe {
        if activeId == "stock" { return .stockBaseline }
        return catalog.aesthetics.first(where: { $0.id == activeId }) ?? catalog.aesthetics.first ?? .stockBaseline
    }

    var activeBindingRecipe: Binding<AestheticRecipe> {
        Binding(
            get: { [weak self] in
                self?.activeRecipe ?? .stockBaseline
            },
            set: { [weak self] updated in
                guard let self else { return }
                if let idx = self.catalog.aesthetics.firstIndex(where: { $0.id == updated.id }) {
                    self.catalog.aesthetics[idx] = updated
                    self.scheduleGridRefresh()
                }
            }
        )
    }

    func recipe(for id: String) -> AestheticRecipe {
        if id == "stock" { return .stockBaseline }
        return catalog.aesthetics.first(where: { $0.id == id }) ?? .stockBaseline
    }

    func effectiveRecipe(for id: String) -> AestheticRecipe {
        isBypassed ? .stockBaseline : recipe(for: id)
    }

    func selectAestheticByIndex(_ keyNumber: Int) {
        if keyNumber == 0 {
            isBypassed.toggle()
            return
        }
        isBypassed = false
        let idx = keyNumber - 1
        guard catalog.aesthetics.indices.contains(idx) else { return }
        let chosen = catalog.aesthetics[idx]
        activeId = chosen.id
        compareRightId = chosen.id
        if blindShuffleEnabled {
            randomizeBlindPair()
        }
    }

    func toggleBlindShuffle() {
        blindShuffleEnabled.toggle()
        blindRevealAnswer = false
        if blindShuffleEnabled {
            randomizeBlindPair()
        }
    }

    func randomizeBlindPair() {
        blindRevealAnswer = false
        if Bool.random() {
            blindPairOrder = (left: "stock", right: activeId)
        } else {
            blindPairOrder = (left: activeId, right: "stock")
        }
    }

    func resetZoomAndPan() {
        zoomScale = 1.0
        panOffset = .zero
    }

    // MARK: - Test Photo Management

    func loadCalibrationPortraitSample() {
        let w = 960, h = 720
        guard let cg = Self.makeStudioCalibrationPhoto(width: w, height: h) else { return }
        addCGImage(cg, name: "Calibration Portrait & Neon")
    }

    func openPhotosDialog() {
        let panel = NSOpenPanel()
        panel.allowsMultipleSelection = true
        panel.canChooseDirectories = false
        panel.allowedContentTypes = [.image, .jpeg, .png, .heic, .tiff, .rawImage]
        if panel.runModal() == .OK {
            loadFiles(urls: panel.urls)
        }
    }

    func pasteFromClipboard() {
        let pb = NSPasteboard.general
        if let urls = pb.readObjects(forClasses: [NSURL.self], options: [.urlReadingFileURLsOnly: true]) as? [URL], !urls.isEmpty {
            loadFiles(urls: urls)
            return
        }
        if let nsImage = NSImage(pasteboard: pb),
           let tiff = nsImage.tiffRepresentation,
           let ci = CIImage(data: tiff) {
            addCIImage(ci, name: "Pasted Image \(photos.count + 1)")
        } else {
            statusBanner = "클립보드에 이미지가 없습니다."
        }
    }

    func loadFiles(urls: [URL]) {
        for url in urls {
            if let ci = CIImage(contentsOf: url, options: [.applyOrientationProperty: true]) {
                addCIImage(ci, name: url.lastPathComponent)
            }
        }
    }

    func captureLiveCameraSnapshot() {
        guard let ci = cameraService.grabLatestCIImage() else {
            statusBanner = "아직 카메라 프레임이 수신되지 않았습니다."
            return
        }
        let oriented = ci.oriented(.up)
        addCIImage(oriented, name: "MacCam \(formattedTimestamp())")
        viewMode = .grid
    }

    func addCGImage(_ cg: CGImage, name: String) {
        addCIImage(CIImage(cgImage: cg), name: name)
    }

    func addCIImage(_ fullCI: CIImage, name: String) {
        let normalized = normalizeOrigin(fullCI)
        guard normalized.extent.width >= 2, normalized.extent.height >= 2 else { return }
        let previewCI = downsampleCI(normalized, maxDimension: 1500)
        let thumbCI = downsampleCI(normalized, maxDimension: 520)
        let iconCG = try? processor.renderCGImage(input: thumbCI, recipe: .stockBaseline, maxDimension: 140, seed: 1)

        let aspect = max(0.2, min(5.0, normalized.extent.width / normalized.extent.height))
        let seedVal = UInt32(truncatingIfNeeded: name.hashValue & 0xFFFF) + 7
        let photo = TestPhoto(
            id: UUID(),
            name: name,
            fullImage: normalized,
            previewImage: previewCI,
            thumbImage: thumbCI,
            cgPreviewIcon: iconCG,
            aspectRatio: aspect,
            seed: seedVal
        )
        photos.insert(photo, at: 0)
        selectedPhotoID = photo.id
        refreshGridImmediately()
        statusBanner = "사진 로드됨: \(name) (\(Int(normalized.extent.width))×\(Int(normalized.extent.height)))"
    }

    func selectPhoto(_ id: UUID) {
        selectedPhotoID = id
        resetZoomAndPan()
        refreshGridImmediately()
    }

    func removePhoto(_ id: UUID) {
        photos.removeAll(where: { $0.id == id })
        if selectedPhotoID == id {
            selectedPhotoID = photos.first?.id
        }
        refreshGridImmediately()
    }

    // MARK: - 3x3 Grid Rendering

    func scheduleGridRefresh() {
        gridDebounceTask?.cancel()
        gridDebounceTask = Task { [weak self] in
            try? await Task.sleep(nanoseconds: 70_000_000)
            guard !Task.isCancelled else { return }
            self?.refreshGridImmediately()
        }
    }

    func refreshGridImmediately() {
        gridRenderTask?.cancel()
        guard let photo = selectedPhoto else {
            gridTiles = []
            return
        }

        let recipes: [(id: String, label: String, cue: String, recipe: AestheticRecipe, isStock: Bool)] =
            [("stock", "00 STOCK", "Original Unfiltered", AestheticRecipe.stockBaseline, true)]
            + catalog.aesthetics.map { ($0.id, $0.shortLabel, $0.moodCue, $0, false) }

        if gridTiles.count != recipes.count {
            gridTiles = recipes.map {
                GridTileRender(id: $0.id, label: $0.label, moodCue: $0.cue, recipe: $0.recipe, isStock: $0.isStock, image: nil)
            }
        }

        let processor = self.processor
        let thumbCI = photo.thumbImage
        let seed = photo.seed
        let mask = debugMaskMode
        isRenderingGrid = true

        gridRenderTask = Task.detached(priority: .userInitiated) { [weak self] in
            var rendered: [GridTileRender] = []
            rendered.reserveCapacity(recipes.count)
            for item in recipes {
                if Task.isCancelled { return }
                let cg = try? processor.renderCGImage(
                    input: thumbCI,
                    recipe: item.recipe,
                    maxDimension: 480,
                    seed: seed,
                    debugMaskMode: mask
                )
                rendered.append(GridTileRender(
                    id: item.id,
                    label: item.label,
                    moodCue: item.cue,
                    recipe: item.recipe,
                    isStock: item.isStock,
                    image: cg
                ))
            }
            if Task.isCancelled { return }
            let finalTiles = rendered
            await MainActor.run { [weak self] in
                guard let self else { return }
                self.gridTiles = finalTiles
                self.isRenderingGrid = false
            }
        }
    }

    // MARK: - Exports & Persistence

    func exportFullResActiveImage() {
        guard let photo = selectedPhoto else { return }
        let recipe = effectiveRecipe(for: activeId)
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.jpeg, .png]
        panel.nameFieldStringValue = "\(sanitizedBaseName(photo.name))_\(recipe.id).jpg"
        guard panel.runModal() == .OK, let url = panel.url else { return }

        do {
            let cg = try processor.renderCGImage(input: photo.fullImage, recipe: recipe, seed: photo.seed, debugMaskMode: debugMaskMode)
            try writeCGImage(cg, to: url)
            statusBanner = "고해상도 내보내기 완료: \(url.lastPathComponent)"
        } catch {
            statusBanner = "내보내기 실패: \(error.localizedDescription)"
        }
    }

    func exportContactSheetPNG() {
        guard let photo = selectedPhoto else { return }
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.png]
        panel.nameFieldStringValue = "\(sanitizedBaseName(photo.name))_contact_sheet.png"
        guard panel.runModal() == .OK, let url = panel.url else { return }

        let all = [("00 STOCK", AestheticRecipe.stockBaseline)] + catalog.aesthetics.map { ($0.shortLabel, $0) }
        let cellW = all.count <= 9 ? 540 : 440
        let aspect = photo.aspectRatio
        let cellH = max(200, Int((Double(cellW) / Double(aspect)).rounded()))

        do {
            var images: [(String, CGImage)] = []
            for (label, recipe) in all {
                let cg = try processor.renderCGImage(input: photo.previewImage, recipe: recipe, maxDimension: cellW, seed: photo.seed)
                images.append((label, cg))
            }
            try renderContactSheetImage(tiles: images, cellW: cellW, cellH: cellH, to: url)
            statusBanner = "밀착 시트 저장 완료 (\(images.count)장): \(url.lastPathComponent)"
        } catch {
            statusBanner = "시트 저장 실패: \(error.localizedDescription)"
        }
    }

    func saveCatalogToCanonicalSharedJSON() {
        let canonical = RecipeLoader.canonicalSharedRecipesURL()
        let targetURL: URL
        if let canonical {
            targetURL = canonical
        } else {
            let panel = NSSavePanel()
            panel.allowedContentTypes = [.json]
            panel.nameFieldStringValue = "recipes.json"
            guard panel.runModal() == .OK, let chosen = panel.url else { return }
            targetURL = chosen
        }

        do {
            var copy = catalog
            copy.updatedAt = ISO8601DateFormatter().string(from: Date())
            catalog = copy
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.prettyPrinted, .withoutEscapingSlashes]
            let data = try encoder.encode(copy)
            try data.write(to: targetURL, options: .atomic)
            statusBanner = "레시피 저장 완료: \(targetURL.path)"
        } catch {
            statusBanner = "JSON 저장 실패: \(error.localizedDescription)"
        }
    }

    func exportActiveCubeLUT() {
        let recipe = activeRecipe
        let panel = NSSavePanel()
        panel.allowedContentTypes = [UTType(filenameExtension: "cube") ?? .plainText]
        panel.nameFieldStringValue = "\(recipe.id)_33x33x33.cube"
        guard panel.runModal() == .OK, let url = panel.url else { return }

        do {
            let cubeText = try LUTExporter.exportCubeLUT(processor: processor, recipe: recipe, dimension: 33)
            try cubeText.write(to: url, atomically: true, encoding: .utf8)
            statusBanner = "3D LUT (.cube) 내보내기 완료: \(url.lastPathComponent)"
        } catch {
            statusBanner = "LUT 내보내기 실패: \(error.localizedDescription)"
        }
    }

    // MARK: - Public Web Camera (GitHub Pages HTTPS — Zero Local Server)

    func buildPublicWebCameraURL(shareCurrentTuning: Bool) -> URL? {
        guard !isBypassed else {
            return URL(string: Self.publicWebCameraURL + "?aesthetic=stock")
        }
        guard shareCurrentTuning else {
            return URL(string: Self.publicWebCameraURL + "?aesthetic=\(activeId)")
        }
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.withoutEscapingSlashes]
        guard let data = try? encoder.encode(activeRecipe) else {
            return URL(string: Self.publicWebCameraURL)
        }
        let b64url = data.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
        return URL(string: "\(Self.publicWebCameraURL)#recipe=\(b64url)")
    }

    func openPublicWebCamera(shareCurrentTuning: Bool) {
        guard let url = buildPublicWebCameraURL(shareCurrentTuning: shareCurrentTuning) else { return }
        NSWorkspace.shared.open(url)
        statusBanner = shareCurrentTuning
            ? "퍼블릭 웹 카메라에 현재 튜닝 레시피 전달됨 (\(activeRecipe.shortLabel))"
            : "퍼블릭 웹 카메라 열림: \(Self.publicWebCameraURL)"
    }

    func copyPublicWebCameraURL(shareCurrentTuning: Bool) {
        guard let url = buildPublicWebCameraURL(shareCurrentTuning: shareCurrentTuning) else { return }
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(url.absoluteString, forType: .string)
        statusBanner = "퍼블릭 웹 카메라 링크 복사 완료 (iPhone/브라우저에서 바로 열기 가능)"
    }

    // MARK: - Helpers

    private func normalizeOrigin(_ ci: CIImage) -> CIImage {
        let o = ci.extent.origin
        if o.x != 0 || o.y != 0 {
            return ci.transformed(by: CGAffineTransform(translationX: -o.x, y: -o.y))
        }
        return ci
    }

    private func downsampleCI(_ ci: CIImage, maxDimension: CGFloat) -> CIImage {
        let maxSide = max(ci.extent.width, ci.extent.height)
        guard maxSide > maxDimension else { return ci }
        let scale = maxDimension / maxSide
        return normalizeOrigin(ci.transformed(by: CGAffineTransform(scaleX: scale, y: scale)))
    }

    private func sanitizedBaseName(_ name: String) -> String {
        let stem = (name as NSString).deletingPathExtension
        return stem.replacingOccurrences(of: " ", with: "_")
    }

    private func formattedTimestamp() -> String {
        let f = DateFormatter()
        f.dateFormat = "HHmmss"
        return f.string(from: Date())
    }

    private func writeCGImage(_ cg: CGImage, to url: URL) throws {
        let ext = url.pathExtension.lowercased()
        let type: UTType = (ext == "png") ? .png : .jpeg
        guard let dest = CGImageDestinationCreateWithURL(url as CFURL, type.identifier as CFString, 1, nil) else {
            throw NSError(domain: "FilterLab", code: 10, userInfo: [NSLocalizedDescriptionKey: "이미지 파일 생성 실패"])
        }
        let props: [CFString: Any] = (type == .jpeg) ? [kCGImageDestinationLossyCompressionQuality: 0.94] : [:]
        CGImageDestinationAddImage(dest, cg, props as CFDictionary)
        guard CGImageDestinationFinalize(dest) else {
            throw NSError(domain: "FilterLab", code: 11, userInfo: [NSLocalizedDescriptionKey: "이미지 저장 실패"])
        }
    }

    private func renderContactSheetImage(tiles: [(String, CGImage)], cellW: Int, cellH: Int, to url: URL) throws {
        guard !tiles.isEmpty else { return }
        let pad = 22
        let labelH = 26
        let cols = tiles.count <= 9 ? 3 : 4
        let rows = Int(ceil(Double(tiles.count) / Double(cols)))
        let sheetW = pad + cols * (cellW + pad)
        let sheetH = pad + rows * (cellH + labelH + pad)
        let cs = CGColorSpace(name: CGColorSpace.sRGB)!
        guard let ctx = CGContext(
            data: nil,
            width: sheetW,
            height: sheetH,
            bitsPerComponent: 8,
            bytesPerRow: 0,
            space: cs,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else { return }

        ctx.setFillColor(red: 24.0 / 255.0, green: 24.0 / 255.0, blue: 24.0 / 255.0, alpha: 1.0)
        ctx.fill(CGRect(x: 0, y: 0, width: sheetW, height: sheetH))

        let font = CTFontCreateWithName("Menlo-Regular" as CFString, 13, nil)
        let textColor = CGColor(srgbRed: 0.85, green: 0.85, blue: 0.88, alpha: 1.0)

        for (idx, item) in tiles.enumerated() {
            let col = idx % cols
            let row = idx / cols
            let x = CGFloat(pad + col * (cellW + pad))
            // CoreGraphics origin is bottom-left
            let topY = CGFloat(sheetH - pad - row * (cellH + labelH + pad))
            let imgRect = CGRect(x: x, y: topY - CGFloat(cellH), width: CGFloat(cellW), height: CGFloat(cellH))
            ctx.draw(item.1, in: imgRect)

            let attrStr = CFAttributedStringCreate(nil, item.0 as CFString, [
                kCTFontAttributeName: font,
                kCTForegroundColorAttributeName: textColor
            ] as CFDictionary)!
            let line = CTLineCreateWithAttributedString(attrStr)
            ctx.textPosition = CGPoint(x: x + 2, y: imgRect.minY - 18)
            CTLineDraw(line, ctx)
        }

        guard let sheetCG = ctx.makeImage() else { return }
        try writeCGImage(sheetCG, to: url)
    }

    /// Generates an optical portrait/sky/foliage/neon reference photo for zero-friction darkroom testing.
    private static func makeStudioCalibrationPhoto(width w: Int, height h: Int) -> CGImage? {
        var bytes = [UInt8](repeating: 255, count: w * h * 4)
        let cx = Float(w) * 0.44
        let cy = Float(h) * 0.44
        let faceRx = Float(w) * 0.145
        let faceRy = Float(h) * 0.195

        for y in 0..<h {
            let fy = Float(y) / Float(h)
            for x in 0..<w {
                let fx = Float(x) / Float(w)

                var r: Float, g: Float, b: Float
                // Background: upper twilight sky transitioning into warm/cool city night alley & right-hand trees
                if fy < 0.48 {
                    let skyGrad = fy / 0.48
                    r = 82 + 48 * skyGrad
                    g = 148 + 42 * skyGrad
                    b = 224 + 22 * (1 - skyGrad)
                    // Foliage crown on right side
                    let treeDist = hypot((fx - 0.84) * 1.4, fy - 0.24)
                    if treeDist < 0.30 {
                        let leaf = sin(fx * 95) * cos(fy * 110) * 18
                        r = max(25, 58 + leaf)
                        g = max(45, 134 + leaf * 1.2)
                        b = max(20, 56 + leaf * 0.7)
                    }
                } else {
                    // Architectural evening alley background
                    let shade = 1.0 - (fy - 0.48) * 0.45
                    r = 24 * shade
                    g = 28 * shade
                    b = 34 * shade
                }

                // Bright night street lamps (test Halation 04 & CCD vertical smear 03!)
                let lamps: [(Float, Float, Float)] = [(0.74, 0.58, 0.014), (0.83, 0.63, 0.011), (0.14, 0.61, 0.012)]
                for (lx, ly, rad) in lamps {
                    let d = hypot((fx - lx) * (Float(w) / Float(h)), fy - ly)
                    if d < rad * 3.0 {
                        let core = exp(-(d * d) / (2 * rad * rad * 0.42))
                        r = min(255, r + 250 * core)
                        g = min(255, g + 244 * core)
                        b = min(255, b + 226 * core)
                    }
                }

                // Portrait Torso: White Crisp Linen Collar / Shirt (test Highlight cleanliness!)
                let dxFace = (Float(x) - cx) / faceRx
                let dyBody = (Float(y) - (cy + faceRy * 1.35)) / (faceRy * 0.95)
                if dxFace * dxFace * 0.36 + dyBody * dyBody < 1.0 {
                    let fold = sin(fx * 28.0) * 6.0
                    r = 238 + fold
                    g = 238 + fold
                    b = 238 + fold
                }

                // Portrait Neck + Face oval with natural key-to-fill directional lighting
                let dyFace = (Float(y) - cy) / faceRy
                let distSq = dxFace * dxFace + dyFace * dyFace
                if distSq < 1.0 || (abs(dxFace) < 0.35 && Float(y) > cy && Float(y) < cy + faceRy * 1.2) {
                    let shadowMix = max(0, min(1, 0.74 - dxFace * 0.28 - dyFace * 0.14))
                    r = 126 + (222 - 126) * shadowMix
                    g = 90 + (174 - 90) * shadowMix
                    b = 74 + (146 - 74) * shadowMix

                    // Specular brow / cheek catchlight + warm cheeks
                    let cheek = exp(-((dxFace + 0.18) * (dxFace + 0.18) + (dyFace - 0.1) * (dyFace - 0.1)) / 0.12)
                    r = min(255, r + 10 * cheek)
                    g = min(255, g + 2 * cheek)

                    // Subtle natural hair silhouette on top
                    if dyFace < -0.52 {
                        r *= 0.22; g *= 0.19; b *= 0.18
                    }
                }

                let idx = (y * w + x) * 4
                bytes[idx] = UInt8(max(0, min(255, Int(r))))
                bytes[idx + 1] = UInt8(max(0, min(255, Int(g))))
                bytes[idx + 2] = UInt8(max(0, min(255, Int(b))))
                bytes[idx + 3] = 255
            }
        }
        let data = Data(bytes)
        let provider = CGDataProvider(data: data as CFData)!
        return CGImage(
            width: w, height: h,
            bitsPerComponent: 8, bitsPerPixel: 32, bytesPerRow: w * 4,
            space: CGColorSpace(name: CGColorSpace.sRGB)!,
            bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue),
            provider: provider, decode: nil, shouldInterpolate: true, intent: .defaultIntent
        )
    }
}
