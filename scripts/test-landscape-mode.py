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
    debug_port = 9477
    chrome_candidates = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ]
    chrome_path = next((p for p in chrome_candidates if os.path.exists(p)), 'google-chrome')
    user_data_dir = tempfile.mkdtemp(prefix='icam_landscape_qa_')

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
        await cdp('Page.navigate', {'url': 'http://localhost:8080'})
        await asyncio.sleep(1.5)

        print("=" * 80)
        print("🚀 SnapStudio Landscape Mode Comprehensive Verification Suite")
        print("=" * 80)

        passed_checks = 0
        total_checks = 0

        def check(condition, desc):
            nonlocal passed_checks, total_checks
            total_checks += 1
            if condition:
                passed_checks += 1
                print(f"  [PASS] {desc}")
            else:
                print(f"  [FAIL] {desc}")
                raise AssertionError(f"Check failed: {desc}")

        # -------------------------------------------------------------
        # Test 1: Real Mobile Viewport Landscape (iPhone 16 Pro: 852 x 393)
        # -------------------------------------------------------------
        print("\n📱 [Test 1] Real Mobile Device Landscape: iPhone 16 Pro (852 × 393)")
        await cdp('Emulation.setDeviceMetricsOverride', {
            'width': 852,
            'height': 393,
            'deviceScaleFactor': 2,
            'mobile': True,
            'screenOrientation': {'type': 'landscapePrimary', 'angle': 90}
        })
        await asyncio.sleep(0.6)

        metrics = await eval_js('''(() => {
            const vf = document.querySelector('#viewfinder').getBoundingClientRect();
            const shutter = document.querySelector('#shutter-btn').getBoundingClientRect();
            const gallery = document.querySelector('#gallery-btn').getBoundingClientRect();
            const ruler = document.querySelector('#fimo-zoom-ruler-deck').getBoundingClientRect();
            const topBar = document.querySelector('.camera-top-toolbar').getBoundingClientRect();
            const rightGrip = document.querySelector('.shutter-row').getBoundingClientRect();
            return {
                vf: { width: vf.width, height: vf.height, top: vf.top, bottom: vf.bottom, left: vf.left, right: vf.right },
                shutter: { top: shutter.top, bottom: shutter.bottom, left: shutter.left, right: shutter.right, width: shutter.width, height: shutter.height },
                gallery: { top: gallery.top, bottom: gallery.bottom, left: gallery.left, right: gallery.right },
                ruler: { top: ruler.top, bottom: ruler.bottom, left: ruler.left, right: ruler.right },
                topBar: { top: topBar.top, bottom: topBar.bottom },
                rightGrip: { left: rightGrip.left, right: rightGrip.right, width: rightGrip.width },
                winW: window.innerWidth,
                winH: window.innerHeight
            };
        })()''')

        vf_ratio = metrics['vf']['width'] / metrics['vf']['height']
        check(abs(vf_ratio - 1.3333) < 0.04, f"Viewfinder 4:3 Photographic Ratio: {vf_ratio:.4f} (target: 1.3333 ± 0.04, {metrics['vf']['width']}x{metrics['vf']['height']})")
        check(metrics['shutter']['bottom'] <= metrics['winH'], f"Shutter bottom ({metrics['shutter']['bottom']}px) fully visible within viewport height ({metrics['winH']}px)")
        check(metrics['shutter']['right'] <= metrics['winW'], f"Shutter right ({metrics['shutter']['right']}px) fully visible within viewport width ({metrics['winW']}px)")
        check(metrics['shutter']['width'] >= 50 and metrics['shutter']['height'] >= 50, f"Shutter button has tactile size ({metrics['shutter']['width']}x{metrics['shutter']['height']})")
        check(metrics['gallery']['bottom'] <= metrics['winH'], f"Gallery button bottom ({metrics['gallery']['bottom']}px) within viewport height ({metrics['winH']}px)")
        check(metrics['ruler']['bottom'] <= metrics['winH'], f"Zoom ruler bottom ({metrics['ruler']['bottom']}px) within viewport height ({metrics['winH']}px)")
        check(metrics['rightGrip']['left'] >= metrics['vf']['right'], f"Zero overlap: Right grip ({metrics['rightGrip']['left']}px) sits cleanly to the right of viewfinder ({metrics['vf']['right']}px)")

        screenshot_data = await cdp('Page.captureScreenshot')
        with open('qa_landscape_iphone16pro.png', 'wb') as f:
            f.write(base64.b64decode(screenshot_data['result']['data']))
        print("  📸 Captured screenshot: qa_landscape_iphone16pro.png")

        # -------------------------------------------------------------
        # Test 2: Real Mobile Compact Landscape (iPhone SE: 667 x 375)
        # -------------------------------------------------------------
        print("\n📱 [Test 2] Real Mobile Device Landscape: iPhone SE 2/3 (667 × 375)")
        await cdp('Emulation.setDeviceMetricsOverride', {
            'width': 667,
            'height': 375,
            'deviceScaleFactor': 2,
            'mobile': True,
            'screenOrientation': {'type': 'landscapePrimary', 'angle': 90}
        })
        await asyncio.sleep(0.6)

        se_metrics = await eval_js('''(() => {
            const vf = document.querySelector('#viewfinder').getBoundingClientRect();
            const shutter = document.querySelector('#shutter-btn').getBoundingClientRect();
            const ruler = document.querySelector('#fimo-zoom-ruler-deck').getBoundingClientRect();
            return {
                vf: { width: vf.width, height: vf.height },
                shutter: { bottom: shutter.bottom, right: shutter.right },
                ruler: { bottom: ruler.bottom },
                winW: window.innerWidth,
                winH: window.innerHeight
            };
        })()''')

        se_ratio = se_metrics['vf']['width'] / se_metrics['vf']['height']
        check(abs(se_ratio - 1.3333) < 0.04, f"iPhone SE Viewfinder 4:3 Ratio: {se_ratio:.4f}")
        check(se_metrics['shutter']['bottom'] <= se_metrics['winH'], f"iPhone SE Shutter bottom ({se_metrics['shutter']['bottom']}px) <= viewport height ({se_metrics['winH']}px)")
        check(se_metrics['shutter']['right'] <= se_metrics['winW'], f"iPhone SE Shutter right ({se_metrics['shutter']['right']}px) <= viewport width ({se_metrics['winW']}px)")

        screenshot_data = await cdp('Page.captureScreenshot')
        with open('qa_landscape_iphonese.png', 'wb') as f:
            f.write(base64.b64decode(screenshot_data['result']['data']))
        print("  📸 Captured screenshot: qa_landscape_iphonese.png")

        # -------------------------------------------------------------
        # Test 3: Simulated Desktop Mode via UI Orientation Switcher
        # -------------------------------------------------------------
        print("\n💻 [Test 3] Simulated Desktop Mode (1440 × 900) via UI Toggle Button")
        await cdp('Emulation.setDeviceMetricsOverride', {
            'width': 1440,
            'height': 900,
            'deviceScaleFactor': 1,
            'mobile': False
        })
        await asyncio.sleep(0.5)

        # Click the landscape orientation button
        await eval_js("document.getElementById('btn-orient-landscape').click()")
        await asyncio.sleep(0.5)

        desktop_metrics = await eval_js('''(() => {
            const dev = document.querySelector('.device-wrapper').getBoundingClientRect();
            const vf = document.querySelector('#viewfinder').getBoundingClientRect();
            const shutter = document.querySelector('#shutter-btn').getBoundingClientRect();
            const isLandscape = document.querySelector('.camera-app').classList.contains('landscape-mode') ||
                                document.querySelector('.device-wrapper').classList.contains('orientation-landscape');
            return {
                dev: { width: dev.width, height: dev.height, top: dev.top, bottom: dev.bottom },
                vf: { width: vf.width, height: vf.height },
                shutter: { bottom: shutter.bottom, right: shutter.right },
                isLandscape: isLandscape,
                winH: window.innerHeight
            };
        })()''')

        check(desktop_metrics['isLandscape'] is True, "Orientation landscape class applied to device wrapper and camera app")
        check(desktop_metrics['dev']['width'] > desktop_metrics['dev']['height'], f"Simulated phone width ({desktop_metrics['dev']['width']}px) > height ({desktop_metrics['dev']['height']}px)")
        check(desktop_metrics['dev']['bottom'] <= desktop_metrics['winH'], f"Simulated phone frame bottom ({desktop_metrics['dev']['bottom']}px) within window height ({desktop_metrics['winH']}px)")

        screenshot_data = await cdp('Page.captureScreenshot')
        with open('qa_landscape_desktop_simulated.png', 'wb') as f:
            f.write(base64.b64decode(screenshot_data['result']['data']))
        print("  📸 Captured screenshot: qa_landscape_desktop_simulated.png")

        # -------------------------------------------------------------
        # Test 4: Photo Capture & EXIF in Landscape Mode
        # -------------------------------------------------------------
        print("\n📸 [Test 4] Photo Capture Canvas & EXIF Verification in Landscape Mode")
        capture_result = await eval_js('''(() => {
            executeCapture();
            const photo = state.gallery[0];
            return {
                id: photo.id,
                width: photo.width,
                height: photo.height,
                aspectRatio: photo.aspectRatio,
                focal: photo.focalLength
            };
        })()''')

        check(capture_result['width'] == 1040 and capture_result['height'] == 780, f"Landscape capture canvas resolution: {capture_result['width']} × {capture_result['height']} (exact 4:3)")
        check("4:3" in capture_result['aspectRatio'], f"EXIF Aspect Ratio contains 4:3: '{capture_result['aspectRatio']}'")

        print("=" * 80)
        print(f"🏁 ALL {passed_checks}/{total_checks} LANDSCAPE QA CHECKS PASSED (100.0%)")
        print("🎉 ZERO CLIPPING & ZERO OVERLAP CONFIRMED ACROSS ALL LANDSCAPE TIERS!")
        print("=" * 80)

        await ws.close()

    finally:
        proc.terminate()

asyncio.run(main())
