import WidgetKit
import SwiftUI

struct ConnifyWidgetEntry: TimelineEntry {
    let date: Date
    let isAuthenticated: Bool
    let isOnline: Bool
    let protectionStatus: String
    let statusText: String
    let nearbyHelpersCount: Int
}

struct ConnifyWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> ConnifyWidgetEntry {
        ConnifyWidgetEntry(
            date: Date(),
            isAuthenticated: true,
            isOnline: true,
            protectionStatus: "READY",
            statusText: "Protection Ready",
            nearbyHelpersCount: 4
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (ConnifyWidgetEntry) -> ()) {
        completion(fetchCurrentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ConnifyWidgetEntry>) -> ()) {
        let entry = fetchCurrentEntry()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func fetchCurrentEntry() -> ConnifyWidgetEntry {
        let defaults = UserDefaults(suiteName: "group.com.connify.safety") ?? UserDefaults.standard
        guard let jsonString = defaults.string(forKey: "widget_data"),
              let data = jsonString.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return ConnifyWidgetEntry(
                date: Date(),
                isAuthenticated: false,
                isOnline: true,
                protectionStatus: "UNAUTHENTICATED",
                statusText: "Sign in Required",
                nearbyHelpersCount: 0
            )
        }

        return ConnifyWidgetEntry(
            date: Date(),
            isAuthenticated: json["isAuthenticated"] as? Bool ?? false,
            isOnline: json["isOnline"] as? Bool ?? true,
            protectionStatus: json["protectionStatus"] as? String ?? "UNAUTHENTICATED",
            statusText: json["statusText"] as? String ?? "Sign in Required",
            nearbyHelpersCount: json["nearbyHelpersCount"] as? Int ?? 0
        )
    }
}

struct ConnifyWidgetEntryView: View {
    var entry: ConnifyWidgetEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            Color(red: 24/255, green: 32/255, blue: 51/255)
                .ignoresSafeArea()

            switch family {
            case .systemSmall:
                SmallWidgetView(entry: entry)
            case .systemLarge:
                LargeWidgetView(entry: entry)
            default:
                MediumWidgetView(entry: entry)
            }
        }
    }
}

struct SmallWidgetView: View {
    let entry: ConnifyWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("🛡 CONNIFY")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(Color(red: 248/255, green: 113/255, blue: 113/255))

            Text(entry.isAuthenticated ? (entry.isOnline ? "Ready" : "Offline") : "Sign in")
                .font(.system(size: 10))
                .foregroundColor(.gray)

            Spacer()

            Link(destination: URL(string: "connify://sos")!) {
                Text("SEND SOS")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(Color(red: 220/255, green: 38/255, blue: 38/255))
                    .cornerRadius(8)
            }
        }
        .padding(12)
    }
}

struct MediumWidgetView: View {
    let entry: ConnifyWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("🛡 CONNIFY SAFETY")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(Color(red: 248/255, green: 113/255, blue: 113/255))

            Text(entry.isAuthenticated ? (entry.isOnline ? "Quick emergency access" : "● Offline Mode (SMS Active)") : "Sign in to Connify Safety")
                .font(.system(size: 11))
                .foregroundColor(.gray)

            Spacer()

            HStack(spacing: 8) {
                Link(destination: URL(string: "connify://sos")!) {
                    Text("SEND SOS")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color(red: 220/255, green: 38/255, blue: 38/255))
                        .cornerRadius(8)
                }

                Link(destination: URL(string: "connify://nearby-help")!) {
                    Text("NEARBY HELP")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color(red: 40/255, green: 50/255, blue: 72/255))
                        .cornerRadius(8)
                }
            }
        }
        .padding(14)
    }
}

struct LargeWidgetView: View {
    let entry: ConnifyWidgetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("🛡 CONNIFY SAFETY")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(Color(red: 248/255, green: 113/255, blue: 113/255))

            Text(entry.isOnline ? "● Protection Ready" : "● Offline Mode")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(entry.isOnline ? Color.green : Color.orange)

            Spacer()

            Link(destination: URL(string: "connify://sos")!) {
                Text("SEND SOS")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color(red: 220/255, green: 38/255, blue: 38/255))
                    .cornerRadius(8)
            }

            Link(destination: URL(string: "connify://nearby-help")!) {
                Text("REQUEST NEARBY HELP")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color(red: 40/255, green: 50/255, blue: 72/255))
                    .cornerRadius(8)
            }

            Link(destination: URL(string: "connify://home")!) {
                Text("OPEN CONNIFY")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color(red: 40/255, green: 50/255, blue: 72/255))
                    .cornerRadius(8)
            }

            Spacer()

            Text(entry.isOnline ? "Nearby helpers: \(entry.nearbyHelpersCount)" : "Offline Mode: Cellular SMS active")
                .font(.system(size: 11))
                .foregroundColor(.gray)
        }
        .padding(16)
    }
}

@main
struct ConnifyWidget: Widget {
    let kind: String = "ConnifyWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ConnifyWidgetProvider()) { entry in
            ConnifyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Connify Safety")
        .description("Quick emergency SOS and nearby help widget.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
