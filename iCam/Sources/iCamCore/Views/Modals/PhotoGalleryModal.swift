import SwiftUI

/// Interactive photo gallery sheet showing all captured memories and their EXIF details
public struct PhotoGalleryModal: View {
    @ObservedObject var viewModel: CameraViewModel
    @State private var selectedItem: GalleryItem? = nil
    @State private var showExifInspector: Bool = false

    public init(viewModel: CameraViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        NavigationView {
            ZStack {
                Color.black.edgesIgnoringSafeArea(.all)

                if viewModel.galleryItems.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "photo.stack")
                            .font(.system(size: 48, weight: .light))
                            .foregroundColor(.white.opacity(0.3))
                        Text("촬영된 사진이 없습니다")
                            .font(.headline)
                            .foregroundColor(.white.opacity(0.6))
                        Text("뷰파인더 셔터를 눌러 레트로 감성의 사진을 촬영해보세요.")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.4))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 40)
                    }
                } else {
                    ScrollView {
                        LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                            ForEach(viewModel.galleryItems) { item in
                                GalleryItemCell(item: item) {
                                    selectedItem = item
                                    showExifInspector = true
                                }
                            }
                        }
                        .padding(16)
                    }
                }
            }
            .navigationTitle("갤러리 (\(viewModel.galleryItems.count))")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("닫기") {
                        viewModel.showGalleryModal = false
                    }
                    .foregroundColor(.white)
                }
            }
            .sheet(isPresented: $showExifInspector) {
                if let item = selectedItem {
                    ExifMetadataModalView(item: item) {
                        viewModel.deleteGalleryItem(id: item.id)
                        showExifInspector = false
                    }
                }
            }
        }
    }
}

private struct GalleryItemCell: View {
    let item: GalleryItem
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 6) {
                #if canImport(UIKit)
                Image(decorative: item.image, scale: 1.0)
                    .resizable()
                    .aspectRatio(3/4, contentMode: .fit)
                    .cornerRadius(8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.white.opacity(0.15), lineWidth: 1)
                    )
                #else
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .aspectRatio(3/4, contentMode: .fit)
                    .cornerRadius(8)
                #endif

                HStack {
                    Text(item.metadata.cameraName)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white.opacity(0.9))
                        .lineLimit(1)
                    Spacer()
                    Text(item.metadata.filterName)
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(Color(hex: "#00E5FF"))
                        .lineLimit(1)
                }

                Text(item.metadata.formattedDate)
                    .font(.system(size: 8))
                    .foregroundColor(.white.opacity(0.5))
            }
        }
    }
}
