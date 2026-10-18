import os
import sys
import json
import subprocess
import tempfile
import asyncio
import urllib.request
import base64

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

async def main():
    import websockets
    debug_port = 9478
    chrome_candidates = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ]
    chrome_path = next((p for p in chrome_candidates if os.path.exists(p)), 'google-chrome')
    user_data_dir = tempfile.mkdtemp(prefix='icam_multi_device_qa_')

    proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        f'--remote-debugging-port={debug_port}',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1440,900'
    ])
    await asyncio.sleep(1.2)

    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{debug_port}/json') as resp:
            tabs = json.loads(resp.read().decode())
            ws_url = tabs[0]['webSocketDebuggerUrl']

        ws = await websockets.connect(ws_url, max_size=100_000_000)

        async def cdp(method, params=None):
            import random
            mid = random.randint(1, 1000000)
            await ws.send(json.dumps({'id': mid, 'method': method, 'params': params or {}}))
            while True:
                msg = json.loads(await ws.recv())
                if msg.get('id') == mid:
                    return msg

        async def eval_js(expr):
            res = await cdp('Runtime.evaluate', {'expression': expr, 'returnByValue': True, 'awaitPromise': True})
            return res.get('result', {}).get('result', {}).get('value')

        await cdp('Page.enable')
        await cdp('Runtime.enable')

        url = 'http://localhost:8080/index.html'
        print(f"Navigating to {url} ...")
        await cdp('Page.navigate', {'url': url})
        await asyncio.sleep(2.0)

        print("\n" + "="*80)
        print("📱 SnapStudio Universal Multi-Device Compatibility Test Suite")
        print("="*80)

        tests_passed = 0
        total_tests = 0

        def check(condition, message):
            nonlocal tests_passed, total_tests
            total_tests += 1
            if condition:
                print(f"  [PASS] {message}")
                tests_passed += 1
            else:
                print(f"  [FAIL] {message}")
                raise AssertionError(f"Check failed: {message}")

        # -------------------------------------------------------------
        # Test 1: Real-time Browser Hardware & Device Detector Web APIs
        # -------------------------------------------------------------
        print("\n📡 [Test 1] Browser DeviceDetector Hardware API Verification")
        detector_info = await eval_js("(() => window.DeviceDetector ? window.DeviceDetector.getInfo() : null)()")
        check(detector_info is not None, "window.DeviceDetector is available")
        check('os' in detector_info and len(detector_info['os']) > 0, f"Detected OS: {detector_info.get('os')}")
        check('dpr' in detector_info and detector_info['dpr'] > 0, f"Detected Device Pixel Ratio: {detector_info.get('dpr')}x")
        check('screenWidth' in detector_info and detector_info['screenWidth'] > 0, f"Physical Screen: {detector_info.get('screenWidth')}x{detector_info.get('screenHeight')}")

        hud_brand = await eval_js("document.getElementById('hud-device-brand')?.textContent || ''")
        check("감지 중..." not in hud_brand and len(hud_brand) > 0, f"Live HUD Brand populated: '{hud_brand}'")

        hud_res = await eval_js("document.getElementById('hud-screen-resolution')?.textContent || ''")
        check("감지 중..." not in hud_res and len(hud_res) > 0, f"Live HUD Resolution populated: '{hud_res}'")

        # -------------------------------------------------------------
        # Test 2: Galaxy S24 Ultra (412 × 915)
        # -------------------------------------------------------------
        print("\n📱 [Test 2] Android Flagship: Samsung Galaxy S24 Ultra (412 × 915)")
        await cdp('Emulation.setDeviceMetricsOverride', {
            'width': 412,
            'height': 915,
            'deviceScaleFactor': 2.6,
            'mobile': True,
            'screenOrientation': {'type': 'portraitPrimary', 'angle': 0}
        })
        await asyncio.sleep(0.5)

        await eval_js("window.selectDevicePreset('galaxy', 412, 915, 40)")
        await asyncio.sleep(0.5)

        galaxy_classes = await eval_js("document.querySelector('.device-wrapper').className")
        check('device-galaxy' in galaxy_classes, "device-galaxy class applied to wrapper")

        # Punch hole cutout check
        island_rect = await eval_js("""
            (() => {
                const island = document.querySelector('.device-wrapper.device-galaxy .dynamic-island');
                if (!island) return null;
                const r = island.getBoundingClientRect();
                return { width: r.width, height: r.height };
            })()
        """)
        check(island_rect and island_rect['width'] <= 20 and island_rect['height'] <= 20, 
              f"Punch-hole camera dimensions compact: {island_rect['width']}x{island_rect['height']}")

        # Viewfinder ratio in Galaxy
        vf_metrics = await eval_js("""
            (() => {
                const vf = document.querySelector('#viewfinder');
                const shutter = document.querySelector('#shutter-btn');
                const wrap = document.querySelector('.device-wrapper');
                const vr = vf.getBoundingClientRect();
                const sr = shutter.getBoundingClientRect();
                const wr = wrap.getBoundingClientRect();
                return {
                    vfWidth: vr.width,
                    vfHeight: vr.height,
                    ratio: vr.height / vr.width,
                    shutterBottom: sr.bottom,
                    wrapperBottom: wr.bottom,
                    windowHeight: window.innerHeight
                };
            })()
        """)
        check(abs(vf_metrics['ratio'] - 1.3333) < 0.05, f"Galaxy Viewfinder 3:4 Photographic Ratio: {vf_metrics['ratio']:.4f} ({vf_metrics['vfWidth']}x{vf_metrics['vfHeight']})")
        check(vf_metrics['shutterBottom'] <= vf_metrics['windowHeight'] + 5, f"Galaxy Shutter fully visible: {vf_metrics['shutterBottom']}px <= {vf_metrics['windowHeight']}px")

        # Galaxy Hardware Buttons verification (Right-side ergonomics, no action button)
        hw_galaxy = await eval_js("""
            (() => {
                const action = document.querySelector('.device-wrapper.device-galaxy .hw-action');
                const volUp = document.querySelector('.device-wrapper.device-galaxy .hw-vol-up');
                const volDown = document.querySelector('.device-wrapper.device-galaxy .hw-vol-down');
                const power = document.querySelector('.device-wrapper.device-galaxy .hw-power');
                const csAction = action ? getComputedStyle(action) : null;
                const csVolUp = volUp ? getComputedStyle(volUp) : null;
                const csPower = power ? getComputedStyle(power) : null;
                return {
                    actionHidden: csAction ? csAction.display === 'none' : true,
                    volUpOnRight: csVolUp ? csVolUp.right === '-3px' && csVolUp.left === 'auto' : false,
                    powerOnRight: csPower ? csPower.right === '-3px' && csPower.left === 'auto' : false
                };
            })()
        """)
        check(hw_galaxy['actionHidden'], "Galaxy S24 Ultra: Action button is correctly hidden")
        check(hw_galaxy['volUpOnRight'], "Galaxy S24 Ultra: Volume buttons positioned on right edge")
        check(hw_galaxy['powerOnRight'], "Galaxy S24 Ultra: Power button positioned on right edge")

        shot2 = await cdp('Page.captureScreenshot')
        with open('multi_galaxy_s24_ultra.png', 'wb') as f:
            f.write(base64.b64decode(shot2['result']['data']))
        print("  📸 Captured screenshot: multi_galaxy_s24_ultra.png")

        # -------------------------------------------------------------
        # Test 3: iPad Pro / Tablet (768 × 1024 portrait & 1024 × 768 landscape)
        # -------------------------------------------------------------
        print("\n📱 [Test 3] Tablet Mode: iPad Pro / Tablet (768 × 1024 Portrait & Landscape)")
        await cdp('Emulation.setDeviceMetricsOverride', {
            'width': 768,
            'height': 1024,
            'deviceScaleFactor': 2,
            'mobile': True,
            'screenOrientation': {'type': 'portraitPrimary', 'angle': 0}
        })
        await asyncio.sleep(0.5)

        await eval_js("window.selectDevicePreset('tablet', 768, 1024, 28)")
        await asyncio.sleep(0.5)

        tablet_p_metrics = await eval_js("""
            (() => {
                const vf = document.querySelector('#viewfinder').getBoundingClientRect();
                const shutter = document.querySelector('#shutter-btn').getBoundingClientRect();
                return {
                    ratio: vf.height / vf.width,
                    shutterBottom: shutter.bottom,
                    windowHeight: window.innerHeight
                };
            })()
        """)
        check(abs(tablet_p_metrics['ratio'] - 1.3333) < 0.05, f"Tablet Portrait Viewfinder 3:4 Ratio: {tablet_p_metrics['ratio']:.4f}")
        check(tablet_p_metrics['shutterBottom'] <= tablet_p_metrics['windowHeight'] + 5, "Tablet Portrait Shutter fully visible")

        # iPad Pro Hardware Buttons verification
        hw_tablet = await eval_js("""
            (() => {
                const action = document.querySelector('.device-wrapper.device-tablet .hw-action');
                const power = document.querySelector('.device-wrapper.device-tablet .hw-power');
                const volUp = document.querySelector('.device-wrapper.device-tablet .hw-vol-up');
                const csAction = action ? getComputedStyle(action) : null;
                const csPower = power ? getComputedStyle(power) : null;
                const csVolUp = volUp ? getComputedStyle(volUp) : null;
                return {
                    actionHidden: csAction ? csAction.display === 'none' : true,
                    powerOnTop: csPower ? csPower.top === '-3px' : false,
                    volOnRight: csVolUp ? csVolUp.right === '-3px' : false
                };
            })()
        """)
        check(hw_tablet['actionHidden'], "iPad Pro: Action button is correctly hidden")
        check(hw_tablet['powerOnTop'], "iPad Pro: Top sleep/wake button on top edge")
        check(hw_tablet['volOnRight'], "iPad Pro: Volume buttons on upper-right edge")

        # Medium viewport / Tablet Quickbar & Device Modal verification
        quickbar_info = await eval_js("""
            (() => {
                const bar = document.getElementById('mobile-compact-quickbar');
                const panel = document.querySelector('.showcase-panel');
                return {
                    quickbarVisible: bar ? getComputedStyle(bar).display !== 'none' : false,
                    panelHidden: panel ? getComputedStyle(panel).display === 'none' : true
                };
            })()
        """)
        check(quickbar_info['panelHidden'], "Desktop showcase sidebars are hidden in 768px tablet portrait")
        check(quickbar_info['quickbarVisible'], "Compact Quick Utility Bar is visible in 768px tablet portrait")

        # Open Device Selector Modal via Quickbar button
        await eval_js("document.getElementById('quickbar-devices-btn')?.click()")
        await asyncio.sleep(0.3)

        modal_state = await eval_js("""
            (() => {
                const modal = document.getElementById('device-selector-modal');
                const isOpen = modal ? modal.classList.contains('open') : false;
                const cards = document.querySelectorAll('#device-selector-modal .modal-device-card');
                const brand = document.getElementById('modal-hud-device-brand')?.textContent || '';
                return {
                    isOpen,
                    cardCount: cards.length,
                    hudBrandPopulated: brand.length > 0 && !brand.includes('감지 중...')
                };
            })()
        """)
        check(modal_state['isOpen'], "Device Selector Modal opened cleanly via Quickbar button")
        check(modal_state['cardCount'] >= 6, f"All device preset cards available in modal: {modal_state['cardCount']} cards")
        check(modal_state['hudBrandPopulated'], "Live hardware info populated in Device Selector Modal HUD")

        # Close Device Selector Modal via Close button
        await eval_js("document.getElementById('btn-close-device-modal')?.click()")
        await asyncio.sleep(0.3)
        modal_closed = await eval_js("!document.getElementById('device-selector-modal')?.classList.contains('open')")
        check(modal_closed, "Device Selector Modal closed cleanly via X button")

        shot3_p = await cdp('Page.captureScreenshot')
        with open('multi_ipad_mini_portrait.png', 'wb') as f:
            f.write(base64.b64decode(shot3_p['result']['data']))
        print("  📸 Captured screenshot: multi_ipad_mini_portrait.png")

        # Tablet Landscape
        await cdp('Emulation.setDeviceMetricsOverride', {
            'width': 1024,
            'height': 768,
            'deviceScaleFactor': 2,
            'mobile': True,
            'screenOrientation': {'type': 'landscapePrimary', 'angle': 90}
        })
        await eval_js("window.setOrientation('landscape')")
        await asyncio.sleep(0.5)

        tablet_l_metrics = await eval_js("""
            (() => {
                const vf = document.querySelector('#viewfinder').getBoundingClientRect();
                const shutter = document.querySelector('#shutter-btn').getBoundingClientRect();
                return {
                    ratio: vf.width / vf.height,
                    shutterRight: shutter.right,
                    windowWidth: window.innerWidth,
                    shutterBottom: shutter.bottom,
                    windowHeight: window.innerHeight
                };
            })()
        """)
        check(abs(tablet_l_metrics['ratio'] - 1.3333) < 0.05, f"Tablet Landscape Viewfinder 4:3 Ratio: {tablet_l_metrics['ratio']:.4f}")
        check(tablet_l_metrics['shutterRight'] <= tablet_l_metrics['windowWidth'] + 5, "Tablet Landscape Shutter on right thumb grip")

        shot3_l = await cdp('Page.captureScreenshot')
        with open('multi_ipad_mini_landscape.png', 'wb') as f:
            f.write(base64.b64decode(shot3_l['result']['data']))
        print("  📸 Captured screenshot: multi_ipad_mini_landscape.png")

        await eval_js("window.setOrientation('portrait')")

        # -------------------------------------------------------------
        # Test 4: Galaxy Z Fold (884 × 1104)
        # -------------------------------------------------------------
        print("\n📱 [Test 4] Foldable Mode: Galaxy Z Fold (884 × 1104)")
        await cdp('Emulation.setDeviceMetricsOverride', {
            'width': 884,
            'height': 1104,
            'deviceScaleFactor': 2,
            'mobile': True,
            'screenOrientation': {'type': 'portraitPrimary', 'angle': 0}
        })
        await asyncio.sleep(0.5)

        await eval_js("window.selectDevicePreset('fold', 884, 1104, 24)")
        await asyncio.sleep(0.5)

        fold_classes = await eval_js("document.querySelector('.device-wrapper').className")
        check('device-fold' in fold_classes, "device-fold class applied to wrapper")

        shot4 = await cdp('Page.captureScreenshot')
        with open('multi_galaxy_fold_unfolded.png', 'wb') as f:
            f.write(base64.b64decode(shot4['result']['data']))
        print("  📸 Captured screenshot: multi_galaxy_fold_unfolded.png")

        # -------------------------------------------------------------
        # Test 5: Laptop Short Window Auto-Scaling (1280 × 700)
        # -------------------------------------------------------------
        print("\n💻 [Test 5] Small Laptop Screen Height Emulation (1280 × 700)")
        await cdp('Emulation.setDeviceMetricsOverride', {
            'width': 1280,
            'height': 700,
            'deviceScaleFactor': 1,
            'mobile': False,
            'screenOrientation': {'type': 'landscapePrimary', 'angle': 0}
        })
        await asyncio.sleep(0.5)

        await eval_js("window.selectDevicePreset('standard', 393, 852, 54)")
        await eval_js("window.autoScaleDeviceFrame()")
        await asyncio.sleep(0.5)

        scaled_bounds = await eval_js("""
            (() => {
                const wrap = document.querySelector('.device-wrapper');
                const shutter = document.getElementById('shutter-btn');
                const wr = wrap.getBoundingClientRect();
                const sr = shutter.getBoundingClientRect();
                const targetH = window.innerHeight > 100 ? window.innerHeight : 700;
                return {
                    wrapperBottom: wr.bottom,
                    shutterBottom: sr.bottom,
                    windowHeight: targetH,
                    noClip: sr.bottom <= targetH + 5
                };
            })()
        """)
        check(scaled_bounds['noClip'], f"Auto-scaling prevented clipping on 700px height: Shutter {scaled_bounds['shutterBottom']}px <= Viewport {scaled_bounds['windowHeight']}px")

        shot5 = await cdp('Page.captureScreenshot')
        with open('multi_small_laptop___half_window.png', 'wb') as f:
            f.write(base64.b64decode(shot5['result']['data']))
        print("  📸 Captured screenshot: multi_small_laptop___half_window.png")

        # -------------------------------------------------------------
        # Test 6: Surface Pro Tablet (912 × 1368)
        # -------------------------------------------------------------
        print("\n📱 [Test 6] Surface Pro Tablet (912 × 1368)")
        await cdp('Emulation.setDeviceMetricsOverride', {
            'width': 912,
            'height': 1368,
            'deviceScaleFactor': 2,
            'mobile': True,
            'screenOrientation': {'type': 'portraitPrimary', 'angle': 0}
        })
        await asyncio.sleep(0.5)

        shot6 = await cdp('Page.captureScreenshot')
        with open('multi_surface_pro_tablet.png', 'wb') as f:
            f.write(base64.b64decode(shot6['result']['data']))
        print("  📸 Captured screenshot: multi_surface_pro_tablet.png")

        # -------------------------------------------------------------
        # Test 7: Fluid Fullscreen Mode (100% Screen Native)
        # -------------------------------------------------------------
        print("\n⚡️ [Test 7] Fluid Native Fullscreen Mode (100vw × 100dvh)")
        await eval_js("window.selectDevicePreset('fluid', 0, 0, 0)")
        await asyncio.sleep(0.5)

        fluid_state = await eval_js("""
            (() => {
                const wrap = document.querySelector('.device-wrapper');
                const exitBtn = document.getElementById('btn-exit-fluid');
                const isFluid = wrap.classList.contains('device-fluid') && document.body.classList.contains('is-fluid-fullscreen');
                const exitVisible = exitBtn && getComputedStyle(exitBtn).display !== 'none';
                return { isFluid, exitVisible };
            })()
        """)
        check(fluid_state['isFluid'], "Fluid fullscreen classes active on body and wrapper")
        check(fluid_state['exitVisible'], "Floating Exit button is visible in fluid fullscreen mode")

        # Test photo capture in fluid mode
        print("\n📸 [Test 8] Photo Capture Execution in Multi-Device Mode")
        capture_result = await eval_js("""
            (() => {
                executeCapture();
                const photo = (typeof state !== 'undefined' && state.gallery && state.gallery.length > 0) ? state.gallery[0] : null;
                return {
                    success: !!photo,
                    width: photo?.width,
                    height: photo?.height,
                    ratioText: photo?.aspectRatioText
                };
            })()
        """)
        check(capture_result.get('success'), f"Capture completed successfully: {capture_result.get('width')}x{capture_result.get('height')} ({capture_result.get('ratioText')})")

        # Exit fluid mode cleanly
        await eval_js("document.getElementById('btn-exit-fluid')?.click()")
        await asyncio.sleep(0.5)

        restored_standard = await eval_js("document.querySelector('.device-wrapper')?.classList.contains('device-standard')")
        check(restored_standard, "Clean exit from fluid mode back to standard iPhone preset")

        print("\n" + "="*80)
        print(f"🏁 ALL {tests_passed}/{total_tests} MULTI-DEVICE COMPATIBILITY CHECKS PASSED (100.0%)")
        print("🎉 UNIVERSAL MULTI-DEVICE SUPPORT & HARDWARE DETECTION FULLY VERIFIED!")
        print("="*80 + "\n")

    finally:
        proc.kill()

if __name__ == '__main__':
    asyncio.run(main())
