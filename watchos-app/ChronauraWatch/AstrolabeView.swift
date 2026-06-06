import SwiftUI

struct AstrolabeView: View {
    let timeScrubOffset: Double
    let lunarPercent: Int
    let brandGold: Color
    let moonSilver: Color
    
    var body: some View {
        ZStack {
            // Outer ring
            Circle()
                .stroke(brandGold.opacity(0.7), lineWidth: 1.5)
                .frame(width: 110, height: 110)
                .glassEffect()
            
            // Tick marks on outer ring
            ForEach(0..<36, id: \.self) { i in
                Rectangle()
                    .fill(brandGold.opacity(i % 9 == 0 ? 0.8 : 0.3))
                    .frame(width: i % 9 == 0 ? 1 : 0.5, height: i % 9 == 0 ? 6 : 3)
                    .offset(y: -52)
                    .rotationEffect(.degrees(Double(i) * 10))
            }
            
            // Middle ring
            Circle()
                .stroke(brandGold.opacity(0.5), lineWidth: 1)
                .frame(width: 78, height: 78)
            
            // Inner ring
            Circle()
                .stroke(moonSilver.opacity(0.3), lineWidth: 0.8)
                .frame(width: 46, height: 46)
            
            // Compass points
            ForEach(compassPoints) { point in
                Text(point.label)
                    .font(.system(size: 8, weight: .bold))
                    .foregroundColor(brandGold.opacity(0.8))
                    .offset(y: -62)
                    .rotationEffect(.degrees(point.angle))
            }
            
            // Compass needle (vertical gold line)
            Rectangle()
                .fill(brandGold)
                .frame(width: 1, height: 100)
            
            // Horizontal crosshair
            Rectangle()
                .fill(brandGold.opacity(0.3))
                .frame(width: 100, height: 0.5)
            
            // Crescent moon (the central "C")
            CrescentMoonShape()
                .fill(
                    LinearGradient(
                        colors: [brandGold, brandGold.opacity(0.7)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 40, height: 50)
                .shadow(color: brandGold.opacity(0.5), radius: 12)
                .rotationEffect(.degrees(timeScrubOffset * 3))
            
            // Center sun burst
            Circle()
                .fill(
                    RadialGradient(
                        colors: [.white, brandGold],
                        center: .center,
                        startRadius: 0,
                        endRadius: 8
                    )
                )
                .frame(width: 10, height: 10)
                .shadow(color: brandGold.opacity(0.8), radius: 8)
            
            // Gold spheres at compass points
            ForEach([0.0, 90.0, 180.0, 270.0], id: \.self) { angle in
                Circle()
                    .fill(brandGold)
                    .frame(width: 5, height: 5)
                    .shadow(color: brandGold.opacity(0.6), radius: 3)
                    .offset(y: -39)
                    .rotationEffect(.degrees(angle + timeScrubOffset * 2))
            }
            
            // Moon icon on the ring
            Circle()
                .fill(moonSilver)
                .frame(width: 8, height: 8)
                .offset(x: 32, y: 8)
        }
    }
}

// MARK: - Crescent Moon Shape

struct CrescentMoonShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let r = min(rect.width, rect.height) / 2
        
        // Full circle
        path.addArc(center: center, radius: r, startAngle: .degrees(0), endAngle: .degrees(360), clockwise: false)
        
        // Cut out inner circle (offset to create crescent)
        let innerCenter = CGPoint(x: center.x + r * 0.35, y: center.y - r * 0.1)
        let innerR = r * 0.85
        path.addArc(center: innerCenter, radius: innerR, startAngle: .degrees(360), endAngle: .degrees(0), clockwise: true)
        
        return path
    }
}

// MARK: - Glass Effect (Liquid Glass)

extension View {
    @ViewBuilder
    func glassEffect() -> some View {
        if #available(watchOS 11.0, *) {
            // Real Liquid Glass on watchOS 11+
            self.background(.ultraThinMaterial)
        } else {
            self
        }
    }
}
