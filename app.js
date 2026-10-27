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
  lastCapturedUrl: null,

  // FIMO Analog Viewfinder & Deck State
  fimoDateEnabled: true,
  fimoCaptionEnabled: false,
  fimoZoomLevel: 1.0,
  fimoExposureEV: 0.0,
  fimoFilmRemaining: 24,
  fimoFilmTotal: 27
};

// FIMO Persona & Showcase Personas for 16 Collectible Camera Bodies
const FIMO_CAMERA_PERSONAS = {
  'kyocera-samurai': {
    personaName: 'Osaka Classic',
    isNew: true,
    subtitle: 'half frame 72',
    captionText: 'OSAKA 1988 // HALF-FRAME',
    heroImg: 'assets/hero/kyocera-samurai_hero.png',
    thumbs: ['assets/hero/kyocera-samurai_hero.png', 'assets/hero/seoul_instc_hero.jpg', 'assets/hero/thumb_cat1.jpg']
  },
  'sihyun-color': {
    personaName: 'Butterfilm',
    isNew: true,
    subtitle: 'personal color studio',
    captionText: '내가 당신을 사랑할 때 보이는 순간들',
    heroImg: 'assets/hero/sihyun-color_hero.png',
    thumbs: ['assets/hero/sihyun-color_hero.png', 'assets/hero/thumb_cat2.jpg', 'assets/hero/thumb_cat3.jpg']
  },
  'instax-mini': {
    personaName: 'Seoul instc',
    isNew: false,
    subtitle: 'film white',
    captionText: 'SEOUL // INSTANT MEMORY',
    heroImg: 'assets/hero/seoul_instc_hero.jpg',
    thumbs: ['assets/hero/thumb_cat1.jpg', 'assets/hero/thumb_cat2.jpg', 'assets/hero/thumb_cat3.jpg']
  },
  'olympus-mju': {
    personaName: 'Lime Memory',
    isNew: false,
    subtitle: 'all-weather 35mm',
    captionText: '초록빛 계절의 기억, Lime',
    heroImg: 'assets/hero/olympus-mju_hero.png',
    thumbs: ['assets/hero/olympus-mju_hero.png', 'assets/hero/thumb_cat1.jpg', 'assets/hero/thumb_cat2.jpg']
  },
  'canon-ixy': {
    personaName: 'Cold Snap',
    isNew: false,
    subtitle: 'y2k peach ccd',
    captionText: 'SHIBUYA 2003 // COLD SNAP',
    heroImg: 'assets/hero/canon-ixy_hero.png',
    thumbs: ['assets/hero/canon-ixy_hero.png', 'assets/hero/thumb_cat3.jpg', 'assets/hero/thumb_cat1.jpg']
  },
  'ricoh-gr': {
    personaName: 'Nature Core',
    isNew: false,
    subtitle: '28mm street snap',
    captionText: '숲과 바람의 기록, Nature',
    heroImg: 'assets/hero/ricoh-gr_hero.png',
    thumbs: ['assets/hero/ricoh-gr_hero.png', 'assets/hero/thumb_cat2.jpg', 'assets/hero/thumb_cat1.jpg']
  },
  'contax-t2': {
    personaName: 'Pearl 08',
    isNew: false,
    subtitle: 'titanium zeiss t*',
    captionText: '2008 PEARL // GOLDEN HOUR',
    heroImg: 'assets/hero/contax-t2_hero.png',
    thumbs: ['assets/hero/contax-t2_hero.png', 'assets/hero/thumb_cat1.jpg', 'assets/hero/thumb_cat3.jpg']
  },
  'fuji-quicksnap': {
    personaName: 'Sunny Saver',
    isNew: false,
    subtitle: 'disposable 1986',
    captionText: '1986 写ルンです // SUNNY DAY',
    heroImg: 'assets/hero/fuji-quicksnap_hero.png',
    thumbs: ['assets/hero/fuji-quicksnap_hero.png', 'assets/hero/thumb_cat1.jpg', 'assets/hero/thumb_cat2.jpg']
  },
  'sony-handycam': {
    personaName: 'Lazy Monkey',
    isNew: false,
    subtitle: 'minidv 3ccd camcorder',
    captionText: '영원히 기억될 방과 후의 조각',
    heroImg: 'assets/hero/sony-handycam_hero.png',
    thumbs: ['assets/hero/sony-handycam_hero.png', 'assets/hero/thumb_cat3.jpg', 'assets/hero/thumb_cat2.jpg']
  },
  'sony-cybershot': {
    personaName: 'Night Tape 98',
    isNew: false,
    subtitle: 'ditto 98 winter vhs',
    captionText: '1998.12.19 우리의 겨울, Ditto',
    heroImg: 'assets/hero/sony-cybershot_hero.png',
    thumbs: ['assets/hero/sony-cybershot_hero.png', 'assets/hero/thumb_cat1.jpg', 'assets/hero/thumb_cat3.jpg']
  },
  'citypop-80s': {
    personaName: 'Pocari Blue',
    isNew: false,
    subtitle: 'tokyo bubble 1986',
    captionText: '푸른 여름의 조각, 포카리 블루',
    heroImg: 'assets/hero/citypop-80s_hero.png',
    thumbs: ['assets/hero/citypop-80s_hero.png', 'assets/hero/thumb_cat2.jpg', 'assets/hero/thumb_cat1.jpg']
  },
  'oldfilm-35mm': {
    personaName: "Wedding '95",
    isNew: false,
    subtitle: 'portra 400 halation',
    captionText: '1995.05 우리의 가장 빛나던 날',
    heroImg: 'assets/hero/oldfilm-35mm_hero.png',
    thumbs: ['assets/hero/oldfilm-35mm_hero.png', 'assets/hero/thumb_cat1.jpg', 'assets/hero/thumb_cat2.jpg']
  },
  'polaroid-sx70': {
    personaName: 'Ohio Summer',
    isNew: false,
    subtitle: 'vintage folding instant',
    captionText: 'OHIO 1979 // SUMMER BREEZE',
    heroImg: 'assets/hero/polaroid-sx70_hero.png',
    thumbs: ['assets/hero/polaroid-sx70_hero.png', 'assets/hero/thumb_cat3.jpg', 'assets/hero/thumb_cat1.jpg']
  },
  'leica-m': {
    personaName: 'Day Classic',
    isNew: false,
    subtitle: 'summilux rangefinder',
    captionText: 'WETZLAR // TIMELESS MOMENT',
    heroImg: 'assets/hero/leica-m_hero.png',
    thumbs: ['assets/hero/leica-m_hero.png', 'assets/hero/thumb_cat2.jpg', 'assets/hero/thumb_cat3.jpg']
  },
  'hasselblad-500cm': {
    personaName: 'Dark Akan 77',
    isNew: false,
    subtitle: 'medium format 6x6',
    captionText: '1977 AKAN // DEEP SHADOW',
    heroImg: 'assets/hero/hasselblad_hero.png',
    thumbs: ['assets/hero/hasselblad_hero.png', 'assets/hero/thumb_cat1.jpg', 'assets/hero/thumb_cat2.jpg']
  },
  'passport-id': {
    personaName: 'Passport ID',
    isNew: false,
    subtitle: 'official 3.5x4.5 studio',
    captionText: 'OFFICIAL STUDIO RECORD',
    heroImg: 'assets/hero/passport-id_hero.png',
    thumbs: ['assets/hero/passport-id_hero.png', 'assets/hero/thumb_cat3.jpg', 'assets/hero/thumb_cat2.jpg']
  }
};

const FIMO_ORDERED_CAMERAS = [
  'kyocera-samurai',
  'sihyun-color',
  'instax-mini',
  'olympus-mju',
  'canon-ixy',
  'ricoh-gr',
  'contax-t2',
  'fuji-quicksnap',
  'sony-handycam',
  'sony-cybershot',
  'citypop-80s',
  'oldfilm-35mm',
  'polaroid-sx70',
  'leica-m',
  'hasselblad-500cm',
  'passport-id'
];

// Authentic High-Detail Vector SVG Icons Matching User's Reference 16 Collectible Camera Bodies 1:1
const CAM_SVG_ICONS = {
  // 01. Osaka Classic (Matte Silver-Grey Minimalist Compact Body)
  'kyocera-samurai': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg samurai-svg osaka-classic-svg"><defs><linearGradient id="oc_body" x1="0" y1="8" x2="96" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E5E7EB"/><stop offset="50%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient></defs><rect x="64" y="6" width="13" height="4" rx="1.2" fill="#94A3B8"/><rect x="18" y="7" width="9" height="3" rx="1" fill="#64748B"/><rect x="10" y="10" width="76" height="46" rx="6" fill="url(#oc_body)" stroke="#64748B" stroke-width="1.2"/><line x1="10" y1="22" x2="86" y2="22" stroke="#94A3B8" stroke-width="0.8"/><rect x="16" y="14" width="13" height="5.5" rx="1.2" fill="#FEF08A" stroke="#CA8A04" stroke-width="0.6"/><rect x="44" y="14" width="8" height="5" rx="1" fill="#38BDF8" stroke="#0284C7" stroke-width="0.6"/><circle cx="58" cy="16.5" r="2" fill="#EF4444"/><circle cx="48" cy="38" r="15.5" fill="#334155" stroke="#E2E8F0" stroke-width="2"/><circle cx="48" cy="38" r="11.5" fill="#0F172A" stroke="#64748B" stroke-width="1"/><circle cx="48" cy="38" r="7.5" fill="#1E293B"/><path d="M43 34 A 6 6 0 0 1 53 35" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/><text x="23" y="49" fill="#334155" font-size="4.2" font-weight="900" font-family="sans-serif">OSAKA</text></svg>`,

  // 02. Butterfilm (Olive-Gold Champagne Top Plate & Warm Camel-Brown Leather Body)
  'sihyun-color': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg colorstudio-svg butterfilm-svg"><defs><linearGradient id="bf_top" x1="0" y1="8" x2="96" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E6D7B2"/><stop offset="50%" stop-color="#C8B482"/><stop offset="100%" stop-color="#9E8854"/></linearGradient><linearGradient id="bf_leather" x1="0" y1="22" x2="0" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#855231"/><stop offset="100%" stop-color="#58331B"/></linearGradient></defs><rect x="64" y="6" width="12" height="4" rx="1.2" fill="#C8B482" stroke="#786336" stroke-width="0.7"/><rect x="20" y="7" width="8" height="3" rx="1" fill="#A16207"/><rect x="10" y="10" width="76" height="46" rx="6" fill="url(#bf_leather)" stroke="#58331B" stroke-width="1.2"/><rect x="10" y="10" width="76" height="14" rx="5" fill="url(#bf_top)"/><line x1="10" y1="24" x2="86" y2="24" stroke="#432411" stroke-width="1"/><rect x="16" y="14" width="12" height="6" rx="1.2" fill="#FEF08A" stroke="#A16207" stroke-width="0.6"/><rect x="62" y="14" width="11" height="5.5" rx="1" fill="#38BDF8" stroke="#0369A1" stroke-width="0.6"/><circle cx="48" cy="38" r="15.5" fill="#D6C498" stroke="#58331B" stroke-width="1.5"/><circle cx="48" cy="38" r="11.5" fill="#1C1917" stroke="#A89260" stroke-width="1"/><circle cx="48" cy="38" r="7.5" fill="#292524"/><path d="M43 34 A 5.5 5.5 0 0 1 53 35" stroke="#FEF08A" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/></svg>`,

  // 03. Seoul instc (Cream/Off-White Square Instant Body with Orange Shutter Button)
  'instax-mini': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg instax-svg seoul-instc-svg"><defs><linearGradient id="si_cream" x1="16" y1="6" x2="80" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFFDF9"/><stop offset="60%" stop-color="#F5F0E6"/><stop offset="100%" stop-color="#E6DEC8"/></linearGradient></defs><rect x="20" y="6" width="56" height="52" rx="12" fill="url(#si_cream)" stroke="#D6CBB5" stroke-width="1.5"/><rect x="28" y="12" width="12" height="7" rx="1.8" fill="#FEF08A" stroke="#CA8A04" stroke-width="0.7"/><rect x="58" y="12" width="9" height="7" rx="1.8" fill="#1E293B"/><circle cx="63" cy="25" r="4.2" fill="#F97316" stroke="#EA580C" stroke-width="0.8"/><circle cx="46" cy="36" r="15.5" fill="#E7E0D0" stroke="#C7B99E" stroke-width="1.5"/><circle cx="46" cy="36" r="11.5" fill="#1F2937" stroke="#9CA3AF" stroke-width="1.2"/><circle cx="46" cy="36" r="7" fill="#0F172A"/><path d="M42 32 A 5 5 0 0 1 50 33" stroke="#FFFFFF" stroke-width="1.1" stroke-linecap="round" opacity="0.9"/><text x="48" y="54" fill="#78716C" font-size="3.8" font-weight="800" font-family="sans-serif" text-anchor="middle">instc</text></svg>`,

  // 04. Lime Memory (Olive/Lime Sage Green Rangefinder Body)
  'olympus-mju': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg olympus-svg lime-memory-svg"><defs><linearGradient id="lm_sage" x1="0" y1="10" x2="96" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#A3B88C"/><stop offset="50%" stop-color="#849B6B"/><stop offset="100%" stop-color="#62784B"/></linearGradient></defs><rect x="62" y="6" width="14" height="4" rx="1.2" fill="#CBD5E1" stroke="#64748B" stroke-width="0.7"/><rect x="18" y="7" width="10" height="3" rx="1" fill="#94A3B8"/><rect x="10" y="10" width="76" height="46" rx="6" fill="url(#lm_sage)" stroke="#4D5E3A" stroke-width="1.2"/><rect x="10" y="10" width="76" height="12" rx="5" fill="#D8E2DC" opacity="0.85"/><line x1="10" y1="22" x2="86" y2="22" stroke="#4D5E3A" stroke-width="0.8"/><rect x="16" y="13" width="12" height="6" rx="1.2" fill="#FEF08A" stroke="#CA8A04" stroke-width="0.6"/><rect x="64" y="13.5" width="11" height="5" rx="1" fill="#38BDF8" stroke="#0284C7" stroke-width="0.6"/><circle cx="48" cy="38" r="15" fill="#E2E8F0" stroke="#4D5E3A" stroke-width="1.5"/><circle cx="48" cy="38" r="11" fill="#1E293B" stroke="#94A3B8" stroke-width="1"/><circle cx="48" cy="38" r="7" fill="#0F172A"/><path d="M44 34 A 5 5 0 0 1 52 35" stroke="#86EFAC" stroke-width="1.1" stroke-linecap="round" opacity="0.9"/></svg>`,

  // 05. Cold Snap (Brushed Silver Y2K Digital Compact with Telescopic Lens)
  'canon-ixy': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg ixy-svg cold-snap-svg"><defs><radialGradient id="ixy_brush" cx="62%" cy="55%" r="60%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="40%" stop-color="#E2E8F0"/><stop offset="80%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#94A3B8"/></radialGradient></defs><rect x="62" y="6" width="14" height="4" rx="1.2" fill="#94A3B8"/><rect x="8" y="10" width="80" height="46" rx="8" fill="url(#ixy_brush)" stroke="#94A3B8" stroke-width="1.2"/><text x="16" y="25" fill="#DC2626" font-size="6.8" font-weight="900" font-family="'Times New Roman', serif">Canon</text><text x="16" y="33" fill="#1E293B" font-size="4" font-weight="800" font-family="sans-serif">IXY DIGITAL</text><rect x="38" y="14" width="10" height="5" rx="1" fill="#FEF08A" stroke="#CA8A04" stroke-width="0.6"/><circle cx="32" cy="16.5" r="1.8" fill="#F97316"/><circle cx="58" cy="34" r="17" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.8"/><circle cx="58" cy="34" r="13" fill="#1E293B" stroke="#64748B" stroke-width="1"/><circle cx="58" cy="34" r="8.5" fill="#0284C7"/><path d="M54 30 A 5.5 5.5 0 0 1 62 31" stroke="#FFFFFF" stroke-width="1.1" stroke-linecap="round" opacity="0.9"/></svg>`,

  // 06. Nature Core (Forest Green & Silver Two-Tone Retro Street Camera)
  'ricoh-gr': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg ricoh-svg nature-core-svg"><defs><linearGradient id="nc_green" x1="0" y1="20" x2="0" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#2D5A43"/><stop offset="100%" stop-color="#1B3B2B"/></linearGradient></defs><rect x="62" y="6" width="14" height="4" rx="1" fill="#CBD5E1" stroke="#64748B" stroke-width="0.7"/><rect x="10" y="10" width="76" height="46" rx="5.5" fill="url(#nc_green)" stroke="#142E21" stroke-width="1.2"/><rect x="10" y="10" width="76" height="13" rx="5" fill="#E2E8F0"/><line x1="10" y1="23" x2="86" y2="23" stroke="#0F2419" stroke-width="0.9"/><rect x="16" y="13.5" width="12" height="6" rx="1.2" fill="#FEF08A" stroke="#CA8A04" stroke-width="0.6"/><rect x="64" y="14" width="11" height="5" rx="1" fill="#38BDF8" stroke="#0284C7" stroke-width="0.6"/><circle cx="48" cy="38" r="15.5" fill="#CBD5E1" stroke="#1B3B2B" stroke-width="1.5"/><circle cx="48" cy="38" r="11.5" fill="#18181B" stroke="#94A3B8" stroke-width="1"/><circle cx="48" cy="38" r="7.5" fill="#064E3B"/><path d="M43 34 A 5.5 5.5 0 0 1 53 35" stroke="#6EE7B7" stroke-width="1.1" stroke-linecap="round" opacity="0.9"/></svg>`,

  // 07. Pearl 08 (Warm Pearl-Champagne Metallic Slim Digital/Film Compact)
  'contax-t2': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg contax-svg pearl-08-svg"><defs><linearGradient id="ct_titanium" x1="0" y1="0" x2="96" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFFDF5"/><stop offset="30%" stop-color="#F3E7CE"/><stop offset="70%" stop-color="#DEC89E"/><stop offset="100%" stop-color="#B59866"/></linearGradient><radialGradient id="ct_glass" cx="42%" cy="38%" r="58%"><stop offset="0%" stop-color="#34D399"/><stop offset="40%" stop-color="#059669"/><stop offset="100%" stop-color="#022C22"/></radialGradient></defs><rect x="62" y="6" width="14" height="4" rx="1.2" fill="#DEC89E" stroke="#927238" stroke-width="0.8"/><rect x="18" y="7" width="10" height="3" rx="1" fill="#B59866"/><rect x="8" y="9" width="80" height="48" rx="7" fill="url(#ct_titanium)" stroke="#9A7B46" stroke-width="1.2"/><line x1="8" y1="21" x2="88" y2="21" stroke="#B59866" stroke-width="0.6"/><text x="16" y="36" fill="#DC2626" font-size="8" font-weight="900" font-family="'Arial Black', sans-serif">T*</text><rect x="64" y="13" width="14" height="6" rx="1.5" fill="#FEF08A" stroke="#CA8A04" stroke-width="0.6"/><rect x="50" y="13.5" width="8" height="5" rx="1" fill="#60A5FA" stroke="#2563EB" stroke-width="0.6"/><circle cx="52" cy="38" r="16.5" fill="#EFE2C6" stroke="#9A7B46" stroke-width="1.5"/><circle cx="52" cy="38" r="12.5" fill="#18181B" stroke="#DEC89E" stroke-width="1"/><circle cx="52" cy="38" r="8.5" fill="url(#ct_glass)"/><path d="M47 33 A 6 6 0 0 1 57 34" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.9"/></svg>`,

  // 08. Sunny Saver (Yellow & Red/Brown Wavy Disposable Camera matching user screenshot!)
  'fuji-quicksnap': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg quicksnap-svg sunny-saver-svg"><defs><linearGradient id="ss_yellow" x1="0" y1="10" x2="96" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FDE047"/><stop offset="50%" stop-color="#FACC15"/><stop offset="100%" stop-color="#EAB308"/></linearGradient></defs><rect x="66" y="6" width="12" height="4" rx="1" fill="#EF4444"/><rect x="8" y="10" width="80" height="46" rx="6" fill="#432818" stroke="#29170E" stroke-width="1.2"/><path d="M16 10 H80 C84 10 86 14 86 20 V46 C74 44 68 32 52 32 C36 32 28 48 10 46 V20 C10 14 12 10 16 10 Z" fill="url(#ss_yellow)"/><path d="M10 42 C26 44 36 28 54 30 C70 32 76 46 86 44 V50 C86 53 83 56 80 56 H16 C13 56 10 53 10 50 Z" fill="#DC2626"/><rect x="64" y="14" width="13" height="8" rx="1.5" fill="#FEF08A" stroke="#CA8A04" stroke-width="0.8"/><rect x="20" y="15" width="9" height="6" rx="1" fill="#1E293B"/><circle cx="48" cy="36" r="14" fill="#29170E" stroke="#FACC15" stroke-width="1.8"/><circle cx="48" cy="36" r="10" fill="#0F172A" stroke="#78350F" stroke-width="1"/><circle cx="48" cy="36" r="5.5" fill="#1E293B"/><path d="M44 32 A 4.5 4.5 0 0 1 52 33" stroke="#FFFFFF" stroke-width="1.1" stroke-linecap="round" opacity="0.9"/></svg>`,

  // 09. Lazy Monkey (Silver Flip-Screen MiniDV Camcorder)
  'sony-handycam': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg handycam-svg lazy-monkey-svg"><defs><linearGradient id="hc_silver" x1="0" y1="0" x2="96" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#F8FAFC"/><stop offset="50%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs><rect x="6" y="20" width="32" height="24" rx="2.5" fill="#334155" stroke="#94A3B8" stroke-width="1.2"/><rect x="9" y="23" width="26" height="18" rx="1.5" fill="#0284C7"/><text x="22" y="34" fill="#FFFFFF" font-size="4.2" font-weight="900" font-family="monospace" text-anchor="middle">● REC</text><rect x="38" y="28" width="6" height="8" fill="#64748B"/><rect x="44" y="10" width="44" height="44" rx="6" fill="url(#hc_silver)" stroke="#475569" stroke-width="1.2"/><circle cx="66" cy="28" r="13" fill="#1E293B" stroke="#E2E8F0" stroke-width="1.8"/><circle cx="66" cy="28" r="8.5" fill="#0F172A" stroke="#38BDF8" stroke-width="1"/><circle cx="66" cy="28" r="4.5" fill="#0284C7"/><path d="M62 24 A 4 4 0 0 1 70 25" stroke="#FFFFFF" stroke-width="1" opacity="0.9"/><rect x="52" y="45" width="28" height="4" rx="1.5" fill="#334155"/></svg>`,

  // 10. Night Tape 98 (Matte Black Hi8/VHS Camcorder with Flip-Out Screen - NewJeans Ditto Aesthetic)
  'sony-cybershot': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg cybershot-svg night-tape-svg"><defs><linearGradient id="nt_black" x1="40" y1="8" x2="90" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#3F3F46"/><stop offset="50%" stop-color="#27272A"/><stop offset="100%" stop-color="#18181B"/></linearGradient></defs><rect x="6" y="20" width="32" height="24" rx="2.5" fill="#18181B" stroke="#52525B" stroke-width="1.2"/><rect x="9" y="23" width="26" height="18" rx="1.5" fill="#0F172A"/><text x="22" y="34" fill="#38BDF8" font-size="4.2" font-weight="900" font-family="monospace" text-anchor="middle">DITTO 98</text><rect x="38" y="28" width="6" height="8" fill="#27272A"/><rect x="44" y="10" width="44" height="44" rx="6" fill="url(#nt_black)" stroke="#52525B" stroke-width="1.2"/><circle cx="66" cy="28" r="13" fill="#09090B" stroke="#71717A" stroke-width="1.8"/><circle cx="66" cy="28" r="8.5" fill="#1E293B" stroke="#38BDF8" stroke-width="1"/><circle cx="66" cy="28" r="4.5" fill="#0F172A"/><path d="M62 24 A 4 4 0 0 1 70 25" stroke="#38BDF8" stroke-width="1.1" opacity="0.9"/><circle cx="52" cy="16" r="2.2" fill="#EF4444"/><rect x="52" y="45" width="28" height="4" rx="1.5" fill="#09090B"/></svg>`,

  // 11. Pocari Blue (Classic Black & Silver 35mm Film Camera - Tokyo Bubble & Summer Sky)
  'citypop-80s': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg citypop-svg pocari-blue-svg"><defs><linearGradient id="pb_chrome" x1="0" y1="8" x2="96" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#F8FAFC"/><stop offset="50%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient></defs><polygon points="34,11 40,5 56,5 62,11" fill="url(#pb_chrome)" stroke="#64748B" stroke-width="0.8"/><rect x="66" y="6" width="12" height="5" rx="1" fill="#CBD5E1"/><rect x="18" y="7" width="10" height="4" rx="1" fill="#94A3B8"/><rect x="10" y="11" width="76" height="45" rx="5.5" fill="#18181B" stroke="#475569" stroke-width="1.2"/><rect x="10" y="11" width="76" height="12" rx="4.5" fill="url(#pb_chrome)"/><line x1="10" y1="23" x2="86" y2="23" stroke="#64748B" stroke-width="0.8"/><circle cx="48" cy="37" r="16" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/><circle cx="48" cy="37" r="12" fill="#0F172A" stroke="#38BDF8" stroke-width="1.2"/><circle cx="48" cy="37" r="7.5" fill="#0284C7"/><path d="M43 33 A 5.5 5.5 0 0 1 53 34" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.9"/></svg>`,

  // 12. Wedding '95 (Champagne-Silver 90s Film Compact Camera)
  'oldfilm-35mm': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg oldfilm-svg wedding-95-svg"><defs><linearGradient id="w95_body" x1="0" y1="10" x2="96" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#F5EFE6"/><stop offset="50%" stop-color="#E2D6C1"/><stop offset="100%" stop-color="#C2B299"/></linearGradient></defs><rect x="64" y="6" width="12" height="4" rx="1.2" fill="#C2B299"/><rect x="10" y="10" width="76" height="46" rx="7" fill="url(#w95_body)" stroke="#9C8B70" stroke-width="1.2"/><rect x="16" y="15" width="13" height="6.5" rx="1.5" fill="#FEF08A" stroke="#CA8A04" stroke-width="0.6"/><rect x="44" y="15" width="8" height="5" rx="1" fill="#38BDF8" stroke="#0284C7" stroke-width="0.6"/><circle cx="48" cy="37" r="15.5" fill="#D5C7B2" stroke="#9C8B70" stroke-width="1.5"/><circle cx="48" cy="37" r="11.5" fill="#1C1917" stroke="#E2D6C1" stroke-width="1"/><circle cx="48" cy="37" r="7.5" fill="#44403C"/><path d="M43 33 A 5.5 5.5 0 0 1 53 34" stroke="#FDE047" stroke-width="1.1" stroke-linecap="round" opacity="0.85"/></svg>`,

  // 13. Ohio Summer (Slate-Blue & Silver Vintage Rangefinder Camera)
  'polaroid-sx70': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg sx70-svg ohio-summer-svg"><defs><linearGradient id="os_blue" x1="0" y1="20" x2="0" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#64748B"/><stop offset="100%" stop-color="#334155"/></linearGradient></defs><rect x="62" y="6" width="13" height="4" rx="1" fill="#CBD5E1"/><rect x="18" y="7" width="9" height="3" rx="1" fill="#94A3B8"/><rect x="10" y="10" width="76" height="46" rx="6" fill="url(#os_blue)" stroke="#1E293B" stroke-width="1.2"/><rect x="10" y="10" width="76" height="13" rx="5" fill="#E2E8F0"/><line x1="10" y1="23" x2="86" y2="23" stroke="#1E293B" stroke-width="0.8"/><rect x="16" y="13.5" width="12" height="6" rx="1.2" fill="#FEF08A" stroke="#CA8A04" stroke-width="0.6"/><rect x="64" y="14" width="10" height="5" rx="1" fill="#38BDF8" stroke="#0284C7" stroke-width="0.6"/><circle cx="48" cy="38" r="15.5" fill="#E2E8F0" stroke="#334155" stroke-width="1.5"/><circle cx="48" cy="38" r="11.5" fill="#0F172A" stroke="#94A3B8" stroke-width="1"/><circle cx="48" cy="38" r="7.5" fill="#1E3A8A"/><path d="M43 34 A 5.5 5.5 0 0 1 53 35" stroke="#93C5FD" stroke-width="1.1" stroke-linecap="round" opacity="0.9"/></svg>`,

  // 14. Day Classic (Classic Leica M Black & Chrome Rangefinder)
  'leica-m': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg leica-svg day-classic-svg"><defs><linearGradient id="lm_top" x1="0" y1="0" x2="0" y2="18" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="40%" stop-color="#E2E8F0"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient><linearGradient id="lm_body" x1="0" y1="18" x2="0" y2="60" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#1E232D"/><stop offset="100%" stop-color="#0E1116"/></linearGradient><radialGradient id="lm_lens_glass" cx="45%" cy="40%" r="55%"><stop offset="0%" stop-color="#A78BFA"/><stop offset="30%" stop-color="#6366F1"/><stop offset="70%" stop-color="#1E1B4B"/><stop offset="100%" stop-color="#090A0F"/></radialGradient><linearGradient id="lm_chrome" x1="0" y1="0" x2="96" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#CBD5E1"/><stop offset="50%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient></defs><rect x="14" y="6" width="10" height="4" rx="1" fill="url(#lm_chrome)"/><rect x="62" y="5" width="16" height="5" rx="1.5" fill="url(#lm_chrome)"/><circle cx="70" cy="4" r="3" fill="#DC2626"/><rect x="8" y="9" width="80" height="49" rx="6" fill="url(#lm_body)" stroke="#334155" stroke-width="1"/><rect x="8" y="9" width="80" height="15" rx="5" fill="url(#lm_top)"/><line x1="8" y1="24" x2="88" y2="24" stroke="#64748B" stroke-width="0.8"/><rect x="66" y="13" width="13" height="7" rx="1.5" fill="#38BDF8" stroke="#0284C7" stroke-width="0.8"/><rect x="46" y="14" width="7" height="5" rx="1" fill="#FEF08A" stroke="#CA8A04" stroke-width="0.6" opacity="0.9"/><circle cx="25" cy="33" r="6" fill="#DC2626"/><text x="25" y="35" fill="#FFFFFF" font-size="4.2" font-weight="900" font-family="'Times New Roman', serif" text-anchor="middle">Leica</text><circle cx="48" cy="38" r="17" fill="#1E293B" stroke="url(#lm_chrome)" stroke-width="2"/><circle cx="48" cy="38" r="13" fill="#0F172A" stroke="#475569" stroke-width="1"/><circle cx="48" cy="38" r="9.5" fill="url(#lm_lens_glass)"/><path d="M42 33 A 7 7 0 0 1 54 34" stroke="#FFFFFF" stroke-width="1.3" stroke-linecap="round" opacity="0.85"/></svg>`,

  // 15. Dark Akan 77 (Dark Walnut-Brown & Black 1977 Vintage Film Camera)
  'hasselblad-500cm': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg hasselblad-svg dark-akan-svg"><defs><linearGradient id="da_walnut" x1="0" y1="20" x2="96" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#5C3A21"/><stop offset="50%" stop-color="#3E2723"/><stop offset="100%" stop-color="#271612"/></linearGradient></defs><rect x="62" y="6" width="13" height="4" rx="1" fill="#78716C"/><rect x="18" y="7" width="9" height="3" rx="1" fill="#57534E"/><rect x="10" y="10" width="76" height="46" rx="6" fill="url(#da_walnut)" stroke="#1C1917" stroke-width="1.4"/><rect x="10" y="10" width="76" height="13" rx="5" fill="#292524"/><line x1="10" y1="23" x2="86" y2="23" stroke="#78350F" stroke-width="0.9"/><rect x="16" y="13.5" width="12" height="6" rx="1.2" fill="#FEF08A" stroke="#CA8A04" stroke-width="0.6"/><rect x="64" y="14" width="11" height="5" rx="1" fill="#F59E0B" stroke="#B45309" stroke-width="0.6"/><circle cx="48" cy="38" r="15.5" fill="#1C1917" stroke="#A16207" stroke-width="1.5"/><circle cx="48" cy="38" r="11.5" fill="#09090B" stroke="#57534E" stroke-width="1"/><circle cx="48" cy="38" r="7.5" fill="#271612"/><path d="M43 34 A 5.5 5.5 0 0 1 53 35" stroke="#FBBF24" stroke-width="1.1" stroke-linecap="round" opacity="0.85"/></svg>`,

  // 16. Passport ID (Official Studio Portrait Camera)
  'passport-id': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg passport-svg"><rect x="22" y="6" width="52" height="52" rx="5" fill="#1E3A8A" stroke="#3B82F6" stroke-width="1.2"/><circle cx="48" cy="22" r="9" stroke="#FACC15" stroke-width="1.2" fill="none"/><circle cx="48" cy="22" r="5" stroke="#FACC15" stroke-width="0.8" fill="none"/><rect x="42" y="34" width="12" height="8" rx="1.5" stroke="#FACC15" stroke-width="1" fill="none"/><line x1="42" y1="38" x2="54" y2="38" stroke="#FACC15" stroke-width="0.8"/><circle cx="48" cy="38" r="2" fill="#FACC15"/><text x="48" y="52" fill="#93C5FD" font-size="4" font-weight="900" font-family="sans-serif" text-anchor="middle" letter-spacing="1">PASSPORT</text></svg>`,

  'default': `<svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="cam-svg default-svg"><rect x="8" y="10" width="80" height="46" rx="6" fill="#18181B" stroke="#475569" stroke-width="1.2"/><circle cx="48" cy="33" r="16" fill="#0F172A" stroke="#94A3B8" stroke-width="1.5"/><circle cx="48" cy="33" r="10" fill="#0284C7"/></svg>`
};

// 16 Iconic Cameras Architecture Definition
const CAMERAS = {
  'canon-ixy': {
    id: 'canon-ixy',
    name: 'Canon IXY Digital 50',
    shortName: 'CANON IXY',
    sub: '2004 CCD Retro Compact',
    icon: '📸',
    badge: 'Y2K DIGICAM',
    osdId: 'canon-ixy-osd',
    drawerId: 'drawer-canon-ixy',
    filters: {
      'ixy-peach': {
        name: 'Peach Glow',
        desc: '뽀샤시 복숭아빛 피부',
        css: 'brightness(1.08) contrast(1.15) saturate(1.24) sepia(0.08) hue-rotate(-3deg)',
        tintRgba: null
      },
      'ixy-flash': {
        name: 'Flash Pop',
        desc: '디카 직광 플래시',
        css: 'brightness(1.15) contrast(1.24) saturate(1.26) sepia(0.04)',
        tintRgba: null
      },
      'ixy-pastel': {
        name: 'Pastel Haze',
        desc: '들뜬 파스텔 섀도우',
        css: 'brightness(1.12) contrast(1.06) saturate(1.15) sepia(0.12) hue-rotate(-6deg)',
        tintRgba: null
      },
      'ixy-night': {
        name: 'Clear Sunlight',
        desc: '창가 자연광 투명 얼짱 톤',
        css: 'brightness(1.10) contrast(1.18) saturate(1.28) sepia(0.04)',
        tintRgba: null
      },
      'ixy-cool': {
        name: 'Y2K Silver CCD',
        desc: '실버 디카 특유의 쿨톤 투명감',
        css: 'brightness(1.08) contrast(1.18) saturate(1.12) hue-rotate(6deg)',
        tintRgba: null
      },
      'ixy-sunset': {
        name: 'Sunset Cafe',
        desc: '골든아워 창가 노을빛 웜 글로우',
        css: 'brightness(1.06) contrast(1.22) saturate(1.35) sepia(0.18) hue-rotate(-8deg)',
        tintRgba: null
      }
    }
  },

  'sony-handycam': {
    id: 'sony-handycam',
    name: 'Sony DCR Handycam',
    shortName: 'HANDYCAM',
    sub: '1999 MiniDV 3CCD Camcorder',
    icon: '📹',
    badge: 'MINI-DV',
    osdId: 'sony-handycam-osd',
    drawerId: 'drawer-sony-handycam',
    filters: {
      'handy-minidv': {
        name: 'Ditto School Cam',
        desc: '98년 겨울 방과 후 교실·운동장 캠코더 감성',
        css: 'brightness(1.06) contrast(1.15) saturate(1.18) sepia(0.14) hue-rotate(-5deg)',
        tintRgba: null
      },
      'handy-vhs': {
        name: 'Hi8 Tape Glitch',
        desc: '스캔라인 테이프 글리치',
        css: 'brightness(1.05) contrast(1.18) saturate(1.14) sepia(0.10)',
        tintRgba: null
      },
      'handy-super8': {
        name: 'Super 8mm Cine',
        desc: '골든 앰버 홈무비',
        css: 'brightness(1.07) contrast(1.24) saturate(1.30) sepia(0.22) hue-rotate(-8deg)',
        tintRgba: null
      },
      'handy-nightshot': {
        name: 'Retro Sunshine 90s',
        desc: '90s 여름 바캉스 햇살 캠코더',
        css: 'brightness(1.12) contrast(1.18) saturate(1.28) sepia(0.08)',
        tintRgba: null
      },
      'handy-matrix': {
        name: 'NightShot IR',
        desc: '00년대 캠코더 나이트샷 적외선',
        css: 'brightness(1.10) contrast(1.25) saturate(1.20) hue-rotate(85deg)',
        tintRgba: null
      },
      'handy-golden': {
        name: 'Golden Hour Tape',
        desc: '황금빛 오후 따스한 테이프 톤',
        css: 'brightness(1.06) contrast(1.16) saturate(1.28) sepia(0.18)',
        tintRgba: null
      }
    }
  },

  'sony-cybershot': {
    id: 'sony-cybershot',
    name: 'Sony Cyber-shot DSC-P10',
    shortName: 'NIGHT TAPE 98',
    sub: '2003 Cyber-shot 5.1MP CCD',
    icon: '💿',
    badge: 'DITTO 98 VHS',
    osdId: 'sony-cybershot-osd',
    drawerId: 'drawer-sony-cybershot',
    filters: {
      'cyber-cool': {
        name: "Ditto '98 Winter",
        desc: '뉴진스 Ditto 감성의 1998 겨울 청회색 섀도우 & 소프트 블룸',
        css: 'brightness(1.06) contrast(1.18) saturate(1.15) hue-rotate(185deg) sepia(0.08)',
        tintRgba: null
      },
      'cyber-magenta': {
        name: 'Bunnies VHS Tape',
        desc: '아련한 첫사랑의 기억, 뽀얀 하이라이트 할레이션',
        css: 'brightness(1.08) contrast(1.14) saturate(1.18) sepia(0.12) hue-rotate(-4deg)',
        tintRgba: null
      },
      'cyber-flash': {
        name: 'Flash Sharp',
        desc: '선명하고 쨍한 플래시',
        css: 'brightness(1.15) contrast(1.28) saturate(1.24)',
        tintRgba: null
      },
      'cyber-matrix': {
        name: 'Y2K Pastel Glow',
        desc: '부드러운 라벤더-핑크 파스텔',
        css: 'brightness(1.10) contrast(1.12) saturate(1.22) hue-rotate(15deg)',
        tintRgba: null
      },
      'cyber-y2k-pink': {
        name: 'Cyber Pink CCD',
        desc: '밀레니엄 핑크 메탈릭 CCD 감성',
        css: 'brightness(1.08) contrast(1.20) saturate(1.32) hue-rotate(330deg)',
        tintRgba: null
      },
      'cyber-silver': {
        name: 'Titanium CCD',
        desc: '선명하고 차가운 사이버 실버',
        css: 'brightness(1.06) contrast(1.22) saturate(1.12) hue-rotate(190deg)',
        tintRgba: null
      }
    }
  },

  'instax-mini': {
    id: 'instax-mini',
    name: 'Fuji Instax & Polaroid',
    shortName: 'INSTAX',
    sub: 'Fujifilm Instant Color 800',
    icon: '🖼️',
    badge: 'INSTANT FILM',
    osdId: 'instax-frame',
    drawerId: 'drawer-instax-mini',
    filters: {
      'instax-card': {
        name: 'Instax Color 800',
        desc: '후지 화학 유제 특유의 청회색 섀도우 & 소프트 스킨',
        css: 'brightness(1.08) contrast(1.24) saturate(1.32) sepia(0.06)',
        tintRgba: null
      },
      'polaroid-square': {
        name: 'Polaroid 600',
        desc: '따스한 골든 앰버 톤과 빈티지 스퀘어 발색',
        css: 'brightness(1.07) contrast(1.18) saturate(1.22) sepia(0.16) hue-rotate(-6deg)',
        tintRgba: null
      },
      'instant-bw': {
        name: 'Silver Mono Pro',
        desc: '깊은 흑은염 입자와 벨벳 블랙 계조',
        css: 'grayscale(1) contrast(1.38) brightness(1.02)',
        tintRgba: null
      },
      'instant-rainbow': {
        name: 'Vivid Chrome',
        desc: '채도 높은 팝 컬러와 선명한 직광 플래시',
        css: 'brightness(1.12) contrast(1.28) saturate(1.38)',
        tintRgba: null
      },
      'instax-warm': {
        name: 'Warm Gold Emulsion',
        desc: '석양빛 앰버 유제와 포근한 감성 톤',
        css: 'brightness(1.06) contrast(1.18) saturate(1.26) sepia(0.20) hue-rotate(-8deg)',
        tintRgba: null
      },
      'instax-cool': {
        name: 'Cyan Blue Hour',
        desc: '새벽녘 청량한 시안 블루 즉석 인화지',
        css: 'brightness(1.06) contrast(1.20) saturate(1.20) hue-rotate(185deg)',
        tintRgba: null
      }
    }
  },

  'olympus-mju': {
    id: 'olympus-mju',
    name: 'Olympus μ [mju:] II',
    shortName: 'OLYMPUS μ2',
    sub: 'Stylus Epic 35mm F/2.8',
    icon: '📷',
    badge: '35mm f/2.8 FILM',
    osdId: 'olympus-osd',
    drawerId: 'drawer-olympus-mju',
    filters: {
      'mju-standard': {
        name: 'μ Standard',
        desc: '자연스러운 스트리트 필름',
        css: 'brightness(1.06) contrast(1.22) saturate(1.25) sepia(0.04)',
        tintRgba: null
      },
      'mju-night': {
        name: 'Daylight Street Flash',
        desc: '긴자 스트리트 한낮의 직광 플래시',
        css: 'brightness(1.14) contrast(1.26) saturate(1.26) sepia(0.02)',
        tintRgba: null
      },
      'mju-chrome': {
        name: 'μ Chrome Slide',
        desc: '선명한 슬라이드 발색',
        css: 'brightness(1.05) contrast(1.24) saturate(1.30)',
        tintRgba: null
      },
      'mju-gold': {
        name: 'μ Gold 200',
        desc: '황금빛 웜톤 네거티브',
        css: 'brightness(1.06) contrast(1.16) saturate(1.24) sepia(0.14) hue-rotate(-5deg)',
        tintRgba: null
      },
      'mju-velvia': {
        name: 'μ Slide Vivid',
        desc: '비비드 슬라이드 짙은 발색',
        css: 'brightness(1.05) contrast(1.26) saturate(1.36)',
        tintRgba: null
      },
      'mju-mono': {
        name: 'μ Noir Contrast',
        desc: '강렬한 거리 스냅 흑백 톤',
        css: 'grayscale(1) contrast(1.42) brightness(0.98)',
        tintRgba: null
      }
    }
  },

  'contax-t2': {
    id: 'contax-t2',
    name: 'Contax T2',
    shortName: 'CONTAX T2',
    sub: 'Carl Zeiss Sonnar 38mm T*',
    icon: '📸',
    badge: 'Carl Zeiss T*',
    osdId: 'contax-osd',
    drawerId: 'drawer-contax-t2',
    filters: {
      'zeiss-warm': {
        name: 'Zeiss Warm T*',
        desc: '칼자이스 묵직한 웜톤',
        css: 'brightness(1.05) contrast(1.22) saturate(1.20) sepia(0.10) hue-rotate(-4deg)',
        tintRgba: null
      },
      'zeiss-shadow': {
        name: 'T* Rich Shadow',
        desc: '풍부한 암부와 섬세한 하이라이트',
        css: 'brightness(1.04) contrast(1.26) saturate(1.18) sepia(0.06)',
        tintRgba: null
      },
      'titanium-classic': {
        name: 'Titanium Classic',
        desc: '티타늄 바디 클래식 룩',
        css: 'brightness(1.06) contrast(1.18) saturate(1.15) sepia(0.08)',
        tintRgba: null
      },
      'zeiss-mono': {
        name: 'Zeiss T* B&W',
        desc: '독일 광학 깊은 흑백 계조',
        css: 'grayscale(1) contrast(1.42) brightness(0.98)',
        tintRgba: null
      },
      'zeiss-champagne': {
        name: 'T2 Champagne Gold',
        desc: '샴페인 골드 럭셔리 티타늄 룩',
        css: 'brightness(1.06) contrast(1.20) saturate(1.25) sepia(0.16) hue-rotate(-6deg)',
        tintRgba: null
      },
      'zeiss-emerald': {
        name: 'Sonnar Emerald',
        desc: '조나 38mm 투명한 청록 섀도우',
        css: 'brightness(1.04) contrast(1.20) saturate(1.22) hue-rotate(-8deg)',
        tintRgba: null
      }
    }
  },

  'ricoh-gr': {
    id: 'ricoh-gr',
    name: 'Ricoh GR Digital',
    shortName: 'RICOH GRD',
    sub: '28mm F/2.8 Street Snap',
    icon: '🎞️',
    badge: 'SNAP SHOOTER',
    osdId: 'ricoh-osd',
    drawerId: 'drawer-ricoh-gr',
    filters: {
      'gr-bw-high': {
        name: 'High-Contrast B&W',
        desc: '모리야마 풍 강렬한 흑백',
        css: 'grayscale(1) contrast(1.60) brightness(0.94)',
        tintRgba: null
      },
      'gr-positive': {
        name: 'Positive Film',
        desc: '특유의 포지티브 필름 발색',
        css: 'brightness(1.05) contrast(1.24) saturate(1.28) sepia(0.04)',
        tintRgba: null
      },
      'gr-street': {
        name: 'Street Snap',
        desc: '신속하고 날카로운 스냅 룩',
        css: 'brightness(1.05) contrast(1.22) saturate(1.18)',
        tintRgba: null
      },
      'gr-cross': {
        name: 'Cross Process',
        desc: '그런지한 교차 현상 발색',
        css: 'brightness(1.06) contrast(1.28) saturate(1.35) hue-rotate(15deg)',
        tintRgba: null
      },
      'gr-bleach': {
        name: 'Bleach Bypass',
        desc: '거친 은염 탈색의 묵직한 질감',
        css: 'brightness(1.02) contrast(1.35) saturate(0.80)',
        tintRgba: null
      },
      'gr-amber': {
        name: 'Amber Street 28',
        desc: '골목길 가로등 앰버 스냅',
        css: 'brightness(1.06) contrast(1.20) saturate(1.28) sepia(0.18)',
        tintRgba: null
      }
    }
  },

  'leica-m': {
    id: 'leica-m',
    name: 'Leica M System',
    shortName: 'LEICA M',
    sub: 'Summilux-M 35mm Rangefinder',
    icon: '🔴',
    badge: 'RANGEFINDER M',
    osdId: 'leica-m-osd',
    drawerId: 'drawer-leica-m',
    filters: {
      'leica-summilux': {
        name: 'Summilux 50',
        desc: '따뜻한 벨벳 톤 & 부드러운 보케',
        css: 'grayscale(1) contrast(1.30) brightness(1.04)',
        tintRgba: null
      },
      'leica-mono': {
        name: 'M Monochrom',
        desc: '깊고 섬세한 흑백 계조',
        css: 'grayscale(1) contrast(1.38) brightness(0.98)',
        tintRgba: null
      },
      'leica-classic': {
        name: 'Classic M 35',
        desc: '투명하고 날카로운 선예도',
        css: 'grayscale(1) contrast(1.24) brightness(1.00)',
        tintRgba: null
      },
      'leica-red': {
        name: 'Red Dot Color',
        desc: '라이카 특유의 깊은 원색 렌더링',
        css: 'brightness(1.06) contrast(1.22) saturate(1.28) sepia(0.04)',
        tintRgba: null
      },
      'leica-noctilux': {
        name: 'Noctilux f/0.95 Dream',
        desc: '녹티룩스 극한 개방감 & 보케 글로우',
        css: 'grayscale(1) contrast(1.22) brightness(1.08)',
        tintRgba: null
      },
      'leica-amber': {
        name: 'Barnack Amber',
        desc: '오스카 바르낙 클래식 황동 앰버',
        css: 'grayscale(1) contrast(1.25) brightness(1.00) sepia(0.22)',
        tintRgba: null
      }
    }
  },

  'citypop-80s': {
    id: 'citypop-80s',
    name: 'City Pop 80s',
    shortName: 'CITY POP 80s',
    sub: '1986 Bubble Economy Retro',
    icon: '📼',
    badge: '1986 BUBBLE SOUND',
    osdId: 'citypop-osd',
    drawerId: 'drawer-citypop-80s',
    filters: {
      'city-sunset': {
        name: 'Shonan Sunset 1986',
        desc: '나가이 히로시 감성의 쇼난 코스트 샴페인 선셋과 청명한 하늘',
        css: 'brightness(1.08) contrast(1.20) saturate(1.38) sepia(0.16) hue-rotate(-8deg)',
        tintRgba: null
      },
      'city-tokyo': {
        name: 'Showa Idol Glow',
        desc: '80s 쇼와 아이돌 앨범 자켓의 투명하고 화사한 도자기 복숭아빛 피부',
        css: 'brightness(1.10) contrast(1.14) saturate(1.26) sepia(0.08) hue-rotate(-4deg)',
        tintRgba: null
      },
      'city-pastel': {
        name: 'Pacific Breeze',
        desc: '타츠로 야마시타 감성의 눈부신 한낮 코발트 블루와 청량한 해변 바람',
        css: 'brightness(1.08) contrast(1.16) saturate(1.32) hue-rotate(185deg)',
        tintRgba: null
      },
      'city-plastic': {
        name: 'Plastic Love \'88',
        desc: '타케우치 마리야 감성의 감미롭고 온화한 80s 아날로그 카세트 질감',
        css: 'brightness(1.06) contrast(1.18) saturate(1.22) sepia(0.12)',
        tintRgba: null
      },
      'city-resort': {
        name: 'Karuizawa \'87',
        desc: '가루이자와 버블 피서지 별장 맑고 투명한 테라스 햇살 & 민트 그린',
        css: 'brightness(1.07) contrast(1.16) saturate(1.26) hue-rotate(-10deg)',
        tintRgba: null
      },
      'city-midnight': {
        name: 'Roppongi Drive',
        desc: '심야 롯폰기 하이웨이 시티라이트 네온 마젠타 & 코발트 앰비언트',
        css: 'brightness(1.06) contrast(1.26) saturate(1.42) hue-rotate(10deg)',
        tintRgba: null
      }
    }
  },

  'oldfilm-35mm': {
    id: 'oldfilm-35mm',
    name: 'Old Film 35mm',
    shortName: 'OLD FILM 35',
    sub: 'Kodak Portra & CineStill 35mm',
    icon: '🎞️',
    badge: 'ANALOG CINE 35',
    osdId: 'oldfilm-osd',
    drawerId: 'drawer-oldfilm-35mm',
    filters: {
      'film-cinestill': {
        name: 'CineStill 800T',
        desc: '광원 붉은 할레이션 번짐',
        css: 'brightness(1.06) contrast(1.18) saturate(1.22) sepia(0.10) hue-rotate(-6deg)',
        tintRgba: null
      },
      'film-portra': {
        name: 'Portra 400',
        desc: '따뜻한 골든 옐로우 피부톤',
        css: 'brightness(1.08) contrast(1.14) saturate(1.20) sepia(0.14) hue-rotate(-4deg)',
        tintRgba: null
      },
      'film-ektar': {
        name: 'Ektar 100',
        desc: '선명하고 강렬한 원색 콘트라스트',
        css: 'brightness(1.06) contrast(1.26) saturate(1.36)',
        tintRgba: null
      },
      'film-superia': {
        name: 'Superia 400',
        desc: '특유의 에메랄드 그린 섀도우',
        css: 'brightness(1.05) contrast(1.18) saturate(1.28) hue-rotate(-10deg)',
        tintRgba: null
      },
      'film-kodachrome': {
        name: 'Kodachrome 64',
        desc: '전설의 코다크롬 64 슬라이드 불멸의 원색',
        css: 'brightness(1.06) contrast(1.24) saturate(1.32) sepia(0.08)',
        tintRgba: null
      },
      'film-velvia': {
        name: 'Velvia 50 Vivid',
        desc: '초고채도 풍경/인물 슬라이드 압도적 발색',
        css: 'brightness(1.02) contrast(1.22) saturate(1.28)',
        tintRgba: null
      }
    }
  },

  'hasselblad-500cm': {
    id: 'hasselblad-500cm',
    name: 'Hasselblad 500C/M',
    shortName: 'HASSELBLAD',
    sub: 'Carl Zeiss Planar 80mm MF',
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
        css: 'brightness(1.06) contrast(1.18) saturate(1.20) sepia(0.06)',
        tintRgba: null
      },
      'hassel-trix': {
        name: 'Tri-X 400 MF',
        desc: '중형 롤필름 깊은 은염 흑백',
        css: 'grayscale(1) contrast(1.36) brightness(1.00)',
        tintRgba: null
      },
      'hassel-astia': {
        name: 'Astia 100F Slide',
        desc: '투명하고 부드러운 스킨톤',
        css: 'brightness(1.08) contrast(1.12) saturate(1.18) sepia(0.05)',
        tintRgba: null
      },
      'hassel-chromium': {
        name: 'Chromium Silver',
        desc: '북유럽 쿨톤 메탈릭 질감',
        css: 'brightness(1.06) contrast(1.20) saturate(1.10) hue-rotate(185deg)',
        tintRgba: null
      },
      'hassel-gold': {
        name: 'Portra 160 MF Gold',
        desc: '중형 롤필름 따뜻한 포트레이트 골드',
        css: 'brightness(1.06) contrast(1.16) saturate(1.24) sepia(0.12)',
        tintRgba: null
      },
      'hassel-mono': {
        name: 'Acros 100 Precision',
        desc: '초미립자 정밀 흑백 해상력',
        css: 'grayscale(1) contrast(1.42) brightness(0.98)',
        tintRgba: null
      }
    }
  },

  'polaroid-sx70': {
    id: 'polaroid-sx70',
    name: 'Polaroid SX-70',
    shortName: 'POLAROID SX-70',
    sub: '1972 Time-Zero Land Camera',
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
        css: 'brightness(1.08) contrast(1.10) saturate(1.14) sepia(0.18) hue-rotate(-6deg)',
        tintRgba: null
      },
      'sx70-color600': {
        name: 'Color Protection 600',
        desc: '사이언/마젠타 즉석사진 발색',
        css: 'brightness(1.06) contrast(1.18) saturate(1.26)',
        tintRgba: null
      },
      'sx70-expired': {
        name: 'Expired Film 1979',
        desc: '유통기한 지난 필름의 황록색 변색',
        css: 'brightness(1.05) contrast(1.12) saturate(1.10) sepia(0.14) hue-rotate(15deg)',
        tintRgba: null
      },
      'sx70-sepia': {
        name: 'Sepia Dream',
        desc: '클래식 브라운 세피아 모노크롬',
        css: 'sepia(0.65) contrast(1.22) brightness(1.02)',
        tintRgba: null
      },
      'sx70-cyan': {
        name: 'Cool Instant Cyan',
        desc: '청량하고 서늘한 즉석 사이언 틴트',
        css: 'brightness(1.05) contrast(1.16) saturate(1.18) hue-rotate(180deg)',
        tintRgba: null
      },
      'sx70-warm': {
        name: 'Golden Polaroid',
        desc: '풍부한 호박빛 골든 아워 즉석사진',
        css: 'brightness(1.07) contrast(1.16) saturate(1.28) sepia(0.24) hue-rotate(-8deg)',
        tintRgba: null
      }
    }
  },

  'fuji-quicksnap': {
    id: 'fuji-quicksnap',
    name: 'Fuji QuickSnap (写ルンです 1986)',
    shortName: 'QUICKSNAP 1986',
    sub: '1986 写ルンです 32mm Plastic',
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
        css: 'brightness(1.06) contrast(1.18) saturate(1.28) hue-rotate(-6deg)',
        tintRgba: null
      },
      'quicksnap-flash': {
        name: 'Sun Flash Pop',
        desc: '버블시대 거리와 카페에서 터뜨린 또렷하고 화사한 고광량 직광 플래시',
        css: 'brightness(1.15) contrast(1.26) saturate(1.30)',
        tintRgba: null
      },
      'quicksnap-nostalgia': {
        name: 'Bubble Resort \'87',
        desc: '80년대 버블 부유층의 여름 별장 휴양지 따사로운 햇살과 비비드 톤',
        css: 'brightness(1.08) contrast(1.16) saturate(1.26) sepia(0.08) hue-rotate(-4deg)',
        tintRgba: null
      },
      'quicksnap-neon': {
        name: 'Showa Memory \'86',
        desc: '선명한 오렌지 쿼츠데이트와 따스한 쇼와 61년 아날로그 인화지 감성',
        css: 'brightness(1.06) contrast(1.15) saturate(1.22) sepia(0.06)',
        tintRgba: null
      },
      'quicksnap-fujicolor': {
        name: 'Fujicolor Super HG',
        desc: '선명하고 쨍한 후지필름 원색 발색과 녹색 계조의 정점',
        css: 'brightness(1.05) contrast(1.20) saturate(1.40) hue-rotate(-12deg)',
        tintRgba: null
      },
      'quicksnap-party': {
        name: 'Party Flash 400',
        desc: '디스코텍과 파티장의 직광 플래시 & 샴페인 골드 글리터',
        css: 'brightness(1.14) contrast(1.25) saturate(1.28) sepia(0.06)',
        tintRgba: null
      }
    }
  },

  'kyocera-samurai': {
    id: 'kyocera-samurai',
    name: 'Kyocera Samurai X3.0 (1988)',
    shortName: 'SAMURAI 1988',
    sub: '1988 Half-Frame 72-Shot SLR',
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
        css: 'brightness(1.06) contrast(1.20) saturate(1.26) sepia(0.08) hue-rotate(-4deg)',
        tintRgba: null
      },
      'samurai-cyber': {
        name: 'Bubble High-Tech \'88',
        desc: '1988년 도쿄 하이테크 열풍의 미래지향 에메랄드 HUD와 맑은 선예도',
        css: 'brightness(1.08) contrast(1.24) saturate(1.34)',
        tintRgba: null
      },
      'samurai-tokyo': {
        name: 'Shinjuku Golden Hour',
        desc: '신주쿠 마천루에 반사되는 찬란한 황혼의 황금빛 햇살과 고급스러운 웜톤',
        css: 'brightness(1.06) contrast(1.20) saturate(1.30) sepia(0.15) hue-rotate(-6deg)',
        tintRgba: null
      },
      'samurai-titanium': {
        name: 'Ryuichi B&W 1988',
        desc: '80s 뉴웨이브 사카모토 류이치 감성의 지적이고 정제된 하이콘트라스트 흑백',
        css: 'grayscale(1) contrast(1.48) brightness(0.96)',
        tintRgba: null
      },
      'samurai-macro': {
        name: 'Yashica Macro Pop',
        desc: '야시카 매크로 렌즈의 극대화된 펀치감과 컬러 팝',
        css: 'brightness(1.06) contrast(1.24) saturate(1.32)',
        tintRgba: null
      },
      'samurai-night': {
        name: 'Tokyo Night Flight',
        desc: '나이트 플라이트 시티 나이트뷰 쿨톤 하이테크 네온',
        css: 'brightness(1.06) contrast(1.22) saturate(1.24) hue-rotate(185deg)',
        tintRgba: null
      }
    }
  },

  'sihyun-color': {
    id: 'sihyun-color',
    name: 'Personal Color Studio',
    shortName: 'COLOR STUDIO',
    sub: 'Signature Studio Lighting',
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
    sub: 'Official Biometric Standard',
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
window.FIMO_CAMERA_PERSONAS = FIMO_CAMERA_PERSONAS;
window.FIMO_ORDERED_CAMERAS = FIMO_ORDERED_CAMERAS;
window.CAM_SVG_ICONS = CAM_SVG_ICONS;

function getCameraCategory(camId) {
  for (const [cat, cams] of Object.entries(CAMERA_CATEGORIES)) {
    if (cams.includes(camId)) return cat;
  }
  return 'all';
}

// 11 Iconic Brands Architecture Definition for Camera Bag
const CAMERA_BRANDS = {
  'leica': {
    id: 'leica',
    name: 'LEICA',
    koreanName: '라이카',
    fullName: 'Leica Camera AG',
    country: '🇩🇪 독일 Wetzlar',
    desc: '독일 수제 광학과 영혼의 거리계 레인지파인더',
    iconText: '🔴',
    cams: ['leica-m']
  },
  'contax': {
    id: 'contax',
    name: 'CONTAX',
    koreanName: '콘탁스',
    fullName: 'Contax / Carl Zeiss',
    country: '🇩🇪·🇯🇵 독일·일본',
    desc: 'T* 코팅 칼 자이스 렌즈와 샴페인 티타늄',
    iconText: '⭐',
    cams: ['contax-t2']
  },
  'ricoh': {
    id: 'ricoh',
    name: 'RICOH',
    koreanName: '리코',
    fullName: 'Ricoh GR System',
    country: '🇯🇵 일본 도쿄',
    desc: '전설의 28mm 스냅 슈터 & 모리야마 다이도 흑백',
    iconText: '⬛',
    cams: ['ricoh-gr']
  },
  'olympus': {
    id: 'olympus',
    name: 'OLYMPUS',
    koreanName: '올림푸스',
    fullName: 'Olympus Optical',
    country: '🇯🇵 일본 도쿄',
    desc: '올웨더 슬라이딩 배리어와 주이코 렌즈',
    iconText: '💧',
    cams: ['olympus-mju']
  },
  'sony': {
    id: 'sony',
    name: 'SONY',
    koreanName: '소니',
    fullName: 'Sony Corporation',
    country: '🇯🇵 일본 시나가와',
    desc: 'Y2K 사이버샷 CCD & 핸디캠 MiniDV 비디오',
    iconText: '🔵',
    cams: ['sony-cybershot', 'sony-handycam']
  },
  'canon': {
    id: 'canon',
    name: 'CANON',
    koreanName: '캐논',
    fullName: 'Canon Inc.',
    country: '🇯🇵 일본 오타',
    desc: '스틸 곡면 바디 IXY 50 & 뽀얀 피치 글로우',
    iconText: '🔴',
    cams: ['canon-ixy']
  },
  'fujifilm': {
    id: 'fujifilm',
    name: 'FUJIFILM',
    koreanName: '후지필름',
    fullName: 'Fujifilm Holdings',
    country: '🇯🇵 일본 롯폰기',
    desc: '1986 일회용 우츠룬데스 & 인스탁스 즉석 필름',
    iconText: '🟢',
    cams: ['fuji-quicksnap', 'instax-mini']
  },
  'hasselblad': {
    id: 'hasselblad',
    name: 'HASSELBLAD',
    koreanName: '핫셀블라드',
    fullName: 'Victor Hasselblad AB',
    country: '🇸🇪 스웨덴 예테보리',
    desc: '아폴로 달 착륙의 6x6 중형 웨이스트레벨',
    iconText: '🪐',
    cams: ['hasselblad-500cm']
  },
  'polaroid': {
    id: 'polaroid',
    name: 'POLAROID',
    koreanName: '폴라로이드',
    fullName: 'Polaroid Corporation',
    country: '🇺🇸 미국 매사추세츠',
    desc: '에드윈 랜드의 삼각 폴딩 SLR & 5색 레인보우',
    iconText: '🌈',
    cams: ['polaroid-sx70']
  },
  'kyocera': {
    id: 'kyocera',
    name: 'KYOCERA',
    koreanName: '교세라',
    fullName: 'Kyocera Optical',
    country: '🇯🇵 일본 교토',
    desc: '1988 사이버펑크 세로형 72컷 하프프레임',
    iconText: '🔺',
    cams: ['kyocera-samurai']
  },
  'studio': {
    id: 'studio',
    name: 'STUDIO & LAB',
    koreanName: '스튜디오 & 랩',
    fullName: 'Special Vintage Lab',
    country: '📼 쇼와 버블 & 스튜디오',
    desc: '80년대 시티팝 앨범 자켓 & 퍼스널 컬러 증명사진',
    iconText: '🎨',
    cams: ['citypop-80s', 'oldfilm-35mm', 'sihyun-color', 'passport-id']
  }
};

window.CAMERA_BRANDS = CAMERA_BRANDS;

function getCameraBrand(camId) {
  for (const [brandId, brand] of Object.entries(CAMERA_BRANDS)) {
    if (brand.cams.includes(camId)) return brandId;
  }
  return 'studio';
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

  playRatchetWind() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // 4 rapid mechanical gear teeth clicks with rising resonance
    for (let i = 0; i < 4; i++) {
      const clickTime = now + i * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + i * 180, clickTime);
      osc.frequency.exponentialRampToValueAtTime(140, clickTime + 0.02);
      gain.gain.setValueAtTime(0.28, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(clickTime);
      osc.stop(clickTime + 0.025);
    }
  }

  playShutter(camId = state?.activeCamera) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (camId === 'instax-mini') {
      // Instax Mini: Mechanical leaf trip + Whirring electric motor & dual roller squeak
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(540, now);
      clickOsc.frequency.exponentialRampToValueAtTime(60, now + 0.05);
      clickGain.gain.setValueAtTime(0.4, now);
      clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.055);

      // Motor whining pitch ramp
      const motorOsc = this.ctx.createOscillator();
      const motorGain = this.ctx.createGain();
      motorOsc.type = 'sawtooth';
      motorOsc.frequency.setValueAtTime(420, now + 0.06);
      motorOsc.frequency.linearRampToValueAtTime(510, now + 0.35);
      motorGain.gain.setValueAtTime(0.18, now + 0.06);
      motorGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      motorOsc.connect(motorGain);
      motorGain.connect(this.ctx.destination);
      motorOsc.start(now + 0.06);
      motorOsc.stop(now + 0.43);
      return;
    }

    if (camId === 'polaroid-sx70') {
      // Polaroid SX-70: Soft leaf click followed by motorized roller ejection whine
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);

      const motorOsc = this.ctx.createOscillator();
      const motorGain = this.ctx.createGain();
      motorOsc.type = 'sawtooth';
      motorOsc.frequency.setValueAtTime(320, now + 0.1);
      motorOsc.frequency.linearRampToValueAtTime(420, now + 0.28);
      motorGain.gain.setValueAtTime(0.2, now + 0.1);
      motorGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      motorOsc.connect(motorGain);
      motorGain.connect(this.ctx.destination);
      motorOsc.start(now + 0.1);
      motorOsc.stop(now + 0.36);
      return;
    }

    if (camId === 'hasselblad-500cm') {
      // Hasselblad 500C/M: Massive 6x6 reflex mirror slap THUMP + leaf shutter
      const thump = this.ctx.createOscillator();
      const thumpGain = this.ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(130, now);
      thump.frequency.exponentialRampToValueAtTime(25, now + 0.16);
      thumpGain.gain.setValueAtTime(0.7, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      thump.connect(thumpGain);
      thumpGain.connect(this.ctx.destination);
      thump.start(now);
      thump.stop(now + 0.17);

      const snap = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snap.type = 'triangle';
      snap.frequency.setValueAtTime(480, now + 0.04);
      snap.frequency.exponentialRampToValueAtTime(60, now + 0.12);
      snapGain.gain.setValueAtTime(0.4, now + 0.04);
      snapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      snap.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snap.start(now + 0.04);
      snap.stop(now + 0.13);
      return;
    }

    if (camId === 'contax-t2') {
      // Contax T2: High precision whisper-quiet titanium leaf shutter
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.045);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.045);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      return;
    }

    if (camId === 'fuji-quicksnap') {
      // QuickSnap: Sharp plastic leaf spring snap
      const snap = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snap.type = 'square';
      snap.frequency.setValueAtTime(880, now);
      snap.frequency.exponentialRampToValueAtTime(80, now + 0.05);
      snapGain.gain.setValueAtTime(0.5, now);
      snapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      snap.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snap.start(now);
      snap.stop(now + 0.055);
      return;
    }
    
    // Mechanical Shutter Click (Standard & Leica)
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

  // Parametric Color Science & Film Recipe Processing
  if (!state.isBeforeModeActive && window.ParametricColorEngine && window.ParametricColorEngine.enabled) {
    window.ParametricColorEngine.processCanvas(canvas, window.ParametricColorEngine.activeRecipe);
  }
}

// ==========================================================================
// 4. Multi-Camera Switcher Engine & Real-time Live Background
// ==========================================================================

function getLiveVintageTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const yy = String(yyyy).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return {
    now,
    yyyy,
    yy,
    mm,
    dd,
    hours,
    minutes,
    seconds,
    quartzDate: `'${yy} ${mm} ${dd}`,
    quartzDateTime: `'${yy} ${mm} ${dd} ${hours}:${minutes}`,
    studioRecord: `${yyyy}.${mm}.${dd} RECORD`
  };
}

function updateClock() {
  const vt = getLiveVintageTimestamp();
  
  const clockEl = document.getElementById('status-time');
  if (clockEl) clockEl.textContent = `${vt.hours}:${vt.minutes}`;

  const dateCodeEl = document.getElementById('sihyun-date-code');
  if (dateCodeEl) dateCodeEl.textContent = vt.studioRecord;

  const dateStampEl = document.getElementById('date-stamp');
  if (dateStampEl) dateStampEl.textContent = vt.quartzDate;

  const quicksnapDateEl = document.getElementById('quicksnap-date-stamp');
  if (quicksnapDateEl) quicksnapDateEl.textContent = vt.quartzDate;

  const quicksnapToggle = document.getElementById('toggle-quicksnap-date');
  if (quicksnapToggle) quicksnapToggle.textContent = `${vt.quartzDate} 데이트스탬프`;

  const canonDateEl = document.querySelector('.canon-date-stamp');
  if (canonDateEl) canonDateEl.textContent = vt.quartzDateTime;

  const olympusDateEl = document.querySelector('.olympus-date');
  if (olympusDateEl) olympusDateEl.textContent = vt.quartzDate;

  const instaxDateEl = document.querySelector('.instax-date-stamp');
  if (instaxDateEl) instaxDateEl.textContent = vt.quartzDate;
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

  // 0. Chameleon Skeuomorphic Adaptive Body Engine: morph camera chassis
  const frameEl = document.querySelector('.iphone-frame');
  const appEl = document.querySelector('.camera-app');
  const allThemeClasses = Object.keys(CAMERAS).map(id => `theme-${id}`);
  if (frameEl) {
    frameEl.classList.remove(...allThemeClasses);
    frameEl.classList.add(`theme-${camId}`);
  }
  if (appEl) {
    appEl.classList.remove(...allThemeClasses);
    appEl.classList.add(`theme-${camId}`);
  }

  // 1. Update Dial Active Class & Smooth Perspective Shift
  if (window.alignModeDial) {
    window.alignModeDial(camId, true);
  } else {
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

  // Update FIMO Showcase Hero Card, Viewfinder Mini Camera Body Button & Caption Overlay
  updateFimoHeroCard(camId);
  updateFimoMiniCamRender(camId);
  if (typeof updateFimoCaptionOverlay === 'function') {
    updateFimoCaptionOverlay(camId);
  }

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

  // Sony Handycam VHS Scanline & Tape OSD
  const vhsOsd = document.getElementById('vhs-tape-osd');
  if (vhsOsd) {
    vhsOsd.style.display = (camId === 'sony-handycam') ? 'block' : 'none';
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

  // 7. Apply Camera-specific Filter & Parametric Photographic Recipe
  if (!state.isCustomRecipe && window.ParametricColorEngine) {
    const defaultRecipe = window.ParametricColorEngine.getRecipeForCamera(camId);
    if (defaultRecipe) {
      window.ParametricColorEngine.setRecipe(defaultRecipe);
      if (typeof syncProRecipeSlidersToUI === 'function') {
        syncProRecipeSlidersToUI(defaultRecipe);
      }
    }
  }

  if (state.cameraSource === 'model') {
    const modelCanvas = document.getElementById('model-canvas');
    if (modelCanvas) renderStudioModel(modelCanvas, state.retouchTone);
  }
  applyCurrentCameraFilter();
  if (typeof updateRecipeHudUI === 'function') {
    updateRecipeHudUI();
  }

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

// Next Filter Stepper (Ergonomic 1-tap/swipe transition)
function switchNextFilter() {
  const cam = CAMERAS[state.activeCamera];
  if (!cam || !cam.filters) return;
  const filterKeys = Object.keys(cam.filters);
  if (filterKeys.length <= 1) return;
  const currentKey = state.selectedFilters[state.activeCamera] || filterKeys[0];
  const curIdx = filterKeys.indexOf(currentKey);
  const nextIdx = (curIdx + 1) % filterKeys.length;
  selectCameraFilter(filterKeys[nextIdx]);
}

// Previous Filter Stepper (Ergonomic 1-tap/swipe transition)
function switchPrevFilter() {
  const cam = CAMERAS[state.activeCamera];
  if (!cam || !cam.filters) return;
  const filterKeys = Object.keys(cam.filters);
  if (filterKeys.length <= 1) return;
  const currentKey = state.selectedFilters[state.activeCamera] || filterKeys[0];
  const curIdx = filterKeys.indexOf(currentKey);
  const prevIdx = (curIdx - 1 + filterKeys.length) % filterKeys.length;
  selectCameraFilter(filterKeys[prevIdx]);
}

// Centralized Filter Selector with Graphic Swatch Sync & Auto-Center Scroll
function selectCameraFilter(filterKey) {
  const cam = CAMERAS[state.activeCamera];
  if (!cam || !cam.filters || !cam.filters[filterKey]) return;

  soundEngine.playTick();
  state.selectedFilters[state.activeCamera] = filterKey;
  if (state.cameraSource === 'model') {
    const modelCanvas = document.getElementById('model-canvas');
    if (modelCanvas) renderStudioModel(modelCanvas, state.retouchTone);
  }
  applyCurrentCameraFilter();

  // Update active state on chips in current drawer & smooth center scroll
  const drawer = document.getElementById(cam.drawerId);
  if (drawer) {
    const chips = drawer.querySelectorAll('.filter-chip');
    chips.forEach(c => {
      const isTarget = c.dataset.filter === filterKey;
      c.classList.toggle('active', isTarget);
      if (isTarget) {
        c.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  }

  const spec = cam.filters[filterKey];
  if (spec) {
    const badgeSub = document.getElementById('cam-badge-sub');
    if (badgeSub) badgeSub.textContent = cam.sub;
    showDynamicIslandBanner(cam.shortName, spec.name, 1200);
  }
}

// Viewfinder Quick Filter Stepper HUD Pill Sync
function updateFilterHud() {
  const cam = CAMERAS[state.activeCamera];
  const stepper = document.getElementById('vf-filter-stepper');
  if (!stepper) return;

  if (!cam || !cam.filters) {
    stepper.style.display = 'none';
    return;
  }

  stepper.style.display = 'flex';
  const filterKeys = Object.keys(cam.filters);
  const currentKey = state.selectedFilters[state.activeCamera] || filterKeys[0];
  const curIdx = Math.max(0, filterKeys.indexOf(currentKey));
  const filterSpec = cam.filters[currentKey];

  const labelEl = document.getElementById('vf-filter-label');
  const counterEl = document.getElementById('vf-filter-counter');
  const dotEl = document.getElementById('vf-filter-swatch-dot');

  if (labelEl && filterSpec) labelEl.textContent = filterSpec.name;
  if (counterEl) counterEl.textContent = `${curIdx + 1}/${filterKeys.length}`;
  if (dotEl) {
    dotEl.setAttribute('data-swatch', currentKey);
  }
}

function applyCurrentCameraFilter() {
  const cam = CAMERAS[state.activeCamera];
  const videoEl = document.getElementById('camera-video');
  const canvasEl = document.getElementById('model-canvas');
  if (!cam) return;

  // Real-Time Hardware Spectral Matrix Integration
  if (window.FilmSpectralEngine) {
    const matrixNode = document.getElementById('spectralMatrixNode');
    if (matrixNode) {
      const matrixVals = window.FilmSpectralEngine.getLiveViewfinderSVGFilter(cam.id);
      matrixNode.setAttribute('values', matrixVals);
    }
  }

  // Active sub-filter specification
  const fKey = state.selectedFilters[cam.id] || (cam.filters ? Object.keys(cam.filters)[0] : null);
  const filterSpec = (cam.filters && fKey) ? cam.filters[fKey] : null;

  // Exposure EV Compensation CSS
  const evVal = typeof state.fimoExposureEV === 'number' ? state.fimoExposureEV : 0.0;
  const evCss = Math.abs(evVal) > 0.01 ? `brightness(${(1 + evVal * 0.14).toFixed(3)})` : '';

  // Optical Lens Filter CSS
  let lensCss = '';
  if (state.lensFilter === 'mist') {
    lensCss = 'contrast(0.92) brightness(1.05) drop-shadow(0 0 8px rgba(255,255,255,0.30))';
  } else if (state.lensFilter === 'star') {
    lensCss = 'brightness(1.04)';
  } else if (state.lensFilter === 'streak') {
    lensCss = 'drop-shadow(0 0 6px rgba(0, 180, 255, 0.35))';
  } else if (state.lensFilter === 'cpl') {
    lensCss = 'contrast(1.08) saturate(1.12)';
  } else if (state.lensFilter === 'prism') {
    lensCss = 'hue-rotate(15deg) contrast(1.05)';
  }

  // Base Sub-Filter CSS or Custom Recipe CSS
  let baseCss = '';
  if (state.isCustomRecipe && window.ParametricColorEngine && window.ParametricColorEngine.enabled) {
    baseCss = window.ParametricColorEngine.getLivePreviewCSS(window.ParametricColorEngine.activeRecipe);
  } else if (filterSpec && filterSpec.css) {
    baseCss = filterSpec.css;
  } else if (window.ParametricColorEngine && window.ParametricColorEngine.enabled) {
    baseCss = window.ParametricColorEngine.getLivePreviewCSS(window.ParametricColorEngine.activeRecipe);
  }

  const liveFilter = state.isBeforeModeActive
    ? 'none'
    : [baseCss, evCss, lensCss].filter(Boolean).join(' ');

  if (videoEl) {
    videoEl.style.filter = liveFilter;
  }
  if (canvasEl) {
    canvasEl.style.filter = liveFilter;
  }

  // Dynamic Film Grain Layer Toggle: Active on all vintage cameras, hidden on official passport ID or B/A mode
  const grainLayer = document.getElementById('film-grain-layer');
  if (grainLayer) {
    grainLayer.style.display = (state.isBeforeModeActive || cam.id === 'passport-id') ? 'none' : 'block';
  }

  updateFilterHud();
  if (typeof updateRecipeHudUI === 'function') {
    updateRecipeHudUI();
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

// ==========================================================================
// Optical Highlight & Real-Time Light-Source Flare Engine
// Dynamically detects specular highlights / lamps / sun in video/canvas
// and renders Fraunhofer 6-Blade Sunstar and Newtonian Prism Dispersion
// ==========================================================================

const opticalFlareEngine = {
  activeFilter: 'none',
  animFrameId: null,
  analysisCanvas: null,
  analysisCtx: null,
  dynamicCanvas: null,
  dynamicCtx: null,
  smoothedLights: [],
  tiltAngle: 0,

  init() {
    if (!this.analysisCanvas) {
      this.analysisCanvas = document.createElement('canvas');
      this.analysisCanvas.width = 150;
      this.analysisCanvas.height = 200;
      this.analysisCtx = this.analysisCanvas.getContext('2d', { willReadFrequently: true });
    }
    this.dynamicCanvas = document.getElementById('lens-dynamic-canvas');
    if (this.dynamicCanvas) {
      this.dynamicCtx = this.dynamicCanvas.getContext('2d');
    }
  },

  start(filterKey) {
    this.activeFilter = filterKey;
    if (!this.dynamicCanvas || !this.analysisCtx) this.init();
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    if (filterKey === 'none' || filterKey === 'cpl') {
      this.clear();
      return;
    }

    const loop = () => {
      if (state.lensFilter !== this.activeFilter || this.activeFilter === 'none') {
        this.clear();
        return;
      }
      this.updateAndRender();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  },

  stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.clear();
  },

  clear() {
    if (this.dynamicCtx && this.dynamicCanvas) {
      this.dynamicCtx.clearRect(0, 0, this.dynamicCanvas.width, this.dynamicCanvas.height);
    }
    this.smoothedLights = [];
  },

  // Real-time Specular Highlight Detection from Video or Canvas
  detectHighlights(sourceEl) {
    if (!sourceEl) return [];
    if (!this.analysisCtx) this.init();
    if (!this.analysisCtx) return [];

    const aW = this.analysisCanvas.width;
    const aH = this.analysisCanvas.height;

    try {
      this.analysisCtx.drawImage(sourceEl, 0, 0, aW, aH);
      const imgData = this.analysisCtx.getImageData(0, 0, aW, aH);
      const data = imgData.data;

      // 1. Pass 1: Find maximum brightness and identify bright candidates
      let maxBright = 0;
      const candidates = [];

      for (let y = 4; y < aH - 4; y += 2) {
        for (let x = 4; x < aW - 4; x += 2) {
          const idx = (y * aW + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          // Luminance + white saturation score
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const minCh = Math.min(r, g, b);
          const score = lum * 0.65 + minCh * 0.35;

          if (score > maxBright) maxBright = score;
          if (score > 185) {
            candidates.push({ x: x / aW, y: y / aH, score });
          }
        }
      }

      // If the scene is very dim (no light source / specular reflection > 130), return no lights
      if (maxBright < 130) return [];

      // Adaptive threshold: at least 195, or within 25 of peak brightness
      const thresh = Math.max(195, maxBright - 25);
      const filtered = candidates.filter(c => c.score >= thresh);

      // 2. Sort descending by brightness
      filtered.sort((a, b) => b.score - a.score);

      // 3. Cluster / Non-Maximum Suppression (group nearby pixels into single light source)
      const clusters = [];
      const minDist = 0.12; // Normalized distance

      for (const pt of filtered) {
        let isMerged = false;
        for (const cl of clusters) {
          const dx = pt.x - cl.x;
          const dy = pt.y - cl.y;
          if (Math.hypot(dx, dy) < minDist) {
            cl.count += 1;
            cl.totalScore += pt.score;
            isMerged = true;
            break;
          }
        }
        if (!isMerged && clusters.length < 5) {
          clusters.push({
            x: pt.x,
            y: pt.y,
            score: pt.score,
            count: 1,
            totalScore: pt.score
          });
        }
      }

      // 4. Normalize intensity [0.35, 1.0]
      return clusters.map(c => ({
        x: c.x,
        y: c.y,
        intensity: Math.min(1.0, 0.4 + (c.score - 180) / 75 + Math.min(0.25, c.count * 0.03)),
        radius: Math.min(18, 6 + c.count * 0.8)
      }));
    } catch (e) {
      return [];
    }
  },

  updateAndRender() {
    const sourceEl = state.cameraSource === 'webcam'
      ? document.getElementById('camera-video')
      : document.getElementById('model-canvas');

    if (!sourceEl || !this.dynamicCtx) return;

    // Detect light sources in current frame
    const rawLights = this.detectHighlights(sourceEl);

    // Smooth temporal tracking (Exponential Moving Average) to eliminate jitter
    if (rawLights.length === 0) {
      this.smoothedLights = this.smoothedLights.map(l => ({ ...l, intensity: l.intensity * 0.8 })).filter(l => l.intensity > 0.05);
    } else {
      if (this.smoothedLights.length === 0) {
        this.smoothedLights = rawLights.map(l => ({ ...l }));
      } else {
        const nextList = [];
        for (const raw of rawLights) {
          let closest = null;
          let minD = 0.2;
          for (const prev of this.smoothedLights) {
            const d = Math.hypot(raw.x - prev.x, raw.y - prev.y);
            if (d < minD) {
              minD = d;
              closest = prev;
            }
          }
          if (closest) {
            nextList.push({
              x: closest.x + (raw.x - closest.x) * 0.35,
              y: closest.y + (raw.y - closest.y) * 0.35,
              intensity: closest.intensity + (raw.intensity - closest.intensity) * 0.35,
              radius: closest.radius + (raw.radius - closest.radius) * 0.35
            });
          } else {
            nextList.push({ ...raw });
          }
        }
        this.smoothedLights = nextList;
      }
    }

    this.tiltAngle = (this.tiltAngle + 0.002) % (Math.PI * 2);

    const w = this.dynamicCanvas.width;
    const h = this.dynamicCanvas.height;
    this.dynamicCtx.clearRect(0, 0, w, h);

    this.renderFlaresToContext(this.dynamicCtx, w, h, this.smoothedLights, this.activeFilter, this.tiltAngle);
  },

  // Reusable Flare Rendering (Used by live 60fps loop AND capturePhoto canvas)
  renderFlaresToContext(ctx, width, height, lights, filterKey, tilt = 0) {
    if (!lights || lights.length === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const light of lights) {
      const cx = light.x * width;
      const cy = light.y * height;
      const intensity = Math.max(0.2, Math.min(1.0, light.intensity));

      if (filterKey === 'star6') {
        this.draw6BladeSunstar(ctx, cx, cy, intensity, tilt);
      } else if (filterKey === 'prism') {
        this.drawNewtonianPrismDispersion(ctx, cx, cy, intensity, width, height);
      } else if (filterKey === 'star') {
        this.draw4XCrossStar(ctx, cx, cy, intensity, tilt);
      } else if (filterKey === 'streak') {
        this.drawAnamorphicBlueStreak(ctx, cx, cy, intensity, width);
      } else if (filterKey === 'mist') {
        this.drawBlackMistBloom(ctx, cx, cy, intensity);
      }
    }

    ctx.restore();
  },

  // 1. Fraunhofer 6-Blade Sunstar Diffraction (0°, 60°, 120° Diffraction Spikes + Chromatic Fringes)
  draw6BladeSunstar(ctx, cx, cy, intensity, tilt) {
    const spikeLen = (90 + 130 * intensity);
    const coreR = Math.max(6, 12 * intensity);

    // Incandescent Hot Core & Corona
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.2);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.25, 'rgba(255, 250, 230, 0.95)');
    coreGrad.addColorStop(0.55, 'rgba(255, 200, 110, 0.45)');
    coreGrad.addColorStop(1, 'rgba(255, 140, 40, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 6 Diffraction Spikes at 60° increments (0°, 60°, 120°, 180°, 240°, 300°)
    const angles = [0, Math.PI / 3, (2 * Math.PI) / 3];

    angles.forEach(baseAng => {
      const ang = baseAng + tilt;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);

      // Needle-sharp central white spike
      const needleGrad = ctx.createLinearGradient(cx - cos * spikeLen, cy - sin * spikeLen, cx + cos * spikeLen, cy + sin * spikeLen);
      needleGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      needleGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.75)');
      needleGrad.addColorStop(0.5, '#ffffff');
      needleGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.75)');
      needleGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = needleGrad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - cos * spikeLen, cy - sin * spikeLen);
      ctx.lineTo(cx + cos * spikeLen, cy + sin * spikeLen);
      ctx.stroke();

      // Soft diffraction envelope
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = 'rgba(255, 240, 200, 0.22)';
      ctx.beginPath();
      ctx.moveTo(cx - cos * spikeLen * 0.75, cy - sin * spikeLen * 0.75);
      ctx.lineTo(cx + cos * spikeLen * 0.75, cy + sin * spikeLen * 0.75);
      ctx.stroke();

      // Chromatic fringe 1 (Cyan split along +0.7° offset)
      const cCos = Math.cos(ang + 0.012);
      const cSin = Math.sin(ang + 0.012);
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(100, 220, 255, 0.38)';
      ctx.beginPath();
      ctx.moveTo(cx - cCos * spikeLen * 0.9, cy - cSin * spikeLen * 0.9);
      ctx.lineTo(cx + cCos * spikeLen * 0.9, cy + cSin * spikeLen * 0.9);
      ctx.stroke();

      // Chromatic fringe 2 (Magenta/Amber split along -0.7° offset)
      const mCos = Math.cos(ang - 0.012);
      const mSin = Math.sin(ang - 0.012);
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(255, 150, 100, 0.38)';
      ctx.beginPath();
      ctx.moveTo(cx - mCos * spikeLen * 0.9, cy - mSin * spikeLen * 0.9);
      ctx.lineTo(cx + mCos * spikeLen * 0.9, cy + mSin * spikeLen * 0.9);
      ctx.stroke();
    });

    // Secondary 30° micro-glints
    const subAngles = [Math.PI / 6, Math.PI / 2, (5 * Math.PI) / 6];
    subAngles.forEach(baseAng => {
      const ang = baseAng + tilt;
      const subLen = spikeLen * 0.38;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(255, 245, 220, 0.45)';
      ctx.beginPath();
      ctx.moveTo(cx - cos * subLen, cy - sin * subLen);
      ctx.lineTo(cx + cos * subLen, cy + sin * subLen);
      ctx.stroke();
    });
  },

  // 2. Newtonian Spectral Prism Dispersion (Rainbow Refraction Fan & Internal Caustic Glint)
  drawNewtonianPrismDispersion(ctx, cx, cy, intensity, width, height) {
    const midX = width / 2;
    const midY = height / 2;
    let dirX = cx - midX;
    let dirY = cy - midY;
    const distToCenter = Math.hypot(dirX, dirY) || 1;
    dirX /= distToCenter;
    dirY /= distToCenter;

    const perpX = -dirY;
    const perpY = dirX;

    const fanLen = 140 + 180 * intensity;
    const spreadW = 35 + 45 * intensity;

    // Newton's Spectrum: Red -> Orange -> Yellow -> Green -> Cyan -> Blue -> Violet
    const spectrum = [
      { col: 'rgba(255, 45, 45, ', offset: -1.0 },
      { col: 'rgba(255, 140, 20, ', offset: -0.66 },
      { col: 'rgba(255, 235, 30, ', offset: -0.33 },
      { col: 'rgba(40, 240, 90, ',  offset: 0.0 },
      { col: 'rgba(20, 230, 255, ', offset: 0.33 },
      { col: 'rgba(60, 110, 255, ', offset: 0.66 },
      { col: 'rgba(180, 50, 255, ', offset: 1.0 }
    ];

    spectrum.forEach(band => {
      const bandOffset = band.offset * spreadW;
      const tipX = cx + dirX * fanLen + perpX * bandOffset;
      const tipY = cy + dirY * fanLen + perpY * bandOffset;

      const grad = ctx.createLinearGradient(cx, cy, tipX, tipY);
      grad.addColorStop(0, band.col + (0.75 * intensity) + ')');
      grad.addColorStop(0.3, band.col + (0.55 * intensity) + ')');
      grad.addColorStop(0.7, band.col + (0.25 * intensity) + ')');
      grad.addColorStop(1, band.col + '0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(
        cx + dirX * (fanLen * 0.4) + perpX * (bandOffset * 0.4),
        cy + dirY * (fanLen * 0.4) + perpY * (bandOffset * 0.4),
        tipX,
        tipY
      );
      ctx.stroke();
    });

    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * intensity);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
    coreGrad.addColorStop(0.6, 'rgba(200, 240, 255, 0.4)');
    coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 18 * intensity, 0, Math.PI * 2);
    ctx.fill();

    const ghostDist = distToCenter * 0.65;
    const ghostX = midX - dirX * ghostDist;
    const ghostY = midY - dirY * ghostDist;

    const ghostGrad = ctx.createRadialGradient(ghostX, ghostY, 0, ghostX, ghostY, 32 * intensity);
    ghostGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    ghostGrad.addColorStop(0.3, 'rgba(255, 120, 200, 0.3)');
    ghostGrad.addColorStop(0.6, 'rgba(0, 240, 255, 0.2)');
    ghostGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = ghostGrad;
    ctx.beginPath();
    ctx.arc(ghostX, ghostY, 32 * intensity, 0, Math.PI * 2);
    ctx.fill();
  },

  // 3. 4X Cross Star Flare
  draw4XCrossStar(ctx, cx, cy, intensity, tilt) {
    const spikeLen = 80 + 110 * intensity;
    const angles = [Math.PI / 4, (3 * Math.PI) / 4];

    angles.forEach(ang => {
      const cos = Math.cos(ang + tilt);
      const sin = Math.sin(ang + tilt);
      const grad = ctx.createLinearGradient(cx - cos * spikeLen, cy - sin * spikeLen, cx + cos * spikeLen, cy + sin * spikeLen);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.92)');
      grad.addColorStop(1, 'transparent');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx - cos * spikeLen, cy - sin * spikeLen);
      ctx.lineTo(cx + cos * spikeLen, cy + sin * spikeLen);
      ctx.stroke();
    });

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();
  },

  // 4. Anamorphic Blue Streak Flare
  drawAnamorphicBlueStreak(ctx, cx, cy, intensity, width) {
    const streakH = 14 * intensity;
    const grad = ctx.createLinearGradient(0, cy - streakH, 0, cy + streakH);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.35, 'rgba(0, 210, 255, 0.7)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.98)');
    grad.addColorStop(0.65, 'rgba(0, 210, 255, 0.7)');
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.fillRect(0, cy - streakH, width, streakH * 2);

    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40 * intensity);
    halo.addColorStop(0, '#ffffff');
    halo.addColorStop(0.4, 'rgba(0, 229, 255, 0.75)');
    halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, 40 * intensity, 0, Math.PI * 2);
    ctx.fill();
  },

  // 5. Black Mist Highlight Halation Bloom
  drawBlackMistBloom(ctx, cx, cy, intensity) {
    const bloomR = 40 + 60 * intensity;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    grad.addColorStop(0.3, 'rgba(255, 240, 215, 0.22)');
    grad.addColorStop(0.7, 'rgba(255, 220, 180, 0.08)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, bloomR, 0, Math.PI * 2);
    ctx.fill();
  }
};

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

  // Only CPL uses static CSS layer; Star, Star6, Prism, Streak use dynamic light-source canvas
  Object.entries(layers).forEach(([k, el]) => {
    if (el) el.style.display = (k === filterKey && k === 'cpl') ? 'block' : 'none';
  });

  // Start real-time optical highlight engine for dynamic light-source tracking flares
  if (opticalFlareEngine) {
    opticalFlareEngine.start(filterKey);
  }

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
  soundEngine.playShutter(state.activeCamera);

  if (state.activeCamera === 'fuji-quicksnap') {
    const counterEl = document.querySelector('#quicksnap-osd .quicksnap-frame-counter');
    if (counterEl) {
      const match = counterEl.textContent.match(/EXP \[\s*(\d+)\s*\/\s*27\s*\]/);
      const curr = match ? parseInt(match[1], 10) : 24;
      const nextExp = Math.min(27, curr + 1);
      counterEl.textContent = `EXP [ ${nextExp} / 27 ]`;
    }
  }

  // Decrement FIMO analog film remaining gauge
  if (state.fimoFilmRemaining > 0) {
    state.fimoFilmRemaining--;
    const gaugeEl = document.getElementById('fimo-gauge-curr');
    if (gaugeEl) gaugeEl.textContent = state.fimoFilmRemaining;
  }

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

  const isLandscape = state.orientation === 'landscape' ||
                      document.querySelector('.camera-app')?.classList.contains('landscape-mode') ||
                      document.querySelector('.device-wrapper')?.classList.contains('orientation-landscape') ||
                      (window.innerWidth > window.innerHeight && window.innerHeight <= 550);

  const captureCanvas = document.createElement('canvas');
  if (isLandscape) {
    captureCanvas.width = 1040;
    captureCanvas.height = 780;
  } else {
    captureCanvas.width = 780;
    captureCanvas.height = 1040;
  }
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

  // 2. Determine Filter CSS for Subject (including EV compensation)
  const evVal = typeof state.fimoExposureEV === 'number' ? state.fimoExposureEV : 0.0;
  const evCss = Math.abs(evVal) > 0.01 ? `brightness(${(1 + evVal * 0.14).toFixed(3)}) ` : '';

  let activeFilter = 'none';
  if (cam.filters) {
    const fKey = state.selectedFilters[cam.id];
    const spec = cam.filters[fKey] || Object.values(cam.filters)[0];
    activeFilter = `${evCss}${spec.css}`;
  } else if (cam.id === 'sihyun-color') {
    const toneRatio = 1 + (state.retouchTone - 35) * 0.0035;
    activeFilter = `${evCss}brightness(${toneRatio}) contrast(${1 + (state.retouchTone - 35) * 0.001})`;
  } else if (evCss) {
    activeFilter = evCss.trim();
  }

  // 3. Draw Subject (Transparent Model or Mirrored/Unmirrored Webcam)
  const currentZoom = Math.max(1.0, Math.min(5.0, state.fimoZoomLevel || 1.0));
  const baseCaptureFilter = (activeFilter && activeFilter !== 'none') ? activeFilter : '';
  const flashFilter = (state.flashMode === 'on') ? 'brightness(1.15) contrast(1.08)' : '';
  const subjectFilter = state.isCustomRecipe
    ? (flashFilter || 'none')
    : ([baseCaptureFilter, flashFilter].filter(Boolean).join(' ') || 'none');

  if (state.cameraSource === 'webcam') {
    const video = document.getElementById('camera-video');
    if (video.videoWidth && video.videoHeight) {
      ctx.save();
      if (currentZoom > 1.0) {
        ctx.translate(captureCanvas.width / 2, captureCanvas.height / 2);
        ctx.scale(currentZoom, currentZoom);
        ctx.translate(-captureCanvas.width / 2, -captureCanvas.height / 2);
      }
      ctx.filter = subjectFilter;

      // Crop video to exact target ratio (4:3 in landscape, 3:4 in portrait)
      const vAspect = video.videoWidth / video.videoHeight;
      const targetAspect = captureCanvas.width / captureCanvas.height;
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
      if (currentZoom > 1.0) {
        ctx.translate(captureCanvas.width / 2, captureCanvas.height / 2);
        ctx.scale(currentZoom, currentZoom);
        ctx.translate(-captureCanvas.width / 2, -captureCanvas.height / 2);
      }
      ctx.filter = subjectFilter;

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
    // Organic film tone curves are handled with Float32 spectral precision in FilmSpectralEngine
    // Destructive flat tint overlays are removed to guarantee pure, deep blacks and organic sky tones

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

  // 4.5. Scientific Photographic Colorimetry & Film Emulsion Processing
  if (window.FilmSpectralEngine) {
    const isCustom = !!state.isCustomRecipe;
    const captureRecipe = (isCustom && window.ParametricColorEngine)
      ? window.ParametricColorEngine.activeRecipe
      : null;
    window.FilmSpectralEngine.processCanvas(captureCanvas, cam.id, {
      skipParametric: !isCustom,
      recipe: captureRecipe,
      grainIntensity: (cam.id === 'passport-id') ? 0 : 1.0
    });
  }

  // 5. Camera-Specific OSD Watermarks & Frames (Clean Capture with Dynamic Live Dates)
  const vt = getLiveVintageTimestamp();

  if (cam.id === 'canon-ixy') {
    const ixyDateToggle = document.getElementById('toggle-ixy-date');
    if (state.fimoDateEnabled && (!ixyDateToggle || ixyDateToggle.classList.contains('active'))) {
      ctx.save();
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.fillStyle = '#ff9500';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(vt.quartzDateTime, captureCanvas.width - 270, captureCanvas.height - 40);
      ctx.restore();
    }
  } else if (cam.id === 'sony-handycam') {
    const handyRecToggle = document.getElementById('toggle-handy-rec');
    const handyOsdToggle = document.getElementById('toggle-handy-osd');
    if (!handyRecToggle || handyRecToggle.classList.contains('active')) {
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillStyle = '#ff3b30';
      ctx.fillText('● REC', 40, 60);
      ctx.fillStyle = '#00ffcc';
      ctx.fillText('SP 0:00:14', 130, 60);
    }
    if (!handyOsdToggle || handyOsdToggle.classList.contains('active')) {
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillStyle = '#00ffcc';
      ctx.fillText('Hi-Fi STEREO [DV]', 40, captureCanvas.height - 40);
      ctx.fillText('BATT ▮▮▮▯', captureCanvas.width - 200, captureCanvas.height - 40);
    }
  } else if (cam.id === 'sony-cybershot') {
    // Pure clean photograph: No brand text or megapixel watermark stamped on photo!
    if (state.fimoDateEnabled) {
      ctx.save();
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillStyle = '#ff9500';
      ctx.shadowColor = 'rgba(255, 149, 0, 0.7)';
      ctx.shadowBlur = 6;
      ctx.fillText(vt.quartzDate, captureCanvas.width - 150, captureCanvas.height - 40);
      ctx.restore();
    }
  } else if (cam.id === 'olympus-mju') {
    // Pure clean photograph: No OLYMPUS brand watermark banner stamped on photo!
    const mjuDateToggle = document.getElementById('toggle-mju-date');
    if (state.fimoDateEnabled && (!mjuDateToggle || mjuDateToggle.classList.contains('active'))) {
      ctx.save();
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#ff9f0a';
      ctx.shadowColor = 'rgba(255, 159, 10, 0.7)';
      ctx.shadowBlur = 6;
      ctx.fillText(vt.quartzDate, captureCanvas.width - 150, captureCanvas.height - 40);
      ctx.restore();
    }
  } else if (cam.id === 'contax-t2') {
    // Pure clean photograph: No red LED bar or CONTAX brand text stamped on photo!
    const contaxLedToggle = document.getElementById('toggle-contax-led');
    if (state.fimoDateEnabled && (!contaxLedToggle || contaxLedToggle.classList.contains('active'))) {
      ctx.save();
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillStyle = '#ff453a';
      ctx.shadowColor = 'rgba(255, 69, 58, 0.7)';
      ctx.shadowBlur = 6;
      ctx.fillText(vt.quartzDate, captureCanvas.width - 150, captureCanvas.height - 40);
      ctx.restore();
    }
  } else if (cam.id === 'ricoh-gr') {
    // Pure clean photograph: No SNAP / GR LENS text stamped on photo!
    if (state.selectedFilters['ricoh-gr'] === 'gr-bw-high') {
      const imgData = ctx.getImageData(0, 0, captureCanvas.width, captureCanvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        let v = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        v = (v - 128) * 1.5 + 128;
        v = Math.max(0, Math.min(255, v));
        d[i] = v; d[i + 1] = v; d[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);
    }
  } else if (cam.id === 'leica-m') {
    // Pure clean photograph: No LEICA red dot badge or SUMMILUX text stamped on photo!
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
    const cassetteToggle = document.getElementById('toggle-citypop-cassette');
    if (cassetteToggle && cassetteToggle.classList.contains('active')) {
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

      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('PACIFIC BREEZE 1986 • SHONAN', 40, captureCanvas.height - 40);
      ctx.fillStyle = '#ffd60a';
      ctx.fillText('◷ C-60 TAPE', captureCanvas.width - 150, captureCanvas.height - 40);
    }
  } else if (cam.id === 'oldfilm-35mm') {
    const sprocketToggle = document.getElementById('toggle-oldfilm-sprocket');
    if (sprocketToggle && sprocketToggle.classList.contains('active')) {
      const sprocketH = 34;
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, captureCanvas.width, sprocketH);
      ctx.fillRect(0, captureCanvas.height - sprocketH, captureCanvas.width, sprocketH);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let x = 20; x < captureCanvas.width; x += 60) {
        ctx.fillRect(x, 8, 20, 16);
        ctx.fillRect(x, captureCanvas.height - 24, 20, 16);
      }
    }

    const halationToggle = document.getElementById('toggle-oldfilm-halation');
    if ((!halationToggle || halationToggle.classList.contains('active')) && state.selectedFilters['oldfilm-35mm'] === 'film-cinestill') {
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
    const waistToggle = document.getElementById('toggle-hassel-waist');
    if (!waistToggle || waistToggle.classList.contains('active')) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.strokeRect(30, 30, captureCanvas.width - 60, captureCanvas.height - 60);
    }

    const crossToggle = document.getElementById('toggle-hassel-cross');
    if (crossToggle && crossToggle.classList.contains('active')) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(captureCanvas.width / 2 - 12, captureCanvas.height / 2);
      ctx.lineTo(captureCanvas.width / 2 + 12, captureCanvas.height / 2);
      ctx.moveTo(captureCanvas.width / 2, captureCanvas.height / 2 - 12);
      ctx.lineTo(captureCanvas.width / 2, captureCanvas.height / 2 + 12);
      ctx.stroke();
    }
    // Pure clean photograph: No HASSELBLAD Swedish badge or Carl Zeiss text stamped on photo!
  } else if (cam.id === 'polaroid-sx70') {
    // Signature Polaroid SX-70 Instant Card Frame
    ctx.lineWidth = 28;
    ctx.strokeStyle = '#f5f0eb';
    ctx.strokeRect(14, 14, captureCanvas.width - 28, captureCanvas.height - 28);
    ctx.fillStyle = '#f5f0eb';
    ctx.fillRect(0, captureCanvas.height - 150, captureCanvas.width, 150);

    const rainbowToggle = document.getElementById('toggle-sx70-rainbow');
    if (!rainbowToggle || rainbowToggle.classList.contains('active')) {
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
    }

    if (state.fimoDateEnabled) {
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillStyle = '#6e7075';
      ctx.fillText(vt.quartzDate, captureCanvas.width - 160, captureCanvas.height - 60);
    }
  } else if (cam.id === 'fuji-quicksnap') {
    // 1986 Fuji QuickSnap: Authentic Amber Quartz Date Imprint with NO top-left watermark
    const quicksnapDateToggle = document.getElementById('toggle-quicksnap-date');
    if (state.fimoDateEnabled && (!quicksnapDateToggle || quicksnapDateToggle.classList.contains('active'))) {
      ctx.save();
      ctx.font = 'bold 22px "Impact", "Arial Black", sans-serif';
      ctx.fillStyle = '#ff9100';
      ctx.shadowColor = 'rgba(255, 145, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText(vt.quartzDate, captureCanvas.width - 150, captureCanvas.height - 45);
      ctx.restore();
    }

    // Top-left FUJICOLOR badge is COMPLETELY REMOVED to keep clean photo!

    // Optical cosine-fourth lens falloff is applied with Float32 precision in FilmSpectralEngine
  } else if (cam.id === 'kyocera-samurai') {
    // 1988 Kyocera Samurai X3.0 Cyber Half-Frame 72-Shot SLR
    const halfToggle = document.getElementById('toggle-samurai-halfline');
    if (!halfToggle || halfToggle.classList.contains('active')) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(captureCanvas.width / 2, 40);
      ctx.lineTo(captureCanvas.width / 2, captureCanvas.height - 40);
      ctx.stroke();
      ctx.restore();
    }

    // Pure clean photograph: Top-left cyber LCD banner & bottom-right Yashica text REMOVED!
    if (state.fimoDateEnabled) {
      ctx.save();
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#ff9100';
      ctx.shadowColor = 'rgba(255, 145, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(vt.quartzDate, captureCanvas.width - 150, captureCanvas.height - 45);
      ctx.restore();
    }
  } else if (cam.id === 'instax-mini') {
    const frameToggle = document.getElementById('toggle-instax-frame');
    if (!frameToggle || frameToggle.classList.contains('active')) {
      ctx.lineWidth = 36;
      ctx.strokeStyle = '#f5f4ef';
      ctx.strokeRect(18, 18, captureCanvas.width - 36, captureCanvas.height - 36);
      ctx.fillStyle = '#f5f4ef';
      ctx.fillRect(0, captureCanvas.height - 140, captureCanvas.width, 140);
      ctx.font = 'bold 24px -apple-system, sans-serif';
      ctx.fillStyle = '#3b3d44';
      ctx.fillText('instax mini', 40, captureCanvas.height - 55);
    }

    const dateToggle = document.getElementById('toggle-instax-date');
    if (state.fimoDateEnabled && (!dateToggle || dateToggle.classList.contains('active'))) {
      ctx.font = '20px "Courier New", monospace';
      ctx.fillStyle = '#8c8f99';
      ctx.fillText(vt.quartzDate, captureCanvas.width - 170, captureCanvas.height - 55);
    }
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
    ctx.fillText(vt.studioRecord, 40, captureCanvas.height - 75);

    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(state.selectedColor.name, 40, captureCanvas.height - 45);

    ctx.font = '34px "Brush Script MT", cursive';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillText('Studio Signature', captureCanvas.width - 270, captureCanvas.height - 45);
  }

  // 5.5. Poetic Vintage Photo Caption Imprint (when 사진 문구 ON)
  const persona = FIMO_CAMERA_PERSONAS[cam.id];
  const activeCaptionText = state.fimoCaptionEnabled && persona && persona.captionText
    ? persona.captionText
    : null;

  if (activeCaptionText) {
    ctx.save();
    ctx.font = '600 22px -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 252, 240, 0.94)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    const captionY = (cam.id === 'polaroid-sx70' || cam.id === 'instax-mini')
      ? captureCanvas.height - 175
      : captureCanvas.height - 82;
    ctx.fillText(activeCaptionText, captureCanvas.width / 2, captionY);
    ctx.restore();
  }

  // 6. Dynamic Optical Lens Filter Synthesis with Light-Source Detection
  if (state.lensFilter && state.lensFilter !== 'none' && state.lensFilter !== 'cpl') {
    if (opticalFlareEngine) {
      const detectedLights = opticalFlareEngine.detectHighlights(captureCanvas);
      if (detectedLights.length > 0) {
        opticalFlareEngine.renderFlaresToContext(ctx, captureCanvas.width, captureCanvas.height, detectedLights, state.lensFilter, 0);
      } else {
        // Fallback subtle highlight if in dark environment
        const fallback = [{ x: 0.5, y: 0.38, intensity: 0.45, radius: 10 }];
        opticalFlareEngine.renderFlaresToContext(ctx, captureCanvas.width, captureCanvas.height, fallback, state.lensFilter, 0);
      }
    }
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

  const focalStr = currentZoom > 1.05 
    ? `${Math.round(23.5 * currentZoom)}mm eq. (${currentZoom.toFixed(1)}x)`
    : (cam.exposure ? cam.exposure.focal : '28mm eq.');

  const evSign = evVal > 0 ? '+' : '';
  const evRecordStr = `${evSign}${evVal.toFixed(1)} EV`;

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
    personaName: persona ? persona.personaName : cam.name,
    lensModel: cam.lensModel || 'Precision Optical Glass',
    filterName: filterSpec.name,
    filterDesc: filterSpec.desc,
    opticalLens: state.lensFilter !== 'none' ? state.lensFilter.toUpperCase() : 'Clear (None)',
    caption: activeCaptionText || '',
    exposureEV: evRecordStr,

    shutterSpeed: cam.exposure ? cam.exposure.shutter : '1/125s',
    aperture: cam.exposure ? cam.exposure.aperture : 'f/2.8',
    iso: cam.exposure ? cam.exposure.iso : 'ISO 100',
    exposure: cam.exposure ? `${cam.exposure.shutter} • ${cam.exposure.aperture} • ${focalStr}` : `1/125s • f/2.8 • ${focalStr}`,
    focalLength: focalStr,
    flashFired: state.flashMode === 'on',
    width: captureCanvas.width,
    height: captureCanvas.height,
    aspectRatio: isLandscape ? `${captureCanvas.width}:${captureCanvas.height} (4:3 가로)` : `${captureCanvas.width}:${captureCanvas.height} (3:4 세로)`,
    colorSpace: 'sRGB Display P3',
    exif: {
      camera: cam.name,
      persona: persona ? persona.personaName : cam.name,
      lens: cam.lensModel || 'Precision Optical Glass',
      filter: filterSpec.name,
      optical: state.lensFilter !== 'none' ? state.lensFilter.toUpperCase() : 'Clear (None)',
      shutter: cam.exposure ? cam.exposure.shutter : '1/125s',
      aperture: cam.exposure ? cam.exposure.aperture : 'f/2.8',
      iso: cam.exposure ? cam.exposure.iso : 'ISO 100',
      focal: focalStr,
      exposureBias: evRecordStr,
      caption: activeCaptionText || 'None',
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

  if (cam.id === 'instax-mini' || cam.id === 'polaroid-sx70') {
    triggerInstantFilmEjection(photoRecord, cam.id);
  } else {
    if (cam.id === 'fuji-quicksnap') {
      setTimeout(() => {
        soundEngine.playRatchetWind();
      }, 420);
    }
    setTimeout(() => {
      openGalleryModal();
    }, 350);
  }
}

// ==========================================================================
// Instant Film Mechanical Ejection & Chemical Development Engine (ERR-013)
// ==========================================================================
function triggerInstantFilmEjection(photoRecord, camId) {
  const overlay = document.getElementById('instant-ejection-overlay');
  const card = document.getElementById('instant-film-card');
  const photo = document.getElementById('instant-film-photo');
  const mask = document.getElementById('instant-emulsion-mask');
  const badge = document.getElementById('instant-card-badge');
  const status = document.getElementById('instant-card-status');
  const actionBar = document.getElementById('instant-action-bar');
  if (!overlay || !card || !photo) {
    setTimeout(() => openGalleryModal(), 350);
    return;
  }

  const isPolaroid = (camId === 'polaroid-sx70');
  overlay.classList.toggle('polaroid-mode', isPolaroid);
  if (badge) {
    badge.textContent = isPolaroid ? 'POLAROID SX-70' : 'instax mini';
  }
  if (status) {
    status.textContent = 'EJECTING...';
    status.classList.remove('developed');
  }

  // Reset classes and set photo src
  card.classList.remove('ejecting', 'developing');
  if (actionBar) actionBar.classList.remove('visible');
  if (mask) mask.style.opacity = '1';
  photo.src = photoRecord.dataUrl;

  overlay.classList.add('active');

  // Trigger mechanical ejection slide animation
  void card.offsetWidth;
  card.classList.add('ejecting');

  // After 650ms, begin progressive chemical oxidation development
  setTimeout(() => {
    card.classList.add('developing');
    if (status) status.textContent = 'DEVELOPING...';

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 400;
      const pct = Math.min(100, Math.round((elapsed / 3200) * 100));
      if (status && pct < 100) {
        status.textContent = `DEVELOPING ${pct}%`;
      }
      if (elapsed >= 3200) {
        clearInterval(interval);
        if (status) {
          status.textContent = 'DEVELOPED';
          status.classList.add('developed');
        }
        if (actionBar) {
          actionBar.classList.add('visible');
        }
      }
    }, 400);
  }, 650);

  function dismissEjection(e) {
    if (e) e.stopPropagation();
    overlay.classList.remove('active');
    card.classList.remove('ejecting', 'developing');
    cleanup();
  }

  function viewInGallery(e) {
    if (e) e.stopPropagation();
    dismissEjection();
    openGalleryModal();
  }

  const btnView = document.getElementById('btn-instant-view-gallery');
  const btnDismiss = document.getElementById('btn-instant-dismiss');

  function cleanup() {
    if (btnView) btnView.removeEventListener('click', viewInGallery);
    if (btnDismiss) btnDismiss.removeEventListener('click', dismissEjection);
    card.removeEventListener('click', viewInGallery);
  }

  if (btnView) btnView.addEventListener('click', viewInGallery, { once: true });
  if (btnDismiss) btnDismiss.addEventListener('click', dismissEjection, { once: true });
  card.addEventListener('click', viewInGallery, { once: true });
}
window.triggerInstantFilmEjection = triggerInstantFilmEjection;

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

async function saveOrSharePhoto(photoItem) {
  if (!photoItem || !photoItem.dataUrl) return;
  soundEngine.playTick();

  const camKey = photoItem.cameraKey || state.activeCamera || 'snap';
  const timestamp = Date.now();
  const filename = `iCam_${camKey}_${timestamp}.jpg`;

  // 1. Convert base64 dataUrl to Blob safely
  let blob = null;
  try {
    const res = await fetch(photoItem.dataUrl);
    blob = await res.blob();
  } catch (e) {
    try {
      const parts = photoItem.dataUrl.split(',');
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      blob = new Blob([ab], { type: mimeString });
    } catch (err) {
      console.error('Blob conversion failed:', err);
    }
  }

  // 2. On Mobile (iOS Safari / Chrome / Android), use Web Share API to directly save to Photos
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile && blob && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: 'image/jpeg' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: photoItem.cameraName || 'iCam Photo',
          text: `${photoItem.cameraName || 'iCam'} • ${photoItem.filterName || 'Vintage Filter'}`
        });
        showDynamicIslandBanner('SAVED', 'PHOTOS APP', 2200);
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // User dismissed system share sheet
        return;
      }
    }
  }

  // 3. Fallback / Desktop: Blob URL download
  if (blob) {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    showDynamicIslandBanner('DOWNLOADED', 'PHOTO SAVED', 1800);
  } else {
    const a = document.createElement('a');
    a.href = photoItem.dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showDynamicIslandBanner('DOWNLOADED', 'PHOTO SAVED', 1800);
  }
}

function downloadCurrentGalleryPhoto() {
  if (state.gallery.length === 0) return;
  const item = state.gallery[state.selectedGalleryIndex];
  saveOrSharePhoto(item);
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
    if (promptOverlay) promptOverlay.style.display = 'none';
    useStudioModel('female');
    return false;
  }
}

function useStudioModel(type = 'female') {
  const video = document.getElementById('camera-video');
  const modelCanvas = document.getElementById('model-canvas');
  const promptOverlay = document.getElementById('camera-prompt-overlay');
  if (promptOverlay) promptOverlay.style.display = 'none';

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
    }, 500);
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
    if (e.target.closest('.camera-model-badge-container') || e.target.closest('.vf-filter-stepper') || e.target.closest('button')) return;
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
    } else if (Math.abs(dy) > 30 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      // Ergonomic Vertical Flick / Swipe Gesture to Cycle Filters
      if (dy < 0) {
        switchNextFilter();
      } else {
        switchPrevFilter();
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

// Tier 4: Visual Camera Bag / Brand Cabinet Drawer Modal (16 Iconic Bodies Grouped by Brand)
function openCameraBagModal() {
  // Reset category and brand filter buttons
  document.querySelectorAll('#bag-category-filter .bag-cat-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === 'all');
  });
  document.querySelectorAll('#bag-brand-filter .bag-brand-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.brand === 'all');
  });
  renderCameraBagGrid('all', 'all');

  const modal = document.getElementById('camera-bag-modal');
  if (modal) {
    soundEngine.playTick();
    modal.classList.add('open');
    showDynamicIslandBanner('CAMERA BAG', 'BRAND COLLECTION', 1500);
  }
}

function closeCameraBagModal() {
  const modal = document.getElementById('camera-bag-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

function updateFimoHeroCard(camId) {
  const persona = FIMO_CAMERA_PERSONAS[camId];
  if (!persona) return;

  const heroImg = document.getElementById('fimo-hero-photo');
  if (heroImg && persona.heroImg) {
    heroImg.src = persona.heroImg;
  }

  const iconBox = document.getElementById('fimo-hero-icon-box');
  if (iconBox) {
    iconBox.innerHTML = CAM_SVG_ICONS[camId] || CAM_SVG_ICONS['default'];
  }

  const nameEl = document.getElementById('fimo-hero-name');
  if (nameEl) nameEl.textContent = persona.personaName;

  const subEl = document.getElementById('fimo-hero-sub');
  if (subEl) subEl.textContent = persona.subtitle;

  if (persona.thumbs && persona.thumbs.length >= 3) {
    const t1 = document.getElementById('fimo-hero-thumb-1');
    const t2 = document.getElementById('fimo-hero-thumb-2');
    const t3 = document.getElementById('fimo-hero-thumb-3');
    if (t1) t1.src = persona.thumbs[0];
    if (t2) t2.src = persona.thumbs[1];
    if (t3) t3.src = persona.thumbs[2];
  }
}

function updateFimoMiniCamRender(camId) {
  const miniEl = document.getElementById('fimo-mini-cam-render');
  if (miniEl) {
    miniEl.innerHTML = CAM_SVG_ICONS[camId] || CAM_SVG_ICONS['default'];
  }
}

function updateFimoCaptionOverlay(camId = state.activeCamera) {
  const overlayEl = document.getElementById('fimo-caption-overlay');
  const textEl = document.getElementById('fimo-caption-text');
  const persona = FIMO_CAMERA_PERSONAS[camId];
  const captionStr = (persona && persona.captionText) ? persona.captionText : 'OUR TIMELESS MEMORY';
  if (textEl) {
    textEl.textContent = captionStr;
  }
  if (overlayEl) {
    overlayEl.style.display = state.fimoCaptionEnabled ? 'flex' : 'none';
  }
}
window.updateFimoCaptionOverlay = updateFimoCaptionOverlay;

function renderCameraBagGrid(filterCat = 'all', filterBrand = 'all') {
  const grid = document.getElementById('camera-bag-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const camList = FIMO_ORDERED_CAMERAS.filter(camId => {
    if (!CAMERAS[camId]) return false;
    if (filterBrand !== 'all') {
      const bKey = Object.keys(CAMERA_BRANDS).find(b => CAMERA_BRANDS[b].cams.includes(camId));
      if (bKey !== filterBrand) return false;
    }
    if (filterCat !== 'all') {
      return getCameraCategory(camId) === filterCat;
    }
    return true;
  });

  camList.forEach(camId => {
    const cam = CAMERAS[camId];
    const cat = getCameraCategory(camId);
    const isEquipped = state.activeCamera === camId;
    const persona = FIMO_CAMERA_PERSONAS[camId] || {
      personaName: cam.name,
      isNew: false,
      subtitle: cam.sub,
      heroImg: 'assets/hero/seoul_instc_hero.jpg',
      thumbs: ['assets/hero/thumb_cat1.jpg', 'assets/hero/thumb_cat2.jpg', 'assets/hero/thumb_cat3.jpg']
    };

    const card = document.createElement('div');
    card.className = `bag-cam-card ${isEquipped ? 'equipped' : ''}`;
    card.dataset.cam = camId;
    card.dataset.cat = cat;

    card.innerHTML = `
      <div class="card-hero-stage">
        ${persona.isNew ? '<span class="fimo-new-badge">N</span>' : ''}
        <div class="card-camera-render">
          ${CAM_SVG_ICONS[camId] || CAM_SVG_ICONS['default']}
        </div>
      </div>
      <div class="card-info-content">
        <div class="card-title">${persona.personaName}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      soundEngine.playMount();
      switchCamera(camId);
      updateFimoHeroCard(camId);
      closeCameraBagModal();
    });

    grid.appendChild(card);
  });
}

function initFimoUI() {
  // 1. Right Edge Floating Drawer Tab on Viewfinder (‹)
  const vfDrawerTab = document.getElementById('fimo-vf-drawer-tab');
  if (vfDrawerTab) {
    vfDrawerTab.addEventListener('click', (e) => {
      e.stopPropagation();
      openCameraBagModal();
    });
  }

  // 2. Floating Viewfinder Back Button in Selector (📷)
  const btnBackVf = document.getElementById('btn-fimo-back-vf');
  if (btnBackVf) {
    btnBackVf.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCameraBagModal();
    });
  }

  // 3. Floating Apply Filter Pill Button (🎞 필터 입히기)
  const btnApplyFilter = document.getElementById('btn-fimo-apply-filter');
  const userPhotoUpload = document.getElementById('user-photo-upload');
  if (btnApplyFilter && userPhotoUpload) {
    btnApplyFilter.addEventListener('click', (e) => {
      e.stopPropagation();
      userPhotoUpload.click();
    });
  }

  // 4. Viewfinder Status Line Toggles (날짜 ON / 사진 문구 OFF)
  const toggleDate = document.getElementById('fimo-toggle-date');
  if (toggleDate) {
    toggleDate.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEngine.playTick();
      state.fimoDateEnabled = !state.fimoDateEnabled;
      toggleDate.classList.toggle('active', state.fimoDateEnabled);
      toggleDate.innerHTML = `날짜 <b class="${state.fimoDateEnabled ? 'fimo-val-on' : 'fimo-val-off'}">${state.fimoDateEnabled ? 'ON' : 'OFF'}</b>`;
      const dateOverlay = document.getElementById('date-stamp');
      if (dateOverlay) {
        dateOverlay.style.display = state.fimoDateEnabled ? 'block' : 'none';
      }
      showDynamicIslandBanner('DATE STAMP', state.fimoDateEnabled ? 'ENABLED' : 'DISABLED', 1200);
    });
  }

  const toggleCaption = document.getElementById('fimo-toggle-caption');
  if (toggleCaption) {
    toggleCaption.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEngine.playTick();
      state.fimoCaptionEnabled = !state.fimoCaptionEnabled;
      toggleCaption.classList.toggle('active', state.fimoCaptionEnabled);
      toggleCaption.innerHTML = `사진 문구 <b class="${state.fimoCaptionEnabled ? 'fimo-val-on' : 'fimo-val-off'}">${state.fimoCaptionEnabled ? 'ON' : 'OFF'}</b>`;
      updateFimoCaptionOverlay(state.activeCamera);
      showDynamicIslandBanner('PHOTO CAPTION', state.fimoCaptionEnabled ? 'ON' : 'OFF', 1200);
    });
  }

  // 5. Tactile Zoom Ruler Deck (Continuous Drag, Pinch-to-Zoom, Mouse Wheel & Discrete Stops)
  const zoomDeck = document.getElementById('fimo-zoom-ruler-deck');
  const zoomTrack = document.getElementById('fimo-zoom-ruler-track');
  const zoomTicks = document.querySelectorAll('.fimo-tick-stop');
  const zoomMag = document.getElementById('fimo-zoom-mag');
  const zoomFocal = document.getElementById('fimo-zoom-focal');
  const rulerPointer = document.querySelector('.fimo-ruler-pointer');
  const videoMedia = document.getElementById('camera-video');
  const modelMedia = document.getElementById('model-canvas');
  const dynamicCanvas = document.getElementById('lens-dynamic-canvas');
  const vfContainer = document.getElementById('viewfinder');

  let lastTickSoundZoom = 1.0;

  function applyZoom(zoom, options = {}) {
    const { animate = false, showBanner = true, playSound = false } = options;
    const clampedZoom = Math.max(1.0, Math.min(5.0, Math.round(zoom * 10) / 10));
    state.fimoZoomLevel = clampedZoom;

    // Focal length calculation based on 23.5mm base sensor: at 2.1x gives exactly 49mm (reference app!)
    const focalMm = Math.round(23.5 * clampedZoom);

    // Update readout
    if (zoomMag) zoomMag.textContent = `${clampedZoom.toFixed(1)}x`;
    if (zoomFocal) zoomFocal.textContent = `· ${focalMm}mm`;

    // Map clampedZoom (1.0 to 5.0) to track horizontal percentage (8% to 94%)
    const ratio = (clampedZoom - 1.0) / (5.0 - 1.0);
    const pointerPercent = 8 + ratio * 86;
    if (rulerPointer) {
      rulerPointer.style.transition = animate ? 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
      rulerPointer.style.left = `${pointerPercent}%`;
    }

    // Highlight nearest tick stop
    zoomTicks.forEach(tick => {
      const zVal = parseFloat(tick.dataset.zoom || '1.0');
      const isNear = Math.abs(zVal - clampedZoom) < 0.22;
      tick.classList.toggle('active', isNear);
    });

    // Viewfinder media scale transform
    const scaleStr = `scale(${clampedZoom})`;
    const transStr = animate ? 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    [videoMedia, modelMedia, dynamicCanvas].forEach(el => {
      if (el) {
        el.style.transition = transStr;
        el.style.transform = scaleStr;
      }
    });

    // Haptic tick audio on every 0.2x change
    if (playSound || Math.abs(clampedZoom - lastTickSoundZoom) >= 0.2) {
      soundEngine.playTick();
      lastTickSoundZoom = clampedZoom;
    }

    // Dynamic Island banner
    if (showBanner) {
      showDynamicIslandBanner('ZOOM', `${clampedZoom.toFixed(1)}x (${focalMm}mm)`, 800);
    }
  }

  // A. Discrete tick stops click
  zoomTicks.forEach(tick => {
    tick.addEventListener('click', (e) => {
      e.stopPropagation();
      const zVal = parseFloat(tick.dataset.zoom || '1.0');
      applyZoom(zVal, { animate: true, showBanner: true, playSound: true });
    });
  });

  // B. Continuous Drag on Track / Ruler
  if (zoomTrack) {
    let isDraggingZoom = false;

    const handleZoomPointer = (e) => {
      const rect = zoomTrack.getBoundingClientRect();
      if (!rect.width) return;
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const ratio = x / rect.width;
      const targetZoom = 1.0 + ratio * (5.0 - 1.0);
      applyZoom(targetZoom, { animate: false, showBanner: false, playSound: false });
    };

    zoomTrack.addEventListener('pointerdown', (e) => {
      isDraggingZoom = true;
      zoomTrack.setPointerCapture(e.pointerId);
      handleZoomPointer(e);
    });

    zoomTrack.addEventListener('pointermove', (e) => {
      if (isDraggingZoom) {
        handleZoomPointer(e);
      }
    });

    const endZoomDrag = (e) => {
      if (isDraggingZoom) {
        isDraggingZoom = false;
        try { zoomTrack.releasePointerCapture(e.pointerId); } catch(err) {}
        const focalMm = Math.round(23.5 * state.fimoZoomLevel);
        showDynamicIslandBanner('ZOOM', `${state.fimoZoomLevel.toFixed(1)}x (${focalMm}mm)`, 900);
        soundEngine.playTick();
      }
    };

    zoomTrack.addEventListener('pointerup', endZoomDrag);
    zoomTrack.addEventListener('pointercancel', endZoomDrag);
  }

  // C. Viewfinder Pinch-to-Zoom Gesture
  if (vfContainer) {
    let initialTouchDist = null;
    let initialZoom = 1.0;

    vfContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        initialTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoom = state.fimoZoomLevel;
      }
    }, { passive: true });

    vfContainer.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialTouchDist) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = currentDist / initialTouchDist;
        applyZoom(initialZoom * factor, { animate: false, showBanner: false });
      }
    }, { passive: true });

    vfContainer.addEventListener('touchend', (e) => {
      if (e.touches.length < 2 && initialTouchDist) {
        initialTouchDist = null;
        const focalMm = Math.round(23.5 * state.fimoZoomLevel);
        showDynamicIslandBanner('ZOOM', `${state.fimoZoomLevel.toFixed(1)}x (${focalMm}mm)`, 900);
      }
    }, { passive: true });

    // D. Viewfinder Mouse Wheel Zoom
    vfContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.003;
      applyZoom(state.fimoZoomLevel + delta, { animate: false, showBanner: false });
    }, { passive: false });
  }

  if (zoomDeck) {
    zoomDeck.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.003;
      applyZoom(state.fimoZoomLevel + delta, { animate: false, showBanner: false });
    }, { passive: false });
  }

  // Expose global helper
  window.setFimoZoom = (z) => applyZoom(z, { animate: true, showBanner: true, playSound: true });

  // 5.5. Curved Exposure Arc Wheel & EV Compensation (-2.0 to +2.0 EV)
  const expArcWheel = document.getElementById('fimo-exposure-arc-wheel');
  const expTopValEl = document.getElementById('fimo-exp-top-val');
  const expBotValEl = document.getElementById('fimo-exp-bot-val');
  const evSteps = [-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5];

  function applyExposureEV(ev, options = {}) {
    const { showBanner = true, playSound = true } = options;
    const clampedEV = Math.max(-2.0, Math.min(2.0, Math.round(ev * 2) / 2));
    state.fimoExposureEV = clampedEV;

    // Map EV (-2.0..+2.0) to vintage arc dial numbers (3..7 where 0.0 EV = 5 / 4)
    const dialTopNum = Math.round(5 + clampedEV * 2);
    const dialBotNum = dialTopNum - 1;
    if (expTopValEl) expTopValEl.textContent = String(dialTopNum);
    if (expBotValEl) expBotValEl.textContent = String(dialBotNum);

    applyCurrentCameraFilter();

    if (playSound) soundEngine.playTick();
    if (showBanner) {
      const sign = clampedEV > 0 ? '+' : '';
      showDynamicIslandBanner('EXPOSURE', `EV ${sign}${clampedEV.toFixed(1)} (DIAL ${dialTopNum}/${dialBotNum})`, 1000);
    }
  }

  window.setFimoExposureEV = (ev) => applyExposureEV(ev, { showBanner: true, playSound: true });

  const cycleExposureEV = () => {
    const curIdx = evSteps.findIndex(v => Math.abs(v - state.fimoExposureEV) < 0.1);
    const nextIdx = curIdx === -1 ? 3 : (curIdx + 1) % evSteps.length;
    applyExposureEV(evSteps[nextIdx], { showBanner: true, playSound: true });
  };

  if (expArcWheel) {
    expArcWheel.addEventListener('click', (e) => {
      e.stopPropagation();
      cycleExposureEV();
    });
    expArcWheel.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const step = e.deltaY < 0 ? 0.5 : -0.5;
      applyExposureEV(state.fimoExposureEV + step, { showBanner: true, playSound: true });
    }, { passive: false });
  }

  // 6. 4 Hardware Round Buttons
  const hwMore = document.getElementById('fimo-hw-more');
  if (hwMore) {
    hwMore.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEngine.playTick();
      const popover = document.getElementById('lens-filter-popover');
      if (popover) popover.classList.toggle('open');
    });
  }

  const hwFlash = document.getElementById('fimo-hw-flash');
  if (hwFlash) {
    hwFlash.addEventListener('click', (e) => {
      e.stopPropagation();
      const btnFlash = document.getElementById('btn-flash');
      if (btnFlash) btnFlash.click();
    });
  }

  const hwExp = document.getElementById('fimo-hw-exp');
  if (hwExp) {
    hwExp.addEventListener('click', (e) => {
      e.stopPropagation();
      cycleExposureEV();
    });
  }

  const hwFlip = document.getElementById('fimo-hw-flip');
  if (hwFlip) {
    hwFlip.addEventListener('click', (e) => {
      e.stopPropagation();
      const btnFlip = document.getElementById('btn-flip');
      if (btnFlip) btnFlip.click();
    });
  }

  // 7. Shutter Capsule Photo/Video Mode Buttons
  const btnModePhoto = document.getElementById('fimo-mode-photo');
  const btnModeVideo = document.getElementById('fimo-mode-video');
  if (btnModePhoto && btnModeVideo) {
    btnModePhoto.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEngine.playTick();
      btnModePhoto.classList.add('active');
      btnModeVideo.classList.remove('active');
      showDynamicIslandBanner('MODE', 'STILL PHOTO', 1000);
    });
    btnModeVideo.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEngine.playTick();
      btnModeVideo.classList.add('active');
      btnModePhoto.classList.remove('active');
      showDynamicIslandBanner('MODE', 'VIDEO QUICKTAKE', 1000);
    });
  }

  // 8. Bottom iOS Tab Bar
  const tabDrop = document.getElementById('fimo-tab-drop');
  const tabMuseum = document.getElementById('fimo-tab-museum');
  const tabCamera = document.getElementById('fimo-tab-camera');
  const tabMy = document.getElementById('fimo-tab-my');

  if (tabDrop) tabDrop.addEventListener('click', () => openGalleryModal());
  if (tabMuseum) tabMuseum.addEventListener('click', () => openGalleryModal());
  if (tabCamera) tabCamera.addEventListener('click', () => {
    soundEngine.playTick();
    const modal = document.getElementById('camera-bag-modal');
    if (modal && modal.classList.contains('open')) {
      closeCameraBagModal();
    } else {
      openCameraBagModal();
    }
  });
  if (tabMy) tabMy.addEventListener('click', () => openGalleryModal());

  // Initial Sync
  updateFimoHeroCard(state.activeCamera);
  updateFimoMiniCamRender(state.activeCamera);
  updateFimoCaptionOverlay(state.activeCamera);
}

function initCameraBagModal() {
  const btnBagTop = document.getElementById('btn-camera-bag');
  if (btnBagTop) btnBagTop.addEventListener('click', openCameraBagModal);

  const btnBagBottom = document.getElementById('bottom-camera-bag-btn');
  if (btnBagBottom) btnBagBottom.addEventListener('click', openCameraBagModal);

  const btnCatBag = document.getElementById('cat-bar-bag-btn');
  if (btnCatBag) btnCatBag.addEventListener('click', openCameraBagModal);

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

  // Category Filter in Camera Bag (Preserved for tests & category sorting)
  document.querySelectorAll('#bag-category-filter .bag-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundEngine.playTick();
      document.querySelectorAll('#bag-category-filter .bag-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Reset brand buttons to 'all' so category view shows all cameras in that category
      document.querySelectorAll('#bag-brand-filter .bag-brand-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.brand === 'all');
      });
      renderCameraBagGrid(btn.dataset.cat, 'all');
    });
  });

  // Brand Filter in Camera Bag (Direct Brand selection)
  document.querySelectorAll('#bag-brand-filter .bag-brand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      soundEngine.playTick();
      document.querySelectorAll('#bag-brand-filter .bag-brand-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Reset category buttons to 'all' so brand view shows all cameras of this brand
      document.querySelectorAll('#bag-category-filter .bag-cat-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === 'all');
      });
      renderCameraBagGrid('all', btn.dataset.brand);
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

  // Viewfinder Quick Filter Steppers & Tap Pill Trigger
  const btnFilterPrev = document.getElementById('btn-vf-filter-prev');
  if (btnFilterPrev) btnFilterPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    switchPrevFilter();
  });

  const btnFilterNext = document.getElementById('btn-vf-filter-next');
  if (btnFilterNext) btnFilterNext.addEventListener('click', (e) => {
    e.stopPropagation();
    switchNextFilter();
  });

  const filterCenterBadge = document.getElementById('vf-filter-center-badge');
  if (filterCenterBadge) filterCenterBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    switchNextFilter();
  });
}

// Elastic iOS-Style Rubber-Band Bounding Physics for Filter Carousels
function initCarouselElasticPhysics() {
  document.querySelectorAll('.filter-carousel').forEach(carousel => {
    let isDragging = false;
    let startX = 0;
    let isOverbound = false;

    carousel.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      isDragging = false;
      isOverbound = false;
      carousel.style.transition = 'none';
      carousel.style.scrollBehavior = 'auto';
    });

    const onPointerMove = (e) => {
      const dx = e.clientX - startX;
      if (!isDragging && Math.abs(dx) > 6) {
        isDragging = true;
      }
      if (!isDragging) return;
      const currentScroll = carousel.scrollLeft;
      const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);

      if (currentScroll <= 0 && dx > 0) {
        // Elastic Rubber Banding past left edge
        isOverbound = true;
        const bounce = Math.pow(dx, 0.72) * 0.45;
        carousel.style.transform = `translateX(${bounce}px)`;
        carousel.classList.add('bouncing-left');
      } else if (currentScroll >= maxScroll - 1 && dx < 0) {
        // Elastic Rubber Banding past right edge
        isOverbound = true;
        const bounce = -Math.pow(Math.abs(dx), 0.72) * 0.45;
        carousel.style.transform = `translateX(${bounce}px)`;
        carousel.classList.add('bouncing-right');
      } else {
        if (isOverbound) {
          carousel.style.transform = 'translateX(0px)';
          carousel.classList.remove('bouncing-left', 'bouncing-right');
          isOverbound = false;
        }
      }
    };

    const onPointerEnd = () => {
      if (!isDragging && !isOverbound) return;
      isDragging = false;
      if (isOverbound) {
        carousel.style.transition = 'transform 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        carousel.style.transform = 'translateX(0px)';
        carousel.classList.remove('bouncing-left', 'bouncing-right');
        setTimeout(() => {
          carousel.style.transition = '';
          carousel.style.scrollBehavior = '';
        }, 420);
      }
    };

    carousel.addEventListener('pointermove', onPointerMove);
    carousel.addEventListener('pointerup', onPointerEnd);
    carousel.addEventListener('pointercancel', onPointerEnd);
    carousel.addEventListener('pointerleave', onPointerEnd);

    // Trackpad / Horizontal Wheel Elastic Bounce
    let wheelTimeout = null;
    carousel.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > 0) {
        const atLeft = carousel.scrollLeft <= 0 && e.deltaX < 0;
        const atRight = carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth - 1) && e.deltaX > 0;
        if (atLeft || atRight) {
          const sign = atLeft ? 1 : -1;
          const bounceAmt = Math.min(20, Math.pow(Math.abs(e.deltaX), 0.6) * 2.5) * sign;
          carousel.style.transition = 'transform 0.12s ease-out';
          carousel.style.transform = `translateX(${bounceAmt}px)`;
          clearTimeout(wheelTimeout);
          wheelTimeout = setTimeout(() => {
            carousel.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            carousel.style.transform = 'translateX(0px)';
          }, 120);
        }
      }
    }, { passive: true });
  });
}

// Tactile Rotary Camera Switcher Dial with Horizontal Drag, Inertia & Centering
function initSmoothModeDial() {
  const wrapper = document.getElementById('mode-dial-wrapper');
  const dialList = document.getElementById('mode-dial-list');
  if (!wrapper || !dialList) return;

  const items = Array.from(dialList.querySelectorAll('.mode-dial-item'));
  if (items.length === 0) return;

  let isDragging = false;
  let startX = 0;
  let currentTranslateX = 0;
  let startTranslateX = 0;
  let lastMoveTime = 0;
  let lastMoveX = 0;
  let velocity = 0;
  let activeCamId = state.activeCamera || 'canon-ixy';

  function getCenterOffset(item) {
    const wrapperW = wrapper.offsetWidth;
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    return (wrapperW / 2) - itemCenter;
  }

  function updateDialVisuals(currentOffset) {
    const wrapperCenter = wrapper.offsetWidth / 2;
    let closestItem = null;
    let closestDist = Infinity;

    items.forEach(item => {
      const itemVisualCenter = item.offsetLeft + item.offsetWidth / 2 + currentOffset;
      const dist = Math.abs(wrapperCenter - itemVisualCenter);

      if (dist < closestDist) {
        closestDist = dist;
        closestItem = item;
      }

      // 3D perspective / distance curve
      const normDist = Math.min(1, dist / 140);
      const scale = 1.12 - normDist * 0.22;
      const opacity = 1.0 - normDist * 0.65;

      item.style.transform = `scale(${scale.toFixed(3)})`;
      item.style.opacity = opacity.toFixed(3);
    });

    return closestItem;
  }

  window.alignModeDial = function(camId, smooth = true) {
    const targetItem = dialList.querySelector(`.mode-dial-item[data-cam="${camId}"]`);
    if (!targetItem) return;

    items.forEach(it => it.classList.toggle('active', it.dataset.cam === camId));
    const targetOffset = getCenterOffset(targetItem);
    currentTranslateX = targetOffset;

    dialList.style.transition = smooth ? 'transform 0.36s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none';
    dialList.style.transform = `translateX(${targetOffset}px)`;
    updateDialVisuals(targetOffset);
  };

  // Drag Interactions
  wrapper.addEventListener('pointerdown', (e) => {
    isDragging = false;
    startX = e.clientX;
    lastMoveX = e.clientX;
    lastMoveTime = Date.now();
    velocity = 0;
    dialList.style.transition = 'none';

    const style = window.getComputedStyle(dialList);
    const matrix = new WebKitCSSMatrix(style.transform);
    startTranslateX = matrix.m41;
    currentTranslateX = startTranslateX;
  });

  wrapper.addEventListener('pointermove', (e) => {
    const dx = e.clientX - startX;
    if (!isDragging && Math.abs(dx) > 6) {
      isDragging = true;
      wrapper.setPointerCapture?.(e.pointerId);
    }
    if (!isDragging) return;

    const now = Date.now();
    const dt = now - lastMoveTime;
    if (dt > 0) {
      velocity = (e.clientX - lastMoveX) / dt;
    }
    lastMoveX = e.clientX;
    lastMoveTime = now;

    currentTranslateX = startTranslateX + dx;
    dialList.style.transform = `translateX(${currentTranslateX}px)`;

    const centered = updateDialVisuals(currentTranslateX);
    if (centered && centered.dataset.cam !== activeCamId) {
      activeCamId = centered.dataset.cam;
      soundEngine.playTick();
      items.forEach(it => it.classList.toggle('active', it === centered));
    }
  });

  const onPointerEnd = (e) => {
    if (wrapper.hasPointerCapture?.(e.pointerId)) {
      try { wrapper.releasePointerCapture(e.pointerId); } catch(err) {}
    }

    const totalDist = Math.abs(e.clientX - startX);
    if (!isDragging || totalDist < 6) {
      isDragging = false;
      const targetItem = e.target.closest('.mode-dial-item');
      if (targetItem && targetItem.dataset.cam) {
        switchCamera(targetItem.dataset.cam);
        return;
      }
    }
    isDragging = false;

    const inertiaDist = velocity * 100;
    const targetTranslate = currentTranslateX + inertiaDist;

    const wrapperCenter = wrapper.offsetWidth / 2;
    let bestItem = items[0];
    let minD = Infinity;

    items.forEach(item => {
      const itemVisualCenter = item.offsetLeft + item.offsetWidth / 2 + targetTranslate;
      const d = Math.abs(wrapperCenter - itemVisualCenter);
      if (d < minD) {
        minD = d;
        bestItem = item;
      }
    });

    const targetOffset = getCenterOffset(bestItem);
    currentTranslateX = targetOffset;

    dialList.style.transition = 'transform 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    dialList.style.transform = `translateX(${targetOffset}px)`;
    updateDialVisuals(targetOffset);

    if (bestItem.dataset.cam !== state.activeCamera) {
      switchCamera(bestItem.dataset.cam);
    }
  };

  wrapper.addEventListener('pointerup', onPointerEnd);
  wrapper.addEventListener('pointercancel', onPointerEnd);

  // Wheel / Trackpad scroll support
  wrapper.addEventListener('wheel', (e) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 4) return;
    e.preventDefault();

    const curIdx = items.findIndex(it => it.dataset.cam === state.activeCamera);
    if (delta > 0 && curIdx < items.length - 1) {
      switchCamera(items[curIdx + 1].dataset.cam);
    } else if (delta < 0 && curIdx > 0) {
      switchCamera(items[curIdx - 1].dataset.cam);
    }
  }, { passive: false });

  // Initial alignment
  setTimeout(() => {
    if (window.alignModeDial) {
      window.alignModeDial(state.activeCamera || 'canon-ixy', false);
    }
  }, 100);
}

// ==========================================================================
// 6. Event Listeners & Bootstrapping
// ==========================================================================

function initEventListeners() {
  // 1. Bottom Camera Switcher Dial items & Edge Cues
  document.querySelectorAll('#mode-dial-list .mode-dial-item').forEach(item => {
    const handleSwitch = (e) => {
      e.stopPropagation();
      switchCamera(item.dataset.cam);
    };
    item.addEventListener('click', handleSwitch);
    item.addEventListener('touchend', handleSwitch, { passive: true });
  });

  const cuePrev = document.getElementById('btn-dial-cue-prev');
  const cueNext = document.getElementById('btn-dial-cue-next');
  if (cuePrev) {
    cuePrev.addEventListener('pointerdown', (e) => e.stopPropagation());
    cuePrev.addEventListener('click', (e) => {
      e.stopPropagation();
      switchPrevCamera();
    });
  }
  if (cueNext) {
    cueNext.addEventListener('pointerdown', (e) => e.stopPropagation());
    cueNext.addEventListener('click', (e) => {
      e.stopPropagation();
      switchNextCamera();
    });
  }

  // 2. Left Sidebar Camera Rack Buttons
  document.querySelectorAll('.panel-modes .panel-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchCamera(btn.dataset.cam));
  });

  // 3. Ergonomic Multi-Camera Systems (Swipe, Steppers, Category Jump, Visual Bag, Smooth Dial)
  initViewfinderSwipe();
  initCameraCategoryBar();
  initCameraBagModal();
  initCarouselElasticPhysics();
  initSmoothModeDial();

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
    let chipTouchMoved = false;
    let chipStartX = 0;
    let chipStartY = 0;

    chip.addEventListener('touchstart', (e) => {
      chipTouchMoved = false;
      chipStartX = e.touches[0].clientX;
      chipStartY = e.touches[0].clientY;
    }, { passive: true });

    chip.addEventListener('touchmove', (e) => {
      const dx = Math.abs(e.touches[0].clientX - chipStartX);
      const dy = Math.abs(e.touches[0].clientY - chipStartY);
      if (dx > 8 || dy > 8) chipTouchMoved = true;
    }, { passive: true });

    chip.addEventListener('touchend', (e) => {
      if (!chipTouchMoved) {
        e.stopPropagation();
        const filterKey = chip.dataset.filter;
        if (filterKey) selectCameraFilter(filterKey);
      }
    }, { passive: true });

    chip.addEventListener('click', (e) => {
      const filterKey = chip.dataset.filter;
      if (filterKey) selectCameraFilter(filterKey);
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

  // Fuji QuickSnap Mechanical Film Advance Thumb Wheel
  const windWheel = document.getElementById('quicksnap-wind-wheel');
  let quicksnapCurrentExp = 24;
  let windWheelRotation = 0;

  if (windWheel) {
    const triggerWind = () => {
      windWheelRotation += 45;
      const teeth = windWheel.querySelector('.wind-wheel-teeth');
      if (teeth) {
        teeth.style.transform = `rotate(${windWheelRotation}deg)`;
        teeth.classList.add('rotating');
        setTimeout(() => teeth.classList.remove('rotating'), 240);
      }
      soundEngine.playRatchetWind();
      quicksnapCurrentExp = Math.min(27, quicksnapCurrentExp + 1);
      const counterEl = document.querySelector('#quicksnap-osd .quicksnap-frame-counter');
      if (counterEl) {
        counterEl.textContent = `EXP [ ${quicksnapCurrentExp} / 27 ]`;
      }
      showDynamicIslandBanner('写ルンです', `WOUND EXP ${quicksnapCurrentExp}/27 (준비완료)`, 1400);
    };

    windWheel.addEventListener('click', triggerWind);
    let touchStartY = 0;
    windWheel.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    windWheel.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      if (touchEndY - touchStartY > 8 || Math.abs(touchEndY - touchStartY) < 10) {
        triggerWind();
      }
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
    const item = state.gallery[0] || (state.lastCapturedUrl ? {
      dataUrl: state.lastCapturedUrl,
      cameraKey: state.activeCamera,
      cameraName: CAMERAS[state.activeCamera]?.name || 'iCam',
      filterName: 'Standard Pass'
    } : null);
    if (item) {
      saveOrSharePhoto(item);
    }
  };
  if (btnSave1) btnSave1.addEventListener('click', handleDownloadPhoto);
  if (btnSave2) btnSave2.addEventListener('click', handleDownloadPhoto);

  // Close modals when clicking outside dialog on the dark backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
        soundEngine.playTick();
      }
    });
  });

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
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      switchPrevFilter();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      switchNextFilter();
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
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      toggleOrientation();
    }
  });
}

function toggleOrientation() {
  const next = state.orientation === 'landscape' ? 'portrait' : 'landscape';
  setOrientation(next);
}

// ==========================================================================
// 8.1 Device & Hardware Detector (Standard Web APIs)
// ==========================================================================
const DeviceDetector = window.DeviceDetector = {
  getInfo() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const dpr = window.devicePixelRatio || 1;
    const screenW = window.screen ? window.screen.width : window.innerWidth;
    const screenH = window.screen ? window.screen.height : window.innerHeight;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    let os = 'Unknown OS';
    let deviceCategory = 'Desktop';
    let brand = 'Device';

    if (/iPad|Macintosh/i.test(ua) && isTouch && navigator.maxTouchPoints > 1) {
      os = 'iPadOS';
      deviceCategory = 'Tablet';
      brand = 'Apple iPad';
    } else if (/iPhone/i.test(ua)) {
      os = 'iOS';
      deviceCategory = 'Mobile';
      brand = 'Apple iPhone';
    } else if (/Android/i.test(ua)) {
      os = 'Android';
      deviceCategory = /Tablet|SM-T/i.test(ua) ? 'Tablet' : 'Mobile';
      if (/SM-|SAMSUNG/i.test(ua)) {
        brand = 'Galaxy S24 / Tab';
      } else if (/Pixel/i.test(ua)) {
        brand = 'Google Pixel';
      } else {
        brand = 'Android Device';
      }
    } else if (/Mac/i.test(platform) || /Macintosh/i.test(ua)) {
      os = 'macOS';
      deviceCategory = 'Desktop';
      brand = 'Apple Mac';
    } else if (/Win/i.test(platform) || /Windows/i.test(ua)) {
      os = 'Windows';
      deviceCategory = 'Desktop';
      brand = 'Windows PC';
    } else if (/Linux/i.test(platform) || /Linux/i.test(ua)) {
      os = 'Linux';
      deviceCategory = 'Desktop';
      brand = 'Linux PC';
    }

    const isLandscape = (screen.orientation && screen.orientation.type)
      ? screen.orientation.type.startsWith('landscape')
      : (window.innerWidth > window.innerHeight);
    const orientation = isLandscape ? '가로 (Landscape)' : '세로 (Portrait)';

    return {
      os,
      deviceCategory,
      brand,
      isTouch,
      maxTouchPoints: navigator.maxTouchPoints || (isTouch ? 1 : 0),
      dpr: Math.round(dpr * 10) / 10,
      screenWidth: screenW,
      screenHeight: screenH,
      viewportWidth: viewW,
      viewportHeight: viewH,
      orientation,
      isLandscape
    };
  },

  updateHUD() {
    const info = this.getInfo();
    const hudBrand = document.getElementById('hud-device-brand');
    const hudResolution = document.getElementById('hud-screen-resolution');
    const hudViewport = document.getElementById('hud-live-viewport');
    const hudTouch = document.getElementById('hud-touch-support');
    const hudOrient = document.getElementById('hud-live-orientation');

    if (hudBrand) hudBrand.textContent = `${info.brand} (${info.os})`;
    if (hudResolution) hudResolution.textContent = `${info.screenWidth}×${info.screenHeight} (${info.dpr}x DPR)`;
    if (hudViewport) hudViewport.textContent = `${info.viewportWidth} × ${info.viewportHeight} pt`;
    if (hudTouch) hudTouch.textContent = info.isTouch ? `터치스크린 (${info.maxTouchPoints}pt)` : '정밀 마우스 / 포인터';
    if (hudOrient) hudOrient.textContent = info.orientation;

    // Modal HUD Sync
    const mHudBrand = document.getElementById('modal-hud-device-brand');
    const mHudResolution = document.getElementById('modal-hud-resolution');
    const mHudViewport = document.getElementById('modal-hud-viewport');
    const mHudTouch = document.getElementById('modal-hud-touch');
    const mHudOrient = document.getElementById('modal-hud-orientation');

    if (mHudBrand) mHudBrand.textContent = `${info.brand} (${info.os})`;
    if (mHudResolution) mHudResolution.textContent = `${info.screenWidth}×${info.screenHeight} (${info.dpr}x DPR)`;
    if (mHudViewport) mHudViewport.textContent = `${info.viewportWidth} × ${info.viewportHeight} pt`;
    if (mHudTouch) mHudTouch.textContent = info.isTouch ? `지원 (${info.maxTouchPoints}pt)` : '미지원 (마우스)';
    if (mHudOrient) mHudOrient.textContent = info.orientation;
  }
};

function updateViewportDimensionDisplay() {
  const dimDisplay = document.getElementById('active-viewport-dim');
  if (!dimDisplay) return;

  const activeDevBtn = document.querySelector('.device-select-btn.active');
  const dev = activeDevBtn ? activeDevBtn.dataset.device : 'standard';

  if (dev === 'fluid' || document.body.classList.contains('is-fluid-fullscreen')) {
    dimDisplay.textContent = `${window.innerWidth} × ${window.innerHeight} pt (100% 맞춤)`;
    return;
  }

  const rawW = activeDevBtn ? parseInt(activeDevBtn.dataset.width, 10) : 393;
  const rawH = activeDevBtn ? parseInt(activeDevBtn.dataset.height, 10) : 852;

  if (state.orientation === 'landscape') {
    const w = Math.max(rawW, rawH);
    const h = Math.min(rawW, rawH);
    dimDisplay.textContent = `${w} × ${h} pt (가로)`;
  } else {
    const w = Math.min(rawW, rawH);
    const h = Math.max(rawW, rawH);
    dimDisplay.textContent = `${w} × ${h} pt`;
  }
}

function autoScaleDeviceFrame() {
  const deviceWrapper = document.querySelector('.device-wrapper');
  if (!deviceWrapper) return;

  if (deviceWrapper.classList.contains('device-fluid') || document.body.classList.contains('is-fluid-fullscreen') || document.body.classList.contains('native-fluid-mode')) {
    deviceWrapper.style.transform = '';
    return;
  }

  // Real mobile fullscreens
  if (window.innerWidth <= 600 || (window.innerWidth <= 852 && window.innerHeight <= 550)) {
    deviceWrapper.style.transform = '';
    return;
  }

  const isLandscape = deviceWrapper.classList.contains('orientation-landscape');
  let baseW = parseFloat(deviceWrapper.style.getPropertyValue('--device-width')) || 393;
  let baseH = parseFloat(deviceWrapper.style.getPropertyValue('--device-height')) || 852;

  const targetW = isLandscape ? Math.max(baseW, baseH) : Math.min(baseW, baseH);
  const targetH = isLandscape ? Math.min(baseW, baseH) : Math.max(baseW, baseH);

  const showcasePanel = document.querySelector('.showcase-panel');
  const isSidebarVisible = window.innerWidth > 1100 && showcasePanel && getComputedStyle(showcasePanel).display !== 'none';
  const availableW = isSidebarVisible ? (window.innerWidth - 380) : (window.innerWidth - 24);
  const availableH = window.innerHeight - 36;

  if (targetH > availableH || targetW > availableW) {
    const scale = Math.min(1, Math.min(availableH / targetH, availableW / targetW));
    deviceWrapper.style.transform = `scale(${scale.toFixed(3)})`;
    deviceWrapper.style.transformOrigin = 'center center';
  } else {
    deviceWrapper.style.transform = '';
  }
}

function setOrientation(orient) {
  state.orientation = orient;
  const deviceWrapper = document.querySelector('.device-wrapper');
  const cameraApp = document.querySelector('.camera-app');
  const orientBtns = document.querySelectorAll('.orientation-btn');

  orientBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.orientation === orient);
  });

  if (orient === 'landscape') {
    deviceWrapper?.classList.add('orientation-landscape');
    cameraApp?.classList.add('landscape-mode');
    soundEngine.playTick();
  } else {
    deviceWrapper?.classList.remove('orientation-landscape');
    cameraApp?.classList.remove('landscape-mode');
    soundEngine.playTick();
  }

  updateViewportDimensionDisplay();
  autoScaleDeviceFrame();
  DeviceDetector.updateHUD();
}

function selectDevicePreset(dev, w, h, r) {
  const deviceWrapper = document.querySelector('.device-wrapper');
  const deviceBtns = document.querySelectorAll('.device-select-btn');
  const modalDeviceBtns = document.querySelectorAll('.modal-device-card');

  deviceBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.device === dev);
  });
  modalDeviceBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.device === dev);
  });

  if (!deviceWrapper) return;

  // Clear all device classes
  deviceWrapper.classList.remove('device-se', 'device-mini', 'device-standard', 'device-max', 'device-galaxy', 'device-tablet', 'device-fold', 'device-fluid');

  if (dev === 'fluid') {
    deviceWrapper.classList.add('device-fluid');
    document.body.classList.add('is-fluid-fullscreen');
    deviceWrapper.style.removeProperty('--device-width');
    deviceWrapper.style.removeProperty('--device-height');
    deviceWrapper.style.removeProperty('--device-radius');
  } else {
    document.body.classList.remove('is-fluid-fullscreen');
    deviceWrapper.classList.add(`device-${dev}`);
    deviceWrapper.style.setProperty('--device-width', `${w}px`);
    deviceWrapper.style.setProperty('--device-height', `${h}px`);
    deviceWrapper.style.setProperty('--device-radius', `${r}px`);
  }

  // OS styling sync
  if (dev === 'galaxy' || dev === 'fold') {
    deviceWrapper.classList.remove('ios-16', 'ios-17', 'ios-18');
    deviceWrapper.classList.add('os-android');
  } else if (dev !== 'fluid') {
    deviceWrapper.classList.remove('os-android');
    deviceWrapper.classList.add('ios-18');
  }

  // Persist user selection
  try {
    localStorage.setItem('icam_device_preset', dev);
  } catch (e) {}

  updateViewportDimensionDisplay();
  autoScaleDeviceFrame();
  DeviceDetector.updateHUD();
}
window.autoScaleDeviceFrame = autoScaleDeviceFrame;
window.selectDevicePreset = selectDevicePreset;

function openDeviceSelectorModal() {
  soundEngine.playTick();
  const modal = document.getElementById('device-selector-modal');
  if (modal) {
    modal.classList.add('open');
    DeviceDetector.updateHUD();
  }
}

function closeDeviceSelectorModal() {
  soundEngine.playTick();
  const modal = document.getElementById('device-selector-modal');
  if (modal) modal.classList.remove('open');
}
window.openDeviceSelectorModal = openDeviceSelectorModal;
window.closeDeviceSelectorModal = closeDeviceSelectorModal;

// ==========================================================================
// 8. Device Tier & Cross-Platform Switcher
// ==========================================================================
function initDeviceAndOSSwitcher() {
  const deviceWrapper = document.querySelector('.device-wrapper');
  const deviceBtns = document.querySelectorAll('.device-select-btn');
  const modalDeviceBtns = document.querySelectorAll('.modal-device-card');
  const iosBtns = document.querySelectorAll('.ios-ver-btn');
  const orientBtns = document.querySelectorAll('.orientation-btn');

  // Sidebar preset buttons
  deviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const dev = btn.dataset.device;
      const w = btn.dataset.width;
      const h = btn.dataset.height;
      const r = btn.dataset.radius;
      selectDevicePreset(dev, w, h, r);
    });
  });

  // Modal preset buttons
  modalDeviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const dev = btn.dataset.device;
      const w = btn.dataset.width;
      const h = btn.dataset.height;
      const r = btn.dataset.radius;
      selectDevicePreset(dev, w, h, r);
      closeDeviceSelectorModal();
    });
  });

  // Modal triggers & close
  const btnFluidPicker = document.getElementById('btn-fluid-device-picker');
  if (btnFluidPicker) btnFluidPicker.addEventListener('click', openDeviceSelectorModal);

  const btnQuickDevices = document.getElementById('quickbar-devices-btn');
  if (btnQuickDevices) btnQuickDevices.addEventListener('click', openDeviceSelectorModal);

  const btnCloseDeviceModal = document.getElementById('btn-close-device-modal');
  if (btnCloseDeviceModal) btnCloseDeviceModal.addEventListener('click', closeDeviceSelectorModal);

  const deviceModal = document.getElementById('device-selector-modal');
  if (deviceModal) {
    deviceModal.addEventListener('click', (e) => {
      if (e.target === deviceModal) closeDeviceSelectorModal();
    });
  }

  const modalOrientBtn = document.getElementById('modal-btn-toggle-orient');
  if (modalOrientBtn) {
    modalOrientBtn.addEventListener('click', () => {
      toggleOrientation();
    });
  }

  // Quickbar extra buttons
  const btnQuickCambag = document.getElementById('quickbar-cambag-btn');
  if (btnQuickCambag) {
    btnQuickCambag.addEventListener('click', () => {
      openCameraBagModal();
    });
  }

  const btnQuickRotate = document.getElementById('quickbar-rotate-btn');
  if (btnQuickRotate) {
    btnQuickRotate.addEventListener('click', () => {
      toggleOrientation();
    });
  }

  const btnQuickGallery = document.getElementById('quickbar-gallery-btn');
  if (btnQuickGallery) {
    btnQuickGallery.addEventListener('click', () => {
      openGalleryModal();
    });
  }

  const btnExitFluid = document.getElementById('btn-exit-fluid');
  if (btnExitFluid) {
    btnExitFluid.addEventListener('click', () => {
      selectDevicePreset('standard', 393, 852, 54);
    });
  }

  iosBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      iosBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const ver = btn.dataset.ios;
      if (deviceWrapper) {
        deviceWrapper.classList.remove('ios-16', 'ios-17', 'ios-18', 'os-android');
        if (ver === 'android') {
          deviceWrapper.classList.add('os-android');
        } else {
          deviceWrapper.classList.add(`ios-${ver}`);
        }
      }
    });
  });

  orientBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setOrientation(btn.dataset.orientation);
    });
  });

  const btnRotate = document.getElementById('btn-rotate-orientation');
  if (btnRotate) {
    btnRotate.addEventListener('click', () => {
      toggleOrientation();
    });
  }

  // Auto-detect mobile device orientation changes
  if (window.screen && window.screen.orientation) {
    window.screen.orientation.addEventListener('change', () => {
      const type = window.screen.orientation.type;
      if (type.startsWith('landscape')) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    });
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > window.innerHeight && window.innerHeight <= 550) {
      if (state.orientation !== 'landscape') {
        setOrientation('landscape');
      }
    }
    updateViewportDimensionDisplay();
    autoScaleDeviceFrame();
    DeviceDetector.updateHUD();
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

  // Intelligent Hardware Auto-Adaptation on Initial Load
  const devInfo = DeviceDetector.getInfo();
  const isMobileScreen = window.innerWidth <= 600 || (devInfo.isTouch && window.innerWidth <= 852 && window.innerHeight <= 550) || (/iPhone|Android/i.test(navigator.userAgent) && window.innerWidth <= 768);

  let savedPreset = null;
  try {
    savedPreset = localStorage.getItem('icam_device_preset');
  } catch (e) {}

  if (isMobileScreen) {
    selectDevicePreset('fluid', 0, 0, 0);
    document.body.classList.add('native-mobile-device');
  } else if (savedPreset) {
    const btn = document.querySelector(`.device-select-btn[data-device="${savedPreset}"]`);
    if (btn) {
      selectDevicePreset(savedPreset, btn.dataset.width, btn.dataset.height, btn.dataset.radius);
    }
  } else {
    if (devInfo.deviceCategory === 'Tablet' && devInfo.isTouch) {
      selectDevicePreset('tablet', 768, 1024, 28);
      document.body.classList.add('native-tablet-device');
    } else if (devInfo.os === 'Android') {
      selectDevicePreset('galaxy', 412, 915, 40);
    }
  }

  // Initial HUD & scaling check
  DeviceDetector.updateHUD();
  autoScaleDeviceFrame();
}

// ==========================================================================
// 6.5. Pro Parametric Recipe & Tone Mixer Controller (Photographer Science)
// ==========================================================================

function openProRecipeModal() {
  const modal = document.getElementById('pro-recipe-modal');
  if (!modal) return;
  modal.classList.add('open');
  if (window.ParametricColorEngine) {
    syncProRecipeSlidersToUI(window.ParametricColorEngine.activeRecipe);
  }
}

function closeProRecipeModal() {
  const modal = document.getElementById('pro-recipe-modal');
  if (modal) modal.classList.remove('open');
}

function setSliderVal(sliderId, valId, value, fmt) {
  const slider = document.getElementById(sliderId);
  const valEl = document.getElementById(valId);
  if (slider) slider.value = value;
  if (valEl) valEl.textContent = fmt ? fmt(value) : value;
}

function syncProRecipeSlidersToUI(recipe) {
  if (!recipe) return;
  const t = recipe.tone || {};
  const c = recipe.color || {};
  const hsl = recipe.hsl || {};

  // Tone
  setSliderVal('slider-exposure', 'val-exposure', t.exposure !== undefined ? t.exposure : 1.23, (v) => (v >= 0 ? '+' : '') + Number(v).toFixed(2));
  setSliderVal('slider-contrast', 'val-contrast', t.contrast !== undefined ? t.contrast : -88, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-highlights', 'val-highlights', t.highlights !== undefined ? t.highlights : -100, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-shadows', 'val-shadows', t.shadows !== undefined ? t.shadows : 45, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-whites', 'val-whites', t.whites !== undefined ? t.whites : -89, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-blacks', 'val-blacks', t.blacks !== undefined ? t.blacks : 11, (v) => (v >= 0 ? '+' : '') + v);

  // Color
  setSliderVal('slider-temp', 'val-temp', c.temp !== undefined ? c.temp : 3, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-tint', 'val-tint', c.tint !== undefined ? c.tint : -9, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-vibrance', 'val-vibrance', c.vibrance !== undefined ? c.vibrance : 9, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-saturation', 'val-saturation', c.saturation !== undefined ? c.saturation : 6, (v) => (v >= 0 ? '+' : '') + v);

  // HSL
  const rRed = hsl.red || {};
  const rOrange = hsl.orange || {};
  const rYellow = hsl.yellow || {};
  const rGreen = hsl.green || {};

  setSliderVal('slider-hsl-red-sat', 'val-hsl-red-sat', rRed.sat !== undefined ? rRed.sat : 10, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-hsl-red-lum', 'val-hsl-red-lum', rRed.lum !== undefined ? rRed.lum : 16, (v) => (v >= 0 ? '+' : '') + v);

  setSliderVal('slider-hsl-orange-sat', 'val-hsl-orange-sat', rOrange.sat !== undefined ? rOrange.sat : -14, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-hsl-orange-lum', 'val-hsl-orange-lum', rOrange.lum !== undefined ? rOrange.lum : 11, (v) => (v >= 0 ? '+' : '') + v);

  setSliderVal('slider-hsl-yellow-sat', 'val-hsl-yellow-sat', rYellow.sat !== undefined ? rYellow.sat : 11, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-hsl-yellow-lum', 'val-hsl-yellow-lum', rYellow.lum !== undefined ? rYellow.lum : 12, (v) => (v >= 0 ? '+' : '') + v);

  setSliderVal('slider-hsl-green-hue', 'val-hsl-green-hue', rGreen.hue !== undefined ? rGreen.hue : 9, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-hsl-green-sat', 'val-hsl-green-sat', rGreen.sat !== undefined ? rGreen.sat : 6, (v) => (v >= 0 ? '+' : '') + v);
  setSliderVal('slider-hsl-green-lum', 'val-hsl-green-lum', rGreen.lum !== undefined ? rGreen.lum : 17, (v) => (v >= 0 ? '+' : '') + v);

  // Update preset chip active state
  document.querySelectorAll('.recipe-preset-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.preset === recipe.id);
  });

  updateRecipeHudUI();
}

function updateRecipeFromSliders() {
  if (!window.ParametricColorEngine) return;
  const current = window.ParametricColorEngine.activeRecipe || {};
  if (!current.tone) current.tone = {};
  if (!current.color) current.color = {};
  if (!current.hsl) current.hsl = {};

  const getNum = (id, def = 0) => {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) : def;
  };

  current.tone.exposure = getNum('slider-exposure', 1.23);
  current.tone.contrast = getNum('slider-contrast', -88);
  current.tone.highlights = getNum('slider-highlights', -100);
  current.tone.shadows = getNum('slider-shadows', 45);
  current.tone.whites = getNum('slider-whites', -89);
  current.tone.blacks = getNum('slider-blacks', 11);

  current.color.temp = getNum('slider-temp', 3);
  current.color.tint = getNum('slider-tint', -9);
  current.color.vibrance = getNum('slider-vibrance', 9);
  current.color.saturation = getNum('slider-saturation', 6);

  current.hsl.red = { hue: 0, sat: getNum('slider-hsl-red-sat', 10), lum: getNum('slider-hsl-red-lum', 16) };
  current.hsl.orange = { hue: 0, sat: getNum('slider-hsl-orange-sat', -14), lum: getNum('slider-hsl-orange-lum', 11) };
  current.hsl.yellow = { hue: 0, sat: getNum('slider-hsl-yellow-sat', 11), lum: getNum('slider-hsl-yellow-lum', 12) };
  current.hsl.green = { hue: getNum('slider-hsl-green-hue', 9), sat: getNum('slider-hsl-green-sat', 6), lum: getNum('slider-hsl-green-lum', 17) };

  state.isCustomRecipe = true;
  window.ParametricColorEngine.setRecipe(current);

  // Trigger live viewfinder update
  if (state.cameraSource === 'model') {
    const canvas = document.getElementById('model-canvas');
    if (canvas) renderStudioModel(canvas, state.retouchTone);
  } else {
    applyCurrentCameraFilter();
  }
  updateRecipeHudUI();
}

function updateRecipeHudUI() {
  const pill = document.getElementById('viewfinder-recipe-pill');
  const label = document.getElementById('vr-recipe-name');
  if (!pill || !label || !window.ParametricColorEngine) return;

  const rec = window.ParametricColorEngine.activeRecipe;
  if (!rec) return;

  const ev = (rec.tone?.exposure >= 0 ? '+' : '') + Number(rec.tone?.exposure || 0).toFixed(2);
  const ct = (rec.tone?.contrast >= 0 ? '+' : '') + (rec.tone?.contrast || 0);
  const name = rec.name || (state.isCustomRecipe ? '커스텀 조율 레시피' : '프로 레시피');
  label.textContent = `${name} (${ev} EV / ${ct} CONTRAST)`;
}

function setBeforeCompareMode(active) {
  state.isBeforeModeActive = active;
  const compareBtn1 = document.getElementById('btn-viewfinder-compare');
  const compareBtn2 = document.getElementById('btn-recipe-compare');
  if (compareBtn1) compareBtn1.classList.toggle('comparing', active);
  if (compareBtn2) compareBtn2.classList.toggle('comparing', active);

  const pill = document.getElementById('viewfinder-recipe-pill');
  const label = document.getElementById('vr-recipe-name');
  if (label && pill) {
    if (active) {
      label.textContent = '● [BEFORE] 원본 표준 센서 색감 (RAW 0.0)';
      label.style.color = '#f97316';
    } else {
      label.style.color = '#e2e8f0';
      updateRecipeHudUI();
    }
  }

  if (state.cameraSource === 'model') {
    const canvas = document.getElementById('model-canvas');
    if (canvas) renderStudioModel(canvas, state.retouchTone);
  }
  applyCurrentCameraFilter();
}

function initProRecipeUI() {
  const btnToggle = document.getElementById('btn-toggle-pro-recipe');
  const btnClose = document.getElementById('btn-close-recipe-modal');
  const btnApply = document.getElementById('btn-recipe-apply');
  const btnReset = document.getElementById('btn-recipe-reset');
  const btnCompareVf = document.getElementById('btn-viewfinder-compare');
  const btnCompareModal = document.getElementById('btn-recipe-compare');

  if (btnToggle) btnToggle.addEventListener('click', openProRecipeModal);
  if (btnClose) btnClose.addEventListener('click', closeProRecipeModal);
  if (btnApply) btnApply.addEventListener('click', closeProRecipeModal);

  // Reset to default active preset
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (window.ParametricColorEngine) {
        const activeChip = document.querySelector('.recipe-preset-chip.active');
        const presetId = activeChip ? activeChip.dataset.preset : 'donggi-summer';
        const rec = window.ParametricColorEngine.resetToPreset(presetId);
        state.isCustomRecipe = false;
        syncProRecipeSlidersToUI(rec);
        if (state.cameraSource === 'model') {
          const canvas = document.getElementById('model-canvas');
          if (canvas) renderStudioModel(canvas, state.retouchTone);
        } else {
          applyCurrentCameraFilter();
        }
        showDynamicIslandBanner('RECIPE RESET', rec.name, 1500);
      }
    });
  }

  // Before / After Touch & Hold & Click handlers
  const wireCompare = (btn) => {
    if (!btn) return;
    let isPressed = false;
    btn.addEventListener('mousedown', (e) => { e.preventDefault(); isPressed = true; setBeforeCompareMode(true); });
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); isPressed = true; setBeforeCompareMode(true); }, { passive: false });
    window.addEventListener('mouseup', () => { if (isPressed) { isPressed = false; setBeforeCompareMode(false); } });
    window.addEventListener('touchend', () => { if (isPressed) { isPressed = false; setBeforeCompareMode(false); } });
    btn.addEventListener('mouseleave', () => { if (isPressed) { isPressed = false; setBeforeCompareMode(false); } });
  };
  wireCompare(btnCompareVf);
  wireCompare(btnCompareModal);

  // Preset Chips
  document.querySelectorAll('.recipe-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const presetId = chip.dataset.preset;
      if (window.ParametricColorEngine) {
        const rec = window.ParametricColorEngine.resetToPreset(presetId);
        if (rec) {
          state.isCustomRecipe = false;
          syncProRecipeSlidersToUI(rec);
          if (state.cameraSource === 'model') {
            const canvas = document.getElementById('model-canvas');
            if (canvas) renderStudioModel(canvas, state.retouchTone);
          } else {
            applyCurrentCameraFilter();
          }
          showDynamicIslandBanner('RECIPE LOADED', rec.name, 1600);
        }
      }
    });
  });

  // Slider Input Listeners
  const sliderDefs = [
    { id: 'slider-exposure', valId: 'val-exposure', fmt: (v) => (v >= 0 ? '+' : '') + Number(v).toFixed(2) },
    { id: 'slider-contrast', valId: 'val-contrast', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-highlights', valId: 'val-highlights', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-shadows', valId: 'val-shadows', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-whites', valId: 'val-whites', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-blacks', valId: 'val-blacks', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-temp', valId: 'val-temp', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-tint', valId: 'val-tint', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-vibrance', valId: 'val-vibrance', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-saturation', valId: 'val-saturation', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-hsl-red-sat', valId: 'val-hsl-red-sat', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-hsl-red-lum', valId: 'val-hsl-red-lum', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-hsl-orange-sat', valId: 'val-hsl-orange-sat', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-hsl-orange-lum', valId: 'val-hsl-orange-lum', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-hsl-yellow-sat', valId: 'val-hsl-yellow-sat', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-hsl-yellow-lum', valId: 'val-hsl-yellow-lum', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-hsl-green-hue', valId: 'val-hsl-green-hue', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-hsl-green-sat', valId: 'val-hsl-green-sat', fmt: (v) => (v >= 0 ? '+' : '') + v },
    { id: 'slider-hsl-green-lum', valId: 'val-hsl-green-lum', fmt: (v) => (v >= 0 ? '+' : '') + v }
  ];

  sliderDefs.forEach(item => {
    const el = document.getElementById(item.id);
    const valEl = document.getElementById(item.valId);
    if (el) {
      el.addEventListener('input', () => {
        if (valEl) valEl.textContent = item.fmt ? item.fmt(el.value) : el.value;
        updateRecipeFromSliders();
      });
    }
  });

  // Initial Sync
  if (window.ParametricColorEngine) {
    syncProRecipeSlidersToUI(window.ParametricColorEngine.activeRecipe);
  }
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
  opticalFlareEngine.init();
  initEventListeners();
  initDeviceAndOSSwitcher();
  initFimoUI();
  initProRecipeUI();

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
window.switchNextFilter = switchNextFilter;
window.switchPrevFilter = switchPrevFilter;
window.selectCameraFilter = selectCameraFilter;
window.executeCapture = executeCapture;
window.renderStudioModel = renderStudioModel;
window.applyCurrentCameraFilter = applyCurrentCameraFilter;
window.applyLensFilter = applyLensFilter;
window.enableWebcam = enableWebcam;
window.useStudioModel = useStudioModel;
window.opticalFlareEngine = opticalFlareEngine;
window.alignModeDial = alignModeDial;
window.setOrientation = setOrientation;
window.toggleOrientation = toggleOrientation;
window.DeviceDetector = DeviceDetector;
window.selectDevicePreset = selectDevicePreset;
window.autoScaleDeviceFrame = autoScaleDeviceFrame;
window.openDeviceSelectorModal = openDeviceSelectorModal;
window.FIMO_CAMERA_PERSONAS = FIMO_CAMERA_PERSONAS;
window.FIMO_ORDERED_CAMERAS = FIMO_ORDERED_CAMERAS;
window.CAM_SVG_ICONS = CAM_SVG_ICONS;
window.openProRecipeModal = openProRecipeModal;
window.closeProRecipeModal = closeProRecipeModal;
window.syncProRecipeSlidersToUI = syncProRecipeSlidersToUI;
window.setBeforeCompareMode = setBeforeCompareMode;
window.updateRecipeFromSliders = updateRecipeFromSliders;
window.updateRecipeHudUI = updateRecipeHudUI;

