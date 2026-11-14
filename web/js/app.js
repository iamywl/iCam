import { loadCanonicalCatalog, STOCK_BASELINE } from "./recipes.js";
import { WebGLFilterEngine } from "./webgl-filter-engine.js";
import { CameraController } from "./camera-controller.js";

const RATIOS = [
  { key: "3x4", label: "3:4", value: 3 / 4 },
  { key: "4x3", label: "4:3", value: 4 / 3 },
  { key: "16x9", label: "16:9", value: 16 / 9 }
];

const state = {
  catalog: null,
  activeId: "01_vintage_35mm",
  mode: "camera", // 'camera' | 'grid' | 'split'
  bypass: false,
  debugMask: 0,
  ratioIndex: 0,
  testImage: null, // HTMLCanvasElement or HTMLImageElement used for grid/split & fallback
  testImageSeed: 17,
  lastShotDataUrl: null,
  lastShotFilename: null,
  splitX: 0.5,
  splitLeftId: "stock",
  splitRightId: "01_vintage_35mm",
  blindEnabled: false,
  blindRevealed: false,
  blindPair: { left: "stock", right: "01_vintage_35mm" },
  ws: null
};

const els = {
  syncBadge: document.getElementById("syncBadge"),
  modeBtns: Array.from(document.querySelectorAll(".mode-btn")),
  panes: {
    camera: document.getElementById("cameraView"),
    grid: document.getElementById("gridView"),
    split: document.getElementById("splitView")
  },
  photoInput: document.getElementById("photoUploadInput"),
  recipeInput: document.getElementById("recipeUploadInput"),
  viewfinderFrame: document.getElementById("viewfinderFrame"),
  liveCanvas: document.getElementById("liveCanvas"),
  activeShortTag: document.getElementById("activeShortTag"),
  activeMoodLabel: document.getElementById("activeMoodLabel"),
  aspectRatioBtn: document.getElementById("aspectRatioBtn"),
  bypassHoldBtn: document.getElementById("bypassHoldBtn"),
  flipLensBtn: document.getElementById("flipLensBtn"),
  debugMaskSelect: document.getElementById("debugMaskSelect"),
  filmDial: document.getElementById("filmDial"),
  lastShotThumbBtn: document.getElementById("lastShotThumbBtn"),
  lastShotThumbImg: document.getElementById("lastShotThumbImg"),
  lastShotEmpty: document.getElementById("lastShotEmpty"),
  shutterBtn: document.getElementById("shutterBtn"),
  downloadShotBtn: document.getElementById("downloadShotBtn"),
  pushMacBtn: document.getElementById("pushMacBtn"),
  contactGrid: document.getElementById("contactGrid"),
  splitPickers: document.getElementById("splitPickers"),
  splitLeftSelect: document.getElementById("splitLeftSelect"),
  splitRightSelect: document.getElementById("splitRightSelect"),
  blindStatusBar: document.getElementById("blindStatusBar"),
  blindAnswerText: document.getElementById("blindAnswerText"),
  blindRevealBtn: document.getElementById("blindRevealBtn"),
  blindToggleBtn: document.getElementById("blindToggleBtn"),
  splitStage: document.getElementById("splitStage"),
  splitCanvas: document.getElementById("splitCanvas"),
  splitDivider: document.getElementById("splitDivider"),
  splitLeftCaption: document.getElementById("splitLeftCaption"),
  splitRightCaption: document.getElementById("splitRightCaption"),
  cameraVideo: document.getElementById("cameraVideo"),
  statusBar: document.getElementById("statusBar")
};

let liveEngine = null;
let offscreenEngine = null;
let splitEngine = null;
let cameraCtrl = null;
let rafId = null;

function setStatus(msg) {
  els.statusBar.textContent = msg;
}

function getRecipeById(id) {
  if (id === "stock" || id === "00_stock_original") return STOCK_BASELINE;
  return state.catalog.aesthetics.find((a) => a.id === id) || state.catalog.aesthetics[0] || STOCK_BASELINE;
}

function getEffectiveActiveRecipe() {
  return state.bypass ? STOCK_BASELINE : getRecipeById(state.activeId);
}

// Synthetic studio calibration portrait so Grid/Split/Preview work instantaneously even without camera
function createCalibrationFallbackCanvas(w = 720, h = 960) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const cx = w * 0.48;
  const cy = h * 0.44;
  const faceRx = w * 0.18;
  const faceRy = h * 0.175;

  for (let y = 0; y < h; y++) {
    const fy = y / h;
    for (let x = 0; x < w; x++) {
      const fx = x / w;
      let r, g, b;

      if (fy < 0.48) {
        const sg = fy / 0.48;
        r = 82 + 48 * sg;
        g = 148 + 42 * sg;
        b = 224 + 22 * (1 - sg);
        const treeD = Math.hypot((fx - 0.84) * 1.4, fy - 0.24);
        if (treeD < 0.30) {
          const leaf = Math.sin(fx * 90) * Math.cos(fy * 105) * 18;
          r = Math.max(25, 58 + leaf);
          g = Math.max(45, 134 + leaf * 1.2);
          b = Math.max(20, 56 + leaf * 0.7);
        }
      } else {
        const shade = 1.0 - (fy - 0.48) * 0.45;
        r = 24 * shade;
        g = 28 * shade;
        b = 34 * shade;
      }

      const lamps = [[0.76, 0.58, 0.015], [0.85, 0.64, 0.012], [0.15, 0.60, 0.013]];
      for (const [lx, ly, rad] of lamps) {
        const dist = Math.hypot((fx - lx) * (w / h), fy - ly);
        if (dist < rad * 3.0) {
          const core = Math.exp(-(dist * dist) / (2 * rad * rad * 0.42));
          r = Math.min(255, r + 250 * core);
          g = Math.min(255, g + 244 * core);
          b = Math.min(255, b + 226 * core);
        }
      }

      const dxF = (x - cx) / faceRx;
      const dyBody = (y - (cy + faceRy * 1.35)) / (faceRy * 0.95);
      if (dxF * dxF * 0.36 + dyBody * dyBody < 1.0) {
        const fold = Math.sin(fx * 28.0) * 6.0;
        r = 238 + fold;
        g = 238 + fold;
        b = 238 + fold;
      }

      const dyF = (y - cy) / faceRy;
      if (dxF * dxF + dyF * dyF < 1.0 || (Math.abs(dxF) < 0.35 && y > cy && y < cy + faceRy * 1.2)) {
        const sm = Math.max(0, Math.min(1, 0.74 - dxF * 0.28 - dyF * 0.14));
        r = 126 + (222 - 126) * sm;
        g = 90 + (174 - 90) * sm;
        b = 74 + (146 - 74) * sm;
        const cheek = Math.exp(-((dxF + 0.18) ** 2 + (dyF - 0.1) ** 2) / 0.12);
        r = Math.min(255, r + 10 * cheek);
        g = Math.min(255, g + 2 * cheek);
        if (dyF < -0.52) {
          r *= 0.22; g *= 0.19; b *= 0.18;
        }
      }

      const i = (y * w + x) * 4;
      d[i] = Math.max(0, Math.min(255, r));
      d[i + 1] = Math.max(0, Math.min(255, g));
      d[i + 2] = Math.max(0, Math.min(255, b));
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function buildFilmDialAndSelectors() {
  els.filmDial.innerHTML = "";
  const items = [{ id: "stock", shortLabel: "00 STOCK", moodCue: "Unmodified Reference" }, ...state.catalog.aesthetics];

  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dial-pill" + ((item.id === "stock" ? state.bypass : (!state.bypass && state.activeId === item.id)) ? " active" : "");
    btn.textContent = item.shortLabel;
    btn.addEventListener("click", () => {
      if (item.id === "stock") {
        state.bypass = true;
      } else {
        state.bypass = false;
        state.activeId = item.id;
        state.splitRightId = item.id;
        els.splitRightSelect.value = item.id;
      }
      refreshActiveUI();
    });
    els.filmDial.appendChild(btn);
  });

  const fillSelect = (sel, selected) => {
    sel.innerHTML = "";
    items.forEach((it) => {
      const opt = document.createElement("option");
      opt.value = it.id;
      opt.textContent = it.shortLabel;
      sel.appendChild(opt);
    });
    sel.value = selected;
  };
  fillSelect(els.splitLeftSelect, state.splitLeftId);
  fillSelect(els.splitRightSelect, state.splitRightId);
}

function refreshActiveUI() {
  const active = getEffectiveActiveRecipe();
  els.activeShortTag.textContent = state.bypass ? "00 STOCK (BYPASS)" : active.shortLabel;
  els.activeMoodLabel.textContent = state.bypass ? "Original Unfiltered" : active.moodCue;
  els.bypassHoldBtn.classList.toggle("active", state.bypass);

  Array.from(els.filmDial.children).forEach((btn, idx) => {
    const isStock = idx === 0;
    const rec = isStock ? null : state.catalog.aesthetics[idx - 1];
    const selected = isStock ? state.bypass : (!state.bypass && rec && rec.id === state.activeId);
    btn.classList.toggle("active", Boolean(selected));
  });

  if (state.mode === "split") {
    renderSplitView();
  }
  if (!cameraCtrl?.isActive && state.mode === "camera") {
    renderLiveFrameOnce();
  }
}

function setMode(mode) {
  state.mode = mode;
  els.modeBtns.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
  Object.entries(els.panes).forEach(([k, pane]) => pane.classList.toggle("active", k === mode));

  if (mode === "grid") {
    renderContactGrid();
  } else if (mode === "split") {
    renderSplitView();
  } else {
    if (!cameraCtrl.isActive) {
      renderLiveFrameOnce();
    }
  }
}

function renderLiveFrameOnce() {
  if (!liveEngine) return;
  const source = cameraCtrl?.isActive && els.cameraVideo.readyState >= 2 ? els.cameraVideo : state.testImage;
  if (!source) return;

  const srcW = source.videoWidth || source.width;
  const srcH = source.videoHeight || source.height;
  if (!srcW || !srcH) return;

  // Render preview scaled sensibly up to 1280px long edge for crisp 60fps
  const scale = Math.min(1.0, 1280 / Math.max(srcW, srcH));
  const outW = Math.max(2, Math.round(srcW * scale));
  const outH = Math.max(2, Math.round(srcH * scale));

  liveEngine.render(source, getEffectiveActiveRecipe(), {
    width: outW,
    height: outH,
    seed: state.testImageSeed,
    debugMaskMode: state.debugMask,
    mirrorX: cameraCtrl?.isActive ? cameraCtrl.shouldMirror : false
  });
}

function startRenderLoop() {
  const tick = () => {
    if (state.mode === "camera" && cameraCtrl?.isActive && els.cameraVideo.readyState >= 2) {
      renderLiveFrameOnce();
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function renderContactGrid() {
  if (!offscreenEngine || !state.testImage) return;
  const src = state.testImage;
  const srcW = src.width || src.naturalWidth || 720;
  const srcH = src.height || src.naturalHeight || 960;
  const scale = Math.min(1.0, 420 / Math.max(srcW, srcH));
  const tw = Math.max(2, Math.round(srcW * scale));
  const th = Math.max(2, Math.round(srcH * scale));

  els.contactGrid.innerHTML = "";
  const items = [STOCK_BASELINE, ...state.catalog.aesthetics];

  items.forEach((recipe, idx) => {
    offscreenEngine.render(src, recipe, {
      width: tw,
      height: th,
      seed: state.testImageSeed,
      debugMaskMode: state.debugMask
    });
    const dataUrl = offscreenEngine.canvas.toDataURL("image/jpeg", 0.92);

    const card = document.createElement("div");
    card.className = "grid-card" + ((idx === 0 ? state.bypass : (!state.bypass && state.activeId === recipe.id)) ? " active" : "");

    const frame = document.createElement("div");
    frame.className = "grid-frame";
    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = recipe.shortLabel;
    frame.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "grid-meta";
    const tag = document.createElement("span");
    tag.className = "mono-tag";
    tag.textContent = recipe.shortLabel;
    const cue = document.createElement("span");
    cue.className = "mood-label";
    cue.textContent = recipe.moodCue;
    meta.append(tag, cue);

    card.append(frame, meta);
    card.addEventListener("click", () => {
      if (idx === 0) {
        state.bypass = true;
      } else {
        state.bypass = false;
        state.activeId = recipe.id;
        state.splitRightId = recipe.id;
        els.splitRightSelect.value = recipe.id;
      }
      refreshActiveUI();
      renderContactGrid();
    });
    card.addEventListener("dblclick", () => {
      if (idx > 0) {
        state.bypass = false;
        state.activeId = recipe.id;
        state.splitLeftId = "stock";
        state.splitRightId = recipe.id;
        setMode("split");
      }
    });
    els.contactGrid.appendChild(card);
  });
}

function renderSplitView() {
  if (!splitEngine || !state.testImage) return;
  const src = state.testImage;
  const srcW = src.width || src.naturalWidth || 720;
  const srcH = src.height || src.naturalHeight || 960;
  const scale = Math.min(1.0, 1120 / Math.max(srcW, srcH));
  const outW = Math.max(2, Math.round(srcW * scale));
  const outH = Math.max(2, Math.round(srcH * scale));
  els.splitStage.style.aspectRatio = `${outW} / ${outH}`;

  const leftId = state.blindEnabled ? state.blindPair.left : state.splitLeftId;
  const rightId = state.blindEnabled ? state.blindPair.right : state.splitRightId;
  const splitPx = Math.max(1, Math.min(outW - 1, Math.round(outW * state.splitX)));

  splitEngine.render(src, getRecipeById(leftId), {
    width: outW,
    height: outH,
    seed: state.testImageSeed,
    debugMaskMode: state.debugMask,
    scissor: { x: 0, y: 0, w: splitPx, h: outH }
  });

  splitEngine.render(src, getRecipeById(rightId), {
    width: outW,
    height: outH,
    seed: state.testImageSeed,
    debugMaskMode: state.debugMask,
    scissor: { x: splitPx, y: 0, w: outW - splitPx, h: outH }
  });

  els.splitDivider.style.left = `${(state.splitX * 100).toFixed(2)}%`;

  if (state.blindEnabled && !state.blindRevealed) {
    els.splitLeftCaption.textContent = "SAMPLE A";
    els.splitRightCaption.textContent = "SAMPLE B";
    els.blindAnswerText.textContent = "Compare A vs B — Which feels richer?";
    els.blindRevealBtn.textContent = "Reveal";
  } else {
    els.splitLeftCaption.textContent = getRecipeById(leftId).shortLabel;
    els.splitRightCaption.textContent = getRecipeById(rightId).shortLabel;
    if (state.blindEnabled) {
      els.blindAnswerText.textContent = `${getRecipeById(leftId).shortLabel}  |  ${getRecipeById(rightId).shortLabel}`;
      els.blindRevealBtn.textContent = "New Pair";
    }
  }
}

function captureStillFromViewfinder() {
  if (!offscreenEngine) return;
  const source = cameraCtrl?.isActive && els.cameraVideo.readyState >= 2 ? els.cameraVideo : state.testImage;
  if (!source) return;

  const srcW = source.videoWidth || source.width;
  const srcH = source.videoHeight || source.height;
  const active = getEffectiveActiveRecipe();
  const stamp = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
  const filename = `FilterLab_${active.id}_${stamp}.jpg`;

  offscreenEngine.render(source, active, {
    width: srcW,
    height: srcH,
    seed: Date.now() % 10000,
    debugMaskMode: state.debugMask,
    mirrorX: cameraCtrl?.isActive ? cameraCtrl.shouldMirror : false
  });

  const dataUrl = offscreenEngine.canvas.toDataURL("image/jpeg", 0.94);
  state.lastShotDataUrl = dataUrl;
  state.lastShotFilename = filename;
  els.lastShotThumbImg.src = dataUrl;
  els.lastShotThumbImg.classList.add("ready");
  els.lastShotEmpty.style.display = "none";
  els.downloadShotBtn.disabled = false;

  // Also grab unfiltered frame into testImage so user can immediately inspect it in 3x3 Grid & Split!
  const rawCanvas = document.createElement("canvas");
  rawCanvas.width = srcW;
  rawCanvas.height = srcH;
  const rctx = rawCanvas.getContext("2d");
  if (cameraCtrl?.isActive && cameraCtrl.shouldMirror) {
    rctx.translate(srcW, 0);
    rctx.scale(-1, 1);
  }
  rctx.drawImage(source, 0, 0, srcW, srcH);
  state.testImage = rawCanvas;
  state.testImageSeed = Math.floor(Math.random() * 9000) + 1;

  if (state.ws && state.ws.readyState === WebSocket.OPEN) {
    els.pushMacBtn.hidden = false;
  }
  setStatus(`Captured ${filename} (${srcW}×${srcH}) — Ready to save or inspect in 3×3 Grid`);
}

function loadPhotoFile(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const maxEdge = 1600;
    const scale = Math.min(1.0, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(2, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(2, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    state.testImage = canvas;
    state.testImageSeed = Math.floor(Math.random() * 9000) + 1;
    setStatus(`Loaded test photo: ${file.name} (${img.naturalWidth}×${img.naturalHeight})`);
    if (state.mode === "grid") renderContactGrid();
    else if (state.mode === "split") renderSplitView();
    else if (!cameraCtrl?.isActive) renderLiveFrameOnce();
  };
  img.src = url;
}

function connectLiveSyncIfRequested() {
  const params = new URLSearchParams(window.location.search);
  const syncUrl = params.get("sync");
  if (!syncUrl) return;

  try {
    const ws = new WebSocket(syncUrl);
    state.ws = ws;
    els.syncBadge.textContent = "SYNCING…";

    ws.onopen = () => {
      els.syncBadge.textContent = "MAC LIVE SYNC";
      els.syncBadge.classList.add("live");
      setStatus(`Connected to Mac FilterLab live bridge (${syncUrl})`);
      if (state.lastShotDataUrl) {
        els.pushMacBtn.hidden = false;
      }
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "syncCatalog" && msg.catalog && Array.isArray(msg.catalog.aesthetics)) {
          state.catalog = msg.catalog;
          if (msg.activeId) state.activeId = msg.activeId;
          if (msg.compareLeftId) state.splitLeftId = msg.compareLeftId;
          if (msg.compareRightId) state.splitRightId = msg.compareRightId;
          buildFilmDialAndSelectors();
          refreshActiveUI();
          if (state.mode === "grid") renderContactGrid();
        }
      } catch {
        // Ignore non-JSON frame
      }
    };

    ws.onclose = () => {
      els.syncBadge.textContent = "STANDALONE";
      els.syncBadge.classList.remove("live");
      els.pushMacBtn.hidden = true;
    };
  } catch {
    // Fallback quietly to standalone
  }
}

async function init() {
  state.catalog = await loadCanonicalCatalog();
  state.testImage = createCalibrationFallbackCanvas(720, 960);

  liveEngine = new WebGLFilterEngine(els.liveCanvas);
  const offCanvas = document.createElement("canvas");
  offscreenEngine = new WebGLFilterEngine(offCanvas);
  splitEngine = new WebGLFilterEngine(els.splitCanvas);

  buildFilmDialAndSelectors();
  refreshActiveUI();

  cameraCtrl = new CameraController(els.cameraVideo);
  const camStarted = await cameraCtrl.start();
  if (camStarted) {
    setStatus("WebGL2 Live Optical Camera active · 1:1 parity with Mac Metal Engine");
  } else {
    renderLiveFrameOnce();
    setStatus(cameraCtrl.error || "Using Studio Calibration sample — Open Photo or allow camera access");
  }

  startRenderLoop();
  connectLiveSyncIfRequested();

  // Wire UI Events
  els.modeBtns.forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.mode)));

  els.aspectRatioBtn.addEventListener("click", () => {
    state.ratioIndex = (state.ratioIndex + 1) % RATIOS.length;
    const r = RATIOS[state.ratioIndex];
    els.aspectRatioBtn.textContent = r.label;
    els.viewfinderFrame.className = `viewfinder-frame ratio-${r.key}`;
  });

  els.flipLensBtn.addEventListener("click", async () => {
    await cameraCtrl.flipLens();
  });

  const setBypass = (val) => {
    state.bypass = val;
    refreshActiveUI();
  };
  els.bypassHoldBtn.addEventListener("pointerdown", () => setBypass(true));
  els.bypassHoldBtn.addEventListener("pointerup", () => setBypass(false));
  els.bypassHoldBtn.addEventListener("pointerleave", () => {
    if (state.bypass && els.bypassHoldBtn.matches(":active")) setBypass(false);
  });

  els.debugMaskSelect.addEventListener("change", (e) => {
    state.debugMask = parseInt(e.target.value, 10) || 0;
    refreshActiveUI();
    if (state.mode === "grid") renderContactGrid();
  });

  els.shutterBtn.addEventListener("click", captureStillFromViewfinder);

  els.lastShotThumbBtn.addEventListener("click", () => {
    setMode("grid");
  });

  els.downloadShotBtn.addEventListener("click", () => {
    if (!state.lastShotDataUrl) return;
    const a = document.createElement("a");
    a.href = state.lastShotDataUrl;
    a.download = state.lastShotFilename || "FilterLab_Capture.jpg";
    a.click();
  });

  els.pushMacBtn.addEventListener("click", () => {
    if (state.ws && state.ws.readyState === WebSocket.OPEN && state.lastShotDataUrl) {
      state.ws.send(JSON.stringify({
        type: "snapshot",
        filename: state.lastShotFilename || "WebCam_Capture.jpg",
        dataUrl: state.lastShotDataUrl
      }));
      setStatus("Sent captured photo to Mac FilterLab workbench!");
    }
  });

  els.photoInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) loadPhotoFile(file);
    e.target.value = "";
  });

  els.recipeInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed && Array.isArray(parsed.aesthetics) && parsed.aesthetics.length > 0) {
        state.catalog = parsed;
        buildFilmDialAndSelectors();
        refreshActiveUI();
        if (state.mode === "grid") renderContactGrid();
        setStatus(`Imported custom recipes from ${file.name}`);
      }
    } catch (err) {
      setStatus(`JSON parse error: ${err.message}`);
    }
    e.target.value = "";
  });

  // Split controls & Blind A/B
  els.splitLeftSelect.addEventListener("change", (e) => {
    state.splitLeftId = e.target.value;
    renderSplitView();
  });
  els.splitRightSelect.addEventListener("change", (e) => {
    state.splitRightId = e.target.value;
    renderSplitView();
  });

  const randomizeBlind = () => {
    state.blindRevealed = false;
    state.blindPair = Math.random() < 0.5
      ? { left: "stock", right: state.activeId }
      : { left: state.activeId, right: "stock" };
    renderSplitView();
  };

  els.blindToggleBtn.addEventListener("click", () => {
    state.blindEnabled = !state.blindEnabled;
    els.blindToggleBtn.classList.toggle("active", state.blindEnabled);
    els.splitPickers.hidden = state.blindEnabled;
    els.blindStatusBar.hidden = !state.blindEnabled;
    if (state.blindEnabled) {
      randomizeBlind();
    } else {
      renderSplitView();
    }
  });

  els.blindRevealBtn.addEventListener("click", () => {
    if (!state.blindRevealed) {
      state.blindRevealed = true;
      renderSplitView();
    } else {
      randomizeBlind();
    }
  });

  let draggingSplit = false;
  const updateSplitFromPointer = (ev) => {
    const rect = els.splitStage.getBoundingClientRect();
    if (rect.width <= 0) return;
    state.splitX = Math.max(0.03, Math.min(0.97, (ev.clientX - rect.left) / rect.width));
    renderSplitView();
  };
  els.splitStage.addEventListener("pointerdown", (ev) => {
    draggingSplit = true;
    els.splitStage.setPointerCapture(ev.pointerId);
    updateSplitFromPointer(ev);
  });
  els.splitStage.addEventListener("pointermove", (ev) => {
    if (draggingSplit) updateSplitFromPointer(ev);
  });
  els.splitStage.addEventListener("pointerup", () => { draggingSplit = false; });

  // Keyboard shortcuts (0 = Bypass, 1..8 = Aesthetics, Space = Capture or Toggle)
  window.addEventListener("keydown", (ev) => {
    if (ev.target && (ev.target.tagName === "INPUT" || ev.target.tagName === "SELECT")) return;
    if (ev.key === "0") {
      state.bypass = !state.bypass;
      refreshActiveUI();
    } else if (/^[1-8]$/.test(ev.key)) {
      const idx = parseInt(ev.key, 10) - 1;
      const target = state.catalog.aesthetics[idx];
      if (target) {
        state.bypass = false;
        state.activeId = target.id;
        state.splitRightId = target.id;
        refreshActiveUI();
      }
    }
  });
}

init().catch((err) => {
  setStatus(`Initialization error: ${err.message}`);
});
