import Foundation
import CoreImage
import iCamCore

@MainActor
func main() {
    print("==================================================")
    print("🚀 iCam Native Core & Modular Filter Engine Tests")
    print("==================================================")

    var passedCount = 0
    var failedCount = 0

    func assertTest(_ condition: Bool, _ testName: String) {
        if condition {
            print("  ✅ [PASS] \(testName)")
            passedCount += 1
        } else {
            print("  ❌ [FAIL] \(testName)")
            failedCount += 1
        }
    }

    let registry = FilterRegistry.shared
    let pipeline = FilterPipeline()

    // Test 1: Category Registration Check
    print("\n[Suite 1] Filter Registry & Modularity Inspection")
    for category in CameraCategory.allCases {
        let filters = registry.filters(for: category)
        assertTest(!filters.isEmpty, "Filters for '\(category.displayName)' registered")
        assertTest(filters.count >= 4, "\(category.displayName) has \(filters.count) filters (>= 4 required)")
        for filter in filters {
            print("     -> [\(category.displayName)] Filter: \(filter.name) (\(filter.localizedName)) [id: \(filter.id)]")
        }
    }

    // Test 2: Optical Filter Registration Check
    print("\n[Suite 2] Detachable Optical Lens Filters")
    let opticalFilters = registry.opticalFilters()
    assertTest(opticalFilters.count == 5, "5 Modular Optical Lens Filters Registered")
    for opt in opticalFilters {
        print("     -> [Lens] \(opt.name) (\(opt.localizedName)) [id: \(opt.id)]")
    }

    // Test 3: Image Processing Pipeline Execution
    print("\n[Suite 3] Image Processing Pipeline Execution")
    let color = CIColor(red: 0.8, green: 0.6, blue: 0.5)
    let testImage = CIImage(color: color).cropped(to: CGRect(x: 0, y: 0, width: 300, height: 400))

    for category in CameraCategory.allCases {
        let filters = registry.filters(for: category)
        for filter in filters {
            let output = pipeline.process(
                inputImage: testImage,
                filter: filter,
                opticalFilter: nil,
                opticalStrength: 0.0,
                filterIntensity: 0.9
            )
            let valid = output.extent.width == 300 && output.extent.height == 400
            assertTest(valid, "Render pipeline for \(category.displayName) -> \(filter.name)")
        }
    }

    // Test 4: Optical Lens Filter Chaining
    print("\n[Suite 4] Base Filter + Optical Lens Chaining")
    let baseFilter = registry.defaultFilter(for: .canonIXY)
    for opt in opticalFilters {
        let output = pipeline.process(
            inputImage: testImage,
            filter: baseFilter,
            opticalFilter: opt,
            opticalStrength: 0.7,
            filterIntensity: 1.0
        )
        assertTest(output.extent.width == 300, "Chaining \(baseFilter.name) + \(opt.name)")
    }

    // Test 5: Sihyunhada Personal Color Live Backdrop Blending
    print("\n[Suite 5] Personal Color Live Backdrop Blending")
    let dummyMatte = CIImage(color: CIColor.white).cropped(to: CGRect(x: 0, y: 0, width: 300, height: 400))
    let sihyunFilter = registry.defaultFilter(for: .sihyunhada)
    let blendedOutput = pipeline.process(
        inputImage: testImage,
        filter: sihyunFilter,
        opticalFilter: nil,
        opticalStrength: 0.0,
        filterIntensity: 1.0,
        backgroundMatte: dummyMatte,
        backgroundColorHex: "#F38B95" // Blossom Pink
    )
    assertTest(blendedOutput.extent.width == 300, "Personal Color Backdrop Matting & Blending")

    // Test 6: Dynamic Plug-and-Play Filter Extension (Modularity Test)
    print("\n[Suite 6] Dynamic Plug-and-Play Filter Extension")
    struct ThirdPartyKodakPortraFilter: CameraFilter {
        let id = "custom_kodak_portra_400"
        let name = "Kodak Portra 400"
        let localizedName = "코닥 포트라 400"
        let cameraCategory = CameraCategory.fujiInstax
        let filterDescription = "모듈형 확장 아키텍처로 외부에서 주입된 플러그인 필터"
        let iconName = "film"

        func apply(to inputImage: CIImage, context: CIContext, intensity: Double) -> CIImage {
            return FilterHelpers.adjustColorControls(image: inputImage, brightness: 0.03, contrast: 1.1, saturation: 1.15)
        }
    }

    let customFilter = ThirdPartyKodakPortraFilter()
    registry.register(filter: customFilter)
    let fetched = registry.filter(id: "custom_kodak_portra_400")
    assertTest(fetched != nil, "Dynamic filter plug-in registration succeeded")
    assertTest(fetched?.name == "Kodak Portra 400", "Dynamic filter properties verified")

    print("\n==================================================")
    print("📊 TEST SUMMARY: Passed: \(passedCount), Failed: \(failedCount)")
    print("==================================================")

    if failedCount > 0 {
        exit(1)
    }
}

main()
