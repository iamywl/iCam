import SwiftUI

/// Modular filter tray dynamically presenting registered filters for the active camera
public struct ModularFilterTrayView: View {
    @ObservedObject var viewModel: CameraViewModel

    public init(viewModel: CameraViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        VStack(spacing: 8) {
            // Filter Chips ScrollView
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(viewModel.availableFilters, id: \.id) { filter in
                        let isSelected = viewModel.selectedFilterId == filter.id

                        Button(action: {
                            withAnimation(.easeInOut(duration: 0.2)) {
                                viewModel.selectFilter(id: filter.id)
                            }
                        }) {
                            HStack(spacing: 6) {
                                Image(systemName: filter.iconName)
                                    .font(.system(size: 12))
                                    .foregroundColor(isSelected ? .white : .white.opacity(0.7))

                                Text(filter.localizedName)
                                    .font(.system(size: 12, weight: isSelected ? .bold : .medium))
                                    .foregroundColor(isSelected ? .white : .white.opacity(0.75))
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 7)
                            .background(
                                Capsule()
                                    .fill(isSelected ? Color(hex: viewModel.selectedCategory.badgeColorHex) : Color.white.opacity(0.08))
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 16)
            }

            // Filter Intensity Slider
            HStack(spacing: 12) {
                Text("강도")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.white.opacity(0.6))

                Slider(value: $viewModel.filterIntensity, in: 0.0...1.0)
                    .tint(Color(hex: viewModel.selectedCategory.badgeColorHex))

                Text("\(Int(viewModel.filterIntensity * 100))%")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.8))
                    .frame(width: 38, alignment: .trailing)
            }
            .padding(.horizontal, 16)
            .padding(.top, 2)
        }
    }
}
