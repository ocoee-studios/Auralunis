import SwiftUI
import WatchKit

struct AstrolabeFaceView: View {
    @EnvironmentObject private var connectivity: ChronauraWatchConnectivityBridge

    @State private var scrubHours = 0.0
    @State private var lastHapticHour = 0
    @FocusState private var crownFocused: Bool

    private let gold = Color(red: 0.78, green: 0.65, blue: 0.42)
    private let brightGold = Color(red: 0.95, green: 0.85, blue: 0.61)
    private let background = Color(red: 0.02, green: 0.03, blue: 0.06)

    var body: some View {
        ZStack {
            background.ignoresSafeArea()

            stars

            AstrolabeRings(gold: gold, brightGold: brightGold)
                .padding(7)

            compassLabels

            VStack(spacing: 1) {
                Image(systemName: "moonphase.waxing.gibbous")
                    .font(.system(size: 28, weight: .light))
                    .foregroundStyle(brightGold)
                    .accessibilityHidden(true)

                Text("\(connectivity.payload.tonightScore)")
                    .font(.system(size: 24, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white)

                Text("TONIGHT")
                    .font(.system(size: 7, weight: .bold, design: .rounded))
                    .tracking(1.2)
                    .foregroundStyle(gold)
            }

            complicationLayout
        }
        .contentShape(Rectangle())
        .focusable(true)
        .focused($crownFocused)
        .digitalCrownRotation(
            $scrubHours,
            from: -12,
            through: 12,
            by: 1,
            sensitivity: .medium,
            isContinuous: false,
            isHapticFeedbackEnabled: false
        )
        .onChange(of: scrubHours) { newValue in
            let roundedHour = Int(newValue.rounded())

            guard roundedHour != lastHapticHour else {
                return
            }

            lastHapticHour = roundedHour
            WKInterfaceDevice.current().play(.click)
        }
        .onAppear {
            crownFocused = true
        }
        .toolbar {
            ToolbarItem(placement: .bottomBar) {
                Button("Now") {
                    scrubHours = 0
                    lastHapticHour = 0
                }
                .font(.caption2)
                .tint(gold)
            }
        }
    }

    private var stars: some View {
        ZStack {
            Circle().fill(.white.opacity(0.65)).frame(width: 1.4).offset(x: -62, y: -44)
            Circle().fill(brightGold.opacity(0.75)).frame(width: 1.2).offset(x: 58, y: -52)
            Circle().fill(.white.opacity(0.48)).frame(width: 1.0).offset(x: 72, y: 32)
            Circle().fill(brightGold.opacity(0.56)).frame(width: 1.4).offset(x: -74, y: 26)
            Circle().fill(.white.opacity(0.42)).frame(width: 1.0).offset(x: 22, y: 70)
        }
    }

    private var compassLabels: some View {
        ZStack {
            compassText("N").offset(y: -78)
            compassText("E").offset(x: 78)
            compassText("S").offset(y: 78)
            compassText("W").offset(x: -78)
        }
    }

    private func compassText(_ value: String) -> some View {
        Text(value)
            .font(.system(size: 7, weight: .bold, design: .rounded))
            .tracking(0.8)
            .foregroundStyle(gold.opacity(0.92))
    }

    private var complicationLayout: some View {
        VStack {
            HStack(alignment: .top) {
                complication(
                    title: "MOON",
                    value: connectivity.payload.moonPhase
                )

                Spacer()

                complication(
                    title: "SCORE",
                    value: "\(connectivity.payload.tonightScore)"
                )
            }

            Spacer()

            VStack(spacing: 2) {
                Text(scrubLabel)
                    .font(.system(size: 8, weight: .bold, design: .rounded))
                    .foregroundStyle(brightGold)

                Text(connectivity.payload.nextEvent)
                    .font(.system(size: 8, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.86))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .padding(.horizontal, 17)
            .padding(.bottom, 8)
        }
        .padding(10)
    }

    private func complication(title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(title)
                .font(.system(size: 6, weight: .bold, design: .rounded))
                .tracking(0.8)
                .foregroundStyle(gold)

            Text(value)
                .font(.system(size: 8, weight: .semibold, design: .rounded))
                .foregroundStyle(.white.opacity(0.90))
                .lineLimit(1)
                .minimumScaleFactor(0.65)
        }
        .frame(maxWidth: 62, alignment: .leading)
    }

    private var scrubLabel: String {
        let hour = Int(scrubHours.rounded())

        if hour == 0 {
            return "NOW"
        }

        return hour > 0 ? "+\(hour)H" : "\(hour)H"
    }
}

private struct AstrolabeRings: View {
    let gold: Color
    let brightGold: Color

    var body: some View {
        ZStack {
            ring(diameter: 174, lineWidth: 1.1, opacity: 0.68)
            ring(diameter: 128, lineWidth: 0.9, opacity: 0.60)
            ring(diameter: 84, lineWidth: 0.8, opacity: 0.68)

            Rectangle()
                .fill(gold.opacity(0.26))
                .frame(width: 158, height: 0.7)

            Rectangle()
                .fill(gold.opacity(0.26))
                .frame(width: 0.7, height: 158)
        }
    }

    private func ring(
        diameter: CGFloat,
        lineWidth: CGFloat,
        opacity: Double
    ) -> some View {
        Circle()
            .stroke(gold.opacity(opacity), lineWidth: lineWidth)
            .frame(width: diameter, height: diameter)
            .chronauraRingGlass(tint: brightGold)
    }
}

#Preview {
    AstrolabeFaceView()
        .environmentObject(ChronauraWatchConnectivityBridge())
}
