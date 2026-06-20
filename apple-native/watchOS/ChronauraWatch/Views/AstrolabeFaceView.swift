import SwiftUI
import WatchKit

// MARK: - Celestial Dial Watch Face
// A living astrolabe showing real clock hands, planetary positions on
// concentric orbital rings, a sun vector, moon with phase, and tonight score.
// Crown scrub shifts the sky ±12 hours.

struct AstrolabeFaceView: View {
    @EnvironmentObject private var connectivity: ChronauraWatchConnectivityBridge

    @State private var scrubHours = 0.0
    @State private var lastHapticHour = 0
    @State private var now = Date()
    @FocusState private var crownFocused: Bool

    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    private let gold = Color(red: 0.83, green: 0.69, blue: 0.22)
    private let brightGold = Color(red: 0.95, green: 0.85, blue: 0.61)
    private let silver = Color(red: 0.75, green: 0.78, blue: 0.83)
    private let bg = Color(red: 0.043, green: 0.043, blue: 0.07)

    // Planet data (populated from WatchConnectivity payload)
    private var planets: [PlanetDot] {
        // Use connectivity payload if available, otherwise show defaults
        let payload = connectivity.payload
        return [
            PlanetDot(name: "Moon",    color: silver,                              ring: .inner, azimuth: payload.moonAzimuth,    glow: true, label: "\(payload.moonPercent)%"),
            PlanetDot(name: "Venus",   color: Color(red:0.95, green:0.85, blue:0.61), ring: .mid,   azimuth: payload.venusAzimuth,   glow: false, label: nil),
            PlanetDot(name: "Jupiter", color: Color(red:0.94, green:0.62, blue:0.15), ring: .outer, azimuth: payload.jupiterAzimuth, glow: false, label: nil),
            PlanetDot(name: "Saturn",  color: gold,                                ring: .outer, azimuth: payload.saturnAzimuth,  glow: false, label: nil),
        ]
    }

    private var sunAzimuth: Double { connectivity.payload.sunAzimuth }

    var body: some View {
        ZStack {
            bg.ignoresSafeArea()
            starField
            orbitalRings
            sunVector
            planetDots
            clockHands
            centerScore
            compassLabels
            bottomInfo
        }
        .contentShape(Rectangle())
        .focusable(true)
        .focused($crownFocused)
        .digitalCrownRotation(
            $scrubHours, from: -12, through: 12, by: 1,
            sensitivity: .medium, isContinuous: false, isHapticFeedbackEnabled: false
        )
        .onChange(of: scrubHours) { newValue in
            let rounded = Int(newValue.rounded())
            guard rounded != lastHapticHour else { return }
            lastHapticHour = rounded
            WKInterfaceDevice.current().play(.click)
        }
        .onReceive(timer) { _ in now = Date() }
        .onAppear { crownFocused = true }
    }

    // MARK: - Star field
    private var starField: some View {
        ZStack {
            ForEach(0..<8, id: \.self) { i in
                Circle()
                    .fill(.white.opacity(Double.random(in: 0.3...0.7)))
                    .frame(width: CGFloat.random(in: 0.8...1.6))
                    .offset(
                        x: CGFloat.random(in: -80...80),
                        y: CGFloat.random(in: -80...80)
                    )
            }
        }
    }

    // MARK: - Orbital rings
    private var orbitalRings: some View {
        ZStack {
            ringCircle(diameter: 164, opacity: 0.15)  // rim
            ringCircle(diameter: 140, opacity: 0.08)  // outer planets
            ringCircle(diameter: 108, opacity: 0.08)  // inner planets
            ringCircle(diameter: 76,  opacity: 0.08)  // moon

            // Tick marks
            ForEach(0..<24, id: \.self) { i in
                let angle = Double(i) * 15.0
                let isMajor = Int(angle) % 90 == 0
                tickMark(angle: angle, isMajor: isMajor)
            }
        }
    }

    private func ringCircle(diameter: CGFloat, opacity: Double) -> some View {
        Circle()
            .stroke(gold.opacity(opacity), lineWidth: diameter == 164 ? 1.5 : 0.7)
            .frame(width: diameter, height: diameter)
    }

    private func tickMark(angle: Double, isMajor: Bool) -> some View {
        let length: CGFloat = isMajor ? 8 : 4
        let radius: CGFloat = 82 - (isMajor ? 0 : 2)
        return Rectangle()
            .fill(gold.opacity(isMajor ? 0.45 : 0.15))
            .frame(width: isMajor ? 1.5 : 0.7, height: length)
            .offset(y: -radius)
            .rotationEffect(.degrees(angle))
    }

    // MARK: - Sun vector
    private var sunVector: some View {
        let angle = sunAzimuth - 90 // SVG convention: 0° = top
        let radius: CGFloat = 78
        let rad = angle * .pi / 180
        let x = cos(rad) * radius
        let y = sin(rad) * radius

        return ZStack {
            // Dashed line from center
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: x, y: y))
            }
            .stroke(gold.opacity(0.2), style: StrokeStyle(lineWidth: 1, dash: [3, 5]))

            // Sun dot
            Circle()
                .fill(Color(red: 0.94, green: 0.62, blue: 0.15).opacity(0.15))
                .frame(width: 16, height: 16)
                .offset(x: x, y: y)

            Circle()
                .fill(Color(red: 0.94, green: 0.62, blue: 0.15))
                .frame(width: 8, height: 8)
                .offset(x: x, y: y)
        }
    }

    // MARK: - Planet dots
    private var planetDots: some View {
        ZStack {
            ForEach(planets, id: \.name) { planet in
                planetView(planet)
            }
        }
    }

    private func planetView(_ planet: PlanetDot) -> some View {
        let ringRadius: CGFloat = planet.ring == .inner ? 38 : planet.ring == .mid ? 54 : 70
        let angle = (planet.azimuth - 90) * .pi / 180
        let x = cos(angle) * ringRadius
        let y = sin(angle) * ringRadius

        return ZStack {
            if planet.glow {
                Circle()
                    .fill(planet.color.opacity(0.15))
                    .frame(width: 14, height: 14)
                    .offset(x: x, y: y)
            }

            Circle()
                .fill(planet.color)
                .frame(width: 6, height: 6)
                .offset(x: x, y: y)

            if let label = planet.label {
                Text(label)
                    .font(.system(size: 6, weight: .bold, design: .rounded))
                    .foregroundStyle(planet.color.opacity(0.6))
                    .offset(x: x, y: y + 10)
            }
        }
    }

    // MARK: - Clock hands
    private var clockHands: some View {
        let calendar = Calendar.current
        let hour = Double(calendar.component(.hour, from: now) % 12) + Double(calendar.component(.minute, from: now)) / 60.0
        let minute = Double(calendar.component(.minute, from: now)) + Double(calendar.component(.second, from: now)) / 60.0

        let hourAngle = hour * 30.0
        let minuteAngle = minute * 6.0

        return ZStack {
            // Hour hand
            RoundedRectangle(cornerRadius: 1.5)
                .fill(gold.opacity(0.7))
                .frame(width: 3, height: 32)
                .offset(y: -16)
                .rotationEffect(.degrees(hourAngle))

            // Minute hand
            RoundedRectangle(cornerRadius: 1)
                .fill(brightGold.opacity(0.45))
                .frame(width: 2, height: 44)
                .offset(y: -22)
                .rotationEffect(.degrees(minuteAngle))

            // Center dot
            Circle()
                .fill(gold)
                .frame(width: 6, height: 6)
        }
    }

    // MARK: - Center tonight score
    private var centerScore: some View {
        VStack(spacing: 0) {
            Text("\(connectivity.payload.tonightScore)")
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundStyle(.white)

            Text("TONIGHT")
                .font(.system(size: 5, weight: .bold, design: .rounded))
                .tracking(1.2)
                .foregroundStyle(gold)
        }
        .offset(y: -2)
    }

    // MARK: - Compass labels
    private var compassLabels: some View {
        ZStack {
            compassText("N").offset(y: -86)
            compassText("E").offset(x: 86)
            compassText("S").offset(y: 86)
            compassText("W").offset(x: -86)
        }
    }

    private func compassText(_ value: String) -> some View {
        Text(value)
            .font(.system(size: 8, weight: .bold, design: .rounded))
            .tracking(0.8)
            .foregroundStyle(gold.opacity(0.6))
    }

    // MARK: - Bottom info bar
    private var bottomInfo: some View {
        VStack {
            Spacer()

            VStack(spacing: 2) {
                Text(scrubLabel)
                    .font(.system(size: 9, weight: .bold, design: .rounded))
                    .foregroundStyle(brightGold)

                Text(connectivity.payload.nextEvent)
                    .font(.system(size: 8, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.8))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .padding(.bottom, 6)
        }
        .padding(8)
    }

    private var scrubLabel: String {
        let hour = Int(scrubHours.rounded())
        if hour == 0 { return "NOW" }
        return hour > 0 ? "+\(hour)H" : "\(hour)H"
    }
}

// MARK: - Supporting types

private enum PlanetRing {
    case inner, mid, outer
}

private struct PlanetDot {
    let name: String
    let color: Color
    let ring: PlanetRing
    let azimuth: Double
    let glow: Bool
    let label: String?
}

#Preview {
    AstrolabeFaceView()
        .environmentObject(ChronauraWatchConnectivityBridge())
}
