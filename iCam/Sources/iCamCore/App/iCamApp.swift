import SwiftUI

#if os(iOS)
@main
public struct iCamApp: App {
    public init() {}

    public var body: some Scene {
        WindowGroup {
            MainView()
                .preferredColorScheme(.dark)
        }
    }
}
#endif
