import SwiftUI

/// Modal sheet for selecting and tuning detachable optical lens filters
public struct OpticalLensPickerModal: View {
    @ObservedObject var viewModel: CameraViewModel
    @Environment(\.dismiss) private var dismiss

    public init(viewModel: CameraViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("탈부착 광학 렌즈 필터")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.top, 16)

                Text("어떤 카메라 바디에도 물리 광학 필터를 장착하여 특수 효과를 연출할 수 있습니다.")
                    .font(.subheadline)
                    .foregroundColor(.white.opacity(0.6))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)

                // List of optical filters
                ScrollView {
                    VStack(spacing: 12) {
                        // Option: None
                        opticalOptionRow(
                            title: "필터 미장착 (기본 렌즈)",
                            subtitle: "카메라 본연의 렌즈 상태",
                            icon: "slash.circle",
                            isSelected: viewModel.selectedOpticalFilterId == nil,
                            onSelect: { viewModel.selectedOpticalFilterId = nil }
                        )

                        ForEach(viewModel.availableOpticalFilters, id: \.id) { opt in
                            opticalOptionRow(
                                title: opt.localizedName,
                                subtitle: opt.filterDescription,
                                icon: opt.iconName,
                                isSelected: viewModel.selectedOpticalFilterId == opt.id,
                                onSelect: { viewModel.toggleOpticalFilter(id: opt.id) }
                            )
                        }
                    }
                    .padding(.horizontal, 16)
                }

                if viewModel.selectedOpticalFilterId != nil {
                    // Optical strength slider
                    VStack(spacing: 6) {
                        HStack {
                            Text("렌즈 광학 효과 강도")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.7))
                            Spacer()
                            Text("\(Int(viewModel.opticalStrength * 100))%")
                                .font(.caption.bold())
                                .foregroundColor(.yellow)
                        }
                        Slider(value: $viewModel.opticalStrength, in: 0.0...1.0)
                            .tint(.yellow)
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 10)
                }

                Button("완료") {
                    dismiss()
                }
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.black)
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(Color.white)
                .cornerRadius(12)
                .padding(.horizontal, 16)
                .padding(.bottom, 20)
            }
            .background(Color(red: 0.1, green: 0.1, blue: 0.12).ignoresSafeArea())
        }
    }

    private func opticalOptionRow(
        title: String,
        subtitle: String,
        icon: String,
        isSelected: Bool,
        onSelect: @escaping () -> Void
    ) -> some View {
        Button(action: onSelect) {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(isSelected ? .yellow : .white.opacity(0.7))
                    .frame(width: 32)

                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                    Text(subtitle)
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.55))
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.yellow)
                        .font(.system(size: 18))
                }
            }
            .padding(14)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? Color.yellow.opacity(0.12) : Color.white.opacity(0.04))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(isSelected ? Color.yellow : Color.white.opacity(0.08), lineWidth: 1)
                    )
            )
        }
        .buttonStyle(.plain)
    }
}
