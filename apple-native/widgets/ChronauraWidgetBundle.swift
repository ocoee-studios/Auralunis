import WidgetKit
import SwiftUI

@main
struct AuraLunisWidgetBundle: WidgetBundle {
    var body: some Widget {
        TonightScoreWidget()
        MoonPhaseWidget()
        NextEventWidget()
        ISSPassWidget()
    }
}
