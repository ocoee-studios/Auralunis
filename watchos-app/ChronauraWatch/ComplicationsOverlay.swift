import SwiftUI

struct ComplicationsOverlay: View {
    let skyData: SkyData
    let brandGold: Color
    let moonSilver: Color
    let faintText: Color
    
    var body: some View {
        ZStack {
            // Top left: Solar Time
            VStack(alignment: .leading, spacing: 1) {
                Text("SOLAR TIME")
                    .font(.system(size: 5, weight: .bold))
                    .tracking(0.8)
                    .foregroundColor(brandGold)
                Text(skyData.solarTime)
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(.white)
            }
            .position(x: 28, y: 20)
            
            // Top right: Celestial Body
            VStack(alignment: .trailing, spacing: 1) {
                Text("CELESTIAL BODY")
                    .font(.system(size: 5, weight: .bold))
                    .tracking(0.8)
                    .foregroundColor(brandGold)
                Text(skyData.celestialBody)
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(.white)
            }
            .position(x: 145, y: 20)
            
            // Left: Lunar Phase
            VStack(alignment: .leading, spacing: 1) {
                Text("LUNAR PHASE")
                    .font(.system(size: 5, weight: .bold))
                    .tracking(0.8)
                    .foregroundColor(brandGold)
                HStack(spacing: 3) {
                    // Small moon icon
                    Circle()
                        .fill(moonSilver)
                        .frame(width: 10, height: 10)
                    VStack(alignment: .leading, spacing: 0) {
                        Text("\(skyData.lunarPercent)%")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundColor(.white)
                        Text(skyData.lunarPhase)
                            .font(.system(size: 5, weight: .medium))
                            .foregroundColor(faintText)
                    }
                }
            }
            .position(x: 24, y: 70)
            
            // Right: Distance
            VStack(alignment: .trailing, spacing: 1) {
                Text("DISTANCE")
                    .font(.system(size: 5, weight: .bold))
                    .tracking(0.8)
                    .foregroundColor(brandGold)
                Text(formatDistance(skyData.moonDistanceKm))
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(.white)
                Text("KM")
                    .font(.system(size: 5, weight: .medium))
                    .foregroundColor(faintText)
            }
            .position(x: 150, y: 55)
            
            // Bottom right: Next Event
            VStack(alignment: .trailing, spacing: 1) {
                Text("NEXT EVENT")
                    .font(.system(size: 5, weight: .bold))
                    .tracking(0.8)
                    .foregroundColor(brandGold)
                Text(skyData.nextEvent)
                    .font(.system(size: 7, weight: .medium))
                    .foregroundColor(.white)
                Text(skyData.nextEventCountdown)
                    .font(.system(size: 6, weight: .medium))
                    .foregroundColor(faintText)
            }
            .position(x: 148, y: 100)
        }
    }
    
    private func formatDistance(_ km: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: km)) ?? "\(km)"
    }
}
