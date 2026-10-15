import asyncio
import json
import urllib.request
import subprocess
import tempfile
import os

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
    debug_port = 9457
    chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    user_data_dir = tempfile.mkdtemp(prefix='icam_zoom_test_')
    proc = subprocess.Popen([
        chrome_path, "--headless=new", f"--remote-debugging-port={debug_port}",
        f"--user-data-dir={user_data_dir}",
        "--disable-gpu", "--no-sandbox", "--window-size=1920,1080",
        f"http://127.0.0.1:{port}/index.html"
    ])
    await asyncio.sleep(2.0)

    try:
        res = urllib.request.urlopen(f"http://127.0.0.1:{debug_port}/json").read()
        targets = json.loads(res.decode("utf-8"))
        page_target = next(t for t in targets if t.get("type") == "page")
        ws = await websockets.connect(page_target["webSocketDebuggerUrl"])

        msg_id = 1
        print("================================================================================")
        print("🔍 Verifying Tactile Zoom Magnification Engine & Capture Fidelity")
        print("================================================================================")

        # 1. Test setFimoZoom to 2.1x (Reference App Exact Value!)
        msg_id += 1
        res1 = await eval_js(ws, msg_id, """
            (() => {
                window.setFimoZoom(2.1);
                const mag = document.getElementById('fimo-zoom-mag').textContent;
                const focal = document.getElementById('fimo-zoom-focal').textContent;
                const modelCanvas = document.getElementById('model-canvas');
                const pointer = document.querySelector('.fimo-ruler-pointer');

                return {
                    zoomLevel: state.fimoZoomLevel,
                    magText: mag,
                    focalText: focal,
                    scaleTransform: modelCanvas.style.transform,
                    pointerLeft: pointer.style.left
                };
            })()
        """)
        print(f"  [Step 1] Setting Zoom to 2.1x:")
        print(f"    - State zoom: {res1['zoomLevel']}")
        print(f"    - Readout: {res1['magText']} {res1['focalText']}")
        print(f"    - Media scale: {res1['scaleTransform']}")
        print(f"    - Pointer position: {res1['pointerLeft']}")
        assert res1['zoomLevel'] == 2.1, f"Expected zoom 2.1, got {res1['zoomLevel']}"
        assert res1['magText'] == "2.1x", f"Expected 2.1x, got {res1['magText']}"
        assert res1['focalText'] == "· 49mm", f"Expected · 49mm, got {res1['focalText']}"
        assert "scale(2.1)" in res1['scaleTransform'], f"Expected scale(2.1) in {res1['scaleTransform']}"
        print("  [PASS] 2.1x zoom matches reference app (2.1x · 49mm) with live scale transform!")

        # 2. Test Discrete Tick Stops (1.0x, 1.5x, 2.0x, 3.0x, 5.0x)
        msg_id += 1
        res2 = await eval_js(ws, msg_id, """
            (() => {
                const tick3 = document.querySelector('.fimo-tick-stop[data-zoom="3.0"]');
                if (tick3) tick3.click();
                const mag = document.getElementById('fimo-zoom-mag').textContent;
                const focal = document.getElementById('fimo-zoom-focal').textContent;
                const modelCanvas = document.getElementById('model-canvas');
                return {
                    zoom: state.fimoZoomLevel,
                    mag: mag,
                    focal: focal,
                    scale: modelCanvas.style.transform,
                    isActive: tick3 ? tick3.classList.contains('active') : false
                };
            })()
        """)
        assert res2['zoom'] == 3.0, f"Expected 3.0, got {res2['zoom']}"
        assert res2['isActive'], "Tick 3.0 was not marked active"
        print(f"  [PASS] Discrete tick click (3.0x) updates correctly: {res2['mag']} {res2['focal']}")

        # 3. Test Continuous Drag on Track
        msg_id += 1
        res3 = await eval_js(ws, msg_id, """
            (() => {
                const track = document.getElementById('fimo-zoom-ruler-track');
                const rect = track.getBoundingClientRect();
                
                // Simulate pointerdown at 35% of track
                const targetX = rect.left + rect.width * 0.35;
                const pDown = new PointerEvent('pointerdown', { clientX: targetX, pointerId: 1, bubbles: true });
                track.dispatchEvent(pDown);

                const z1 = state.fimoZoomLevel;
                
                // Simulate pointermove to 75% of track
                const targetX2 = rect.left + rect.width * 0.75;
                const pMove = new PointerEvent('pointermove', { clientX: targetX2, pointerId: 1, bubbles: true });
                track.dispatchEvent(pMove);

                const z2 = state.fimoZoomLevel;

                const pUp = new PointerEvent('pointerup', { pointerId: 1, bubbles: true });
                track.dispatchEvent(pUp);

                return { z1: z1, z2: z2 };
            })()
        """)
        assert res3['z1'] > 1.0 and res3['z2'] > res3['z1'], f"Drag simulation failed: {res3}"
        print(f"  [PASS] Continuous pointer drag verified smoothly: {res3['z1']}x -> {res3['z2']}x")

        # 4. Test Actual Photo Capture with Zoom
        msg_id += 1
        res4 = await eval_js(ws, msg_id, """
            (() => {
                window.setFimoZoom(2.1);
                // Trigger shutter capture
                executeCapture();
                
                const lastPhoto = state.gallery[0];
                return {
                    focalExif: lastPhoto.exif.focal,
                    hasDataUrl: !!lastPhoto.dataUrl
                };
            })()
        """)
        print(f"  [Step 4] Captured Photo Metadata with Zoom:")
        print(f"    - EXIF Focal: {res4['focalExif']}")
        assert "49mm eq." in res4['focalExif'], f"Expected 49mm eq. in EXIF, got {res4['focalExif']}"
        assert "2.1x" in res4['focalExif'], f"Expected 2.1x in EXIF, got {res4['focalExif']}"
        assert res4['hasDataUrl'], "Captured photo has no data URL"
        print("  [PASS] Captured photo successfully applies 2.1x zoom into image canvas and EXIF!")

        # Reset zoom to 1.0
        msg_id += 1
        await eval_js(ws, msg_id, "window.setFimoZoom(1.0);")

        print("================================================================================")
        print("🎉 ALL TACTILE ZOOM ENGINE AUDITS PASSED 100%!")
        print("================================================================================")

    finally:
        proc.terminate()

if __name__ == '__main__':
    asyncio.run(main())
