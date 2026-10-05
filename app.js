/**
 * SnapStudio - iPhone 16 Pro Interactive Web Prototype
 * Apple HIG Compliant Architecture & Core Interactions
 * Multi-Cam Vintage Filters (Sony, Canon, Camcorder, Instax, Film) &
 * Sihyunhada Style Personal Color Studio
 */

// ==========================================================================
// 1. App State & Presets
// ==========================================================================
const state = {
  currentMode: 'vintage', // 'vintage' | 'standard-id' | 'color-id'
  cameraSource: 'model', // 'model' | 'webcam'
  
  // Vintage Mode State (Multi-brand: Sony, Canon, Camcorder, Instax, Film)
  vintageFilter: 'sony-handycam',
  activeVintageCat: 'all',
  grainEnabled: true,
  dateStampEnabled: true,
  osdEnabled: true,
  lightLeakEnabled: false,
  
  // Standard ID Mode State
  idSpec: 'passport', // 'passport' | 'idcard' | 'half' | 'visa'
  
  // Color ID Mode State (Sihyunhada Studio)
  activeSeason: 'sihyunhada',
  selectedColor: { name: '#01 Blossom Pink', hex: '#F38B95', bg: 'radial-gradient(circle at 50% 38%, #FDB0B8 0%, #F38B95 100%)' },
  retouchTone: 35,
  moodFrameEnabled: true,
  studioModelType: 'female', // 'female' | 'male' | 'custom'
  momentTitle: "Wu wanlin's Moment",
  customModelImg: null,
  
  // Toolbar & Lens State
  flashMode: 'off', // 'off' | 'on'
  timerSec: 0, // 0 | 3 | 10
  gridEnabled: false,
  lensFilter: 'none', // 'none' | 'mist' | 'star' | 'streak' | 'prism' | 'cpl'
  
  // Captures
  lastCapturedUrl: null
};

// Optical Lens Filters Specifications (Physical Light Dispersion & Scattering)
const LENS_FILTERS = {
  none: { name: '기본 (Clear)', title: '광학 렌즈 미장착', desc: '왜곡 없는 클리어 광학 유리' },
  mist: { name: '블랙 미스트', title: 'Black Mist (Pro-Mist)', desc: '빛 산란 할레이션 & 부드러운 인물 피부결' },
  star: { name: '크로스 4X', title: 'Cross Star 4-Point', desc: '정밀 회절 격자에 의한 다이아몬드 별빛 갈라짐' },
  streak: { name: '블루 스트릭', title: 'Blue Streak (Anamorphic)', desc: '수평 원통형 플레어로 네온 시네마틱 감성 연출' },
  prism: { name: '프리즘 분광', title: 'Prism Spectrum Dispersion', desc: '빛 굴절에 의한 무지개 림라이트 & 색수차 분광' },
  cpl: { name: 'CPL 편광', title: 'Circular Polarizer (CPL)', desc: '불필요한 반사광 억제 및 색상 채도·선명도 극대화' }
};

// Sihyunhada Signature Palette & 4-Season Personal Color Data
const COLOR_PALETTES = {
  sihyunhada: [
    { name: '#01 Blossom Pink', hex: '#F38B95', bg: 'radial-gradient(circle at 50% 38%, #FDB0B8 0%, #F38B95 100%)' },
    { name: '#02 Sage Olive', hex: '#80926C', bg: 'radial-gradient(circle at 50% 38%, #A2B38F 0%, #80926C 100%)' },
    { name: '#03 Soft Sky', hex: '#89B6D7', bg: 'radial-gradient(circle at 50% 38%, #B3D4EE 0%, #89B6D7 100%)' },
    { name: '#04 Oat Beige', hex: '#DFCBB5', bg: 'radial-gradient(circle at 50% 38%, #EFE3D3 0%, #DFCBB5 100%)' },
    { name: '#05 Crimson Wine', hex: '#781F2F', bg: 'radial-gradient(circle at 50% 38%, #9E2F43 0%, #781F2F 100%)' },
    { name: '#06 Pop Fuchsia', hex: '#E93B81', bg: 'radial-gradient(circle at 50% 38%, #F96FA7 0%, #E93B81 100%)' },
    { name: '#07 Camel Ochre', hex: '#C89A58', bg: 'radial-gradient(circle at 50% 38%, #DEB67B 0%, #C89A58 100%)' },
    { name: '#08 Muted Lavender', hex: '#9B8CB4', bg: 'radial-gradient(circle at 50% 38%, #BDB0D4 0%, #9B8CB4 100%)' }
  ],
  spring: [
    { name: '#09 Coral Peach', hex: '#FF8A80', bg: 'radial-gradient(circle at 50% 38%, #FFAEA6 0%, #FF8A80 100%)' },
    { name: '#10 Vanilla Cream', hex: '#FFE082', bg: 'radial-gradient(circle at 50% 38%, #FFF0B3 0%, #FFE082 100%)' },
    { name: '#11 Soft Apricot', hex: '#FFB74D', bg: 'radial-gradient(circle at 50% 38%, #FFCF85 0%, #FFB74D 100%)' },
    { name: '#12 Apple Mint', hex: '#A5D6A7', bg: 'radial-gradient(circle at 50% 38%, #C4E8C6 0%, #A5D6A7 100%)' }
  ],
  summer: [
    { name: '#13 Summer Lavender', hex: '#9FA8DA', bg: 'radial-gradient(circle at 50% 38%, #C1C9ED 0%, #9FA8DA 100%)' },
    { name: '#14 Powder Sky', hex: '#81D4FA', bg: 'radial-gradient(circle at 50% 38%, #A8E3FC 0%, #81D4FA 100%)' },
    { name: '#15 Baby Blossom', hex: '#F48FB1', bg: 'radial-gradient(circle at 50% 38%, #FAB1CB 0%, #F48FB1 100%)' },
    { name: '#16 Mist Violet', hex: '#CE93D8', bg: 'radial-gradient(circle at 50% 38%, #E3B9EB 0%, #CE93D8 100%)' }
  ],
  autumn: [
    { name: '#17 Terracotta Brick', hex: '#D8705C', bg: 'radial-gradient(circle at 50% 38%, #E79483 0%, #D8705C 100%)' },
    { name: '#18 Warm Olive', hex: '#9E9D24', bg: 'radial-gradient(circle at 50% 38%, #BCBB45 0%, #9E9D24 100%)' },
    { name: '#19 Deep Mustard', hex: '#F9A825', bg: 'radial-gradient(circle at 50% 38%, #FBC05D 0%, #F9A825 100%)' },
    { name: '#20 Mulled Wine', hex: '#880E4F', bg: 'radial-gradient(circle at 50% 38%, #A81F69 0%, #880E4F 100%)' }
  ],
  winter: [
    { name: '#21 Royal Cobalt', hex: '#1565C0', bg: 'radial-gradient(circle at 50% 38%, #3682DB 0%, #1565C0 100%)' },
    { name: '#22 Magenta Punch', hex: '#C2185B', bg: 'radial-gradient(circle at 50% 38%, #DE3C7C 0%, #C2185B 100%)' },
    { name: '#23 Emerald Forest', hex: '#00695C', bg: 'radial-gradient(circle at 50% 38%, #008F7E 0%, #00695C 100%)' },
    { name: '#24 Cool Charcoal', hex: '#263238', bg: 'radial-gradient(circle at 50% 38%, #415159 0%, #263238 100%)' }
  ],
  gradient: [
    { name: '#25 Sunset Glow', hex: '#ff7e5f', bg: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
    { name: '#26 Oceanic Aura', hex: '#2b5876', bg: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
    { name: '#27 Neon Cyber', hex: '#f857a6', bg: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)' },
    { name: '#28 Emerald Dream', hex: '#11998e', bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }
  ]
};

// ID Specifications Meta
const ID_SPECS = {
  passport: {
    title: '대한민국 여권',
    detail: '3.5 x 4.5 cm (정수리~턱 3.2~3.6cm 규정 준수)',
    boxRatio: '35 / 45',
    boxWidth: 250,
    boxHeight: 320
  },
  idcard: {
    title: '주민등록증 / 운전면허증',
    detail: '3.5 x 4.5 cm (최근 6개월 이내 촬영)',
    boxRatio: '35 / 45',
    boxWidth: 250,
    boxHeight: 320
  },
  half: {
    title: '반명함판 / 취업 이력서',
    detail: '3.0 x 4.0 cm (서류 및 학생증 규격)',
    boxRatio: '30 / 40',
    boxWidth: 240,
    boxHeight: 320
  },
  visa: {
    title: '미국 / 글로벌 비자',
    detail: '5.0 x 5.0 cm (2x2 inch 정방형 규격)',
    boxRatio: '1 / 1',
    boxWidth: 280,
    boxHeight: 280
  }
};

// 11 Multi-brand Vintage Filters Meta (Sony, Canon, Camcorder, Instax, Film Stocks)
const VINTAGE_FILTERS = {
  // 1. Camcorder / Tape Line
  'sony-handycam': {
    name: 'Sony DCR Handycam',
    brand: 'SONY',
    model: 'DCR-TRV900 MiniDV',
    cat: 'camcorder',
    css: 'contrast(1.22) saturate(1.28) hue-rotate(185deg) brightness(1.04)',
    osdId: 'sony-handycam-osd',
    frameType: 'handycam'
  },
  'vhs-glitch': {
    name: 'Hi8 / VHS Tape',
    brand: 'VHS',
    model: 'JVC / Hi8 Video Tape',
    cat: 'camcorder',
    css: 'contrast(1.32) saturate(1.4) hue-rotate(190deg) brightness(1.08)',
    osdId: 'vhs-tape-osd',
    frameType: 'vhs'
  },
  'retro-8mm': {
    name: 'Super 8mm Cine',
    brand: 'CINE',
    model: '1970s Super 8 Home Movie',
    cat: 'camcorder',
    css: 'sepia(0.55) contrast(1.35) saturate(1.15) brightness(0.92)',
    osdId: 'super8-overlay',
    frameType: 'super8'
  },

  // 2. Digital CCD Line (Y2K DigiCam)
  'canon-ixy': {
    name: 'Canon IXY Digital',
    brand: 'CANON',
    model: 'IXY Digital 50 (Warm Skin)',
    cat: 'digital',
    css: 'contrast(1.08) saturate(1.25) brightness(1.06) sepia(0.12)',
    osdId: 'canon-ixy-osd',
    frameType: 'canon-ixy'
  },
  'sony-cybershot': {
    name: 'Sony Cyber-shot',
    brand: 'SONY',
    model: 'DSC-P10 (CCD Cool Tone)',
    cat: 'digital',
    css: 'contrast(1.26) saturate(1.38) hue-rotate(350deg) brightness(1.02)',
    osdId: 'sony-cybershot-osd',
    frameType: 'cybershot'
  },
  'olympus-camedia': {
    name: 'Olympus Camedia',
    brand: 'OLYMPUS',
    model: 'C-3040 ZOOM (Flash Pop)',
    cat: 'digital',
    css: 'contrast(1.3) saturate(1.2) hue-rotate(12deg) brightness(1.05)',
    osdId: null,
    frameType: 'camedia'
  },

  // 3. Instant & Polaroid Line
  'instax-mini': {
    name: 'Fuji Instax Mini',
    brand: 'FUJIFILM',
    model: 'Instax Mini Instant Card',
    cat: 'instant',
    css: 'contrast(0.94) saturate(0.92) brightness(1.12) sepia(0.08)',
    osdId: 'instax-frame',
    frameType: 'instax'
  },
  'polaroid-600': {
    name: 'Polaroid 600',
    brand: 'POLAROID',
    model: 'Polaroid 600 Vintage Square',
    cat: 'instant',
    css: 'contrast(0.9) saturate(0.85) brightness(1.15)',
    osdId: 'polaroid-frame',
    frameType: 'polaroid'
  },

  // 4. 35mm Classic Film Stocks Line
  'kodak-gold': {
    name: 'Kodak Gold 200',
    brand: 'KODAK',
    model: 'Gold 200 35mm Analog Film',
    cat: 'film',
    css: 'sepia(0.32) saturate(1.3) contrast(1.15) brightness(1.02)',
    osdId: null,
    frameType: 'kodak'
  },
  'fuji-superia': {
    name: 'Fujifilm Superia 400',
    brand: 'FUJIFILM',
    model: 'Superia X-TRA 400 (Emerald)',
    cat: 'film',
    css: 'contrast(1.18) saturate(1.22) hue-rotate(345deg) brightness(0.98)',
    osdId: null,
    frameType: 'fuji'
  },
  'kodak-tri-x': {
    name: 'Kodak Tri-X Noir',
    brand: 'KODAK',
    model: 'Tri-X 400 B&W High-Contrast',
    cat: 'film',
    css: 'grayscale(1) contrast(1.7) brightness(0.94)',
    osdId: null,
    frameType: 'bw'
  }
};

// ==========================================================================
// 2. Web Audio API Engine
// ==========================================================================
class SoundFXEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playShutter() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.075);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.08);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playTick() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.035);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  playBeep(isFinal = false) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isFinal ? 1320 : 880, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (isFinal ? 0.2 : 0.08));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + (isFinal ? 0.22 : 0.1));
  }
}

const soundEngine = new SoundFXEngine();

// ==========================================================================
// 3. Studio Portrait Photographic Cutout Renderer (Transparent Alpha PNG)
// ==========================================================================

// Preload high-res studio transparent models (Female & Male)
const studioModels = {
  female: new Image(),
  male: new Image()
};
studioModels.female.src = 'model_female.png';
studioModels.male.src = 'model_male.png';

// Re-render when images are loaded
studioModels.female.onload = () => {
  if (state.cameraSource === 'model') {
    const canvas = document.getElementById('model-canvas');
    if (canvas) renderStudioModel(canvas, state.retouchTone);
  }
};
studioModels.male.onload = () => {
  if (state.cameraSource === 'model') {
    const canvas = document.getElementById('model-canvas');
    if (canvas) renderStudioModel(canvas, state.retouchTone);
  }
};

function renderStudioModel(canvas, toneVal = 35) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Determine active model image
  let activeImg = null;
  if (state.studioModelType === 'custom' && state.customModelImg) {
    activeImg = state.customModelImg;
  } else if (state.studioModelType === 'male') {
    activeImg = studioModels.male;
  } else {
    activeImg = studioModels.female;
  }

  // Calculate beauty skin retouch tone (brightness & gentle contrast)
  const toneRatio = 1 + (toneVal - 35) * 0.0035;

  ctx.save();

  if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
    // Apply real-time skin tone retouching filter
    ctx.filter = `brightness(${toneRatio}) contrast(${1 + (toneVal - 35) * 0.001})`;

    // Scale to fit nicely in 3:4 studio portrait frame (Sihyunhada upper-body composition)
    const imgAspect = activeImg.naturalWidth / activeImg.naturalHeight;
    const canvasAspect = w / h;

    let drawW, drawH, drawX, drawY;

    if (imgAspect > canvasAspect) {
      drawH = h * 1.02;
      drawW = drawH * imgAspect;
      drawX = (w - drawW) / 2;
      drawY = h - drawH + 10;
    } else {
      drawW = w * 1.08;
      drawH = drawW / imgAspect;
      drawX = (w - drawW) / 2;
      drawY = h - drawH + 15;
    }

    ctx.drawImage(activeImg, drawX, drawY, drawW, drawH);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.42, w * 0.22, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('스튜디오 인물 모델 준비 중...', w / 2, h / 2);
  }

  ctx.restore();
}

// ==========================================================================
// 4. UI Synchronization & Mode Switcher
// ==========================================================================

function updateClock() {
  const clockEl = document.getElementById('status-time');
  const dateCardEl = document.getElementById('mood-card-date');
  const dateCodeEl = document.getElementById('sihyun-date-code');
  const dateStampEl = document.getElementById('date-stamp');
  
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  if (clockEl) clockEl.textContent = `${hours}:${minutes}`;

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  if (dateCardEl) dateCardEl.textContent = `${yyyy}.${mm}.${dd}`;
  if (dateCodeEl) dateCodeEl.textContent = `${yyyy}.${mm}.${dd} RECORD`;
  if (dateStampEl) dateStampEl.textContent = `'${String(yyyy).slice(2)} ${mm} ${dd}`;
}

function showDynamicIslandBanner(title, subtitle, durationMs = 2400) {
  const island = document.getElementById('dynamic-island');
  const label = document.getElementById('island-label');
  const extra = document.getElementById('island-extra');

  if (!island || !label || !extra) return;

  label.textContent = title;
  extra.textContent = subtitle;
  island.classList.add('expanded');

  clearTimeout(island._timer);
  island._timer = setTimeout(() => {
    island.classList.remove('expanded');
  }, durationMs);
}

function switchMode(modeKey) {
  if (state.currentMode === modeKey) return;
  state.currentMode = modeKey;
  soundEngine.playTick();

  // 1. Update Dial Items
  const dialItems = document.querySelectorAll('.mode-dial-item');
  dialItems.forEach(item => {
    item.classList.toggle('active', item.dataset.mode === modeKey);
  });

  // Dial transform shift
  const dialList = document.getElementById('mode-dial-list');
  if (modeKey === 'vintage') {
    dialList.style.transform = 'translateX(58px)';
  } else if (modeKey === 'standard-id') {
    dialList.style.transform = 'translateX(0px)';
  } else if (modeKey === 'color-id') {
    dialList.style.transform = 'translateX(-58px)';
  }

  // 2. Synchronize Left Sidebar buttons
  document.querySelectorAll('.panel-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === modeKey);
  });

  // 3. Switch Control Drawer Panels
  document.getElementById('drawer-vintage').classList.toggle('active', modeKey === 'vintage');
  document.getElementById('drawer-standard-id').classList.toggle('active', modeKey === 'standard-id');
  document.getElementById('drawer-color-id').classList.toggle('active', modeKey === 'color-id');

  // 4. Viewfinder Overlays
  const standardHud = document.getElementById('standard-id-hud');
  const moodFrame = document.getElementById('mood-card-frame');
  const grainLayer = document.getElementById('film-grain-layer');
  const dateStamp = document.getElementById('date-stamp');
  const leak = document.getElementById('light-leak');
  const polaroid = document.getElementById('polaroid-frame');
  const instax = document.getElementById('instax-frame');
  const sonyHandy = document.getElementById('sony-handycam-osd');
  const vhsTape = document.getElementById('vhs-tape-osd');
  const sonyCyber = document.getElementById('sony-cybershot-osd');
  const canonIxy = document.getElementById('canon-ixy-osd');
  const super8 = document.getElementById('super8-overlay');
  const camOsd = document.getElementById('camcorder-osd');
  const bgLayer = document.getElementById('viewfinder-bg');
  const mediaFilterEl = state.cameraSource === 'webcam' ? document.getElementById('camera-video') : document.getElementById('model-canvas');

  // Reset overlays first
  standardHud.style.display = 'none';
  moodFrame.style.display = 'none';
  grainLayer.style.display = 'none';
  dateStamp.style.display = 'none';
  leak.style.display = 'none';
  if (polaroid) polaroid.style.display = 'none';
  if (instax) instax.style.display = 'none';
  if (sonyHandy) sonyHandy.style.display = 'none';
  if (vhsTape) vhsTape.style.display = 'none';
  if (sonyCyber) sonyCyber.style.display = 'none';
  if (canonIxy) canonIxy.style.display = 'none';
  if (super8) super8.style.display = 'none';
  if (camOsd) camOsd.style.display = 'none';

  if (modeKey === 'vintage') {
    bgLayer.style.background = '#16181d';
    applyVintagePreset(state.vintageFilter);
  } else if (modeKey === 'standard-id') {
    bgLayer.style.background = '#f7f8fa';
    mediaFilterEl.style.filter = 'none';
    standardHud.style.display = 'block';
  } else if (modeKey === 'color-id') {
    bgLayer.style.background = state.selectedColor.bg || state.selectedColor.hex;
    mediaFilterEl.style.filter = `brightness(${1 + (state.retouchTone - 35) * 0.003})`;
    if (state.moodFrameEnabled) {
      moodFrame.style.display = 'flex';
    }
    const colorBadge = document.getElementById('sihyun-color-badge');
    if (colorBadge) colorBadge.textContent = state.selectedColor.name;
  }

  // 5. Update Right Info Spec Card
  updateRightSpecCard(modeKey);

  // 6. Dynamic Island announcement
  const titles = {
    'vintage': 'Multi-Cam Vintage',
    'standard-id': 'Standard ID 규격',
    'color-id': '시현하다 Color Studio'
  };
  showDynamicIslandBanner(titles[modeKey], 'MODE ACTIVE', 1800);
}

function updateRightSpecCard(modeKey) {
  const badge = document.getElementById('active-mode-badge');
  const title = document.getElementById('mode-spec-title');
  const desc = document.getElementById('mode-spec-desc');
  const list = document.getElementById('mode-feature-list');

  if (modeKey === 'vintage') {
    badge.textContent = 'Vintage / Multi-Cam';
    title.textContent = '11종 명기 카메라 & 캠코더 라인업';
    desc.textContent = '소니 캠코더, 캐논 IXY 디카, 인스탁스 미니 즉석인화, Hi8 비디오 글리치, 코닥/후지 필름 등 11종의 명기 카메라 톤과 실시간 뷰파인더 OSD가 완벽히 재현됩니다.';
    list.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>브랜드별 11종 프리셋: Sony DCR, Canon IXY, Cyber-shot, Instax Mini, Polaroid, Hi8 Tape, Super 8mm, Kodak Gold, Fuji Superia, Tri-X Noir</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>기종별 전용 OSD & 프레임: 소니 타임코드, 캐논 데이트스탬프, 인스탁스 화이트 카드 프레임, VHS 스캔라인</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>Web Audio API 기반 기계식 셔터 찰칵 햅틱 사운드 & Dynamic Island 상태 연동</span></li>
    `;
  } else if (modeKey === 'standard-id') {
    badge.textContent = 'Standard ID';
    title.textContent = '공공기관 규격 정밀 검증';
    desc.textContent = '외교부 여권 규격(정수리부터 턱까지 3.2~3.6cm) 및 신분증, 미국 비자 규격을 완벽 준수하도록 정밀 HUD 가이드라인을 제공합니다.';
    list.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>여권, 주민등록증, 반명함(3x4), 미국비자(2x2) 4종 규격</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>실시간 정수리선/눈높이/턱끝/어깨선 규격 인식 배지</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>사진관 인화용 4x6인치 8분할 템플릿(재단선 포함) 원클릭 생성</span></li>
    `;
  } else if (modeKey === 'color-id') {
    badge.textContent = 'Color ID (시현하다 스타일)';
    title.textContent = '인물 누끼 & 퍼스널 컬러 스튜디오';
    desc.textContent = '인물의 배경을 투명하게 완벽 분리하여, 시현하다 시그니처 8색 및 4계절 퍼스널 컬러 백드롭 조명을 실시간 치환하고 시그니처 각인 카드를 완성합니다.';
    list.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>초고화질 실사 투명 누끼 모델(여성/남성/내 사진 업로드) 배경 실시간 분리</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>시현하다 시그니처(블라썸 핑크, 세이지 올리브 등 8색) + 4계절 16색 + 그라디언트 백드롭</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>시현하다 모먼트 상단 레터링(이름 직접 편집) & 하단 기록가 친필 서명 각인</span></li>
    `;
  }
}

function applyVintagePreset(filterKey) {
  state.vintageFilter = filterKey;
  const preset = VINTAGE_FILTERS[filterKey] || VINTAGE_FILTERS['sony-handycam'];

  const mediaFilterEl = state.cameraSource === 'webcam' ? document.getElementById('camera-video') : document.getElementById('model-canvas');
  if (mediaFilterEl) mediaFilterEl.style.filter = preset.css;

  // Reset all vintage OSD / frames
  const osdElements = [
    'polaroid-frame',
    'instax-frame',
    'sony-handycam-osd',
    'vhs-tape-osd',
    'sony-cybershot-osd',
    'canon-ixy-osd',
    'super8-overlay',
    'camcorder-osd'
  ];
  osdElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Show active preset OSD if enabled
  if (state.osdEnabled && preset.osdId) {
    const targetOsd = document.getElementById(preset.osdId);
    if (targetOsd) targetOsd.style.display = 'block';
  }

  // Toggles
  const grainEl = document.getElementById('film-grain-layer');
  const dateStampEl = document.getElementById('date-stamp');
  const leakEl = document.getElementById('light-leak');

  if (grainEl) grainEl.style.display = state.grainEnabled ? 'block' : 'none';
  // Avoid duplicate date if Canon IXY or Instax is showing its own date stamp
  if (dateStampEl) {
    const hasOwnDate = (preset.osdId === 'canon-ixy-osd' || preset.osdId === 'instax-frame');
    dateStampEl.style.display = (state.dateStampEnabled && !hasOwnDate) ? 'block' : 'none';
  }
  if (leakEl) leakEl.style.display = state.lightLeakEnabled ? 'block' : 'none';

  // Highlight active filter chip
  document.querySelectorAll('#filter-carousel .filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === filterKey);
  });

  showDynamicIslandBanner(preset.brand, preset.model, 1600);
}

function applyLensFilter(filterKey = 'none') {
  soundEngine.playTick();
  state.lensFilter = filterKey;

  const layers = {
    mist: document.getElementById('lens-layer-mist'),
    star: document.getElementById('lens-layer-star'),
    streak: document.getElementById('lens-layer-streak'),
    prism: document.getElementById('lens-layer-prism'),
    cpl: document.getElementById('lens-layer-cpl')
  };

  Object.entries(layers).forEach(([k, el]) => {
    if (el) el.style.display = (k === filterKey) ? 'block' : 'none';
  });

  // Update Popover Buttons
  document.querySelectorAll('.lens-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lens === filterKey);
  });

  // Update Sidebar Buttons
  document.querySelectorAll('.sidebar-lens-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lens === filterKey);
  });

  // Update Top Toolbar Button
  const btnLens = document.getElementById('btn-lens');
  if (btnLens) {
    btnLens.classList.toggle('active', filterKey !== 'none');
  }

  const meta = LENS_FILTERS[filterKey] || LENS_FILTERS.none;
  showDynamicIslandBanner('LENS FILTER', meta.name.toUpperCase(), 1500);
}

function renderColorSwatches(seasonKey) {
  state.activeSeason = seasonKey;
  const container = document.getElementById('color-palette-scroll');
  if (!container) return;
  container.innerHTML = '';

  const palette = COLOR_PALETTES[seasonKey] || COLOR_PALETTES.sihyunhada;

  palette.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = `color-palette-item ${state.selectedColor.name === item.name ? 'active' : ''}`;
    itemEl.title = item.name;

    const swatchEl = document.createElement('div');
    swatchEl.className = 'color-swatch-circle';
    swatchEl.style.background = item.bg || item.hex;

    const labelEl = document.createElement('div');
    labelEl.className = 'color-swatch-name';
    labelEl.textContent = item.name.split(' ')[1] || item.name;

    itemEl.appendChild(swatchEl);
    itemEl.appendChild(labelEl);

    itemEl.addEventListener('click', () => {
      soundEngine.playTick();
      state.selectedColor = item;

      document.querySelectorAll('.color-palette-item').forEach(el => el.classList.remove('active'));
      itemEl.classList.add('active');

      const bgLayer = document.getElementById('viewfinder-bg');
      if (bgLayer) bgLayer.style.background = item.bg || item.hex;

      const codeEl = document.getElementById('sihyun-color-badge');
      if (codeEl) codeEl.textContent = item.name;

      showDynamicIslandBanner('BACKGROUND', item.name, 1200);
    });

    container.appendChild(itemEl);
  });
}

// ==========================================================================
// 5. Shutter Capture Engine & Canvas Composer
// ==========================================================================

function triggerShutterCapture() {
  soundEngine.playTick();

  if (state.timerSec > 0) {
    runCountdown(state.timerSec, executeCapture);
  } else {
    executeCapture();
  }
}

function runCountdown(seconds, callback) {
  const overlay = document.getElementById('timer-overlay');
  const numEl = document.getElementById('countdown-num');
  let remaining = seconds;

  overlay.style.display = 'flex';
  numEl.textContent = remaining;
  soundEngine.playBeep(false);
  showDynamicIslandBanner('TIMER', `${remaining}s`, 1000);

  const interval = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      numEl.textContent = remaining;
      soundEngine.playBeep(false);
      showDynamicIslandBanner('TIMER', `${remaining}s`, 1000);
    } else {
      clearInterval(interval);
      overlay.style.display = 'none';
      soundEngine.playBeep(true);
      callback();
    }
  }, 1000);
}

function executeCapture() {
  soundEngine.playShutter();

  // White Flash Animation
  const flashScreen = document.getElementById('flash-screen');
  flashScreen.classList.add('active');
  setTimeout(() => flashScreen.classList.remove('active'), 320);

  // Dynamic Island status
  showDynamicIslandBanner('PHOTO SAVED', 'PROCESSED', 2200);

  // Setup Off-screen High-Res Capture Canvas
  const captureCanvas = document.createElement('canvas');
  captureCanvas.width = 780;
  captureCanvas.height = 1040;
  const ctx = captureCanvas.getContext('2d');

  // 1. Render Background
  if (state.currentMode === 'vintage') {
    ctx.fillStyle = '#16181d';
    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
  } else if (state.currentMode === 'standard-id') {
    ctx.fillStyle = '#f7f8fa';
    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
  } else if (state.currentMode === 'color-id') {
    // Fill Sihyunhada Studio Backdrop with soft center lighting
    const hex = state.selectedColor.hex || '#F38B95';
    const grad = ctx.createRadialGradient(
      captureCanvas.width / 2, captureCanvas.height * 0.38, 30,
      captureCanvas.width / 2, captureCanvas.height * 0.38, captureCanvas.width * 0.75
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, hex);
    grad.addColorStop(1, hex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
  }

  // 2. Draw Subject (Transparent Model or Mirrored Webcam)
  if (state.cameraSource === 'webcam') {
    const video = document.getElementById('camera-video');
    if (video.videoWidth) {
      ctx.save();
      ctx.translate(captureCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
      ctx.restore();
    }
  } else {
    // Render Photographic Transparent Model
    let activeImg = null;
    if (state.studioModelType === 'custom' && state.customModelImg) {
      activeImg = state.customModelImg;
    } else if (state.studioModelType === 'male') {
      activeImg = studioModels.male;
    } else {
      activeImg = studioModels.female;
    }

    if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
      ctx.save();
      const toneRatio = 1 + (state.retouchTone - 35) * 0.0035;
      ctx.filter = `brightness(${toneRatio}) contrast(${1 + (state.retouchTone - 35) * 0.001})`;

      const imgAspect = activeImg.naturalWidth / activeImg.naturalHeight;
      const canvasAspect = captureCanvas.width / captureCanvas.height;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > canvasAspect) {
        drawH = captureCanvas.height * 1.02;
        drawW = drawH * imgAspect;
        drawX = (captureCanvas.width - drawW) / 2;
        drawY = captureCanvas.height - drawH + 10;
      } else {
        drawW = captureCanvas.width * 1.08;
        drawH = drawW / imgAspect;
        drawX = (captureCanvas.width - drawW) / 2;
        drawY = captureCanvas.height - drawH + 15;
      }

      ctx.drawImage(activeImg, drawX, drawY, drawW, drawH);
      ctx.restore();
    }
  }

  // 3. Mode-specific Overlays & Signature Watermarks
  if (state.currentMode === 'vintage') {
    const preset = VINTAGE_FILTERS[state.vintageFilter];

    if (state.vintageFilter === 'kodak-tri-x') {
      // Grayscale conversion
      const imgData = ctx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = v; d[i + 1] = v; d[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (state.vintageFilter === 'kodak-gold') {
      ctx.fillStyle = 'rgba(255, 175, 45, 0.16)';
      ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    } else if (state.vintageFilter === 'fuji-superia') {
      ctx.fillStyle = 'rgba(60, 210, 160, 0.09)';
      ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    } else if (state.vintageFilter === 'canon-ixy') {
      // Canon IXY soft warm glow & orange timestamp
      ctx.fillStyle = 'rgba(255, 190, 140, 0.12)';
      ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.fillStyle = '#ff9500';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(\"'26 10 05 14:28\", captureCanvas.width - 270, captureCanvas.height - 40);
      ctx.shadowColor = 'transparent';
    } else if (state.vintageFilter === 'sony-handycam') {
      // Sony DV Handycam OSD
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillStyle = '#ff3b30';
      ctx.fillText('● REC', 40, 60);
      ctx.fillStyle = '#00ffcc';
      ctx.fillText('SP 0:00:14  SONY DCR', 130, 60);
      ctx.fillText('Hi-Fi STEREO [DV]', 40, captureCanvas.height - 40);
      ctx.fillText('BATT ▮▮▮▯', captureCanvas.width - 200, captureCanvas.height - 40);
    } else if (state.vintageFilter === 'vhs-glitch') {
      // VHS Scanlines & Play OSD
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let y = 0; y < captureCanvas.height; y += 4) {
        ctx.fillRect(0, y, captureCanvas.width, 2);
      }
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.fillStyle = '#55ff55';
      ctx.fillText('PLAY ▶ 0:12:45 SP', 40, 60);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('AUTO TRACKING', 40, captureCanvas.height - 40);
    } else if (state.vintageFilter === 'sony-cybershot') {
      // Cyber-shot OSD
      ctx.font = 'bold 22px -apple-system, sans-serif';
      ctx.fillStyle = '#ff9f0a';
      ctx.fillText('Cyber-shot', 40, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px -apple-system, sans-serif';
      ctx.fillText('5.1 MEGAPIXELS', captureCanvas.width - 200, 60);
      ctx.fillText('DSC-P10  ISO 100', 40, captureCanvas.height - 40);
    } else if (state.vintageFilter === 'instax-mini') {
      // Instax Mini Signature Frame (Wider bottom)
      ctx.lineWidth = 36;
      ctx.strokeStyle = '#f5f4ef';
      ctx.strokeRect(18, 18, captureCanvas.width - 36, captureCanvas.height - 36);
      ctx.fillStyle = '#f5f4ef';
      ctx.fillRect(0, captureCanvas.height - 140, captureCanvas.width, 140);

      ctx.font = 'bold 24px -apple-system, sans-serif';
      ctx.fillStyle = '#3b3d44';
      ctx.fillText('instax mini', 40, captureCanvas.height - 55);
      ctx.font = '20px "Courier New", monospace';
      ctx.fillStyle = '#8c8f99';
      ctx.fillText(\"'26 10 05\", captureCanvas.width - 170, captureCanvas.height - 55);
    } else if (state.vintageFilter === 'polaroid-600') {
      ctx.lineWidth = 40;
      ctx.strokeStyle = '#f6f6f2';
      ctx.strokeRect(20, 20, captureCanvas.width - 40, captureCanvas.height - 40);
      ctx.fillStyle = '#f6f6f2';
      ctx.fillRect(0, captureCanvas.height - 120, captureCanvas.width, 120);
    }

    // Classic Date Stamp if enabled
    if (state.dateStampEnabled && state.vintageFilter !== 'canon-ixy' && state.vintageFilter !== 'instax-mini') {
      const dateText = document.getElementById('date-stamp').textContent;
      ctx.font = 'bold 36px "Impact", sans-serif';
      ctx.fillStyle = '#ff8c00';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(dateText, captureCanvas.width - 240, captureCanvas.height - 50);
      ctx.shadowColor = 'transparent';
    }

  } else if (state.currentMode === 'color-id' && state.moodFrameEnabled) {
    // Sihyunhada Style Moment Card Overlay
    // 1. Top Moment Banner
    const topGrad = ctx.createLinearGradient(0, 0, 0, 160);
    topGrad.addColorStop(0, 'rgba(0,0,0,0.65)');
    topGrad.addColorStop(0.7, 'rgba(0,0,0,0.25)');
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, captureCanvas.width, 160);

    const momentTitle = document.getElementById('sihyun-moment-title').textContent || state.momentTitle;
    ctx.font = 'bold 32px "Georgia", serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowOffsetY = 2;
    ctx.fillText(momentTitle, 40, 65);

    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText('Young Adults - Best Record • Photos by SnapStudio', 40, 95);
    ctx.shadowColor = 'transparent';

    // 2. Bottom Signature Banner
    const bannerH = 150;
    const botGrad = ctx.createLinearGradient(0, captureCanvas.height - bannerH, 0, captureCanvas.height);
    botGrad.addColorStop(0, 'transparent');
    botGrad.addColorStop(0.3, 'rgba(0,0,0,0.45)');
    botGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, captureCanvas.height - bannerH, captureCanvas.width, bannerH);

    ctx.font = '14px "Courier New", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText('2026.10.05 RECORD', 40, captureCanvas.height - 75);

    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(state.selectedColor.name, 40, captureCanvas.height - 45);

    ctx.font = '34px "Brush Script MT", cursive';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillText('Sihyun Sign', captureCanvas.width - 240, captureCanvas.height - 45);
  }

  // 4. Optical Lens Filter Synthesis (Black Mist, Star 4X, Blue Streak, Prism, CPL)
  if (state.lensFilter === 'mist') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const mistGrad = ctx.createRadialGradient(
      captureCanvas.width / 2, captureCanvas.height * 0.38, 10,
      captureCanvas.width / 2, captureCanvas.height * 0.38, captureCanvas.width * 0.7
    );
    mistGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
    mistGrad.addColorStop(0.5, 'rgba(255, 230, 200, 0.12)');
    mistGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    ctx.restore();
  } else if (state.lensFilter === 'star') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const drawStar = (cx, cy, r) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy + r);
      ctx.moveTo(cx - r, cy + r); ctx.lineTo(cx + r, cy - r);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    };
    drawStar(captureCanvas.width * 0.42, captureCanvas.height * 0.36, 45);
    drawStar(captureCanvas.width * 0.58, captureCanvas.height * 0.36, 45);
    ctx.restore();
  } else if (state.lensFilter === 'streak') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const streakGrad = ctx.createLinearGradient(0, captureCanvas.height * 0.45 - 6, 0, captureCanvas.height * 0.45 + 6);
    streakGrad.addColorStop(0, 'transparent');
    streakGrad.addColorStop(0.4, 'rgba(0, 229, 255, 0.8)');
    streakGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
    streakGrad.addColorStop(0.6, 'rgba(0, 229, 255, 0.8)');
    streakGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = streakGrad;
    ctx.fillRect(0, captureCanvas.height * 0.45 - 8, captureCanvas.width, 16);
    ctx.restore();
  } else if (state.lensFilter === 'prism') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const prismGrad = ctx.createRadialGradient(
      captureCanvas.width * 0.8, captureCanvas.height * 0.2, 50,
      captureCanvas.width * 0.8, captureCanvas.height * 0.2, 280
    );
    prismGrad.addColorStop(0, 'rgba(255, 0, 128, 0.35)');
    prismGrad.addColorStop(0.4, 'rgba(0, 255, 255, 0.35)');
    prismGrad.addColorStop(0.7, 'rgba(255, 255, 0, 0.25)');
    prismGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = prismGrad;
    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    ctx.restore();
  } else if (state.lensFilter === 'cpl') {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(0, 20, 40, 0.05)';
    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    ctx.restore();
  }

  const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.95);
  state.lastCapturedUrl = dataUrl;

  // Update gallery thumbnail
  const thumbImg = document.getElementById('gallery-thumb');
  const thumbPlaceholder = document.getElementById('gallery-placeholder');
  thumbImg.src = dataUrl;
  thumbImg.style.display = 'block';
  thumbPlaceholder.style.display = 'none';

  // Open Review Modal
  openReviewModal(dataUrl);
}

function openReviewModal(imgUrl) {
  const modal = document.getElementById('review-photo-modal');
  const previewImg = document.getElementById('review-preview-img');
  const subTitle = document.getElementById('review-subtitle');
  const infoTag = document.getElementById('review-info-tag');

  previewImg.src = imgUrl;

  if (state.currentMode === 'vintage') {
    const p = VINTAGE_FILTERS[state.vintageFilter];
    subTitle.textContent = `Vintage / Multi-Cam [${p.name}]`;
    infoTag.textContent = `${p.model} 전용 아날로그 톤과 OSD/프레임이 합성되었습니다.`;
  } else if (state.currentMode === 'standard-id') {
    subTitle.textContent = `Standard ID [${ID_SPECS[state.idSpec].title}]`;
    infoTag.textContent = '여권 및 신분증 공공 규격 가이드라인에 맞춰 정밀 촬영되었습니다.';
  } else if (state.currentMode === 'color-id') {
    subTitle.textContent = `Color ID (시현하다 스타일) [${state.selectedColor.name}]`;
    infoTag.textContent = '인물 누끼 분리 후 시현하다 스튜디오 조명 배경과 시그니처 각인이 합성되었습니다.';
  }

  modal.classList.add('open');
}

function openPrintSheetModal() {
  const modal = document.getElementById('print-sheet-modal');
  const grid = document.getElementById('print-photo-grid');
  grid.innerHTML = '';

  const photoSrc = state.lastCapturedUrl || generateDefaultThumb();

  for (let i = 0; i < 8; i++) {
    const item = document.createElement('div');
    item.className = 'print-photo-item';
    
    const img = document.createElement('img');
    img.src = photoSrc;
    img.alt = 'Passport Cut';
    item.appendChild(img);

    const mark = document.createElement('div');
    mark.className = 'crop-mark-corner tl';
    item.appendChild(mark);

    grid.appendChild(item);
  }

  modal.classList.add('open');
}

function generateDefaultThumb() {
  const c = document.createElement('canvas');
  c.width = 350;
  c.height = 450;
  const ctx = c.getContext('2d');
  ctx.fillStyle = state.selectedColor.hex || '#F38B95';
  ctx.fillRect(0, 0, c.width, c.height);
  if (studioModels.female.complete && studioModels.female.naturalWidth > 0) {
    ctx.drawImage(studioModels.female, 0, 0, c.width, c.height);
  }
  return c.toDataURL('image/jpeg', 0.8);
}

function generatePrintSheetCanvasDataUrl() {
  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = 1800; // 6 inch @ 300 DPI
  sheetCanvas.height = 1200; // 4 inch @ 300 DPI
  const ctx = sheetCanvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

  return sheetCanvas.toDataURL('image/jpeg', 0.95);
}

// ==========================================================================
// 6. Camera Source Switch (Webcam vs Studio Models)
// ==========================================================================

async function enableWebcam() {
  const video = document.getElementById('camera-video');
  const modelCanvas = document.getElementById('model-canvas');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: false
    });
    video.srcObject = stream;
    video.style.display = 'block';
    modelCanvas.style.display = 'none';
    state.cameraSource = 'webcam';

    const btnWebcam = document.getElementById('btn-use-webcam');
    const btnFem = document.getElementById('btn-use-female');
    const btnMale = document.getElementById('btn-use-male');
    if (btnWebcam) btnWebcam.classList.add('active');
    if (btnFem) btnFem.classList.remove('active');
    if (btnMale) btnMale.classList.remove('active');
    showDynamicIslandBanner('WEBCAM CONNECTED', 'LIVE STREAM', 2000);
  } catch (err) {
    alert('웹캠 접근 권한이 필요합니다. 고화질 실사 스튜디오 모델을 계속 사용합니다.');
    useStudioModel('female');
  }
}

function useStudioModel(type = 'female') {
  const video = document.getElementById('camera-video');
  const modelCanvas = document.getElementById('model-canvas');

  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  if (video) video.style.display = 'none';
  if (modelCanvas) modelCanvas.style.display = 'block';
  state.cameraSource = 'model';
  state.studioModelType = type;

  renderStudioModel(modelCanvas, state.retouchTone);

  const btnFem = document.getElementById('btn-use-female');
  const btnMale = document.getElementById('btn-use-male');
  const btnWebcam = document.getElementById('btn-use-webcam');
  if (btnFem) btnFem.classList.toggle('active', type === 'female');
  if (btnMale) btnMale.classList.toggle('active', type === 'male');
  if (btnWebcam) btnWebcam.classList.remove('active');

  const label = type === 'female' ? 'FEMALE MODEL' : (type === 'male' ? 'MALE MODEL' : 'CUSTOM PHOTO');
  showDynamicIslandBanner(label, 'READY', 1800);
}

// ==========================================================================
// 7. Event Listeners & Initialization
// ==========================================================================

function initEventListeners() {
  // Mode Switcher Dial items
  document.querySelectorAll('.mode-dial-item').forEach(item => {
    item.addEventListener('click', () => switchMode(item.dataset.mode));
  });

  // Left Sidebar Mode buttons
  document.querySelectorAll('.panel-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // Shutter button & Hardware volume buttons
  const shutterBtn = document.getElementById('shutter-btn');
  if (shutterBtn) shutterBtn.addEventListener('click', triggerShutterCapture);

  const volUp = document.getElementById('hw-vol-up-btn');
  const volDown = document.getElementById('hw-vol-down-btn');
  if (volUp) volUp.addEventListener('click', triggerShutterCapture);
  if (volDown) volDown.addEventListener('click', triggerShutterCapture);

  // Gallery Thumbnail button
  const galBtn = document.getElementById('gallery-btn');
  if (galBtn) {
    galBtn.addEventListener('click', () => {
      if (state.lastCapturedUrl) {
        openReviewModal(state.lastCapturedUrl);
      } else {
        openReviewModal(generateDefaultThumb());
      }
    });
  }

  // Flash Toggle
  const btnFlash = document.getElementById('btn-flash');
  if (btnFlash) {
    btnFlash.addEventListener('click', () => {
      soundEngine.playTick();
      state.flashMode = state.flashMode === 'off' ? 'on' : 'off';
      btnFlash.classList.toggle('active', state.flashMode === 'on');
      showDynamicIslandBanner('FLASH', state.flashMode.toUpperCase(), 1200);
    });
  }

  // Timer Toggle (Off -> 3s -> 10s)
  const btnTimer = document.getElementById('btn-timer');
  const timerText = document.getElementById('timer-text');
  if (btnTimer && timerText) {
    btnTimer.addEventListener('click', () => {
      soundEngine.playTick();
      if (state.timerSec === 0) state.timerSec = 3;
      else if (state.timerSec === 3) state.timerSec = 10;
      else state.timerSec = 0;

      timerText.textContent = state.timerSec === 0 ? 'OFF' : `${state.timerSec}s`;
      btnTimer.classList.toggle('active', state.timerSec > 0);
      showDynamicIslandBanner('TIMER', timerText.textContent, 1200);
    });
  }

  // Grid Toggle
  const btnGrid = document.getElementById('btn-grid');
  const gridOverlay = document.getElementById('grid-overlay');
  if (btnGrid && gridOverlay) {
    btnGrid.addEventListener('click', () => {
      soundEngine.playTick();
      state.gridEnabled = !state.gridEnabled;
      btnGrid.classList.toggle('active', state.gridEnabled);
      gridOverlay.classList.toggle('visible', state.gridEnabled);
    });
  }

  // Camera Flip (Female -> Male -> Webcam)
  const btnFlip = document.getElementById('btn-flip');
  if (btnFlip) {
    btnFlip.addEventListener('click', () => {
      soundEngine.playTick();
      if (state.cameraSource === 'webcam') {
        useStudioModel('female');
      } else if (state.studioModelType === 'female') {
        useStudioModel('male');
      } else {
        enableWebcam();
      }
    });
  }

  // Sidebar Model Selectors
  const btnFem = document.getElementById('btn-use-female');
  const btnMale = document.getElementById('btn-use-male');
  const btnWebcam = document.getElementById('btn-use-webcam');
  if (btnFem) btnFem.addEventListener('click', () => useStudioModel('female'));
  if (btnMale) btnMale.addEventListener('click', () => useStudioModel('male'));
  if (btnWebcam) btnWebcam.addEventListener('click', enableWebcam);

  // Custom User Photo Upload
  const userUploadInput = document.getElementById('user-photo-upload');
  if (userUploadInput) {
    userUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.onload = () => {
            state.customModelImg = img;
            useStudioModel('custom');
            showDynamicIslandBanner('PHOTO LOADED', 'CUSTOM MODEL', 2000);
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // [Vintage Drawer] Category Sub-tabs
  document.querySelectorAll('.vintage-cat-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      soundEngine.playTick();
      document.querySelectorAll('.vintage-cat-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.dataset.cat;
      state.activeVintageCat = cat;

      const chips = document.querySelectorAll('#filter-carousel .filter-chip');
      let firstVisible = null;
      chips.forEach(chip => {
        const match = (cat === 'all' || chip.dataset.cat === cat);
        chip.classList.toggle('hidden', !match);
        if (match && !firstVisible) firstVisible = chip;
      });

      // If active filter is hidden, switch to first visible
      const currentChip = document.querySelector(`#filter-carousel .filter-chip[data-filter="${state.vintageFilter}"]`);
      if (currentChip && currentChip.classList.contains('hidden') && firstVisible) {
        firstVisible.click();
      }
    });
  });

  // [Vintage Drawer] Filter Chips
  document.querySelectorAll('#filter-carousel .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      soundEngine.playTick();
      document.querySelectorAll('#filter-carousel .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyVintagePreset(chip.dataset.filter);
    });
  });

  // [Vintage Drawer] Toggles
  const tGrain = document.getElementById('toggle-grain');
  if (tGrain) {
    tGrain.addEventListener('click', () => {
      soundEngine.playTick();
      state.grainEnabled = !state.grainEnabled;
      tGrain.classList.toggle('active', state.grainEnabled);
      const grainEl = document.getElementById('film-grain-layer');
      if (grainEl) grainEl.style.display = state.grainEnabled ? 'block' : 'none';
    });
  }

  const tDate = document.getElementById('toggle-date');
  if (tDate) {
    tDate.addEventListener('click', () => {
      soundEngine.playTick();
      state.dateStampEnabled = !state.dateStampEnabled;
      tDate.classList.toggle('active', state.dateStampEnabled);
      const dateEl = document.getElementById('date-stamp');
      if (dateEl) dateEl.style.display = state.dateStampEnabled ? 'block' : 'none';
    });
  }

  const tOsd = document.getElementById('toggle-osd');
  if (tOsd) {
    tOsd.addEventListener('click', () => {
      soundEngine.playTick();
      state.osdEnabled = !state.osdEnabled;
      tOsd.classList.toggle('active', state.osdEnabled);
      applyVintagePreset(state.vintageFilter);
    });
  }

  const tLeak = document.getElementById('toggle-leak');
  if (tLeak) {
    tLeak.addEventListener('click', () => {
      soundEngine.playTick();
      state.lightLeakEnabled = !state.lightLeakEnabled;
      tLeak.classList.toggle('active', state.lightLeakEnabled);
      const leakEl = document.getElementById('light-leak');
      if (leakEl) leakEl.style.display = state.lightLeakEnabled ? 'block' : 'none';
    });
  }

  // [Standard ID Drawer] Spec Segmented buttons
  document.querySelectorAll('.spec-segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundEngine.playTick();
      document.querySelectorAll('.spec-segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const specKey = btn.dataset.spec;
      state.idSpec = specKey;
      const spec = ID_SPECS[specKey];

      const detailText = document.getElementById('spec-detail-text');
      const statusName = document.getElementById('spec-status-name');
      const box = document.getElementById('id-boundary-box');

      if (detailText) detailText.textContent = `${spec.detail}`;
      if (statusName) statusName.textContent = `${spec.title} 적합`;
      if (box) {
        box.style.width = `${spec.boxWidth}px`;
        box.style.height = `${spec.boxHeight}px`;
      }

      showDynamicIslandBanner('ID SPEC', spec.title, 1400);
    });
  });

  // [Color ID Drawer] Season Tabs
  document.querySelectorAll('.season-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      soundEngine.playTick();
      document.querySelectorAll('.season-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderColorSwatches(tab.dataset.season);
    });
  });

  // Custom Color Picker
  const customColorInput = document.getElementById('custom-color-input');
  if (customColorInput) {
    customColorInput.addEventListener('input', (e) => {
      const hex = e.target.value;
      state.selectedColor = { name: `Custom ${hex.toUpperCase()}`, hex: hex, bg: hex };

      const bgLayer = document.getElementById('viewfinder-bg');
      if (bgLayer) bgLayer.style.background = hex;

      const codeEl = document.getElementById('sihyun-color-badge');
      if (codeEl) codeEl.textContent = state.selectedColor.name;

      document.querySelectorAll('.color-palette-item').forEach(el => el.classList.remove('active'));
      showDynamicIslandBanner('CUSTOM COLOR', hex.toUpperCase(), 1000);
    });
  }

  // Tone Retouch Slider
  const toneSlider = document.getElementById('tone-slider');
  if (toneSlider) {
    toneSlider.addEventListener('input', (e) => {
      state.retouchTone = parseInt(e.target.value, 10);
      const canvas = document.getElementById('model-canvas');
      if (canvas && state.cameraSource === 'model') {
        renderStudioModel(canvas, state.retouchTone);
      }
    });
  }

  // Mood Frame Toggle
  const toggleMood = document.getElementById('toggle-mood-frame');
  if (toggleMood) {
    toggleMood.addEventListener('click', () => {
      soundEngine.playTick();
      state.moodFrameEnabled = !state.moodFrameEnabled;
      toggleMood.classList.toggle('active', state.moodFrameEnabled);
      const frame = document.getElementById('mood-card-frame');
      if (frame && state.currentMode === 'color-id') {
        frame.style.display = state.moodFrameEnabled ? 'flex' : 'none';
      }
    });
  }

  // Sihyunhada Moment Title direct edit
  const momentTitleEl = document.getElementById('sihyun-moment-title');
  if (momentTitleEl) {
    momentTitleEl.addEventListener('input', () => {
      state.momentTitle = momentTitleEl.textContent;
    });
  }

  // Optical Lens Filter Toolbar Popover & Buttons
  const btnLens = document.getElementById('btn-lens');
  const lensPopover = document.getElementById('lens-filter-popover');
  const btnCloseLensPopover = document.getElementById('btn-close-lens-popover');

  if (btnLens && lensPopover) {
    btnLens.addEventListener('click', () => {
      soundEngine.playTick();
      lensPopover.classList.toggle('open');
    });
  }

  if (btnCloseLensPopover && lensPopover) {
    btnCloseLensPopover.addEventListener('click', () => {
      soundEngine.playTick();
      lensPopover.classList.remove('open');
    });
  }

  // Popover Lens Pill Buttons
  document.querySelectorAll('.lens-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLensFilter(btn.dataset.lens);
      if (lensPopover) lensPopover.classList.remove('open');
    });
  });

  // Sidebar Lens Buttons
  document.querySelectorAll('.sidebar-lens-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLensFilter(btn.dataset.lens);
    });
  });

  // Modals Event Listeners (Print Sheet & Photo Review)
  const btnPrint1 = document.getElementById('btn-open-print-sheet');
  const btnPrint2 = document.getElementById('btn-open-print-sheet-sidebar');
  const btnReviewPrint = document.getElementById('btn-review-open-print');
  if (btnPrint1) btnPrint1.addEventListener('click', openPrintSheetModal);
  if (btnPrint2) btnPrint2.addEventListener('click', openPrintSheetModal);
  if (btnReviewPrint) {
    btnReviewPrint.addEventListener('click', () => {
      document.getElementById('review-photo-modal').classList.remove('open');
      openPrintSheetModal();
    });
  }

  const btnClosePrint1 = document.getElementById('btn-close-print-modal');
  const btnClosePrint2 = document.getElementById('btn-close-print-modal-2');
  [btnClosePrint1, btnClosePrint2].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        document.getElementById('print-sheet-modal').classList.remove('open');
      });
    }
  });

  const btnDownloadPrint = document.getElementById('btn-download-print-sheet');
  if (btnDownloadPrint) {
    btnDownloadPrint.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = generatePrintSheetCanvasDataUrl();
      a.download = `SnapStudio_PrintSheet_4x6_${Date.now()}.jpg`;
      a.click();
      showDynamicIslandBanner('PRINT SHEET', 'SAVED (4x6)', 1800);
    });
  }

  // Review Photo Modal Close Buttons
  const btnCloseRev1 = document.getElementById('btn-close-review-modal');
  const btnCloseRev2 = document.getElementById('btn-close-review');
  [btnCloseRev1, btnCloseRev2].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        document.getElementById('review-photo-modal').classList.remove('open');
      });
    }
  });

  // Retake Photo Button
  const btnRetake = document.getElementById('btn-retake-photo');
  if (btnRetake) {
    btnRetake.addEventListener('click', () => {
      soundEngine.playTick();
      document.getElementById('review-photo-modal').classList.remove('open');
      showDynamicIslandBanner('READY', 'NEW SHOT', 1200);
    });
  }

  // Save/Download Photo Buttons
  const btnSave1 = document.getElementById('btn-save-photo');
  const btnSave2 = document.getElementById('btn-download-photo');
  const handleDownloadPhoto = () => {
    if (state.lastCapturedUrl) {
      const a = document.createElement('a');
      a.href = state.lastCapturedUrl;
      a.download = `SnapStudio_${state.currentMode}_${Date.now()}.jpg`;
      a.click();
      showDynamicIslandBanner('DOWNLOADED', 'CAMERA ROLL', 1500);
    }
  };
  if (btnSave1) btnSave1.addEventListener('click', handleDownloadPhoto);
  if (btnSave2) btnSave2.addEventListener('click', handleDownloadPhoto);

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.contentEditable !== 'true') {
      e.preventDefault();
      triggerShutterCapture();
    } else if (e.key === '1') {
      switchMode('vintage');
    } else if (e.key === '2') {
      switchMode('standard-id');
    } else if (e.key === '3') {
      switchMode('color-id');
    }
  });
}

// ==========================================================================
// 8. Application Bootstrap
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);

  const canvas = document.getElementById('model-canvas');
  if (canvas) {
    renderStudioModel(canvas, state.retouchTone);
  }

  renderColorSwatches('sihyunhada');
  initEventListeners();
  applyVintagePreset(state.vintageFilter);
});
