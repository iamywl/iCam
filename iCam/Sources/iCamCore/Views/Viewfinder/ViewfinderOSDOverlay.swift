import SwiftUI

/// Dynamic retro OSD overlay matching the currently selected iconic camera
public struct ViewfinderOSDOverlay: View {
    @ObservedObject var viewModel: CameraViewModel

    public init(viewModel: CameraViewModel) {
        self.viewModel = viewModel
    }

    public var body: some View {
        ZStack {
            switch viewModel.selectedCategory {
            case .canonIXY:
                canonIXYOverlay
            case .sonyHandycam:
                sonyHandycamOverlay
            case .sonyCybershot:
                sonyCybershotOverlay
            case .fujiInstax:
                fujiInstaxOverlay
            case .sihyunhada:
                sihyunhadaOverlay
            case .passportID:
                passportIDOverlay
            }
        }
        .allowsHitTesting(false)
    }

    // MARK: - 1. Canon IXY OSD
    private var canonIXYOverlay: some View {
        VStack {
            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "camera.fill")
                    Text("IXY DIGITAL 50")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                }
                .foregroundColor(.white.opacity(0.85))

                Spacer()

                Text("AiAF")
                    .font(.system(size: 11, weight: .black, design: .monospaced))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.green.opacity(0.8))
                    .foregroundColor(.black)
                    .cornerRadius(3)
            }
            .padding(12)

            Spacer()

            // Center Focus Bracket
            RoundedRectangle(cornerRadius: 3)
                .stroke(Color.green.opacity(0.85), lineWidth: 1.5)
                .frame(width: 70, height: 50)

            Spacer()

            HStack {
                Spacer()
                // Authentic orange Y2K digital date stamp
                Text("'26 10 05")
                    .font(.system(size: 15, weight: .heavy, design: .monospaced))
                    .foregroundColor(Color(red: 1.0, green: 0.55, blue: 0.0))
                    .shadow(color: .black, radius: 1, x: 1, y: 1)
                    .padding(12)
            }
        }
    }

    // MARK: - 2. Sony Handycam OSD
    private var sonyHandycamOverlay: some View {
        VStack {
            HStack {
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 8, height: 8)
                    Text("REC")
                        .font(.system(size: 12, weight: .black, design: .monospaced))
                        .foregroundColor(.red)
                }

                Spacer()

                Text("SP 0:00:14")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)
            }
            .padding(12)

            HStack {
                Text("DCR-PC100")
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.7))
                Spacer()
                Text("DV STEREO")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(.horizontal, 12)

            Spacer()

            // Crosshair
            Image(systemName: "plus")
                .font(.system(size: 18, weight: .thin))
                .foregroundColor(.white.opacity(0.5))

            Spacer()

            HStack {
                Text("SONY Hi8")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.6))
                Spacer()
                HStack(spacing: 3) {
                    Image(systemName: "battery.75")
                    Text("85min")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                }
                .foregroundColor(.white)
            }
            .padding(12)
        }
    }

    // MARK: - 3. Sony Cyber-shot OSD
    private var sonyCybershotOverlay: some View {
        VStack {
            HStack {
                Text("Cyber-shot")
                    .font(.system(size: 12, weight: .black, design: .rounded))
                    .foregroundColor(Color.cyan)
                Spacer()
                Text("5.1 MEGAPIXELS")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.8))
            }
            .padding(12)

            Spacer()

            // 4-corner focus brackets
            ZStack {
                RoundedRectangle(cornerRadius: 4)
                    .stroke(Color.cyan.opacity(0.6), lineWidth: 1)
                    .frame(width: 90, height: 90)
            }

            Spacer()

            HStack {
                Text("DSC-P10")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.7))
                Spacer()
                Text("ISO 100")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(.yellow)
            }
            .padding(12)
        }
    }

    // MARK: - 4. Fuji Instax OSD
    private var fujiInstaxOverlay: some View {
        VStack {
            HStack {
                Text("instax mini")
                    .font(.system(size: 12, weight: .medium, design: .serif))
                    .italic()
                    .foregroundColor(.black.opacity(0.6))
                Spacer()
                Text("REMAIN [10]")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.black.opacity(0.1))
                    .foregroundColor(.black)
                    .cornerRadius(4)
            }
            .padding(12)

            Spacer()

            Text("FUJIFILM INSTANT FILM")
                .font(.system(size: 9, weight: .semibold, design: .monospaced))
                .foregroundColor(.black.opacity(0.35))
                .padding(.bottom, 12)
        }
    }

    // MARK: - 5. 시현하다 OSD
    private var sihyunhadaOverlay: some View {
        VStack {
            HStack {
                Text("\(viewModel.studioSubjectName)'s Moment")
                    .font(.system(size: 12, weight: .bold, design: .serif))
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Color.black.opacity(0.4))
                    .cornerRadius(12)

                Spacer()

                Text(viewModel.selectedPersonalColor.name)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color(hex: viewModel.selectedPersonalColor.hex).opacity(0.85))
                    .cornerRadius(8)
            }
            .padding(12)

            Spacer()

            HStack {
                Text("Sihyunhada Archive 2026")
                    .font(.system(size: 9, weight: .medium, design: .serif))
                    .italic()
                    .foregroundColor(.white.opacity(0.8))
                Spacer()
                Text("Signed by Artist")
                    .font(.system(size: 9, weight: .regular, design: .serif))
                    .foregroundColor(.white.opacity(0.8))
            }
            .padding(12)
        }
    }

    // MARK: - 6. Passport ID OSD
    private var passportIDOverlay: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            let spec = viewModel.selectedPassportSpec

            ZStack {
                if viewModel.showPassportGuideLines {
                    // Crown line
                    Path { p in
                        p.move(to: CGPoint(x: 20, y: h * spec.crownLineRatio))
                        p.addLine(to: CGPoint(x: w - 20, y: h * spec.crownLineRatio))
                    }
                    .stroke(Color.red.opacity(0.8), style: StrokeStyle(lineWidth: 1, dash: [4, 4]))

                    // Eye line
                    Path { p in
                        p.move(to: CGPoint(x: 20, y: h * spec.eyeLineRatio))
                        p.addLine(to: CGPoint(x: w - 20, y: h * spec.eyeLineRatio))
                    }
                    .stroke(Color.blue.opacity(0.8), style: StrokeStyle(lineWidth: 1, dash: [4, 4]))

                    // Chin line
                    Path { p in
                        p.move(to: CGPoint(x: 20, y: h * spec.chinLineRatio))
                        p.addLine(to: CGPoint(x: w - 20, y: h * spec.chinLineRatio))
                    }
                    .stroke(Color.green.opacity(0.8), style: StrokeStyle(lineWidth: 1, dash: [4, 4]))

                    // Face Oval Guide
                    Ellipse()
                        .stroke(Color.white.opacity(0.6), lineWidth: 1.5)
                        .frame(width: w * 0.55, height: h * 0.52)
                        .position(x: w / 2, y: h * 0.44)
                }

                VStack {
                    HStack {
                        Text(spec.name)
                            .font(.system(size: 11, weight: .bold))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.blue.opacity(0.8))
                            .foregroundColor(.white)
                            .cornerRadius(4)
                        Spacer()
                        Text(spec.dimensionsMM)
                            .font(.system(size: 10, weight: .semibold, design: .monospaced))
                            .foregroundColor(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.black.opacity(0.5))
                            .cornerRadius(3)
                    }
                    .padding(10)

                    Spacer()

                    HStack {
                        Text("● 규격 가이드라인 충족 (적정 거리)")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.green)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.black.opacity(0.6))
                            .cornerRadius(4)
                        Spacer()
                    }
                    .padding(10)
                }
            }
        }
    }
}

// MARK: - Color Hex Extension
public extension Color {
    init(hex: String) {
        var clean = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        if clean.hasPrefix("#") { clean.removeFirst() }
        let scanner = Scanner(string: clean)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        let r = Double((rgb >> 16) & 0xFF) / 255.0
        let g = Double((rgb >> 8) & 0xFF) / 255.0
        let b = Double(rgb & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}
