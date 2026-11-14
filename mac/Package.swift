// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "FilterLab",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "FilterEngine",
            targets: ["FilterEngine"]
        ),
        .executable(
            name: "FilterLabApp",
            targets: ["FilterLabApp"]
        ),
        .executable(
            name: "FilterEngineTests",
            targets: ["FilterEngineTests"]
        )
    ],
    targets: [
        .target(
            name: "FilterEngine",
            dependencies: [],
            linkerSettings: [
                .linkedFramework("Metal"),
                .linkedFramework("MetalKit"),
                .linkedFramework("CoreImage"),
                .linkedFramework("CoreGraphics")
            ]
        ),
        .executableTarget(
            name: "FilterLabApp",
            dependencies: ["FilterEngine"],
            linkerSettings: [
                .linkedFramework("AppKit"),
                .linkedFramework("SwiftUI"),
                .linkedFramework("AVFoundation"),
                .linkedFramework("Network"),
                .linkedFramework("UniformTypeIdentifiers")
            ]
        ),
        .executableTarget(
            name: "FilterEngineTests",
            dependencies: ["FilterEngine"]
        )
    ]
)
