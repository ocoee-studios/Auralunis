import WidgetKit
import SwiftUI

struct NextEventEntry: TimelineEntry {
    let date: Date
    let eventName: String
    let countdown: String
}

struct NextEventProvider: TimelineProvider {
    func placeholder(in context: Context) -> NextEventEntry {
        NextEventEntry(date: Date(), eventName: "Golden Hour", countdown: "in 2h 43m")
    }
    func getSnapshot(in context: Context, completion: @escaping (NextEventEntry) -> Void) {
        completion(placeholder(in: context))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<NextEventEntry>) -> Void) {
        let entry = NextEventEntry(date: Date(), eventName: "Moonrise", countdown: "in 1h 12m")
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(300)))
        completion(timeline)
    }
}

struct NextEventWidgetView: View {
    let entry: NextEventEntry
    private let gold = Color(red: 212/255, green: 175/255, blue: 55/255)
    
    var body: some View {
        ZStack {
            Color(red: 11/255, green: 11/255, blue: 18/255)
            VStack(spacing: 4) {
                Text("NEXT EVENT")
                    .font(.system(size: 8, weight: .bold))
                    .tracking(1.5)
                    .foregroundColor(gold)
                Text(entry.eventName)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
                Text(entry.countdown)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.gray)
            }
        }
    }
}

struct NextEventWidget: Widget {
    let kind = "NextEventWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NextEventProvider()) { entry in
            NextEventWidgetView(entry: entry)
        }
        .configurationDisplayName("Next Event")
        .description("Countdown to the next celestial event.")
        .supportedFamilies([.systemSmall, .accessoryRectangular])
    }
}
