import WidgetKit
import SwiftUI

struct DeskObeliskEntry: TimelineEntry {
    let date: Date
    let tonightScore: Int
    let moonIllumination: Int
    let radianVector: String
}

struct DeskObeliskProvider: TimelineProvider {
    func placeholder(in context: Context) -> DeskObeliskEntry {
        DeskObeliskEntry(date: .now, tonightScore: 91, moonIllumination: 78, radianVector: "0.00249 ▲")
    }

    func getSnapshot(in context: Context, completion: @escaping (DeskObeliskEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DeskObeliskEntry>) -> Void) {
        let entry = placeholder(in: context)
        completion(Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(30 * 60))))
    }
}

struct DeskObeliskWidgetView: View {
    let entry: DeskObeliskEntry

    var body: some View {
        ZStack {
            Color.black
            VStack(alignment: .leading, spacing: 6) {
                Text("AURALUNIS")
                    .font(.caption.weight(.bold))
                Text(entry.date, style: .time)
                    .font(.system(size: 32, weight: .semibold, design: .serif))
                Text("RADIAN VECTOR · \(entry.radianVector)")
                    .font(.caption2)
                Text("☾ \(entry.moonIllumination)% · SCORE \(entry.tonightScore)")
                    .font(.caption2)
            }
            .foregroundStyle(.yellow)
        }
        .containerBackground(for: .widget) {
            Color.black
        }
    }
}

struct DeskObeliskWidget: Widget {
    let kind = "DeskObeliskWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DeskObeliskProvider()) { entry in
            DeskObeliskWidgetView(entry: entry)
        }
        .configurationDisplayName("AuraLunis Desk Obelisk")
        .description("A Midnight Gold cosmic timepiece for StandBy.")
        .supportedFamilies([.systemSmall])
    }
}
