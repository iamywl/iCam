import Foundation
import CoreImage
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
import FilterEngine

@main
struct FilterEngineTestsRunner {
    static func main() throws {
        print("=== FilterEngine Optical & Metal Shader Verification ===")
        let processor = try MetalFilterProcessor()
        let catalog = try RecipeLoader.loadCatalog()
        assertEqual(catalog.aesthetics.count, 15, "Expected 15 curated aesthetics")
        print("[PASS] Loaded \(catalog.aesthetics.count) recipes from shared/recipes.json on Metal GPU: \(processor.device.name)")

        // 1. Create calibrated synthetic scene (180x180) with distinct photographic regions:
        //    - Top-left: Blue sky (85, 145, 220)
        //    - Top-right: Foliage green (60, 130, 58)
        //    - Center-left: Portrait skin 25 deg orange (214, 166, 138) + shadow jaw (110, 82, 68)
        //    - Center-right: Neutral white collar (242, 242, 242) + 18% middle gray (128, 128, 128)
        //    - Bottom: Dark night alley (18, 22, 28) with a bright point lamp (255, 252, 240) at (135, 150)
        let w = 180, h = 180
        let sceneCG = makeCalibrationScene(width: w, height: h)
        let sceneCI = CIImage(cgImage: sceneCG)

        // Check Stock Baseline (zero distortion + zero vertical flip)
        let stockOut = try processor.renderCGImage(input: sceneCI, recipe: .stockBaseline, seed: 1)
        let stockPixels = extractRGBA8(stockOut)
        let skySample = samplePixel(stockPixels, width: w, x: 30, y: 25)
        let darkSample = samplePixel(stockPixels, width: w, x: 30, y: 155)
        assertTrue(skySample.b > darkSample.b + 120, "Orientation check failed: top sky must remain at top (sky=\(skySample), dark=\(darkSample))")
        let stockSkin = samplePixel(stockPixels, width: w, x: 45, y: 85)
        assertTrue(abs(Int(stockSkin.r) - 214) <= 3 && abs(Int(stockSkin.g) - 166) <= 3, "Stock passthrough accuracy failed: got \(stockSkin)")
        print("[PASS] Stock baseline parity & orientation exact (skin=\(stockSkin))")

        // 2. Audit all 8 flagship aesthetics on calibrated patches
        var renderedFrames: [(String, CGImage)] = [("00 STOCK", stockOut)]

        for recipe in catalog.aesthetics {
            let outCG = try processor.renderCGImage(input: sceneCI, recipe: recipe, seed: 7)
            renderedFrames.append((recipe.shortLabel, outCG))
            let px = extractRGBA8(outCG)

            let skin = samplePixel(px, width: w, x: 45, y: 85)
            let collar = samplePixel(px, width: w, x: 135, y: 85)
            let green = samplePixel(px, width: w, x: 135, y: 25)
            let sky = samplePixel(px, width: w, x: 30, y: 25)
            let nightBg = samplePixel(px, width: w, x: 30, y: 155)
            let haloRing = samplePixel(px, width: w, x: 142, y: 150) // 2px outside bright night lamp edge!

            if recipe.monochrome.enabled {
                if recipe.id == "07_pure_monochrome" {
                    assertTrue(skin.r == skin.g && skin.g == skin.b, "\(recipe.id): Pure mono must have R==G==B, got \(skin)")
                    assertTrue(skin.r > sky.r + 25, "\(recipe.id): Orange-filter mono should lift skin above blue sky (skin=\(skin.r), sky=\(sky.r))")
                } else if recipe.id == "12_platinum_print" {
                    assertTrue(Int(collar.r) >= Int(collar.b) && Int(collar.r) - Int(collar.b) <= 22, "12 Platinum warm fiber white without sepia mud: collar=\(collar)")
                    assertTrue(skin.r > 135, "12 Platinum skin luminousity too dark: skin=\(skin)")
                } else if recipe.id == "15_wet_plate_ortho" {
                    assertTrue(sky.b > skin.b + 10 || sky.r > skin.r + 10, "15 Wet-Plate ortho should lift sky above shadowed orange skin (sky=\(sky), skin=\(skin))")
                    assertTrue(skin.r >= 105, "15 Wet-Plate ortho must keep skin dignified above murky crush: skin=\(skin)")
                }
            } else {
                // Skin Tone Dignity: Red must remain dominant over Green & Blue on healthy peach skin
                assertTrue(skin.r > skin.g + 12 && skin.g > skin.b - 6, "\(recipe.id): Unhealthy skin hue cast! got \(skin)")
                // Separation from Stock: at least one test region must visibly transform
                let deltaSkin = abs(Int(skin.r) - Int(stockSkin.r)) + abs(Int(skin.g) - Int(stockSkin.g)) + abs(Int(skin.b) - Int(stockSkin.b))
                let deltaCollar = abs(Int(collar.r) - 242) + abs(Int(collar.b) - 242)
                let deltaNight = abs(Int(nightBg.r) - 18) + abs(Int(nightBg.g) - 22) + abs(Int(nightBg.b) - 28)
                let deltaGreen = abs(Int(green.r) - 60) + abs(Int(green.g) - 130) + abs(Int(green.b) - 58)
                let totalDelta = deltaSkin + deltaCollar + deltaNight + deltaGreen
                assertTrue(totalDelta >= 28, "\(recipe.id): Too subtle / indistinguishable from Stock (delta=\(totalDelta))")
            }

            if recipe.id == "02_airy_summer" {
                let lumaAiry = 0.2126 * Float(skin.r) + 0.7152 * Float(skin.g) + 0.0722 * Float(skin.b)
                let lumaStock = 0.2126 * Float(stockSkin.r) + 0.7152 * Float(stockSkin.g) + 0.0722 * Float(stockSkin.b)
                assertTrue(lumaAiry > lumaStock + 8.0, "02 Airy Summer must lift skin luminance cleanly (airy=\(lumaAiry), stock=\(lumaStock))")
                assertTrue(green.b > green.r, "02 Airy Summer foliage should shift cool emerald (green patch=\(green))")
            }

            if recipe.id == "03_y2k_flash" {
                let nearCollarEdge = samplePixel(px, width: w, x: 135, y: 108)
                let farFromCollar = samplePixel(px, width: w, x: 135, y: 117)
                let verticalLampBloom = samplePixel(px, width: w, x: 135, y: 141)
                let horizontalLampBloom = samplePixel(px, width: w, x: 144, y: 150)
                assertTrue(abs(Int(collar.r) - Int(collar.b)) <= 16, "03 Y2K CCD collar should remain clean without heavy cyan bleed: \(collar)")
                assertTrue(abs(Int(nearCollarEdge.b) - Int(farFromCollar.b)) <= 12, "03 Y2K CCD must not smear vertical glow onto mid-gray below white collar (near=\(nearCollarEdge), far=\(farFromCollar))")
                assertTrue(Int(verticalLampBloom.b) >= Int(horizontalLampBloom.b), "03 Y2K CCD vertical lamp smear should extend vertically above bright point light (v=\(verticalLampBloom), h=\(horizontalLampBloom))")
            }

            if recipe.id == "04_nocturne_cinema" {
                // White shirt collar must stay clean without orange staining
                assertTrue(Int(collar.r) - Int(collar.b) < 28, "04 Nocturne white collar stained orange! collar=\(collar)")
                // Point light halo ring in dark night should show warm red bloom!
                assertTrue(Int(haloRing.r) > Int(haloRing.b) + 18, "04 Nocturne missing red point-source halation halo! ring=\(haloRing)")
            }

            if recipe.id == "05_lofi_youth" {
                assertTrue(Int(collar.g) - Int(collar.r) <= 18, "05 Lo-Fi Youth collar overly mint tinted: \(collar)")
            }

            if recipe.id == "06_editorial_mf" {
                assertTrue(abs(Int(collar.r) - Int(collar.b)) <= 2 && abs(Int(collar.r) - Int(collar.g)) <= 2, "06 Editorial white collar must stay strictly neutral! collar=\(collar)")
            }

            if recipe.id == "09_slide_reversal" {
                assertTrue(nightBg.r <= 24 && nightBg.g <= 26, "09 Slide Reversal should maintain deep velvety blacks: night=\(nightBg)")
                assertTrue(abs(Int(collar.r) - Int(collar.b)) <= 14, "09 Slide Reversal white collar must stay crisp: collar=\(collar)")
            }

            if recipe.id == "10_chrome_mute" {
                let greenChroma = abs(Int(green.g) - Int(green.r))
                assertTrue(greenChroma < 62, "10 Chrome Mute foliage should look restrained vs stock (green=\(green))")
            }

            if recipe.id == "11_bleach_enr" {
                let greenSpread = max(green.r, green.g, green.b) - min(green.r, green.g, green.b)
                assertTrue(greenSpread < 65, "11 Bleach ENR must show silver-retained desaturation (green=\(green))")
                assertTrue(Int(skin.r) > Int(skin.g) + 12, "11 Bleach ENR must preserve living skin warmth (skin=\(skin))")
            }

            if recipe.id == "13_daylight_cinema" {
                assertTrue(Int(collar.r) - Int(collar.b) < 20, "13 50D Cine white collar stays daylight clean (collar=\(collar))")
                assertTrue(Int(haloRing.r) > Int(haloRing.b) + 12, "13 50D Cine missing crisp daylight point-source halation (ring=\(haloRing))")
            }

            if recipe.id == "14_candle_chiaroscuro" {
                assertTrue(nightBg.b <= 28, "14 Candle 2700 must anchor deep mahogany/obsidian blacks (night=\(nightBg))")
                assertTrue(Int(collar.r) - Int(collar.b) < 34, "14 Candle 2700 collar must avoid dirty Cheeto stain (collar=\(collar))")
                assertTrue(Int(haloRing.r) > Int(haloRing.b) + 16, "14 Candle 2700 missing warm candle halation (ring=\(haloRing))")
            }

            print("[PASS] \(recipe.shortLabel) -> skin=\(skin) collar=\(collar) green=\(green) night=\(nightBg) halo=\(haloRing)")
        }

        // 3. Verify 3D .cube LUT Export
        let cubeText = try LUTExporter.exportCubeLUT(processor: processor, recipe: catalog.aesthetics[0], dimension: 17)
        assertTrue(cubeText.contains("LUT_3D_SIZE 17"), "LUT header missing")
        let rowCount = cubeText.split(separator: "\n").count
        assertEqual(rowCount, 4 + 17 * 17 * 17, "Unexpected LUT row count")
        print("[PASS] 3D .cube LUT exporter validated (\(rowCount) lines)")

        // 4. Write a clean 4x4 calibration sheet PNG into scratch dir for visual inspection
        let sheetURL = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
            .appendingPathComponent(".build/calibration_sheet.png")
        try FileManager.default.createDirectory(at: sheetURL.deletingLastPathComponent(), withIntermediateDirectories: true)
        try writeContactSheetPNG(frames: renderedFrames, cellSize: w, to: sheetURL)
        print("[PASS] Rendered \(renderedFrames.count)-up calibration contact sheet at \(sheetURL.path)")
    }

    static func makeCalibrationScene(width: Int, height: Int) -> CGImage {
        var bytes = [UInt8](repeating: 255, count: width * height * 4)
        for y in 0..<height {
            for x in 0..<width {
                var r: UInt8 = 128, g: UInt8 = 128, b: UInt8 = 128
                if y < 60 {
                    if x < width / 2 {
                        // Sky Blue
                        r = 85; g = 145; b = 220
                    } else {
                        // Foliage Green
                        r = 60; g = 130; b = 58
                    }
                } else if y < 120 {
                    if x < width / 2 {
                        // Portrait Skin (with subtle gradient)
                        if y > 102 {
                            r = 115; g = 86; b = 70
                        } else {
                            r = 214; g = 166; b = 138
                        }
                    } else {
                        // White Shirt + Mid Gray Strip
                        if y > 105 {
                            r = 128; g = 128; b = 128
                        } else {
                            r = 242; g = 242; b = 242
                        }
                    }
                } else {
                    // Night Alley + Bright Point Lamp at (135, 150) radius 5
                    r = 18; g = 22; b = 28
                    let dx = x - 135
                    let dy = y - 150
                    if dx * dx + dy * dy <= 25 {
                        r = 255; g = 252; b = 240
                    }
                }
                let p = (y * width + x) * 4
                bytes[p] = r; bytes[p + 1] = g; bytes[p + 2] = b; bytes[p + 3] = 255
            }
        }
        let data = Data(bytes)
        let provider = CGDataProvider(data: data as CFData)!
        return CGImage(
            width: width, height: height,
            bitsPerComponent: 8, bitsPerPixel: 32, bytesPerRow: width * 4,
            space: CGColorSpace(name: CGColorSpace.sRGB)!,
            bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue),
            provider: provider, decode: nil, shouldInterpolate: false, intent: .defaultIntent
        )!
    }

    static func extractRGBA8(_ cg: CGImage) -> [UInt8] {
        let w = cg.width, h = cg.height
        var buf = [UInt8](repeating: 0, count: w * h * 4)
        let ctx = CGContext(
            data: &buf, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
            space: CGColorSpace(name: CGColorSpace.sRGB)!,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        )!
        ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
        return buf
    }

    static func samplePixel(_ buf: [UInt8], width: Int, x: Int, y: Int) -> (r: UInt8, g: UInt8, b: UInt8) {
        let p = (y * width + x) * 4
        return (buf[p], buf[p + 1], buf[p + 2])
    }

    static func writeContactSheetPNG(frames: [(String, CGImage)], cellSize: Int, to url: URL) throws {
        let gap = 12
        let cols = frames.count <= 9 ? 3 : 4
        let rows = max(1, (frames.count + cols - 1) / cols)
        let sheetW = cellSize * cols + gap * (cols + 1)
        let sheetH = cellSize * rows + gap * (rows + 1)
        let ctx = CGContext(
            data: nil, width: sheetW, height: sheetH, bitsPerComponent: 8, bytesPerRow: sheetW * 4,
            space: CGColorSpace(name: CGColorSpace.sRGB)!,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        )!
        // Neutral #181818 mat background
        ctx.setFillColor(CGColor(srgbRed: 24.0 / 255.0, green: 24.0 / 255.0, blue: 24.0 / 255.0, alpha: 1.0))
        ctx.fill(CGRect(x: 0, y: 0, width: sheetW, height: sheetH))

        for (i, item) in frames.enumerated() {
            let col = i % cols
            let row = i / cols
            let x = gap + col * (cellSize + gap)
            // CGContext y=0 is bottom-left
            let y = sheetH - gap - (row + 1) * cellSize - row * gap
            ctx.draw(item.1, in: CGRect(x: x, y: y, width: cellSize, height: cellSize))
        }

        let img = ctx.makeImage()!
        let dest = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil)!
        CGImageDestinationAddImage(dest, img, nil)
        CGImageDestinationFinalize(dest)
    }

    static func assertTrue(_ cond: Bool, _ msg: String) {
        if !cond {
            fputs("ASSERTION FAILED: \(msg)\n", stderr)
            exit(1)
        }
    }

    static func assertEqual<T: Equatable>(_ a: T, _ b: T, _ msg: String) {
        if a != b {
            fputs("ASSERTION FAILED: \(msg) (\(a) != \(b))\n", stderr)
            exit(1)
        }
    }
}
