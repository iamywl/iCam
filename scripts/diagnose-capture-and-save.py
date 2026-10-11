import os
import sys
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

async def diagnose_viewport(port, width, height, tier_name):
    import websockets
    chrome_candidates = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ]
    chrome_path = next((p for p in chrome_candidates if os.path.exists(p)), 'google-chrome')
    user_data_dir = tempfile.mkdtemp(prefix=f'icam_diag_{tier_name}_')

    proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        '--remote-debugging-port=9455',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
        f'--window-size={width},{height}',
        f'http://127.0.0.1:{port}/index.html'
    ])

    await asyncio.sleep(1.5)

    targets = None
    for _ in range(20):
        try:
            res = urllib.request.urlopen('http://127.0.0.1:9455/json', timeout=1).read()
            targets = json.loads(res.decode('utf-8'))
            break
        except Exception:
            await asyncio.sleep(0.5)

    if not targets:
        proc.terminate()
        raise RuntimeError("Could not connect to Chrome debugging port 9455")

    page_target = next((t for t in targets if t.get('type') == 'page'), None)
    ws_url = page_target['webSocketDebuggerUrl']

    async with websockets.connect(ws_url, max_size=20 * 1024 * 1024) as ws:
        msg_id = 1
        await send_cdp(ws, msg_id, 'Runtime.enable')
        msg_id += 1
        await send_cdp(ws, msg_id, 'Emulation.setDeviceMetricsOverride', {
            'width': width,
            'height': height,
            'deviceScaleFactor': 2,
            'mobile': True
        })

        await asyncio.sleep(1.0)

        # 1. Take initial screenshot
        msg_id += 1
        shot1 = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
        with open(f'diag_{tier_name}_1_initial.png', 'wb') as f:
            f.write(base64.b64decode(shot1['result']['data']))

        # 2. Click shutter button
        msg_id += 1
        click_res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
            'expression': '''(function() {
                const btn = document.getElementById('shutter-btn');
                if (!btn) return "NO_SHUTTER";
                btn.click();
                return "CLICKED";
            })()'''
        })
        val = click_res.get('result', {}).get('result', {}).get('value')
        print(f"[{tier_name}] Shutter click: {val}")

        # 3. Wait 150ms (during flash / capture)
        await asyncio.sleep(0.15)
        msg_id += 1
        shot2 = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
        with open(f'diag_{tier_name}_2_flash.png', 'wb') as f:
            f.write(base64.b64decode(shot2['result']['data']))

        # 4. Wait 600ms (after capture and gallery modal open)
        await asyncio.sleep(0.6)
        msg_id += 1
        shot3 = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
        with open(f'diag_{tier_name}_3_modal.png', 'wb') as f:
            f.write(base64.b64decode(shot3['result']['data']))

        # 5. Check DOM layout of modal and buttons
        msg_id += 1
        layout_res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
            'returnByValue': True,
            'expression': '''(function() {
                const modal = document.getElementById('gallery-modal');
                const dialog = document.querySelector('.gallery-modal-dialog');
                const footer = dialog ? dialog.querySelector('.modal-footer') : null;
                const dlBtn = document.getElementById('btn-gallery-download');
                const closeBtn = document.getElementById('btn-close-gallery-modal');
                const previewImg = document.getElementById('gallery-large-img');
                const filmStrip = document.getElementById('gallery-film-strip');

                const winH = window.innerHeight;
                const winW = window.innerWidth;

                function getBox(el) {
                    if (!el) return null;
                    const r = el.getBoundingClientRect();
                    return {
                        top: r.top, bottom: r.bottom, left: r.left, right: r.right,
                        width: r.width, height: r.height,
                        visible: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < winH
                    };
                }

                return {
                    window: { width: winW, height: winH },
                    modalOpen: modal ? modal.classList.contains('open') : false,
                    modalBox: getBox(modal),
                    dialogBox: getBox(dialog),
                    footerBox: getBox(footer),
                    dlBtnBox: getBox(dlBtn),
                    closeBtnBox: getBox(closeBtn),
                    previewImgBox: getBox(previewImg),
                    galleryLength: window.state ? window.state.gallery.length : -1,
                    footerVisible: footer ? (footer.getBoundingClientRect().bottom <= winH && footer.getBoundingClientRect().top >= 0) : false,
                    dlBtnVisible: dlBtn ? (dlBtn.getBoundingClientRect().bottom <= winH && dlBtn.getBoundingClientRect().top >= 0) : false
                };
            })()'''
        })
        layout_val = layout_res.get('result', {}).get('result', {}).get('value')
        print(f"[{tier_name}] Layout Audit:", json.dumps(layout_val, indent=2))

    proc.terminate()

async def main():
    port = 8080
    print("--- Diagnosing iPhone 16 Pro (393x852) ---")
    await diagnose_viewport(port, 393, 852, "iphone_pro")
    print("\n--- Diagnosing iPhone SE (375x667) ---")
    await diagnose_viewport(port, 375, 667, "iphone_se")

if __name__ == '__main__':
    asyncio.run(main())
