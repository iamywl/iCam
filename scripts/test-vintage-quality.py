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
    debug_port = 9492
    chrome_candidates = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ]
    chrome_path = next((p for p in chrome_candidates if os.path.exists(p)), 'google-chrome')
    user_data_dir = tempfile.mkdtemp(prefix='icam_vintage_qa_')

    proc = subprocess.Popen([
        chrome_path,
        '--headless=new',
        f'--remote-debugging-port={debug_port}',
        f'--user-data-dir={user_data_dir}',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=393,852'
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
                    return msg.get('result', {})

        await cdp('Page.enable')
        await cdp('DOM.enable')
        await cdp('Runtime.enable')

        url = 'http://localhost:8080/index.html'
        await cdp('Page.navigate', {'url': url})
        await asyncio.sleep(2.0)

        results = []

        # =====================================================================
        # TEST 1: Optical Viewfinder Purity & Anti-Redundancy (ERR-012)
        # =====================================================================
        eval_purity = await cdp('Runtime.evaluate', {
            'expression': '''(() => {
                const stepper = document.getElementById('vf-filter-stepper');
                const rfHud = document.getElementById('rangefinder-hud');
                
                const stepperHidden = !stepper || window.getComputedStyle(stepper).display === 'none';
                const rfHudHidden = !rfHud || window.getComputedStyle(rfHud).display === 'none';
                
                // Check redundancy for active camera
                const badgeTitle = document.getElementById('cam-badge-title')?.textContent || '';
                const badgeSub = document.getElementById('cam-badge-sub')?.textContent || '';
                const activeFilterChipName = document.querySelector('.control-drawer .mode-control-panel.active .filter-chip.active .filter-chip-name')?.textContent || '';
                
                const isRedundant = (badgeSub === activeFilterChipName) && activeFilterChipName.length > 0;
                
                return {
                    stepperHidden,
                    rfHudHidden,
                    badgeTitle,
                    badgeSub,
                    activeFilterChipName,
                    isRedundant
                };
            })()''',
            'returnByValue': True
        })
        purity_val = eval_purity.get('result', {}).get('value', {})
        results.append({
            'test': 'Viewfinder HUD Purity & Zero Redundancy',
            'pass': purity_val.get('stepperHidden') and purity_val.get('rfHudHidden') and not purity_val.get('isRedundant'),
            'details': purity_val
        })

        # =====================================================================
        # TEST 2: Filter Chip Text Truncation Check Across Mobile Viewport (ERR-012)
        # =====================================================================
        eval_truncation = await cdp('Runtime.evaluate', {
            'expression': '''(() => {
                const chips = Array.from(document.querySelectorAll('.control-drawer .filter-chip-name'));
                const truncated = chips.filter(el => {
                    const text = el.textContent.trim();
                    return text.includes('...') || text.includes('…');
                }).map(el => el.textContent.trim());
                
                return {
                    totalChips: chips.length,
                    truncatedCount: truncated.length,
                    truncatedList: truncated
                };
            })()''',
            'returnByValue': True
        })
        trunc_val = eval_truncation.get('result', {}).get('value', {})
        results.append({
            'test': 'No Filter Chip Text Truncation',
            'pass': trunc_val.get('truncatedCount') == 0,
            'details': trunc_val
        })

        # =====================================================================
        # TEST 3: Instant Film Ejection & Chemical Development Engine (ERR-013)
        # =====================================================================
        eval_instant_instax = await cdp('Runtime.evaluate', {
            'expression': '''(() => {
                // Switch to Instax Mini
                if (typeof switchCamera === 'function') {
                    switchCamera('instax-mini');
                }
                
                const dummyRecord = {
                    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
                    timestamp: new Date().toISOString()
                };
                
                window.triggerInstantFilmEjection(dummyRecord, 'instax-mini');
                
                const overlay = document.getElementById('instant-ejection-overlay');
                const card = document.getElementById('instant-film-card');
                const photo = document.getElementById('instant-film-photo');
                const mask = document.getElementById('instant-emulsion-mask');
                const badge = document.getElementById('instant-card-badge');
                
                const hasOverlay = overlay && overlay.classList.contains('active');
                const hasEjecting = card && card.classList.contains('ejecting');
                const photoSrcSet = photo && photo.src.startsWith('data:');
                const hasMask = !!mask;
                const badgeText = badge ? badge.textContent : '';
                
                return {
                    hasOverlay,
                    hasEjecting,
                    photoSrcSet,
                    hasMask,
                    badgeText
                };
            })()''',
            'returnByValue': True
        })
        instax_val = eval_instant_instax.get('result', {}).get('value', {})
        results.append({
            'test': 'Instax Mini Instant Film Ejection Overlay & Chemical Mask',
            'pass': instax_val.get('hasOverlay') and instax_val.get('hasEjecting') and instax_val.get('photoSrcSet') and instax_val.get('hasMask') and 'instax' in instax_val.get('badgeText', '').lower(),
            'details': instax_val
        })

        # Test Polaroid SX-70 mode
        eval_instant_polaroid = await cdp('Runtime.evaluate', {
            'expression': '''(() => {
                const dummyRecord = {
                    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
                    timestamp: new Date().toISOString()
                };
                
                window.triggerInstantFilmEjection(dummyRecord, 'polaroid-sx70');
                
                const overlay = document.getElementById('instant-ejection-overlay');
                const badge = document.getElementById('instant-card-badge');
                const isPolaroidMode = overlay && overlay.classList.contains('polaroid-mode');
                const badgeText = badge ? badge.textContent : '';
                
                // Dismiss overlay
                document.getElementById('btn-instant-dismiss')?.click();
                
                return {
                    isPolaroidMode,
                    badgeText,
                    overlayDismissed: !overlay.classList.contains('active')
                };
            })()''',
            'returnByValue': True
        })
        polaroid_val = eval_instant_polaroid.get('result', {}).get('value', {})
        results.append({
            'test': 'Polaroid SX-70 Instant Film Square Mode & Dismissal',
            'pass': polaroid_val.get('isPolaroidMode') and 'POLAROID' in polaroid_val.get('badgeText', '') and polaroid_val.get('overlayDismissed'),
            'details': polaroid_val
        })

        # =====================================================================
        # TEST 4: Mechanical Audio Synthesis Engine (ERR-013)
        # =====================================================================
        eval_sound = await cdp('Runtime.evaluate', {
            'expression': '''(() => {
                const hasSoundEngine = typeof soundEngine !== 'undefined' && soundEngine !== null;
                let instaxSoundOk = false;
                let sx70SoundOk = false;
                let quicksnapSoundOk = false;
                
                try {
                    soundEngine.playShutter('instax-mini');
                    instaxSoundOk = true;
                } catch (e) {}
                
                try {
                    soundEngine.playShutter('polaroid-sx70');
                    sx70SoundOk = true;
                } catch (e) {}
                
                try {
                    soundEngine.playRatchetWind();
                    quicksnapSoundOk = true;
                } catch (e) {}
                
                return {
                    hasSoundEngine,
                    instaxSoundOk,
                    sx70SoundOk,
                    quicksnapSoundOk
                };
            })()''',
            'returnByValue': True
        })
        sound_val = eval_sound.get('result', {}).get('value', {})
        results.append({
            'test': 'Mechanical Audio Engine Synthesis (Motor Whine & Ratchet Wind)',
            'pass': sound_val.get('hasSoundEngine') and sound_val.get('instaxSoundOk') and sound_val.get('sx70SoundOk') and sound_val.get('quicksnapSoundOk'),
            'details': sound_val
        })

        # =====================================================================
        # TEST 5: Scientific Spectral Color Engine Fidelity (ERR-013)
        # =====================================================================
        eval_spectral = await cdp('Runtime.evaluate', {
            'expression': '''(() => {
                const engine = window.FilmSpectralEngine;
                if (!engine) return { pass: false, error: 'FilmSpectralEngine not found' };
                
                const pKeys = Object.keys(engine.profiles);
                const instax = engine.getProfile('instax-mini');
                const sx70 = engine.getProfile('polaroid-sx70');
                
                const instaxHasHalation = !!(instax && instax.halation && instax.halation.threshold === 0.84);
                const sx70HasHalation = !!(sx70 && sx70.halation && sx70.halation.threshold === 0.82);
                
                // Test Canvas processing execution
                const testCanvas = document.createElement('canvas');
                testCanvas.width = 30;
                testCanvas.height = 30;
                const ctx = testCanvas.getContext('2d');
                ctx.fillStyle = '#ff8800';
                ctx.fillRect(0, 0, 30, 30);
                
                let processCanvasOk = false;
                try {
                    engine.processCanvas(testCanvas, 'instax-mini');
                    processCanvasOk = true;
                } catch (e) {}
                
                return {
                    profileCount: pKeys.length,
                    instaxHasHalation,
                    sx70HasHalation,
                    processCanvasOk
                };
            })()''',
            'returnByValue': True
        })
        spectral_val = eval_spectral.get('result', {}).get('value', {})
        results.append({
            'test': 'Spectral Color Engine Float32 Emulsion & Halation',
            'pass': spectral_val.get('profileCount', 0) >= 15 and spectral_val.get('instaxHasHalation') and spectral_val.get('sx70HasHalation') and spectral_val.get('processCanvasOk'),
            'details': spectral_val
        })

        # Print Test Summary
        all_passed = True
        print("\n" + "=" * 70)
        print(" VINTAGE CAMERA QUALITY & UX REGRESSION AUDIT (ERR-012, ERR-013)")
        print("=" * 70)
        for r in results:
            status_str = "PASS" if r['pass'] else "FAIL"
            print(f"[{status_str}] {r['test']}")
            print(f"       Details: {json.dumps(r['details'], ensure_ascii=False)}")
            if not r['pass']:
                all_passed = False
        print("=" * 70)
        print(f"Final Result: {'ALL TESTS PASSED (100%)' if all_passed else 'SOME TESTS FAILED'}")
        print("=" * 70 + "\n")

        if not all_passed:
            sys.exit(1)

    finally:
        try:
            proc.terminate()
            proc.wait(timeout=2)
        except Exception:
            pass

if __name__ == '__main__':
    asyncio.run(main())
