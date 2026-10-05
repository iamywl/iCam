import SwiftUI

/// Shutter action bar with hardware-like shutter button, photo preview thumbnail, and print sheet action
public struct ShutterBarView: View {
    @ObservedObject var viewModel: CameraViewModel

    public init(viewModel: CameraViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        HStack(alignment: .center) {
            // Left: Photo Preview Thumbnail
            Button(action: {
                if viewModel.lastCapturedPhoto != nil {
                    viewModel.showPhotoPreviewSheet = true
                }
            }) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.white.opacity(0.12))
                        .frame(width: 48, height: 48)

                    if let photo = viewModel.lastCapturedPhoto {
                        #if canImport(UIKit)
                        Image(uiImage: UIImage(cgImage: photo))
                            .resizable()
                            .scaledToFill()
                            .frame(width: 48, height: 48)
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        #else
                        Image(systemName: "photo.fill")
                            .foregroundColor(.white)
                        #endif
                    } else {
                        Image(systemName: "photo.on.rectangle")
                            .font(.system(size: 20))
                            .foregroundColor(.white.opacity(0.5))
                    }
                }
            }
            .buttonStyle(.plain)

            Spacer()

            // Center: Hardware Shutter Button
            Button(action: {
                viewModel.triggerShutter()
            }) {
                ZStack {
                    Circle()
                        .stroke(Color.white, lineWidth: 3.5)
                        .frame(width: 72, height: 72)

                    Circle()
                        .fill(shutterInnerColor)
                        .frame(width: 60, height: 60)
                        .shadow(color: .black.opacity(0.4), radius: 4)
                }
            }
            .buttonStyle(.plain)

            Spacer()

            // Right: Passport Print Sheet or Quick Action
            if viewModel.selectedCategory == .passportID {
                Button(action: {
                    viewModel.showPrintSheetModal = true
                }) {
                    VStack(spacing: 3) {
                        Image(systemName: "printer.fill")
                            .font(.system(size: 16))
                        Text("8분할 인쇄")
                            .font(.system(size: 9, weight: .bold))
                    }
                    .foregroundColor(.white)
                    .frame(width: 54, height: 48)
                    .background(Color.blue.opacity(0.4))
                    .cornerRadius(10)
                }
                .buttonStyle(.plain)
            } else {
                Color.clear
                    .frame(width: 54, height: 48)
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 8)
    }

    private var shutterInnerColor: Color {
        switch viewModel.selectedCategory {
        case .sonyHandycam:
            return Color.red // Handycam red REC shutter
        case .colorStudio:
            return Color(hex: viewModel.selectedPersonalColor.hex)
        case .canonIXY:
            return Color(red: 0.9, green: 0.9, blue: 0.92)
        default:
            return Color.white
        }
    }
}
