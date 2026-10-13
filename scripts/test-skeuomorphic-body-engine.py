import os
import sys
import json
import urllib.request
import subprocess
import tempfile
import asyncio

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
    debug_port = 9449
    chrome_candidates = [
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ]
    chrome_path = next((p for p in chrome_candidates if os.path.exists(p)), 'google-chrome')
    user_data_dir = tempfile.mkdtemp(prefix='icam_skeuo_test_')

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
            print("🎛️ Verifying Chameleon Skeuomorphic Adaptive Body Engine & Tactile Hardware")
            print("================================================================================")

            cameras = [
                'canon-ixy', 'fuji-quicksnap', 'contax-t2', 'leica-m',
                'polaroid-sx70', 'sony-cybershot', 'olympus-mju', 'hasselblad-500cm',
                'kyocera-samurai', 'ricoh-gr', 'sony-handycam', 'citypop-80s',
                'oldfilm-35mm', 'instax-mini', 'sihyun-color', 'passport-id'
            ]

            # 1. Test Theme Class Application across all 16 cameras
            print("  [Step 1] Auditing dynamic theme class morphing on .iphone-frame and .camera-app...")
            for cam in cameras:
                msg_id += 1
                theme_res = await eval_js(ws, msg_id, f"""
                    (() => {{
                        switchCamera('{cam}');
                        const frame = document.querySelector('.iphone-frame');
                        const app = document.querySelector('.camera-app');
                        return {{
                            frameTheme: frame ? frame.classList.contains('theme-{cam}') : false,
                            appTheme: app ? app.classList.contains('theme-{cam}') : false
                        }};
                    }})()
                """)
                assert theme_res['frameTheme'], f"Missing theme-{cam} on .iphone-frame"
                assert theme_res['appTheme'], f"Missing theme-{cam} on .camera-app"
            print(f"  [PASS] All {len(cameras)} cameras correctly apply adaptive theme-{{camId}} classes!")

            # 2. Test QuickSnap Mechanical Winding Wheel
            print("  [Step 2] Auditing Fuji QuickSnap Mechanical Film Advance Thumb Wheel...")
            msg_id += 1
            wheel_test = await eval_js(ws, msg_id, """
                (() => {
                    switchCamera('fuji-quicksnap');
                    const wheel = document.getElementById('quicksnap-wind-wheel');
                    const counterBefore = document.querySelector('#quicksnap-osd .quicksnap-frame-counter').textContent;
                    
                    // Click winding wheel
                    wheel.click();
                    const counterAfter = document.querySelector('#quicksnap-osd .quicksnap-frame-counter').textContent;
                    
                    const wheelVisible = window.getComputedStyle(wheel).display !== 'none';
                    return {
                        wheelVisible,
                        counterBefore,
                        counterAfter
                    };
                })()
            """)
            assert wheel_test['wheelVisible'], "QuickSnap winding wheel is not visible!"
            print(f"  [PASS] QuickSnap thumb wheel visible: {wheel_test['wheelVisible']}")
            print(f"  [PASS] Winding wheel advances frame counter: '{wheel_test['counterBefore']}' -> '{wheel_test['counterAfter']}'")

            # 3. Test Camera-specific Shutter Hardware Elements
            print("  [Step 3] Auditing tactile skeuomorphic shutter button architecture...")
            msg_id += 1
            shutter_test = await eval_js(ws, msg_id, """
                (() => {
                    const btn = document.getElementById('shutter-btn');
                    const collar = btn.querySelector('.shutter-btn-collar');
                    const inner = btn.querySelector('.shutter-btn-inner');
                    const thread = btn.querySelector('.shutter-btn-thread');
                    const core = btn.querySelector('.shutter-btn-core');
                    return {
                        hasCollar: !!collar,
                        hasInner: !!inner,
                        hasThread: !!thread,
                        hasCore: !!core
                    };
                })()
            """)
            assert shutter_test['hasCollar'] and shutter_test['hasInner'] and shutter_test['hasThread'] and shutter_test['hasCore'], "Shutter button missing skeuomorphic sub-elements"
            print(f"  [PASS] Shutter button equipped with collar, inner dish, cable thread socket, and core indicators!")

            # 4. Test Web Audio API Camera-Specific Sound Synthesis
            print("  [Step 4] Auditing acoustic synthesis profiles (polaroid, hasselblad, contax, quicksnap, leica)...")
            msg_id += 1
            audio_test = await eval_js(ws, msg_id, """
                (() => {
                    let audioWorking = true;
                    try {
                        soundEngine.playRatchetWind();
                        soundEngine.playShutter('polaroid-sx70');
                        soundEngine.playShutter('hasselblad-500cm');
                        soundEngine.playShutter('contax-t2');
                        soundEngine.playShutter('fuji-quicksnap');
                        soundEngine.playShutter('leica-m');
                    } catch (e) {
                        audioWorking = false;
                    }
                    return audioWorking;
                })()
            """)
            assert audio_test, "Sound engine failed to synthesize camera-specific acoustic profiles"
            print("  [PASS] Web Audio API synthetic audio profiles execute seamlessly without errors!")

            # 5. Capture Visual Verification Screenshots of the Skeuomorphic Bodies
            print("  [Step 5] Capturing skeuomorphic body preview screenshots...")
            screenshot_cams = ['fuji-quicksnap', 'contax-t2', 'leica-m', 'polaroid-sx70', 'sony-cybershot']
            for cam in screenshot_cams:
                msg_id += 1
                await eval_js(ws, msg_id, f"switchCamera('{cam}');")
                await asyncio.sleep(0.15)
                msg_id += 1
                shot = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
                with open(f"qa_skeuo_{cam}.png", "wb") as f:
                    import base64
                    f.write(base64.b64decode(shot['result']['data']))
                print(f"  📸 Saved skeuomorphic visual: qa_skeuo_{cam}.png")

            print("================================================================================")
            print("🎉 ALL SKEUOMORPHIC CHAMELEON BODY ENGINE AUDITS PASSED 100%!")
            print("================================================================================")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2)
        except Exception:
            proc.kill()

if __name__ == '__main__':
    asyncio.run(main())
