import WidgetKit
import SwiftUI

struct MoonPhaseEntry: TimelineEntry {
    let date: Date
    let phase: String
    let percent: Int
    let emoji: String
}

struct MoonPhaseProvider: TimelineProvider {
    func placeholder(in context: Context) -> MoonPhaseEntry {
        MoonPhaseEntry(date: Date(), phase: "Waxing Gibbous", percent: 61, emoji: "🌔")
    }
    func getSnapshot(in context: Context, completion: @escaping (MoonPhaseEntry) -> Void) {
        completion(placeholder(in: context))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<MoonPhaseEntry>) -> Void) {
        let entry = MoonPhaseEntry(date: Date(), phase: "Waxing Gibbous", percent: 61, emoji: "🌔")
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
        completion(timeline)
    }
}

struct MoonPhaseWidgetView: View {
    let entry: MoonPhaseEntry
    private let gold = Color(red: 212/255, green: 175/255, blue: 55/255)
    
    var body: some View {
        ZStack {
            Color(red: 11/255, green: 11/255, blue: 18/255)
            VStack(spacing: 4) {
                Text(entry.emoji)
                    .font(.system(size: 36))
                Text("\(entry.percent)%")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(gold)
                Text(entry.phase)
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(.gray)
            }
        }
    }
}

struct MoonPhaseWidget: Widget {
    let kind = "MoonPhaseWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: MoonPhaseProvider()) { entry in
            MoonPhaseWidgetView(entry: entry)
        }
        .configurationDisplayName("Moon Phase")
        .description("Current lunar phase at a glance.")
        .supportedFamilies([.systemSmall, .systemCircular])
    }
}
