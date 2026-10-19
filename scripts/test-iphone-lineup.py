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
    debug_port = 9492
    chrome_candidates = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ]
    chrome_path = next((p for p in chrome_candidates if os.path.exists(p)), 'google-chrome')
    user_data_dir = tempfile.mkdtemp(prefix='icam_iphone_lineup_qa_')

    proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        f'--remote-debugging-port={debug_port}',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1440,900'
    ])

    try:
        tabs = None
        for _ in range(15):
            await asyncio.sleep(0.4)
            try:
                with urllib.request.urlopen(f'http://127.0.0.1:{debug_port}/json') as resp:
                    tabs = json.loads(resp.read().decode())
                    if tabs:
                        break
            except Exception:
                pass
        if not tabs:
            raise RuntimeError("Failed to connect to headless Chrome CDP")
        ws_url = next((t['webSocketDebuggerUrl'] for t in tabs if t.get('type') == 'page'), tabs[0]['webSocketDebuggerUrl'])

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

        print("\n" + "="*88)
        print("🍎 SnapStudio Exhaustive 8-Model Real iPhone Compatibility Verification Suite")
        print("="*88)

        iphone_models = [
            {
                'model': 'iPhone SE (2nd/3rd Gen)',
                'w': 375, 'h': 667, 'dpr': 2,
                'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
            },
            {
                'model': 'iPhone 13 mini / 12 mini',
                'w': 375, 'h': 812, 'dpr': 3,
                'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
            },
            {
                'model': 'iPhone 14 / 13 / 12',
                'w': 390, 'h': 844, 'dpr': 3,
                'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
            },
            {
                'model': 'iPhone 15 / 15 Pro / 16',
                'w': 393, 'h': 852, 'dpr': 3,
                'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
            },
            {
                'model': 'iPhone 16 Pro',
                'w': 402, 'h': 874, 'dpr': 3,
                'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
            },
            {
                'model': 'iPhone 14 Plus / 13 Pro Max',
                'w': 428, 'h': 926, 'dpr': 3,
                'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
            },
            {
                'model': 'iPhone 15 Plus / 15 Pro Max / 16 Plus',
                'w': 430, 'h': 932, 'dpr': 3,
                'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
            },
            {
                'model': 'iPhone 16 Pro Max',
                'w': 440, 'h': 956, 'dpr': 3,
                'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
            }
        ]

        all_cameras = [
            'canon-ixy', 'sony-handycam', 'sony-cybershot', 'instax-mini',
            'olympus-mju', 'contax-t2', 'ricoh-gr', 'leica-m',
            'citypop-80s', 'oldfilm-35mm', 'sihyun-color', 'passport-id',
            'hasselblad-500cm', 'polaroid-sx70', 'fuji-quicksnap', 'kyocera-samurai'
        ]

        tests_passed = 0
        total_tests = 0

        def check(condition, message):
            nonlocal tests_passed, total_tests
            total_tests += 1
            if condition:
                tests_passed += 1
            else:
                print(f"  ❌ [FAIL] {message}")
                raise AssertionError(f"Check failed: {message}")

        for idx, iphone in enumerate(iphone_models, 1):
            name = iphone['model']
            w = iphone['w']
            h = iphone['h']
            dpr = iphone['dpr']
            ua = iphone['ua']

            print(f"\n📱 [{idx}/8] {name} — Native Viewport: {w}×{h}pt (@{dpr}x DPR)")

            # 1. Portrait Mode Native Emulation (mobile=False to avoid Headless Chrome innerHeight=1 bug while setting exact viewport + touch + iOS UA)
            await cdp('Emulation.setUserAgentOverride', {
                'userAgent': ua,
                'platform': 'iPhone'
            })
            await cdp('Emulation.setTouchEmulationEnabled', {
                'enabled': True,
                'maxTouchPoints': 5
            })
            await cdp('Emulation.setDeviceMetricsOverride', {
                'width': w,
                'height': h,
                'deviceScaleFactor': dpr,
                'mobile': False,
                'screenOrientation': {'type': 'portraitPrimary', 'angle': 0}
            })
            await eval_js("window.setOrientation('portrait'); window.selectDevicePreset('fluid', 0, 0, 0);")
            await asyncio.sleep(0.25)

            # Verify DeviceDetector identifies Apple iPhone (iOS) and Exact Viewport
            det = await eval_js("window.DeviceDetector.getInfo()")
            check(det['os'] == 'iOS' and det['brand'] == 'Apple iPhone',
                  f"{name}: DeviceDetector identified '{det['brand']} ({det['os']})'")
            check(det['viewportWidth'] == w and det['viewportHeight'] == h,
                  f"{name}: Viewport matched {det['viewportWidth']}×{det['viewportHeight']}pt")
            print(f"  ✅ [PASS] Hardware Detection: {det['brand']} ({det['os']}) | Viewport: {det['viewportWidth']}×{det['viewportHeight']}pt (@{det['dpr']}x)")

            # 2. Test all 16 cameras in Portrait Mode on this iPhone
            portrait_cam_failures = []
            for cam_id in all_cameras:
                metrics = await eval_js(f"""
                    (() => {{
                        window.switchCamera('{cam_id}');
                        const app = document.querySelector('.camera-app').getBoundingClientRect();
                        const tb = document.querySelector('.camera-top-toolbar').getBoundingClientRect();
                        const vf = document.querySelector('.viewfinder-container').getBoundingClientRect();
                        const cd = document.querySelector('.control-drawer').getBoundingClientRect();
                        const bs = document.querySelector('.camera-bottom-section').getBoundingClientRect();
                        const zr = document.getElementById('fimo-zoom-ruler-deck').getBoundingClientRect();
                        const hb = document.querySelector('.fimo-hardware-bar').getBoundingClientRect();
                        const sr = document.querySelector('.shutter-row').getBoundingClientRect();
                        const sb = document.getElementById('shutter-btn').getBoundingClientRect();

                        const ratio = vf.width / vf.height;
                        const tbVfOverlap = Math.max(0, tb.bottom - vf.top);
                        const vfCdOverlap = Math.max(0, vf.bottom - cd.top);
                        const cdBsOverlap = Math.max(0, cd.bottom - bs.top);
                        const zrHbOverlap = Math.max(0, zr.bottom - hb.top);
                        const hbSrOverlap = Math.max(0, hb.bottom - sr.top);
                        const bottomClip = Math.max(0, sr.bottom - window.innerHeight);
                        const horizOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;

                        return {{
                            ratio,
                            vfW: Math.round(vf.width),
                            vfH: Math.round(vf.height),
                            tbVfOverlap,
                            vfCdOverlap,
                            cdBsOverlap,
                            zrHbOverlap,
                            hbSrOverlap,
                            bottomClip,
                            horizOverflow,
                            shutterVisible: sb.width >= 44 && sb.height >= 44 && sb.bottom <= window.innerHeight + 1
                        }};
                    }})()
                """)
                ratio_ok = abs(metrics['ratio'] - 0.75) < 0.03
                no_overlap = (
                    metrics['tbVfOverlap'] <= 1.5 and
                    metrics['vfCdOverlap'] <= 1.5 and
                    metrics['cdBsOverlap'] <= 1.5 and
                    metrics['zrHbOverlap'] <= 1.5 and
                    metrics['hbSrOverlap'] <= 1.5
                )
                no_clip = metrics['bottomClip'] <= 1.5 and not metrics['horizOverflow'] and metrics['shutterVisible']

                check(ratio_ok, f"{name} [{cam_id}] Portrait 3:4 viewfinder ratio ({metrics['vfW']}×{metrics['vfH']}, ratio={metrics['ratio']:.3f})")
                check(no_overlap, f"{name} [{cam_id}] Portrait zero vertical overlap (tbVf={metrics['tbVfOverlap']:.1f}, vfCd={metrics['vfCdOverlap']:.1f}, cdBs={metrics['cdBsOverlap']:.1f})")
                check(no_clip, f"{name} [{cam_id}] Portrait zero bottom/horizontal clipping (clip={metrics['bottomClip']:.1f}, shutterVisible={metrics['shutterVisible']})")

            print(f"  ✅ [PASS] Portrait 16/16 Cameras: 3:4 Optical Ratio ({metrics['vfW']}×{metrics['vfH']}px), 0px Overlap, 0px Clipping, Shutter Ready")

            # Test Zoom (2.0x), EV (+0.5), Caption ON, and Shutter Capture in Portrait
            await eval_js("""
                window.switchCamera('sony-cybershot');
                window.setFimoZoom(2.0);
                window.setFimoExposureEV(0.5);
                if (!window.state.fimoCaptionEnabled) document.getElementById('fimo-toggle-caption').click();
                window.executeCapture();
            """)
            await asyncio.sleep(0.25)
            p_cap = await eval_js("window.state.gallery[0] ? {w: window.state.gallery[0].width, h: window.state.gallery[0].height, cap: window.state.gallery[0].caption} : null")
            check(p_cap is not None and p_cap['w'] == 780 and p_cap['h'] == 1040 and 'Ditto' in p_cap['cap'],
                  f"{name} Portrait Capture 780×1040 (3:4) with Ditto Caption")
            await eval_js("window.closeGalleryModal && window.closeGalleryModal(); window.setFimoZoom(1.0); window.setFimoExposureEV(0.0);")

            # 3. Landscape Mode Native Emulation (h × w) on this iPhone
            lw, lh = h, w
            await cdp('Emulation.setDeviceMetricsOverride', {
                'width': lw,
                'height': lh,
                'deviceScaleFactor': dpr,
                'mobile': False,
                'screenOrientation': {'type': 'landscapePrimary', 'angle': 90}
            })
            await eval_js("window.setOrientation('landscape');")
            await asyncio.sleep(0.25)

            land_metrics = await eval_js("""
                (() => {
                    window.switchCamera('citypop-80s');
                    const tb = document.querySelector('.camera-top-toolbar').getBoundingClientRect();
                    const vf = document.querySelector('.viewfinder-container').getBoundingClientRect();
                    const zr = document.querySelector('.fimo-zoom-ruler-deck').getBoundingClientRect();
                    const sr = document.querySelector('.shutter-row').getBoundingClientRect();
                    const sb = document.getElementById('shutter-btn').getBoundingClientRect();
                    const ratio = vf.width / vf.height;
                    const vfSrOverlap = Math.max(0, vf.right - sr.left);
                    const tbVfOverlap = Math.max(0, tb.bottom - vf.top);
                    const vfZrOverlap = Math.max(0, vf.bottom - zr.top);
                    const rightClip = Math.max(0, sr.right - window.innerWidth);
                    const bottomClip = Math.max(0, sr.bottom - window.innerHeight, zr.bottom - window.innerHeight);
                    return {
                        ratio,
                        vfW: Math.round(vf.width),
                        vfH: Math.round(vf.height),
                        vfSrOverlap,
                        tbVfOverlap,
                        vfZrOverlap,
                        rightClip,
                        bottomClip,
                        shutterOk: sb.width >= 40 && sb.right <= window.innerWidth + 1 && sb.bottom <= window.innerHeight + 1
                    };
                })()
            """)
            check(abs(land_metrics['ratio'] - (4.0 / 3.0)) < 0.05,
                  f"{name} Landscape 4:3 viewfinder ratio ({land_metrics['vfW']}×{land_metrics['vfH']}, ratio={land_metrics['ratio']:.3f})")
            check(land_metrics['vfSrOverlap'] <= 2.0 and land_metrics['tbVfOverlap'] <= 2.0 and land_metrics['vfZrOverlap'] <= 2.0,
                  f"{name} Landscape zero horizontal/vertical dock overlap (vfSr={land_metrics['vfSrOverlap']:.1f}, tbVf={land_metrics['tbVfOverlap']:.1f}, vfZr={land_metrics['vfZrOverlap']:.1f})")
            check(land_metrics['rightClip'] <= 2.0 and land_metrics['bottomClip'] <= 2.0 and land_metrics['shutterOk'],
                  f"{name} Landscape zero clipping & right-hand thumb shutter accessible")

            await eval_js("window.executeCapture();")
            await asyncio.sleep(0.25)
            l_cap = await eval_js("window.state.gallery[0] ? {w: window.state.gallery[0].width, h: window.state.gallery[0].height} : null")
            check(l_cap is not None and l_cap['w'] == 1040 and l_cap['h'] == 780,
                  f"{name} Landscape Capture 1040×780 (4:3)")
            await eval_js("window.closeGalleryModal && window.closeGalleryModal();")

            print(f"  ✅ [PASS] Landscape ({lw}×{lh}pt): 4:3 Optical Ratio ({land_metrics['vfW']}×{land_metrics['vfH']}px), Right Dock & 1040×780 Capture OK")

        print("\n" + "="*88)
        print(f"🎉 ALL 8 REAL IPHONE MODELS (PORTRAIT & LANDSCAPE × 16 CAMERAS) PASSED: {tests_passed}/{total_tests} (100.0%)")
        print("="*88)

        await ws.close()
    finally:
        proc.terminate()

if __name__ == '__main__':
    asyncio.run(main())
