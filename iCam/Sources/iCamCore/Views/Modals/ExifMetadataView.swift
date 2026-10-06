import SwiftUI

/// Detailed glassmorphism EXIF metadata inspection modal for a captured photograph
public struct ExifMetadataModalView: View {
    let item: GalleryItem
    let onDelete: () -> Void
    @Environment(\.presentationMode) var presentationMode

    public init(item: GalleryItem, onDelete: @escaping () -> Void) {
        self.item = item
        self.onDelete = onDelete
    }

    public var body: some View {
        NavigationView {
            ZStack {
                Color(hex: "#101216").edgesIgnoringSafeArea(.all)

                ScrollView {
                    VStack(spacing: 20) {
                        // Full Image Preview Card
                        #if canImport(UIKit)
                        Image(decorative: item.image, scale: 1.0)
                            .resizable()
                            .aspectRatio(3/4, contentMode: .fit)
                            .cornerRadius(12)
                            .shadow(color: .black.opacity(0.6), radius: 16, x: 0, y: 8)
                            .padding(.horizontal, 24)
                        #endif

                        // Glassmorphism EXIF Information Panel
                        VStack(spacing: 14) {
                            HStack {
                                Label("EXIF 메타데이터 명세", systemImage: "info.circle.fill")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(.white)
                                Spacer()
                                Text(item.metadata.formattedDate)
                                    .font(.system(size: 11, design: .monospaced))
                                    .foregroundColor(.white.opacity(0.6))
                            }
                            .padding(.bottom, 4)

                            Divider().background(Color.white.opacity(0.15))

                            // Metadata Rows
                            metadataRow(label: "카메라 기종 (Camera)", value: item.metadata.cameraName, icon: "camera.fill")
                            metadataRow(label: "장착 렌즈 (Lens)", value: item.metadata.lensModel, icon: "camera.aperture")
                            metadataRow(label: "적용 필터 (Filter)", value: "\(item.metadata.filterName) (\(Int(item.metadata.filterIntensity * 100))%)", icon: "slider.horizontal.3")

                            if let opt = item.metadata.opticalLensName {
                                metadataRow(label: "광학 필터 (Optical Lens)", value: opt, icon: "circle.circle")
                            }

                            metadataRow(label: "노출 설정 (Exposure)", value: item.metadata.exposureSummary, icon: "gauge.with.needle")
                            metadataRow(label: "초점 거리 (Focal Length)", value: item.metadata.focalLength, icon: "arrow.left.and.right")
                            metadataRow(label: "플래시 (Flash)", value: item.metadata.flashFired ? "발광 (Fired)" : "꺼짐 (Off)", icon: "bolt.fill")
                            metadataRow(label: "해상도 (Resolution)", value: item.metadata.resolutionDisplay, icon: "aspectratio.fill")
                            metadataRow(label: "색 공간 (Color Profile)", value: item.metadata.colorSpace, icon: "paintpalette.fill")
                        }
                        .padding(18)
                        .background(Color.white.opacity(0.06))
                        .cornerRadius(16)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color.white.opacity(0.12), lineWidth: 1)
                        )
                        .padding(.horizontal, 20)

                        // Action Buttons
                        HStack(spacing: 12) {
                            Button(action: {
                                onDelete()
                            }) {
                                HStack {
                                    Image(systemName: "trash")
                                    Text("사진 삭제")
                                }
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.red.opacity(0.9))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(Color.red.opacity(0.12))
                                .cornerRadius(10)
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 24)
                    }
                    .padding(.top, 16)
                }
            }
            .navigationTitle("사진 상세 & EXIF")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("완료") {
                        presentationMode.wrappedValue.dismiss()
                    }
                    .foregroundColor(.white)
                }
            }
        }
    }

    private func metadataRow(label: String, value: String, icon: String) -> some View {
        HStack(alignment: .top) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 11))
                    .foregroundColor(Color(hex: "#00E5FF"))
                Text(label)
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.65))
            }
            Spacer()
            Text(value)
                .font(.system(size: 12, weight: .medium, design: .monospaced))
                .foregroundColor(.white.opacity(0.95))
                .multilineTextAlignment(.trailing)
        }
    }
}
