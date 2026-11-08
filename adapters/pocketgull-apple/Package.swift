// swift-tools-version: 5.9
// SPDX-License-Identifier: Apache-2.0

import PackageDescription

let package = Package(
    name: "PocketGullApple",
    platforms: [
        .iOS(.v17),
        .macOS(.v14),
        .visionOS(.v1),
        .watchOS(.v10)
    ],
    products: [
        .library(
            name: "PocketGullApple",
            targets: ["PocketGullApple"]
        )
    ],
    targets: [
        .target(
            name: "PocketGullApple",
            path: "Sources/PocketGullApple"
        ),
        .testTarget(
            name: "PocketGullAppleTests",
            dependencies: ["PocketGullApple"],
            path: "Tests/PocketGullAppleTests"
        )
    ]
)
