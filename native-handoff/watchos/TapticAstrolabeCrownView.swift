import SwiftUI
import WatchKit

struct TapticAstrolabeCrownView: View {
    @State private var scrubValue = 0.0

    var body: some View {
        VStack {
            Text("CHRONAURA")
                .font(.caption.weight(.bold))
            Text("\(Int(scrubValue)) d")
                .font(.title2.monospacedDigit())
            Text("TACTIC ASTROLABE")
                .font(.caption2)
        }
        .focusable()
        .digitalCrownRotation(
            $scrubValue,
            from: -365,
            through: 365,
            by: 1,
            sensitivity: .medium,
            isContinuous: false,
            isHapticFeedbackEnabled: true
        )
        .onChange(of: scrubValue) { newValue in
            if Int(newValue) % 30 == 0 {
                WKInterfaceDevice.current().play(.click)
            }
        }
    }
}

// Production implementation:
// - replace the simple 30-day click with calculated event detents,
// - confirm accessibility behavior,
// - test Digital Crown feel on physical Apple Watch Ultra hardware.
