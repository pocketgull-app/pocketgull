// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "PocketGull",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .watchOS(.v8),
        .tvOS(.v15),
        .visionOS(.v1)
    ],
    products: [
        .library(
            name: "PocketGull",
            targets: ["PocketGull"]
        ),
    ],
    targets: [
        .target(
            name: "PocketGull",
            resources: [
                .process("Resources")
            ]
        )
    ]
)
