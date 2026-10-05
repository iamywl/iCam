import SwiftUI

/// 4x6 Inch 8-Cut Official Passport Photo Sheet Modal
public struct PassportPrintSheetModal: View {
    @ObservedObject var viewModel: CameraViewModel
    @Environment(\.dismiss) private var dismiss

    public init(viewModel: CameraViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("4x6인치 8분할 인쇄 시트")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.top, 16)

                Text("외교부 표준 3.5x4.5cm 여권 사진 8매가 4x6인치 포토용지에 자동 배치됩니다.")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.6))
                    .multilineTextAlignment(.center)

                // 4x6 Paper Canvas Preview (Aspect Ratio 4:6 = 2:3)
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.white)
                        .shadow(color: .black.opacity(0.5), radius: 10)

                    // 2 rows x 4 cols = 8 passport photos
                    VStack(spacing: 6) {
                        ForEach(0..<2, id: \.self) { _ in
                            HStack(spacing: 6) {
                                ForEach(0..<4, id: \.self) { _ in
                                    passportCell
                                }
                            }
                        }
                    }
                    .padding(8)
                }
                .aspectRatio(3.0 / 2.0, contentMode: .fit)
                .padding(.horizontal, 24)

                Spacer()

                HStack(spacing: 12) {
                    Button("닫기") {
                        dismiss()
                    }
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(Color.white.opacity(0.12))
                    .cornerRadius(12)

                    Button("프린터 출력 / 저장") {
                        dismiss()
                    }
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.black)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(Color.blue)
                    .cornerRadius(12)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }
            .background(Color(red: 0.1, green: 0.1, blue: 0.12).ignoresSafeArea())
        }
    }

    private var passportCell: some View {
        ZStack {
            Rectangle()
                .fill(Color(red: 0.94, green: 0.94, blue: 0.96))
                .aspectRatio(3.5 / 4.5, contentMode: .fit)
                .overlay(
                    Rectangle()
                        .stroke(Color.black.opacity(0.15), lineWidth: 0.5)
                )

            if let photo = viewModel.lastCapturedPhoto {
                #if canImport(UIKit)
                Image(uiImage: UIImage(cgImage: photo))
                    .resizable()
                    .scaledToFill()
                    .clipped()
                #else
                Image(systemName: "person.crop.square.fill")
                    .foregroundColor(.gray)
                #endif
            } else {
                Image(systemName: "person.crop.square.fill")
                    .resizable()
                    .scaledToFit()
                    .padding(8)
                    .foregroundColor(.gray.opacity(0.5))
            }
        }
    }
}
