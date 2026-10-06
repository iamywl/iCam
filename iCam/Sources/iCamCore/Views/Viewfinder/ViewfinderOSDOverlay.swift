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
            case .colorStudio:
                colorStudioOverlay
            case .passportID:
                passportIDOverlay
            case .olympusMju:
                olympusMjuOverlay
            case .contaxT2:
                contaxT2Overlay
            case .ricohGR:
                ricohGROverlay
            case .leicaM:
                leicaMOverlay
            case .cityPop80s:
                cityPopOverlay
            case .oldFilm:
                oldFilmOverlay
            case .hasselblad:
                hasselbladOverlay
            case .polaroidSX70:
                polaroidSX70Overlay
            case .fujiQuickSnap:
                fujiQuickSnapOverlay
            case .kyoceraSamurai:
                kyoceraSamuraiOverlay
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

    // MARK: - 5. Color Studio OSD
    private var colorStudioOverlay: some View {
        VStack {
            HStack {
                Text("\(viewModel.studioSubjectName)'s Portrait")
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
                Text("Color Studio Archive 2026")
                    .font(.system(size: 9, weight: .medium, design: .serif))
                    .italic()
                    .foregroundColor(.white.opacity(0.8))
                Spacer()
                Text("Personal Color Profile")
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

    // MARK: - 7. Olympus μ [mju:] II OSD
    private var olympusMjuOverlay: some View {
        VStack {
            HStack {
                HStack(spacing: 4) {
                    Text("OLYMPUS")
                        .font(.system(size: 11, weight: .black, design: .default))
                    Text("μ [mju:]-II")
                        .font(.system(size: 11, weight: .bold, design: .serif))
                        .italic()
                }
                .foregroundColor(Color(red: 0.95, green: 0.85, blue: 0.65))

                Spacer()

                HStack(spacing: 4) {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 10))
                    Text("AUTO")
                        .font(.system(size: 9, weight: .heavy, design: .monospaced))
                }
                .foregroundColor(Color.orange)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(Color.black.opacity(0.5))
                .cornerRadius(3)
            }
            .padding(12)

            Spacer()

            // Classic 90s AF ellipse bracket: ( [  ] )
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.white.opacity(0.4), lineWidth: 1)
                    .frame(width: 80, height: 44)

                HStack(spacing: 24) {
                    Text("[")
                        .font(.system(size: 14, weight: .bold, design: .monospaced))
                    Text("]")
                        .font(.system(size: 14, weight: .bold, design: .monospaced))
                }
                .foregroundColor(.green.opacity(0.8))
            }

            Spacer()

            HStack {
                Text("35mm F2.8")
                    .font(.system(size: 10, weight: .semibold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.7))
                Spacer()
                Text("S [24]")
                    .font(.system(size: 11, weight: .black, design: .monospaced))
                    .foregroundColor(Color(red: 1.0, green: 0.6, blue: 0.2))
            }
            .padding(12)
        }
    }

    // MARK: - 8. Contax T2 OSD
    private var contaxT2Overlay: some View {
        VStack {
            HStack {
                Text("CONTAX T2")
                    .font(.system(size: 12, weight: .heavy, design: .default))
                    .foregroundColor(.white)
                Spacer()
                Text("Carl Zeiss T*")
                    .font(.system(size: 10, weight: .bold, design: .serif))
                    .foregroundColor(Color(red: 0.9, green: 0.3, blue: 0.3))
            }
            .padding(12)

            Spacer()

            // Center-weighted circle & aperture badge
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.45), lineWidth: 1)
                    .frame(width: 60, height: 60)

                Text("f/2.8")
                    .font(.system(size: 10, weight: .black, design: .monospaced))
                    .foregroundColor(Color(red: 0.6, green: 0.9, blue: 0.6))
                    .offset(y: 42)
            }

            Spacer()

            HStack {
                Text("TITANIUM")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(Color(hex: "#8D99AE"))
                Spacer()
                HStack(spacing: 8) {
                    Text("1/500")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundColor(.green)
                    Text("±0.0")
                        .font(.system(size: 10, weight: .medium, design: .monospaced))
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            .padding(12)
        }
    }

    // MARK: - 9. Ricoh GR Digital OSD
    private var ricohGROverlay: some View {
        VStack {
            HStack {
                HStack(spacing: 4) {
                    Text("GR")
                        .font(.system(size: 13, weight: .black, design: .monospaced))
                        .foregroundColor(.red)
                    Text("DIGITAL")
                        .font(.system(size: 10, weight: .heavy, design: .monospaced))
                        .foregroundColor(.white)
                }

                Spacer()

                Text("SNAP 2.5m")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(.yellow)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.black.opacity(0.6))
                    .cornerRadius(3)
            }
            .padding(12)

            Spacer()

            // Minimal street snap crosshair with 28mm wide guides
            ZStack {
                RoundedRectangle(cornerRadius: 2)
                    .stroke(Color.white.opacity(0.35), lineWidth: 1)
                    .frame(width: 140, height: 100)

                Image(systemName: "plus")
                    .font(.system(size: 14, weight: .light))
                    .foregroundColor(.green.opacity(0.9))
            }

            Spacer()

            HStack {
                Text("F2.8 1/250")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)
                Spacer()
                Text("ISO 400 • 28mm")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.75))
            }
            .padding(12)
        }
    }

    // MARK: - 10. Leica M OSD
    private var leicaMOverlay: some View {
        VStack {
            HStack {
                HStack(spacing: 5) {
                    Circle()
                        .fill(Color.red)
                        .frame(width: 14, height: 14)
                        .overlay(
                            Text("L")
                                .font(.system(size: 9, weight: .black, design: .serif))
                                .foregroundColor(.white)
                        )
                    Text("LEICA M6")
                        .font(.system(size: 11, weight: .heavy, design: .monospaced))
                        .foregroundColor(.white)
                }

                Spacer()

                Text("[ 18 ]")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(.yellow)
            }
            .padding(12)

            Spacer()

            // Rangefinder split-prism focusing patch and 35mm frameline marks
            ZStack {
                // 35mm Frameline
                Rectangle()
                    .stroke(Color.white.opacity(0.35), lineWidth: 1)
                    .frame(width: 220, height: 160)

                // Split Rangefinder Patch in Center
                Rectangle()
                    .stroke(Color.yellow.opacity(0.7), lineWidth: 1.2)
                    .frame(width: 38, height: 26)
            }

            Spacer()

            HStack {
                Text("SUMMILUX 1:1.4/35")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.8))

                Spacer()

                // Classic Leica M6 LED metering readout: ◄ ● ►
                HStack(spacing: 4) {
                    Text("◄")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.red.opacity(0.4))
                    Text("●")
                        .font(.system(size: 10, weight: .black))
                        .foregroundColor(.red)
                    Text("►")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.red.opacity(0.4))
                }
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(Color.black.opacity(0.5))
                .cornerRadius(4)
            }
            .padding(12)
        }
    }

    // MARK: - 11. 80s City Pop OSD
    private var cityPopOverlay: some View {
        VStack {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("TDK SA-90")
                        .font(.system(size: 11, weight: .black, design: .monospaced))
                        .foregroundColor(Color(hex: "#FF007F"))
                    Text("PACIFIC SOUND 1986")
                        .font(.system(size: 8, weight: .semibold, design: .monospaced))
                        .foregroundColor(.cyan)
                }

                Spacer()

                HStack(spacing: 3) {
                    Text("DOLBY B-NR")
                        .font(.system(size: 8, weight: .heavy, design: .monospaced))
                        .foregroundColor(.white)
                    Circle()
                        .fill(Color.green)
                        .frame(width: 6, height: 6)
                }
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(Color.black.opacity(0.6))
                .cornerRadius(4)
            }
            .padding(12)

            Spacer()

            // Cassette tape spool crosshair & vintage visualizer bar
            VStack(spacing: 12) {
                HStack(spacing: 30) {
                    Circle()
                        .stroke(Color.cyan.opacity(0.5), lineWidth: 1.5)
                        .frame(width: 28, height: 28)
                        .overlay(Image(systemName: "asterisk").foregroundColor(.cyan.opacity(0.7)).font(.system(size: 12)))
                    Circle()
                        .stroke(Color(hex: "#FF007F").opacity(0.5), lineWidth: 1.5)
                        .frame(width: 28, height: 28)
                        .overlay(Image(systemName: "asterisk").foregroundColor(Color(hex: "#FF007F").opacity(0.7)).font(.system(size: 12)))
                }

                // Retro Graphic EQ indicator
                Text("L ■■■■■■□□  R ■■■■■□□□")
                    .font(.system(size: 9, weight: .black, design: .monospaced))
                    .foregroundColor(.yellow.opacity(0.9))
            }

            Spacer()

            HStack {
                Text("SIDE A • PLASTIC LOVE")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.85))
                Spacer()
                Text("TAPE [ 042 ]")
                    .font(.system(size: 10, weight: .heavy, design: .monospaced))
                    .foregroundColor(Color(hex: "#FF007F"))
            }
            .padding(12)
        }
    }

    // MARK: - 12. Old Film Studio OSD
    private var oldFilmOverlay: some View {
        VStack {
            HStack {
                HStack(spacing: 4) {
                    Text("🎞️")
                        .font(.system(size: 10))
                    Text("35mm COLOR NEGATIVE")
                        .font(.system(size: 10, weight: .heavy, design: .monospaced))
                        .foregroundColor(Color(hex: "#D4A373"))
                }

                Spacer()

                Text("ISO 800T")
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(.white)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color(red: 0.8, green: 0.1, blue: 0.1).opacity(0.8))
                    .cornerRadius(3)
            }
            .padding(12)

            Spacer()

            // 35mm Frame Sprocket & Center Notch
            ZStack {
                RoundedRectangle(cornerRadius: 4)
                    .stroke(Color(hex: "#D4A373").opacity(0.4), lineWidth: 1)
                    .frame(width: 180, height: 120)

                Image(systemName: "camera.metering.center.weighted")
                    .font(.system(size: 20))
                    .foregroundColor(.white.opacity(0.3))
            }

            Spacer()

            HStack {
                Text("CINE 800T / PORTRA 400")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.7))
                Spacer()
                Text("EXP 24A ►")
                    .font(.system(size: 10, weight: .heavy, design: .monospaced))
                    .foregroundColor(Color(hex: "#D4A373"))
            }
            .padding(12)
        }
    }

    // MARK: - 13. Hasselblad 500C/M Waist-Level Finder OSD
    private var hasselbladOverlay: some View {
        ZStack {
            // 6x6 Square Waist-Level Crop Lines
            Rectangle()
                .stroke(Color.white.opacity(0.4), lineWidth: 1)
                .aspectRatio(1, contentMode: .fit)
                .padding(20)

            // Center Crosshair
            Image(systemName: "plus")
                .font(.system(size: 16, weight: .light))
                .foregroundColor(.white.opacity(0.6))

            VStack {
                HStack {
                    Text("HASSELBLAD 500C/M")
                        .font(.system(size: 10, weight: .heavy, design: .serif))
                        .foregroundColor(Color(hex: "#9A8C98"))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.black.opacity(0.5))
                        .cornerRadius(3)
                    Spacer()
                    Text("A12 • 6x6")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundColor(.white.opacity(0.85))
                }
                .padding(12)

                Spacer()

                HStack {
                    Text("Carl Zeiss Planar 2.8/80 T*")
                        .font(.system(size: 9, weight: .semibold, design: .serif))
                        .foregroundColor(.white.opacity(0.75))
                    Spacer()
                    Text("1/250  f/2.8")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(hex: "#9A8C98"))
                }
                .padding(12)
            }
        }
    }

    // MARK: - 14. Polaroid SX-70 Vintage Folding OSD
    private var polaroidSX70Overlay: some View {
        ZStack {
            // Split-Image Rangefinder Central Focus Circle
            Circle()
                .stroke(Color(hex: "#C9A227").opacity(0.65), lineWidth: 1.5)
                .frame(width: 54, height: 54)
                .overlay(
                    Rectangle()
                        .frame(width: 48, height: 1)
                        .foregroundColor(Color(hex: "#C9A227").opacity(0.5))
                )

            VStack {
                HStack {
                    HStack(spacing: 3) {
                        Rectangle().frame(width: 4, height: 10).foregroundColor(.red)
                        Rectangle().frame(width: 4, height: 10).foregroundColor(.orange)
                        Rectangle().frame(width: 4, height: 10).foregroundColor(.yellow)
                        Rectangle().frame(width: 4, height: 10).foregroundColor(.green)
                        Rectangle().frame(width: 4, height: 10).foregroundColor(.blue)
                        Text("SX-70 LAND CAMERA")
                            .font(.system(size: 9, weight: .black, design: .default))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(Color.black.opacity(0.6))
                    .cornerRadius(4)

                    Spacer()

                    Text("ALPHA 1")
                        .font(.system(size: 9, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(hex: "#C9A227"))
                }
                .padding(12)

                Spacer()

                HStack {
                    Text("116mm F/8 4-ELEMENT GLASS")
                        .font(.system(size: 8, weight: .semibold, design: .monospaced))
                        .foregroundColor(.white.opacity(0.7))
                    Spacer()
                    Text("10.4 INCH TO ∞")
                        .font(.system(size: 9, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(hex: "#C9A227"))
                }
                .padding(12)
            }
        }
    }

    // MARK: - 15. Fuji QuickSnap OSD
    private var fujiQuickSnapOverlay: some View {
        VStack {
            HStack {
                HStack(spacing: 4) {
                    Circle().frame(width: 6, height: 6).foregroundColor(.green)
                    Text("FUJICOLOR 写ルンです")
                        .font(.system(size: 10, weight: .black, design: .default))
                        .foregroundColor(.white)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color(hex: "#007A33").opacity(0.85))
                .cornerRadius(4)

                Spacer()

                HStack(spacing: 4) {
                    Image(systemName: "bolt.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.yellow)
                    Text("FLASH READY")
                        .font(.system(size: 9, weight: .bold, design: .monospaced))
                        .foregroundColor(.white)
                }
                .padding(.horizontal, 6)
                .padding(.vertical, 3)
                .background(Color.black.opacity(0.6))
                .cornerRadius(3)
            }
            .padding(12)

            Spacer()

            HStack {
                Text("SUPER IA 400 32mm F/10")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.8))

                Spacer()

                HStack(spacing: 2) {
                    Text("REMAIN")
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(.white.opacity(0.7))
                    Text("[27]")
                        .font(.system(size: 12, weight: .heavy, design: .monospaced))
                        .foregroundColor(Color(hex: "#E85D04"))
                }
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(Color.black.opacity(0.7))
                .cornerRadius(3)
            }
            .padding(12)
        }
    }

    // MARK: - 16. Kyocera Samurai X3.0 OSD
    private var kyoceraSamuraiOverlay: some View {
        VStack {
            HStack {
                Text("SAMURAI X3.0")
                    .font(.system(size: 11, weight: .black, design: .monospaced))
                    .foregroundColor(Color(hex: "#E50914"))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.white.opacity(0.9))
                    .cornerRadius(3)

                Spacer()

                Text("HALF-FRAME 72")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .foregroundColor(.cyan)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.black.opacity(0.6))
                    .cornerRadius(3)
            }
            .padding(12)

            Spacer()

            // Half-frame split guide
            Rectangle()
                .stroke(Color.cyan.opacity(0.4), lineWidth: 1)
                .frame(width: 140, height: 210)

            Spacer()

            HStack {
                Text("25-75mm F/3.5-4.3 ZOOM")
                    .font(.system(size: 8, weight: .semibold, design: .monospaced))
                    .foregroundColor(.white.opacity(0.7))

                Spacer()

                Text("'88 11 04")
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                    .foregroundColor(Color(hex: "#FF8C00"))
            }
            .padding(12)
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
