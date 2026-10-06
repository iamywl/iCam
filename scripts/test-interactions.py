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
    chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
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

    await asyncio.sleep(2.0)
    msg_id = 1

    try:
        res = urllib.request.urlopen('http://127.0.0.1:9444/json').read()
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
                    for (const c of expectedCams) {
                        const cam = CAMERAS[c];
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
                        currentCam: state ? state.activeCamera : null,
                        galleryCount: state && state.gallery ? state.gallery.length : 0
                    };
                })()''',
                'returnByValue': True
            })
            print("System sanity check:", eval_res['result']['result']['value'])

            # Test 1: Click Shutter Button
            print("Testing Shutter Click...")
            msg_id += 2
            shutter_res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': '''(function() {
                    const sb = document.getElementById('shutter-btn');
                    sb.click();
                    return {
                        galleryLength: state.gallery.length,
                        lastRecord: state.gallery[0] ? {
                            camera: state.gallery[0].cameraName,
                            hasDataUrl: !!state.gallery[0].dataUrl,
                            hasExif: !!state.gallery[0].exif
                        } : null
                    };
                })()''',
                'returnByValue': True
            })
            print("Shutter click result:", shutter_res['result']['result']['value'])

            # Test 2: Mode Dial switching to each camera
            print("Testing Mode Dial / Camera Switcher...")
            for cam_id in ['fuji-quicksnap', 'kyocera-samurai', 'sony-handycam']:
                msg_id += 1
                switch_res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                    'expression': f'''(function() {{
                        switchCamera('{cam_id}');
                        const activeDrawer = document.querySelector('.mode-control-panel.active');
                        return {{
                            activeCam: state.activeCamera,
                            activeDrawerId: activeDrawer ? activeDrawer.id : null,
                            badgeTitle: document.getElementById('cam-badge-title')?.textContent
                        }};
                    }})()''',
                    'returnByValue': True
                })
                print(f"Switched to {cam_id}:", switch_res['result']['result']['value'])

    finally:
        proc.terminate()
        print("Done.")

if __name__ == '__main__':
    asyncio.run(main())
