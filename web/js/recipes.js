// Canonical recipes mirror of /shared/recipes.json
// Loaded live from /api/catalog or ../shared/recipes.json when served over HTTP(S),
// with bit-for-bit fallback for file:// standalone opening.

export const STOCK_BASELINE = {
  id: "00_stock_original",
  shortLabel: "00 STOCK",
  name: "Stock Original",
  koreanName: "원본 (기카)",
  moodCue: "Unmodified Reference",
  persona: "Reference Baseline",
  category: "all",
  intensity: 1.0,
  tone: {
    exposureEV: 0,
    wbTempShift: 0,
    wbTintShift: 0,
    blackFloor: [0, 0, 0],
    toeSoftness: 0,
    midContrast: 1.0,
    shoulderStart: 1.0,
    shoulderSoftness: 0,
    highlightDesat: 0
  },
  monochrome: {
    enabled: false,
    rgbWeights: [0.5, 0.36, 0.14],
    skinLumBoost: 0,
    skyLumPull: 0
  },
  colorScience: {
    skinCenterDeg: 25.0,
    skinWidthDeg: 20.0,
    skinHueShiftDeg: 0,
    skinSatDelta: 0,
    skinLumDelta: 0,
    skinTintShield: 1.0,
    skinChromaSmooth: 0,
    greenHueShiftDeg: 0,
    greenSatDelta: 0,
    greenLumDelta: 0,
    blueHueShiftDeg: 0,
    blueSatDelta: 0,
    redSatDelta: 0,
    vibrance: 0,
    saturation: 1.0,
    shadowTintRGB: [0, 0, 0],
    shadowTintStrength: 0,
    highlightTintRGB: [1, 1, 1],
    highlightTintStrength: 0
  },
  halation: {
    enabled: false,
    threshold: 0.98,
    knee: 0.05,
    radiusNorm: 0.01,
    strength: 0,
    tintRGB: [1, 0.3, 0.1],
    verticalAnisotropy: 1.0
  },
  blackMist: {
    enabled: false,
    threshold: 0.85,
    knee: 0.15,
    radiusNorm: 0.01,
    strength: 0,
    veil: 0
  },
  opticsAndGrain: {
    microContrast: 0,
    edgeSoftness: 0,
    grainMode: "silverHalide",
    grainAmount: 0,
    grainSizeNorm: 1.0,
    grainChromaRatio: 0,
    vignetteStrength: 0,
    vignettePower: 2.0,
    flashCenterBoost: 0,
    lightLeakStrength: 0
  }
};

export const EMBEDDED_DEFAULT_CATALOG = {
  "schemaVersion": 2,
  "updatedAt": "2026-11-14",
  "aesthetics": [
    {
      "id": "01_vintage_35mm",
      "shortLabel": "01 VINTAGE",
      "name": "Classic Vintage 35mm",
      "koreanName": "클래식 빈티지 필름",
      "moodCue": "Portra 400 · Golden Hour",
      "persona": "최은우 (VintageFilmAgent)",
      "tone": {
        "exposureEV": 0.12,
        "wbTempShift": 0.16,
        "wbTintShift": 0.03,
        "blackFloor": [
          0.045,
          0.041,
          0.036
        ],
        "toeSoftness": 0.24,
        "midContrast": 1.09,
        "shoulderStart": 0.68,
        "shoulderSoftness": 0.42,
        "highlightDesat": 0.22
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 20.0,
        "skinHueShiftDeg": 1.5,
        "skinSatDelta": -0.02,
        "skinLumDelta": 0.05,
        "skinTintShield": 0.85,
        "skinChromaSmooth": 0.08,
        "greenHueShiftDeg": -20.0,
        "greenSatDelta": -0.18,
        "greenLumDelta": -0.04,
        "blueHueShiftDeg": -6.0,
        "blueSatDelta": -0.14,
        "redSatDelta": -0.04,
        "vibrance": 0.08,
        "saturation": 1.02,
        "shadowTintRGB": [
          0.16,
          0.17,
          0.12
        ],
        "shadowTintStrength": 0.22,
        "highlightTintRGB": [
          1.0,
          0.96,
          0.89
        ],
        "highlightTintStrength": 0.2
      },
      "halation": {
        "enabled": false,
        "threshold": 0.92,
        "knee": 0.08,
        "radiusNorm": 0.014,
        "strength": 0.0,
        "tintRGB": [
          1.0,
          0.35,
          0.12
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": false,
        "threshold": 0.65,
        "knee": 0.2,
        "radiusNorm": 0.015,
        "strength": 0.08,
        "veil": 0.0
      },
      "opticsAndGrain": {
        "microContrast": 0.06,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.16,
        "grainSizeNorm": 1.05,
        "grainChromaRatio": 0.14,
        "vignetteStrength": 0.16,
        "vignettePower": 3.0,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      },
      "category": "film"
    },
    {
      "id": "02_airy_summer",
      "shortLabel": "02 AIRY",
      "name": "Airy Japanese Summer",
      "koreanName": "청량 여름 파스텔",
      "moodCue": "Fuji Pro 400H · Porcelain Sun",
      "persona": "하루카 미즈노 (AirySummerAgent)",
      "tone": {
        "exposureEV": 0.44,
        "wbTempShift": -0.02,
        "wbTintShift": -0.03,
        "blackFloor": [
          0.028,
          0.042,
          0.048
        ],
        "toeSoftness": 0.4,
        "midContrast": 0.85,
        "shoulderStart": 0.78,
        "shoulderSoftness": 0.3,
        "highlightDesat": 0.16
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 22.0,
        "skinHueShiftDeg": -2.0,
        "skinSatDelta": -0.14,
        "skinLumDelta": 0.1,
        "skinTintShield": 0.94,
        "skinChromaSmooth": 0.18,
        "greenHueShiftDeg": 34.0,
        "greenSatDelta": 0.12,
        "greenLumDelta": 0.12,
        "blueHueShiftDeg": -16.0,
        "blueSatDelta": 0.14,
        "redSatDelta": 0.08,
        "vibrance": 0.16,
        "saturation": 1.04,
        "shadowTintRGB": [
          0.05,
          0.2,
          0.23
        ],
        "shadowTintStrength": 0.24,
        "highlightTintRGB": [
          0.99,
          1.0,
          1.0
        ],
        "highlightTintStrength": 0.08
      },
      "halation": {
        "enabled": false,
        "threshold": 0.94,
        "knee": 0.08,
        "radiusNorm": 0.012,
        "strength": 0.0,
        "tintRGB": [
          1.0,
          0.95,
          0.9
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": true,
        "threshold": 0.66,
        "knee": 0.22,
        "radiusNorm": 0.016,
        "strength": 0.16,
        "veil": 0.02
      },
      "opticsAndGrain": {
        "microContrast": 0.0,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.07,
        "grainSizeNorm": 0.85,
        "grainChromaRatio": 0.08,
        "vignetteStrength": 0.0,
        "vignettePower": 2.0,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      },
      "category": "film"
    },
    {
      "id": "03_y2k_flash",
      "shortLabel": "03 Y2K CCD",
      "name": "Y2K CCD & Direct Flash",
      "koreanName": "Y2K 디카 직광 플래시",
      "moodCue": "2003 IXY · Xenon Pop",
      "persona": "김채린 (Y2KFlashAgent)",
      "tone": {
        "exposureEV": 0.04,
        "wbTempShift": -0.18,
        "wbTintShift": 0.08,
        "blackFloor": [
          0.012,
          0.022,
          0.042
        ],
        "toeSoftness": 0.08,
        "midContrast": 1.24,
        "shoulderStart": 0.78,
        "shoulderSoftness": 0.18,
        "highlightDesat": 0.14
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 19.0,
        "skinHueShiftDeg": -2.5,
        "skinSatDelta": -0.06,
        "skinLumDelta": 0.06,
        "skinTintShield": 0.88,
        "skinChromaSmooth": 0.14,
        "greenHueShiftDeg": 10.0,
        "greenSatDelta": 0.08,
        "greenLumDelta": 0.0,
        "blueHueShiftDeg": -10.0,
        "blueSatDelta": 0.22,
        "redSatDelta": 0.14,
        "vibrance": 0.14,
        "saturation": 1.12,
        "shadowTintRGB": [
          0.04,
          0.18,
          0.32
        ],
        "shadowTintStrength": 0.34,
        "highlightTintRGB": [
          0.97,
          0.98,
          1.0
        ],
        "highlightTintStrength": 0.1
      },
      "halation": {
        "enabled": true,
        "threshold": 0.96,
        "knee": 0.05,
        "radiusNorm": 0.014,
        "strength": 0.3,
        "tintRGB": [
          0.8,
          0.92,
          1.0
        ],
        "verticalAnisotropy": 2.2
      },
      "blackMist": {
        "enabled": false,
        "threshold": 0.7,
        "knee": 0.2,
        "radiusNorm": 0.012,
        "strength": 0.0,
        "veil": 0.0
      },
      "opticsAndGrain": {
        "microContrast": 0.08,
        "edgeSoftness": 0.0,
        "grainMode": "ccdSensor",
        "grainAmount": 0.12,
        "grainSizeNorm": 0.9,
        "grainChromaRatio": 0.36,
        "vignetteStrength": 0.42,
        "vignettePower": 3.4,
        "flashCenterBoost": 0.09,
        "lightLeakStrength": 0.0
      },
      "category": "mood"
    },
    {
      "id": "04_nocturne_cinema",
      "shortLabel": "04 NOCTURNE",
      "name": "Nocturne Cinema & Halation",
      "koreanName": "야간 시네마 할레이션",
      "moodCue": "CineStill 800T · Neon Glow",
      "persona": "진우성 (NocturneCinemaAgent)",
      "tone": {
        "exposureEV": -0.06,
        "wbTempShift": -0.24,
        "wbTintShift": -0.04,
        "blackFloor": [
          0.016,
          0.036,
          0.048
        ],
        "toeSoftness": 0.18,
        "midContrast": 1.22,
        "shoulderStart": 0.7,
        "shoulderSoftness": 0.3,
        "highlightDesat": 0.18
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 18.0,
        "skinHueShiftDeg": 1.0,
        "skinSatDelta": 0.04,
        "skinLumDelta": 0.04,
        "skinTintShield": 0.88,
        "skinChromaSmooth": 0.05,
        "greenHueShiftDeg": 22.0,
        "greenSatDelta": -0.1,
        "greenLumDelta": -0.04,
        "blueHueShiftDeg": -12.0,
        "blueSatDelta": 0.16,
        "redSatDelta": 0.22,
        "vibrance": 0.12,
        "saturation": 1.08,
        "shadowTintRGB": [
          0.04,
          0.24,
          0.3
        ],
        "shadowTintStrength": 0.44,
        "highlightTintRGB": [
          1.0,
          0.93,
          0.88
        ],
        "highlightTintStrength": 0.1
      },
      "halation": {
        "enabled": true,
        "threshold": 0.915,
        "knee": 0.065,
        "radiusNorm": 0.032,
        "strength": 0.95,
        "tintRGB": [
          1.0,
          0.18,
          0.03
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": false,
        "threshold": 0.72,
        "knee": 0.2,
        "radiusNorm": 0.016,
        "strength": 0.0,
        "veil": 0.0
      },
      "opticsAndGrain": {
        "microContrast": 0.08,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.19,
        "grainSizeNorm": 1.15,
        "grainChromaRatio": 0.16,
        "vignetteStrength": 0.26,
        "vignettePower": 3.4,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      },
      "category": "mood"
    },
    {
      "id": "05_lofi_youth",
      "shortLabel": "05 LO-FI 90s",
      "name": "90s Disposable Youth Lo-Fi",
      "koreanName": "일회용 필름 로파이",
      "moodCue": "QuickSnap 800 · Raw Grain",
      "persona": "박시후 (LoFiYouthAgent)",
      "tone": {
        "exposureEV": 0.06,
        "wbTempShift": -0.04,
        "wbTintShift": -0.1,
        "blackFloor": [
          0.038,
          0.068,
          0.058
        ],
        "toeSoftness": 0.3,
        "midContrast": 1.16,
        "shoulderStart": 0.72,
        "shoulderSoftness": 0.28,
        "highlightDesat": 0.15
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 19.0,
        "skinHueShiftDeg": 0.0,
        "skinSatDelta": 0.02,
        "skinLumDelta": 0.03,
        "skinTintShield": 0.84,
        "skinChromaSmooth": 0.0,
        "greenHueShiftDeg": 16.0,
        "greenSatDelta": 0.1,
        "greenLumDelta": 0.04,
        "blueHueShiftDeg": -8.0,
        "blueSatDelta": 0.14,
        "redSatDelta": 0.24,
        "vibrance": 0.18,
        "saturation": 1.14,
        "shadowTintRGB": [
          0.08,
          0.28,
          0.22
        ],
        "shadowTintStrength": 0.32,
        "highlightTintRGB": [
          0.99,
          0.98,
          0.92
        ],
        "highlightTintStrength": 0.12
      },
      "halation": {
        "enabled": false,
        "threshold": 0.94,
        "knee": 0.08,
        "radiusNorm": 0.015,
        "strength": 0.0,
        "tintRGB": [
          1.0,
          0.35,
          0.1
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": false,
        "threshold": 0.7,
        "knee": 0.2,
        "radiusNorm": 0.014,
        "strength": 0.0,
        "veil": 0.0
      },
      "opticsAndGrain": {
        "microContrast": 0.05,
        "edgeSoftness": 0.42,
        "grainMode": "silverHalide",
        "grainAmount": 0.3,
        "grainSizeNorm": 1.45,
        "grainChromaRatio": 0.22,
        "vignetteStrength": 0.34,
        "vignettePower": 2.8,
        "flashCenterBoost": 0.04,
        "lightLeakStrength": 0.26
      },
      "category": "film"
    },
    {
      "id": "06_editorial_mf",
      "shortLabel": "06 EDITORIAL",
      "name": "Editorial Medium Format",
      "koreanName": "에디토리얼 중형 화보",
      "moodCue": "Hasselblad · 3D Silk Clarity",
      "persona": "서아현 (EditorialPortraitAgent)",
      "tone": {
        "exposureEV": 0.08,
        "wbTempShift": 0.0,
        "wbTintShift": 0.0,
        "blackFloor": [
          0.006,
          0.006,
          0.007
        ],
        "toeSoftness": 0.12,
        "midContrast": 1.14,
        "shoulderStart": 0.74,
        "shoulderSoftness": 0.34,
        "highlightDesat": 0.1
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 21.0,
        "skinHueShiftDeg": -0.5,
        "skinSatDelta": -0.07,
        "skinLumDelta": 0.07,
        "skinTintShield": 0.98,
        "skinChromaSmooth": 0.48,
        "greenHueShiftDeg": -8.0,
        "greenSatDelta": -0.06,
        "greenLumDelta": -0.02,
        "blueHueShiftDeg": 2.0,
        "blueSatDelta": -0.04,
        "redSatDelta": 0.08,
        "vibrance": 0.1,
        "saturation": 1.0,
        "shadowTintRGB": [
          0.1,
          0.1,
          0.11
        ],
        "shadowTintStrength": 0.0,
        "highlightTintRGB": [
          1.0,
          1.0,
          1.0
        ],
        "highlightTintStrength": 0.0
      },
      "halation": {
        "enabled": false,
        "threshold": 0.96,
        "knee": 0.06,
        "radiusNorm": 0.01,
        "strength": 0.0,
        "tintRGB": [
          1.0,
          1.0,
          1.0
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": false,
        "threshold": 0.75,
        "knee": 0.2,
        "radiusNorm": 0.012,
        "strength": 0.0,
        "veil": 0.0
      },
      "opticsAndGrain": {
        "microContrast": 0.24,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.0,
        "grainSizeNorm": 0.8,
        "grainChromaRatio": 0.0,
        "vignetteStrength": 0.1,
        "vignettePower": 3.8,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      },
      "category": "mood"
    },
    {
      "id": "07_pure_monochrome",
      "shortLabel": "07 MONOCHROM",
      "name": "Pure Silver Monochrome",
      "koreanName": "정통 은염 흑백",
      "moodCue": "Tri-X 400 · Zone System",
      "persona": "노태현 (MonochromeStreetAgent)",
      "tone": {
        "exposureEV": 0.04,
        "wbTempShift": 0.0,
        "wbTintShift": 0.0,
        "blackFloor": [
          0.006,
          0.006,
          0.006
        ],
        "toeSoftness": 0.1,
        "midContrast": 1.32,
        "shoulderStart": 0.74,
        "shoulderSoftness": 0.28,
        "highlightDesat": 0.0
      },
      "monochrome": {
        "enabled": true,
        "rgbWeights": [
          0.52,
          0.35,
          0.13
        ],
        "skinLumBoost": 0.16,
        "skyLumPull": 0.24
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 20.0,
        "skinHueShiftDeg": 0.0,
        "skinSatDelta": 0.0,
        "skinLumDelta": 0.0,
        "skinTintShield": 1.0,
        "skinChromaSmooth": 0.0,
        "greenHueShiftDeg": 0.0,
        "greenSatDelta": 0.0,
        "greenLumDelta": 0.0,
        "blueHueShiftDeg": 0.0,
        "blueSatDelta": 0.0,
        "redSatDelta": 0.0,
        "vibrance": 0.0,
        "saturation": 0.0,
        "shadowTintRGB": [
          0.1,
          0.1,
          0.1
        ],
        "shadowTintStrength": 0.0,
        "highlightTintRGB": [
          1.0,
          1.0,
          1.0
        ],
        "highlightTintStrength": 0.0
      },
      "halation": {
        "enabled": false,
        "threshold": 0.95,
        "knee": 0.08,
        "radiusNorm": 0.012,
        "strength": 0.0,
        "tintRGB": [
          1.0,
          1.0,
          1.0
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": false,
        "threshold": 0.72,
        "knee": 0.2,
        "radiusNorm": 0.014,
        "strength": 0.0,
        "veil": 0.0
      },
      "opticsAndGrain": {
        "microContrast": 0.28,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.24,
        "grainSizeNorm": 1.25,
        "grainChromaRatio": 0.0,
        "vignetteStrength": 0.22,
        "vignettePower": 3.2,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      },
      "category": "mono"
    },
    {
      "id": "08_dreamy_instant",
      "shortLabel": "08 DREAMY",
      "name": "Dreamy Instant & Diffusion",
      "koreanName": "몽환 즉석 블랙 미스트",
      "moodCue": "SX-70 · Black Mist 1/4",
      "persona": "릴리 정 (DreamyInstantAgent)",
      "tone": {
        "exposureEV": 0.18,
        "wbTempShift": 0.06,
        "wbTintShift": 0.06,
        "blackFloor": [
          0.062,
          0.066,
          0.08
        ],
        "toeSoftness": 0.45,
        "midContrast": 0.8,
        "shoulderStart": 0.62,
        "shoulderSoftness": 0.48,
        "highlightDesat": 0.24
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 22.0,
        "skinHueShiftDeg": -1.5,
        "skinSatDelta": -0.1,
        "skinLumDelta": 0.08,
        "skinTintShield": 0.9,
        "skinChromaSmooth": 0.24,
        "greenHueShiftDeg": 20.0,
        "greenSatDelta": -0.16,
        "greenLumDelta": 0.06,
        "blueHueShiftDeg": -12.0,
        "blueSatDelta": -0.12,
        "redSatDelta": -0.06,
        "vibrance": 0.02,
        "saturation": 0.92,
        "shadowTintRGB": [
          0.14,
          0.22,
          0.25
        ],
        "shadowTintStrength": 0.3,
        "highlightTintRGB": [
          1.0,
          0.95,
          0.94
        ],
        "highlightTintStrength": 0.22
      },
      "halation": {
        "enabled": false,
        "threshold": 0.94,
        "knee": 0.08,
        "radiusNorm": 0.016,
        "strength": 0.0,
        "tintRGB": [
          1.0,
          0.95,
          0.94
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": true,
        "threshold": 0.56,
        "knee": 0.24,
        "radiusNorm": 0.024,
        "strength": 0.58,
        "veil": 0.05
      },
      "opticsAndGrain": {
        "microContrast": 0.0,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.1,
        "grainSizeNorm": 1.0,
        "grainChromaRatio": 0.1,
        "vignetteStrength": 0.14,
        "vignettePower": 2.4,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      },
      "category": "mood"
    },
    {
      "id": "09_slide_reversal",
      "shortLabel": "09 SLIDE 64",
      "name": "Positive Slide Reversal",
      "koreanName": "포지티브 슬라이드 64",
      "moodCue": "Kodachrome 64 · Jewel Slide",
      "persona": "강서진 · 한도윤 (Master + ColorScientist)",
      "category": "film",
      "tone": {
        "exposureEV": -0.02,
        "wbTempShift": -0.03,
        "wbTintShift": 0.04,
        "blackFloor": [
          0.003,
          0.003,
          0.006
        ],
        "toeSoftness": 0.03,
        "midContrast": 1.28,
        "shoulderStart": 0.78,
        "shoulderSoftness": 0.18,
        "highlightDesat": 0.08
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 20.0,
        "skinHueShiftDeg": 1.5,
        "skinSatDelta": -0.07,
        "skinLumDelta": 0.02,
        "skinTintShield": 0.95,
        "skinChromaSmooth": 0.04,
        "greenHueShiftDeg": 14.0,
        "greenSatDelta": 0.14,
        "greenLumDelta": -0.06,
        "blueHueShiftDeg": -6.0,
        "blueSatDelta": 0.22,
        "blueLumDelta": -0.11,
        "redHueShiftDeg": 4.0,
        "redSatDelta": 0.2,
        "redLumDelta": -0.04,
        "vibrance": 0.2,
        "saturation": 1.12,
        "shadowTintRGB": [
          0.02,
          0.04,
          0.08
        ],
        "shadowTintStrength": 0.1,
        "highlightTintRGB": [
          0.99,
          0.99,
          1.0
        ],
        "highlightTintStrength": 0.08
      },
      "halation": {
        "enabled": false,
        "threshold": 0.94,
        "knee": 0.06,
        "radiusNorm": 0.014,
        "strength": 0.0,
        "tintRGB": [
          1.0,
          0.28,
          0.06
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": false,
        "threshold": 0.8,
        "knee": 0.15,
        "radiusNorm": 0.014,
        "strength": 0.0,
        "veil": 0.0
      },
      "opticsAndGrain": {
        "microContrast": 0.14,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.055,
        "grainSizeNorm": 0.72,
        "grainChromaRatio": 0.1,
        "vignetteStrength": 0.18,
        "vignettePower": 3.2,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      }
    },
    {
      "id": "10_chrome_mute",
      "shortLabel": "10 CHROME MUTE",
      "name": "Overcast Muted Chrome",
      "koreanName": "클래식 크롬 다큐",
      "moodCue": "Classic Chrome · Slate Day",
      "persona": "강서진 · 한도윤 (Master + ColorScientist)",
      "category": "film",
      "tone": {
        "exposureEV": -0.08,
        "wbTempShift": -0.06,
        "wbTintShift": -0.02,
        "blackFloor": [
          0.012,
          0.014,
          0.018
        ],
        "toeSoftness": 0.12,
        "midContrast": 1.16,
        "shoulderStart": 0.72,
        "shoulderSoftness": 0.34,
        "highlightDesat": 0.14
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 20.0,
        "skinHueShiftDeg": -1.5,
        "skinSatDelta": 0.02,
        "skinLumDelta": 0.03,
        "skinTintShield": 0.9,
        "skinChromaSmooth": 0.06,
        "greenHueShiftDeg": 18.0,
        "greenSatDelta": -0.26,
        "greenLumDelta": -0.06,
        "blueHueShiftDeg": -10.0,
        "blueSatDelta": -0.14,
        "blueLumDelta": -0.04,
        "redSatDelta": -0.04,
        "vibrance": -0.04,
        "saturation": 0.86,
        "shadowTintRGB": [
          0.68,
          0.76,
          0.86
        ],
        "shadowTintStrength": 0.26,
        "shadowTintBalance": 1.0,
        "highlightTintRGB": [
          0.98,
          0.99,
          1.0
        ],
        "highlightTintStrength": 0.12
      },
      "halation": {
        "enabled": false,
        "threshold": 0.94,
        "knee": 0.06,
        "radiusNorm": 0.014,
        "strength": 0.0,
        "tintRGB": [
          1.0,
          0.28,
          0.06
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": false,
        "threshold": 0.8,
        "knee": 0.15,
        "radiusNorm": 0.014,
        "strength": 0.0,
        "veil": 0.0
      },
      "opticsAndGrain": {
        "microContrast": 0.1,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.1,
        "grainSizeNorm": 0.92,
        "grainChromaRatio": 0.08,
        "vignetteStrength": 0.16,
        "vignettePower": 3.0,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      }
    },
    {
      "id": "11_bleach_enr",
      "shortLabel": "11 BLEACH ENR",
      "name": "Silver-Retention Cinema",
      "koreanName": "블리치 바이패스 은잔류",
      "moodCue": "Bleach Bypass · Silver Steel",
      "persona": "진우성 · 한도윤 (Cinema + ColorScientist)",
      "category": "mood",
      "tone": {
        "exposureEV": -0.04,
        "wbTempShift": -0.08,
        "wbTintShift": -0.02,
        "blackFloor": [
          0.002,
          0.002,
          0.004
        ],
        "toeSoftness": 0.04,
        "midContrast": 1.24,
        "shoulderStart": 0.74,
        "shoulderSoftness": 0.26,
        "highlightDesat": 0.28
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 20.0,
        "skinHueShiftDeg": -1.0,
        "skinSatDelta": 0.05,
        "skinLumDelta": 0.02,
        "skinTintShield": 0.88,
        "skinChromaSmooth": 0.04,
        "greenHueShiftDeg": 12.0,
        "greenSatDelta": -0.2,
        "greenLumDelta": -0.06,
        "blueHueShiftDeg": -8.0,
        "blueSatDelta": -0.1,
        "blueLumDelta": -0.05,
        "redSatDelta": -0.06,
        "vibrance": 0.0,
        "saturation": 0.64,
        "shadowTintRGB": [
          0.58,
          0.72,
          0.84
        ],
        "shadowTintStrength": 0.32,
        "shadowTintBalance": 1.0,
        "highlightTintRGB": [
          0.96,
          0.98,
          1.0
        ],
        "highlightTintStrength": 0.14,
        "bleachBypassAmount": 0.62
      },
      "halation": {
        "enabled": false,
        "threshold": 0.94,
        "knee": 0.06,
        "radiusNorm": 0.014,
        "strength": 0.0,
        "tintRGB": [
          1.0,
          0.26,
          0.05
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": false,
        "threshold": 0.8,
        "knee": 0.15,
        "radiusNorm": 0.014,
        "strength": 0.0,
        "veil": 0.0
      },
      "opticsAndGrain": {
        "microContrast": 0.22,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.16,
        "grainSizeNorm": 0.95,
        "grainChromaRatio": 0.05,
        "vignetteStrength": 0.24,
        "vignettePower": 2.8,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      }
    },
    {
      "id": "12_platinum_print",
      "shortLabel": "12 PLATINUM",
      "name": "Warm Platinum-Palladium",
      "koreanName": "백금-팔라듐 아트 프린트",
      "moodCue": "Platinum Print · Soft Fiber",
      "persona": "노태현 · 서아현 (Mono + Editorial)",
      "category": "mono",
      "tone": {
        "exposureEV": 0.06,
        "wbTempShift": 0.0,
        "wbTintShift": 0.0,
        "blackFloor": [
          0.024,
          0.021,
          0.019
        ],
        "toeSoftness": 0.28,
        "midContrast": 0.98,
        "shoulderStart": 0.66,
        "shoulderSoftness": 0.42,
        "highlightDesat": 0.0
      },
      "monochrome": {
        "enabled": true,
        "rgbWeights": [
          0.38,
          0.44,
          0.18
        ],
        "skinLumBoost": 0.14,
        "skyLumPull": 0.14,
        "monoSplitToneStrength": 0.85
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 20.0,
        "skinHueShiftDeg": 0.0,
        "skinSatDelta": 0.0,
        "skinLumDelta": 0.0,
        "skinTintShield": 0.35,
        "skinChromaSmooth": 0.08,
        "greenHueShiftDeg": 0.0,
        "greenSatDelta": 0.0,
        "greenLumDelta": 0.0,
        "blueHueShiftDeg": 0.0,
        "blueSatDelta": 0.0,
        "redSatDelta": 0.0,
        "vibrance": 0.0,
        "saturation": 0.0,
        "shadowTintRGB": [
          0.64,
          0.6,
          0.65
        ],
        "shadowTintStrength": 0.36,
        "shadowTintBalance": 1.0,
        "highlightTintRGB": [
          1.0,
          0.94,
          0.86
        ],
        "highlightTintStrength": 0.44
      },
      "halation": {
        "enabled": false,
        "threshold": 0.94,
        "knee": 0.06,
        "radiusNorm": 0.014,
        "strength": 0.0,
        "tintRGB": [
          1.0,
          0.96,
          0.9
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": true,
        "threshold": 0.7,
        "knee": 0.2,
        "radiusNorm": 0.016,
        "strength": 0.2,
        "veil": 0.015
      },
      "opticsAndGrain": {
        "microContrast": 0.08,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.08,
        "grainSizeNorm": 0.76,
        "grainChromaRatio": 0.0,
        "vignetteStrength": 0.14,
        "vignettePower": 3.0,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      }
    },
    {
      "id": "13_daylight_cinema",
      "shortLabel": "13 50D CINE",
      "name": "Daylight Cinema 50D",
      "koreanName": "데이라이트 시네마 50D",
      "moodCue": "CineStill 50D · Daylight Print",
      "persona": "진우성 · 최은우 (Cinema + Vintage)",
      "category": "mood",
      "tone": {
        "exposureEV": 0.06,
        "wbTempShift": 0.05,
        "wbTintShift": 0.01,
        "blackFloor": [
          0.007,
          0.007,
          0.009
        ],
        "toeSoftness": 0.08,
        "midContrast": 1.18,
        "shoulderStart": 0.72,
        "shoulderSoftness": 0.32,
        "highlightDesat": 0.16
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 20.0,
        "skinHueShiftDeg": -1.0,
        "skinSatDelta": -0.04,
        "skinLumDelta": 0.03,
        "skinTintShield": 0.92,
        "skinChromaSmooth": 0.06,
        "greenHueShiftDeg": -6.0,
        "greenSatDelta": 0.04,
        "greenLumDelta": 0.0,
        "blueHueShiftDeg": -8.0,
        "blueSatDelta": 0.14,
        "blueLumDelta": -0.04,
        "redSatDelta": 0.2,
        "vibrance": 0.12,
        "saturation": 1.06,
        "shadowTintRGB": [
          0.06,
          0.09,
          0.12
        ],
        "shadowTintStrength": 0.14,
        "highlightTintRGB": [
          1.0,
          0.98,
          0.95
        ],
        "highlightTintStrength": 0.1
      },
      "halation": {
        "enabled": true,
        "threshold": 0.93,
        "knee": 0.06,
        "radiusNorm": 0.02,
        "strength": 0.44,
        "tintRGB": [
          1.0,
          0.26,
          0.05
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": false,
        "threshold": 0.78,
        "knee": 0.15,
        "radiusNorm": 0.015,
        "strength": 0.0,
        "veil": 0.0
      },
      "opticsAndGrain": {
        "microContrast": 0.12,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.08,
        "grainSizeNorm": 0.8,
        "grainChromaRatio": 0.1,
        "vignetteStrength": 0.14,
        "vignettePower": 3.0,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      }
    },
    {
      "id": "14_candle_chiaroscuro",
      "shortLabel": "14 CANDLE 2700",
      "name": "Candlelight Chiaroscuro",
      "koreanName": "캔들라이트 2700K 암실",
      "moodCue": "2700K Chiaroscuro · Velvet Dark",
      "persona": "강서진 · 진우성 (Master + Cinema)",
      "category": "mood",
      "tone": {
        "exposureEV": -0.14,
        "wbTempShift": 0.14,
        "wbTintShift": -0.03,
        "blackFloor": [
          0.008,
          0.005,
          0.004
        ],
        "toeSoftness": 0.05,
        "midContrast": 1.24,
        "shoulderStart": 0.72,
        "shoulderSoftness": 0.36,
        "highlightDesat": 0.16
      },
      "monochrome": {
        "enabled": false,
        "rgbWeights": [
          0.5,
          0.36,
          0.14
        ],
        "skinLumBoost": 0.0,
        "skyLumPull": 0.0
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 20.0,
        "skinHueShiftDeg": -2.0,
        "skinSatDelta": -0.05,
        "skinLumDelta": 0.05,
        "skinTintShield": 0.92,
        "skinChromaSmooth": 0.1,
        "greenHueShiftDeg": -14.0,
        "greenSatDelta": -0.24,
        "greenLumDelta": -0.1,
        "blueHueShiftDeg": -8.0,
        "blueSatDelta": -0.22,
        "blueLumDelta": -0.08,
        "redSatDelta": 0.14,
        "vibrance": 0.04,
        "saturation": 0.98,
        "shadowTintRGB": [
          0.76,
          0.56,
          0.46
        ],
        "shadowTintStrength": 0.3,
        "shadowTintBalance": 1.0,
        "highlightTintRGB": [
          1.0,
          0.91,
          0.76
        ],
        "highlightTintStrength": 0.24
      },
      "halation": {
        "enabled": true,
        "threshold": 0.905,
        "knee": 0.08,
        "radiusNorm": 0.024,
        "strength": 0.52,
        "tintRGB": [
          1.0,
          0.32,
          0.08
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": true,
        "threshold": 0.68,
        "knee": 0.2,
        "radiusNorm": 0.018,
        "strength": 0.24,
        "veil": 0.02
      },
      "opticsAndGrain": {
        "microContrast": 0.08,
        "edgeSoftness": 0.0,
        "grainMode": "silverHalide",
        "grainAmount": 0.14,
        "grainSizeNorm": 1.02,
        "grainChromaRatio": 0.12,
        "vignetteStrength": 0.3,
        "vignettePower": 2.6,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      }
    },
    {
      "id": "15_wet_plate_ortho",
      "shortLabel": "15 WET-PLATE",
      "name": "Orthochromatic Wet-Plate",
      "koreanName": "오소크로매틱 습판 인화",
      "moodCue": "Ortho Collodion · Blue Sculpt",
      "persona": "노태현 · 릴리 정 (Mono + Instant)",
      "category": "mono",
      "tone": {
        "exposureEV": 0.02,
        "wbTempShift": 0.0,
        "wbTintShift": 0.0,
        "blackFloor": [
          0.005,
          0.005,
          0.007
        ],
        "toeSoftness": 0.06,
        "midContrast": 1.26,
        "shoulderStart": 0.76,
        "shoulderSoftness": 0.24,
        "highlightDesat": 0.0
      },
      "monochrome": {
        "enabled": true,
        "rgbWeights": [
          0.08,
          0.36,
          0.56
        ],
        "skinLumBoost": -0.1,
        "skyLumPull": -0.52,
        "monoSplitToneStrength": 0.42
      },
      "colorScience": {
        "skinCenterDeg": 25.0,
        "skinWidthDeg": 20.0,
        "skinHueShiftDeg": 0.0,
        "skinSatDelta": 0.0,
        "skinLumDelta": 0.0,
        "skinTintShield": 0.3,
        "skinChromaSmooth": 0.04,
        "greenHueShiftDeg": 0.0,
        "greenSatDelta": 0.0,
        "greenLumDelta": 0.0,
        "blueHueShiftDeg": 0.0,
        "blueSatDelta": 0.0,
        "redSatDelta": 0.0,
        "vibrance": 0.0,
        "saturation": 0.0,
        "shadowTintRGB": [
          0.64,
          0.68,
          0.76
        ],
        "shadowTintStrength": 0.2,
        "shadowTintBalance": 1.0,
        "highlightTintRGB": [
          0.99,
          0.99,
          0.97
        ],
        "highlightTintStrength": 0.12
      },
      "halation": {
        "enabled": false,
        "threshold": 0.95,
        "knee": 0.05,
        "radiusNorm": 0.012,
        "strength": 0.0,
        "tintRGB": [
          1.0,
          0.95,
          0.9
        ],
        "verticalAnisotropy": 1.0
      },
      "blackMist": {
        "enabled": false,
        "threshold": 0.8,
        "knee": 0.15,
        "radiusNorm": 0.012,
        "strength": 0.0,
        "veil": 0.0
      },
      "opticsAndGrain": {
        "microContrast": 0.2,
        "edgeSoftness": 0.18,
        "grainMode": "silverHalide",
        "grainAmount": 0.14,
        "grainSizeNorm": 0.88,
        "grainChromaRatio": 0.0,
        "vignetteStrength": 0.34,
        "vignettePower": 2.2,
        "flashCenterBoost": 0.0,
        "lightLeakStrength": 0.0
      }
    }
  ]
};

export async function loadCanonicalCatalog() {
  if (typeof window !== "undefined" && window.location && window.location.protocol !== "file:") {
    const candidates = ["./recipes.json", "../shared/recipes.json"];
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.aesthetics) && data.aesthetics.length > 0) {
            return data;
          }
        }
      } catch {
        // Try next candidate
      }
    }
  }
  return structuredClone(EMBEDDED_DEFAULT_CATALOG);
}
