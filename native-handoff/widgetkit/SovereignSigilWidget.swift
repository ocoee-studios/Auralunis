import WidgetKit
import SwiftUI

struct SovereignSigilWidgetEntry: TimelineEntry {
    let date: Date
    let seedFingerprint: String
}

struct SovereignSigilWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> SovereignSigilWidgetEntry {
        SovereignSigilWidgetEntry(
            date: .now,
            seedFingerprint: "LOCAL-SAFE"
        )
    }

    func getSnapshot(
        in context: Context,
        completion: @escaping (SovereignSigilWidgetEntry) -> Void
    ) {
        completion(placeholder(in: context))
    }

    func getTimeline(
        in context: Context,
        completion: @escaping (Timeline<SovereignSigilWidgetEntry>) -> Void
    ) {
        let entry = placeholder(in: context)
        completion(
            Timeline(
                entries: [entry],
                policy: .after(Date().addingTimeInterval(60 * 60))
            )
        )
    }
}

struct SovereignSigilWidgetView: View {
    let entry: SovereignSigilWidgetEntry

    var body: some View {
        ZStack {
            Color.black
            Circle().stroke(.yellow.opacity(0.55), lineWidth: 1)
            Circle().stroke(.white.opacity(0.28), lineWidth: 1).padding(14)
            Text("SIGIL")
                .font(.caption2.weight(.bold))
                .foregroundStyle(.yellow)
        }
        .containerBackground(for: .widget) {
            Color.black
        }
        .accessibilityLabel("AuraLunis Sovereign Sigil \(entry.seedFingerprint)")
    }
}

struct SovereignSigilWidget: Widget {
    let kind = "SovereignSigilWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: SovereignSigilWidgetProvider()
        ) { entry in
            SovereignSigilWidgetView(entry: entry)
        }
        .configurationDisplayName("AuraLunis Sovereign Sigil")
        .description("A local-safe Midnight Gold collector crest.")
        .supportedFamilies([.systemSmall])
    }
}

// Production implementation:
// - read a pre-rendered local-safe vector payload from an App Group container,
// - never store raw birth coordinates in the widget extension,
// - provide regenerate and delete controls inside the main app,
// - keep this widget disabled until Sovereign launches.
