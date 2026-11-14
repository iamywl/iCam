import SwiftUI
import AVFoundation
import FilterEngine

struct SoloView: View {
    @ObservedObject var store: FilterLabStore
    @GestureState private var dragDelta: CGSize = .zero

    private var activeDisplayedRecipe: AestheticRecipe {
        store.isBypassed ? .stockBaseline : store.activeRecipe
    }

    var body: some View {
        VStack(spacing: 0) {
            soloHeaderBar
                .background(DarkroomTheme.surfaceBg)
                .overlay(Rectangle().frame(height: 1).foregroundColor(DarkroomTheme.hairline), alignment: .bottom)

            ZStack {
                DarkroomTheme.darkroomMat

                if store.viewMode == .camera {
                    liveCameraStage
                } else if let photo = store.selectedPhoto {
                    soloPhotoStage(photo: photo)
                } else {
                    Text("테스트할 사진을 드래그하거나 ⌘O로 불러오세요.")
                        .foregroundColor(DarkroomTheme.textSecondary)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .clipped()

            if store.viewMode == .camera {
                cameraBottomDeck
                    .background(DarkroomTheme.chromeBg)
                    .overlay(Rectangle().frame(height: 1).foregroundColor(DarkroomTheme.hairline), alignment: .top)
            }
        }
        .background(DarkroomTheme.darkroomMat)
        .onChange(of: store.viewMode) { _, newMode in
            if newMode == .camera {
                store.cameraService.start()
            } else {
                store.cameraService.stop()
            }
        }
    }

    private var soloHeaderBar: some View {
        HStack(spacing: 12) {
            Text(store.isBypassed ? "00 STOCK (ORIGINAL BYPASS)" : "\(store.activeRecipe.shortLabel) — \(store.activeRecipe.koreanName)")
                .font(.system(size: 12, weight: .semibold, design: .monospaced))
                .foregroundColor(store.isBypassed ? Color.orange.opacity(0.9) : DarkroomTheme.textPrimary)

            Text(store.activeRecipe.moodCue)
                .font(.system(size: 11))
                .foregroundColor(DarkroomTheme.textSecondary)

            Spacer()

            if store.viewMode == .solo {
                HStack(spacing: 4) {
                    Button("Fit") { store.resetZoomAndPan() }
                    Button("100%") { store.zoomScale = 1.6 }
                    Button("200%") { store.zoomScale = 2.6 }
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
            }

            Button(action: { store.isBypassed.toggle() }) {
                Text(store.isBypassed ? "Bypass ON (Space)" : "Original Bypass (Space)")
                    .font(.system(size: 11, design: .monospaced))
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
    }

    @ViewBuilder
    private func soloPhotoStage(photo: TestPhoto) -> some View {
        let totalOffset = CGSize(
            width: store.panOffset.width + dragDelta.width,
            height: store.panOffset.height + dragDelta.height
        )

        MetalImageView(
            processor: store.processor,
            sourceImage: photo.previewImage,
            recipe: activeDisplayedRecipe,
            seed: photo.seed,
            debugMaskMode: store.debugMaskMode,
            isLiveStream: false
        )
        .aspectRatio(photo.aspectRatio, contentMode: .fit)
        .scaleEffect(store.zoomScale)
        .offset(totalOffset)
        .padding(16)
        .gesture(
            DragGesture()
                .updating($dragDelta) { val, state, _ in
                    if store.zoomScale > 1.01 {
                        state = val.translation
                    }
                }
                .onEnded { val in
                    if store.zoomScale > 1.01 {
                        store.panOffset = CGSize(
                            width: store.panOffset.width + val.translation.width,
                            height: store.panOffset.height + val.translation.height
                        )
                    }
                }
        )
    }

    @ViewBuilder
    private var liveCameraStage: some View {
        if let liveCI = store.liveCameraFrame {
            let aspect = max(0.5, min(2.4, liveCI.extent.width / max(liveCI.extent.height, 1)))
            MetalImageView(
                processor: store.processor,
                sourceImage: liveCI,
                recipe: activeDisplayedRecipe,
                seed: 17,
                debugMaskMode: store.debugMaskMode,
                isLiveStream: true
            )
            .aspectRatio(aspect, contentMode: .fit)
            .padding(16)
        } else if let err = store.cameraService.errorMessage {
            VStack(spacing: 12) {
                Text(err)
                    .font(.system(size: 13))
                    .foregroundColor(DarkroomTheme.textSecondary)
                Button("카메라 다시 시도") {
                    store.cameraService.start()
                }
                .buttonStyle(.bordered)
            }
        } else {
            VStack(spacing: 10) {
                ProgressView()
                Text("카메라 스트림 연결 중...")
                    .font(.system(size: 12))
                    .foregroundColor(DarkroomTheme.textSecondary)
            }
        }
    }

    private var cameraBottomDeck: some View {
        HStack(spacing: 16) {
            Picker("Camera", selection: Binding(
                get: { store.cameraService.selectedDeviceID ?? "" },
                set: { store.cameraService.selectDevice($0) }
            )) {
                ForEach(store.cameraService.availableDevices, id: \.uniqueID) { dev in
                    Text(dev.localizedName).tag(dev.uniqueID)
                }
            }
            .frame(width: 240)
            .controlSize(.small)

            Spacer()

            // Tactile matte mechanical shutter button (zero gloss!)
            Button(action: { store.captureLiveCameraSnapshot() }) {
                Circle()
                    .fill(DarkroomTheme.silverAccent)
                    .frame(width: 44, height: 44)
                    .overlay(
                        Circle()
                            .strokeBorder(DarkroomTheme.chromeBg, lineWidth: 2)
                            .padding(3)
                    )
                    .overlay(
                        Circle()
                            .strokeBorder(DarkroomTheme.silverAccent.opacity(0.6), lineWidth: 1.5)
                            .padding(-4)
                    )
            }
            .buttonStyle(.plain)
            .help("실시간 카메라 스냅샷을 9-Up 테스트 랩으로 전송")

            Text("Capture Snapshot to Lab")
                .font(.system(size: 11, design: .monospaced))
                .foregroundColor(DarkroomTheme.textSecondary)

            Spacer()
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 14)
    }
}
