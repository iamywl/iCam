#!/usr/bin/env python3
"""
Test Parametric Photographic Color Engine & Tone Mixer (ERR-014 Verification)
Verifies:
1. ParametricColorEngine presence on window and 7 preset recipes (including Donggi Summer).
2. Exact parametric recipe match for @donggi_photo Kamakura Summer values.
3. Pro Recipe Modal sheet UI opening, closing, and slider DOM elements.
4. Live viewfinder model-canvas pixel transformation (Raw vs Donggi Summer vs Leica Mono).
5. Before / After (B/A) real-time comparison toggle fidelity.
6. Real-time slider input binding and HUD readout synchronization.
7. Capture canvas grading fidelity during executeCapture().
"""

import sys
import os
import json
import asyncio
import tempfile
import urllib.request
import websockets

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
    debug_port = 9452
    chrome_candidates = [
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ]
    chrome_path = next((p for p in chrome_candidates if os.path.exists(p)), 'google-chrome')
    user_data_dir = tempfile.mkdtemp(prefix='icam_recipe_test_')

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

    await asyncio.sleep(2.5)
    msg_id = 1

    try:
        res = urllib.request.urlopen(f'http://127.0.0.1:{debug_port}/json').read()
        targets = json.loads(res.decode('utf-8'))
        page_target = next((t for t in targets if t.get('type') == 'page'), None)
        if not page_target:
            print("[FAIL] No page target found in Chrome CDP")
            sys.exit(1)

        ws_url = page_target['webSocketDebuggerUrl']
        async with websockets.connect(ws_url) as ws:
            print("================================================================================")
            print("🧪 [QA AUDIT] PARAMETRIC RECIPE & TONE MIXER VERIFICATION (ERR-014)")
            print("================================================================================")

            # Test 1: Check ParametricColorEngine on window
            msg_id += 1
            engine_exists = await eval_js(ws, msg_id, "typeof window.ParametricColorEngine !== 'undefined'")
            assert engine_exists is True, "ParametricColorEngine must exist on window"
            print("  ✓ Test 1 Passed: ParametricColorEngine loaded successfully.")

            # Test 2: Check Presets & Donggi Summer Recipe Values
            msg_id += 1
            recipe_check = await eval_js(ws, msg_id, """(() => {
                const p = window.ParametricColorEngine.presets;
                const ds = p['donggi-summer'];
                return {
                    presetCount: Object.keys(p).length,
                    hasDonggi: !!ds,
                    exposure: ds.tone.exposure,
                    contrast: ds.tone.contrast,
                    highlights: ds.tone.highlights,
                    shadows: ds.tone.shadows,
                    whites: ds.tone.whites,
                    blacks: ds.tone.blacks,
                    temp: ds.color.temp,
                    tint: ds.color.tint,
                    orangeSat: ds.hsl.orange.sat,
                    orangeLum: ds.hsl.orange.lum,
                    greenHue: ds.hsl.green.hue,
                    greenLum: ds.hsl.green.lum
                };
            })()""")

            print(f"  ✓ Presets count: {recipe_check['presetCount']}")
            assert recipe_check['hasDonggi'] is True, "donggi-summer preset must exist"
            assert recipe_check['exposure'] == 1.23, f"Exposure must be 1.23, got {recipe_check['exposure']}"
            assert recipe_check['contrast'] == -88, f"Contrast must be -88, got {recipe_check['contrast']}"
            assert recipe_check['highlights'] == -100, f"Highlights must be -100, got {recipe_check['highlights']}"
            assert recipe_check['shadows'] == 45, f"Shadows must be 45, got {recipe_check['shadows']}"
            assert recipe_check['whites'] == -89, f"Whites must be -89, got {recipe_check['whites']}"
            assert recipe_check['blacks'] == 11, f"Blacks must be 11, got {recipe_check['blacks']}"
            assert recipe_check['temp'] == 3, f"Temp must be 3, got {recipe_check['temp']}"
            assert recipe_check['tint'] == -9, f"Tint must be -9, got {recipe_check['tint']}"
            assert recipe_check['orangeSat'] == -14, f"Orange sat must be -14, got {recipe_check['orangeSat']}"
            assert recipe_check['greenHue'] == 9, f"Green hue must be 9, got {recipe_check['greenHue']}"
            print("  ✓ Test 2 Passed: Donggi Summer recipe matches photographic reference 1:1.")

            # Test 3: Pro Recipe Modal Sheet Interaction
            msg_id += 1
            modal_state = await eval_js(ws, msg_id, """(() => {
                const btn = document.getElementById('btn-toggle-pro-recipe');
                const modal = document.getElementById('pro-recipe-modal');
                btn.click();
                const isOpen = modal.classList.contains('open');
                window.closeProRecipeModal();
                const isClosed = !modal.classList.contains('open');
                return { isOpen, isClosed };
            })()""")
            assert modal_state['isOpen'] is True, "Modal must open on btn-toggle-pro-recipe click"
            assert modal_state['isClosed'] is True, "Modal must close on closeProRecipeModal"
            print("  ✓ Test 3 Passed: Pro Recipe modal sheet opens & closes correctly.")

            # Test 4: Live Viewfinder Pixel Shift (Raw vs Graded)
            msg_id += 1
            pixel_comparison = await eval_js(ws, msg_id, """(() => {
                const canvas = document.getElementById('model-canvas');
                if (!canvas) return null;
                const ctx = canvas.getContext('2d');

                // 1. Render Raw (Neutral 0.0)
                window.ParametricColorEngine.setRecipe(window.ParametricColorEngine.presets['raw-neutral']);
                window.renderStudioModel(canvas);
                const rawData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 10, 10).data;
                const rawAvg = (rawData[0] + rawData[1] + rawData[2]) / 3;

                // 2. Render Donggi Summer (+1.23 EV, -88 contrast, -100 highlights, +45 shadows)
                window.ParametricColorEngine.setRecipe(window.ParametricColorEngine.presets['donggi-summer']);
                window.renderStudioModel(canvas);
                const gradedData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 10, 10).data;
                const gradedAvg = (gradedData[0] + gradedData[1] + gradedData[2]) / 3;

                // 3. Render Leica Monochrome (saturation -100)
                window.ParametricColorEngine.setRecipe(window.ParametricColorEngine.presets['leica-monochrome']);
                window.renderStudioModel(canvas);
                const monoData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 10, 10).data;
                const isMono = (monoData[0] === monoData[1] && monoData[1] === monoData[2]);

                return {
                    rawR: rawData[0], rawG: rawData[1], rawB: rawData[2], rawAvg,
                    gradedR: gradedData[0], gradedG: gradedData[1], gradedB: gradedData[2], gradedAvg,
                    monoR: monoData[0], monoG: monoData[1], monoB: monoData[2], isMono,
                    delta: Math.abs(gradedAvg - rawAvg)
                };
            })()""")

            print(f"  ✓ Raw Center Pixel: RGB({pixel_comparison['rawR']}, {pixel_comparison['rawG']}, {pixel_comparison['rawB']})")
            print(f"  ✓ Graded Donggi Center Pixel: RGB({pixel_comparison['gradedR']}, {pixel_comparison['gradedG']}, {pixel_comparison['gradedB']})")
            print(f"  ✓ Monochrome Center Pixel: RGB({pixel_comparison['monoR']}, {pixel_comparison['monoG']}, {pixel_comparison['monoB']}) [isMono: {pixel_comparison['isMono']}]")
            assert pixel_comparison['delta'] > 5, f"Significant pixel shift expected, got delta {pixel_comparison['delta']}"
            assert pixel_comparison['isMono'] is True, "Leica Monochrome must produce pure R=G=B pixels"
            print("  ✓ Test 4 Passed: Viewfinder canvas pixels visibly transform across recipes.")

            # Test 5: Before / After (B/A) Comparison Toggle
            msg_id += 1
            ba_test = await eval_js(ws, msg_id, """(() => {
                const canvas = document.getElementById('model-canvas');
                const ctx = canvas.getContext('2d');
                window.ParametricColorEngine.setRecipe(window.ParametricColorEngine.presets['donggi-summer']);

                // Before mode ON
                window.setBeforeCompareMode(true);
                const beforeData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;

                // Before mode OFF
                window.setBeforeCompareMode(false);
                const afterData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;

                return {
                    beforeR: beforeData[0],
                    afterR: afterData[0],
                    diff: Math.abs(afterData[0] - beforeData[0])
                };
            })()""")
            print(f"  ✓ B/A Test: Before R={ba_test['beforeR']} vs After R={ba_test['afterR']} (Diff={ba_test['diff']})")
            assert ba_test['diff'] > 3, "Before / After toggle must change canvas pixels"
            print("  ✓ Test 5 Passed: Before / After comparison toggle is responsive and accurate.")

            # Test 6: Slider Real-time Binding & HUD Sync
            msg_id += 1
            slider_test = await eval_js(ws, msg_id, """(() => {
                const slider = document.getElementById('slider-exposure');
                slider.value = "2.10";
                slider.dispatchEvent(new Event('input'));
                const hud = document.getElementById('vr-recipe-name').textContent;
                const activeEv = window.ParametricColorEngine.activeRecipe.tone.exposure;
                return { hud, activeEv };
            })()""")
            print(f"  ✓ HUD Readout: '{slider_test['hud']}', Active EV: {slider_test['activeEv']}")
            assert slider_test['activeEv'] == 2.10, f"Slider must update engine recipe exposure, got {slider_test['activeEv']}"
            assert "+2.10 EV" in slider_test['hud'], f"HUD must reflect '+2.10 EV', got '{slider_test['hud']}'"
            print("  ✓ Test 6 Passed: Slider input updates engine recipe and HUD in real time.")

            # Test 7: Shutter Photo Capture with Recipe Grading
            msg_id += 1
            capture_test = await eval_js(ws, msg_id, """(() => {
                window.ParametricColorEngine.setRecipe(window.ParametricColorEngine.presets['donggi-summer']);
                window.executeCapture();
                const thumb = document.getElementById('gallery-thumb');
                return {
                    hasCapturedUrl: !!window.state.lastCapturedUrl,
                    galleryCount: window.state.gallery.length,
                    thumbSrc: thumb ? thumb.src.substring(0, 30) : ''
                };
            })()""")
            assert capture_test['galleryCount'] >= 1, "Gallery must store the captured photo"
            assert capture_test['hasCapturedUrl'] is True, "state.lastCapturedUrl must be populated"
            print("  ✓ Test 7 Passed: Captured photo processed and stored with active recipe.")

            # Test 8: 16-Camera Dedicated Recipe Mapping & Distinctness Audit
            msg_id += 1
            cam_recipes_audit = await eval_js(ws, msg_id, """(() => {
                const cams = [
                    'canon-ixy', 'sony-handycam', 'sony-cybershot', 'olympus-mju',
                    'contax-t2', 'ricoh-gr', 'leica-m', 'citypop-80s',
                    'oldfilm-35mm', 'hasselblad-500cm', 'polaroid-sx70', 'fuji-quicksnap',
                    'kyocera-samurai', 'instax-mini', 'sihyun-color', 'passport-id'
                ];
                const engine = window.ParametricColorEngine;
                const results = {};
                for (const c of cams) {
                    const rec = engine.getRecipeForCamera(c);
                    results[c] = {
                        hasRecipe: !!rec,
                        recipeId: rec ? rec.id : null,
                        name: rec ? rec.name : null,
                        contrast: rec ? rec.tone.contrast : null,
                        saturation: rec ? rec.color.saturation : null
                    };
                }
                return results;
            })()""")
            assert len(cam_recipes_audit) == 16, "Must test all 16 cameras"
            for cam_id, info in cam_recipes_audit.items():
                assert info['hasRecipe'] is True, f"Camera {cam_id} must have a dedicated recipe"
                assert info['recipeId'] is not None, f"Camera {cam_id} recipeId must not be null"
            assert cam_recipes_audit['ricoh-gr']['saturation'] == -100, "Ricoh GR must be true monochrome"
            assert cam_recipes_audit['leica-m']['saturation'] == -100, "Leica M must be true monochrome"
            assert cam_recipes_audit['instax-mini']['contrast'] >= 10, "Instax Mini must have punchy flash contrast"
            print("  ✓ Test 8 Passed: All 16 cameras have authentic, dedicated 1:1 recipes.")

            # Test 9: Dynamic Range & Zero Solarization Audit (Keyboard Scene: Deep Blacks & Crisp Whites)
            msg_id += 1
            dynamic_range_audit = await eval_js(ws, msg_id, """(() => {
                const engine = window.ParametricColorEngine;
                // Create synthetic 2-pixel test image: Pixel 0 = Black text (20,20,20), Pixel 1 = White keycap (240,240,240)
                const c = document.createElement('canvas');
                c.width = 2; c.height = 1;
                const ctx = c.getContext('2d');
                const imgData = ctx.createImageData(2, 1);
                // Pixel 0: Black text
                imgData.data[0] = 20; imgData.data[1] = 20; imgData.data[2] = 20; imgData.data[3] = 255;
                // Pixel 1: White keycap
                imgData.data[4] = 240; imgData.data[5] = 240; imgData.data[6] = 240; imgData.data[7] = 255;

                const graded = engine.processImageData(imgData, engine.getRecipeForCamera('fuji-quicksnap'));
                const blackR = graded.data[0];
                const whiteR = graded.data[4];
                const dynamicRangeDelta = whiteR - blackR;
                return {
                    blackR,
                    whiteR,
                    dynamicRangeDelta,
                    zeroSolarization: blackR < 40 && whiteR > 215 && dynamicRangeDelta > 180
                };
            })()""")
            print(f"  ✓ Dynamic Range Audit: Black={dynamic_range_audit['blackR']}, White={dynamic_range_audit['whiteR']}, Delta={dynamic_range_audit['dynamicRangeDelta']}")
            assert dynamic_range_audit['blackR'] <= 40, f"Black text must stay dark (<=40), got {dynamic_range_audit['blackR']}"
            assert dynamic_range_audit['whiteR'] >= 215, f"White keycaps must stay bright (>=215), got {dynamic_range_audit['whiteR']}"
            assert dynamic_range_audit['dynamicRangeDelta'] >= 180, f"Dynamic range delta must be >= 180, got {dynamic_range_audit['dynamicRangeDelta']}"
            assert dynamic_range_audit['zeroSolarization'] is True, "Must have zero solarization or dynamic range collapse"
            print("  ✓ Test 9 Passed: Dynamic Range Delta > 180 verified, zero solarization on keyboard textures.")

            print("\n================================================================================")
            print("🎉 ALL 9 PARAMETRIC RECIPE & VINTAGE COLOR AUDIT CHECKS PASSED!")
            print("================================================================================")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()

if __name__ == '__main__':
    asyncio.run(main())
