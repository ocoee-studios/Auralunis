import SwiftUI

struct ChronauraWatchFace: View {
    @EnvironmentObject var session: WatchSessionManager
    @State private var timeScrubOffset: Double = 0
    
    private let brandGold = Color(red: 212/255, green: 175/255, blue: 55/255)
    private let moonSilver = Color(red: 192/255, green: 198/255, blue: 212/255)
    private let cosmicBlack = Color(red: 11/255, green: 11/255, blue: 18/255)
    private let mutedGold = Color(red: 199/255, green: 166/255, blue: 106/255)
    private let faintText = Color(red: 116/255, green: 125/255, blue: 144/255)
    
    var body: some View {
        ZStack {
            // Background
            cosmicBlack.ignoresSafeArea()
            StarFieldBackground()
            
            VStack(spacing: 0) {
                // Top bar: date + logo + time
                TopBarView(
                    brandGold: brandGold,
                    faintText: faintText
                )
                
                // Brand name
                Text("CHRONAURA")
                    .font(.system(size: 14, weight: .bold))
                    .tracking(3)
                    .foregroundColor(brandGold)
                Text("THE INTERACTIVE ASTRAL CLOCK")
                    .font(.system(size: 6, weight: .medium))
                    .tracking(1.5)
                    .foregroundColor(faintText)
                    .padding(.bottom, 4)
                
                // Complications + Astrolabe
                ZStack {
                    // Complications surrounding the astrolabe
                    ComplicationsOverlay(
                        skyData: session.skyData,
                        brandGold: brandGold,
                        moonSilver: moonSilver,
                        faintText: faintText
                    )
                    
                    // Central astrolabe
                    AstrolabeView(
                        timeScrubOffset: timeScrubOffset,
                        lunarPercent: session.skyData.lunarPercent,
                        brandGold: brandGold,
                        moonSilver: moonSilver
                    )
                }
                .frame(height: 120)
                
                // Time scrub
                TimeScrubView(
                    offset: $timeScrubOffset,
                    brandGold: brandGold,
                    faintText: faintText
                )
            }
            .padding(.horizontal, 4)
        }
        // Digital Crown controls time scrub
        .focusable()
        .digitalCrownRotation(
            $timeScrubOffset,
            from: -12,
            through: 12,
            sensitivity: .medium,
            isContinuous: false,
            isHapticFeedbackEnabled: true
        )
    }
}

// MARK: - Top Bar

struct TopBarView: View {
    let brandGold: Color
    let faintText: Color
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 1) {
                Text(dayOfWeek())
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                Text(monthDay())
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(faintText)
            }
            
            Spacer()
            
            // Logo icon (simplified compass)
            ZStack {
                Circle()
                    .stroke(brandGold, lineWidth: 1)
                    .frame(width: 18, height: 18)
                Circle()
                    .fill(brandGold)
                    .frame(width: 4, height: 4)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 1) {
                Text(timeString())
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                Text("PM")
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(faintText)
            }
        }
        .padding(.bottom, 2)
    }
    
    private func dayOfWeek() -> String {
        let f = DateFormatter()
        f.dateFormat = "EEE dd"
        return f.string(from: Date()).uppercased()
    }
    private func monthDay() -> String {
        let f = DateFormatter()
        f.dateFormat = "MMM"
        return f.string(from: Date()).uppercased()
    }
    private func timeString() -> String {
        let f = DateFormatter()
        f.dateFormat = "h:mm"
        return f.string(from: Date())
    }
}

// MARK: - Star Field Background

struct StarFieldBackground: View {
    var body: some View {
        Canvas { context, size in
            for _ in 0..<60 {
                let x = Double.random(in: 0...size.width)
                let y = Double.random(in: 0...size.height)
                let r = Double.random(in: 0.3...1.2)
                let opacity = Double.random(in: 0.15...0.5)
                context.fill(
                    Path(ellipseIn: CGRect(x: x, y: y, width: r, height: r)),
                    with: .color(.white.opacity(opacity))
                )
            }
        }
    }
}
