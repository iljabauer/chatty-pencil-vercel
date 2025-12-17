// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "CapacitorCanvasPlugin",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "CapacitorCanvasPlugin",
            targets: ["CanvasPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "CanvasPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/CanvasPlugin"),
        .testTarget(
            name: "CanvasPluginTests",
            dependencies: ["CanvasPlugin"],
            path: "ios/Tests/CanvasPluginTests")
    ]
)