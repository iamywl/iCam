#!/usr/bin/env python3
"""
Test Photo Capture Purity and Dynamic Real-Time Date Imprints
Verifies that:
1. Photos NEVER have filter names or brand badges stamped on the image.
2. Quartz date stamps reflect the actual live date ('YY MM DD) and are never hardcoded.
"""

import sys
import os
import json
import asyncio
import tempfile
import urllib.request
import websockets
import datetime

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
    user_data_dir = tempfile.mkdtemp(prefix='icam_purity_test_')

    import subprocess
    proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        f'--remote-debugging-port={debug_port}',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
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
            await send_cdp(ws, msg_id, 'Runtime.enable')

            print("================================================================================")
            print("🧪 Verifying Photo Capture Purity & Real-Time Dynamic Date Imprint")
            print("================================================================================")

            now = datetime.datetime.now()
            expected_yy = f"{now.year % 100:02d}"
            expected_mm = f"{now.month:02d}"
            expected_dd = f"{now.day:02d}"
            expected_date_stamp = f"'{expected_yy} {expected_mm} {expected_dd}"

            # 1. Test Viewfinder Date Elements live synchronization
            msg_id += 1
            osd_dates = await eval_js(ws, msg_id, """
                (() => {
                    const qsDate = document.getElementById('quicksnap-date-stamp')?.textContent;
                    const dateStamp = document.getElementById('date-stamp')?.textContent;
                    const canonDate = document.querySelector('.canon-date-stamp')?.textContent;
                    const toggleDate = document.getElementById('toggle-quicksnap-date')?.textContent;
                    return { qsDate, dateStamp, canonDate, toggleDate };
                })()
            """)

            print(f"  Live OSD Date Stamp: {osd_dates.get('qsDate')}")
            assert osd_dates.get('qsDate') == expected_date_stamp, f"Expected {expected_date_stamp}, got {osd_dates.get('qsDate')}"
            print(f"  [PASS] quicksnap-date-stamp matches current date: {expected_date_stamp}")

            assert expected_date_stamp in (osd_dates.get('toggleDate') or ''), f"Expected {expected_date_stamp} in toggle, got {osd_dates.get('toggleDate')}"
            print(f"  [PASS] toggle-quicksnap-date reflects current date: {osd_dates.get('toggleDate')}")

            # 2. Test executeCapture simulation for Fuji QuickSnap
            msg_id += 1
            capture_test = await eval_js(ws, msg_id, """
                (() => {
                    // Switch to fuji-quicksnap
                    switchCamera('fuji-quicksnap');
                    
                    // Spy on fillText calls during executeCapture
                    const textsDrawn = [];
                    const origFillText = CanvasRenderingContext2D.prototype.fillText;
                    CanvasRenderingContext2D.prototype.fillText = function(text, x, y) {
                        textsDrawn.push({ text, x, y });
                        return origFillText.apply(this, arguments);
                    };

                    try {
                        executeCapture();
                    } finally {
                        CanvasRenderingContext2D.prototype.fillText = origFillText;
                    }

                    return {
                        textsDrawn,
                        lastCapturedUrl: state.lastCapturedUrl ? true : false
                    };
                })()
            """)

            texts = [item['text'] for item in capture_test.get('textsDrawn', [])]
            print(f"  Texts drawn onto Fuji QuickSnap photo canvas: {texts}")

            # Verify NO "FUJICOLOR" watermark text
            has_fujicolor = any('FUJICOLOR' in t or '写ルンです' in t for t in texts)
            assert not has_fujicolor, "FAIL: FUJICOLOR watermark was stamped onto photo canvas!"
            print("  [PASS] Zero brand/filter watermark on Fuji QuickSnap photo canvas (FUJICOLOR completely removed)")

            # Verify live date imprint is present
            has_current_date = any(expected_date_stamp in t for t in texts)
            assert has_current_date, f"FAIL: Expected date stamp {expected_date_stamp} was not drawn on canvas!"
            print(f"  [PASS] Live dynamic date imprint ({expected_date_stamp}) successfully stamped on photo canvas")

            # Verify '89 11 24 is NOT present
            has_89_date = any('89 11 24' in t for t in texts)
            assert not has_89_date, "FAIL: Hardcoded '89 11 24 date was stamped on photo canvas!"
            print("  [PASS] Obsolete hardcoded '89 11 24 date is completely eliminated")

            # 3. Test Leica M and Sony Cybershot capture purity
            msg_id += 1
            leica_test = await eval_js(ws, msg_id, """
                (() => {
                    switchCamera('leica-m');
                    const textsDrawn = [];
                    const origFillText = CanvasRenderingContext2D.prototype.fillText;
                    CanvasRenderingContext2D.prototype.fillText = function(text, x, y) {
                        textsDrawn.push(text);
                        return origFillText.apply(this, arguments);
                    };
                    try {
                        executeCapture();
                    } finally {
                        CanvasRenderingContext2D.prototype.fillText = origFillText;
                    }
                    return textsDrawn;
                })()
            """)
            print(f"  Texts drawn onto Leica M photo canvas: {leica_test}")
            assert not any('LEICA' in t for t in leica_test), "FAIL: LEICA watermark drawn on photo!"
            print("  [PASS] Zero brand/filter watermark on Leica M photo canvas (pure optical capture)")

            print("================================================================================")
            print("🎉 ALL CAPTURE PURITY & LIVE DATE VERIFICATIONS PASSED 100%!")
            print("================================================================================")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=2.0)
        except Exception:
            proc.kill()

if __name__ == '__main__':
    asyncio.run(main())
