import SwiftUI

/// Real-time personal color swatch selector for 시현하다 Color Studio
public struct ColorStudioPaletteView: View {
    @ObservedObject var viewModel: CameraViewModel

    public init(viewModel: CameraViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        VStack(spacing: 8) {
            // Personal Color Swatches
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(PersonalColorPalette.best8) { swatch in
                        let isSelected = viewModel.selectedPersonalColor.id == swatch.id

                        Button(action: {
                            withAnimation(.spring(response: 0.25, dampingFraction: 0.8)) {
                                viewModel.selectPersonalColor(swatch)
                            }
                        }) {
                            VStack(spacing: 4) {
                                Circle()
                                    .fill(Color(hex: swatch.hex))
                                    .frame(width: 32, height: 32)
                                    .overlay(
                                        Circle()
                                            .stroke(Color.white, lineWidth: isSelected ? 2.5 : 0)
                                    )
                                    .shadow(color: Color(hex: swatch.hex).opacity(0.4), radius: 4)

                                Text(swatch.name)
                                    .font(.system(size: 10, weight: isSelected ? .bold : .medium))
                                    .foregroundColor(isSelected ? .white : .white.opacity(0.6))
                            }
                            .frame(width: 58)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 16)
            }

            // Studio Custom Signature Name Field
            HStack {
                Text("각인 성명:")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.white.opacity(0.6))

                TextField("영문/한글 이름", text: $viewModel.studioSubjectName)
                    .font(.system(size: 12, weight: .medium))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.white.opacity(0.08))
                    .cornerRadius(6)
                    .foregroundColor(.white)

                Toggle("", isOn: $viewModel.isLiveMattingEnabled)
                    .labelsHidden()
                    .tint(.pink)

                Text("라이브 합성")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(.horizontal, 16)
        }
    }
}
