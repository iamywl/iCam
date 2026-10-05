/**
 * SnapStudio - Multi-Camera Studio & Real-time Color Profile System
 * Iconic Cameras Architecture:
 * 1. Canon IXY Digital 50 (Y2K DigiCam Peach Skin)
 * 2. Sony DCR Handycam (90s-00s MiniDV Tape & Glitch)
 * 3. Sony Cyber-shot CCD (Cyber Y2K Cool Blue & Flash)
 * 4. Fuji Instax & Polaroid (Instant Film Card)
 * 5. Sihyunhada Color Studio (Live Real-time Background Changer)
 * 6. Passport & Standard ID (Official Korean Passport HUD & 4x6 Sheet)
 */

// ==========================================================================
// 1. App State & Cameras Specifications
// ==========================================================================
const state = {
  activeCamera: 'canon-ixy', // 'canon-ixy' | 'sony-handycam' | 'sony-cybershot' | 'instax-mini' | 'sihyun-color' | 'passport-id'
  cameraSource: 'model', // 'model' | 'webcam'
  
  // Selected filter per camera
  selectedFilters: {
    'canon-ixy': 'ixy-peach',
    'sony-handycam': 'handy-minidv',
    'sony-cybershot': 'cyber-cool',
    'instax-mini': 'instax-card'
  },

  // Color Studio (Sihyunhada) State
  activeSeason: 'sihyunhada',
  selectedColor: { name: '#01 Blossom Pink', hex: '#F38B95', bg: 'radial-gradient(circle at 50% 38%, #FDB0B8 0%, #F38B95 100%)' },
  retouchTone: 35,
  moodFrameEnabled: true,
  momentTitle: "Wu wanlin's Moment",
  
  // Standard ID State
  idSpec: 'passport', // 'passport' | 'idcard' | 'half' | 'visa'

  // Model Source
  studioModelType: 'female', // 'female' | 'male' | 'custom'
  customModelImg: null,

  // Toolbar & Lens Filter State
  flashMode: 'off',
  timerSec: 0,
  gridEnabled: false,
  lensFilter: 'none', // 'none' | 'mist' | 'star' | 'streak' | 'prism' | 'cpl'
  
  // Captures
  lastCapturedUrl: null
};

// 6 Iconic Cameras Architecture Definition
const CAMERAS = {
  'canon-ixy': {
    id: 'canon-ixy',
    name: 'Canon IXY Digital 50',
    shortName: 'CANON IXY',
    sub: 'Peach Glow',
    icon: '📸',
    badge: 'Y2K DIGICAM',
    osdId: 'canon-ixy-osd',
    drawerId: 'drawer-canon-ixy',
    filters: {
      'ixy-peach': {
        name: 'Peach Glow',
        desc: '뽀샤시 복숭아빛 피부',
        css: 'brightness(1.1) contrast(1.04) saturate(1.18) sepia(0.05)',
        tintRgba: 'rgba(255, 195, 160, 0.12)'
      },
      'ixy-flash': {
        name: 'Flash Pop',
        desc: '디카 직광 플래시',
        css: 'brightness(1.08) contrast(1.18) saturate(1.22) sepia(0.04)',
        tintRgba: 'rgba(255, 220, 180, 0.1)'
      },
      'ixy-pastel': {
        name: 'Pastel Haze',
        desc: '들뜬 파스텔 섀도우',
        css: 'brightness(1.12) contrast(0.96) saturate(1.08) sepia(0.08)',
        tintRgba: 'rgba(255, 235, 240, 0.1)'
      },
      'ixy-night': {
        name: 'Night Party',
        desc: '밤거리 감성 노이즈',
        css: 'brightness(0.98) contrast(1.25) saturate(1.25) sepia(0.14)',
        tintRgba: 'rgba(240, 160, 60, 0.12)'
      }
    }
  },

  'sony-handycam': {
    id: 'sony-handycam',
    name: 'Sony DCR Handycam',
    shortName: 'HANDYCAM',
    sub: 'MiniDV Classic',
    icon: '📹',
    badge: 'MINI-DV',
    osdId: 'sony-handycam-osd',
    drawerId: 'drawer-sony-handycam',
    filters: {
      'handy-minidv': {
        name: 'MiniDV Classic',
        desc: '소니 3CCD 비디오 톤',
        css: 'brightness(1.05) contrast(1.12) saturate(1.22) sepia(0.08)',
        tintRgba: 'rgba(255, 235, 180, 0.08)'
      },
      'handy-vhs': {
        name: 'Hi8 Tape Glitch',
        desc: '스캔라인 테이프 글리치',
        css: 'brightness(1.05) contrast(1.15) saturate(1.18) sepia(0.12)',
        tintRgba: 'rgba(255, 210, 150, 0.1)'
      },
      'handy-super8': {
        name: 'Super 8mm Cine',
        desc: '골든 앰버 홈무비',
        css: 'brightness(0.96) contrast(1.22) saturate(1.15) sepia(0.32)',
        tintRgba: 'rgba(240, 160, 60, 0.15)'
      },
      'handy-nightshot': {
        name: 'NightShot Green',
        desc: '적외선 0 Lux 야간투시',
        css: 'brightness(1.15) contrast(1.3) saturate(2.0) hue-rotate(90deg)',
        tintRgba: 'rgba(0, 255, 120, 0.15)'
      }
    }
  },

  'sony-cybershot': {
    id: 'sony-cybershot',
    name: 'Sony Cyber-shot DSC-P10',
    shortName: 'CYBER-SHOT',
    sub: 'CCD Cool Blue',
    icon: '💿',
    badge: 'CYBER Y2K',
    osdId: 'sony-cybershot-osd',
    drawerId: 'drawer-sony-cybershot',
    filters: {
      'cyber-cool': {
        name: 'CCD Cool Blue',
        desc: '차가운 블루 틴트',
        css: 'brightness(1.06) contrast(1.16) saturate(1.12) hue-rotate(-8deg)',
        tintRgba: 'rgba(160, 205, 255, 0.12)'
      },
      'cyber-magenta': {
        name: 'Cyber Magenta',
        desc: '테크노 네온 마젠타',
        css: 'brightness(1.05) contrast(1.2) saturate(1.35) hue-rotate(295deg)',
        tintRgba: 'rgba(255, 50, 200, 0.12)'
      },
      'cyber-flash': {
        name: 'Flash Sharp',
        desc: '선명하고 쨍한 플래시',
        css: 'brightness(1.08) contrast(1.26) saturate(1.2) sepia(0.02)',
        tintRgba: 'rgba(255, 240, 220, 0.08)'
      },
      'cyber-matrix': {
        name: 'Matrix Green',
        desc: '세기말 매트릭스 그린',
        css: 'brightness(1.02) contrast(1.25) saturate(1.3) hue-rotate(75deg)',
        tintRgba: 'rgba(50, 255, 100, 0.12)'
      }
    }
  },

  'instax-mini': {
    id: 'instax-mini',
    name: 'Fuji Instax & Polaroid',
    shortName: 'INSTAX',
    sub: 'Instax Soft',
    icon: '🖼️',
    badge: 'INSTANT FILM',
    osdId: 'instax-frame',
    drawerId: 'drawer-instax-mini',
    filters: {
      'instax-card': {
        name: 'Instax Soft',
        desc: '화이트 카드 프레임',
        css: 'brightness(1.1) contrast(0.98) saturate(1.06) sepia(0.05)',
        tintRgba: 'rgba(255, 245, 235, 0.08)'
      },
      'polaroid-square': {
        name: 'Polaroid 600',
        desc: '클래식 정방형 스퀘어',
        css: 'brightness(1.04) contrast(1.08) saturate(1.08) sepia(0.12)',
        tintRgba: 'rgba(255, 215, 160, 0.1)'
      },
      'instant-bw': {
        name: 'Warm Mono',
        desc: '웜톤 흑백 즉석사진',
        css: 'grayscale(1) contrast(1.25) brightness(1.02)',
        tintRgba: null
      },
      'instant-rainbow': {
        name: 'Rainbow Edge',
        desc: '비비드 무지개 카드',
        css: 'brightness(1.08) contrast(1.14) saturate(1.3)',
        tintRgba: null
      }
    }
  },

  'sihyun-color': {
    id: 'sihyun-color',
    name: '시현하다 Color Studio',
    shortName: 'COLOR STUDIO',
    sub: '#01 Blossom Pink',
    icon: '🎨',
    badge: 'LIVE COLOR',
    osdId: 'mood-card-frame',
    drawerId: 'drawer-sihyun-color',
    filters: null
  },

  'passport-id': {
    id: 'passport-id',
    name: '여권 / 신분증 규격 카메라',
    shortName: 'PASSPORT ID',
    sub: '대한민국 여권',
    icon: '🪪',
    badge: 'STANDARD ID',
    osdId: 'standard-id-hud',
    drawerId: 'drawer-passport-id',
    filters: null
  }
};

// Optical Lens Filters Specifications
const LENS_FILTERS = {
  none: { name: '기본 (Clear)', title: '광학 렌즈 미장착' },
  mist: { name: '블랙 미스트', title: 'Black Mist (Pro-Mist)' },
  star: { name: '크로스 4X', title: 'Cross Star 4-Point' },
  streak: { name: '블루 스트릭', title: 'Blue Streak (Anamorphic)' },
  prism: { name: '프리즘 분광', title: 'Prism Spectrum Dispersion' },
  cpl: { name: 'CPL 편광', title: 'Circular Polarizer (CPL)' }
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
  photo: [
    { name: '#29 Textured Canvas', hex: '#8C8D91', bg: 'radial-gradient(circle at 50% 35%, #B5B7BD 0%, #75777D 60%, #4D4E52 100%)' },
    { name: '#30 Golden Sunset', hex: '#FF7043', bg: 'linear-gradient(180deg, #FF8A65 0%, #FF7043 45%, #BF360C 100%)' },
    { name: '#31 Blue Hour Magic', hex: '#3949AB', bg: 'linear-gradient(180deg, #1A237E 0%, #283593 50%, #5C6BC0 100%)' },
    { name: '#32 Warm Wood Studio', hex: '#8D6E63', bg: 'radial-gradient(circle at 50% 40%, #A1887F 0%, #6D4C41 70%, #3E2723 100%)' },
    { name: '#33 Dark Moody Noir', hex: '#212121', bg: 'radial-gradient(circle at 50% 35%, #424242 0%, #212121 70%, #000000 100%)' },
    { name: '#34 Fairy Lavender', hex: '#AB47BC', bg: 'radial-gradient(circle at 50% 38%, #CE93D8 0%, #AB47BC 65%, #6A1B9A 100%)' }
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
    boxWidth: 250,
    boxHeight: 320
  },
  idcard: {
    title: '주민등록증 / 운전면허증',
    detail: '3.5 x 4.5 cm (최근 6개월 이내 촬영)',
    boxWidth: 250,
    boxHeight: 320
  },
  half: {
    title: '반명함판 (이력서/학생증)',
    detail: '3.0 x 4.0 cm (취업·자격증 공용 규격)',
    boxWidth: 240,
    boxHeight: 320
  },
  visa: {
    title: '미국 / 글로벌 비자',
    detail: '5.0 x 5.0 cm (2x2 inch 정방형 규격)',
    boxWidth: 280,
    boxHeight: 280
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
    
    // Mechanical Shutter Click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);

    // Camera Motor / Mirror Slap
    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1200;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now + 0.02);
  }

  playTick() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.025);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
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

const studioModels = {
  female: new Image(),
  male: new Image()
};
studioModels.female.src = 'model_female.png';
studioModels.male.src = 'model_male.png';

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

  let activeImg = null;
  if (state.studioModelType === 'custom' && state.customModelImg) {
    activeImg = state.customModelImg;
  } else if (state.studioModelType === 'male') {
    activeImg = studioModels.male;
  } else {
    activeImg = studioModels.female;
  }

  const toneRatio = 1 + (toneVal - 35) * 0.0035;

  ctx.save();

  if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
    ctx.filter = `brightness(${toneRatio}) contrast(${1 + (toneVal - 35) * 0.001})`;

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
// 4. Multi-Camera Switcher Engine & Real-time Live Background
// ==========================================================================

function updateClock() {
  const clockEl = document.getElementById('status-time');
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

  if (dateCodeEl) dateCodeEl.textContent = `${yyyy}.${mm}.${dd} RECORD`;
  if (dateStampEl) dateStampEl.textContent = `'${String(yyyy).slice(2)} ${mm} ${dd}`;
}

function showDynamicIslandBanner(title, subtitle, durationMs = 2200) {
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

// Core Camera Switching Engine
function switchCamera(camId) {
  if (!CAMERAS[camId]) return;
  state.activeCamera = camId;
  const cam = CAMERAS[camId];
  soundEngine.playTick();

  // 1. Update Dial Active Class & Position Shift
  const dialItems = document.querySelectorAll('#mode-dial-list .mode-dial-item');
  dialItems.forEach(item => {
    item.classList.toggle('active', item.dataset.cam === camId);
  });

  const dialList = document.getElementById('mode-dial-list');
  const dialOffsets = {
    'canon-ixy': 110,
    'sony-handycam': 60,
    'sony-cybershot': 0,
    'instax-mini': -60,
    'sihyun-color': -120,
    'passport-id': -180
  };
  if (dialList && dialOffsets[camId] !== undefined) {
    dialList.style.transform = `translateX(${dialOffsets[camId]}px)`;
  }

  // 2. Update Left Sidebar Rack Active State
  document.querySelectorAll('.panel-modes .panel-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cam === camId);
  });

  // 3. Update Viewfinder Top Active Camera Badge HUD
  const badgeTitle = document.getElementById('cam-badge-title');
  const badgeSub = document.getElementById('cam-badge-sub');
  const badgeIcon = document.getElementById('cam-badge-icon');
  if (badgeTitle) badgeTitle.textContent = cam.name;
  if (badgeIcon) badgeIcon.textContent = cam.icon;
  if (badgeSub) badgeSub.textContent = cam.sub;

  // 4. Switch Control Drawer Panel
  document.querySelectorAll('.control-drawer .mode-control-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === cam.drawerId);
  });

  // 5. Manage Viewfinder OSD Overlays
  const allOsdIds = [
    'canon-ixy-osd',
    'sony-handycam-osd',
    'sony-cybershot-osd',
    'instax-frame',
    'mood-card-frame',
    'standard-id-hud',
    'vhs-tape-osd',
    'super8-overlay',
    'polaroid-frame'
  ];
  allOsdIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  if (cam.osdId) {
    const targetOsd = document.getElementById(cam.osdId);
    if (targetOsd) targetOsd.style.display = (cam.id === 'sihyun-color' ? 'flex' : 'block');
  }

  // 6. Handle Background Layer (Real-time Live Color for Sihyunhada)
  const bgLayer = document.getElementById('viewfinder-bg');
  if (bgLayer) {
    if (camId === 'sihyun-color') {
      bgLayer.style.background = state.selectedColor.bg || state.selectedColor.hex;
    } else if (camId === 'passport-id') {
      bgLayer.style.background = '#f7f8fa';
    } else {
      bgLayer.style.background = '#15171c';
    }
  }

  // 7. Apply Camera-specific Filter to Media
  applyCurrentCameraFilter();

  // 8. Update Right Spec Sidebar
  updateRightSpecCard(camId);

  // 9. Announce via Dynamic Island
  showDynamicIslandBanner(cam.badge, cam.shortName, 1800);
}

function applyCurrentCameraFilter() {
  const cam = CAMERAS[state.activeCamera];
  const mediaFilterEl = state.cameraSource === 'webcam' ? document.getElementById('camera-video') : document.getElementById('model-canvas');
  if (!mediaFilterEl) return;

  if (cam.filters) {
    const activeFilterKey = state.selectedFilters[cam.id];
    const filterSpec = cam.filters[activeFilterKey] || Object.values(cam.filters)[0];
    mediaFilterEl.style.filter = filterSpec.css;
  } else if (cam.id === 'sihyun-color') {
    const toneRatio = 1 + (state.retouchTone - 35) * 0.0035;
    mediaFilterEl.style.filter = `brightness(${toneRatio}) contrast(${1 + (state.retouchTone - 35) * 0.001})`;
  } else {
    mediaFilterEl.style.filter = 'none';
  }
}

// Right Spec Card Update
function updateRightSpecCard(camId) {
  const cam = CAMERAS[camId];
  const badgeEl = document.getElementById('active-mode-badge');
  const titleEl = document.getElementById('mode-spec-title');
  const descEl = document.getElementById('mode-spec-desc');
  const featureListEl = document.getElementById('mode-feature-list');

  if (!badgeEl || !titleEl || !descEl || !featureListEl || !cam) return;

  badgeEl.textContent = cam.badge;
  titleEl.textContent = cam.name;

  if (camId === 'canon-ixy') {
    descEl.textContent = '2000년대 얼짱들이 열광한 전설의 일본 명기 디카. 뽀샤시하고 맑은 피부톤과 복숭아빛 생기, 오렌지색 디지털 데이트 각인이 완벽히 재현됩니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>전용 필터 4종: Peach Glow(복숭아 뽀샤시), Flash Pop(디카 플래시), Pastel Haze, Night Party</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>캐논 AiAF 오토포커스 프레임 & 오렌지 디지털 데이트 각인 OSD 탑재</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>Y2K 디카 특유의 직광 플래시 중앙 핫스팟 & 비네팅 렌더링</span></li>
    `;
  } else if (camId === 'sony-handycam') {
    descEl.textContent = '90년대 후반~2000년대 초반 소니 미니DV 캠코더. 특유의 따뜻하고 묵직한 3CCD 비디오 질감과 타임코드 녹화 화면이 살아납니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>전용 필터 4종: MiniDV Classic, Hi8 Tape Glitch, Super 8mm Cine, NightShot Green</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>실시간 ● REC 타임코드, SP 0:00:14, Hi-Fi STEREO OSD 오버레이</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>아날로그 비디오 테이프 수평 스캔라인 글리치 이펙트 토글 지원</span></li>
    `;
  } else if (camId === 'sony-cybershot') {
    descEl.textContent = '2000년대 세기말 테크노 미래주의 감성의 소니 사이버샷 CCD. 차가운 쿨블루 틴트와 쨍하고 선명한 플래시 대비가 특징입니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>전용 필터 4종: CCD Cool Blue, Cyber Magenta, Flash Sharp, Matrix Green</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>사이버샷 5.1 MEGAPIXELS, DSC-P10, 정밀 4코너 포커스 브래킷 HUD</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>하얗고 투명한 쿨톤 피부 표현과 세기말 Y2K 비주얼 완성</span></li>
    `;
  } else if (camId === 'instax-mini') {
    descEl.textContent = '세상에 단 한 장뿐인 아날로그 즉석인화 카메라. 화사한 파스텔 톤과 하단 여백이 돋보이는 시그니처 화이트 카드 프레임이 제공됩니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>전용 필터 4종: Instax Soft, Polaroid 600, Warm Mono, Rainbow Edge</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>하단 친필 서명이 가능한 instax mini 시그니처 화이트 프레임</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>들뜬 섀도우와 따뜻한 즉석인화 필름 계조 온디바이스 합성</span></li>
    `;
  } else if (camId === 'sihyun-color') {
    descEl.textContent = '나만의 퍼스널 컬러 배경이 실시간으로 라이브 변환되는 프로필 카메라. 뷰파인더에서 실시간으로 인물 뒤 배경이 부드럽게 전환됩니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>실시간 배경 라이브 치환: 시현하다 Best 8색 + 4계절 16색 + 그라디언트 터치 즉시 반영</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>스튜디오 조명 방사형 센터 라이트(Radial Lighting) 백드롭 재현</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>상단 [이름]'s Moment 레터링 (직접 편집 가능) & 하단 작가 친필 서명 각인</span></li>
    `;
  } else if (camId === 'passport-id') {
    descEl.textContent = '외교부 여권 및 공공기관 신분증 규격을 100% 충족하는 홈 증명사진 스튜디오. 정밀 규격 가이드선과 4x6 인화 시트를 제공합니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>정밀 규격선: 정수리선, 눈높이, 턱선, 어깨 수평선 실시간 오버레이</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>여권(3.5x4.5), 주민등록/면허, 반명함(3x4), 비자(5x5) 원클릭 규격 전환</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>4x6인치 8분할 인쇄 시트(재단 안내선 포함) 원클릭 고해상도 출력</span></li>
    `;
  }
}

// Optical Lens Filter System (Black Mist, Star, Streak, Prism, CPL)
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

  document.querySelectorAll('.lens-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lens === filterKey);
  });
  document.querySelectorAll('.sidebar-lens-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lens === filterKey);
  });

  const btnLens = document.getElementById('btn-lens');
  if (btnLens) {
    btnLens.classList.toggle('active', filterKey !== 'none');
  }

  const meta = LENS_FILTERS[filterKey] || LENS_FILTERS.none;
  showDynamicIslandBanner('LENS FILTER', meta.name.toUpperCase(), 1500);
}

// Real-time Background Swatches Renderer & Live Transition
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

    // Live Real-time Background Color Change
    itemEl.addEventListener('click', () => {
      soundEngine.playTick();
      state.selectedColor = item;

      document.querySelectorAll('.color-palette-item').forEach(el => el.classList.remove('active'));
      itemEl.classList.add('active');

      // 1. Immediately Change Viewfinder Background in Real-time
      const bgLayer = document.getElementById('viewfinder-bg');
      if (bgLayer) {
        bgLayer.style.background = item.bg || item.hex;
      }

      // 2. Update OSD Badge & Camera Subtitle
      const codeEl = document.getElementById('sihyun-color-badge');
      if (codeEl) codeEl.textContent = item.name;

      const badgeSub = document.getElementById('cam-badge-sub');
      if (badgeSub && state.activeCamera === 'sihyun-color') {
        badgeSub.textContent = item.name.split(' ')[1] || item.name;
      }

      showDynamicIslandBanner('LIVE BG COLOR', item.name, 1200);
    });

    container.appendChild(itemEl);
  });
}

// ==========================================================================
// 5. High-Resolution Shutter Capture & Synthesis Engine
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

  const flashScreen = document.getElementById('flash-screen');
  flashScreen.classList.add('active');
  setTimeout(() => flashScreen.classList.remove('active'), 320);

  showDynamicIslandBanner('PHOTO SAVED', 'PROCESSED', 2200);

  const captureCanvas = document.createElement('canvas');
  captureCanvas.width = 780;
  captureCanvas.height = 1040;
  const ctx = captureCanvas.getContext('2d');

  const cam = CAMERAS[state.activeCamera];

  // 1. Render Background
  if (state.activeCamera === 'sihyun-color') {
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
  } else if (state.activeCamera === 'passport-id') {
    ctx.fillStyle = '#f7f8fa';
    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
  } else {
    ctx.fillStyle = '#15171c';
    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
  }

  // 2. Determine Filter CSS for Subject
  let activeFilter = 'none';
  if (cam.filters) {
    const fKey = state.selectedFilters[cam.id];
    const spec = cam.filters[fKey] || Object.values(cam.filters)[0];
    activeFilter = spec.css;
  } else if (cam.id === 'sihyun-color') {
    const toneRatio = 1 + (state.retouchTone - 35) * 0.0035;
    activeFilter = `brightness(${toneRatio}) contrast(${1 + (state.retouchTone - 35) * 0.001})`;
  }

  // 3. Draw Subject (Transparent Model or Mirrored Webcam)
  if (state.cameraSource === 'webcam') {
    const video = document.getElementById('camera-video');
    if (video.videoWidth) {
      ctx.save();
      ctx.filter = activeFilter;
      ctx.translate(captureCanvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
      ctx.restore();
    }
  } else {
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
      ctx.filter = activeFilter;

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

  // 4. Tint & Direct Flash Falloff Overlay
  if (cam.filters) {
    const fKey = state.selectedFilters[cam.id];
    const spec = cam.filters[fKey] || Object.values(cam.filters)[0];
    if (spec.tintRgba) {
      ctx.save();
      ctx.fillStyle = spec.tintRgba;
      ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
      ctx.restore();
    }

    // Direct Flash Vignette for DigiCam & Handycam
    if (cam.id === 'canon-ixy' || cam.id === 'sony-cybershot' || cam.id === 'sony-handycam') {
      ctx.save();
      const flashGrad = ctx.createRadialGradient(
        captureCanvas.width / 2, captureCanvas.height * 0.4, captureCanvas.width * 0.25,
        captureCanvas.width / 2, captureCanvas.height * 0.4, captureCanvas.width * 0.75
      );
      flashGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      flashGrad.addColorStop(0.6, 'transparent');
      flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
      ctx.restore();
    }
  }

  // 5. Camera-Specific OSD Watermarks & Frames
  if (cam.id === 'canon-ixy') {
    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.fillStyle = '#ff9500';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText("'26 10 05 14:28", captureCanvas.width - 270, captureCanvas.height - 40);
    ctx.shadowColor = 'transparent';
  } else if (cam.id === 'sony-handycam') {
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.fillStyle = '#ff3b30';
    ctx.fillText('● REC', 40, 60);
    ctx.fillStyle = '#00ffcc';
    ctx.fillText('SP 0:00:14  SONY DCR', 130, 60);
    ctx.fillText('Hi-Fi STEREO [DV]', 40, captureCanvas.height - 40);
    ctx.fillText('BATT ▮▮▮▯', captureCanvas.width - 200, captureCanvas.height - 40);
  } else if (cam.id === 'sony-cybershot') {
    ctx.font = 'bold 22px -apple-system, sans-serif';
    ctx.fillStyle = '#ff9f0a';
    ctx.fillText('Cyber-shot', 40, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px -apple-system, sans-serif';
    ctx.fillText('5.1 MEGAPIXELS', captureCanvas.width - 200, 60);
    ctx.fillText('DSC-P10  ISO 100', 40, captureCanvas.height - 40);
  } else if (cam.id === 'instax-mini') {
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
    ctx.fillText("'26 10 05", captureCanvas.width - 170, captureCanvas.height - 55);
  } else if (cam.id === 'sihyun-color' && state.moodFrameEnabled) {
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

  // 6. Optical Lens Filter Synthesis (Mist, Star, Streak, Prism, CPL)
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

  const thumbImg = document.getElementById('gallery-thumb');
  const thumbPlaceholder = document.getElementById('gallery-placeholder');
  thumbImg.src = dataUrl;
  thumbImg.style.display = 'block';
  thumbPlaceholder.style.display = 'none';

  setTimeout(() => {
    openReviewModal(dataUrl);
  }, 350);
}

function openReviewModal(imgDataUrl) {
  const modal = document.getElementById('review-photo-modal');
  const previewImg = document.getElementById('review-preview-img');
  const subtitle = document.getElementById('review-subtitle');
  const infoTag = document.getElementById('review-info-tag');

  const cam = CAMERAS[state.activeCamera];
  previewImg.src = imgDataUrl;
  subtitle.textContent = `SnapStudio • ${cam.name}`;
  infoTag.textContent = `${cam.name} 고유 광학 톤과 하이라이트가 온디바이스로 합성되었습니다.`;

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
    item.appendChild(img);

    const mark = document.createElement('div');
    mark.className = 'print-crop-mark';
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

// Camera Source Switch (Webcam vs Studio Models)
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
    applyCurrentCameraFilter();
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
  applyCurrentCameraFilter();

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
// 6. Event Listeners & Bootstrapping
// ==========================================================================

function initEventListeners() {
  // 1. Bottom Camera Switcher Dial items
  document.querySelectorAll('#mode-dial-list .mode-dial-item').forEach(item => {
    item.addEventListener('click', () => switchCamera(item.dataset.cam));
  });

  // 2. Left Sidebar Camera Rack Buttons
  document.querySelectorAll('.panel-modes .panel-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchCamera(btn.dataset.cam));
  });

  // 3. Shutter & Volume Hardware Buttons
  const shutterBtn = document.getElementById('shutter-btn');
  if (shutterBtn) shutterBtn.addEventListener('click', triggerShutterCapture);

  const volUp = document.getElementById('hw-vol-up-btn');
  const volDown = document.getElementById('hw-vol-down-btn');
  if (volUp) volUp.addEventListener('click', triggerShutterCapture);
  if (volDown) volDown.addEventListener('click', triggerShutterCapture);

  // 4. Gallery Thumbnail
  const galBtn = document.getElementById('gallery-btn');
  if (galBtn) {
    galBtn.addEventListener('click', () => {
      openReviewModal(state.lastCapturedUrl || generateDefaultThumb());
    });
  }

  // 5. Flash Toggle
  const btnFlash = document.getElementById('btn-flash');
  if (btnFlash) {
    btnFlash.addEventListener('click', () => {
      soundEngine.playTick();
      state.flashMode = state.flashMode === 'off' ? 'on' : 'off';
      btnFlash.classList.toggle('active', state.flashMode === 'on');
      showDynamicIslandBanner('FLASH', state.flashMode.toUpperCase(), 1200);
    });
  }

  // 6. Timer Toggle
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

  // 7. Grid Toggle
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

  // 8. Camera Flip (Female -> Male -> Webcam)
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

  // 9. Camera Filter Chips in All Drawers
  document.querySelectorAll('.filter-carousel .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      soundEngine.playTick();
      const parentDrawer = chip.closest('.mode-control-panel');
      if (parentDrawer) {
        parentDrawer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      }
      chip.classList.add('active');

      const filterKey = chip.dataset.filter;
      state.selectedFilters[state.activeCamera] = filterKey;
      applyCurrentCameraFilter();

      const cam = CAMERAS[state.activeCamera];
      const spec = cam.filters ? cam.filters[filterKey] : null;
      if (spec) {
        const badgeSub = document.getElementById('cam-badge-sub');
        if (badgeSub) badgeSub.textContent = spec.name;
        showDynamicIslandBanner(cam.shortName, spec.name, 1200);
      }
    });
  });

  // 10. Optical Lens Filter Toolbar Popover & Buttons
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

  document.querySelectorAll('.lens-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLensFilter(btn.dataset.lens);
      if (lensPopover) lensPopover.classList.remove('open');
    });
  });

  document.querySelectorAll('.sidebar-lens-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLensFilter(btn.dataset.lens);
    });
  });

  // 11. Color Studio Season Tabs
  document.querySelectorAll('.color-season-tabs .season-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      soundEngine.playTick();
      document.querySelectorAll('.color-season-tabs .season-tab-btn').forEach(t => t.classList.remove('active'));
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

      const badgeSub = document.getElementById('cam-badge-sub');
      if (badgeSub && state.activeCamera === 'sihyun-color') {
        badgeSub.textContent = hex.toUpperCase();
      }

      document.querySelectorAll('.color-palette-item').forEach(el => el.classList.remove('active'));
      showDynamicIslandBanner('LIVE BG COLOR', hex.toUpperCase(), 1000);
    });
  }

  // Retouch Tone Slider
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
      if (frame && state.activeCamera === 'sihyun-color') {
        frame.style.display = state.moodFrameEnabled ? 'flex' : 'none';
      }
    });
  }

  // Editable Moment Title
  const momentTitleEl = document.getElementById('sihyun-moment-title');
  if (momentTitleEl) {
    momentTitleEl.addEventListener('input', () => {
      state.momentTitle = momentTitleEl.textContent;
    });
  }

  // Standard ID Specs Buttons
  document.querySelectorAll('.spec-segmented-control .spec-segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundEngine.playTick();
      document.querySelectorAll('.spec-segmented-control .spec-segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const specKey = btn.dataset.spec;
      state.idSpec = specKey;
      const spec = ID_SPECS[specKey];

      const detailText = document.getElementById('spec-detail-text');
      const statusName = document.getElementById('spec-status-name');
      const box = document.getElementById('id-boundary-box');

      if (detailText) detailText.textContent = spec.detail;
      if (statusName) statusName.textContent = `${spec.title} 적합`;
      if (box) {
        box.style.width = `${spec.boxWidth}px`;
        box.style.height = `${spec.boxHeight}px`;
      }

      showDynamicIslandBanner('ID SPEC', spec.title, 1400);
    });
  });

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

  // Modals Event Listeners
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

  const btnCloseRev1 = document.getElementById('btn-close-review-modal');
  const btnCloseRev2 = document.getElementById('btn-close-review');
  [btnCloseRev1, btnCloseRev2].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        document.getElementById('review-photo-modal').classList.remove('open');
      });
    }
  });

  const btnRetake = document.getElementById('btn-retake-photo');
  if (btnRetake) {
    btnRetake.addEventListener('click', () => {
      soundEngine.playTick();
      document.getElementById('review-photo-modal').classList.remove('open');
      showDynamicIslandBanner('READY', 'NEW SHOT', 1200);
    });
  }

  const btnSave1 = document.getElementById('btn-save-photo');
  const btnSave2 = document.getElementById('btn-download-photo');
  const handleDownloadPhoto = () => {
    if (state.lastCapturedUrl) {
      const a = document.createElement('a');
      a.href = state.lastCapturedUrl;
      a.download = `SnapStudio_${state.activeCamera}_${Date.now()}.jpg`;
      a.click();
      showDynamicIslandBanner('DOWNLOADED', 'CAMERA ROLL', 1500);
    }
  };
  if (btnSave1) btnSave1.addEventListener('click', handleDownloadPhoto);
  if (btnSave2) btnSave2.addEventListener('click', handleDownloadPhoto);

  // Keyboard Shortcuts (1~6 for Cameras)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.contentEditable !== 'true') {
      e.preventDefault();
      triggerShutterCapture();
    } else if (e.key === '1') {
      switchCamera('canon-ixy');
    } else if (e.key === '2') {
      switchCamera('sony-handycam');
    } else if (e.key === '3') {
      switchCamera('sony-cybershot');
    } else if (e.key === '4') {
      switchCamera('instax-mini');
    } else if (e.key === '5') {
      switchCamera('sihyun-color');
    } else if (e.key === '6') {
      switchCamera('passport-id');
    }
  });
}

// ==========================================================================
// 7. Application Bootstrap
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

  // Start with iconic Canon IXY Digital 50
  switchCamera('canon-ixy');
});
