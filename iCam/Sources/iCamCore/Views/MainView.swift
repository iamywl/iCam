import SwiftUI

/// Main native iOS View for iCam
public struct MainView: View {
    @StateObject private var viewModel = CameraViewModel()

    public init() {}

    public var body: some View {
        ZStack {
            // Background Theme
            Color.black.ignoresSafeArea()

            VStack(spacing: 8) {
                // 1. Top Toolbar (Flash, Timer, Lenses, Grid, Flip)
                TopToolbarView(viewModel: viewModel)

                // 2. Viewfinder (3:4 WYSIWYG)
                ViewfinderView(viewModel: viewModel)
                    .padding(.horizontal, 12)

                // 3. Dynamic Mode Drawer (Color Palette or Filter Tray)
                if viewModel.selectedCategory == .colorStudio {
                    ColorStudioPaletteView(viewModel: viewModel)
                        .transition(.opacity)
                } else {
                    ModularFilterTrayView(viewModel: viewModel)
                        .transition(.opacity)
                }

                Spacer(minLength: 4)

                // 4. Camera Switcher Dial (6 Iconic Cameras)
                CameraRackDialView(viewModel: viewModel)

                // 5. Shutter Action Bar
                ShutterBarView(viewModel: viewModel)
                    .padding(.bottom, 8)
            }
        }
        .sheet(isPresented: $viewModel.showOpticalLensModal) {
            OpticalLensPickerModal(viewModel: viewModel)
        }
        .sheet(isPresented: $viewModel.showPrintSheetModal) {
            PassportPrintSheetModal(viewModel: viewModel)
        }
        .sheet(isPresented: $viewModel.showPhotoPreviewSheet) {
            CapturedPhotoPreviewModal(viewModel: viewModel)
        }
    }
}
