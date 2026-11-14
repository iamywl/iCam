import SwiftUI
import AppKit
import FilterEngine

struct InspectorSidebarView: View {
    @ObservedObject var store: FilterLabStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                photoBatchSection
                dividerLine
                aestheticPickerSection
                dividerLine
                opticalTuningSection
                dividerLine
                debugMaskSection
                dividerLine
                exportAndSyncSection
            }
            .padding(14)
        }
        .frame(width: 296)
        .background(DarkroomTheme.surfaceBg)
        .overlay(Rectangle().frame(width: 1).foregroundColor(DarkroomTheme.hairline), alignment: .leading)
    }

    private var dividerLine: some View {
        Rectangle()
            .fill(DarkroomTheme.hairline)
            .frame(height: 1)
    }

    // MARK: - Test Photo Batch Filmstrip

    private var photoBatchSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("TEST PHOTOS")
                    .font(.system(size: 10.5, weight: .semibold, design: .monospaced))
                    .foregroundColor(DarkroomTheme.textSecondary)
                Spacer()
                Button("+ Open") { store.openPhotosDialog() }
                    .buttonStyle(.bordered)
                    .controlSize(.mini)
                Button("Paste") { store.pasteFromClipboard() }
                    .buttonStyle(.bordered)
                    .controlSize(.mini)
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(store.photos) { photo in
                        let isSelected = photo.id == store.selectedPhoto?.id
                        VStack(spacing: 3) {
                            ZStack {
                                DarkroomTheme.chromeBg
                                if let cg = photo.cgPreviewIcon {
                                    Image(nsImage: NSImage(cgImage: cg, size: NSSize(width: cg.width, height: cg.height)))
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                }
                            }
                            .frame(width: 56, height: 44)
                            .clipped()
                            .overlay(
                                Rectangle().strokeBorder(
                                    isSelected ? DarkroomTheme.silverAccent : DarkroomTheme.hairline,
                                    lineWidth: isSelected ? 1.5 : 0.75
                                )
                            )
                            Text(photo.name)
                                .font(.system(size: 9))
                                .foregroundColor(isSelected ? DarkroomTheme.textPrimary : DarkroomTheme.textMuted)
                                .lineLimit(1)
                                .frame(width: 56)
                        }
                        .contentShape(Rectangle())
                        .onTapGesture {
                            store.selectPhoto(photo.id)
                        }
                        .contextMenu {
                            if store.photos.count > 1 {
                                Button("Remove Photo") { store.removePhoto(photo.id) }
                            }
                        }
                    }
                }
            }
        }
    }

    // MARK: - 8 Aesthetic Preset Rail

    private var aestheticPickerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("AESTHETIC CURATION")
                .font(.system(size: 10.5, weight: .semibold, design: .monospaced))
                .foregroundColor(DarkroomTheme.textSecondary)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 6) {
                ForEach(store.catalog.aesthetics) { item in
                    let isSelected = !store.isBypassed && store.activeId == item.id
                    Button(action: {
                        store.isBypassed = false
                        store.activeId = item.id
                        store.compareRightId = item.id
                    }) {
                        HStack(spacing: 4) {
                            Text(item.shortLabel)
                                .font(.system(size: 10, weight: isSelected ? .semibold : .regular, design: .monospaced))
                                .lineLimit(1)
                            Spacer(minLength: 0)
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 6)
                        .foregroundColor(isSelected ? DarkroomTheme.chromeBg : DarkroomTheme.textPrimary)
                        .background(isSelected ? DarkroomTheme.silverAccent : DarkroomTheme.chromeBg)
                        .overlay(
                            RoundedRectangle(cornerRadius: 4)
                                .strokeBorder(DarkroomTheme.hairline, lineWidth: 0.75)
                        )
                        .cornerRadius(4)
                    }
                    .buttonStyle(.plain)
                }
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(store.activeRecipe.koreanName)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(DarkroomTheme.textPrimary)
                Text(store.activeRecipe.persona)
                    .font(.system(size: 10.5))
                    .foregroundColor(DarkroomTheme.textSecondary)
            }
            .padding(.top, 2)
        }
    }

    // MARK: - Live Optical & Color Science Sliders

    private var opticalTuningSection: some View {
        let r = store.activeBindingRecipe
        return VStack(alignment: .leading, spacing: 9) {
            Text("OPTICAL & FILM RECIPE")
                .font(.system(size: 10.5, weight: .semibold, design: .monospaced))
                .foregroundColor(DarkroomTheme.textSecondary)

            tuningSlider("Mix Intensity", value: Binding(
                get: { r.wrappedValue.intensity ?? 1.0 },
                set: { r.wrappedValue.intensity = $0 }
            ), range: 0.0...1.0, fmt: "%.2f")

            tuningSlider("Exposure (EV)", value: r.tone.exposureEV, range: -0.8...0.8, fmt: "%+.2f")
            tuningSlider("Temp Warm/Cool", value: r.tone.wbTempShift, range: -0.25...0.25, fmt: "%+.2f")
            tuningSlider("Mid Contrast", value: r.tone.midContrast, range: 0.75...1.45, fmt: "%.2f")
            tuningSlider("Shadow Toe", value: r.tone.toeSoftness, range: 0.0...0.65, fmt: "%.2f")
            tuningSlider("Black Floor R", value: Binding(
                get: { r.wrappedValue.tone.blackFloor.first ?? 0.01 },
                set: {
                    let v = $0
                    let g = r.wrappedValue.tone.blackFloor.count > 1 ? r.wrappedValue.tone.blackFloor[1] : v
                    let b = r.wrappedValue.tone.blackFloor.count > 2 ? r.wrappedValue.tone.blackFloor[2] : v
                    r.wrappedValue.tone.blackFloor = [v, g, b]
                }
            ), range: 0.0...0.08, fmt: "%.3f")

            tuningSlider("Skin Shield", value: r.colorScience.skinTintShield, range: 0.0...1.0, fmt: "%.2f")
            tuningSlider("Shadow Tint", value: r.colorScience.shadowTintStrength, range: 0.0...0.75, fmt: "%.2f")
            tuningSlider("Saturation", value: r.colorScience.saturation, range: 0.65...1.35, fmt: "%.2f")

            tuningSlider("Halation", value: Binding(
                get: { r.wrappedValue.halation.enabled ? r.wrappedValue.halation.strength : 0 },
                set: {
                    r.wrappedValue.halation.enabled = $0 > 0.005
                    r.wrappedValue.halation.strength = $0
                }
            ), range: 0.0...0.85, fmt: "%.2f")

            tuningSlider("Black Mist", value: Binding(
                get: { r.wrappedValue.blackMist.enabled ? r.wrappedValue.blackMist.strength : 0 },
                set: {
                    r.wrappedValue.blackMist.enabled = $0 > 0.005
                    r.wrappedValue.blackMist.strength = $0
                }
            ), range: 0.0...0.65, fmt: "%.2f")

            tuningSlider("3D MicroContrast", value: r.opticsAndGrain.microContrast, range: 0.0...0.5, fmt: "%.2f")
            tuningSlider("Film Grain", value: r.opticsAndGrain.grainAmount, range: 0.0...0.5, fmt: "%.2f")
            tuningSlider("Optical Vignette", value: r.opticsAndGrain.vignetteStrength, range: 0.0...0.65, fmt: "%.2f")
        }
    }

    private func tuningSlider(_ label: String, value: Binding<Float>, range: ClosedRange<Float>, fmt: String) -> some View {
        VStack(spacing: 2) {
            HStack {
                Text(label)
                    .font(.system(size: 10.5))
                    .foregroundColor(DarkroomTheme.textSecondary)
                Spacer()
                Text(String(format: fmt, value.wrappedValue))
                    .font(.system(size: 10.5, design: .monospaced))
                    .foregroundColor(DarkroomTheme.textPrimary)
            }
            Slider(value: value, in: range)
                .controlSize(.mini)
        }
    }

    // MARK: - Scientist Debug Masks

    private var debugMaskSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("OPTICAL DEBUG MASKS")
                .font(.system(size: 10.5, weight: .semibold, design: .monospaced))
                .foregroundColor(DarkroomTheme.textSecondary)

            Picker("", selection: Binding(
                get: { store.debugMaskMode },
                set: { newVal in
                    store.debugMaskMode = newVal
                    store.refreshGridImmediately()
                }
            )) {
                ForEach(DebugMaskMode.allCases) { mode in
                    Text(mode.title).tag(mode)
                }
            }
            .pickerStyle(.menu)
            .controlSize(.small)
        }
    }

    // MARK: - Exports & On-Demand Web Sync Bridge

    private var exportAndSyncSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("EXPORT & SHARED SPEC")
                .font(.system(size: 10.5, weight: .semibold, design: .monospaced))
                .foregroundColor(DarkroomTheme.textSecondary)

            HStack(spacing: 6) {
                Button("Export Image (⌘E)") { store.exportFullResActiveImage() }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                Button("Contact Sheet") { store.exportContactSheetPNG() }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
            }

            HStack(spacing: 6) {
                Button("Save recipes.json") { store.saveCatalogToCanonicalSharedJSON() }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                Button(".cube LUT") { store.exportActiveCubeLUT() }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
            }

            dividerLine.padding(.vertical, 4)

            VStack(alignment: .leading, spacing: 6) {
                Text("PUBLIC WEB CAMERA")
                    .font(.system(size: 10.5, weight: .semibold, design: .monospaced))
                    .foregroundColor(DarkroomTheme.textSecondary)
                Text("GitHub Pages HTTPS · Zero local server")
                    .font(.system(size: 9.5))
                    .foregroundColor(DarkroomTheme.textMuted)
                Text(FilterLabStore.publicWebCameraURL)
                    .font(.system(size: 9.5, design: .monospaced))
                    .foregroundColor(DarkroomTheme.silverAccent)
                    .textSelection(.enabled)

                HStack(spacing: 6) {
                    Button("Open Web Cam") {
                        store.openPublicWebCamera(shareCurrentTuning: false)
                    }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)

                    Button("Send Tuning URL") {
                        store.openPublicWebCamera(shareCurrentTuning: true)
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                }

                Button("Copy Tuning URL (iPhone/Safari)") {
                    store.copyPublicWebCameraURL(shareCurrentTuning: true)
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
            }
        }
    }
}
