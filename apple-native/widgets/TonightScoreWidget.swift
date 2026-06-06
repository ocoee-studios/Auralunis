import WidgetKit
import SwiftUI

struct TonightScoreEntry: TimelineEntry {
    let date: Date
    let score: Int
    let label: String
    let moonPercent: Int
}

struct TonightScoreProvider: TimelineProvider {
    func placeholder(in context: Context) -> TonightScoreEntry {
        TonightScoreEntry(date: Date(), score: 82, label: "Excellent", moonPercent: 61)
    }
    func getSnapshot(in context: Context, completion: @escaping (TonightScoreEntry) -> Void) {
        completion(placeholder(in: context))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<TonightScoreEntry>) -> Void) {
        let entry = TonightScoreEntry(date: Date(), score: 82, label: "Excellent", moonPercent: 61)
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(900)))
        completion(timeline)
    }
}

struct TonightScoreWidgetView: View {
    let entry: TonightScoreEntry
    private let gold = Color(red: 212/255, green: 175/255, blue: 55/255)
    
    var body: some View {
        ZStack {
            Color(red: 11/255, green: 11/255, blue: 18/255)
            VStack(spacing: 4) {
                Text("TONIGHT")
                    .font(.system(size: 8, weight: .bold))
                    .tracking(1.5)
                    .foregroundColor(gold)
                Text("\(entry.score)")
                    .font(.system(size: 36, weight: .black))
                    .foregroundColor(gold)
                Text(entry.label)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.gray)
                Text("🌙 \(entry.moonPercent)%")
                    .font(.system(size: 9))
                    .foregroundColor(.gray)
            }
        }
    }
}

struct TonightScoreWidget: Widget {
    let kind = "TonightScoreWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TonightScoreProvider()) { entry in
            TonightScoreWidgetView(entry: entry)
        }
        .configurationDisplayName("Tonight Score")
        .description("See how good tonight's sky is at a glance.")
        .supportedFamilies([.systemSmall])
    }
}
