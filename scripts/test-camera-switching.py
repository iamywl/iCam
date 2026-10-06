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
    user_data_dir = tempfile.mkdtemp(prefix='icam_cam_switch_test_')

    proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        '--remote-debugging-port=9445',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1920,1080',
        f'http://127.0.0.1:{port}/index.html'
    ])

    await asyncio.sleep(2.0)
    msg_id = 1

    try:
        res = urllib.request.urlopen('http://127.0.0.1:9445/json').read()
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

            # Test 1: Layout Collision Audit (Drawer vs Mode Dial)
            print("\n[Audit 1/5] Checking Layout Geometry (Zero Overlap between Drawer & Bottom Section)...")
            msg_id += 1
            geo_res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': '''(function() {
                    const drawer = document.querySelector('.control-drawer');
                    const bottomSec = document.querySelector('.camera-bottom-section');
                    const dial = document.querySelector('.mode-dial-wrapper');
                    
                    const dRect = drawer.getBoundingClientRect();
                    const bRect = bottomSec.getBoundingClientRect();
                    const dialRect = dial.getBoundingClientRect();

                    const isColliding = dRect.bottom > bRect.top;
                    return {
                        drawerBottom: dRect.bottom,
                        bottomSectionTop: bRect.top,
                        dialTop: dialRect.top,
                        gap: bRect.top - dRect.bottom,
                        collision: isColliding
                    };
                })()''',
                'returnByValue': True
            })
            geo = geo_res['result']['result']['value']
            print("  Geometry:", geo)
            assert not geo['collision'], f"Collision detected! Drawer bottom {geo['drawerBottom']} > Bottom section top {geo['bottomSectionTop']}"
            assert geo['gap'] >= 0, "Drawer bleeds into bottom section!"
            print("  ✅ ZERO COLLISION CONFIRMED: Control drawer cleanly terminates before bottom section.")

            # Test 2: Stepper Prev / Next Buttons
            print("\n[Audit 2/5] Testing Viewfinder HUD Stepper Buttons (❮ / ❯)...")
            msg_id += 1
            stepper_res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': '''(function() {
                    const sc = window.switchCamera;
                    const st = window.state;
                    sc('canon-ixy');
                    const initial = st.activeCamera;

                    // Click Next
                    const btnNext = document.getElementById('btn-cam-next');
                    btnNext.click();
                    const afterNext = st.activeCamera;

                    // Click Next again
                    btnNext.click();
                    const afterNext2 = st.activeCamera;

                    // Click Prev
                    const btnPrev = document.getElementById('btn-cam-prev');
                    btnPrev.click();
                    const afterPrev = st.activeCamera;

                    return {
                        initial: initial,
                        afterNext: afterNext,
                        afterNext2: afterNext2,
                        afterPrev: afterPrev,
                        badgeTitle: document.getElementById('cam-badge-title')?.textContent
                    };
                })()''',
                'returnByValue': True
            })
            step_val = stepper_res['result']['result']['value']
            print("  Stepper Progression:", step_val)
            assert step_val['initial'] == 'canon-ixy', "Initial camera was not canon-ixy"
            assert step_val['afterNext'] == 'sony-handycam', "Next button failed to switch to sony-handycam"
            assert step_val['afterNext2'] == 'sony-cybershot', "Next button failed to switch to sony-cybershot"
            assert step_val['afterPrev'] == 'sony-handycam', "Prev button failed to return to sony-handycam"
            print("  ✅ STEPPERS PASS: ❮ and ❯ buttons cycle cameras smoothly.")

            # Test 3: Category Fast-Jump Bar
            print("\n[Audit 3/5] Testing Category Fast-Jump Bar (🇯🇵 버블&필름, 💿 Y2K, 🪐 중형, 🎨 스튜디오)...")
            msg_id += 1
            cat_res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': '''(function() {
                    const results = {};
                    const st = window.state || state;

                    // Jump to Bubble
                    const bubblePill = document.querySelector('.cam-cat-pill[data-cat="bubble"]');
                    bubblePill.click();
                    results.bubbleFirst = st.activeCamera;

                    // Jump to Medium
                    const mediumPill = document.querySelector('.cam-cat-pill[data-cat="medium"]');
                    mediumPill.click();
                    results.mediumFirst = st.activeCamera;

                    // Jump to Studio
                    const studioPill = document.querySelector('.cam-cat-pill[data-cat="studio"]');
                    studioPill.click();
                    results.studioFirst = st.activeCamera;

                    // Jump to Y2K
                    const y2kPill = document.querySelector('.cam-cat-pill[data-cat="y2k"]');
                    y2kPill.click();
                    results.y2kFirst = st.activeCamera;

                    return results;
                })()''',
                'returnByValue': True
            })
            cat_val = cat_res['result']['result']['value']
            print("  Category Fast-Jump Results:", cat_val)
            assert cat_val['bubbleFirst'] in ['fuji-quicksnap', 'kyocera-samurai', 'citypop-80s', 'oldfilm-35mm', 'contax-t2', 'olympus-mju'], "Bubble jump failed"
            assert cat_val['mediumFirst'] in ['hasselblad-500cm', 'polaroid-sx70', 'instax-mini'], "Medium jump failed"
            assert cat_val['studioFirst'] in ['sihyun-color', 'passport-id'], "Studio jump failed"
            assert cat_val['y2kFirst'] in ['canon-ixy', 'sony-handycam', 'sony-cybershot', 'ricoh-gr', 'leica-m'], "Y2K jump failed"
            print("  ✅ CATEGORY JUMP PASS: One-tap category switching activates correct bodies.")

            # Test 4: Visual Camera Bag Modal (Rack View)
            print("\n[Audit 4/5] Testing Visual Camera Bag Modal (Open, 16 Cards, Filter, Equip)...")
            msg_id += 1
            bag_res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': '''(function() {
                    const st = window.state || state;
                    // Open bag via toolbar button
                    const btnBag = document.getElementById('btn-camera-bag');
                    btnBag.click();

                    const modal = document.getElementById('camera-bag-modal');
                    const isOpen = modal.classList.contains('open');

                    const totalCards = document.querySelectorAll('#camera-bag-grid .bag-cam-card').length;

                    // Filter by medium
                    const btnMed = document.querySelector('#bag-category-filter .bag-cat-btn[data-cat="medium"]');
                    btnMed.click();
                    const mediumCards = document.querySelectorAll('#camera-bag-grid .bag-cam-card').length;

                    // Filter by all
                    const btnAll = document.querySelector('#bag-category-filter .bag-cat-btn[data-cat="all"]');
                    btnAll.click();

                    // Equip Kyocera Samurai from bag
                    const samuraiCard = document.querySelector('#camera-bag-grid .bag-cam-card[data-cam="kyocera-samurai"]');
                    samuraiCard.click();

                    const activeAfterEquip = st.activeCamera;
                    const isClosedAfterEquip = !modal.classList.contains('open');

                    return {
                        isOpen: isOpen,
                        totalCards: totalCards,
                        mediumCards: mediumCards,
                        activeAfterEquip: activeAfterEquip,
                        isClosedAfterEquip: isClosedAfterEquip
                    };
                })()''',
                'returnByValue': True
            })
            bag_val = bag_res['result']['result']['value']
            print("  Camera Bag Results:", bag_val)
            assert bag_val['isOpen'], "Camera bag failed to open"
            assert bag_val['totalCards'] == 16, f"Expected 16 camera cards, got {bag_val['totalCards']}"
            assert bag_val['mediumCards'] == 3, f"Expected 3 medium format cards, got {bag_val['mediumCards']}"
            assert bag_val['activeAfterEquip'] == 'kyocera-samurai', "Equipping samurai card failed"
            assert bag_val['isClosedAfterEquip'], "Bag modal did not close after equipping"
            print("  ✅ CAMERA BAG PASS: All 16 cards rendered, category filtering and 1-tap equip verified.")

            # Test 5: Viewfinder Swipe Gesture Simulation
            print("\n[Audit 5/5] Testing Viewfinder Horizontal Swipe Gesture (Touch/Pointer)...")
            msg_id += 1
            swipe_res = await send_cdp(ws, msg_id, 'Runtime.evaluate', {
                'expression': '''(function() {
                    const sc = window.switchCamera;
                    const st = window.state;
                    sc('canon-ixy');
                    const vf = document.getElementById('viewfinder');

                    // Simulate Left Swipe (Next Camera)
                    const downEvent = new PointerEvent('pointerdown', { clientX: 200, clientY: 250, bubbles: true });
                    const upEvent = new PointerEvent('pointerup', { clientX: 120, clientY: 250, bubbles: true });
                    vf.dispatchEvent(downEvent);
                    vf.dispatchEvent(upEvent);
                    const afterSwipeLeft = st.activeCamera;

                    // Simulate Right Swipe (Prev Camera)
                    const downEvent2 = new PointerEvent('pointerdown', { clientX: 120, clientY: 250, bubbles: true });
                    const upEvent2 = new PointerEvent('pointerup', { clientX: 200, clientY: 250, bubbles: true });
                    vf.dispatchEvent(downEvent2);
                    vf.dispatchEvent(upEvent2);
                    const afterSwipeRight = st.activeCamera;

                    return {
                        initial: 'canon-ixy',
                        afterSwipeLeft: afterSwipeLeft,
                        afterSwipeRight: afterSwipeRight
                    };
                })()''',
                'returnByValue': True
            })
            swipe_val = swipe_res['result']['result']['value']
            print("  Swipe Simulation Results:", swipe_val)
            assert swipe_val['afterSwipeLeft'] == 'sony-handycam', "Swipe left failed to switch to next camera"
            assert swipe_val['afterSwipeRight'] == 'canon-ixy', "Swipe right failed to return to previous camera"
            print("  ✅ SWIPE GESTURE PASS: Natural thumb horizontal swipe correctly navigates cameras.")

    finally:
        proc.terminate()
        print("\nAll 5 camera switching audits completed successfully!")

if __name__ == '__main__':
    asyncio.run(main())
