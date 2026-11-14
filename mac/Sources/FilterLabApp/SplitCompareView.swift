import SwiftUI
import FilterEngine

struct SplitCompareView: View {
    @ObservedObject var store: FilterLabStore
    @GestureState private var dragDelta: CGSize = .zero

    private var leftId: String {
        store.blindShuffleEnabled ? store.blindPairOrder.left : store.compareLeftId
    }

    private var rightId: String {
        store.blindShuffleEnabled ? store.blindPairOrder.right : store.compareRightId
    }

    var body: some View {
        VStack(spacing: 0) {
            compareControlBar
                .background(DarkroomTheme.surfaceBg)
                .overlay(Rectangle().frame(height: 1).foregroundColor(DarkroomTheme.hairline), alignment: .bottom)

            GeometryReader { geo in
                if let photo = store.selectedPhoto {
                    ZStack {
                        DarkroomTheme.darkroomMat

                        if store.compareLayout == .splitCurtain {
                            splitCurtainStage(photo: photo, size: geo.size)
                        } else {
                            sideBySideStage(photo: photo)
                        }
                    }
                    .frame(width: geo.size.width, height: geo.size.height)
                    .clipped()
                } else {
                    Text("테스트할 사진을 드래그하거나 ⌘O로 불러오세요.")
                        .foregroundColor(DarkroomTheme.textSecondary)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(DarkroomTheme.darkroomMat)
                }
            }
        }
        .background(DarkroomTheme.darkroomMat)
    }

    private var compareControlBar: some View {
        HStack(spacing: 12) {
            if store.blindShuffleEnabled {
                HStack(spacing: 8) {
                    Text("BLIND TEST:")
                        .font(.system(size: 10.5, weight: .semibold, design: .monospaced))
                        .foregroundColor(DarkroomTheme.silverAccent)
                    Text(store.blindRevealAnswer ? "LEFT: \(labelFor(leftId))  |  RIGHT: \(labelFor(rightId))" : "LEFT: Sample A   |   RIGHT: Sample B")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundColor(DarkroomTheme.textPrimary)
                    Button(store.blindRevealAnswer ? "New Pair" : "Reveal Answer") {
                        if store.blindRevealAnswer {
                            store.randomizeBlindPair()
                        } else {
                            store.blindRevealAnswer = true
                        }
                    }
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                }
            } else {
                HStack(spacing: 6) {
                    Text("LEFT")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(DarkroomTheme.textSecondary)
                    Picker("", selection: $store.compareLeftId) {
                        Text("00 STOCK").tag("stock")
                        ForEach(store.catalog.aesthetics) { item in
                            Text(item.shortLabel).tag(item.id)
                        }
                    }
                    .labelsHidden()
                    .frame(width: 140)
                    .controlSize(.small)

                    Text("VS")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(DarkroomTheme.textMuted)

                    Text("RIGHT")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(DarkroomTheme.textSecondary)
                    Picker("", selection: $store.compareRightId) {
                        Text("00 STOCK").tag("stock")
                        ForEach(store.catalog.aesthetics) { item in
                            Text(item.shortLabel).tag(item.id)
                        }
                    }
                    .labelsHidden()
                    .frame(width: 140)
                    .controlSize(.small)
                }
            }

            Spacer()

            Picker("", selection: $store.compareLayout) {
                ForEach(CompareLayout.allCases) { layout in
                    Text(layout.rawValue).tag(layout)
                }
            }
            .pickerStyle(.segmented)
            .frame(width: 140)
            .controlSize(.small)

            HStack(spacing: 4) {
                Button("Fit") { store.resetZoomAndPan() }
                Button("100%") { store.zoomScale = 1.5 }
                Button("200%") { store.zoomScale = 2.6 }
            }
            .buttonStyle(.bordered)
            .controlSize(.small)

            Toggle(isOn: Binding(
                get: { store.blindShuffleEnabled },
                set: { _ in store.toggleBlindShuffle() }
            )) {
                Text("Blind A/B")
                    .font(.system(size: 11))
            }
            .toggleStyle(.button)
            .controlSize(.small)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
    }

    @ViewBuilder
    private func splitCurtainStage(photo: TestPhoto, size: CGSize) -> some View {
        let totalOffset = CGSize(
            width: store.panOffset.width + dragDelta.width,
            height: store.panOffset.height + dragDelta.height
        )
        let leftRecipe = store.effectiveRecipe(for: leftId)
        let rightRecipe = store.effectiveRecipe(for: rightId)
        let dividerX = size.width * store.splitFraction

        ZStack {
            // Right / full base layer
            MetalImageView(
                processor: store.processor,
                sourceImage: photo.previewImage,
                recipe: rightRecipe,
                seed: photo.seed,
                debugMaskMode: store.debugMaskMode,
                isLiveStream: false
            )
            .aspectRatio(photo.aspectRatio, contentMode: .fit)
            .scaleEffect(store.zoomScale)
            .offset(totalOffset)

            // Left layer clipped cleanly at split curtain X
            MetalImageView(
                processor: store.processor,
                sourceImage: photo.previewImage,
                recipe: leftRecipe,
                seed: photo.seed,
                debugMaskMode: store.debugMaskMode,
                isLiveStream: false
            )
            .aspectRatio(photo.aspectRatio, contentMode: .fit)
            .scaleEffect(store.zoomScale)
            .offset(totalOffset)
            .mask(
                HStack(spacing: 0) {
                    Rectangle().frame(width: max(0, dividerX))
                    Spacer(minLength: 0)
                }
            )

            // Precision matte hairline curtain handle
            Rectangle()
                .fill(Color.white.opacity(0.75))
                .frame(width: 1.5)
                .position(x: dividerX, y: size.height * 0.5)

            Circle()
                .fill(DarkroomTheme.chromeBg)
                .overlay(Circle().strokeBorder(Color.white.opacity(0.8), lineWidth: 1.25))
                .overlay(
                    Image(systemName: "arrow.left.and.right")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.white)
                )
                .frame(width: 28, height: 28)
                .position(x: dividerX, y: size.height * 0.5)
                .gesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { val in
                            store.splitFraction = max(0.03, min(0.97, val.location.x / max(size.width, 1)))
                        }
                )
        }
        .contentShape(Rectangle())
        .gesture(
            DragGesture()
                .updating($dragDelta) { val, state, _ in
                    if store.zoomScale > 1.01 {
                        state = val.translation
                    }
                }
                .onChanged { val in
                    if store.zoomScale <= 1.01 {
                        store.splitFraction = max(0.03, min(0.97, val.location.x / max(size.width, 1)))
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
        .overlay(
            HStack {
                Text(store.blindShuffleEnabled && !store.blindRevealAnswer ? "A" : labelFor(leftId))
                    .font(.system(size: 10.5, weight: .medium, design: .monospaced))
                    .foregroundColor(DarkroomTheme.silverAccent)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(DarkroomTheme.chromeBg.opacity(0.85))
                Spacer()
                Text(store.blindShuffleEnabled && !store.blindRevealAnswer ? "B" : labelFor(rightId))
                    .font(.system(size: 10.5, weight: .medium, design: .monospaced))
                    .foregroundColor(DarkroomTheme.silverAccent)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(DarkroomTheme.chromeBg.opacity(0.85))
            }
            .padding(10),
            alignment: .bottom
        )
    }

    @ViewBuilder
    private func sideBySideStage(photo: TestPhoto) -> some View {
        let totalOffset = CGSize(
            width: store.panOffset.width + dragDelta.width,
            height: store.panOffset.height + dragDelta.height
        )

        HStack(spacing: 14) {
            pairedPane(
                photo: photo,
                recipe: store.effectiveRecipe(for: leftId),
                caption: store.blindShuffleEnabled && !store.blindRevealAnswer ? "SAMPLE A" : labelFor(leftId),
                offset: totalOffset
            )
            pairedPane(
                photo: photo,
                recipe: store.effectiveRecipe(for: rightId),
                caption: store.blindShuffleEnabled && !store.blindRevealAnswer ? "SAMPLE B" : labelFor(rightId),
                offset: totalOffset
            )
        }
        .padding(16)
        .contentShape(Rectangle())
        .gesture(
            DragGesture()
                .updating($dragDelta) { val, state, _ in
                    state = val.translation
                }
                .onEnded { val in
                    store.panOffset = CGSize(
                        width: store.panOffset.width + val.translation.width,
                        height: store.panOffset.height + val.translation.height
                    )
                }
        )
    }

    @ViewBuilder
    private func pairedPane(photo: TestPhoto, recipe: AestheticRecipe, caption: String, offset: CGSize) -> some View {
        VStack(spacing: 8) {
            GeometryReader { _ in
                MetalImageView(
                    processor: store.processor,
                    sourceImage: photo.previewImage,
                    recipe: recipe,
                    seed: photo.seed,
                    debugMaskMode: store.debugMaskMode,
                    isLiveStream: false
                )
                .aspectRatio(photo.aspectRatio, contentMode: .fit)
                .scaleEffect(store.zoomScale)
                .offset(offset)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .clipped()
            }
            .background(DarkroomTheme.chromeBg)
            .overlay(Rectangle().strokeBorder(DarkroomTheme.hairline, lineWidth: 0.75))

            Text(caption)
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundColor(DarkroomTheme.silverAccent)
        }
    }

    private func labelFor(_ id: String) -> String {
        if store.isBypassed { return "00 STOCK (BYPASS)" }
        if id == "stock" { return "00 STOCK" }
        return store.recipe(for: id).shortLabel
    }
}
