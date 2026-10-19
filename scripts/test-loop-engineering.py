import os
import sys
import json
import subprocess
import tempfile
import asyncio
import urllib.request

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

async def main():
    import websockets
    debug_port = 9489
    chrome_candidates = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ]
    chrome_path = next((p for p in chrome_candidates if os.path.exists(p)), 'google-chrome')
    user_data_dir = tempfile.mkdtemp(prefix='icam_loop_eng_qa_')

    proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        f'--remote-debugging-port={debug_port}',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1440,900'
    ])

    try:
        tabs = None
        for _ in range(15):
            await asyncio.sleep(0.4)
            try:
                with urllib.request.urlopen(f'http://127.0.0.1:{debug_port}/json') as resp:
                    tabs = json.loads(resp.read().decode())
                    if tabs:
                        break
            except Exception:
                pass
        if not tabs:
            raise RuntimeError("Failed to connect to headless Chrome CDP")
        ws_url = next((t['webSocketDebuggerUrl'] for t in tabs if t.get('type') == 'page'), tabs[0]['webSocketDebuggerUrl'])

        ws = await websockets.connect(ws_url, max_size=100_000_000)

        async def cdp(method, params=None):
            import random
            mid = random.randint(1, 1000000)
            await ws.send(json.dumps({'id': mid, 'method': method, 'params': params or {}}))
            while True:
                msg = json.loads(await ws.recv())
                if msg.get('id') == mid:
                    return msg

        async def eval_js(expr):
            res = await cdp('Runtime.evaluate', {'expression': expr, 'returnByValue': True, 'awaitPromise': True})
            return res.get('result', {}).get('result', {}).get('value')

        await cdp('Page.enable')
        await cdp('Runtime.enable')

        url = 'http://localhost:8080/index.html'
        print(f"Navigating to {url} ...")
        await cdp('Page.navigate', {'url': url})
        await asyncio.sleep(2.0)

        print("\n" + "="*84)
        print("🔄 SnapStudio Closed-Loop Engineering & Vintage Aesthetics QA Suite")
        print("="*84)

        tests_passed = 0
        total_tests = 0

        def check(condition, message):
            nonlocal tests_passed, total_tests
            total_tests += 1
            if condition:
                print(f"  [PASS] {message}")
                tests_passed += 1
            else:
                print(f"  [FAIL] {message}")
                raise AssertionError(f"Check failed: {message}")

        # -------------------------------------------------------------
        # Stage 1: Error State Registry & Closed-Loop Governance Audit
        # -------------------------------------------------------------
        print("\n📋 [Stage 1] Stateful Error Registry (ERROR_STATE_REGISTRY.json) & Governance Audit")
        repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        registry_path = os.path.join(repo_root, 'ERROR_STATE_REGISTRY.json')
        loop_doc_path = os.path.join(repo_root, 'LOOP_ENGINEERING.md')

        check(os.path.exists(registry_path), "ERROR_STATE_REGISTRY.json exists in repository root")
        check(os.path.exists(loop_doc_path), "LOOP_ENGINEERING.md exists in repository root")

        with open(registry_path, 'r', encoding='utf-8') as f:
            registry = json.load(f)

        error_cases = registry.get('errorCases', registry.get('error_cases', []))
        check(len(error_cases) >= 10, f"Error State Registry tracks {len(error_cases)} historical/loop error cases")
        for idx in range(1, 11):
            eid = f"ERR-{idx:03d}"
            entry = next((e for e in error_cases if e.get('id') == eid), None)
            check(entry is not None and entry.get('status') in ('RESOLVED_AND_GUARDED', 'RESOLVED_GUARDED'), f"{eid} is registered and RESOLVED_AND_GUARDED ({entry.get('title') if entry else 'missing'})")

        # -------------------------------------------------------------
        # Stage 2: 16 Reference Camera Lineup & Custom Skeuomorphic SVGs
        # -------------------------------------------------------------
        print("\n📸 [Stage 2] User-Uploaded 16 Reference Camera Personas & Custom SVG Fidelity")
        expected_personas = {
            'kyocera-samurai': ('Osaka Classic', 'osaka-classic-svg'),
            'sihyun-color': ('Butterfilm', 'butterfilm-svg'),
            'instax-mini': ('Seoul instc', 'seoul-instc-svg'),
            'olympus-mju': ('Lime Memory', 'lime-memory-svg'),
            'canon-ixy': ('Cold Snap', 'cold-snap-svg'),
            'ricoh-gr': ('Nature Core', 'nature-core-svg'),
            'contax-t2': ('Pearl 08', 'pearl-08-svg'),
            'fuji-quicksnap': ('Sunny Saver', 'sunny-saver-svg'),
            'sony-handycam': ('Lazy Monkey', 'lazy-monkey-svg'),
            'sony-cybershot': ('Night Tape 98', 'night-tape-svg'),
            'citypop-80s': ('Pocari Blue', 'pocari-blue-svg'),
            'oldfilm-35mm': ("Wedding '95", 'wedding-95-svg'),
            'polaroid-sx70': ('Ohio Summer', 'ohio-summer-svg'),
            'leica-m': ('Day Classic', 'day-classic-svg'),
            'hasselblad-500cm': ('Dark Akan 77', 'dark-akan-svg'),
            'passport-id': ('Passport ID', 'passport-svg')
        }

        personas_data = await eval_js("window.FIMO_CAMERA_PERSONAS")
        svg_icons_data = await eval_js("window.CAM_SVG_ICONS")
        if not personas_data:
            dbg = await eval_js("({href: location.href, ready: document.readyState, camKeys: Object.keys(window.CAMERAS || {})})")
            print(f"DEBUG eval_js: personas_data={personas_data}, dbg={dbg}")
        check(personas_data is not None and len(personas_data) == 16, "All 16 FIMO_CAMERA_PERSONAS are registered")

        for cam_id, (expected_name, expected_svg_cls) in expected_personas.items():
            p = personas_data.get(cam_id, {})
            svg_markup = svg_icons_data.get(cam_id, '')
            check(
                p.get('personaName') == expected_name and expected_svg_cls in svg_markup and len(p.get('captionText', '')) > 0,
                f"{cam_id} -> '{p.get('personaName')}' with SVG '{expected_svg_cls}' & caption '{p.get('captionText')}'"
            )

        # Open Camera Bag Modal and verify 16 cards rendered
        await eval_js("document.getElementById('fimo-vf-drawer-tab').click()")
        await asyncio.sleep(0.3)
        bag_card_count = await eval_js("document.querySelectorAll('#camera-bag-grid .bag-cam-card').length")
        check(bag_card_count == 16, f"Camera Bag 2-Column Showcase renders all {bag_card_count}/16 collectible cameras")
        await eval_js("document.getElementById('btn-fimo-back-vf').click()")
        await asyncio.sleep(0.2)

        # -------------------------------------------------------------
        # Stage 3: Pillar 1 - NewJeans "Ditto" 1998 Winter VHS Aesthetic
        # -------------------------------------------------------------
        print("\n🐰 [Stage 3] Pillar 1: NewJeans 'Ditto' 1998 Winter VHS Aesthetic ('Night Tape 98' & 'Lazy Monkey')")
        await eval_js("window.switchCamera('sony-cybershot')")
        await asyncio.sleep(0.2)

        ditto_check = await eval_js("""
            (() => {
                const cam = window.CAMERAS['sony-cybershot'];
                const persona = window.FIMO_CAMERA_PERSONAS['sony-cybershot'];
                const profile = window.FilmSpectralEngine.getProfile('sony-cybershot');
                const heroName = document.getElementById('fimo-hero-name')?.textContent;
                const miniSvg = document.getElementById('fimo-mini-cam-render')?.innerHTML || '';
                const captionText = document.getElementById('fimo-caption-text')?.textContent || '';
                return {
                    filterNames: Object.values(cam.filters).map(f => f.name),
                    personaName: persona.personaName,
                    heroName,
                    hasNightTapeSvg: miniSvg.includes('night-tape-svg'),
                    captionText,
                    halationRadius: (profile && profile.halation) ? profile.halation.radius : 0,
                    blueGamma: (profile && profile.hdCurves) ? profile.hdCurves.b.gamma : 0
                };
            })()
        """)
        check("Ditto '98 Winter" in ditto_check['filterNames'] and "Bunnies VHS Tape" in ditto_check['filterNames'],
              f"NewJeans Ditto filters active: {ditto_check['filterNames'][:2]}")
        check(ditto_check['heroName'] == 'Night Tape 98' and ditto_check['hasNightTapeSvg'],
              f"Hero & Mini Camera synced to '{ditto_check['heroName']}' (night-tape-svg)")
        check("Ditto" in ditto_check['captionText'],
              f"Ditto winter nostalgia caption loaded: '{ditto_check['captionText']}'")
        check(ditto_check['halationRadius'] >= 10 and ditto_check['blueGamma'] >= 1.1,
              f"Spectral Color Engine Ditto VHS soft halation active (radius={ditto_check['halationRadius']}px, blueGamma={ditto_check['blueGamma']})")

        # Also check Lazy Monkey (sony-handycam)
        await eval_js("window.switchCamera('sony-handycam')")
        await asyncio.sleep(0.2)
        handy_check = await eval_js("""
            (() => {
                const cam = window.CAMERAS['sony-handycam'];
                const captionText = document.getElementById('fimo-caption-text')?.textContent || '';
                return {
                    firstFilter: Object.values(cam.filters)[0].name,
                    captionText
                };
            })()
        """)
        check(handy_check['firstFilter'] == 'Ditto School Cam' and '방과 후' in handy_check['captionText'],
              f"Lazy Monkey ('{handy_check['firstFilter']}') & school memory caption verified: '{handy_check['captionText']}'")

        # -------------------------------------------------------------
        # Stage 4: Pillar 2 - Tokyo Y2K & 1980s Bubble Economy Aesthetic
        # -------------------------------------------------------------
        print("\n🗼 [Stage 4] Pillar 2: Tokyo Y2K & 1980s Japanese Bubble Economy Aesthetic ('Pocari Blue', 'Sunny Saver', 'Osaka Classic')")
        for cam_id, expected_persona in [('citypop-80s', 'Pocari Blue'), ('fuji-quicksnap', 'Sunny Saver'), ('kyocera-samurai', 'Osaka Classic')]:
            await eval_js(f"window.switchCamera('{cam_id}')")
            await asyncio.sleep(0.15)
            bubble_info = await eval_js(f"""
                (() => {{
                    const profile = window.FilmSpectralEngine.getProfile('{cam_id}');
                    const heroName = document.getElementById('fimo-hero-name')?.textContent;
                    const captionText = document.getElementById('fimo-caption-text')?.textContent;
                    return {{
                        heroName,
                        captionText,
                        hasCurves: Boolean(profile && profile.hdCurves && profile.spectralMatrix)
                    }};
                }})()
            """)
            check(bubble_info['heroName'] == expected_persona and bubble_info['hasCurves'],
                  f"{cam_id} ({bubble_info['heroName']}) spectral H-D curves & caption '{bubble_info['captionText']}' verified")

        # -------------------------------------------------------------
        # Stage 5: Interactive Viewfinder Controls (Caption ON/OFF, Date ON/OFF, EV Arc Wheel, Zoom 1x~5x)
        # -------------------------------------------------------------
        print("\n🎛️ [Stage 5] Viewfinder Status Bar (사진 문구 ON/OFF, 날짜 ON/OFF), Curved EV Wheel & Capture Sync")
        await eval_js("window.switchCamera('sony-cybershot')")
        await asyncio.sleep(0.15)

        # Toggle Photo Caption ON
        await eval_js("document.getElementById('fimo-toggle-caption').click()")
        await asyncio.sleep(0.15)
        caption_state = await eval_js("""
            (() => {
                const ov = document.getElementById('fimo-caption-overlay');
                return {
                    enabled: window.state.fimoCaptionEnabled,
                    display: ov ? getComputedStyle(ov).display : 'none',
                    text: document.getElementById('fimo-caption-text')?.textContent || ''
                };
            })()
        """)
        check(caption_state['enabled'] is True and caption_state['display'] == 'flex',
              f"Viewfinder Photo Caption toggled ON (display={caption_state['display']}, text='{caption_state['text']}')")

        # Adjust Curved Exposure Arc Wheel to +1.0 EV
        await eval_js("window.setFimoExposureEV(1.0)")
        await asyncio.sleep(0.15)
        ev_state = await eval_js("""
            (() => ({
                ev: window.state.fimoExposureEV,
                topNum: document.getElementById('fimo-exp-top-val')?.textContent,
                botNum: document.getElementById('fimo-exp-bot-val')?.textContent,
                filterCss: (document.getElementById('model-canvas')?.style.filter || '')
            }))()
        """)
        check(ev_state['ev'] == 1.0 and ev_state['topNum'] == '7' and ev_state['botNum'] == '6' and 'brightness(' in ev_state['filterCss'],
              f"Curved Exposure Arc Wheel synced to +1.0 EV (Dial {ev_state['topNum']}/{ev_state['botNum']}, CSS={ev_state['filterCss'][:25]}...)")

        # Set Zoom to 2.1x (49mm) and Execute Capture
        await eval_js("window.setFimoZoom(2.1)")
        await asyncio.sleep(0.15)
        film_before = await eval_js("window.state.fimoFilmRemaining")
        await eval_js("window.executeCapture()")
        await asyncio.sleep(0.5)

        capture_record = await eval_js("""
            (() => {
                const rec = window.state.gallery[0];
                return rec ? {
                    cameraKey: rec.cameraKey,
                    personaName: rec.personaName,
                    filterName: rec.filterName,
                    caption: rec.caption,
                    exposureEV: rec.exposureEV,
                    focalLength: rec.focalLength,
                    width: rec.width,
                    height: rec.height,
                    filmAfter: window.state.fimoFilmRemaining,
                    gaugeText: document.getElementById('fimo-gauge-curr')?.textContent
                } : null;
            })()
        """)
        check(capture_record is not None, "Shutter capture succeeded and created gallery record")
        check(capture_record['personaName'] == 'Night Tape 98' and 'Ditto' in capture_record['caption'],
              f"Captured photo imprinted Ditto caption ('{capture_record['caption']}') for '{capture_record['personaName']}'")
        check(capture_record['exposureEV'] == '+1.0 EV' and '49mm' in capture_record['focalLength'],
              f"Captured EXIF recorded Exposure Bias ({capture_record['exposureEV']}) & Zoom Focal Length ({capture_record['focalLength']})")
        check(capture_record['filmAfter'] == film_before - 1 and capture_record['gaugeText'] == str(capture_record['filmAfter']),
              f"Arched film counter decremented live on capture ({film_before} -> {capture_record['filmAfter']} / 27)")

        # Reset EV and Caption to default
        await eval_js("window.setFimoExposureEV(0.0); window.setFimoZoom(1.0); document.getElementById('fimo-toggle-caption').click(); window.closeGalleryModal && window.closeGalleryModal();")

        print("\n" + "="*84)
        print(f"🎉 CLOSED-LOOP ENGINEERING & VINTAGE AESTHETICS QA PASSED: {tests_passed}/{total_tests} (100.0%)")
        print("="*84)

        await ws.close()
    finally:
        proc.terminate()

if __name__ == '__main__':
    asyncio.run(main())
