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
    chrome_path = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    user_data_dir = tempfile.mkdtemp(prefix='icam_bag_shot_')

    proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        '--remote-debugging-port=9455',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1200,960',
        f'http://127.0.0.1:{port}/index.html'
    ])

    await asyncio.sleep(2.0)
    msg_id = 1

    try:
        res = urllib.request.urlopen('http://127.0.0.1:9455/json').read()
        targets = json.loads(res.decode('utf-8'))
        page_target = next((t for t in targets if t.get('type') == 'page'), None)
        if not page_target:
            raise RuntimeError("No page target found")

        ws_url = page_target['webSocketDebuggerUrl']
        async with websockets.connect(ws_url, max_size=20 * 1024 * 1024) as ws:
            msg_id += 1
            await send_cdp(ws, msg_id, 'Page.enable')
            await send_cdp(ws, msg_id + 1, 'Runtime.enable')
            msg_id += 2

            # Wait for loaded
            await asyncio.sleep(1.0)

            # Capture 1: Main screen
            res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            msg_id += 1
            with open('screenshot_main.png', 'wb') as f:
                f.write(base64.b64decode(res['result']['data']))
            print("Captured screenshot_main.png")

            # Open bag modal
            await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': 'document.getElementById("btn-camera-bag").click();'
            })
            msg_id += 1
            await asyncio.sleep(0.8)

            # Capture 2: Bag modal All
            res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            msg_id += 1
            with open('screenshot_bag.png', 'wb') as f:
                f.write(base64.b64decode(res['result']['data']))
            print("Captured screenshot_bag.png")

            # Click Sony brand button
            await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': 'document.querySelector("#bag-brand-filter .bag-brand-btn[data-brand=\'sony\']").click();'
            })
            msg_id += 1
            await asyncio.sleep(0.5)

            # Capture 3: Bag modal Sony
            res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            msg_id += 1
            with open('screenshot_bag_sony.png', 'wb') as f:
                f.write(base64.b64decode(res['result']['data']))
            print("Captured screenshot_bag_sony.png")

            # Click Medium Category
            await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': 'document.querySelector("#bag-category-filter .bag-cat-btn[data-cat=\'medium\']").click();'
            })
            msg_id += 1
            await asyncio.sleep(0.5)

            # Capture 4: Bag modal Medium
            res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            msg_id += 1
            with open('screenshot_bag_medium.png', 'wb') as f:
                f.write(base64.b64decode(res['result']['data']))
            print("Captured screenshot_bag_medium.png")

    finally:
        proc.terminate()
        proc.wait()

if __name__ == '__main__':
    asyncio.run(main())
