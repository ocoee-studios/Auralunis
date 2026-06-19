// ISSPassWidget.swift
// Home screen widget showing the next visible ISS pass with countdown,
// direction, and peak elevation. Reads from shared App Group UserDefaults
// written by the React Native app via expo-shared-group.
//
// Data keys (written by ISSPassService.ts via app group bridge):
//   chronaura.iss.nextRiseISO    — ISO 8601 timestamp of next rise
//   chronaura.iss.direction      — compass direction string ("NW → SE")
//   chronaura.iss.peakElevation  — peak elevation in degrees
//   chronaura.iss.durationMin    — pass duration in minutes

import WidgetKit
import SwiftUI

// MARK: - Entry

struct ISSPassEntry: TimelineEntry {
    let date: Date
    let riseDate: Date?
    let direction: String
    let peakElevation: Int
    let durationMin: Int
    let isStale: Bool // true if no data from the app
}

// MARK: - Provider

struct ISSPassProvider: TimelineProvider {
    private let appGroupID = "group.com.ocoee.chronaura"

    func placeholder(in context: Context) -> ISSPassEntry {
        ISSPassEntry(date: Date(), riseDate: Date().addingTimeInterval(5400), direction: "NW → SE", peakElevation: 62, durationMin: 5, isStale: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (ISSPassEntry) -> Void) {
        completion(readEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ISSPassEntry>) -> Void) {
        let entry = readEntry()
        // Refresh every 15 minutes or when the pass starts, whichever is sooner
        let refreshDate: Date
        if let rise = entry.riseDate, rise > Date() {
            refreshDate = min(rise, Date().addingTimeInterval(900))
        } else {
            refreshDate = Date().addingTimeInterval(900)
        }
        completion(Timeline(entries: [entry], policy: .after(refreshDate)))
    }

    private func readEntry() -> ISSPassEntry {
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            return ISSPassEntry(date: Date(), riseDate: nil, direction: "—", peakElevation: 0, durationMin: 0, isStale: true)
        }

        let isoString = defaults.string(forKey: "chronaura.iss.nextRiseISO") ?? ""
        let direction = defaults.string(forKey: "chronaura.iss.direction") ?? "—"
        let peak = defaults.integer(forKey: "chronaura.iss.peakElevation")
        let dur = defaults.integer(forKey: "chronaura.iss.durationMin")

        let formatter = ISO8601DateFormatter()
        let riseDate = formatter.date(from: isoString)

        return ISSPassEntry(
            date: Date(),
            riseDate: riseDate,
            direction: direction,
            peakElevation: peak,
            durationMin: dur,
            isStale: riseDate == nil
        )
    }
}

// MARK: - View

struct ISSPassWidgetView: View {
    let entry: ISSPassEntry
    private let gold = Color(red: 212/255, green: 175/255, blue: 55/255)
    private let green = Color(red: 74/255, green: 222/255, blue: 128/255)
    private let bg = Color(red: 11/255, green: 11/255, blue: 18/255)
    private let surface = Color(red: 18/255, green: 26/255, blue: 44/255)

    var body: some View {
        ZStack {
            bg
            VStack(spacing: 5) {
                HStack(spacing: 4) {
                    Text("ISS")
                        .font(.system(size: 9, weight: .black))
                        .tracking(2)
                        .foregroundColor(gold)
                    Text("NEXT PASS")
                        .font(.system(size: 9, weight: .bold))
                        .tracking(1)
                        .foregroundColor(.gray)
                }

                if entry.isStale {
                    Text("Open Chronaura\nto update")
                        .font(.system(size: 10))
                        .multilineTextAlignment(.center)
                        .foregroundColor(.gray)
                } else if let rise = entry.riseDate {
                    if rise > Date() {
                        // Countdown
                        Text(rise, style: .relative)
                            .font(.system(size: 22, weight: .black))
                            .foregroundColor(gold)

                        Text(entry.direction)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.white)

                        HStack(spacing: 8) {
                            Label("\(entry.peakElevation)°", systemImage: "arrow.up.right")
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(.gray)
                            Label("\(entry.durationMin)m", systemImage: "clock")
                                .font(.system(size: 9, weight: .medium))
                                .foregroundColor(.gray)
                        }
                    } else {
                        // Pass is happening now or just passed
                        Text("VISIBLE NOW")
                            .font(.system(size: 14, weight: .black))
                            .foregroundColor(green)
                        Text(entry.direction)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.white)
                    }
                }
            }
            .padding(12)
        }
    }
}

// MARK: - Widget

struct ISSPassWidget: Widget {
    let kind = "ISSPassWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ISSPassProvider()) { entry in
            ISSPassWidgetView(entry: entry)
        }
        .configurationDisplayName("ISS Pass")
        .description("Countdown to the next visible ISS flyover from your location.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
