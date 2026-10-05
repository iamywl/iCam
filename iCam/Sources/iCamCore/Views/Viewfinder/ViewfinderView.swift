import SwiftUI

/// 3:4 Pixel-Perfect Live Viewfinder Container
public struct ViewfinderView: View {
    @ObservedObject var viewModel: CameraViewModel

    public init(viewModel: CameraViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        ZStack {
            // Background Layer (Personal Color Studio live backdrop or default dark viewfinder)
            if viewModel.selectedCategory == .sihyunhada {
                RadialGradient(
                    gradient: Gradient(colors: [
                        Color(hex: viewModel.selectedPersonalColor.hex).opacity(0.85),
                        Color(hex: viewModel.selectedPersonalColor.hex)
                    ]),
                    center: .center,
                    startRadius: 40,
                    endRadius: 280
                )
            } else {
                Color(red: 0.08, green: 0.08, blue: 0.09)
            }

            // Simulated Subject / Camera Feed Layer
            VStack {
                Spacer()
                Image(systemName: "person.crop.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 180, height: 180)
                    .foregroundColor(.white.opacity(0.85))
                    .shadow(color: .black.opacity(0.3), radius: 10)
                Spacer()
            }

            // Grid Overlay (if enabled)
            if viewModel.isGridEnabled {
                GeometryReader { geo in
                    let w = geo.size.width
                    let h = geo.size.height
                    Path { p in
                        // Vertical lines (Rule of Thirds)
                        p.move(to: CGPoint(x: w / 3, y: 0))
                        p.addLine(to: CGPoint(x: w / 3, y: h))
                        p.move(to: CGPoint(x: 2 * w / 3, y: 0))
                        p.addLine(to: CGPoint(x: 2 * w / 3, y: h))

                        // Horizontal lines
                        p.move(to: CGPoint(x: 0, y: h / 3))
                        p.addLine(to: CGPoint(x: w, y: h / 3))
                        p.move(to: CGPoint(x: 0, y: 2 * h / 3))
                        p.addLine(to: CGPoint(x: w, y: 2 * h / 3))
                    }
                    .stroke(Color.white.opacity(0.18), lineWidth: 0.8)
                }
            }

            // Dynamic Camera OSD
            ViewfinderOSDOverlay(viewModel: viewModel)

            // Mounted Optical Lens Badge
            if let optical = viewModel.activeOpticalFilter {
                VStack {
                    HStack {
                        Spacer()
                        HStack(spacing: 4) {
                            Image(systemName: optical.iconName)
                            Text(optical.localizedName)
                                .font(.system(size: 9, weight: .bold))
                        }
                        .padding(.horizontal, 6)
                        .padding(.vertical, 3)
                        .background(Color.yellow.opacity(0.85))
                        .foregroundColor(.black)
                        .cornerRadius(4)
                        .padding(.top, 40)
                        .padding(.trailing, 10)
                    }
                    Spacer()
                }
            }

            // Shutter Flash Animation Overlay
            if viewModel.isShutterFlashing {
                Color.white
                    .transition(.opacity)
            }
        }
        .aspectRatio(3.0 / 4.0, contentMode: .fit)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.white.opacity(0.12), lineWidth: 1)
        )
        .clipped()
    }
}
