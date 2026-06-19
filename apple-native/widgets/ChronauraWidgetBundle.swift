import WidgetKit
import SwiftUI

@main
struct ChronauraWidgetBundle: WidgetBundle {
    var body: some Widget {
        TonightScoreWidget()
        MoonPhaseWidget()
        NextEventWidget()
        ISSPassWidget()
    }
}
