import asyncio
import json
import urllib.request
import subprocess
import tempfile
import os

async def check():
    port = 8080
    debug_port = 9456
    chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    user_data_dir = tempfile.mkdtemp(prefix='icam_qa_check_')
    proc = subprocess.Popen([
        chrome_path, "--headless=new", f"--remote-debugging-port={debug_port}",
        f"--user-data-dir={user_data_dir}",
        "--disable-gpu", "--no-sandbox", "--window-size=1920,1080",
        f"http://127.0.0.1:{port}/index.html"
    ])
    await asyncio.sleep(2.0)
    
    import websockets
    res = urllib.request.urlopen(f"http://127.0.0.1:{debug_port}/json").read()
    targets = json.loads(res.decode("utf-8"))
    page_target = next(t for t in targets if t.get("type") == "page")
    ws = await websockets.connect(page_target["webSocketDebuggerUrl"])
    
    tiers = ["device-se", "device-mini", "device-standard", "device-max"]
    for i, tier in enumerate(tiers):
        expr = f"""(() => {{
            const wrapper = document.querySelector(".device-wrapper");
            wrapper.className = "device-wrapper {tier}";
            const frame = document.querySelector(".iphone-frame").getBoundingClientRect();
            const elements = [
                ".camera-top-toolbar",
                ".camera-model-badge-container",
                ".viewfinder-container",
                ".control-drawer",
                ".camera-bottom-section",
                "#fimo-zoom-ruler-deck",
                "#fimo-hardware-bar",
                ".camera-category-bar",
                ".mode-dial-wrapper",
                ".shutter-row",
                "#shutter-btn"
            ];
            const rects = {{ frameHeight: Math.round(frame.height) }};
            elements.forEach(sel => {{
                const el = document.querySelector(sel);
                if (el) {{
                    const r = el.getBoundingClientRect();
                    rects[sel] = {{
                        top: Math.round(r.top - frame.top),
                        bottom: Math.round(r.bottom - frame.top),
                        height: Math.round(r.height),
                        visible: r.bottom <= frame.bottom
                    }};
                }}
            }});
            return rects;
        }})()"""
        msg = {"id": i+1, "method": "Runtime.evaluate", "params": {"expression": expr, "returnByValue": True}}
        await ws.send(json.dumps(msg))
        resp = json.loads(await ws.recv())
        val = resp["result"]["result"]["value"]
        fh = val["frameHeight"]
        print(f"=== {tier} (frame height: {fh}) ===")
        for k, v in val.items():
            if k != "frameHeight":
                top = v['top']
                bot = v['bottom']
                h = v['height']
                st = "OK" if v['visible'] else "OVERFLOW/CLIPPED!"
                print(f"  {k:30s}: top={top:3d}, bottom={bot:3d}, height={h:3d} [{st}]")
    
    proc.terminate()

if __name__ == '__main__':
    asyncio.run(check())
