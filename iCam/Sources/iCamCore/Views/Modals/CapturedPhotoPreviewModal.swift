import SwiftUI

/// Modal sheet presenting the captured photograph with camera metadata and sharing
public struct CapturedPhotoPreviewModal: View {
    @ObservedObject var viewModel: CameraViewModel
    @Environment(\.dismiss) private var dismiss

    public init(viewModel: CameraViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                // Header with camera metadata
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(viewModel.selectedCategory.displayName)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                        Text("\(viewModel.activeFilter.localizedName) • \(Date().formatted(date: .abbreviated, time: .shortened))")
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.6))
                    }

                    Spacer()

                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)

                // Captured Image Frame
                ZStack {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.black)

                    if let photo = viewModel.lastCapturedPhoto {
                        #if canImport(UIKit)
                        Image(uiImage: UIImage(cgImage: photo))
                            .resizable()
                            .scaledToFit()
                            .cornerRadius(12)
                        #else
                        Image(systemName: "photo")
                            .font(.system(size: 64))
                            .foregroundColor(.white.opacity(0.5))
                        #endif
                    } else {
                        Image(systemName: "photo")
                            .font(.system(size: 64))
                            .foregroundColor(.white.opacity(0.3))
                    }
                }
                .aspectRatio(3.0 / 4.0, contentMode: .fit)
                .padding(.horizontal, 20)

                Spacer()

                // Actions (Save, Share)
                HStack(spacing: 16) {
                    Button(action: {
                        dismiss()
                    }) {
                        HStack {
                            Image(systemName: "square.and.arrow.down")
                            Text("사진첩 저장")
                        }
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color.white.opacity(0.12))
                        .cornerRadius(14)
                    }

                    Button(action: {
                        dismiss()
                    }) {
                        HStack {
                            Image(systemName: "square.and.arrow.up")
                            Text("공유하기")
                        }
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.black)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color(hex: viewModel.selectedCategory.badgeColorHex))
                        .cornerRadius(14)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
            .background(Color(red: 0.08, green: 0.08, blue: 0.09).ignoresSafeArea())
        }
    }
}
