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
  facingMode: 'user', // 'user' | 'environment'
  currentStream: null,
  
  // Selected filter per camera
  selectedFilters: {
    'canon-ixy': 'ixy-peach',
    'sony-handycam': 'handy-minidv',
    'sony-cybershot': 'cyber-cool',
    'olympus-mju': 'mju-standard',
    'contax-t2': 'zeiss-warm',
    'ricoh-gr': 'gr-bw-high',
    'leica-m': 'leica-summilux',
    'citypop-80s': 'city-sunset',
    'oldfilm-35mm': 'film-cinestill',
    'hasselblad-500cm': 'hassel-planar',
    'polaroid-sx70': 'sx70-fade',
    'fuji-quicksnap': 'quicksnap-86',
    'kyocera-samurai': 'samurai-half',
    'instax-mini': 'instax-card'
  },

  // QuickTake Video Recording State
  isRecordingVideo: false,
  recordingSeconds: 0,
  recordingTimerInterval: null,
  mediaRecorder: null,
  recordedVideoChunks: [],

  // Gallery & EXIF Storage
  gallery: [],
  selectedGalleryIndex: 0,

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

// Apple HIG / SF Symbols Vector SVG Icons for 16 Iconic Cameras
const CAM_SVG_ICONS = {
  'canon-ixy': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="3"/><circle cx="12" cy="13" r="4"/><circle cx="18" cy="9" r="1" fill="currentColor"/></svg>`,
  'sony-handycam': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 7-6 4v2l6 4V7z"/><rect x="2" y="6" width="14" height="12" rx="2"/><circle cx="9" cy="12" r="2.5"/></svg>`,
  'sony-cybershot': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="11" cy="12.5" r="3.5"/><polygon points="18 8 16 11 18 11 17 14 20 10 18 10" fill="currentColor"/></svg>`,
  'olympus-mju': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="4"/><path d="M7 6v14"/><circle cx="14" cy="13" r="3.5"/></svg>`,
  'contax-t2': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="4"/><circle cx="12" cy="12.5" r="1.5"/><line x1="6" y1="9" x2="8" y2="9"/></svg>`,
  'ricoh-gr': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="10" cy="12.5" r="3.5"/><path d="M17 10h3v5h-3z"/></svg>`,
  'leica-m': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="13" cy="12.5" r="4"/><circle cx="6" cy="9.5" r="1.5" fill="#ff453a" stroke="#ff453a"/></svg>`,
  'citypop-80s': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><circle cx="16" cy="12" r="2.5"/><path d="M8 14.5h8"/></svg>`,
  'oldfilm-35mm': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="12" height="16" rx="2"/><rect x="16" y="8" width="4" height="8" rx="1"/><circle cx="10" cy="8" r="1.5"/><circle cx="10" cy="12" r="1.5"/><circle cx="10" cy="16" r="1.5"/></svg>`,
  'instax-mini': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><rect x="6.5" y="5.5" width="11" height="10" rx="1"/><circle cx="12" cy="18" r="0.75" fill="currentColor"/></svg>`,
  'sihyun-color': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/><circle cx="16" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="15" r="1.5" fill="currentColor"/><circle cx="9" cy="14" r="1.5" fill="currentColor"/></svg>`,
  'passport-id': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17c0-2 1.5-3 3.5-3s3.5 1 3.5 3"/><line x1="14" y1="9" x2="19" y2="9"/><line x1="14" y1="13" x2="19" y2="13"/></svg>`,
  'hasselblad-500cm': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M7 5V3h10v2"/></svg>`,
  'polaroid-sx70': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 19 3-11 12 3 3 8z"/><polygon points="6 8 12 4 18 11"/><circle cx="12" cy="14" r="2.5"/></svg>`,
  'fuji-quicksnap': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="13" rx="2"/><circle cx="10" cy="12.5" r="3"/><circle cx="18" cy="9" r="1.5" fill="currentColor"/><path d="M2 10h5"/></svg>`,
  'kyocera-samurai': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="3"/><circle cx="12" cy="10" r="3.5"/><line x1="12" y1="3" x2="12" y2="21" stroke-dasharray="2 2"/><rect x="8" y="16" width="8" height="3" rx="1"/></svg>`,
  'default': `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`
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
        name: 'Clear Sunlight',
        desc: '창가 자연광 투명 얼짱 톤',
        css: 'brightness(1.12) contrast(1.08) saturate(1.24) sepia(0.02)',
        tintRgba: 'rgba(255, 230, 195, 0.08)'
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
        css: 'brightness(1.08) contrast(1.12) saturate(1.22) sepia(0.06)',
        tintRgba: 'rgba(255, 235, 180, 0.08)'
      },
      'handy-vhs': {
        name: 'Hi8 Tape Glitch',
        desc: '스캔라인 테이프 글리치',
        css: 'brightness(1.06) contrast(1.15) saturate(1.18) sepia(0.10)',
        tintRgba: 'rgba(255, 210, 150, 0.1)'
      },
      'handy-super8': {
        name: 'Super 8mm Cine',
        desc: '골든 앰버 홈무비',
        css: 'brightness(1.04) contrast(1.18) saturate(1.20) sepia(0.20)',
        tintRgba: 'rgba(240, 180, 80, 0.12)'
      },
      'handy-nightshot': {
        name: 'Retro Sunshine 90s',
        desc: '90s 여름 바캉스 햇살 캠코더',
        css: 'brightness(1.10) contrast(1.08) saturate(1.26) sepia(0.05)',
        tintRgba: 'rgba(255, 225, 160, 0.10)'
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
        css: 'brightness(1.08) contrast(1.16) saturate(1.14) hue-rotate(-6deg)',
        tintRgba: 'rgba(160, 205, 255, 0.10)'
      },
      'cyber-magenta': {
        name: 'Clean Cyber White',
        desc: 'CCD 센서 투명하고 새하얀 피부',
        css: 'brightness(1.12) contrast(1.15) saturate(1.16) sepia(0.02)',
        tintRgba: 'rgba(225, 240, 255, 0.08)'
      },
      'cyber-flash': {
        name: 'Flash Sharp',
        desc: '선명하고 쨍한 플래시',
        css: 'brightness(1.12) contrast(1.24) saturate(1.20) sepia(0.02)',
        tintRgba: 'rgba(255, 240, 220, 0.08)'
      },
      'cyber-matrix': {
        name: 'Y2K Pastel Glow',
        desc: '부드러운 라벤더-핑크 파스텔',
        css: 'brightness(1.12) contrast(1.06) saturate(1.22) sepia(0.03)',
        tintRgba: 'rgba(245, 215, 255, 0.08)'
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

  'olympus-mju': {
    id: 'olympus-mju',
    name: 'Olympus μ [mju:] II',
    shortName: 'OLYMPUS μ2',
    sub: 'μ Standard',
    icon: '📷',
    badge: '35mm f/2.8 FILM',
    osdId: 'olympus-osd',
    drawerId: 'drawer-olympus-mju',
    filters: {
      'mju-standard': {
        name: 'μ Standard',
        desc: '자연스러운 스트리트 필름',
        css: 'brightness(1.04) contrast(1.18) saturate(1.16) sepia(0.06)',
        tintRgba: 'rgba(255, 235, 200, 0.06)'
      },
      'mju-night': {
        name: 'Daylight Street Flash',
        desc: '긴자 스트리트 한낮의 직광 플래시',
        css: 'brightness(1.14) contrast(1.22) saturate(1.20) sepia(0.03)',
        tintRgba: 'rgba(255, 235, 205, 0.08)'
      },
      'mju-chrome': {
        name: 'μ Chrome Slide',
        desc: '선명한 슬라이드 발색',
        css: 'brightness(1.02) contrast(1.28) saturate(1.35) sepia(0.04)',
        tintRgba: 'rgba(255, 200, 150, 0.05)'
      },
      'mju-gold': {
        name: 'μ Gold 200',
        desc: '황금빛 웜톤 네거티브',
        css: 'brightness(1.06) contrast(1.15) saturate(1.24) sepia(0.12)',
        tintRgba: 'rgba(255, 215, 140, 0.1)'
      }
    }
  },

  'contax-t2': {
    id: 'contax-t2',
    name: 'Contax T2',
    shortName: 'CONTAX T2',
    sub: 'Zeiss Warm T*',
    icon: '📸',
    badge: 'Carl Zeiss T*',
    osdId: 'contax-osd',
    drawerId: 'drawer-contax-t2',
    filters: {
      'zeiss-warm': {
        name: 'Zeiss Warm T*',
        desc: '칼자이스 묵직한 웜톤',
        css: 'brightness(1.02) contrast(1.22) saturate(1.15) sepia(0.12)',
        tintRgba: 'rgba(255, 210, 160, 0.12)'
      },
      'zeiss-shadow': {
        name: 'T* Rich Shadow',
        desc: '풍부한 암부와 섬세한 하이라이트',
        css: 'brightness(0.98) contrast(1.35) saturate(1.1) sepia(0.05)',
        tintRgba: 'rgba(240, 220, 200, 0.08)'
      },
      'titanium-classic': {
        name: 'Titanium Classic',
        desc: '티타늄 바디 클래식 룩',
        css: 'brightness(1.06) contrast(1.15) saturate(1.08) sepia(0.08)',
        tintRgba: 'rgba(255, 230, 210, 0.06)'
      },
      'zeiss-mono': {
        name: 'Zeiss T* B&W',
        desc: '독일 광학 깊은 흑백 계조',
        css: 'grayscale(1) contrast(1.4) brightness(1.0)',
        tintRgba: null
      }
    }
  },

  'ricoh-gr': {
    id: 'ricoh-gr',
    name: 'Ricoh GR Digital',
    shortName: 'RICOH GRD',
    sub: 'High-Contrast B&W',
    icon: '🎞️',
    badge: 'SNAP SHOOTER',
    osdId: 'ricoh-osd',
    drawerId: 'drawer-ricoh-gr',
    filters: {
      'gr-bw-high': {
        name: 'High-Contrast B&W',
        desc: '모리야마 풍 강렬한 흑백',
        css: 'grayscale(1) contrast(1.85) brightness(0.95)',
        tintRgba: null
      },
      'gr-positive': {
        name: 'Positive Film',
        desc: '특유의 포지티브 필름 발색',
        css: 'brightness(1.04) contrast(1.28) saturate(1.32) sepia(0.03)',
        tintRgba: 'rgba(255, 220, 180, 0.06)'
      },
      'gr-street': {
        name: 'Street Snap',
        desc: '신속하고 날카로운 스냅 룩',
        css: 'brightness(1.02) contrast(1.22) saturate(1.12)',
        tintRgba: null
      },
      'gr-cross': {
        name: 'Cross Process',
        desc: '그런지한 교차 현상 발색',
        css: 'brightness(1.08) contrast(1.38) saturate(1.4) hue-rotate(25deg)',
        tintRgba: 'rgba(180, 255, 100, 0.08)'
      }
    }
  },

  'leica-m': {
    id: 'leica-m',
    name: 'Leica M System',
    shortName: 'LEICA M',
    sub: 'Summilux 50',
    icon: '🔴',
    badge: 'RANGEFINDER M',
    osdId: 'leica-m-osd',
    drawerId: 'drawer-leica-m',
    filters: {
      'leica-summilux': {
        name: 'Summilux 50',
        desc: '따뜻한 벨벳 톤 & 부드러운 보케',
        css: 'brightness(1.05) contrast(1.12) saturate(1.18) sepia(0.08)',
        tintRgba: 'rgba(255, 225, 180, 0.08)'
      },
      'leica-mono': {
        name: 'M Monochrom',
        desc: '깊고 섬세한 흑백 계조',
        css: 'grayscale(1) contrast(1.45) brightness(0.96)',
        tintRgba: null
      },
      'leica-classic': {
        name: 'Classic M 35',
        desc: '투명하고 날카로운 선예도',
        css: 'brightness(1.03) contrast(1.22) saturate(1.1)',
        tintRgba: null
      },
      'leica-red': {
        name: 'Red Dot Color',
        desc: '라이카 특유의 깊은 원색 렌더링',
        css: 'brightness(1.02) contrast(1.26) saturate(1.28) sepia(0.02)',
        tintRgba: 'rgba(255, 180, 180, 0.05)'
      }
    }
  },

  'citypop-80s': {
    id: 'citypop-80s',
    name: 'City Pop 80s',
    shortName: 'CITY POP 80s',
    sub: 'Shonan Sunset 1986',
    icon: '📼',
    badge: '1986 BUBBLE SOUND',
    osdId: 'citypop-osd',
    drawerId: 'drawer-citypop-80s',
    filters: {
      'city-sunset': {
        name: 'Shonan Sunset 1986',
        desc: '나가이 히로시 감성의 쇼난 코스트 샴페인 선셋과 청명한 하늘',
        css: 'brightness(1.10) contrast(1.14) saturate(1.35) sepia(0.04)',
        tintRgba: 'rgba(255, 175, 120, 0.12)'
      },
      'city-tokyo': {
        name: 'Showa Idol Glow',
        desc: '80s 쇼와 아이돌 앨범 자켓의 투명하고 화사한 도자기 복숭아빛 피부',
        css: 'brightness(1.15) contrast(1.02) saturate(1.22) sepia(0.03)',
        tintRgba: 'rgba(255, 215, 200, 0.14)'
      },
      'city-pastel': {
        name: 'Pacific Breeze',
        desc: '타츠로 야마시타 감성의 눈부신 한낮 코발트 블루와 청량한 해변 바람',
        css: 'brightness(1.12) contrast(1.15) saturate(1.32) sepia(0.02)',
        tintRgba: 'rgba(0, 200, 245, 0.10)'
      },
      'city-plastic': {
        name: 'Plastic Love \'88',
        desc: '타케우치 마리야 감성의 감미롭고 온화한 80s 아날로그 카세트 질감',
        css: 'brightness(1.08) contrast(1.10) saturate(1.25) sepia(0.06)',
        tintRgba: 'rgba(255, 205, 160, 0.12)'
      }
    }
  },

  'oldfilm-35mm': {
    id: 'oldfilm-35mm',
    name: 'Old Film 35mm',
    shortName: 'OLD FILM 35',
    sub: 'CineStill 800T',
    icon: '🎞️',
    badge: 'ANALOG CINE 35',
    osdId: 'oldfilm-osd',
    drawerId: 'drawer-oldfilm-35mm',
    filters: {
      'film-cinestill': {
        name: 'CineStill 800T',
        desc: '광원 붉은 할레이션 번짐',
        css: 'brightness(1.02) contrast(1.24) saturate(1.25) hue-rotate(195deg)',
        tintRgba: 'rgba(255, 20, 0, 0.1)'
      },
      'film-portra': {
        name: 'Portra 400',
        desc: '따뜻한 골든 옐로우 피부톤',
        css: 'brightness(1.06) contrast(1.14) saturate(1.15) sepia(0.1)',
        tintRgba: 'rgba(255, 210, 140, 0.08)'
      },
      'film-ektar': {
        name: 'Ektar 100',
        desc: '선명하고 강렬한 원색 콘트라스트',
        css: 'brightness(1.03) contrast(1.32) saturate(1.42)',
        tintRgba: null
      },
      'film-superia': {
        name: 'Superia 400',
        desc: '특유의 에메랄드 그린 섀도우',
        css: 'brightness(1.04) contrast(1.18) saturate(1.22) hue-rotate(15deg)',
        tintRgba: 'rgba(50, 200, 150, 0.08)'
      }
    }
  },

  'hasselblad-500cm': {
    id: 'hasselblad-500cm',
    name: 'Hasselblad 500C/M',
    shortName: 'HASSELBLAD',
    sub: 'Planar 80mm Pop',
    icon: '📷',
    badge: '6x6 MEDIUM FORMAT',
    osdId: 'hasselblad-osd',
    drawerId: 'drawer-hasselblad',
    lensModel: 'Carl Zeiss Planar 80mm f/2.8 T* CB',
    exposure: { shutter: '1/250s', aperture: 'f/2.8', iso: 'ISO 100', focal: '80mm eq.' },
    filters: {
      'hassel-planar': {
        name: 'Planar 80mm Pop',
        desc: '중형 렌즈 인물 분리감',
        css: 'brightness(1.02) contrast(1.16) saturate(1.10) sepia(0.04)',
        tintRgba: 'rgba(255, 235, 215, 0.06)'
      },
      'hassel-trix': {
        name: 'Tri-X 400 MF',
        desc: '중형 롤필름 깊은 은염 흑백',
        css: 'grayscale(1) contrast(1.35) brightness(1.0)',
        tintRgba: null
      },
      'hassel-astia': {
        name: 'Astia 100F Slide',
        desc: '투명하고 부드러운 스킨톤',
        css: 'brightness(1.04) contrast(1.12) saturate(1.15) sepia(0.06)',
        tintRgba: 'rgba(255, 220, 200, 0.07)'
      },
      'hassel-chromium': {
        name: 'Chromium Silver',
        desc: '북유럽 쿨톤 메탈릭 질감',
        css: 'brightness(1.02) contrast(1.24) saturate(0.88) hue-rotate(-10deg)',
        tintRgba: 'rgba(200, 225, 255, 0.08)'
      }
    }
  },

  'polaroid-sx70': {
    id: 'polaroid-sx70',
    name: 'Polaroid SX-70',
    shortName: 'POLAROID SX-70',
    sub: 'SX-70 Vintage Fade',
    icon: '📸',
    badge: '1972 LAND CAMERA',
    osdId: 'polaroid-sx70-osd',
    drawerId: 'drawer-polaroid-sx70',
    lensModel: 'Polaroid 116mm f/8 4-Element Glass',
    exposure: { shutter: '1/125s', aperture: 'f/8.0', iso: 'ISO 160', focal: '116mm eq.' },
    filters: {
      'sx70-fade': {
        name: 'SX-70 Vintage Fade',
        desc: '1970년대 따뜻하게 바랜 유제',
        css: 'brightness(1.04) contrast(0.95) saturate(0.88) sepia(0.18)',
        tintRgba: 'rgba(255, 215, 140, 0.12)'
      },
      'sx70-color600': {
        name: 'Color Protection 600',
        desc: '사이언/마젠타 즉석사진 발색',
        css: 'brightness(1.02) contrast(1.18) saturate(1.22) hue-rotate(-8deg)',
        tintRgba: 'rgba(200, 100, 255, 0.08)'
      },
      'sx70-expired': {
        name: 'Expired Film 1979',
        desc: '유통기한 지난 필름의 황록색 변색',
        css: 'brightness(1.06) contrast(0.90) saturate(0.75) hue-rotate(30deg)',
        tintRgba: 'rgba(220, 255, 120, 0.14)'
      },
      'sx70-sepia': {
        name: 'Sepia Dream',
        desc: '클래식 브라운 세피아 모노크롬',
        css: 'sepia(0.85) contrast(1.15) brightness(1.02)',
        tintRgba: 'rgba(240, 180, 100, 0.1)'
      }
    }
  },

  'fuji-quicksnap': {
    id: 'fuji-quicksnap',
    name: 'Fuji QuickSnap (写ルンです 1986)',
    shortName: 'QUICKSNAP 1986',
    sub: 'Daylight 1986',
    icon: '📸',
    badge: '1986 BUBBLE ERA',
    osdId: 'quicksnap-osd',
    drawerId: 'drawer-fuji-quicksnap',
    lensModel: 'Fujinon 32mm F/11 Plastic Meniscus Lens',
    exposure: { shutter: '1/100s', aperture: 'f/11', iso: 'ISO 400', focal: '32mm (Plastic)' },
    filters: {
      'quicksnap-86': {
        name: '写ルンです 1986 Daylight',
        desc: '1986년 원작 우츠룬데스의 청량한 에메랄드 풀잎과 맑은 피부톤',
        css: 'brightness(1.10) contrast(1.12) saturate(1.28) sepia(0.04)',
        tintRgba: 'rgba(40, 195, 140, 0.10)'
      },
      'quicksnap-flash': {
        name: 'Sun Flash Pop',
        desc: '버블시대 거리와 카페에서 터뜨린 또렷하고 화사한 고광량 직광 플래시',
        css: 'brightness(1.16) contrast(1.22) saturate(1.18) sepia(0.02)',
        tintRgba: 'rgba(255, 240, 220, 0.10)'
      },
      'quicksnap-nostalgia': {
        name: 'Bubble Resort \'87',
        desc: '80년대 버블 부유층의 여름 별장 휴양지 따사로운 햇살과 비비드 톤',
        css: 'brightness(1.08) contrast(1.14) saturate(1.26) sepia(0.06)',
        tintRgba: 'rgba(255, 215, 145, 0.12)'
      },
      'quicksnap-neon': {
        name: 'Showa Memory \'86',
        desc: '선명한 오렌지 쿼츠데이트와 따스한 쇼와 61년 아날로그 인화지 감성',
        css: 'brightness(1.08) contrast(1.10) saturate(1.20) sepia(0.08)',
        tintRgba: 'rgba(255, 195, 130, 0.12)'
      }
    }
  },

  'kyocera-samurai': {
    id: 'kyocera-samurai',
    name: 'Kyocera Samurai X3.0 (1988)',
    shortName: 'SAMURAI 1988',
    sub: 'Half-Frame Crisp 72',
    icon: '🗡️',
    badge: '1988 CYBER HALF-FRAME',
    osdId: 'kyocera-samurai-osd',
    drawerId: 'drawer-kyocera-samurai',
    lensModel: 'Yashica Zoom 25-75mm F/3.5-4.3 Macro',
    exposure: { shutter: '1/250s', aperture: 'f/3.5', iso: 'ISO 100', focal: '35mm eq. (Half Frame)' },
    filters: {
      'samurai-half': {
        name: 'Half-Frame Crisp 72',
        desc: '야시카 광학 줌 렌즈의 또렷한 선예도와 세로 분할 72컷 하프프레임',
        css: 'brightness(1.08) contrast(1.18) saturate(1.22) sepia(0.02)',
        tintRgba: 'rgba(215, 235, 255, 0.08)'
      },
      'samurai-cyber': {
        name: 'Bubble High-Tech \'88',
        desc: '1988년 도쿄 하이테크 열풍의 미래지향 에메랄드 HUD와 맑은 선예도',
        css: 'brightness(1.10) contrast(1.20) saturate(1.24) sepia(0.02)',
        tintRgba: 'rgba(0, 225, 195, 0.08)'
      },
      'samurai-tokyo': {
        name: 'Shinjuku Golden Hour',
        desc: '신주쿠 마천루에 반사되는 찬란한 황혼의 황금빛 햇살과 고급스러운 웜톤',
        css: 'brightness(1.08) contrast(1.16) saturate(1.30) sepia(0.05)',
        tintRgba: 'rgba(255, 190, 100, 0.12)'
      },
      'samurai-titanium': {
        name: 'Ryuichi B&W 1988',
        desc: '80s 뉴웨이브 사카모토 류이치 감성의 지적이고 정제된 하이콘트라스트 흑백',
        css: 'grayscale(1) contrast(1.45) brightness(1.04)',
        tintRgba: null
      }
    }
  },

  'sihyun-color': {
    id: 'sihyun-color',
    name: 'Personal Color Studio',
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

// 16 Iconic Cameras Ordering & Categorization Architecture
const CAMERA_ORDER = [
  'canon-ixy',
  'sony-handycam',
  'sony-cybershot',
  'olympus-mju',
  'contax-t2',
  'ricoh-gr',
  'leica-m',
  'citypop-80s',
  'oldfilm-35mm',
  'hasselblad-500cm',
  'polaroid-sx70',
  'fuji-quicksnap',
  'kyocera-samurai',
  'instax-mini',
  'sihyun-color',
  'passport-id'
];

const CAMERA_CATEGORIES = {
  'bubble': ['fuji-quicksnap', 'kyocera-samurai', 'citypop-80s', 'oldfilm-35mm', 'contax-t2', 'olympus-mju'],
  'y2k': ['canon-ixy', 'sony-handycam', 'sony-cybershot', 'ricoh-gr', 'leica-m'],
  'medium': ['hasselblad-500cm', 'polaroid-sx70', 'instax-mini'],
  'studio': ['sihyun-color', 'passport-id']
};

window.state = state;
window.CAMERAS = CAMERAS;
window.CAMERA_ORDER = CAMERA_ORDER;
window.CAMERA_CATEGORIES = CAMERA_CATEGORIES;

function getCameraCategory(camId) {
  for (const [cat, cams] of Object.entries(CAMERA_CATEGORIES)) {
    if (cams.includes(camId)) return cat;
  }
  return 'all';
}

// Optical Lens Filters Specifications
const LENS_FILTERS = {
  none: { name: '기본 (Clear)', title: '광학 렌즈 미장착' },
  mist: { name: '블랙 미스트', title: 'Black Mist (Pro-Mist)' },
  star: { name: '크로스 4X', title: 'Cross Star 4-Point' },
  star6: { name: '6날 스타 조리개', title: '6-Blade Sunstar (0°/60°/120° Diffraction)' },
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

  playRecordStart() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.07);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now + 0.08);
    gain2.gain.setValueAtTime(0.25, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.17);
  }

  playRecordStop() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1320, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.07);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, now + 0.08);
    gain2.gain.setValueAtTime(0.2, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.19);
  }

  playMount() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Heavy mechanical bayonet lens lock "clack-click"
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(450, now);
    osc1.frequency.exponentialRampToValueAtTime(110, now + 0.05);
    gain1.gain.setValueAtTime(0.22, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.06);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(680, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(160, now + 0.12);
    gain2.gain.setValueAtTime(0.28, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.13);
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
  soundEngine.playMount();

  // 1. Update Dial Active Class & Position Shift
  const dialItems = document.querySelectorAll('#mode-dial-list .mode-dial-item');
  dialItems.forEach(item => {
    item.classList.toggle('active', item.dataset.cam === camId);
  });

  const dialList = document.getElementById('mode-dial-list');
  const activeItem = document.querySelector(`#mode-dial-list .mode-dial-item[data-cam="${camId}"]`);
  if (dialList && activeItem) {
    const wrapper = dialList.parentElement;
    const offset = (wrapper.offsetWidth / 2) - (activeItem.offsetLeft + activeItem.offsetWidth / 2);
    dialList.style.transform = `translateX(${offset}px)`;
  }

  // 2. Synchronize Category Fast-Jump Bar Active Pill
  const activeCat = getCameraCategory(camId);
  document.querySelectorAll('.camera-category-bar .cam-cat-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.cat === activeCat);
  });

  // 3. Update Left Sidebar Rack Active State
  document.querySelectorAll('.panel-modes .panel-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cam === camId);
  });

  // 4. Update Viewfinder Top Active Camera Badge HUD
  const badgeTitle = document.getElementById('cam-badge-title');
  const badgeSub = document.getElementById('cam-badge-sub');
  const badgeIcon = document.getElementById('cam-badge-icon');
  if (badgeTitle) badgeTitle.textContent = cam.name;
  if (badgeIcon) badgeIcon.innerHTML = CAM_SVG_ICONS[camId] || CAM_SVG_ICONS['default'];
  if (badgeSub) badgeSub.textContent = cam.sub;

  // 5. Update Equipped State in Camera Bag Modal Cards
  document.querySelectorAll('.camera-bag-grid .bag-cam-card').forEach(card => {
    const isEq = card.dataset.cam === camId;
    card.classList.toggle('equipped', isEq);
    const statusEl = card.querySelector('.bag-card-status');
    if (statusEl) {
      statusEl.textContent = isEq ? '● 장착 중 (EQUIPPED)' : '○ 탭하여 즉시 장착';
    }
  });

  // 6. Switch Control Drawer Panel
  document.querySelectorAll('.control-drawer .mode-control-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === cam.drawerId);
  });

  // 5. Manage Viewfinder OSD Overlays
  const allOsdIds = [
    'canon-ixy-osd',
    'sony-handycam-osd',
    'sony-cybershot-osd',
    'olympus-osd',
    'contax-osd',
    'ricoh-osd',
    'leica-m-osd',
    'citypop-osd',
    'oldfilm-osd',
    'cinestill-halation',
    'hasselblad-osd',
    'polaroid-sx70-osd',
    'quicksnap-osd',
    'kyocera-samurai-osd',
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

  // Old Film CineStill Halation Glow
  const halationEl = document.getElementById('cinestill-halation');
  if (halationEl) {
    halationEl.style.display = (camId === 'oldfilm-35mm') ? 'block' : 'none';
  }

  // 6. Handle Background Layer (Real-time Live Color for Personal Color Studio)
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

// Next Camera Stepper (Ergonomic 1-tap/swipe transition)
function switchNextCamera() {
  const currentIndex = CAMERA_ORDER.indexOf(state.activeCamera);
  const nextIndex = (currentIndex + 1) % CAMERA_ORDER.length;
  switchCamera(CAMERA_ORDER[nextIndex]);
}

// Previous Camera Stepper (Ergonomic 1-tap/swipe transition)
function switchPrevCamera() {
  const currentIndex = CAMERA_ORDER.indexOf(state.activeCamera);
  const prevIndex = (currentIndex - 1 + CAMERA_ORDER.length) % CAMERA_ORDER.length;
  switchCamera(CAMERA_ORDER[prevIndex]);
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
  } else if (camId === 'olympus-mju') {
    descEl.textContent = '컴팩트 필름 카메라의 전설 Olympus μ [mju:] II. 35mm f/2.8 단렌즈의 날카로운 선예도와 생동감 넘치는 스트리트 컬러 밸런스를 제공합니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>전용 필터 3종: μ Standard(스트리트 필름), μ Night Street(야경 플래시), μ Chrome Slide</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>올림푸스 시그니처 녹색 AF 포커스 브래킷 & 쿼츠 데이트 스탬프 OSD</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>생생한 콘트라스트와 아날로그 35mm 필름 입자 질감 렌더링</span></li>
    `;
  } else if (camId === 'contax-t2') {
    descEl.textContent = '티타늄 바디와 Carl Zeiss Sonnar T* 38mm f/2.8 렌즈의 명품 P&S 카메라. 묵직하고 깊은 섀도우 계조와 온화하고 고급스러운 칼자이스 발색이 살아납니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>전용 필터 3종: Zeiss Warm T*(칼자이스 웜톤), T* Rich Shadow(암부 계조), Titanium Classic</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>붉은색 7세그먼트 LED 셔터/노출 바 & 중앙 스팟 측광 OSD</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>하이라이트 번짐 억제 및 고급스러운 아날로그 비네팅 합성</span></li>
    `;
  } else if (camId === 'ricoh-gr') {
    descEl.textContent = '모리야마 다이도의 스냅 명기 Ricoh GR Digital. 강렬한 흑백 하이콘트라스트와 신속한 스냅 포커스(2.5m) 감성을 구현합니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>전용 필터 3종: High-Contrast B&W(모리야마 흑백), Positive Film, Street Snap</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>수평계 자이로 레벨러 HUD & SNAP 2.5m 거리 고정 인디케이터 OSD</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>거친 그레인 입자와 날카로운 선예도의 도시 스냅 감성 완결</span></li>
    `;
  } else if (camId === 'leica-m') {
    descEl.textContent = '독일 장인 정신의 레인지파인더 Leica M 시스템. 이중합치 포커스 패치와 즈미룩스(Summilux) 50mm의 벨벳 같은 얕은 심도 톤을 재현합니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>전용 필터 3종: Summilux 50(벨벳 웜톤), M Monochrom(섬세한 흑백 계조), Classic M 35</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>라이카 시그니처 🔴 레드 닷 & 노란색 이중합치 스플릿 포커스 패치 OSD</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>35mm/50mm 브라이트 프레임라인 및 클래식 셔터 메커니즘 사운드</span></li>
    `;
  } else if (camId === 'citypop-80s') {
    descEl.textContent = '80년대 도쿄 시티팝과 레트로 신스웨이브의 낭만. 카세트 테이프 릴 OSD와 마젠타·바이올렛 네온 선셋 그라디언트를 선사합니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>전용 필터 3종: Sunset Neon(퍼플 앰버 선셋), Tokyo Night(네온 바이올렛), Pastel Breeze</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>80s 카세트 테이프 SIDE A • DOLBY NR • FM 80.0 MHz 레트로 HUD</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>타츠로 야마시타 앨범 커버 감성의 따뜻한 저녁노을 틴트 합성</span></li>
    `;
  } else if (camId === 'oldfilm-35mm') {
    descEl.textContent = 'CineStill 800T와 Kodak Portra 400의 정통 아날로그 영화용 필름. 광원 주변의 붉은 할레이션과 상하 필름 스프라켓 구멍이 살아납니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>전용 필터 3종: CineStill 800T(붉은 할레이션), Portra 400(골든 옐로우), Ektar 100</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>KODAK SAFETY FILM 5063 상하 스프라켓 천공 홀 & 아날로그 날짜 각인</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>시네마틱 붉은 할레이션(Red Halation) 광선 블룸 실시간 오버레이</span></li>
    `;
  } else if (camId === 'instax-mini') {
    descEl.textContent = '세상에 단 한 장뿐인 아날로그 즉석인화 카메라. 화사한 파스텔 톤과 하단 여백이 돋보이는 시그니처 화이트 카드 프레임이 제공됩니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>전용 필터 4종: Instax Soft, Polaroid 600, Warm Mono, Rainbow Edge</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>하단 친필 서명이 가능한 instax mini 시그니처 화이트 프레임</span></li>
      <li class="feature-item"><span class="feature-bullet">✓</span><span>들뜬 섀도우와 따뜻한 즉석인화 필름 계조 온디바이스 합성</span></li>
    `;
  } else if (camId === 'sihyun-color') {
    descEl.textContent = '나만의 퍼스널 컬러 배경이 실시간으로 라이브 변환되는 Personal Color Studio. 뷰파인더에서 실시간으로 인물 뒤 배경이 부드럽게 전환됩니다.';
    featureListEl.innerHTML = `
      <li class="feature-item"><span class="feature-bullet">✓</span><span>실시간 배경 라이브 치환: Studio Best 8색 + 4계절 16색 + 그라디언트 터치 즉시 반영</span></li>
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
    star6: document.getElementById('lens-layer-star6'),
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
  if (flashScreen) {
    flashScreen.classList.add('active', 'flashing');
    const flashDur = state.flashMode === 'on' ? 260 : 90;
    setTimeout(() => {
      flashScreen.classList.remove('active', 'flashing');
    }, flashDur);
  }

  // Mobile LED Torch trigger if Flash ON
  if (state.flashMode === 'on' && state.currentStream) {
    try {
      const track = state.currentStream.getVideoTracks()[0];
      const caps = track?.getCapabilities ? track.getCapabilities() : {};
      if (caps.torch) {
        track.applyConstraints({ advanced: [{ torch: true }] }).catch(() => {});
        setTimeout(() => {
          track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {});
        }, 280);
      }
    } catch (e) {}
  }

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

  // 3. Draw Subject (Transparent Model or Mirrored/Unmirrored Webcam)
  if (state.cameraSource === 'webcam') {
    const video = document.getElementById('camera-video');
    if (video.videoWidth && video.videoHeight) {
      ctx.save();
      let filterToApply = activeFilter;
      if (state.flashMode === 'on') {
        filterToApply = (filterToApply === 'none')
          ? 'brightness(1.22) contrast(1.14)'
          : filterToApply + ' brightness(1.2) contrast(1.1)';
      }
      ctx.filter = filterToApply;

      // Crop video to exact 3:4 target ratio
      const vAspect = video.videoWidth / video.videoHeight;
      const targetAspect = 780 / 1040;
      let sx, sy, sw, sh;
      if (vAspect > targetAspect) {
        sh = video.videoHeight;
        sw = video.videoHeight * targetAspect;
        sx = (video.videoWidth - sw) / 2;
        sy = 0;
      } else {
        sw = video.videoWidth;
        sh = video.videoWidth / targetAspect;
        sx = 0;
        sy = (video.videoHeight - sh) / 2;
      }

      if (state.facingMode === 'user') {
        ctx.translate(captureCanvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, captureCanvas.width, captureCanvas.height);
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
  } else if (cam.id === 'olympus-mju') {
    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillStyle = '#30d158';
    ctx.fillText('OLYMPUS μ [mju:]-II', 40, 60);
    ctx.fillStyle = '#ff9f0a';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('⚡ OK', captureCanvas.width - 120, 60);
    ctx.fillText('[ S 24 ]', 40, captureCanvas.height - 40);
    ctx.fillText("'26 10 05", captureCanvas.width - 150, captureCanvas.height - 40);
  } else if (cam.id === 'contax-t2') {
    // Red LED T* Bar
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(30, 25, captureCanvas.width - 60, 48);
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = '#ff453a';
    ctx.fillText('T*  1/250  F2.8  +0.5', 50, 56);

    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillStyle = '#d1d1d6';
    ctx.fillText('CONTAX T2 TITANIUM', 40, captureCanvas.height - 40);
    ctx.fillText('Carl Zeiss Sonnar 2.8/38', captureCanvas.width - 250, captureCanvas.height - 40);
  } else if (cam.id === 'ricoh-gr') {
    ctx.font = 'bold 18px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('P   [ SNAP 2.5m ]   ISO 400', 40, 60);
    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillStyle = '#ffd60a';
    ctx.fillText('28mm GR LENS F2.8   1/160   RAW+', 40, captureCanvas.height - 40);

    // If High-contrast B&W is selected
    if (state.selectedFilters['ricoh-gr'] === 'gr-bw-high') {
      const imgData = ctx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        let v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        // High contrast curve
        v = (v - 128) * 1.5 + 128;
        v = Math.max(0, Math.min(255, v));
        d[i] = v; d[i + 1] = v; d[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);
    }
  } else if (cam.id === 'leica-m') {
    // Red Dot
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath();
    ctx.roundRect(40, 40, 110, 32, 16);
    ctx.fill();
    ctx.font = 'bold 15px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('LEICA M', 66, 62);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#ffd60a';
    ctx.fillText('1/500  f/1.4', captureCanvas.width - 150, 62);

    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText('SUMMILUX-M 1:1.4/50 ASPH.', 40, captureCanvas.height - 40);

    // If Monochrom filter is selected
    if (state.selectedFilters['leica-m'] === 'leica-mono') {
      const imgData = ctx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = v; d[i + 1] = v; d[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);
    }
  } else if (cam.id === 'citypop-80s') {
    // City Pop Tape Top Banner
    ctx.fillStyle = 'rgba(30, 5, 50, 0.7)';
    ctx.fillRect(30, 30, captureCanvas.width - 60, 44);
    ctx.strokeStyle = '#ff2db9';
    ctx.lineWidth = 1;
    ctx.strokeRect(30, 30, captureCanvas.width - 60, 44);

    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.fillStyle = '#ff2db9';
    ctx.fillText('SIDE A • STEREO', 50, 58);
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('[DOLBY B-C NR]', 240, 58);
    ctx.fillStyle = '#ffd60a';
    ctx.fillText('FM 80.0 MHz', captureCanvas.width - 180, 58);

    // Bottom Badge
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('PACIFIC BREEZE 1986 • SHONAN', 40, captureCanvas.height - 40);
    ctx.fillStyle = '#ffd60a';
    ctx.fillText('◷ C-60 TAPE', captureCanvas.width - 150, captureCanvas.height - 40);
  } else if (cam.id === 'oldfilm-35mm') {
    // Top & Bottom Film Sprocket Borders
    const sprocketH = 34;
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, captureCanvas.width, sprocketH);
    ctx.fillRect(0, captureCanvas.height - sprocketH, captureCanvas.width, sprocketH);

    // Sprocket Holes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let x = 20; x < captureCanvas.width; x += 60) {
      ctx.fillRect(x, 8, 20, 16);
      ctx.fillRect(x, captureCanvas.height - 24, 20, 16);
    }

    // Film Stamp
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillStyle = '#ff9f0a';
    ctx.fillText('KODAK SAFETY FILM 5063 • 35mm • 24A • PORTRA 400', 120, 22);

    // CineStill Red Halation Simulation
    if (state.selectedFilters['oldfilm-35mm'] === 'film-cinestill') {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const halation = ctx.createRadialGradient(
        captureCanvas.width / 2, captureCanvas.height * 0.35, 10,
        captureCanvas.width / 2, captureCanvas.height * 0.35, captureCanvas.width * 0.55
      );
      halation.addColorStop(0, 'rgba(255, 30, 0, 0.35)');
      halation.addColorStop(0.4, 'rgba(255, 80, 0, 0.15)');
      halation.addColorStop(1, 'transparent');
      ctx.fillStyle = halation;
      ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
      ctx.restore();
    }
  } else if (cam.id === 'hasselblad-500cm') {
    // 6x6 Medium Format Inner Frame
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.strokeRect(30, 30, captureCanvas.width - 60, captureCanvas.height - 60);

    // Crosshair at center
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(captureCanvas.width / 2 - 12, captureCanvas.height / 2);
    ctx.lineTo(captureCanvas.width / 2 + 12, captureCanvas.height / 2);
    ctx.moveTo(captureCanvas.width / 2, captureCanvas.height / 2 - 12);
    ctx.lineTo(captureCanvas.width / 2, captureCanvas.height / 2 + 12);
    ctx.stroke();

    // Top Hasselblad Swedish Badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(40, 40, 220, 34);
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillStyle = '#9a8c98';
    ctx.fillText('HASSELBLAD 500C/M', 52, 63);

    // Bottom Zeiss Planar & Shutter
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Carl Zeiss Planar 2.8/80 T*', 50, captureCanvas.height - 50);
    ctx.fillStyle = '#9a8c98';
    ctx.fillText('1/250  f/2.8  A12 6x6', captureCanvas.width - 260, captureCanvas.height - 50);
  } else if (cam.id === 'polaroid-sx70') {
    // Signature Polaroid SX-70 Instant Card Frame
    ctx.lineWidth = 28;
    ctx.strokeStyle = '#f5f0eb';
    ctx.strokeRect(14, 14, captureCanvas.width - 28, captureCanvas.height - 28);
    ctx.fillStyle = '#f5f0eb';
    ctx.fillRect(0, captureCanvas.height - 150, captureCanvas.width, 150);

    // Rainbow 5-color stripe badge
    const rx = 40, ry = captureCanvas.height - 85;
    const colors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff'];
    colors.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(rx + idx * 8, ry, 7, 24);
    });

    ctx.font = 'bold 22px -apple-system, sans-serif';
    ctx.fillStyle = '#2c2d30';
    ctx.fillText('POLAROID SX-70', 90, captureCanvas.height - 68);

    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.fillStyle = '#8e793e';
    ctx.fillText('ALPHA 1 • 1972 LAND CAMERA', 90, captureCanvas.height - 48);

    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = '#6e7075';
    ctx.fillText("'26 10 05", captureCanvas.width - 160, captureCanvas.height - 60);
  } else if (cam.id === 'fuji-quicksnap') {
    // 1986 Bubble Era Fuji QuickSnap Plastic Meniscus Flare & Amber Quartz Date Imprint
    ctx.save();
    ctx.font = 'bold 22px "Impact", "Arial Black", sans-serif';
    ctx.fillStyle = '#ff9100';
    ctx.shadowColor = 'rgba(255, 145, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText("'89 11 24", captureCanvas.width - 150, captureCanvas.height - 45);

    // Top-left FUJICOLOR 写ルンです single-use paper badge
    ctx.fillStyle = 'rgba(0, 100, 40, 0.8)';
    ctx.fillRect(30, 30, 240, 34);
    ctx.font = 'bold 14px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillText('FUJICOLOR 写ルンです 1986', 42, 53);

    // Subtle plastic edge vignette
    const pGrad = ctx.createRadialGradient(
      captureCanvas.width / 2, captureCanvas.height / 2, captureCanvas.width * 0.4,
      captureCanvas.width / 2, captureCanvas.height / 2, captureCanvas.width * 0.75
    );
    pGrad.addColorStop(0, 'transparent');
    pGrad.addColorStop(1, 'rgba(10, 35, 15, 0.28)');
    ctx.fillStyle = pGrad;
    ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);
    ctx.restore();
  } else if (cam.id === 'kyocera-samurai') {
    // 1988 Kyocera Samurai X3.0 Cyber Half-Frame 72-Shot SLR
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(captureCanvas.width / 2, 40);
    ctx.lineTo(captureCanvas.width / 2, captureCanvas.height - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // Top-left cyber LCD banner
    ctx.fillStyle = 'rgba(4, 16, 20, 0.85)';
    ctx.fillRect(30, 30, 260, 34);
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillStyle = '#00ff80';
    ctx.shadowColor = '#00ff80';
    ctx.shadowBlur = 6;
    ctx.fillText('SAMURAI X3.0 • EXP 48/72', 42, 52);

    // Bottom-right Yashica zoom mark
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 4;
    ctx.fillText('YASHICA ZOOM 25-75mm MACRO', captureCanvas.width - 270, captureCanvas.height - 45);
    ctx.restore();
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
    ctx.fillText('Studio Signature', captureCanvas.width - 270, captureCanvas.height - 45);
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
  } else if (state.lensFilter === 'star6') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const drawStar6 = (cx, cy, r) => {
      const angles = [0, Math.PI / 3, (2 * Math.PI) / 3];
      angles.forEach(ang => {
        const dx = Math.cos(ang) * r;
        const dy = Math.sin(ang) * r;
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = 'rgba(255, 248, 235, 0.92)';
        ctx.beginPath();
        ctx.moveTo(cx - dx, cy - dy); ctx.lineTo(cx + dx, cy + dy);
        ctx.stroke();

        // Chromatic spectral dispersion fringe
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = 'rgba(255, 180, 220, 0.5)';
        ctx.beginPath();
        ctx.moveTo(cx - dx * 1.08, cy - dy * 1.08); ctx.lineTo(cx + dx * 1.08, cy + dy * 1.08);
        ctx.stroke();
      });
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    };
    drawStar6(captureCanvas.width * 0.42, captureCanvas.height * 0.36, 55);
    drawStar6(captureCanvas.width * 0.58, captureCanvas.height * 0.36, 55);
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

  const fKey = state.selectedFilters[cam.id];
  const filterSpec = (cam.filters && cam.filters[fKey]) ? cam.filters[fKey] : { name: 'Standard Pass', desc: '표준 렌더링' };

  const photoRecord = {
    id: 'snap_' + Date.now(),
    dataUrl: dataUrl,
    timestamp: new Date().toISOString(),
    formattedDate: new Date().toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }),
    cameraKey: cam.id,
    cameraName: cam.name,
    lensModel: cam.lensModel || 'Precision Optical Glass',
    filterName: filterSpec.name,
    filterDesc: filterSpec.desc,
    opticalLens: state.lensFilter !== 'none' ? state.lensFilter.toUpperCase() : 'Clear (None)',
    shutterSpeed: cam.exposure ? cam.exposure.shutter : '1/125s',
    aperture: cam.exposure ? cam.exposure.aperture : 'f/2.8',
    iso: cam.exposure ? cam.exposure.iso : 'ISO 100',
    exposure: cam.exposure ? `${cam.exposure.shutter} • ${cam.exposure.aperture} • ${cam.exposure.iso}` : '1/125s • f/2.8 • ISO 100',
    focalLength: cam.exposure ? cam.exposure.focal : '35mm eq.',
    flashFired: state.flashMode === 'on',
    width: captureCanvas.width,
    height: captureCanvas.height,
    aspectRatio: `${captureCanvas.width}:${captureCanvas.height} (3:4)`,
    colorSpace: 'sRGB Display P3',
    exif: {
      camera: cam.name,
      lens: cam.lensModel || 'Precision Optical Glass',
      filter: filterSpec.name,
      optical: state.lensFilter !== 'none' ? state.lensFilter.toUpperCase() : 'Clear (None)',
      shutter: cam.exposure ? cam.exposure.shutter : '1/125s',
      aperture: cam.exposure ? cam.exposure.aperture : 'f/2.8',
      iso: cam.exposure ? cam.exposure.iso : 'ISO 100',
      focal: cam.exposure ? cam.exposure.focal : '35mm eq.',
      flash: state.flashMode === 'on' ? 'Fired' : 'Off',
      timestamp: new Date().toISOString()
    }
  };

  state.gallery.unshift(photoRecord);
  state.selectedGalleryIndex = 0;
  updateGalleryBadge();

  const thumbImg = document.getElementById('gallery-thumb');
  const thumbPlaceholder = document.getElementById('gallery-placeholder');
  thumbImg.src = dataUrl;
  thumbImg.style.display = 'block';
  thumbPlaceholder.style.display = 'none';

  setTimeout(() => {
    openGalleryModal();
  }, 350);
}

function updateGalleryBadge() {
  const topBadge = document.getElementById('gallery-badge-num');
  const sidebarCount = document.getElementById('sidebar-gallery-count');
  const modalCount = document.getElementById('gallery-count-text');

  const count = state.gallery.length;
  if (topBadge) topBadge.textContent = count;
  if (sidebarCount) sidebarCount.textContent = count;
  if (modalCount) modalCount.textContent = count;
}

function openGalleryModal() {
  soundEngine.playTick();
  const modal = document.getElementById('gallery-modal');
  const emptyState = document.getElementById('gallery-empty-state');
  const contentContainer = document.getElementById('gallery-content-container');

  if (state.gallery.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (contentContainer) contentContainer.style.display = 'none';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    if (contentContainer) contentContainer.style.display = 'block';
    renderGalleryFilmStrip();
    selectGalleryPhoto(state.selectedGalleryIndex || 0);
  }

  if (modal) modal.classList.add('open');
}

function closeGalleryModal() {
  soundEngine.playTick();
  const modal = document.getElementById('gallery-modal');
  if (modal) modal.classList.remove('open');
}

function renderGalleryFilmStrip() {
  const strip = document.getElementById('gallery-film-strip');
  if (!strip) return;
  strip.innerHTML = '';

  state.gallery.forEach((item, index) => {
    const thumb = document.createElement('div');
    thumb.className = `gallery-film-thumb ${index === state.selectedGalleryIndex ? 'active' : ''}`;
    thumb.style.position = 'relative';
    thumb.innerHTML = `
      <img src="${item.dataUrl}" alt="Item ${index + 1}">
      ${item.isVideo ? `<div style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.85); color: #fff; font-size: 8.5px; font-weight: 800; padding: 1px 5px; border-radius: 4px; border: 0.5px solid rgba(255,59,48,0.6); display: flex; align-items: center; gap: 3px;"><span style="color: #ff3b30;">●</span> ${item.duration || '00:03'}</div>` : ''}
    `;
    thumb.addEventListener('click', () => {
      soundEngine.playTick();
      selectGalleryPhoto(index);
    });
    strip.appendChild(thumb);
  });
}

function selectGalleryPhoto(index) {
  if (!state.gallery[index]) return;
  state.selectedGalleryIndex = index;
  const item = state.gallery[index];

  // Update strip highlight
  document.querySelectorAll('.gallery-film-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === index);
  });

  // Update Large Preview
  const largeImg = document.getElementById('gallery-large-img');
  if (largeImg) largeImg.src = item.dataUrl;

  // Update EXIF Information
  const camBadge = document.getElementById('exif-cam-badge');
  const valCamera = document.getElementById('exif-val-camera');
  const valLens = document.getElementById('exif-val-lens');
  const valFilter = document.getElementById('exif-val-filter');
  const valOptical = document.getElementById('exif-val-optical');
  const valExposure = document.getElementById('exif-val-exposure');
  const valFocal = document.getElementById('exif-val-focal');
  const valFlash = document.getElementById('exif-val-flash');
  const valRes = document.getElementById('exif-val-res');
  const valTimestamp = document.getElementById('exif-val-timestamp');

  const cam = CAMERAS[item.cameraKey] || { shortName: 'CAMERA' };
  if (camBadge) camBadge.textContent = item.isVideo ? `▶ REC VIDEO (${item.duration})` : (cam.shortName || 'CAMERA');
  if (valCamera) valCamera.textContent = item.isVideo ? `${item.cameraName} (QuickTake Video)` : item.cameraName;
  if (valLens) valLens.textContent = item.lensModel;
  if (valFilter) valFilter.textContent = `${item.filterName} (${item.filterDesc || '고유 톤'})`;
  if (valOptical) valOptical.textContent = item.opticalLens;
  if (valExposure) valExposure.textContent = item.exposure;
  if (valFocal) valFocal.textContent = item.focalLength;
  if (valFlash) valFlash.textContent = item.flashFired ? '발광 (Fired)' : '미발광 (Off)';
  if (valRes) valRes.textContent = `${item.width} × ${item.height} (${item.aspectRatio || '3:4'})`;
  if (valTimestamp) valTimestamp.textContent = `${item.formattedDate} • ${item.colorSpace}`;
}

function deleteCurrentGalleryPhoto() {
  if (state.gallery.length === 0) return;
  soundEngine.playTick();
  state.gallery.splice(state.selectedGalleryIndex, 1);
  if (state.selectedGalleryIndex >= state.gallery.length) {
    state.selectedGalleryIndex = Math.max(0, state.gallery.length - 1);
  }
  updateGalleryBadge();

  if (state.gallery.length === 0) {
    const thumbImg = document.getElementById('gallery-thumb');
    const thumbPlaceholder = document.getElementById('gallery-placeholder');
    if (thumbImg) thumbImg.style.display = 'none';
    if (thumbPlaceholder) thumbPlaceholder.style.display = 'block';
    state.lastCapturedUrl = null;
    openGalleryModal();
  } else {
    state.lastCapturedUrl = state.gallery[0].dataUrl;
    const thumbImg = document.getElementById('gallery-thumb');
    if (thumbImg) thumbImg.src = state.lastCapturedUrl;
    renderGalleryFilmStrip();
    selectGalleryPhoto(state.selectedGalleryIndex);
  }
}

function downloadCurrentGalleryPhoto() {
  if (state.gallery.length === 0) return;
  soundEngine.playTick();
  const item = state.gallery[state.selectedGalleryIndex];
  const a = document.createElement('a');
  a.href = item.dataUrl;
  a.download = `SnapStudio_${item.cameraKey}_${Date.now()}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showDynamicIslandBanner('DOWNLOADED', 'PHOTO SAVED', 1800);
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
async function enableWebcam(targetFacingMode) {
  const video = document.getElementById('camera-video');
  const modelCanvas = document.getElementById('model-canvas');
  const promptOverlay = document.getElementById('camera-prompt-overlay');

  if (targetFacingMode) {
    state.facingMode = targetFacingMode;
  }
  const facing = state.facingMode || 'user';

  // Stop previous tracks cleanly
  if (state.currentStream) {
    try {
      state.currentStream.getTracks().forEach(track => track.stop());
    } catch(e) {}
    state.currentStream = null;
  }
  if (video && video.srcObject) {
    try {
      video.srcObject.getTracks().forEach(track => track.stop());
    } catch(e) {}
    video.srcObject = null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920, min: 640 },
        height: { ideal: 1080, min: 480 },
        facingMode: facing
      },
      audio: false
    });

    state.currentStream = stream;
    video.srcObject = stream;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('muted', 'true');
    video.style.display = 'block';

    // Apply mirroring: front camera mirrors, rear camera normal
    video.style.transform = (facing === 'user') ? 'scaleX(-1)' : 'none';

    if (modelCanvas) modelCanvas.style.display = 'none';
    if (promptOverlay) promptOverlay.style.display = 'none';

    // Critical for iOS Safari: explicit play()
    await video.play().catch(playErr => {
      console.warn("Autoplay was prevented by browser policy:", playErr);
    });

    state.cameraSource = 'webcam';

    const btnWebcam = document.getElementById('btn-use-webcam');
    const btnFem = document.getElementById('btn-use-female');
    const btnMale = document.getElementById('btn-use-male');
    if (btnWebcam) btnWebcam.classList.add('active');
    if (btnFem) btnFem.classList.remove('active');
    if (btnMale) btnMale.classList.remove('active');

    applyCurrentCameraFilter();
    showDynamicIslandBanner('LIVE CAMERA', facing === 'user' ? '전면 카메라' : '후면 카메라', 1800);
    return true;
  } catch (err) {
    console.warn('Webcam access failed or denied:', err);
    if (promptOverlay) promptOverlay.style.display = 'flex';
    useStudioModel('female');
    showDynamicIslandBanner('STUDIO MODEL', '카메라 권한 필요', 2000);
    return false;
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
// QuickTake Long-Press Live Video Recording Engine (Apple HIG Gestures)
// ==========================================================================
let quickTakeHoldTimer = null;
let quickTakeStartTime = 0;
let quickTakeStream = null;

function formatTimecode(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function startQuickTakeVideoRecording() {
  if (state.isRecordingVideo) return;
  state.isRecordingVideo = true;
  state.recordingSeconds = 0;

  soundEngine.playRecordStart();

  // 1. Shutter Button UI morphing: circular ring -> pulsing red square
  const shutterBtn = document.getElementById('shutter-btn');
  if (shutterBtn) shutterBtn.classList.add('recording');

  // 2. Viewfinder REC banner
  const recBanner = document.getElementById('viewfinder-rec-banner');
  const vfRecTime = document.getElementById('vf-rec-time');
  if (recBanner) recBanner.classList.add('active');
  if (vfRecTime) vfRecTime.textContent = '00:00';

  // 3. Dynamic Island expansion into live REC banner
  const island = document.getElementById('dynamic-island');
  const label = document.getElementById('island-label');
  const extra = document.getElementById('island-extra');
  if (island) island.classList.add('recording', 'expanded');
  if (label) label.innerHTML = '<span class="rec-dot-pulsing"></span>REC VIDEO';
  if (extra) extra.textContent = '00:00';

  // 4. Live media recording stream capture (MediaRecorder API)
  state.recordedVideoChunks = [];
  try {
    const canvas = state.cameraSource === 'webcam'
      ? document.getElementById('camera-video')
      : document.getElementById('model-canvas');
    if (canvas && canvas.captureStream) {
      quickTakeStream = canvas.captureStream(30);
      const mime = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9'))
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      if (typeof MediaRecorder !== 'undefined') {
        state.mediaRecorder = new MediaRecorder(quickTakeStream, { mimeType: mime });
        state.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) state.recordedVideoChunks.push(e.data);
        };
        state.mediaRecorder.start(100);
      }
    }
  } catch (e) {
    console.warn('Canvas stream capture fallback:', e);
  }

  // 5. Timecode ticker
  state.recordingTimerInterval = setInterval(() => {
    state.recordingSeconds += 1;
    const timeStr = formatTimecode(state.recordingSeconds);
    if (vfRecTime) vfRecTime.textContent = timeStr;
    if (extra) extra.textContent = timeStr;
  }, 1000);
}

function stopQuickTakeVideoRecording() {
  if (!state.isRecordingVideo) return;
  state.isRecordingVideo = false;

  clearInterval(state.recordingTimerInterval);
  state.recordingTimerInterval = null;

  soundEngine.playRecordStop();

  // 1. Revert UI morphing
  const shutterBtn = document.getElementById('shutter-btn');
  if (shutterBtn) shutterBtn.classList.remove('recording');

  const recBanner = document.getElementById('viewfinder-rec-banner');
  if (recBanner) recBanner.classList.remove('active');

  const island = document.getElementById('dynamic-island');
  if (island) {
    island.classList.remove('recording');
    setTimeout(() => island.classList.remove('expanded'), 800);
  }

  // 2. Finalize Video Stream & Artifact
  const recordedDuration = state.recordingSeconds;
  const durationStr = formatTimecode(Math.max(1, recordedDuration));
  const cam = CAMERAS[state.activeCamera];

  const snapshotDataUrl = state.lastCapturedUrl || generateDefaultThumb();

  let finalVideoUrl = null;
  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    state.mediaRecorder.onstop = () => {
      if (state.recordedVideoChunks.length > 0) {
        const blob = new Blob(state.recordedVideoChunks, { type: 'video/webm' });
        finalVideoUrl = URL.createObjectURL(blob);
      }
      saveQuickTakeVideoRecord(finalVideoUrl || snapshotDataUrl, snapshotDataUrl, durationStr, recordedDuration, cam);
    };
    state.mediaRecorder.stop();
  } else {
    saveQuickTakeVideoRecord(snapshotDataUrl, snapshotDataUrl, durationStr, recordedDuration, cam);
  }
}

function saveQuickTakeVideoRecord(videoUrl, posterUrl, durationStr, durationSec, cam) {
  const fKey = state.selectedFilters[cam.id];
  const filterSpec = (cam.filters && cam.filters[fKey]) ? cam.filters[fKey] : { name: 'Standard Pass', desc: '표준 렌더링' };

  const videoRecord = {
    id: 'video_' + Date.now(),
    isVideo: true,
    videoUrl: videoUrl,
    dataUrl: posterUrl,
    duration: durationStr,
    durationSec: durationSec,
    timestamp: new Date().toISOString(),
    formattedDate: new Date().toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }),
    cameraKey: cam.id,
    cameraName: cam.name,
    lensModel: cam.lensModel || 'Precision Optical Glass',
    filterName: filterSpec.name,
    filterDesc: `${filterSpec.desc} (QuickTake Video Record)`,
    opticalLens: state.lensFilter !== 'none' ? state.lensFilter.toUpperCase() : 'Clear (None)',
    shutterSpeed: '1/60s (30 fps)',
    aperture: cam.exposure ? cam.exposure.aperture : 'f/2.8',
    iso: cam.exposure ? cam.exposure.iso : 'ISO 200',
    exposure: `1/60s (30fps) • ${cam.exposure ? cam.exposure.aperture : 'f/2.8'} • Video Mode`,
    focalLength: cam.exposure ? cam.exposure.focal : '35mm eq.',
    flashFired: false,
    width: 1080,
    height: 1440,
    aspectRatio: '3:4 Video',
    colorSpace: 'sRGB Display P3 Video',
    exif: {
      camera: cam.name,
      lens: cam.lensModel || 'Precision Optical Glass',
      filter: filterSpec.name + ' (QuickTake)',
      optical: state.lensFilter !== 'none' ? state.lensFilter.toUpperCase() : 'Clear (None)',
      shutter: '1/60s',
      aperture: cam.exposure ? cam.exposure.aperture : 'f/2.8',
      iso: 'ISO 200',
      focal: cam.exposure ? cam.exposure.focal : '35mm eq.',
      flash: 'Off',
      timestamp: new Date().toISOString()
    }
  };

  state.gallery.unshift(videoRecord);
  state.selectedGalleryIndex = 0;
  updateGalleryBadge();

  const thumbImg = document.getElementById('gallery-thumb');
  const thumbPlaceholder = document.getElementById('gallery-placeholder');
  if (thumbImg) {
    thumbImg.src = posterUrl;
    thumbImg.style.display = 'block';
  }
  if (thumbPlaceholder) thumbPlaceholder.style.display = 'none';

  showDynamicIslandBanner('VIDEO SAVED', `QUICKTAKE ${durationStr}`, 2000);

  setTimeout(() => {
    openGalleryModal();
  }, 400);
}

function initQuickTakeShutter() {
  const shutterBtn = document.getElementById('shutter-btn');
  if (!shutterBtn) return;

  let isPointerHeld = false;
  let didRecord = false;
  let handledByPointer = false;

  const handlePointerDown = (e) => {
    isPointerHeld = true;
    didRecord = false;
    handledByPointer = false;
    quickTakeStartTime = Date.now();
    clearTimeout(quickTakeHoldTimer);
    quickTakeHoldTimer = setTimeout(() => {
      if (isPointerHeld) {
        didRecord = true;
        handledByPointer = true;
        startQuickTakeVideoRecording();
      }
    }, 280);
  };

  const handlePointerUp = (e) => {
    clearTimeout(quickTakeHoldTimer);
    if (didRecord || state.isRecordingVideo) {
      stopQuickTakeVideoRecording();
      didRecord = false;
      isPointerHeld = false;
      handledByPointer = true;
      return;
    }

    if (isPointerHeld) {
      isPointerHeld = false;
      handledByPointer = true;
      triggerShutterCapture();
    }
  };

  const handlePointerCancel = () => {
    clearTimeout(quickTakeHoldTimer);
    isPointerHeld = false;
    if (didRecord || state.isRecordingVideo) {
      stopQuickTakeVideoRecording();
      didRecord = false;
    }
  };

  const handleClick = (e) => {
    // If pointer already handled the tap or recording, prevent duplicate capture
    if (handledByPointer) {
      handledByPointer = false;
      return;
    }
    triggerShutterCapture();
  };

  shutterBtn.addEventListener('pointerdown', handlePointerDown);
  shutterBtn.addEventListener('pointerup', handlePointerUp);
  shutterBtn.addEventListener('pointerleave', handlePointerCancel);
  shutterBtn.addEventListener('pointercancel', handlePointerCancel);
  shutterBtn.addEventListener('click', handleClick);

  // Fallback hardware volume buttons
  const volUp = document.getElementById('hw-vol-up-btn');
  const volDown = document.getElementById('hw-vol-down-btn');
  if (volUp) volUp.addEventListener('click', triggerShutterCapture);
  if (volDown) volDown.addEventListener('click', triggerShutterCapture);
}

// ==========================================================================
// 5. Ergonomic Multi-Camera Switching Subsystems (4-Tier Architecture)
// ==========================================================================

// Tier 1: Viewfinder Horizontal Swipe Gesture (Left: Next, Right: Prev)
function initViewfinderSwipe() {
  const vf = document.getElementById('viewfinder');
  if (!vf) return;

  let startX = 0;
  let startY = 0;
  let isSwiping = false;

  vf.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.camera-model-badge-container') || e.target.closest('button')) return;
    startX = e.clientX;
    startY = e.clientY;
    isSwiping = true;
  });

  vf.addEventListener('pointerup', (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) {
        switchNextCamera();
      } else {
        switchPrevCamera();
      }
    }
  });

  vf.addEventListener('pointercancel', () => {
    isSwiping = false;
  });
}

// Tier 3: Category Fast-Jump Bar (Bubble, Y2K, Medium Format, Studio)
function initCameraCategoryBar() {
  document.querySelectorAll('.camera-category-bar .cam-cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      soundEngine.playTick();
      const cat = pill.dataset.cat;
      if (cat === 'all') {
        document.querySelectorAll('.camera-category-bar .cam-cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        return;
      }

      const camsInCat = CAMERA_CATEGORIES[cat] || [];
      if (camsInCat.length === 0) return;

      const currentIdx = camsInCat.indexOf(state.activeCamera);
      if (currentIdx === -1) {
        switchCamera(camsInCat[0]);
      } else {
        const nextIdx = (currentIdx + 1) % camsInCat.length;
        switchCamera(camsInCat[nextIdx]);
      }
    });
  });
}

// Tier 4: Visual Camera Bag / Rack Drawer Modal (16 Iconic Bodies)
function openCameraBagModal() {
  renderCameraBagGrid('all');
  const modal = document.getElementById('camera-bag-modal');
  if (modal) {
    soundEngine.playTick();
    modal.classList.add('open');
    showDynamicIslandBanner('CAMERA BAG', '16 ICONIC CAMERAS', 1500);
  }
}

function closeCameraBagModal() {
  const modal = document.getElementById('camera-bag-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

function renderCameraBagGrid(filterCat = 'all') {
  const grid = document.getElementById('camera-bag-grid');
  if (!grid) return;

  grid.innerHTML = '';
  CAMERA_ORDER.forEach(camId => {
    const cam = CAMERAS[camId];
    if (!cam) return;
    const cat = getCameraCategory(camId);
    if (filterCat !== 'all' && cat !== filterCat) return;

    const isEquipped = state.activeCamera === camId;
    const card = document.createElement('div');
    card.className = `bag-cam-card ${isEquipped ? 'equipped' : ''}`;
    card.dataset.cam = camId;
    card.dataset.cat = cat;

    let desc = cam.sub;
    if (cam.filters) {
      const firstFilter = Object.values(cam.filters)[0];
      if (firstFilter) desc = `${cam.sub} • ${firstFilter.desc}`;
    }

    card.innerHTML = `
      <div class="bag-card-top">
        <span class="bag-card-icon">${CAM_SVG_ICONS[camId] || CAM_SVG_ICONS['default']}</span>
        <span class="bag-card-badge">${cam.badge}</span>
      </div>
      <div class="bag-card-title">${cam.name}</div>
      <div class="bag-card-desc">${desc}</div>
      <div class="bag-card-status">${isEquipped ? '● 장착 중 (EQUIPPED)' : '○ 탭하여 즉시 장착'}</div>
    `;

    card.addEventListener('click', () => {
      soundEngine.playMount();
      switchCamera(camId);
      closeCameraBagModal();
    });

    grid.appendChild(card);
  });
}

function initCameraBagModal() {
  const btnBagTop = document.getElementById('btn-camera-bag');
  if (btnBagTop) btnBagTop.addEventListener('click', openCameraBagModal);

  const btnBagBottom = document.getElementById('bottom-camera-bag-btn');
  if (btnBagBottom) btnBagBottom.addEventListener('click', openCameraBagModal);

  const badgeHud = document.getElementById('camera-model-badge');
  if (badgeHud) badgeHud.addEventListener('click', openCameraBagModal);

  const btnCloseBag = document.getElementById('btn-close-camera-bag');
  if (btnCloseBag) btnCloseBag.addEventListener('click', closeCameraBagModal);

  const btnCloseBottom = document.getElementById('btn-bag-close-bottom');
  if (btnCloseBottom) btnCloseBottom.addEventListener('click', closeCameraBagModal);

  const modal = document.getElementById('camera-bag-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCameraBagModal();
    });
  }

  document.querySelectorAll('#bag-category-filter .bag-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundEngine.playTick();
      document.querySelectorAll('#bag-category-filter .bag-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCameraBagGrid(btn.dataset.cat);
    });
  });

  const btnPrev = document.getElementById('btn-cam-prev');
  if (btnPrev) btnPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    switchPrevCamera();
  });

  const btnNext = document.getElementById('btn-cam-next');
  if (btnNext) btnNext.addEventListener('click', (e) => {
    e.stopPropagation();
    switchNextCamera();
  });
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

  // 3. Ergonomic Multi-Camera Systems (Swipe, Steppers, Category Jump, Visual Bag)
  initViewfinderSwipe();
  initCameraCategoryBar();
  initCameraBagModal();

  // 4. QuickTake Long-Press Shutter & Volume Hardware Buttons
  initQuickTakeShutter();

  // 4. Gallery Triggers
  const galBtn = document.getElementById('gallery-btn');
  if (galBtn) {
    galBtn.addEventListener('click', openGalleryModal);
  }

  const galTopBtn = document.getElementById('btn-gallery-top');
  if (galTopBtn) {
    galTopBtn.addEventListener('click', openGalleryModal);
  }

  const galSidebarBtn = document.getElementById('sidebar-btn-gallery');
  if (galSidebarBtn) {
    galSidebarBtn.addEventListener('click', openGalleryModal);
  }

  const btnCloseGallery = document.getElementById('btn-close-gallery-modal');
  if (btnCloseGallery) {
    btnCloseGallery.addEventListener('click', closeGalleryModal);
  }

  const btnGalDelete = document.getElementById('btn-gallery-delete');
  if (btnGalDelete) {
    btnGalDelete.addEventListener('click', deleteCurrentGalleryPhoto);
  }

  const btnGalDownload = document.getElementById('btn-gallery-download');
  if (btnGalDownload) {
    btnGalDownload.addEventListener('click', downloadCurrentGalleryPhoto);
  }

  const btnGalPrint = document.getElementById('btn-gallery-print');
  if (btnGalPrint) {
    btnGalPrint.addEventListener('click', () => {
      closeGalleryModal();
      openPrintSheetModal();
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

  // 8. Camera Flip (Front <-> Rear Camera)
  const btnFlip = document.getElementById('btn-flip');
  if (btnFlip) {
    btnFlip.addEventListener('click', async () => {
      soundEngine.playTick();
      if (state.cameraSource !== 'webcam') {
        await enableWebcam('user');
      } else {
        const nextFacing = state.facingMode === 'user' ? 'environment' : 'user';
        await enableWebcam(nextFacing);
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

  // Olympus μ2 Toggles
  const mjuDateToggle = document.getElementById('toggle-mju-date');
  if (mjuDateToggle) {
    mjuDateToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const dateEl = document.querySelector('#olympus-osd .olympus-date');
      const active = mjuDateToggle.classList.toggle('active');
      if (dateEl) dateEl.style.display = active ? 'block' : 'none';
    });
  }

  const mjuAfToggle = document.getElementById('toggle-mju-af');
  if (mjuAfToggle) {
    mjuAfToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const afEl = document.querySelector('#olympus-osd .olympus-af-brackets');
      const active = mjuAfToggle.classList.toggle('active');
      if (afEl) afEl.style.display = active ? 'block' : 'none';
    });
  }

  // Contax T2 Toggles
  const contaxLedToggle = document.getElementById('toggle-contax-led');
  if (contaxLedToggle) {
    contaxLedToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const ledEl = document.querySelector('#contax-osd .contax-led-bar');
      const active = contaxLedToggle.classList.toggle('active');
      if (ledEl) ledEl.style.display = active ? 'flex' : 'none';
    });
  }

  // Ricoh GR Toggles
  const ricohLevelToggle = document.getElementById('toggle-ricoh-level');
  if (ricohLevelToggle) {
    ricohLevelToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const levelEl = document.querySelector('#ricoh-osd .ricoh-leveler');
      const active = ricohLevelToggle.classList.toggle('active');
      if (levelEl) levelEl.style.display = active ? 'flex' : 'none';
    });
  }

  const ricohSnapToggle = document.getElementById('toggle-ricoh-snap');
  if (ricohSnapToggle) {
    ricohSnapToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const snapEl = document.querySelector('#ricoh-osd .ricoh-snap-dist');
      const active = ricohSnapToggle.classList.toggle('active');
      if (snapEl) snapEl.style.display = active ? 'inline' : 'none';
    });
  }

  // Leica M Toggles
  const leicaRfToggle = document.getElementById('toggle-leica-rf');
  if (leicaRfToggle) {
    leicaRfToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const rfEl = document.querySelector('#leica-m-osd .leica-split-patch');
      const active = leicaRfToggle.classList.toggle('active');
      if (rfEl) rfEl.style.display = active ? 'flex' : 'none';
    });
  }

  const leicaFrameToggle = document.getElementById('toggle-leica-frameline');
  if (leicaFrameToggle) {
    leicaFrameToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const frameEl = document.querySelector('#leica-m-osd .leica-bright-frameline');
      const active = leicaFrameToggle.classList.toggle('active');
      if (frameEl) frameEl.style.display = active ? 'block' : 'none';
    });
  }

  // City Pop 80s Toggles
  const cityCassetteToggle = document.getElementById('toggle-citypop-cassette');
  if (cityCassetteToggle) {
    cityCassetteToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const bannerEl = document.querySelector('#citypop-osd .citypop-top-banner');
      const bottomEl = document.querySelector('#citypop-osd .citypop-bottom-bar');
      const active = cityCassetteToggle.classList.toggle('active');
      if (bannerEl) bannerEl.style.display = active ? 'flex' : 'none';
      if (bottomEl) bottomEl.style.display = active ? 'flex' : 'none';
    });
  }

  const cityNeonToggle = document.getElementById('toggle-citypop-neon');
  if (cityNeonToggle) {
    cityNeonToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const badgeEl = document.querySelector('#citypop-osd .citypop-synth-badge');
      const active = cityNeonToggle.classList.toggle('active');
      if (badgeEl) badgeEl.style.display = active ? 'block' : 'none';
    });
  }

  // Old Film 35mm Toggles
  const oldfilmSprocketToggle = document.getElementById('toggle-oldfilm-sprocket');
  if (oldfilmSprocketToggle) {
    oldfilmSprocketToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const topSprocket = document.querySelector('#oldfilm-osd .film-sprocket-top');
      const botSprocket = document.querySelector('#oldfilm-osd .film-sprocket-bottom');
      const active = oldfilmSprocketToggle.classList.toggle('active');
      if (topSprocket) topSprocket.style.display = active ? 'flex' : 'none';
      if (botSprocket) botSprocket.style.display = active ? 'flex' : 'none';
    });
  }

  const oldfilmHalationToggle = document.getElementById('toggle-oldfilm-halation');
  if (oldfilmHalationToggle) {
    oldfilmHalationToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const halation = document.getElementById('cinestill-halation');
      const active = oldfilmHalationToggle.classList.toggle('active');
      if (halation) halation.style.display = active ? 'block' : 'none';
    });
  }

  // Hasselblad 500C/M Toggles
  const hasselWaistToggle = document.getElementById('toggle-hassel-waist');
  if (hasselWaistToggle) {
    hasselWaistToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const frameEl = document.querySelector('#hasselblad-osd .hasselblad-square-frame');
      const active = hasselWaistToggle.classList.toggle('active');
      if (frameEl) frameEl.style.display = active ? 'flex' : 'none';
    });
  }

  const hasselCrossToggle = document.getElementById('toggle-hassel-cross');
  if (hasselCrossToggle) {
    hasselCrossToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const crossEl = document.querySelector('#hasselblad-osd .hasselblad-crosshair');
      const active = hasselCrossToggle.classList.toggle('active');
      if (crossEl) crossEl.style.display = active ? 'block' : 'none';
    });
  }

  // Polaroid SX-70 Toggles
  const sx70SplitToggle = document.getElementById('toggle-sx70-split');
  if (sx70SplitToggle) {
    sx70SplitToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const circleEl = document.querySelector('#polaroid-sx70-osd .sx70-split-circle');
      const active = sx70SplitToggle.classList.toggle('active');
      if (circleEl) circleEl.style.display = active ? 'flex' : 'none';
    });
  }

  const sx70RainbowToggle = document.getElementById('toggle-sx70-rainbow');
  if (sx70RainbowToggle) {
    sx70RainbowToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const rainbowEl = document.querySelector('#polaroid-sx70-osd .sx70-rainbow-stripe');
      const active = sx70RainbowToggle.classList.toggle('active');
      if (rainbowEl) rainbowEl.style.display = active ? 'flex' : 'none';
    });
  }

  // Fuji QuickSnap Toggles
  const quicksnapDateToggle = document.getElementById('toggle-quicksnap-date');
  if (quicksnapDateToggle) {
    quicksnapDateToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const dateEl = document.getElementById('quicksnap-date-stamp');
      const active = quicksnapDateToggle.classList.toggle('active');
      if (dateEl) dateEl.style.display = active ? 'block' : 'none';
    });
  }

  const quicksnapFlareToggle = document.getElementById('toggle-quicksnap-flare');
  if (quicksnapFlareToggle) {
    quicksnapFlareToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const flashEl = document.querySelector('#quicksnap-osd .quicksnap-flash-indicator');
      const active = quicksnapFlareToggle.classList.toggle('active');
      if (flashEl) flashEl.style.display = active ? 'flex' : 'none';
    });
  }

  // Kyocera Samurai Toggles
  const samuraiHalfToggle = document.getElementById('toggle-samurai-halfline');
  if (samuraiHalfToggle) {
    samuraiHalfToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const guideEl = document.querySelector('#kyocera-samurai-osd .samurai-half-frame-guide');
      const active = samuraiHalfToggle.classList.toggle('active');
      if (guideEl) guideEl.style.display = active ? 'block' : 'none';
    });
  }

  const samuraiLcdToggle = document.getElementById('toggle-samurai-lcd');
  if (samuraiLcdToggle) {
    samuraiLcdToggle.addEventListener('click', () => {
      soundEngine.playTick();
      const brandEl = document.querySelector('#kyocera-samurai-osd .samurai-brand');
      const expEl = document.querySelector('#kyocera-samurai-osd .samurai-exp-lcd');
      const active = samuraiLcdToggle.classList.toggle('active');
      if (brandEl) brandEl.style.display = active ? 'block' : 'none';
      if (expEl) expEl.style.display = active ? 'block' : 'none';
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

  // Keyboard Shortcuts (Arrow Keys for Switching, 'b' for Bag, 1~6 for Presets)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.contentEditable === 'true') return;

    if (e.code === 'Space') {
      e.preventDefault();
      triggerShutterCapture();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      switchPrevCamera();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      switchNextCamera();
    } else if (e.key === 'b' || e.key === 'B') {
      e.preventDefault();
      const bagModal = document.getElementById('camera-bag-modal');
      if (bagModal && bagModal.classList.contains('open')) {
        closeCameraBagModal();
      } else {
        openCameraBagModal();
      }
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
// 8. Device Tier & iOS Version Switcher (Cross-Device & Cross-OS Preview)
// ==========================================================================
function initDeviceAndOSSwitcher() {
  const deviceWrapper = document.querySelector('.device-wrapper');
  const dimDisplay = document.getElementById('active-viewport-dim');
  const deviceBtns = document.querySelectorAll('.device-select-btn');
  const iosBtns = document.querySelectorAll('.ios-ver-btn');

  deviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      deviceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const dev = btn.dataset.device;
      const w = btn.dataset.width;
      const h = btn.dataset.height;
      const r = btn.dataset.radius;

      if (deviceWrapper) {
        deviceWrapper.classList.remove('device-se', 'device-mini', 'device-standard', 'device-max');
        deviceWrapper.classList.add(`device-${dev}`);
        deviceWrapper.style.setProperty('--device-width', `${w}px`);
        deviceWrapper.style.setProperty('--device-height', `${h}px`);
        deviceWrapper.style.setProperty('--device-radius', `${r}px`);
      }

      if (dimDisplay) {
        dimDisplay.textContent = `${w} × ${h} pt`;
      }
    });
  });

  iosBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      iosBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const ver = btn.dataset.ios;
      if (deviceWrapper) {
        deviceWrapper.classList.remove('ios-16', 'ios-17', 'ios-18');
        deviceWrapper.classList.add(`ios-${ver}`);
      }
    });
  });

  // iOS Safari 100dvh & AudioContext First Touch Unlock
  const unlockAudio = () => {
    try {
      if (window.AudioContext || window.webkitAudioContext) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      }
    } catch (e) {}
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('click', unlockAudio);
  };
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('click', unlockAudio, { passive: true });
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
  initDeviceAndOSSwitcher();

  // Connect Start Camera button and viewfinder touch
  const btnStartCam = document.getElementById('btn-start-camera');
  if (btnStartCam) {
    btnStartCam.addEventListener('click', (e) => {
      e.stopPropagation();
      enableWebcam(state.facingMode || 'user');
    });
  }

  // Start with iconic Canon IXY Digital 50
  switchCamera('canon-ixy');

  // Auto-attempt webcam if supported
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    enableWebcam(state.facingMode || 'user').catch(() => {});
  }
});

// Expose on window for QA test automation
window.switchCamera = switchCamera;
window.executeCapture = executeCapture;
window.renderStudioModel = renderStudioModel;
window.applyCurrentCameraFilter = applyCurrentCameraFilter;
window.applyLensFilter = applyLensFilter;
window.enableWebcam = enableWebcam;
window.useStudioModel = useStudioModel;
