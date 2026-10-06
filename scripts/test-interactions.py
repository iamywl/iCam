import os
import sys
import json
import base64
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

async def main():
    import websockets
    port = 8080
    chrome_candidates = [
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ]
    chrome_path = next((p for p in chrome_candidates if os.path.exists(p)), 'google-chrome')
    user_data_dir = tempfile.mkdtemp(prefix='icam_test_')

    proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        '--remote-debugging-port=9444',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1920,1080',
        f'http://127.0.0.1:{port}/index.html'
    ])

    targets = None
    for _ in range(15):
        try:
            res = urllib.request.urlopen('http://127.0.0.1:9444/json', timeout=1).read()
            targets = json.loads(res.decode('utf-8'))
            break
        except Exception:
            await asyncio.sleep(0.5)

    msg_id = 1

    try:
        if not targets:
            raise RuntimeError("Could not connect to Chrome debugging port 9444")
        page_target = next((t for t in targets if t.get('type') == 'page'), None)
        if not page_target:
            raise RuntimeError("No page target found")

        ws_url = page_target['webSocketDebuggerUrl']
        async with websockets.connect(ws_url, max_size=20 * 1024 * 1024) as ws:
            msg_id += 1
            await send_cdp(ws, msg_id, 'Log.enable')
            msg_id += 1
            await send_cdp(ws, msg_id, 'Runtime.enable')

            await asyncio.sleep(1.0)

            # Check for console errors
            eval_res = await send_cdp(ws, msg_id + 1, 'Runtime.evaluate', {
                'expression': '''(function() {
                    const errors = [];
                    if (typeof state === 'undefined') errors.push("state is undefined");
                    if (typeof CAMERAS === 'undefined') errors.push("CAMERAS is undefined");
                    if (typeof switchCamera !== 'function') errors.push("switchCamera is not a function");
                    if (typeof executeCapture !== 'function') errors.push("executeCapture is not a function");

                    const expectedCams = [
                        'canon-ixy', 'sony-handycam', 'sony-cybershot', 'olympus-mju',
                        'contax-t2', 'ricoh-gr', 'leica-m', 'citypop-80s',
                        'oldfilm-35mm', 'instax-mini', 'sihyun-color', 'passport-id',
                        'hasselblad-500cm', 'polaroid-sx70', 'fuji-quicksnap', 'kyocera-samurai'
                    ];
                    const camsObj = window.CAMERAS || (typeof CAMERAS !== 'undefined' ? CAMERAS : {});
                    const st = window.state || (typeof state !== 'undefined' ? state : {});
                    for (const c of expectedCams) {
                        const cam = camsObj[c];
                        if (!cam) {
                            errors.push("Missing camera config: " + c);
                            continue;
                        }
                        const dId = cam.drawerId;
                        if (!document.getElementById(dId)) errors.push("Missing drawer DOM: " + dId);
                    }

                    const sb = document.getElementById('shutter-btn');
                    if (!sb) errors.push("shutter-btn DOM element missing");

                    return {
                        errors: errors,
                        currentCam: st ? st.activeCamera : null,
                        galleryCount: st && st.gallery ? st.gallery.length : 0
                    };
                })()''',
            })
            val = eval_res.get('result', {}).get('result', {}).get('value')
            if val is None:
                print("eval_res:", eval_res)
            else:
                print("System sanity check:", val)

            # Test 1: Click Shutter Button
            print("Testing Shutter Click...")
            msg_id += 2
            shutter_res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': '''(function() {
                    const sb = document.getElementById('shutter-btn');
                    sb.click();
                    const st = window.state || (typeof state !== 'undefined' ? state : {});
                    return {
                        galleryLength: st && st.gallery ? st.gallery.length : 0,
                        lastRecord: st && st.gallery && st.gallery[0] ? {
                            camera: st.gallery[0].cameraName,
                            hasDataUrl: !!st.gallery[0].dataUrl,
                            hasExif: !!st.gallery[0].exif
                        } : null
                    };
                })()''',
                'returnByValue': True
            })
            shutter_val = shutter_res.get('result', {}).get('result', {}).get('value')
            print("Shutter click result:", shutter_val)

            # Test 2: Mode Dial switching to each camera
            print("Testing Mode Dial / Camera Switcher...")
            for cam_id in ['fuji-quicksnap', 'kyocera-samurai', 'sony-handycam']:
                msg_id += 1
                switch_res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                    'expression': f'''(function() {{
                        const sc = window.switchCamera || switchCamera;
                        sc('{cam_id}');
                        const activeDrawer = document.querySelector('.mode-control-panel.active');
                        const st = window.state || (typeof state !== 'undefined' ? state : {{}});
                        return {{
                            activeCam: st ? st.activeCamera : null,
                            activeDrawerId: activeDrawer ? activeDrawer.id : null,
                            badgeTitle: document.getElementById('cam-badge-title')?.textContent
                        }};
                    }})()''',
                    'returnByValue': True
                })
                switch_val = switch_res.get('result', {}).get('result', {}).get('value')
                print(f"Switched to {cam_id}:", switch_val)

    finally:
        proc.terminate()
        print("Done.")

if __name__ == '__main__':
    asyncio.run(main())
