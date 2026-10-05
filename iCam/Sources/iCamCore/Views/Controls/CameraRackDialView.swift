import SwiftUI

/// Horizontal camera rack switcher allowing switching between the 6 iconic cameras
public struct CameraRackDialView: View {
    @ObservedObject var viewModel: CameraViewModel

    public init(viewModel: CameraViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(CameraCategory.allCases, id: \.rawValue) { category in
                    let isSelected = viewModel.selectedCategory == category

                    Button(action: {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.75)) {
                            viewModel.selectCategory(category)
                        }
                    }) {
                        VStack(spacing: 3) {
                            Text(category.displayName)
                                .font(.system(size: 13, weight: isSelected ? .bold : .medium))
                                .foregroundColor(isSelected ? .white : .white.opacity(0.55))

                            Text(category.subtitle)
                                .font(.system(size: 9, weight: .regular))
                                .foregroundColor(isSelected ? Color(hex: category.badgeColorHex) : .white.opacity(0.35))
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 7)
                        .background(
                            RoundedRectangle(cornerRadius: 18)
                                .fill(isSelected ? Color.white.opacity(0.14) : Color.white.opacity(0.04))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 18)
                                        .stroke(isSelected ? Color(hex: category.badgeColorHex) : Color.clear, lineWidth: 1.5)
                                )
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 16)
        }
        .frame(height: 52)
    }
}
