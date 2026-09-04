//
//  PocketGull.swift
//  PocketGull Clinical Typeface Superfamily
//
//  SIL Open Font License 1.1 • Rooted in Empirical Science. Engineered for Life.
//

import SwiftUI
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

// MARK: - PocketGull Font Definitions
public enum PocketGullFont: String, CaseIterable {
    case bold = "PocketGull-Bold"
    case fineliner = "PocketGull-Fineliner"
    case chiseltip = "PocketGull-Chiseltip"
    case mono = "PocketGullMono-Regular"
    
    public var postScriptName: String { rawValue }
    
    public var filename: String {
        switch self {
        case .bold: return "PocketGull-Bold.ttf"
        case .fineliner: return "PocketGull-Fineliner.ttf"
        case .chiseltip: return "PocketGull-Chiseltip.ttf"
        case .mono: return "PocketGullMono-Regular.ttf"
        }
    }
}

// MARK: - SwiftUI Font Extension
public extension Font {
    /// PocketGull Bold Display & Brand (Louise Sloan 5:1 Optotype Compliant)
    static func pocketGull(size: CGFloat = 17, relativeTo textStyle: TextStyle = .body) -> Font {
        .custom(PocketGullFont.bold.postScriptName, size: size, relativeTo: textStyle)
    }
    
    /// PocketGull Fineliner Humanist Clinical Text
    static func pocketGullFineliner(size: CGFloat = 16, relativeTo textStyle: TextStyle = .body) -> Font {
        .custom(PocketGullFont.fineliner.postScriptName, size: size, relativeTo: textStyle)
    }
    
    /// PocketGull Chiseltip Heavy Surgical Display Heading
    static func pocketGullChiseltip(size: CGFloat = 24, relativeTo textStyle: TextStyle = .title2) -> Font {
        .custom(PocketGullFont.chiseltip.postScriptName, size: size, relativeTo: textStyle)
    }
    
    /// PocketGull Mono ICU Telemetry & Strict Tabular Metrics
    static func pocketGullMono(size: CGFloat = 14, relativeTo textStyle: TextStyle = .body) -> Font {
        .custom(PocketGullFont.mono.postScriptName, size: size, relativeTo: textStyle)
    }
}

// MARK: - Clinical View Modifiers
public struct PocketGullClinicalSafeModifier: ViewModifier {
    public var size: CGFloat
    public var textStyle: Font.TextStyle
    
    public init(size: CGFloat = 17, textStyle: Font.TextStyle = .body) {
        self.size = size
        self.textStyle = textStyle
    }
    
    public func body(content: Content) -> some View {
        content
            .font(.custom(PocketGullFont.bold.postScriptName, size: size, relativeTo: textStyle))
            .fontDigitVariation(.slashedZero)
            .monospacedDigit()
    }
}

public struct PocketGullBoumaSpacingModifier: ViewModifier {
    public var spacing: CGFloat
    
    public init(spacing: CGFloat = 1.8) {
        self.spacing = spacing
    }
    
    public func body(content: Content) -> some View {
        content
            .tracking(spacing)
            .lineSpacing(6)
    }
}

public struct PocketGullPbmNightModeModifier: ViewModifier {
    public func body(content: Content) -> some View {
        content
            .foregroundColor(Color(red: 0.95, green: 0.25, blue: 0.25))
            .background(Color(red: 0.02, green: 0.0, blue: 0.0))
    }
}

public extension View {
    /// Enforces FDA / ISMP clinical dosage safety (slashed zero, tabular metrics)
    func pocketGullClinicalSafe(size: CGFloat = 17, relativeTo textStyle: Font.TextStyle = .body) -> some View {
        modifier(PocketGullClinicalSafeModifier(size: size, textStyle: textStyle))
    }
    
    /// Herman Bouma lateral anti-crowding spacing (b > 0.5 * theta) for low vision
    func pocketGullBouma(spacing: CGFloat = 1.8) -> some View {
        modifier(PocketGullBoumaSpacingModifier(spacing: spacing))
    }
    
    /// 670nm deep-red photobiomodulation (PBM) dark mode
    func pocketGullPbmNightMode() -> some View {
        modifier(PocketGullPbmNightModeModifier())
    }
}

// MARK: - Dynamic CoreText Font Registration
#if canImport(CoreText)
import CoreText

public enum PocketGullRegistrar {
    /// Automatically register bundled PocketGull TTF fonts into CoreText
    @discardableResult
    public static func registerFonts(bundle: Bundle = .main) -> Bool {
        var allSuccess = true
        for font in PocketGullFont.allCases {
            guard let url = bundle.url(forResource: font.rawValue, withExtension: "ttf") else {
                continue
            }
            var error: Unmanaged<CFError>?
            if !CTFontManagerRegisterFontsForURL(url as CFURL, .process, &error) {
                allSuccess = false
            }
        }
        return allSuccess
    }
}
#endif
