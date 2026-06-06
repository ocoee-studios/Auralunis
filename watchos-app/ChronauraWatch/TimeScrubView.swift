import SwiftUI

struct TimeScrubView: View {
    @Binding var offset: Double
    let brandGold: Color
    let faintText: Color
    
    var body: some View {
        VStack(spacing: 2) {
            // Scrub bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    // Track
                    Capsule()
                        .fill(brandGold.opacity(0.15))
                        .frame(height: 3)
                    
                    // Fill
                    Capsule()
                        .fill(brandGold)
                        .frame(width: max(0, geo.size.width * CGFloat((offset + 12) / 24)), height: 3)
                    
                    // Thumb
                    Circle()
                        .fill(brandGold)
                        .frame(width: 8, height: 8)
                        .shadow(color: brandGold.opacity(0.6), radius: 4)
                        .offset(x: geo.size.width * CGFloat((offset + 12) / 24) - 4)
                }
            }
            .frame(height: 8)
            
            // Labels
            HStack {
                // Minus button
                ZStack {
                    Circle()
                        .stroke(brandGold.opacity(0.3), lineWidth: 0.5)
                        .frame(width: 16, height: 16)
                    Text("−")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(brandGold)
                }
                .onTapGesture { offset = max(-12, offset - 1) }
                
                Text("-12H")
                    .font(.system(size: 6, weight: .medium))
                    .foregroundColor(faintText)
                
                Spacer()
                
                VStack(spacing: 0) {
                    Text("TIME SCRUB")
                        .font(.system(size: 5, weight: .bold))
                        .tracking(1)
                        .foregroundColor(brandGold)
                    Text(scrubTimeString())
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(.white)
                }
                
                Spacer()
                
                Text("+12H")
                    .font(.system(size: 6, weight: .medium))
                    .foregroundColor(faintText)
                
                // Plus button
                ZStack {
                    Circle()
                        .stroke(brandGold.opacity(0.3), lineWidth: 0.5)
                        .frame(width: 16, height: 16)
                    Text("+")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(brandGold)
                }
                .onTapGesture { offset = min(12, offset + 1) }
            }
        }
        .padding(.top, 4)
    }
    
    private func scrubTimeString() -> String {
        let scrubbed = Date().addingTimeInterval(offset * 3600)
        let f = DateFormatter()
        f.dateFormat = "h:mm a"
        return f.string(from: scrubbed)
    }
}
