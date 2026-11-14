import { STOCK_BASELINE, EMBEDDED_DEFAULT_CATALOG, loadCanonicalCatalog } from "./recipes.js";
import { WebGLFilterEngine } from "./webgl-filter-engine.js";
import { CameraController } from "./camera-controller.js";

const PREVIEW_MAX_EDGE = 1440;
const GRID_THUMB_MAX_EDGE = 420;
const FILMSTRIP_THUMB_EDGE = 96;
const SHEET_TILE_MAX_EDGE = 760;

const els = {
  syncBadge: document.getElementById("syncBadge"),
  photoMetaBadge: document.getElementById("photoMetaBadge"),
  modeBtns: Array.from(document.querySelectorAll(".mode-btn")),
  openPhotosBtn: document.getElementById("openPhotosBtn"),
  photoInput: document.getElementById("photoInput"),
  saveFullResBtn: document.getElementById("saveFullResBtn"),
  exportSheetBtn: document.getElementById("exportSheetBtn"),
  importJsonBtn: document.getElementById("importJsonBtn"),
  jsonInput: document.getElementById("jsonInput"),

  batchStrip: document.getElementById("batchStrip"),
  batchThumbList: document.getElementById("batchThumbList"),

  gridView: document.getElementById("gridView"),
  contactGrid: document.getElementById("contactGrid"),

  studioView: document.getElementById("studioView"),
  studioMat: document.querySelector(".studio-mat"),
  studioCanvas: document.getElementById("studioCanvas"),
  studioFilmDial: document.getElementById("studioFilmDial"),
  studioCodeTitle: document.getElementById("studioCodeTitle"),
  studioModifiedTag: document.getElementById("studioModifiedTag"),
  studioMoodSubtitle: document.getElementById("studioMoodSubtitle"),
  bypassBtn: document.getElementById("bypassBtn"),
  debugMaskSelect: document.getElementById("debugMaskSelect"),
  sliderIntensity: document.getElementById("sliderIntensity"),
  sliderExposure: document.getElementById("sliderExposure"),
  sliderTemp: document.getElementById("sliderTemp"),
  sliderContrast: document.getElementById("sliderContrast"),
  sliderGrain: document.getElementById("sliderGrain"),
  valIntensity: document.getElementById("valIntensity"),
  valExposure: document.getElementById("valExposure"),
  valTemp: document.getElementById("valTemp"),
  valContrast: document.getElementById("valContrast"),
  valGrain: document.getElementById("valGrain"),
  resetTuningBtn: document.getElementById("resetTuningBtn"),
  exportRecipeJsonBtn: document.getElementById("exportRecipeJsonBtn"),
  studioSaveBtn: document.getElementById("studioSaveBtn"),

  splitView: document.getElementById("splitView"),
  splitPickers: document.getElementById("splitPickers"),
  splitLeftSelect: document.getElementById("splitLeftSelect"),
  splitRightSelect: document.getElementById("splitRightSelect"),
  blindStatus: document.getElementById("blindStatus"),
  blindToggleBtn: document.getElementById("blindToggleBtn"),
  blindRevealBtn: document.getElementById("blindRevealBtn"),
  splitMat: document.querySelector(".split-mat"),
  splitStage: document.getElementById("splitStage"),
  splitCanvas: document.getElementById("splitCanvas"),
  splitDivider: document.getElementById("splitDivider"),
  splitLeftLabel: document.getElementById("splitLeftLabel"),
  splitRightLabel: document.getElementById("splitRightLabel"),

  cameraView: document.getElementById("cameraView"),
  viewfinderFrame: document.getElementById("viewfinderFrame"),
  cameraVideo: document.getElementById("cameraVideo"),
  liveCanvas: document.getElementById("liveCanvas"),
  cameraNotice: document.getElementById("cameraNotice"),
  cameraNoticeText: document.getElementById("cameraNoticeText"),
  cameraRetryBtn: document.getElementById("cameraRetryBtn"),
  camCodeLabel: document.getElementById("camCodeLabel"),
  camMoodLabel: document.getElementById("camMoodLabel"),
  ratioBtn: document.getElementById("ratioBtn"),
  flipBtn: document.getElementById("flipBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  cameraFilmDial: document.getElementById("cameraFilmDial"),
  shutterBtn: document.getElementById("shutterBtn"),
  camCaptureThumb: document.getElementById("camCaptureThumb"),
  lastThumbImg: document.getElementById("lastThumbImg"),
  lastThumbEmpty: document.getElementById("lastThumbEmpty"),
  openStudioFromCamBtn: document.getElementById("openStudioFromCamBtn"),

  dropOverlay: document.getElementById("dropOverlay"),
  statusBar: document.getElementById("statusBar")
};

const RATIOS = [
  { label: "3:4", className: "ratio-3x4", aspect: 3 / 4 },
  { label: "4:3", className: "ratio-4x3", aspect: 4 / 3 },
  { label: "16:9", className: "ratio-16x9", aspect: 16 / 9 }
];

const state = {
  catalog: structuredClone(EMBEDDED_DEFAULT_CATALOG),
  mode: "grid",
  activeId: "01_vintage_35mm",
  bypass: false,
  debugMask: 0,
  trims: {}, // recipeId -> { intensityPct, exposureDelta, tempSteps, contrastDelta, grainPct }

  photos: [], // array of { id, name, fullSource, fullWidth, fullHeight, previewCanvas, gridThumbCanvas, thumbUrl, objectUrl }
  activePhotoId: null,

  seedBase: 1337,
  splitX: 0.5,
  splitLeftId: "stock",
  splitRightId: "04_nocturne_cinema",
  blindEnabled: false,
  blindRevealed: false,
  blindPair: { left: "stock", right: "04_nocturne_cinema" },

  ratioIdx: 0,
  pausedLive: false,
  cameraStartedOnce: false,
  lastCapturedPhotoId: null,
  isExporting: false,
  dragDepth: 0
};

let studioEngine = null;
let splitEngine = null;
let liveEngine = null;
let gridThumbEngine = null;
let cameraCtrl = null;
let rafId = null;

function setStatus(msg) {
  els.statusBar.textContent = msg;
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function getDefaultTrim() {
  return {
    intensityPct: 100,
    exposureDelta: 0,
    tempSteps: 0,
    contrastDelta: 0,
    grainPct: 100
  };
}

function getTrim(id) {
  if (id === "stock" || id === "00_stock_original") return getDefaultTrim();
  if (!state.trims[id]) state.trims[id] = getDefaultTrim();
  return state.trims[id];
}

function isTrimModified(id) {
  const t = getTrim(id);
  return (
    t.intensityPct !== 100 ||
    Math.abs(t.exposureDelta) > 0.001 ||
    t.tempSteps !== 0 ||
    Math.abs(t.contrastDelta) > 0.001 ||
    t.grainPct !== 100
  );
}

function getRawRecipeById(id) {
  if (id === "stock" || id === "00_stock_original") return STOCK_BASELINE;
  return state.catalog.aesthetics.find((a) => a.id === id) || state.catalog.aesthetics[0] || STOCK_BASELINE;
}

function getTunedRecipeById(id) {
  const base = getRawRecipeById(id);
  if (base.id === STOCK_BASELINE.id) return base;
  const trim = getTrim(base.id);
  const tuned = structuredClone(base);
  tuned.intensity = clamp((base.intensity ?? 1.0) * (trim.intensityPct / 100), 0.0, 1.0);
  tuned.tone.exposureEV = clamp(tuned.tone.exposureEV + trim.exposureDelta, -2.5, 2.5);
  tuned.tone.wbTempShift = clamp(tuned.tone.wbTempShift + trim.tempSteps * 0.008, -0.5, 0.5);
  tuned.tone.midContrast = clamp(tuned.tone.midContrast + trim.contrastDelta, 0.55, 1.55);
  tuned.opticsAndGrain.grainAmount = clamp(tuned.opticsAndGrain.grainAmount * (trim.grainPct / 100), 0.0, 0.35);
  return tuned;
}

function getEffectiveActiveRecipe() {
  return state.bypass ? STOCK_BASELINE : getTunedRecipeById(state.activeId);
}

function getActivePhoto() {
  return state.photos.find((p) => p.id === state.activePhotoId) || state.photos[0];
}

// Synthetic studio calibration portrait so 3x3 Grid & Studio work offline immediately
function createCalibrationFallbackCanvas(w = 600, h = 800) {
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
      d[i] = clamp(r, 0, 255);
      d[i + 1] = clamp(g, 0, 255);
      d[i + 2] = clamp(b, 0, 255);
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function downsampleCanvasFromSource(src, maxEdge) {
  const srcW = src.naturalWidth || src.videoWidth || src.width;
  const srcH = src.naturalHeight || src.videoHeight || src.height;
  const scale = Math.min(1.0, maxEdge / Math.max(srcW, srcH));
  const outW = Math.max(2, Math.round(srcW * scale));
  const outH = Math.max(2, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, outW, outH);
  return canvas;
}

function makePhotoEntry({ id, name, fullSource, objectUrl = null, isSample = false }) {
  const fullWidth = fullSource.naturalWidth || fullSource.videoWidth || fullSource.width;
  const fullHeight = fullSource.naturalHeight || fullSource.videoHeight || fullSource.height;
  const previewCanvas = downsampleCanvasFromSource(fullSource, PREVIEW_MAX_EDGE);
  const gridThumbCanvas = downsampleCanvasFromSource(previewCanvas, GRID_THUMB_MAX_EDGE);
  const tinyCanvas = downsampleCanvasFromSource(gridThumbCanvas, FILMSTRIP_THUMB_EDGE);
  return {
    id,
    name,
    isSample,
    fullSource,
    fullWidth,
    fullHeight,
    previewCanvas,
    gridThumbCanvas,
    thumbUrl: tinyCanvas.toDataURL("image/jpeg", 0.8),
    objectUrl
  };
}

function initCalibrationSample() {
  const sampleCanvas = createCalibrationFallbackCanvas(600, 800);
  const entry = makePhotoEntry({
    id: "sample_calibration",
    name: "SAMPLE",
    fullSource: sampleCanvas,
    isSample: true
  });
  state.photos = [entry];
  state.activePhotoId = entry.id;
}

function fitAspectBox(matEl, targetEl, srcW, srcH, verticalReserve = 0) {
  if (!matEl || !targetEl || !srcW || !srcH) return;
  const cs = getComputedStyle(matEl);
  const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
  const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  const availW = Math.max(80, matEl.clientWidth - padX);
  const availH = Math.max(80, matEl.clientHeight - padY - verticalReserve);
  const scale = Math.min(availW / srcW, availH / srcH);
  targetEl.style.width = `${Math.max(40, Math.floor(srcW * scale))}px`;
  targetEl.style.height = `${Math.max(40, Math.floor(srcH * scale))}px`;
}

function syncStageGeometries() {
  const photo = getActivePhoto();
  if (!photo) return;
  fitAspectBox(els.studioMat, els.studioCanvas, photo.previewCanvas.width, photo.previewCanvas.height, 0);
  fitAspectBox(els.splitMat, els.splitStage, photo.previewCanvas.width, photo.previewCanvas.height, 26);
}

function buildDialButtons(dialEl) {
  dialEl.innerHTML = "";
  const all = [STOCK_BASELINE, ...state.catalog.aesthetics];
  for (const r of all) {
    const isStock = r.id === STOCK_BASELINE.id;
    const isActive = isStock ? state.bypass : (!state.bypass && state.activeId === r.id);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dial-pill" + (isActive ? " active" : "");
    btn.textContent = r.shortLabel;
    btn.addEventListener("click", () => {
      if (isStock) {
        state.bypass = true;
      } else {
        state.bypass = false;
        state.activeId = r.id;
      }
      refreshActiveUI();
    });
    dialEl.appendChild(btn);
  }
}

function buildFilmDialsAndSelectors() {
  buildDialButtons(els.studioFilmDial);
  buildDialButtons(els.cameraFilmDial);

  const prevLeft = els.splitLeftSelect.value || state.splitLeftId;
  const prevRight = els.splitRightSelect.value || state.splitRightId;
  els.splitLeftSelect.innerHTML = "";
  els.splitRightSelect.innerHTML = "";

  const all = [STOCK_BASELINE, ...state.catalog.aesthetics];
  for (const r of all) {
    const val = r.id === STOCK_BASELINE.id ? "stock" : r.id;
    const optL = document.createElement("option");
    optL.value = val;
    optL.textContent = r.shortLabel;
    els.splitLeftSelect.appendChild(optL);

    const optR = document.createElement("option");
    optR.value = val;
    optR.textContent = r.shortLabel;
    els.splitRightSelect.appendChild(optR);
  }
  els.splitLeftSelect.value = prevLeft;
  els.splitRightSelect.value = prevRight;
}

function syncStudioSlidersUI() {
  const recipe = getEffectiveActiveRecipe();
  const trim = getTrim(recipe.id);
  const disabled = recipe.id === STOCK_BASELINE.id;

  els.sliderIntensity.disabled = disabled;
  els.sliderExposure.disabled = disabled;
  els.sliderTemp.disabled = disabled;
  els.sliderContrast.disabled = disabled;
  els.sliderGrain.disabled = disabled;
  els.resetTuningBtn.disabled = disabled || !isTrimModified(recipe.id);

  els.sliderIntensity.value = String(trim.intensityPct);
  els.sliderExposure.value = String(trim.exposureDelta);
  els.sliderTemp.value = String(trim.tempSteps);
  els.sliderContrast.value = String(trim.contrastDelta);
  els.sliderGrain.value = String(trim.grainPct);

  els.valIntensity.textContent = `${trim.intensityPct}%`;
  const evSign = trim.exposureDelta > 0.001 ? "+" : "";
  els.valExposure.textContent = `${evSign}${trim.exposureDelta.toFixed(2)} EV`;
  const tempSign = trim.tempSteps > 0 ? "+" : "";
  els.valTemp.textContent = `${tempSign}${trim.tempSteps}`;
  const ctrSign = trim.contrastDelta > 0.001 ? "+" : "";
  els.valContrast.textContent = `${ctrSign}${trim.contrastDelta.toFixed(2)}`;
  els.valGrain.textContent = `${trim.grainPct}%`;

  els.studioModifiedTag.hidden = disabled || !isTrimModified(recipe.id);
  els.bypassBtn.classList.toggle("active", state.bypass);
  els.bypassBtn.setAttribute("aria-pressed", state.bypass ? "true" : "false");
  els.bypassBtn.textContent = state.bypass ? "Viewing Original (Stock)" : "Compare Original";
}

function refreshBatchStrip() {
  const hasUserPhotos = state.photos.some((p) => !p.isSample);
  els.batchStrip.hidden = !hasUserPhotos;
  els.batchThumbList.innerHTML = "";

  for (const photo of state.photos) {
    const item = document.createElement("div");
    item.className = "batch-item" + (photo.id === state.activePhotoId ? " active" : "");
    item.addEventListener("click", (ev) => {
      if (ev.target.closest(".batch-remove-btn")) return;
      selectPhoto(photo.id);
    });

    const img = document.createElement("img");
    img.className = "batch-thumb-img";
    img.src = photo.thumbUrl;
    img.alt = photo.name;

    const meta = document.createElement("div");
    meta.className = "batch-item-meta";
    const nameEl = document.createElement("span");
    nameEl.className = "batch-item-name";
    nameEl.textContent = photo.name;
    const dimsEl = document.createElement("span");
    dimsEl.className = "batch-item-dims";
    dimsEl.textContent = `${photo.fullWidth}×${photo.fullHeight}`;
    meta.append(nameEl, dimsEl);

    item.append(img, meta);

    if (!photo.isSample) {
      const rmBtn = document.createElement("button");
      rmBtn.type = "button";
      rmBtn.className = "batch-remove-btn";
      rmBtn.title = "Remove photo";
      rmBtn.textContent = "×";
      rmBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        removePhoto(photo.id);
      });
      item.appendChild(rmBtn);
    }

    els.batchThumbList.appendChild(item);
  }
}

function updatePhotoMetaBadge() {
  const photo = getActivePhoto();
  if (!photo) return;
  const label = photo.isSample ? "SAMPLE" : photo.name.replace(/\.[^.]+$/, "").slice(0, 14);
  els.photoMetaBadge.textContent = `${label} · ${photo.fullWidth}×${photo.fullHeight}`;
}

function refreshDialHighlight(dialEl) {
  const all = [STOCK_BASELINE, ...state.catalog.aesthetics];
  const pills = dialEl.querySelectorAll(".dial-pill");
  pills.forEach((p, idx) => {
    const rec = all[idx];
    if (!rec) return;
    const active = idx === 0 ? state.bypass : (!state.bypass && state.activeId === rec.id);
    p.classList.toggle("active", active);
  });
}

function refreshActiveUI() {
  const r = getEffectiveActiveRecipe();
  els.studioCodeTitle.textContent = r.shortLabel;
  els.studioMoodSubtitle.textContent = r.moodCue;
  els.camCodeLabel.textContent = r.shortLabel;
  els.camMoodLabel.textContent = r.moodCue;

  refreshDialHighlight(els.studioFilmDial);
  refreshDialHighlight(els.cameraFilmDial);
  syncStudioSlidersUI();
  updatePhotoMetaBadge();

  if (state.mode === "studio") renderStudioView();
  if (state.mode === "split") renderSplitView();
}

function selectPhoto(photoId) {
  state.activePhotoId = photoId;
  refreshBatchStrip();
  updatePhotoMetaBadge();
  syncStageGeometries();
  if (state.mode === "grid") renderContactGrid();
  if (state.mode === "studio") renderStudioView();
  if (state.mode === "split") renderSplitView();
}

function removePhoto(photoId) {
  const idx = state.photos.findIndex((p) => p.id === photoId);
  if (idx === -1) return;
  const [removed] = state.photos.splice(idx, 1);
  if (removed?.objectUrl) URL.revokeObjectURL(removed.objectUrl);
  if (state.activePhotoId === photoId) {
    const fallback = state.photos[Math.max(0, idx - 1)] || state.photos[0];
    state.activePhotoId = fallback ? fallback.id : null;
  }
  refreshBatchStrip();
  updatePhotoMetaBadge();
  syncStageGeometries();
  if (state.mode === "grid") renderContactGrid();
  if (state.mode === "studio") renderStudioView();
  if (state.mode === "split") renderSplitView();
}

function renderContactGrid() {
  const photo = getActivePhoto();
  if (!gridThumbEngine || !photo) return;
  const src = photo.gridThumbCanvas;
  els.contactGrid.innerHTML = "";
  const all = [STOCK_BASELINE, ...state.catalog.aesthetics];

  all.forEach((baseRecipe, idx) => {
    const recipe = idx === 0 ? STOCK_BASELINE : getTunedRecipeById(baseRecipe.id);
    gridThumbEngine.render(src, recipe, {
      width: src.width,
      height: src.height,
      seed: state.seedBase,
      debugMaskMode: state.debugMask
    });
    const dataUrl = gridThumbEngine.canvas.toDataURL("image/jpeg", 0.91);

    const card = document.createElement("div");
    card.className = "grid-card" + ((idx === 0 ? state.bypass : (!state.bypass && state.activeId === baseRecipe.id)) ? " active" : "");

    const frame = document.createElement("div");
    frame.className = "grid-frame";
    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = baseRecipe.shortLabel;
    frame.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "grid-meta";
    const tag = document.createElement("span");
    tag.className = "mono-tag";
    tag.textContent = baseRecipe.shortLabel;
    const cue = document.createElement("span");
    cue.className = "mood-label";
    cue.textContent = baseRecipe.moodCue;
    meta.append(tag, cue);

    card.append(frame, meta);
    card.addEventListener("click", () => {
      if (idx === 0) {
        state.bypass = true;
      } else {
        state.bypass = false;
        state.activeId = baseRecipe.id;
        state.splitRightId = baseRecipe.id;
        els.splitRightSelect.value = baseRecipe.id;
      }
      setMode("studio");
    });

    els.contactGrid.appendChild(card);
  });
}

function renderStudioView() {
  const photo = getActivePhoto();
  if (!studioEngine || !photo) return;
  const src = photo.previewCanvas;
  syncStageGeometries();
  studioEngine.render(src, getEffectiveActiveRecipe(), {
    width: src.width,
    height: src.height,
    seed: state.seedBase,
    debugMaskMode: state.debugMask
  });
}

function renderSplitView() {
  const photo = getActivePhoto();
  if (!splitEngine || !photo) return;
  const src = photo.previewCanvas;
  const outW = src.width;
  const outH = src.height;
  syncStageGeometries();

  const leftId = state.blindEnabled ? state.blindPair.left : state.splitLeftId;
  const rightId = state.blindEnabled ? state.blindPair.right : state.splitRightId;
  const splitPx = Math.max(1, Math.min(outW - 1, Math.round(outW * state.splitX)));

  splitEngine.render(src, getTunedRecipeById(leftId), {
    width: outW,
    height: outH,
    seed: state.seedBase,
    debugMaskMode: state.debugMask
  });

  splitEngine.render(src, getTunedRecipeById(rightId), {
    width: outW,
    height: outH,
    seed: state.seedBase,
    debugMaskMode: state.debugMask,
    scissor: { x: splitPx, y: 0, w: outW - splitPx, h: outH }
  });

  els.splitDivider.style.left = `${(state.splitX * 100).toFixed(2)}%`;

  if (state.blindEnabled && !state.blindRevealed) {
    els.splitLeftLabel.textContent = "A (BLIND)";
    els.splitRightLabel.textContent = "B (BLIND)";
  } else {
    els.splitLeftLabel.textContent = getRawRecipeById(leftId).shortLabel;
    els.splitRightLabel.textContent = getRawRecipeById(rightId).shortLabel;
  }
}

function triggerBlindAB() {
  state.blindEnabled = !state.blindEnabled;
  state.blindRevealed = false;

  if (state.blindEnabled) {
    const compareId = state.activeId || "04_nocturne_cinema";
    const swap = Math.random() >= 0.5;
    state.blindPair = swap ? { left: compareId, right: "stock" } : { left: "stock", right: compareId };
  }

  els.blindToggleBtn.classList.toggle("active", state.blindEnabled);
  els.splitPickers.hidden = state.blindEnabled;
  els.blindStatus.hidden = !state.blindEnabled;
  els.blindRevealBtn.hidden = !state.blindEnabled;
  els.blindRevealBtn.classList.remove("active");
  renderSplitView();
}

function setMode(mode) {
  const prevMode = state.mode;
  state.mode = mode;

  els.modeBtns.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
  els.gridView.classList.toggle("active", mode === "grid");
  els.studioView.classList.toggle("active", mode === "studio");
  els.splitView.classList.toggle("active", mode === "split");
  els.cameraView.classList.toggle("active", mode === "camera");

  if (prevMode === "camera" && mode !== "camera") {
    stopCameraSession();
  }

  if (mode === "grid") {
    renderContactGrid();
  } else if (mode === "studio") {
    refreshActiveUI();
  } else if (mode === "split") {
    renderSplitView();
  } else if (mode === "camera") {
    ensureCameraStarted();
  }
}

async function ensureCameraStarted() {
  if (!cameraCtrl) return;
  if (cameraCtrl.isActive) return;
  els.cameraNotice.hidden = true;
  setStatus("Starting opt-in viewfinder camera...");
  const ok = await cameraCtrl.start();
  if (ok) {
    state.cameraStartedOnce = true;
    setStatus("Camera viewfinder active.");
  } else {
    els.cameraNotice.hidden = false;
    els.cameraNoticeText.textContent = cameraCtrl.error || "Camera unavailable or permission denied.";
    setStatus("Camera permission denied or unavailable. You can still open/drop photos in 3×3 Grid & Studio.");
  }
}

function stopCameraSession() {
  if (cameraCtrl && cameraCtrl.isActive) {
    cameraCtrl.stop();
  }
}

function renderLiveLoop() {
  if (state.mode === "camera" && liveEngine && cameraCtrl && cameraCtrl.isActive && !state.pausedLive) {
    const v = els.cameraVideo;
    if (v.readyState >= 2 && v.videoWidth > 0) {
      const targetAspect = RATIOS[state.ratioIdx].aspect;
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      let outW = vw;
      let outH = Math.round(vw / targetAspect);
      if (outH > vh) {
        outH = vh;
        outW = Math.round(vh * targetAspect);
      }
      const scale = Math.min(1.0, 1280 / Math.max(outW, outH));
      liveEngine.render(v, getEffectiveActiveRecipe(), {
        width: Math.max(2, Math.round(outW * scale)),
        height: Math.max(2, Math.round(outH * scale)),
        seed: 42,
        debugMaskMode: state.debugMask,
        mirrorX: cameraCtrl.shouldMirror
      });
    }
  }
  rafId = requestAnimationFrame(renderLiveLoop);
}

function captureCameraToDarkroom() {
  if (!liveEngine || !cameraCtrl?.isActive) {
    setStatus("Enable camera first or drop a photo into the studio.");
    return;
  }
  const v = els.cameraVideo;
  const srcW = v.videoWidth || 1280;
  const srcH = v.videoHeight || 960;
  const targetAspect = RATIOS[state.ratioIdx].aspect;

  let cropW = srcW;
  let cropH = Math.round(srcW / targetAspect);
  if (cropH > srcH) {
    cropH = srcH;
    cropW = Math.round(srcH * targetAspect);
  }
  const cropX = Math.floor((srcW - cropW) / 2);
  const cropY = Math.floor((srcH - cropH) / 2);

  const rawCanvas = document.createElement("canvas");
  rawCanvas.width = cropW;
  rawCanvas.height = cropH;
  const rCtx = rawCanvas.getContext("2d");
  if (cameraCtrl.shouldMirror) {
    rCtx.translate(cropW, 0);
    rCtx.scale(-1, 1);
  }
  rCtx.drawImage(v, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  const id = `cam_${Date.now()}`;
  const entry = makePhotoEntry({
    id,
    name: `CAM_${new Date().toTimeString().slice(0, 8).replace(/:/g, "")}`,
    fullSource: rawCanvas
  });
  state.photos.push(entry);
  state.lastCapturedPhotoId = id;

  // Update shutter deck thumbnail with developed preview
  liveEngine.render(entry.gridThumbCanvas, getEffectiveActiveRecipe(), {
    width: entry.gridThumbCanvas.width,
    height: entry.gridThumbCanvas.height,
    seed: state.seedBase
  });
  els.lastThumbImg.src = liveEngine.canvas.toDataURL("image/jpeg", 0.85);
  els.lastThumbImg.classList.add("ready");
  els.lastThumbEmpty.hidden = true;

  selectPhoto(id);
  setStatus(`Captured ${cropW}×${cropH} raw frame to Darkroom batch.`);
}

async function ingestImageFiles(fileList) {
  const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(f.name));
  if (files.length === 0) {
    setStatus("No supported image files found.");
    return;
  }

  setStatus(`Loading ${files.length} photo(s)...`);
  let firstNewId = null;
  let failed = 0;

  for (const file of files) {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = objectUrl;
      await img.decode();
      const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const entry = makePhotoEntry({
        id,
        name: file.name,
        fullSource: img,
        objectUrl
      });
      state.photos.push(entry);
      if (!firstNewId) firstNewId = id;
    } catch {
      URL.revokeObjectURL(objectUrl);
      failed += 1;
    }
  }

  if (firstNewId) {
    selectPhoto(firstNewId);
    const active = getActivePhoto();
    const failNote = failed > 0 ? ` (${failed} unsupported format skipped)` : "";
    setStatus(`Loaded ${files.length - failed} photo(s) · Active: ${active.name} (${active.fullWidth}×${active.fullHeight})${failNote}`);
  } else {
    setStatus("Could not decode image file(s) in this browser. Try JPEG, PNG, or WebP.");
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function exportFullResJPEG() {
  const photo = getActivePhoto();
  if (!photo || state.isExporting) return;

  state.isExporting = true;
  els.saveFullResBtn.disabled = true;
  els.studioSaveBtn.disabled = true;
  const prevText = els.saveFullResBtn.textContent;
  els.saveFullResBtn.textContent = "Exporting...";

  const exportCanvas = document.createElement("canvas");
  let exportEngine = null;

  try {
    exportEngine = new WebGLFilterEngine(exportCanvas);
    const maxTex = exportEngine.getMaxTextureSize();
    const scale = Math.min(1.0, maxTex / Math.max(photo.fullWidth, photo.fullHeight));
    const outW = Math.max(2, Math.round(photo.fullWidth * scale));
    const outH = Math.max(2, Math.round(photo.fullHeight * scale));

    const recipe = getEffectiveActiveRecipe();
    exportEngine.render(photo.fullSource, recipe, {
      width: outW,
      height: outH,
      seed: state.seedBase,
      debugMaskMode: 0
    });

    const blob = await new Promise((resolve) => exportCanvas.toBlob(resolve, "image/jpeg", 0.95));
    if (!blob) throw new Error("JPEG encoding failed");

    const baseName = photo.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "_");
    const safeTag = recipe.shortLabel.replace(/[^a-zA-Z0-9_-]+/g, "_");
    const filename = `${baseName}_${safeTag}.jpg`;
    downloadBlob(blob, filename);

    const clampNote = scale < 0.999 ? ` (clamped to WebGL max ${maxTex}px)` : " (native 1:1)";
    setStatus(`Saved ${filename} · ${outW}×${outH}${clampNote}`);
  } catch (err) {
    setStatus(`Full-res export failed: ${err.message}`);
  } finally {
    if (exportEngine) exportEngine.dispose();
    els.saveFullResBtn.textContent = prevText;
    els.saveFullResBtn.disabled = false;
    els.studioSaveBtn.disabled = false;
    state.isExporting = false;
  }
}

async function exportContactSheetPNG() {
  const photo = getActivePhoto();
  if (!photo || state.isExporting) return;

  state.isExporting = true;
  els.exportSheetBtn.disabled = true;
  const tileCanvas = document.createElement("canvas");
  let tileEngine = null;

  try {
    tileEngine = new WebGLFilterEngine(tileCanvas);
    const src = photo.previewCanvas;
    const tileScale = Math.min(1.0, SHEET_TILE_MAX_EDGE / Math.max(src.width, src.height));
    const tileW = Math.max(2, Math.round(src.width * tileScale));
    const tileH = Math.max(2, Math.round(src.height * tileScale));

    const cols = 3;
    const rows = 3;
    const padOuter = 44;
    const gap = 28;
    const captionH = 44;
    const headerH = 68;

    const sheetW = padOuter * 2 + cols * tileW + (cols - 1) * gap;
    const sheetH = headerH + padOuter + rows * (tileH + captionH) + (rows - 1) * gap + padOuter;

    const sheet = document.createElement("canvas");
    sheet.width = sheetW;
    sheet.height = sheetH;
    const ctx = sheet.getContext("2d");

    // Neutral darkroom mat (#181818 R=G=B)
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, sheetW, sheetH);

    // Subtle header
    ctx.fillStyle = "#e4e4e7";
    ctx.font = "600 22px ui-monospace, 'SF Mono', Menlo, monospace";
    ctx.fillText(`FILTERLAB CONTACT SHEET · ${photo.name} (${photo.fullWidth}×${photo.fullHeight})`, padOuter, 52);

    const all = [STOCK_BASELINE, ...state.catalog.aesthetics];
    all.forEach((baseRecipe, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = padOuter + col * (tileW + gap);
      const y = headerH + padOuter / 2 + row * (tileH + captionH + gap);

      const recipe = idx === 0 ? STOCK_BASELINE : getTunedRecipeById(baseRecipe.id);
      tileEngine.render(src, recipe, {
        width: tileW,
        height: tileH,
        seed: state.seedBase,
        debugMaskMode: 0
      });

      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 1, y - 1, tileW + 2, tileH + 2);
      ctx.drawImage(tileEngine.canvas, x, y, tileW, tileH);

      ctx.fillStyle = "#d4d4d8";
      ctx.font = "700 18px ui-monospace, 'SF Mono', Menlo, monospace";
      ctx.fillText(baseRecipe.shortLabel, x, y + tileH + 28);

      ctx.fillStyle = "#8e8e93";
      ctx.font = "400 15px -apple-system, BlinkMacSystemFont, sans-serif";
      const labelW = ctx.measureText(baseRecipe.shortLabel).width;
      ctx.fillText(` · ${baseRecipe.moodCue}`, x + labelW + 4, y + tileH + 28);
    });

    const blob = await new Promise((resolve) => sheet.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Contact sheet encoding failed");
    const baseName = photo.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "_");
    const filename = `${baseName}_9up_sheet.png`;
    downloadBlob(blob, filename);
    setStatus(`Exported 9-Up Contact Sheet ${filename} (${sheetW}×${sheetH}).`);
  } catch (err) {
    setStatus(`9-Up export failed: ${err.message}`);
  } finally {
    if (tileEngine) tileEngine.dispose();
    els.exportSheetBtn.disabled = false;
    state.isExporting = false;
  }
}

function exportActiveCatalogJSON() {
  const tunedCatalog = structuredClone(state.catalog);
  tunedCatalog.aesthetics = tunedCatalog.aesthetics.map((a) => getTunedRecipeById(a.id));
  const payload = JSON.stringify(tunedCatalog, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  downloadBlob(blob, "filterlab_recipes_tuned.json");
  setStatus("Exported tuned recipes JSON.");
}

function parseUrlTuningPayload() {
  const hash = window.location.hash || "";
  const match = hash.match(/recipe=([A-Za-z0-9\-_]+)/);
  if (match) {
    try {
      const b64 = match[1].replace(/-/g, "+").replace(/_/g, "/");
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const jsonStr = new TextDecoder().decode(bytes);
      const payload = JSON.parse(jsonStr);
      if (payload && payload.id && payload.tone) return payload;
    } catch {
      return null;
    }
  }
  const params = new URLSearchParams(window.location.search);
  const qAesthetic = params.get("aesthetic");
  const qMode = params.get("mode");
  if (qAesthetic || qMode) {
    return {
      idOnly: qAesthetic || null,
      modeOnly: ["grid", "studio", "split"].includes(qMode) ? qMode : null
    };
  }
  return null;
}

function bindSliderEvents() {
  const onSliderChange = () => {
    const r = getRawRecipeById(state.activeId);
    if (r.id === STOCK_BASELINE.id) return;
    const trim = getTrim(r.id);
    trim.intensityPct = Number(els.sliderIntensity.value);
    trim.exposureDelta = Number(els.sliderExposure.value);
    trim.tempSteps = Number(els.sliderTemp.value);
    trim.contrastDelta = Number(els.sliderContrast.value);
    trim.grainPct = Number(els.sliderGrain.value);
    syncStudioSlidersUI();
    renderStudioView();
  };

  [els.sliderIntensity, els.sliderExposure, els.sliderTemp, els.sliderContrast, els.sliderGrain].forEach((input) => {
    input.addEventListener("input", onSliderChange);
  });

  els.resetTuningBtn.addEventListener("click", () => {
    const r = getRawRecipeById(state.activeId);
    state.trims[r.id] = getDefaultTrim();
    refreshActiveUI();
    setStatus(`Reset ${r.shortLabel} optical trims to calibrated studio default.`);
  });
}

function bindUI() {
  els.modeBtns.forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.mode)));

  els.openPhotosBtn.addEventListener("click", () => els.photoInput.click());
  els.photoInput.addEventListener("change", async (e) => {
    await ingestImageFiles(e.target.files);
    e.target.value = "";
  });

  els.saveFullResBtn.addEventListener("click", exportFullResJPEG);
  els.studioSaveBtn.addEventListener("click", exportFullResJPEG);
  els.exportSheetBtn.addEventListener("click", exportContactSheetPNG);
  els.exportRecipeJsonBtn.addEventListener("click", exportActiveCatalogJSON);

  els.importJsonBtn.addEventListener("click", () => els.jsonInput.click());
  els.jsonInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed && Array.isArray(parsed.aesthetics)) {
        state.catalog = parsed;
        state.trims = {};
        if (!state.catalog.aesthetics.some((a) => a.id === state.activeId)) {
          state.activeId = state.catalog.aesthetics[0]?.id || "stock";
        }
        buildFilmDialsAndSelectors();
        refreshActiveUI();
        if (state.mode === "grid") renderContactGrid();
        setStatus(`Imported custom catalog (${parsed.aesthetics.length} aesthetics).`);
      } else {
        setStatus("Invalid recipes JSON schema.");
      }
    } catch (err) {
      setStatus("Failed to parse JSON: " + err.message);
    } finally {
      e.target.value = "";
    }
  });

  els.bypassBtn.addEventListener("click", () => {
    state.bypass = !state.bypass;
    refreshActiveUI();
  });

  els.debugMaskSelect.addEventListener("change", (e) => {
    state.debugMask = Number(e.target.value) || 0;
    if (state.mode === "studio") renderStudioView();
    if (state.mode === "grid") renderContactGrid();
    if (state.mode === "split") renderSplitView();
  });

  els.splitLeftSelect.addEventListener("change", (e) => {
    state.splitLeftId = e.target.value;
    renderSplitView();
  });
  els.splitRightSelect.addEventListener("change", (e) => {
    state.splitRightId = e.target.value;
    renderSplitView();
  });

  els.blindToggleBtn.addEventListener("click", triggerBlindAB);
  els.blindRevealBtn.addEventListener("click", () => {
    state.blindRevealed = !state.blindRevealed;
    els.blindRevealBtn.classList.toggle("active", state.blindRevealed);
    renderSplitView();
  });

  // Interactive pointer drag for Split wipe
  let draggingSplit = false;
  const updateSplitFromClientX = (clientX) => {
    const rect = els.splitStage.getBoundingClientRect();
    if (rect.width <= 0) return;
    state.splitX = clamp((clientX - rect.left) / rect.width, 0.04, 0.96);
    renderSplitView();
  };
  els.splitStage.addEventListener("pointerdown", (e) => {
    draggingSplit = true;
    els.splitStage.setPointerCapture(e.pointerId);
    updateSplitFromClientX(e.clientX);
  });
  els.splitStage.addEventListener("pointermove", (e) => {
    if (draggingSplit) updateSplitFromClientX(e.clientX);
  });
  els.splitStage.addEventListener("pointerup", () => {
    draggingSplit = false;
  });
  els.splitStage.addEventListener("pointercancel", () => {
    draggingSplit = false;
  });

  // Camera controls (opt-in tab only)
  els.cameraRetryBtn.addEventListener("click", ensureCameraStarted);
  els.ratioBtn.addEventListener("click", () => {
    state.ratioIdx = (state.ratioIdx + 1) % RATIOS.length;
    const r = RATIOS[state.ratioIdx];
    els.ratioBtn.textContent = r.label;
    els.viewfinderFrame.className = `viewfinder-frame ${r.className}`;
  });
  els.flipBtn.addEventListener("click", async () => {
    if (cameraCtrl) await cameraCtrl.flipLens();
  });
  els.pauseBtn.addEventListener("click", () => {
    state.pausedLive = !state.pausedLive;
    els.pauseBtn.classList.toggle("active", state.pausedLive);
    els.pauseBtn.textContent = state.pausedLive ? "Resume Live" : "Pause Live";
  });
  els.shutterBtn.addEventListener("click", captureCameraToDarkroom);
  els.camCaptureThumb.addEventListener("click", () => {
    if (state.lastCapturedPhotoId) selectPhoto(state.lastCapturedPhotoId);
    setMode("studio");
  });
  els.openStudioFromCamBtn.addEventListener("click", () => {
    if (state.lastCapturedPhotoId) selectPhoto(state.lastCapturedPhotoId);
    setMode("studio");
  });

  // Full-window Drag & Drop photo loading
  window.addEventListener("dragenter", (e) => {
    if (e.dataTransfer?.types?.includes("Files")) {
      e.preventDefault();
      state.dragDepth += 1;
      els.dropOverlay.hidden = false;
    }
  });
  window.addEventListener("dragover", (e) => {
    if (e.dataTransfer?.types?.includes("Files")) {
      e.preventDefault();
    }
  });
  window.addEventListener("dragleave", () => {
    state.dragDepth = Math.max(0, state.dragDepth - 1);
    if (state.dragDepth === 0) els.dropOverlay.hidden = true;
  });
  window.addEventListener("drop", async (e) => {
    e.preventDefault();
    state.dragDepth = 0;
    els.dropOverlay.hidden = true;
    if (e.dataTransfer?.files?.length) {
      await ingestImageFiles(e.dataTransfer.files);
    }
  });

  // Spacebar hold-to-compare Original in Studio
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && state.mode === "studio" && !e.repeat && document.activeElement?.tagName !== "INPUT") {
      e.preventDefault();
      if (!state.bypass) {
        state.bypass = true;
        refreshActiveUI();
      }
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "Space" && state.mode === "studio" && state.bypass) {
      e.preventDefault();
      state.bypass = false;
      refreshActiveUI();
    }
  });

  bindSliderEvents();

  const ro = new ResizeObserver(() => syncStageGeometries());
  if (els.studioMat) ro.observe(els.studioMat);
  if (els.splitMat) ro.observe(els.splitMat);
}

async function boot() {
  try {
    studioEngine = new WebGLFilterEngine(els.studioCanvas);
    splitEngine = new WebGLFilterEngine(els.splitCanvas);
    liveEngine = new WebGLFilterEngine(els.liveCanvas);
    gridThumbEngine = new WebGLFilterEngine(document.createElement("canvas"));
  } catch (err) {
    setStatus(err.message);
    return;
  }

  initCalibrationSample();

  const loadedCatalog = await loadCanonicalCatalog();
  state.catalog = loadedCatalog;
  cameraCtrl = new CameraController(els.cameraVideo);

  // Client-side Mac handoff (#recipe=...) OR deep-link ?aesthetic=... / ?mode=...
  const urlPayload = parseUrlTuningPayload();
  let startMode = "grid";
  if (urlPayload) {
    if ("idOnly" in urlPayload) {
      if (urlPayload.idOnly && state.catalog.aesthetics.some((a) => a.id === urlPayload.idOnly)) {
        state.activeId = urlPayload.idOnly;
        startMode = urlPayload.modeOnly || "studio";
      } else if (urlPayload.modeOnly) {
        startMode = urlPayload.modeOnly;
      }
      els.syncBadge.textContent = "CANONICAL GPU";
    } else {
      const idx = state.catalog.aesthetics.findIndex((a) => a.id === urlPayload.id);
      if (idx >= 0) state.catalog.aesthetics[idx] = urlPayload;
      else state.catalog.aesthetics.unshift(urlPayload);
      state.activeId = urlPayload.id;
      state.bypass = false;
      startMode = "studio";
      els.syncBadge.textContent = "MAC LINK";
      els.syncBadge.classList.add("live");
    }
  } else {
    els.syncBadge.textContent = "CANONICAL GPU";
  }

  buildFilmDialsAndSelectors();
  bindUI();
  refreshBatchStrip();
  refreshActiveUI();

  if (startMode !== "grid") {
    setMode(startMode);
    setStatus(`Loaded ${getEffectiveActiveRecipe().shortLabel} (${startMode}).`);
  } else {
    setMode("grid");
    setStatus("Darkroom ready · Click a film to edit in Studio, or open/drop real phone photos.");
  }

  rafId = requestAnimationFrame(renderLiveLoop);
}

window.addEventListener("beforeunload", () => {
  if (rafId) cancelAnimationFrame(rafId);
  stopCameraSession();
});

boot();
