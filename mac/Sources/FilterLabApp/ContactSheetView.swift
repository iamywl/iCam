import SwiftUI
import AppKit
import FilterEngine

struct ContactSheetView: View {
    @ObservedObject var store: FilterLabStore

    private var columns: [GridItem] {
        let count = store.gridTiles.count > 9 ? 4 : 3
        return Array(repeating: GridItem(.flexible(), spacing: 14), count: count)
    }

    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 18) {
                ForEach(store.gridTiles) { tile in
                    ContactTileCell(
                        tile: tile,
                        aspectRatio: store.selectedPhoto?.aspectRatio ?? (4.0 / 3.0),
                        isSelected: (!store.isBypassed && store.activeId == tile.id) || (store.isBypassed && tile.isStock),
                        onSelect: {
                            if tile.isStock {
                                store.isBypassed = true
                            } else {
                                store.isBypassed = false
                                store.activeId = tile.id
                                store.compareRightId = tile.id
                            }
                        },
                        onInspectSolo: {
                            if tile.isStock {
                                store.isBypassed = true
                            } else {
                                store.isBypassed = false
                                store.activeId = tile.id
                            }
                            store.viewMode = .solo
                        },
                        onInspectSplit: {
                            if !tile.isStock {
                                store.isBypassed = false
                                store.activeId = tile.id
                                store.compareLeftId = "stock"
                                store.compareRightId = tile.id
                                store.viewMode = .compare
                            }
                        }
                    )
                }
            }
            .padding(20)
        }
        .background(DarkroomTheme.darkroomMat)
    }
}

private struct ContactTileCell: View {
    let tile: GridTileRender
    let aspectRatio: CGFloat
    let isSelected: Bool
    let onSelect: () -> Void
    let onInspectSolo: () -> Void
    let onInspectSplit: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            // Pure framed print — zero text overlays inside border
            ZStack {
                DarkroomTheme.chromeBg
                if let cg = tile.image {
                    Image(nsImage: NSImage(cgImage: cg, size: NSSize(width: cg.width, height: cg.height)))
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                } else {
                    ProgressView()
                        .controlSize(.small)
                }
            }
            .aspectRatio(max(0.75, min(1.8, aspectRatio)), contentMode: .fit)
            .overlay(
                Rectangle()
                    .strokeBorder(
                        isSelected ? DarkroomTheme.silverAccent : DarkroomTheme.hairline,
                        lineWidth: isSelected ? 1.5 : 0.75
                    )
            )
            .contentShape(Rectangle())
            .onTapGesture(count: 2) {
                onInspectSolo()
            }
            .onTapGesture {
                onSelect()
            }

            // Monospace title & quick compare outside image edge
            HStack(spacing: 6) {
                Text(tile.label)
                    .font(.system(size: 11, weight: isSelected ? .semibold : .medium, design: .monospaced))
                    .foregroundColor(isSelected ? DarkroomTheme.textPrimary : DarkroomTheme.silverAccent)

                Text(tile.moodCue)
                    .font(.system(size: 10.5))
                    .foregroundColor(DarkroomTheme.textSecondary)
                    .lineLimit(1)
                    .truncationMode(.tail)

                Spacer(minLength: 4)

                if !tile.isStock {
                    Button(action: onInspectSplit) {
                        Text("SPLIT")
                            .font(.system(size: 9.5, weight: .medium, design: .monospaced))
                            .foregroundColor(DarkroomTheme.textSecondary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(DarkroomTheme.surfaceBg)
                            .overlay(
                                RoundedRectangle(cornerRadius: 3)
                                    .strokeBorder(DarkroomTheme.hairline, lineWidth: 0.75)
                            )
                            .cornerRadius(3)
                    }
                    .buttonStyle(.plain)
                    .help("기카(Stock)와 1:1 분할 비교")
                }
            }
            .padding(.horizontal, 2)
        }
    }
}
