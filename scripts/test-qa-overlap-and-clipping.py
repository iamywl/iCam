import os
import sys
import json
import urllib.request
import subprocess
import tempfile
import asyncio
import base64

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

async def send_cdp(ws, msg_id, method, params=None):
    payload = {'id': msg_id, 'method': method}
    if params:
        payload['params'] = params
    await ws.send(json.dumps(payload))
    while True:
        resp = await ws.recv()
        data = json.loads(resp)
        if data.get('id') == msg_id:
            return data

async def eval_js(ws, msg_id, expr):
    resp = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
        'expression': expr,
        'returnByValue': True,
        'awaitPromise': True
    })
    result = resp.get('result', {}).get('result', {})
    if 'value' in result:
        return result['value']
    return result

async def main():
    import websockets
    port = 8080
    debug_port = 9448
    chrome_candidates = [
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ]
    chrome_path = next((p for p in chrome_candidates if os.path.exists(p)), 'google-chrome')
    user_data_dir = tempfile.mkdtemp(prefix='icam_qa_test_')

    proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        f'--remote-debugging-port={debug_port}',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1920,1080',
        f'http://127.0.0.1:{port}/index.html'
    ])

    await asyncio.sleep(2.0)
    msg_id = 1

    try:
        res = urllib.request.urlopen(f'http://127.0.0.1:{debug_port}/json').read()
        targets = json.loads(res.decode('utf-8'))
        page_target = next((t for t in targets if t.get('type') == 'page'), None)
        if not page_target:
            raise RuntimeError("No page target found")

        ws_url = page_target['webSocketDebuggerUrl']
        async with websockets.connect(ws_url, max_size=20 * 1024 * 1024) as ws:
            msg_id += 1
            await send_cdp(ws, msg_id, 'Log.enable')
            msg_id += 1
            await send_cdp(ws, msg_id, 'Runtime.enable')

            print("================================================================================")
            print("🚀 SnapStudio Autonomous QA Suite: Zero-Overlap & Zero-Clipping Verification")
            print("================================================================================")

            devices = [
                {'name': 'iPhone SE (375x667)', 'dev': 'se', 'w': 375, 'h': 667, 'r': 20},
                {'name': 'iPhone 13 mini (375x812)', 'dev': 'mini', 'w': 375, 'h': 812, 'r': 44},
                {'name': 'iPhone 15/16 Pro (393x852)', 'dev': 'standard', 'w': 393, 'h': 852, 'r': 54},
                {'name': 'iPhone 16 Pro Max (430x932)', 'dev': 'max', 'w': 430, 'h': 932, 'r': 55}
            ]

            cameras = [
                'canon-ixy', 'sony-handycam', 'sony-cybershot', 'instax-mini',
                'olympus-mju', 'contax-t2', 'ricoh-gr', 'leica-m',
                'citypop-80s', 'oldfilm-35mm', 'sihyun-color', 'passport-id',
                'hasselblad-500cm', 'polaroid-sx70', 'fuji-quicksnap', 'kyocera-samurai'
            ]

            all_passed = True
            total_checks = 0
            passed_checks = 0

            for device in devices:
                print(f"\n📱 Testing Viewport Tier: {device['name']}")
                msg_id += 1
                await eval_js(ws, msg_id, f"""
                    (() => {{
                        const wrapper = document.querySelector('.device-wrapper');
                        wrapper.classList.remove('device-se', 'device-mini', 'device-standard', 'device-max');
                        wrapper.classList.add('device-{device['dev']}');
                        wrapper.style.setProperty('--device-width', '{device['w']}px');
                        wrapper.style.setProperty('--device-height', '{device['h']}px');
                        wrapper.style.setProperty('--device-radius', '{device['r']}px');
                    }})()
                """)
                await asyncio.sleep(0.3)

                # Check general layout metrics
                msg_id += 1
                layout_check = await eval_js(ws, msg_id, """
                    (() => {
                        const vf = document.querySelector('.viewfinder-container').getBoundingClientRect();
                        const tb = document.querySelector('.camera-top-toolbar').getBoundingClientRect();
                        const badge = document.querySelector('.camera-model-badge-container').getBoundingClientRect();
                        const drawer = document.querySelector('.control-drawer').getBoundingClientRect();
                        const bottom = document.querySelector('.camera-bottom-section').getBoundingClientRect();
                        const catBar = document.querySelector('.camera-category-bar').getBoundingClientRect();
                        const modeDial = document.querySelector('.mode-dial-wrapper').getBoundingClientRect();

                        return {
                            vf_width: vf.width,
                            vf_height: vf.height,
                            vf_ratio: vf.width / vf.height,
                            tb_badge_gap: badge.top - tb.bottom,
                            vf_bottom: vf.bottom,
                            drawer_top: drawer.top,
                            drawer_bottom: drawer.bottom,
                            bottom_top: bottom.top,
                            catBar_bottom: catBar.bottom,
                            modeDial_top: modeDial.top,
                            drawer_vf_gap: drawer.top - vf.bottom,
                            bottom_drawer_gap: bottom.top - drawer.bottom,
                            dial_cat_gap: modeDial.top - catBar.bottom
                        };
                    })()
                """)

                # Audit 1: Viewfinder must maintain strict 3:4 photographic aspect ratio (0.7500)
                total_checks += 1
                vf_ratio = layout_check['vf_ratio']
                if abs(vf_ratio - 0.75) <= 0.02:
                    passed_checks += 1
                    print(f"  [PASS] Viewfinder 3:4 Photographic Ratio: {vf_ratio:.4f} (target: 0.7500 ± 0.02, {layout_check['vf_width']:.0f}x{layout_check['vf_height']:.0f})")
                else:
                    all_passed = False
                    print(f"  [FAIL] Viewfinder aspect ratio is distorted! Ratio: {vf_ratio:.4f} (target: 0.7500)")

                # Audit 2: Top Toolbar must not collide with Camera Model Badge
                total_checks += 1
                tb_badge_gap = layout_check['tb_badge_gap']
                if tb_badge_gap >= 1.5:
                    passed_checks += 1
                    print(f"  [PASS] Top Toolbar to Badge gap: {tb_badge_gap:.1f}px (>= 1.5px)")
                else:
                    all_passed = False
                    print(f"  [FAIL] Top Toolbar collides with Camera Badge! Gap: {tb_badge_gap:.1f}px")

                # Audit 3: Drawer must be BELOW viewfinder
                total_checks += 1
                drawer_vf_gap = layout_check['drawer_vf_gap']
                if drawer_vf_gap >= 2:
                    passed_checks += 1
                    print(f"  [PASS] Viewfinder to Drawer gap: {drawer_vf_gap:.1f}px (>= 2px)")
                else:
                    all_passed = False
                    print(f"  [FAIL] Viewfinder overlaps Drawer! Gap: {drawer_vf_gap:.1f}px")

                # Audit 4: Bottom Section must be BELOW drawer
                total_checks += 1
                bottom_drawer_gap = layout_check['bottom_drawer_gap']
                if bottom_drawer_gap >= 2:
                    passed_checks += 1
                    print(f"  [PASS] Drawer to Bottom Section gap: {bottom_drawer_gap:.1f}px (>= 2px)")
                else:
                    all_passed = False
                    print(f"  [FAIL] Drawer overlaps Bottom Section! Gap: {bottom_drawer_gap:.1f}px")

                # Audit 5: Mode dial must not collide with category bar
                total_checks += 1
                dial_cat_gap = layout_check['dial_cat_gap']
                if dial_cat_gap >= 0:
                    passed_checks += 1
                    print(f"  [PASS] Category Bar to Mode Dial gap: {dial_cat_gap:.1f}px (>= 0px)")
                else:
                    all_passed = False
                    print(f"  [FAIL] Category Bar collides with Mode Dial! Gap: {dial_cat_gap:.1f}px")

                # Audit 4: Test each camera for HUD Badge vs OSD overlap & Drawer clipping
                print(f"  🔍 Auditing 16 Camera Panels for HUD Clearance & Zero Clipping...")
                for cam_id in cameras:
                    msg_id += 1
                    await eval_js(ws, msg_id, f"switchCamera('{cam_id}');")
                    await asyncio.sleep(0.08)

                    msg_id += 1
                    cam_check = await eval_js(ws, msg_id, f"""
                        (() => {{
                            const badge = document.querySelector('.camera-model-badge-container').getBoundingClientRect();
                            const drawer = document.querySelector('.control-drawer');
                            const drawerRect = drawer.getBoundingClientRect();
                            const activePanel = document.querySelector('.mode-control-panel.active');

                            // Find active OSD top elements
                            const osdSelectors = [
                                '.olympus-top-row', '.canon-top-row', '.sony-cs-top',
                                '.cam-top-row', '.contax-led-bar', '.ricoh-top-row',
                                '.leica-top-row', '.citypop-top-banner', '.sihyun-top-banner',
                                '.hasselblad-top-bar', '.sx70-top-bar', '.quicksnap-top-bar',
                                '.samurai-top-row'
                            ];

                            let topOsdRect = null;
                            for (const sel of osdSelectors) {{
                                const el = document.querySelector(sel);
                                if (el && window.getComputedStyle(el).display !== 'none' && el.offsetParent !== null) {{
                                    topOsdRect = el.getBoundingClientRect();
                                    break;
                                }}
                            }}

                            // Check clipping of vintage toggles inside active panel
                            const toggles = activePanel ? activePanel.querySelector('.vintage-toggles') : null;
                            let togglesClipped = false;
                            let togglesBottom = null;
                            if (toggles) {{
                                const tRect = toggles.getBoundingClientRect();
                                togglesBottom = tRect.bottom;
                                // If toggles bottom exceeds drawer bottom by more than 2px, it is clipped
                                if (tRect.bottom > drawerRect.bottom + 2) {{
                                    togglesClipped = true;
                                }}
                            }}

                            return {{
                                badge_bottom: badge.bottom,
                                osd_top: topOsdRect ? topOsdRect.top : null,
                                osd_badge_gap: topOsdRect ? (topOsdRect.top - badge.bottom) : null,
                                togglesClipped: togglesClipped,
                                drawer_bottom: drawerRect.bottom,
                                toggles_bottom: togglesBottom
                            }};
                        }})()
                    """)

                    total_checks += 1
                    osd_gap = cam_check['osd_badge_gap']
                    if osd_gap is not None:
                        if osd_gap >= 2:
                            passed_checks += 1
                        else:
                            all_passed = False
                            print(f"    [FAIL] Camera {cam_id}: HUD Badge collides with OSD top row! Gap: {osd_gap:.1f}px")
                    else:
                        passed_checks += 1

                    total_checks += 1
                    if not cam_check['togglesClipped']:
                        passed_checks += 1
                    else:
                        all_passed = False
                        print(f"    [FAIL] Camera {cam_id}: Vintage toggles clipped at bottom of drawer! (Toggles bottom: {cam_check['toggles_bottom']:.1f}, Drawer bottom: {cam_check['drawer_bottom']:.1f})")

                # Take screenshot for this device tier
                msg_id += 1
                ss_resp = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
                ss_data = ss_resp.get('result', {}).get('data', '')
                if ss_data:
                    out_filename = f"qa_viewport_{device['dev']}.png"
                    with open(out_filename, 'wb') as f:
                        f.write(base64.b64decode(ss_data))
                    print(f"  📸 Saved screenshot: {out_filename}")

            print("\n================================================================================")
            print(f"🏁 QA Audit Results: {passed_checks}/{total_checks} checks passed ({passed_checks/total_checks*100:.1f}%)")
            print("================================================================================")

            if all_passed:
                print("🎉 PERFECT SCORE: ZERO OVERLAP AND ZERO CLIPPING ACROSS ALL 16 CAMERAS AND 4 IPHONE TIERS!")
                sys.exit(0)
            else:
                print("❌ SOME CHECKS FAILED! Review the audit log above.")
                sys.exit(1)

    finally:
        try:
            proc.terminate()
            proc.wait(timeout=3)
        except Exception:
            pass

if __name__ == '__main__':
    asyncio.run(main())
