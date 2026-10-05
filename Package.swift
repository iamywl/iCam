// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "iCam",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "iCamCore",
            targets: ["iCamCore"]
        ),
        .executable(
            name: "iCamTestRunner",
            targets: ["iCamTestRunner"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "iCamCore",
            dependencies: [],
            path: "iCam/Sources/iCamCore"
        ),
        .executableTarget(
            name: "iCamTestRunner",
            dependencies: ["iCamCore"],
            path: "iCam/Sources/iCamTestRunner"
        )
    ]
)
