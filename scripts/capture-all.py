#!/usr/bin/env python3
"""
SnapStudio Automated Capture & Visual Documentation Pipeline
Renders and captures all 14 Iconic Camera interfaces, photo outputs with signatures,
Optical Lens effects, and the interactive Photo Gallery & EXIF Metadata inspector.
"""

import os
import sys
import time
import json
import base64
import urllib.request
import subprocess
import tempfile
import asyncio
import http.server
import socketserver
import threading
import mimetypes

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

CAMERA_LIST = [
    {
        'id': 'canon-ixy',
        'name': 'Canon IXY Digital 50',
        'sub': 'Y2K CCD DigiCam',
        'filter': 'ixy-peach'
    },
    {
        'id': 'sony-handycam',
        'name': 'Sony DCR Handycam',
        'sub': 'MiniDV Camcorder',
        'filter': 'handy-minidv'
    },
    {
        'id': 'sony-cybershot',
        'name': 'Sony Cyber-shot DSC-P',
        'sub': '2000s Cyber Blue CCD',
        'filter': 'cyber-cool'
    },
    {
        'id': 'instax-mini',
        'name': 'Fujifilm Instax Mini',
        'sub': 'Instant Film Card',
        'filter': 'instax-card'
    },
    {
        'id': 'olympus-mju',
        'name': 'Olympus [mju:] II',
        'sub': 'All-Weather 35mm P&S',
        'filter': 'mju-standard'
    },
    {
        'id': 'contax-t2',
        'name': 'Contax T2 Carl Zeiss',
        'sub': 'Sonnar 38mm T* Luxury',
        'filter': 'zeiss-warm'
    },
    {
        'id': 'ricoh-gr',
        'name': 'Ricoh GR III Street',
        'sub': 'High Contrast B&W Snap',
        'filter': 'gr-bw-high'
    },
    {
        'id': 'leica-m',
        'name': 'Leica M6 Classic',
        'sub': 'Summicron 35mm Rangefinder',
        'filter': 'leica-summilux'
    },
    {
        'id': 'citypop-80s',
        'name': 'City Pop 80s Disco',
        'sub': 'Neon Tokyo Sunset Aesthetic',
        'filter': 'city-sunset'
    },
    {
        'id': 'oldfilm-35mm',
        'name': 'Classic 35mm Film',
        'sub': 'CineStill 800T Halation',
        'filter': 'film-cinestill'
    },
    {
        'id': 'hasselblad',
        'name': 'Hasselblad 500C/M',
        'sub': '6x6 Medium Format Planar',
        'filter': 'hassel-planar'
    },
    {
        'id': 'polaroid-sx70',
        'name': 'Polaroid SX-70 (1972)',
        'sub': 'Folding SLR Land Camera',
        'filter': 'sx70-fade'
    },
    {
        'id': 'fuji-quicksnap',
        'name': 'Fuji QuickSnap (写ルンです 1986)',
        'sub': '1986 Bubble Disposable Icon',
        'filter': 'quicksnap-86'
    },
    {
        'id': 'kyocera-samurai',
        'name': 'Kyocera Samurai X3.0 (1988)',
        'sub': 'Cyber Half-Frame 72-Shot SLR',
        'filter': 'samurai-half'
    },
    {
        'id': 'sihyun-color',
        'name': 'Sihyunhada Signature',
        'sub': 'Real-time Identity Hue',
        'filter': 'sihyun-coral'
    },
    {
        'id': 'passport-id',
        'name': 'Official Biometric ID',
        'sub': 'Korean Passport Standard HUD',
        'filter': 'passport-standard'
    }
]

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        if path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.css'):
            return 'text/css'
        return super().guess_type(path)


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


async def evaluate_js(ws, msg_id, expression):
    res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
        'expression': expression,
        'returnByValue': True,
        'awaitPromise': True
    })
    if 'result' in res and 'result' in res['result']:
        val = res['result']['result'].get('value')
        return val
    return None


async def run_pipeline():
    try:
        import websockets
    except ImportError:
        print("❌ 'websockets' package is required.")
        sys.exit(1)

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    docs_dir = os.path.join(project_root, 'docs')
    screenshots_dir = os.path.join(docs_dir, 'screenshots')
    captures_dir = os.path.join(docs_dir, 'captures')
    os.makedirs(screenshots_dir, exist_ok=True)
    os.makedirs(captures_dir, exist_ok=True)

    print("📸 Starting SnapStudio Automated Visual Capture Pipeline...")
    print(f"📁 Output directories:\n   Screenshots: {screenshots_dir}\n   Captures: {captures_dir}")

    # 1. Start Local HTTP Server if not already running
    port = 8080
    httpd = None
    try:
        socketserver.TCPServer.allow_reuse_address = True
        httpd = socketserver.TCPServer(('127.0.0.1', port), CustomHandler)
        server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        server_thread.start()
        print(f"🌐 HTTP Server started on http://127.0.0.1:{port}")
    except OSError:
        print(f"🌐 Using existing HTTP Server on http://127.0.0.1:{port}")

    # 2. Launch Chrome Headless
    chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
    if not os.path.exists(chrome_path):
        chrome_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

    print(f"🚀 Launching Headless Browser: {chrome_path}")
    user_data_dir = tempfile.mkdtemp(prefix='icam_cdp_')
    chrome_proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        '--remote-debugging-port=9222',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=430,932',
        f'http://127.0.0.1:{port}/index.html'
    ])

    await asyncio.sleep(2.5)

    msg_id = 1
    manifest = []

    try:
        # Find page target
        res = urllib.request.urlopen('http://127.0.0.1:9222/json').read()
        targets = json.loads(res.decode('utf-8'))
        page_target = next((t for t in targets if t.get('type') == 'page' and 'localhost' in t.get('url', '') or '127.0.0.1' in t.get('url', '')), None)
        if not page_target:
            raise RuntimeError("Could not find index.html page target in browser")

        ws_url = page_target['webSocketDebuggerUrl']
        print(f"🔌 Connected to Page CDP: {ws_url}")

        async with websockets.connect(ws_url, max_size=20 * 1024 * 1024) as ws:
            msg_id += 1
            await send_cdp(ws, msg_id, 'Page.enable')

            # Wait for model image load
            await asyncio.sleep(1.5)

            # --- Iterate through 16 Cameras ---
            for index, cam in enumerate(CAMERA_LIST, start=1):
                cam_id = cam['id']
                print(f"\n[{index}/{len(CAMERA_LIST)}] Processing Camera: {cam['name']} ({cam_id})...")

                # Switch camera & close any open modal
                msg_id += 1
                await evaluate_js(ws, msg_id, f'''
                    (function() {{
                        closeGalleryModal();
                        switchCamera('{cam_id}');
                    }})()
                ''')
                await asyncio.sleep(0.4)

                # Capture Viewfinder UI Screenshot
                msg_id += 1
                ui_shot_res = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
                ui_b64 = ui_shot_res.get('result', {}).get('data', '')
                ui_filename = f"camera_{cam_id}.png"
                ui_filepath = os.path.join(screenshots_dir, ui_filename)
                with open(ui_filepath, 'wb') as f:
                    f.write(base64.b64decode(ui_b64))
                print(f"   🖼️ Viewfinder UI saved: {ui_filename} ({len(ui_b64)} b64 bytes)")

                # Execute Shutter Capture
                msg_id += 1
                capture_res = await evaluate_js(ws, msg_id, '''
                    (function() {
                        executeCapture();
                        const record = state.gallery[0];
                        return {
                            dataUrl: record ? record.dataUrl : null,
                            exif: record ? record.exif : null
                        };
                    })()
                ''')
                await asyncio.sleep(0.4)

                if capture_res and capture_res.get('dataUrl'):
                    data_url = capture_res['dataUrl']
                    header, b64_data = data_url.split(',', 1)
                    photo_filename = f"capture_{cam_id}.png"
                    photo_filepath = os.path.join(captures_dir, photo_filename)
                    with open(photo_filepath, 'wb') as f:
                        f.write(base64.b64decode(b64_data))
                    print(f"   📸 Photo Capture saved: {photo_filename} with EXIF")
                    
                    manifest.append({
                        'id': cam_id,
                        'name': cam['name'],
                        'sub': cam['sub'],
                        'ui_screenshot': f"docs/screenshots/{ui_filename}",
                        'photo_capture': f"docs/captures/{photo_filename}",
                        'exif': capture_res.get('exif')
                    })
                else:
                    print(f"   ⚠️ Could not extract capture output for {cam_id}")

            # --- Capture Feature Modals ---
            print("\n🌟 Capturing Feature 1: Photo Gallery & EXIF Metadata Inspector Modal...")
            msg_id += 1
            await evaluate_js(ws, msg_id, '''
                (function() {
                    openGalleryModal();
                    selectGalleryPhoto(0);
                })()
            ''')
            await asyncio.sleep(0.5)

            msg_id += 1
            gal_shot = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            gal_b64 = gal_shot.get('result', {}).get('data', '')
            gal_filepath = os.path.join(screenshots_dir, "feature_gallery_exif_modal.png")
            with open(gal_filepath, 'wb') as f:
                f.write(base64.b64decode(gal_b64))
            print("   🖼️ Photo Gallery & EXIF Modal saved: feature_gallery_exif_modal.png")

            # Select another photo (Hasselblad or Polaroid) to inspect medium format EXIF
            msg_id += 1
            await evaluate_js(ws, msg_id, '''
                (function() {
                    if (state.gallery.length > 3) {
                        selectGalleryPhoto(3);
                    }
                })()
            ''')
            await asyncio.sleep(0.3)
            msg_id += 1
            detail_shot = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            detail_b64 = detail_shot.get('result', {}).get('data', '')
            detail_filepath = os.path.join(screenshots_dir, "feature_gallery_exif_detail.png")
            with open(detail_filepath, 'wb') as f:
                f.write(base64.b64decode(detail_b64))
            print("   🖼️ Gallery EXIF Detail saved: feature_gallery_exif_detail.png")

            # --- Capture Feature 2: Optical Lens FX (Mist & Star) ---
            print("\n🌟 Capturing Feature 2: Optical Lens Filter Overlays...")
            msg_id += 1
            await evaluate_js(ws, msg_id, '''
                (function() {
                    closeGalleryModal();
                    switchCamera('leica-m');
                    applyLensFilter('mist');
                })()
            ''')
            await asyncio.sleep(0.4)
            msg_id += 1
            mist_shot = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            mist_b64 = mist_shot.get('result', {}).get('data', '')
            mist_filepath = os.path.join(screenshots_dir, "feature_lens_black_mist.png")
            with open(mist_filepath, 'wb') as f:
                f.write(base64.b64decode(mist_b64))
            print("   🖼️ Black Mist Optical Lens saved: feature_lens_black_mist.png")

            msg_id += 1
            await evaluate_js(ws, msg_id, '''
                (function() {
                    applyLensFilter('star');
                })()
            ''')
            await asyncio.sleep(0.4)
            msg_id += 1
            star_shot = await send_cdp(ws, msg_id, 'Page.captureScreenshot', {'format': 'png'})
            star_b64 = star_shot.get('result', {}).get('data', '')
            star_filepath = os.path.join(screenshots_dir, "feature_lens_star_cross.png")
            with open(star_filepath, 'wb') as f:
                f.write(base64.b64decode(star_b64))
            print("   🖼️ Star Cross Optical Lens saved: feature_lens_star_cross.png")

            # Reset lens filter
            msg_id += 1
            await evaluate_js(ws, msg_id, "applyLensFilter('none');")

            # Save Manifest JSON
            manifest_path = os.path.join(docs_dir, 'captures_manifest.json')
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)
            print(f"\n📋 Manifest saved with {len(manifest)} captures: {manifest_path}")

    finally:
        chrome_proc.terminate()
        if httpd:
            httpd.shutdown()
        print("\n🏁 Automation pipeline cleanly terminated.")

if __name__ == '__main__':
    asyncio.run(run_pipeline())
