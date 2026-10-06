import os
import sys
import time
import json
import base64
import urllib.request
import subprocess
import tempfile
import asyncio

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
    user_data_dir = tempfile.mkdtemp(prefix='icam_view_')

    print(f"Launching Chrome: {chrome_path}")
    proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        '--remote-debugging-port=9333',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1920,1080',
        f'http://127.0.0.1:{port}/index.html'
    ])

    await asyncio.sleep(2.0)
    msg_id = 1

    try:
        res = urllib.request.urlopen('http://127.0.0.1:9333/json').read()
        targets = json.loads(res.decode('utf-8'))
        page_target = next((t for t in targets if t.get('type') == 'page'), None)
        if not page_target:
            raise RuntimeError("No page target found")

        ws_url = page_target['webSocketDebuggerUrl']
        async with websockets.connect(ws_url, max_size=20 * 1024 * 1024) as ws:
            msg_id += 1
            await send_cdp(ws, msg_id, 'Page.enable')

            # Wait for images/styles to settle
            await asyncio.sleep(1.5)

            # 1. Desktop Screenshot 1920x1080
            print("Capturing desktop view (1920x1080)...")
            msg_id += 1
            await send_cdp(ws, msg_id, 'Emulation.setDeviceMetricsOverride', {
                'width': 1920,
                'height': 1080,
                'deviceScaleFactor': 1,
                'mobile': False
            })
            await asyncio.sleep(0.5)

            msg_id += 1
            shot_res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            data = shot_res['result']['data']
            with open('desktop_view.png', 'wb') as f:
                f.write(base64.b64decode(data))
            print("desktop_view.png captured successfully!")

            # 2. Mobile Screenshot 430x932
            print("Capturing mobile view (430x932)...")
            msg_id += 1
            await send_cdp(ws, msg_id, 'Emulation.setDeviceMetricsOverride', {
                'width': 430,
                'height': 932,
                'deviceScaleFactor': 1,
                'mobile': True
            })
            await asyncio.sleep(0.5)

            msg_id += 1
            shot_res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            data = shot_res['result']['data']
            with open('mobile_view.png', 'wb') as f:
                f.write(base64.b64decode(data))
            print("mobile_view.png captured successfully!")

            # 3. QuickTake Video Recording Active State
            print("Capturing QuickTake video recording active state...")
            msg_id += 1
            await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': '''(function() {
                    startQuickTakeVideoRecording();
                    const vfTime = document.getElementById('vf-rec-time');
                    const extra = document.getElementById('island-extra');
                    if (vfTime) vfTime.textContent = '00:03';
                    if (extra) extra.textContent = '00:03';
                })()'''
            })
            await asyncio.sleep(0.5)
            msg_id += 1
            shot_res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            data = shot_res['result']['data']
            with open('docs/screenshots/feature_quicktake_recording.png', 'wb') as f:
                f.write(base64.b64decode(data))
            print("feature_quicktake_recording.png captured successfully!")

            # Stop QuickTake recording
            msg_id += 1
            await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': 'stopQuickTakeVideoRecording();'
            })
            await asyncio.sleep(0.3)

            # 4. Fuji QuickSnap (1986 Japanese Bubble Disposable Camera)
            print("Capturing Fuji QuickSnap 1986...")
            msg_id += 1
            await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': "switchCamera('fuji-quicksnap');"
            })
            await asyncio.sleep(0.4)
            msg_id += 1
            shot_res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            data = shot_res['result']['data']
            with open('docs/screenshots/camera_fuji_quicksnap.png', 'wb') as f:
                f.write(base64.b64decode(data))
            print("camera_fuji_quicksnap.png captured successfully!")

            # 5. Kyocera Samurai X3.0 (1988 Japanese Cyber Half-Frame SLR)
            print("Capturing Kyocera Samurai X3.0 1988...")
            msg_id += 1
            await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': "switchCamera('kyocera-samurai');"
            })
            await asyncio.sleep(0.4)
            msg_id += 1
            shot_res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            data = shot_res['result']['data']
            with open('docs/screenshots/camera_kyocera_samurai.png', 'wb') as f:
                f.write(base64.b64decode(data))
            print("camera_kyocera_samurai.png captured successfully!")

            # 6. 6-Blade Sunstar Optical Lens Filter (AI/Optical Shader)
            print("Capturing 6-Blade Sunstar Aperture Filter...")
            msg_id += 1
            await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': "switchCamera('canon-ixy'); applyLensFilter('star6');"
            })
            await asyncio.sleep(0.4)
            msg_id += 1
            shot_res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            data = shot_res['result']['data']
            with open('docs/screenshots/feature_sunstar_6blade.png', 'wb') as f:
                f.write(base64.b64decode(data))
            print("feature_sunstar_6blade.png captured successfully!")

            # 7. Visual Camera Bag / Rack Drawer Modal (16 Iconic Bodies)
            print("Capturing Visual Camera Bag Modal...")
            msg_id += 1
            await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': "openCameraBagModal();"
            })
            await asyncio.sleep(0.5)
            msg_id += 1
            shot_res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            data = shot_res['result']['data']
            with open('docs/screenshots/feature_camera_bag_modal.png', 'wb') as f:
                f.write(base64.b64decode(data))
            print("feature_camera_bag_modal.png captured successfully!")

    finally:
        proc.terminate()
        print("Chrome terminated.")

if __name__ == '__main__':
    asyncio.run(main())
