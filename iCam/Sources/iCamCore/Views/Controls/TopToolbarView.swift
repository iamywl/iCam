import SwiftUI

/// Top action toolbar (Flash, Timer, Optical Lens sheet, Grid, Camera Flip)
public struct TopToolbarView: View {
    @ObservedObject var viewModel: CameraViewModel

    public init(viewModel: CameraViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        HStack(spacing: 20) {
            // Flash Toggle
            Button(action: {
                viewModel.isFlashEnabled.toggle()
            }) {
                Image(systemName: viewModel.isFlashEnabled ? "bolt.fill" : "bolt.slash.fill")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(viewModel.isFlashEnabled ? .yellow : .white.opacity(0.8))
                    .frame(width: 36, height: 36)
                    .background(Color.white.opacity(0.08))
                    .clipShape(Circle())
            }

            // Timer Toggle
            Button(action: {
                if viewModel.timerDuration == 0 {
                    viewModel.timerDuration = 3
                } else if viewModel.timerDuration == 3 {
                    viewModel.timerDuration = 10
                } else {
                    viewModel.timerDuration = 0
                }
            }) {
                HStack(spacing: 2) {
                    Image(systemName: "timer")
                    if viewModel.timerDuration > 0 {
                        Text("\(viewModel.timerDuration)s")
                            .font(.system(size: 11, weight: .bold))
                    }
                }
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(viewModel.timerDuration > 0 ? .yellow : .white.opacity(0.8))
                .frame(height: 36)
                .padding(.horizontal, 10)
                .background(Color.white.opacity(0.08))
                .cornerRadius(18)
            }

            Spacer()

            // Detachable Optical Lens Selector Button
            Button(action: {
                viewModel.showOpticalLensModal = true
            }) {
                HStack(spacing: 4) {
                    Image(systemName: "camera.aperture")
                    Text("렌즈")
                        .font(.system(size: 12, weight: .bold))
                    if viewModel.selectedOpticalFilterId != nil {
                        Circle()
                            .fill(Color.yellow)
                            .frame(width: 6, height: 6)
                    }
                }
                .foregroundColor(viewModel.selectedOpticalFilterId != nil ? .yellow : .white)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(
                    Capsule()
                        .stroke(viewModel.selectedOpticalFilterId != nil ? Color.yellow : Color.white.opacity(0.3), lineWidth: 1)
                        .background(Capsule().fill(Color.white.opacity(0.08)))
                )
            }

            Spacer()

            // Grid Toggle
            Button(action: {
                viewModel.isGridEnabled.toggle()
            }) {
                Image(systemName: viewModel.isGridEnabled ? "grid" : "circle.grid.2x2")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(viewModel.isGridEnabled ? .yellow : .white.opacity(0.8))
                    .frame(width: 36, height: 36)
                    .background(Color.white.opacity(0.08))
                    .clipShape(Circle())
            }

            // Flip Camera
            Button(action: {
                viewModel.flipCamera()
            }) {
                Image(systemName: "arrow.triangle.2.circlepath.camera")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white.opacity(0.8))
                    .frame(width: 36, height: 36)
                    .background(Color.white.opacity(0.08))
                    .clipShape(Circle())
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
}
