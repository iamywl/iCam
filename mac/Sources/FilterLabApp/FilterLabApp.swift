import SwiftUI
import AppKit
import UniformTypeIdentifiers
import FilterEngine

@main
struct FilterLabApp: App {
    @StateObject private var store = FilterLabStore()
    @NSApplicationDelegateAdaptor(FilterLabAppDelegate.self) private var appDelegate

    var body: some Scene {
        WindowGroup("FilterLab — Persona Camera Darkroom") {
            FilterLabRootView(store: store)
                .preferredColorScheme(.dark)
                .frame(minWidth: 1060, minHeight: 700)
                .onAppear {
                    appDelegate.onTerminate = {
                        store.cameraService.stop()
                    }
                }
        }
        .windowStyle(.titleBar)
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("Open Test Photo…") { store.openPhotosDialog() }
                    .keyboardShortcut("o", modifiers: .command)
                Button("Paste Image from Clipboard") { store.pasteFromClipboard() }
                    .keyboardShortcut("v", modifiers: .command)
            }
            CommandMenu("Darkroom View") {
                Button("Contact Grid") { store.viewMode = .grid }
                    .keyboardShortcut("1", modifiers: .command)
                Button("1:1 Split Compare") { store.viewMode = .compare }
                    .keyboardShortcut("2", modifiers: .command)
                Button("Solo Inspection") { store.viewMode = .solo }
                    .keyboardShortcut("3", modifiers: .command)
                Button("Live Mac / Continuity Camera") { store.viewMode = .camera }
                    .keyboardShortcut("4", modifiers: .command)
                Divider()
                Button("Toggle Stock Bypass") { store.isBypassed.toggle() }
                    .keyboardShortcut(.space, modifiers: [])
                Button("Toggle Blind A/B Test") { store.toggleBlindShuffle() }
                    .keyboardShortcut("b", modifiers: .command)
                Button("Reset Zoom & Pan") { store.resetZoomAndPan() }
                    .keyboardShortcut("r", modifiers: .command)
            }
            CommandMenu("Export & Spec") {
                Button("Export Full-Resolution Photo…") { store.exportFullResActiveImage() }
                    .keyboardShortcut("e", modifiers: .command)
                Button("Export Contact Sheet…") { store.exportContactSheetPNG() }
                    .keyboardShortcut("e", modifiers: [.command, .shift])
                Button("Save Changes to shared/recipes.json") { store.saveCatalogToCanonicalSharedJSON() }
                    .keyboardShortcut("s", modifiers: .command)
                Button("Export 3D .cube LUT…") { store.exportActiveCubeLUT() }
                    .keyboardShortcut("l", modifiers: [.command, .shift])
            }
        }
    }
}

final class FilterLabAppDelegate: NSObject, NSApplicationDelegate {
    var onTerminate: (() -> Void)?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApplication.shared.setActivationPolicy(.regular)
        NSApplication.shared.activate(ignoringOtherApps: true)
    }

    func applicationWillTerminate(_ notification: Notification) {
        onTerminate?()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }
}

struct FilterLabRootView: View {
    @ObservedObject var store: FilterLabStore
    @State private var isDropTargeted = false

    var body: some View {
        VStack(spacing: 0) {
            topToolbar
                .background(DarkroomTheme.chromeBg)
                .overlay(Rectangle().frame(height: 1).foregroundColor(DarkroomTheme.hairline), alignment: .bottom)

            HStack(spacing: 0) {
                mainWorkspaceCanvas
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

                InspectorSidebarView(store: store)
            }

            if let status = store.statusBanner {
                HStack {
                    Text(status)
                        .font(.system(size: 10.5, design: .monospaced))
                        .foregroundColor(DarkroomTheme.textSecondary)
                    Spacer()
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 5)
                .background(DarkroomTheme.chromeBg)
                .overlay(Rectangle().frame(height: 1).foregroundColor(DarkroomTheme.hairline), alignment: .top)
            }
        }
        .background(DarkroomTheme.chromeBg)
        .onDrop(of: [.fileURL, .image], isTargeted: $isDropTargeted) { providers in
            handleDrop(providers: providers)
        }
        .overlay(
            RoundedRectangle(cornerRadius: 2)
                .strokeBorder(DarkroomTheme.hairlineDropHover, lineWidth: isDropTargeted ? 2.5 : 0)
        )
    }

    private var topToolbar: some View {
        HStack(spacing: 14) {
            Text("FILTERLAB")
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .tracking(1.6)
                .foregroundColor(DarkroomTheme.textPrimary)

            Picker("", selection: $store.viewMode) {
                ForEach(LabViewMode.allCases) { mode in
                    Text(mode.title).tag(mode)
                }
            }
            .pickerStyle(.segmented)
            .frame(maxWidth: 420)
            .controlSize(.small)

            Spacer()

            // Quick keyboard parity strip (0 Stock, 1..15 Aesthetics)
            HStack(spacing: 3) {
                quickKeyChip(label: "0", active: store.isBypassed) {
                    store.selectAestheticByIndex(0)
                }
                ForEach(Array(store.catalog.aesthetics.enumerated()), id: \.element.id) { idx, item in
                    quickKeyChip(label: "\(idx + 1)", active: !store.isBypassed && store.activeId == item.id) {
                        store.selectAestheticByIndex(idx + 1)
                    }
                    .help("\(item.shortLabel) — \(item.koreanName)")
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 9)
    }

    private func quickKeyChip(label: String, active: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(.system(size: 10.5, weight: active ? .bold : .regular, design: .monospaced))
                .foregroundColor(active ? DarkroomTheme.chromeBg : DarkroomTheme.textSecondary)
                .frame(width: 22, height: 22)
                .background(active ? DarkroomTheme.silverAccent : DarkroomTheme.surfaceBg)
                .cornerRadius(4)
                .overlay(RoundedRectangle(cornerRadius: 4).strokeBorder(DarkroomTheme.hairline, lineWidth: 0.75))
        }
        .buttonStyle(.plain)
    }

    @ViewBuilder
    private var mainWorkspaceCanvas: some View {
        switch store.viewMode {
        case .grid:
            ContactSheetView(store: store)
        case .compare:
            SplitCompareView(store: store)
        case .solo, .camera:
            SoloView(store: store)
        }
    }

    private func handleDrop(providers: [NSItemProvider]) -> Bool {
        var accepted = false
        for provider in providers {
            if provider.hasItemConformingToTypeIdentifier(UTType.fileURL.identifier) {
                accepted = true
                provider.loadItem(forTypeIdentifier: UTType.fileURL.identifier, options: nil) { item, _ in
                    if let data = item as? Data, let url = URL(dataRepresentation: data, relativeTo: nil) {
                        Task { @MainActor in
                            store.loadFiles(urls: [url])
                        }
                    } else if let url = item as? URL {
                        Task { @MainActor in
                            store.loadFiles(urls: [url])
                        }
                    }
                }
            } else if provider.canLoadObject(ofClass: NSImage.self) {
                accepted = true
                provider.loadObject(ofClass: NSImage.self) { obj, _ in
                    if let img = obj as? NSImage, let tiff = img.tiffRepresentation, let ci = CIImage(data: tiff) {
                        Task { @MainActor in
                            store.addCIImage(ci, name: "Dropped Image")
                        }
                    }
                }
            }
        }
        return accepted
    }
}
