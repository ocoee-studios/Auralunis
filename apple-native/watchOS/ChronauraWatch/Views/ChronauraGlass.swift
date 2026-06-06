import SwiftUI

private struct ChronauraRingGlassModifier: ViewModifier {
    let tint: Color

    @ViewBuilder
    func body(content: Content) -> some View {
        if #available(watchOS 26.0, *) {
            // Verify final tint strength in Xcode 26 on a physical Watch.
            content
                .glassEffect(.regular.tint(tint.opacity(0.28)), in: .circle)
        } else {
            content
                .background(tint.opacity(0.06))
        }
    }
}

extension View {
    func chronauraRingGlass(tint: Color) -> some View {
        modifier(ChronauraRingGlassModifier(tint: tint))
    }
}
