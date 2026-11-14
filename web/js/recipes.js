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
  schemaVersion: 1,
  updatedAt: "2026-11-14",
  aesthetics: [
    {
      id: "01_vintage_35mm",
      shortLabel: "01 VINTAGE",
      name: "Classic Vintage 35mm",
      koreanName: "클래식 빈티지 필름",
      moodCue: "Portra 400 · Golden Hour",
      persona: "최은우 (VintageFilmAgent)",
      tone: {
        exposureEV: 0.12,
        wbTempShift: 0.16,
        wbTintShift: 0.03,
        blackFloor: [0.045, 0.041, 0.036],
        toeSoftness: 0.24,
        midContrast: 1.09,
        shoulderStart: 0.68,
        shoulderSoftness: 0.42,
        highlightDesat: 0.22
      },
      monochrome: { enabled: false, rgbWeights: [0.5, 0.36, 0.14], skinLumBoost: 0.0, skyLumPull: 0.0 },
      colorScience: {
        skinCenterDeg: 25.0,
        skinWidthDeg: 20.0,
        skinHueShiftDeg: 1.5,
        skinSatDelta: -0.02,
        skinLumDelta: 0.05,
        skinTintShield: 0.85,
        skinChromaSmooth: 0.08,
        greenHueShiftDeg: -20.0,
        greenSatDelta: -0.18,
        greenLumDelta: -0.04,
        blueHueShiftDeg: -6.0,
        blueSatDelta: -0.14,
        redSatDelta: -0.04,
        vibrance: 0.08,
        saturation: 1.02,
        shadowTintRGB: [0.16, 0.17, 0.12],
        shadowTintStrength: 0.22,
        highlightTintRGB: [1.0, 0.96, 0.89],
        highlightTintStrength: 0.20
      },
      halation: { enabled: false, threshold: 0.92, knee: 0.08, radiusNorm: 0.014, strength: 0.0, tintRGB: [1.0, 0.35, 0.12], verticalAnisotropy: 1.0 },
      blackMist: { enabled: false, threshold: 0.65, knee: 0.20, radiusNorm: 0.015, strength: 0.08, veil: 0.0 },
      opticsAndGrain: { microContrast: 0.06, edgeSoftness: 0.0, grainMode: "silverHalide", grainAmount: 0.16, grainSizeNorm: 1.05, grainChromaRatio: 0.14, vignetteStrength: 0.16, vignettePower: 3.0, flashCenterBoost: 0.0, lightLeakStrength: 0.0 }
    },
    {
      id: "02_airy_summer",
      shortLabel: "02 AIRY",
      name: "Airy Japanese Summer",
      koreanName: "청량 여름 파스텔",
      moodCue: "Fuji Pro 400H · Porcelain Sun",
      persona: "하루카 미즈노 (AirySummerAgent)",
      tone: {
        exposureEV: 0.44,
        wbTempShift: -0.02,
        wbTintShift: -0.03,
        blackFloor: [0.028, 0.042, 0.048],
        toeSoftness: 0.40,
        midContrast: 0.85,
        shoulderStart: 0.78,
        shoulderSoftness: 0.30,
        highlightDesat: 0.16
      },
      monochrome: { enabled: false, rgbWeights: [0.5, 0.36, 0.14], skinLumBoost: 0.0, skyLumPull: 0.0 },
      colorScience: {
        skinCenterDeg: 25.0,
        skinWidthDeg: 22.0,
        skinHueShiftDeg: -2.0,
        skinSatDelta: -0.14,
        skinLumDelta: 0.10,
        skinTintShield: 0.94,
        skinChromaSmooth: 0.18,
        greenHueShiftDeg: 34.0,
        greenSatDelta: 0.12,
        greenLumDelta: 0.12,
        blueHueShiftDeg: -16.0,
        blueSatDelta: 0.14,
        redSatDelta: 0.08,
        vibrance: 0.16,
        saturation: 1.04,
        shadowTintRGB: [0.05, 0.20, 0.23],
        shadowTintStrength: 0.24,
        highlightTintRGB: [0.99, 1.0, 1.0],
        highlightTintStrength: 0.08
      },
      halation: { enabled: false, threshold: 0.94, knee: 0.08, radiusNorm: 0.012, strength: 0.0, tintRGB: [1.0, 0.95, 0.90], verticalAnisotropy: 1.0 },
      blackMist: { enabled: true, threshold: 0.66, knee: 0.22, radiusNorm: 0.016, strength: 0.16, veil: 0.02 },
      opticsAndGrain: { microContrast: 0.0, edgeSoftness: 0.0, grainMode: "silverHalide", grainAmount: 0.07, grainSizeNorm: 0.85, grainChromaRatio: 0.08, vignetteStrength: 0.0, vignettePower: 2.0, flashCenterBoost: 0.0, lightLeakStrength: 0.0 }
    },
    {
      id: "03_y2k_flash",
      shortLabel: "03 Y2K CCD",
      name: "Y2K CCD & Direct Flash",
      koreanName: "Y2K 디카 직광 플래시",
      moodCue: "2003 IXY · Xenon Pop",
      persona: "김채린 (Y2KFlashAgent)",
      tone: {
        exposureEV: 0.04,
        wbTempShift: -0.18,
        wbTintShift: 0.08,
        blackFloor: [0.012, 0.022, 0.042],
        toeSoftness: 0.08,
        midContrast: 1.24,
        shoulderStart: 0.78,
        shoulderSoftness: 0.18,
        highlightDesat: 0.14
      },
      monochrome: { enabled: false, rgbWeights: [0.5, 0.36, 0.14], skinLumBoost: 0.0, skyLumPull: 0.0 },
      colorScience: {
        skinCenterDeg: 25.0,
        skinWidthDeg: 19.0,
        skinHueShiftDeg: -2.5,
        skinSatDelta: -0.06,
        skinLumDelta: 0.06,
        skinTintShield: 0.88,
        skinChromaSmooth: 0.14,
        greenHueShiftDeg: 10.0,
        greenSatDelta: 0.08,
        greenLumDelta: 0.0,
        blueHueShiftDeg: -10.0,
        blueSatDelta: 0.22,
        redSatDelta: 0.14,
        vibrance: 0.14,
        saturation: 1.12,
        shadowTintRGB: [0.04, 0.18, 0.32],
        shadowTintStrength: 0.34,
        highlightTintRGB: [0.97, 0.98, 1.0],
        highlightTintStrength: 0.10
      },
      halation: { enabled: true, threshold: 0.96, knee: 0.05, radiusNorm: 0.014, strength: 0.30, tintRGB: [0.80, 0.92, 1.0], verticalAnisotropy: 2.2 },
      blackMist: { enabled: false, threshold: 0.70, knee: 0.20, radiusNorm: 0.012, strength: 0.0, veil: 0.0 },
      opticsAndGrain: { microContrast: 0.08, edgeSoftness: 0.0, grainMode: "ccdSensor", grainAmount: 0.12, grainSizeNorm: 0.90, grainChromaRatio: 0.36, vignetteStrength: 0.42, vignettePower: 3.4, flashCenterBoost: 0.09, lightLeakStrength: 0.0 }
    },
    {
      id: "04_nocturne_cinema",
      shortLabel: "04 NOCTURNE",
      name: "Nocturne Cinema & Halation",
      koreanName: "야간 시네마 할레이션",
      moodCue: "CineStill 800T · Neon Glow",
      persona: "진우성 (NocturneCinemaAgent)",
      tone: {
        exposureEV: -0.06,
        wbTempShift: -0.24,
        wbTintShift: -0.04,
        blackFloor: [0.016, 0.036, 0.048],
        toeSoftness: 0.18,
        midContrast: 1.22,
        shoulderStart: 0.70,
        shoulderSoftness: 0.30,
        highlightDesat: 0.18
      },
      monochrome: { enabled: false, rgbWeights: [0.5, 0.36, 0.14], skinLumBoost: 0.0, skyLumPull: 0.0 },
      colorScience: {
        skinCenterDeg: 25.0,
        skinWidthDeg: 18.0,
        skinHueShiftDeg: 1.0,
        skinSatDelta: 0.04,
        skinLumDelta: 0.04,
        skinTintShield: 0.88,
        skinChromaSmooth: 0.05,
        greenHueShiftDeg: 22.0,
        greenSatDelta: -0.10,
        greenLumDelta: -0.04,
        blueHueShiftDeg: -12.0,
        blueSatDelta: 0.16,
        redSatDelta: 0.22,
        vibrance: 0.12,
        saturation: 1.08,
        shadowTintRGB: [0.04, 0.24, 0.30],
        shadowTintStrength: 0.44,
        highlightTintRGB: [1.0, 0.93, 0.88],
        highlightTintStrength: 0.10
      },
      halation: { enabled: true, threshold: 0.915, knee: 0.065, radiusNorm: 0.032, strength: 0.95, tintRGB: [1.0, 0.18, 0.03], verticalAnisotropy: 1.0 },
      blackMist: { enabled: false, threshold: 0.72, knee: 0.20, radiusNorm: 0.016, strength: 0.0, veil: 0.0 },
      opticsAndGrain: { microContrast: 0.08, edgeSoftness: 0.0, grainMode: "silverHalide", grainAmount: 0.19, grainSizeNorm: 1.15, grainChromaRatio: 0.16, vignetteStrength: 0.26, vignettePower: 3.4, flashCenterBoost: 0.0, lightLeakStrength: 0.0 }
    },
    {
      id: "05_lofi_youth",
      shortLabel: "05 LO-FI 90s",
      name: "90s Disposable Youth Lo-Fi",
      koreanName: "일회용 필름 로파이",
      moodCue: "QuickSnap 800 · Raw Grain",
      persona: "박시후 (LoFiYouthAgent)",
      tone: {
        exposureEV: 0.06,
        wbTempShift: -0.04,
        wbTintShift: -0.10,
        blackFloor: [0.038, 0.068, 0.058],
        toeSoftness: 0.30,
        midContrast: 1.16,
        shoulderStart: 0.72,
        shoulderSoftness: 0.28,
        highlightDesat: 0.15
      },
      monochrome: { enabled: false, rgbWeights: [0.5, 0.36, 0.14], skinLumBoost: 0.0, skyLumPull: 0.0 },
      colorScience: {
        skinCenterDeg: 25.0,
        skinWidthDeg: 19.0,
        skinHueShiftDeg: 0.0,
        skinSatDelta: 0.02,
        skinLumDelta: 0.03,
        skinTintShield: 0.84,
        skinChromaSmooth: 0.0,
        greenHueShiftDeg: 16.0,
        greenSatDelta: 0.10,
        greenLumDelta: 0.04,
        blueHueShiftDeg: -8.0,
        blueSatDelta: 0.14,
        redSatDelta: 0.24,
        vibrance: 0.18,
        saturation: 1.14,
        shadowTintRGB: [0.08, 0.28, 0.22],
        shadowTintStrength: 0.32,
        highlightTintRGB: [0.99, 0.98, 0.92],
        highlightTintStrength: 0.12
      },
      halation: { enabled: false, threshold: 0.94, knee: 0.08, radiusNorm: 0.015, strength: 0.0, tintRGB: [1.0, 0.35, 0.10], verticalAnisotropy: 1.0 },
      blackMist: { enabled: false, threshold: 0.70, knee: 0.20, radiusNorm: 0.014, strength: 0.0, veil: 0.0 },
      opticsAndGrain: { microContrast: 0.05, edgeSoftness: 0.42, grainMode: "silverHalide", grainAmount: 0.30, grainSizeNorm: 1.45, grainChromaRatio: 0.22, vignetteStrength: 0.34, vignettePower: 2.8, flashCenterBoost: 0.04, lightLeakStrength: 0.26 }
    },
    {
      id: "06_editorial_mf",
      shortLabel: "06 EDITORIAL",
      name: "Editorial Medium Format",
      koreanName: "에디토리얼 중형 화보",
      moodCue: "Hasselblad · 3D Silk Clarity",
      persona: "서아현 (EditorialPortraitAgent)",
      tone: {
        exposureEV: 0.08,
        wbTempShift: 0.0,
        wbTintShift: 0.0,
        blackFloor: [0.006, 0.006, 0.007],
        toeSoftness: 0.12,
        midContrast: 1.14,
        shoulderStart: 0.74,
        shoulderSoftness: 0.34,
        highlightDesat: 0.10
      },
      monochrome: { enabled: false, rgbWeights: [0.5, 0.36, 0.14], skinLumBoost: 0.0, skyLumPull: 0.0 },
      colorScience: {
        skinCenterDeg: 25.0,
        skinWidthDeg: 21.0,
        skinHueShiftDeg: -0.5,
        skinSatDelta: -0.07,
        skinLumDelta: 0.07,
        skinTintShield: 0.98,
        skinChromaSmooth: 0.48,
        greenHueShiftDeg: -8.0,
        greenSatDelta: -0.06,
        greenLumDelta: -0.02,
        blueHueShiftDeg: 2.0,
        blueSatDelta: -0.04,
        redSatDelta: 0.08,
        vibrance: 0.10,
        saturation: 1.0,
        shadowTintRGB: [0.10, 0.10, 0.11],
        shadowTintStrength: 0.0,
        highlightTintRGB: [1.0, 1.0, 1.0],
        highlightTintStrength: 0.0
      },
      halation: { enabled: false, threshold: 0.96, knee: 0.06, radiusNorm: 0.010, strength: 0.0, tintRGB: [1.0, 1.0, 1.0], verticalAnisotropy: 1.0 },
      blackMist: { enabled: false, threshold: 0.75, knee: 0.20, radiusNorm: 0.012, strength: 0.0, veil: 0.0 },
      opticsAndGrain: { microContrast: 0.24, edgeSoftness: 0.0, grainMode: "silverHalide", grainAmount: 0.0, grainSizeNorm: 0.80, grainChromaRatio: 0.0, vignetteStrength: 0.10, vignettePower: 3.8, flashCenterBoost: 0.0, lightLeakStrength: 0.0 }
    },
    {
      id: "07_pure_monochrome",
      shortLabel: "07 MONOCHROM",
      name: "Pure Silver Monochrome",
      koreanName: "정통 은염 흑백",
      moodCue: "Tri-X 400 · Zone System",
      persona: "노태현 (MonochromeStreetAgent)",
      tone: {
        exposureEV: 0.04,
        wbTempShift: 0.0,
        wbTintShift: 0.0,
        blackFloor: [0.006, 0.006, 0.006],
        toeSoftness: 0.10,
        midContrast: 1.32,
        shoulderStart: 0.74,
        shoulderSoftness: 0.28,
        highlightDesat: 0.0
      },
      monochrome: { enabled: true, rgbWeights: [0.52, 0.35, 0.13], skinLumBoost: 0.16, skyLumPull: 0.24 },
      colorScience: {
        skinCenterDeg: 25.0,
        skinWidthDeg: 20.0,
        skinHueShiftDeg: 0.0,
        skinSatDelta: 0.0,
        skinLumDelta: 0.0,
        skinTintShield: 1.0,
        skinChromaSmooth: 0.0,
        greenHueShiftDeg: 0.0,
        greenSatDelta: 0.0,
        greenLumDelta: 0.0,
        blueHueShiftDeg: 0.0,
        blueSatDelta: 0.0,
        redSatDelta: 0.0,
        vibrance: 0.0,
        saturation: 0.0,
        shadowTintRGB: [0.10, 0.10, 0.10],
        shadowTintStrength: 0.0,
        highlightTintRGB: [1.0, 1.0, 1.0],
        highlightTintStrength: 0.0
      },
      halation: { enabled: false, threshold: 0.95, knee: 0.08, radiusNorm: 0.012, strength: 0.0, tintRGB: [1.0, 1.0, 1.0], verticalAnisotropy: 1.0 },
      blackMist: { enabled: false, threshold: 0.72, knee: 0.20, radiusNorm: 0.014, strength: 0.0, veil: 0.0 },
      opticsAndGrain: { microContrast: 0.28, edgeSoftness: 0.0, grainMode: "silverHalide", grainAmount: 0.24, grainSizeNorm: 1.25, grainChromaRatio: 0.0, vignetteStrength: 0.22, vignettePower: 3.2, flashCenterBoost: 0.0, lightLeakStrength: 0.0 }
    },
    {
      id: "08_dreamy_instant",
      shortLabel: "08 DREAMY",
      name: "Dreamy Instant & Diffusion",
      koreanName: "몽환 즉석 블랙 미스트",
      moodCue: "SX-70 · Black Mist 1/4",
      persona: "릴리 정 (DreamyInstantAgent)",
      tone: {
        exposureEV: 0.18,
        wbTempShift: 0.06,
        wbTintShift: 0.06,
        blackFloor: [0.062, 0.066, 0.080],
        toeSoftness: 0.45,
        midContrast: 0.80,
        shoulderStart: 0.62,
        shoulderSoftness: 0.48,
        highlightDesat: 0.24
      },
      monochrome: { enabled: false, rgbWeights: [0.5, 0.36, 0.14], skinLumBoost: 0.0, skyLumPull: 0.0 },
      colorScience: {
        skinCenterDeg: 25.0,
        skinWidthDeg: 22.0,
        skinHueShiftDeg: -1.5,
        skinSatDelta: -0.10,
        skinLumDelta: 0.08,
        skinTintShield: 0.90,
        skinChromaSmooth: 0.24,
        greenHueShiftDeg: 20.0,
        greenSatDelta: -0.16,
        greenLumDelta: 0.06,
        blueHueShiftDeg: -12.0,
        blueSatDelta: -0.12,
        redSatDelta: -0.06,
        vibrance: 0.02,
        saturation: 0.92,
        shadowTintRGB: [0.14, 0.22, 0.25],
        shadowTintStrength: 0.30,
        highlightTintRGB: [1.0, 0.95, 0.94],
        highlightTintStrength: 0.22
      },
      halation: { enabled: false, threshold: 0.94, knee: 0.08, radiusNorm: 0.016, strength: 0.0, tintRGB: [1.0, 0.95, 0.94], verticalAnisotropy: 1.0 },
      blackMist: { enabled: true, threshold: 0.56, knee: 0.24, radiusNorm: 0.024, strength: 0.58, veil: 0.05 },
      opticsAndGrain: { microContrast: 0.0, edgeSoftness: 0.0, grainMode: "silverHalide", grainAmount: 0.10, grainSizeNorm: 1.0, grainChromaRatio: 0.10, vignetteStrength: 0.14, vignettePower: 2.4, flashCenterBoost: 0.0, lightLeakStrength: 0.0 }
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
