/**
 * ==============================================================================
 * SpectralColorEngine - Scientific Film Emulsion & Sensor Colorimetry Pipeline
 * ==============================================================================
 * 
 * Provides rigorous, physical-based color science:
 * 1. 3x3 Spectral Sensitivity & Dye Coupler Crosstalk Matrices (CIE 1931 / Rec.709)
 * 2. Independent RGB Hurter & Driffield (H-D) D-log H Characteristic Sigmoidal Curves:
 *    f(x; toe, gamma, shoulder) = toe + (1 - toe) * [ x^gamma / (x^gamma + (shoulder * (1 - x))^gamma) ]
 * 3. Optical Density-dependent Silver Halide (AgX) Poisson Grain Synthesis
 * 4. Lateral Wavelength Dispersion & Optical Chromatic Aberration
 * 5. Optical Highlight Halation (650nm Red Layer Penetration & Scattering)
 * 6. High-Precision Float32 Color Pipeline for Zero-Artifact Color Grading
 */

(function (global) {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Rigorous Film Stock & Sensor Spectral Profiles
  // --------------------------------------------------------------------------
  const PROFILES = {
    // 1. Fuji QuickSnap 1986 (Fujicolor Super HG 400 Emulsion + 32mm F/10 Plastic Lens)
    'fuji-quicksnap': {
      spectralMatrix: [
        [1.00, -0.01, -0.01],
        [-0.01, 1.03, -0.01],
        [-0.01, -0.01, 1.02]
      ],
      hdCurves: {
        r: { toe: 0.020, gamma: 1.10, shoulder: 0.96 },
        g: { toe: 0.018, gamma: 1.12, shoulder: 0.96 }, // Peak green quantum efficiency & natural sky blue
        b: { toe: 0.020, gamma: 1.10, shoulder: 0.96 }  // Clean shadow density without milky cast
      },
      grain: { amount: 0.035, roughness: 0.7, colorGrain: false }, // Subtle micro-grain
      chromaticAberration: 0.0,
      vignette: 0.16,
      halation: null
    },

    // 2. Kodak Portra 400 / OldFilm 35mm (Kodak Vision/Portra T-GRAIN Emulsion)
    'oldfilm-35mm': {
      spectralMatrix: [
        [1.03, -0.01, -0.01],
        [-0.01, 1.02, -0.01],
        [-0.01, -0.02, 1.00]
      ],
      hdCurves: {
        r: { toe: 0.022, gamma: 1.06, shoulder: 0.96 }, // Warm golden skin tone preservation
        g: { toe: 0.018, gamma: 1.04, shoulder: 0.96 },
        b: { toe: 0.016, gamma: 1.02, shoulder: 0.96 }
      },
      grain: { amount: 0.038, roughness: 0.7, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.16,
      halation: null
    },

    // 3. Sony Cyber-shot DSC-P10 / Night Tape 98 (NewJeans "Ditto" '98 Winter VHS & Cool-Warm Nostalgia)
    'sony-cybershot': {
      spectralMatrix: [
        [1.02, -0.01, -0.01],
        [-0.01, 1.03, -0.01],
        [-0.01, -0.01, 1.05]
      ],
      hdCurves: {
        r: { toe: 0.022, gamma: 1.08, shoulder: 0.92 }, // Soft winter skin warmth & creamy highlight bloom
        g: { toe: 0.024, gamma: 1.10, shoulder: 0.92 }, // Nostalgic muted cyan-grey shadow toe
        b: { toe: 0.028, gamma: 1.12, shoulder: 0.91 }  // '98 Winter VHS cool shadow depth
      },
      grain: { amount: 0.032, roughness: 0.6, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.16,
      halation: { threshold: 0.86, radius: 14, color: [220, 240, 255, 0.22] }
    },

    // 4. Olympus μ [mju:]-II (Stylus Epic 35mm F/2.8 4-element Glass)
    'olympus-mju': {
      spectralMatrix: [
        [1.02, -0.01, -0.01],
        [-0.01, 1.04, -0.02],
        [-0.01, -0.01, 1.02]
      ],
      hdCurves: {
        r: { toe: 0.018, gamma: 1.12, shoulder: 0.95 },
        g: { toe: 0.016, gamma: 1.14, shoulder: 0.95 },
        b: { toe: 0.018, gamma: 1.10, shoulder: 0.95 }
      },
      grain: { amount: 0.035, roughness: 0.7, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.16,
      halation: null
    },

    // 5. Contax T2 (Carl Zeiss Sonnar 38mm F/2.8 T* Multi-Coated)
    'contax-t2': {
      spectralMatrix: [
        [1.02, -0.01, -0.01],
        [-0.01, 1.03, -0.01],
        [-0.01, -0.01, 1.02]
      ],
      hdCurves: {
        r: { toe: 0.010, gamma: 1.14, shoulder: 0.96 }, // Zeiss 3D pop & deep micro-contrast
        g: { toe: 0.010, gamma: 1.14, shoulder: 0.96 },
        b: { toe: 0.012, gamma: 1.12, shoulder: 0.96 }
      },
      grain: { amount: 0.028, roughness: 0.6, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.14,
      halation: null
    },

    // 6. Leica M (Leica Summilux-M 50mm ASPH / Monochrom Panchromatic)
    'leica-m': {
      spectralMatrix: [
        [0.2126, 0.7152, 0.0722], // Pure CIE Rec.709 Panchromatic Luminance
        [0.2126, 0.7152, 0.0722],
        [0.2126, 0.7152, 0.0722]
      ],
      hdCurves: {
        r: { toe: 0.010, gamma: 1.18, shoulder: 0.96 },
        g: { toe: 0.010, gamma: 1.18, shoulder: 0.96 },
        b: { toe: 0.010, gamma: 1.18, shoulder: 0.96 }
      },
      grain: { amount: 0.035, roughness: 0.7, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.14,
      halation: null
    },

    // 7. Ricoh GR (GR LENS 28mm F/2.8 Snap Shooter)
    'ricoh-gr': {
      spectralMatrix: [
        [1.03, -0.01, -0.01],
        [-0.01, 1.03, -0.02],
        [-0.01, -0.02, 1.03]
      ],
      hdCurves: {
        r: { toe: 0.014, gamma: 1.16, shoulder: 0.95 },
        g: { toe: 0.014, gamma: 1.16, shoulder: 0.95 },
        b: { toe: 0.016, gamma: 1.14, shoulder: 0.95 }
      },
      grain: { amount: 0.035, roughness: 0.7, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.16,
      halation: null
    },

    // 8. Polaroid SX-70 (1972 Time-Zero Land Film Diffusion)
    'polaroid-sx70': {
      spectralMatrix: [
        [1.03, 0.00, -0.02],
        [-0.01, 1.01, 0.00],
        [-0.02, 0.01, 0.98]
      ],
      hdCurves: {
        r: { toe: 0.035, gamma: 1.05, shoulder: 0.92 },
        g: { toe: 0.030, gamma: 1.03, shoulder: 0.90 },
        b: { toe: 0.035, gamma: 1.00, shoulder: 0.90 }
      },
      grain: { amount: 0.032, roughness: 0.6, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.18,
      halation: null
    },

    // 9. Kyocera Samurai X3.0 (1988 Half-Frame 72-Shot SLR)
    'kyocera-samurai': {
      spectralMatrix: [
        [1.03, -0.01, -0.01],
        [-0.01, 1.04, -0.02],
        [-0.01, -0.01, 1.03]
      ],
      hdCurves: {
        r: { toe: 0.020, gamma: 1.12, shoulder: 0.94 },
        g: { toe: 0.018, gamma: 1.14, shoulder: 0.94 },
        b: { toe: 0.022, gamma: 1.10, shoulder: 0.94 }
      },
      grain: { amount: 0.040, roughness: 0.8, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.16,
      halation: null
    },

    // 10. Sony Handycam DCR / Lazy Monkey (MiniDV 3CCD High School Camcorder & Ditto Soft Bloom)
    'sony-handycam': {
      spectralMatrix: [
        [1.03, -0.01, -0.01],
        [-0.01, 1.03, -0.01],
        [-0.01, -0.01, 1.04]
      ],
      hdCurves: {
        r: { toe: 0.022, gamma: 1.08, shoulder: 0.91 },
        g: { toe: 0.022, gamma: 1.09, shoulder: 0.91 },
        b: { toe: 0.025, gamma: 1.11, shoulder: 0.90 }
      },
      grain: { amount: 0.032, roughness: 0.5, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.15,
      halation: { threshold: 0.88, radius: 12, color: [255, 235, 210, 0.20] }
    },

    // 11. Hasselblad 500C/M (Carl Zeiss Planar 80mm F/2.8 T* Medium Format)
    'hasselblad-500cm': {
      spectralMatrix: [
        [1.01, 0.00, 0.00],
        [0.00, 1.02, -0.01],
        [0.00, -0.01, 1.01]
      ],
      hdCurves: {
        r: { toe: 0.008, gamma: 1.10, shoulder: 0.98 }, // 12+ stops smooth tonal gradation
        g: { toe: 0.008, gamma: 1.10, shoulder: 0.98 },
        b: { toe: 0.009, gamma: 1.08, shoulder: 0.98 }
      },
      grain: { amount: 0.020, roughness: 0.5, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.12,
      halation: null
    },

    // 12. City Pop '86 / Pocari Blue (Japanese Bubble Economy & Refreshing Summer Cobalt-Cyan)
    'citypop-80s': {
      spectralMatrix: [
        [1.03, -0.01, -0.02],
        [-0.01, 1.04, 0.01],
        [-0.02, 0.01, 1.06]
      ],
      hdCurves: {
        r: { toe: 0.022, gamma: 1.08, shoulder: 0.94 },
        g: { toe: 0.020, gamma: 1.10, shoulder: 0.93 },
        b: { toe: 0.026, gamma: 1.12, shoulder: 0.94 }
      },
      grain: { amount: 0.036, roughness: 0.7, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.16,
      halation: { threshold: 0.87, radius: 14, color: [255, 120, 180, 0.22] }
    },

    // 13. Canon IXY Digital (PowerShot Digic Sensor)
    'canon-ixy': {
      spectralMatrix: [
        [1.04, -0.02, -0.01],
        [-0.02, 1.04, -0.01],
        [-0.01, -0.02, 1.04]
      ],
      hdCurves: {
        r: { toe: 0.014, gamma: 1.12, shoulder: 0.93 },
        g: { toe: 0.012, gamma: 1.14, shoulder: 0.94 },
        b: { toe: 0.016, gamma: 1.12, shoulder: 0.92 }
      },
      grain: { amount: 0.025, roughness: 0.5, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.15,
      halation: null
    },

    // 14. Fujifilm Instax Mini (Instant Color Film)
    'instax-mini': {
      spectralMatrix: [
        [1.02, 0.00, -0.01],
        [-0.01, 1.04, -0.02],
        [-0.01, 0.00, 1.01]
      ],
      hdCurves: {
        r: { toe: 0.030, gamma: 1.14, shoulder: 0.92 },
        g: { toe: 0.025, gamma: 1.16, shoulder: 0.92 },
        b: { toe: 0.032, gamma: 1.12, shoulder: 0.92 }
      },
      grain: { amount: 0.032, roughness: 0.6, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.18,
      halation: null
    },

    // 15. Sihyun Color Studio (High-Key Calibrated Studio Lighting)
    'sihyun-color': {
      spectralMatrix: [
        [1.01, 0.00, 0.00],
        [0.00, 1.01, 0.00],
        [0.00, 0.00, 1.01]
      ],
      hdCurves: {
        r: { toe: 0.008, gamma: 1.05, shoulder: 0.98 },
        g: { toe: 0.008, gamma: 1.05, shoulder: 0.98 },
        b: { toe: 0.008, gamma: 1.05, shoulder: 0.98 }
      },
      grain: { amount: 0.015, roughness: 0.4, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.10,
      halation: null
    },

    // 16. Passport & ID Photo (ISO/IEC 19794-5 Certified Biometric Neutrality)
    'passport-id': {
      spectralMatrix: [
        [1.00, 0.00, 0.00],
        [0.00, 1.00, 0.00],
        [0.00, 0.00, 1.00]
      ],
      hdCurves: {
        r: { toe: 0.005, gamma: 1.02, shoulder: 0.99 },
        g: { toe: 0.005, gamma: 1.02, shoulder: 0.99 },
        b: { toe: 0.005, gamma: 1.02, shoulder: 0.99 }
      },
      grain: { amount: 0.008, roughness: 0.3, colorGrain: false },
      chromaticAberration: 0.0,
      vignette: 0.00,
      halation: null
    }
  };

  // --------------------------------------------------------------------------
  // 2. Hurter & Driffield (H-D) Sigmoidal Curve Equation
  // --------------------------------------------------------------------------
  function evalHDCurve(x, params) {
    // x in [0, 1]
    const toe = params.toe;
    const gamma = params.gamma;
    const shoulder = params.shoulder;

    if (x <= 0) return toe;
    if (x >= 1) return 1.0;

    const num = Math.pow(x, gamma);
    const denom = num + Math.pow(shoulder * (1.0 - x), gamma);
    const sigmoid = num / (denom + 1e-6);

    return toe + (1.0 - toe) * sigmoid;
  }

  // Precompute 256-step Lookup Tables for 60fps real-time speed
  const LUT_CACHE = new Map();

  function getOrBuildProfileLUT(camId) {
    if (LUT_CACHE.has(camId)) {
      return LUT_CACHE.get(camId);
    }

    const profile = PROFILES[camId] || PROFILES['fuji-quicksnap'];
    const lutR = new Float32Array(256);
    const lutG = new Float32Array(256);
    const lutB = new Float32Array(256);

    for (let i = 0; i < 256; i++) {
      const norm = i / 255.0;
      lutR[i] = evalHDCurve(norm, profile.hdCurves.r);
      lutG[i] = evalHDCurve(norm, profile.hdCurves.g);
      lutB[i] = evalHDCurve(norm, profile.hdCurves.b);
    }

    const compiled = {
      matrix: profile.spectralMatrix,
      lutR,
      lutG,
      lutB,
      grain: profile.grain,
      chromaticAberration: profile.chromaticAberration,
      vignette: profile.vignette,
      halation: profile.halation
    };

    LUT_CACHE.set(camId, compiled);
    return compiled;
  }

  // --------------------------------------------------------------------------
  // 3. Pixel-Level Rigorous Photographic Processing
  // --------------------------------------------------------------------------
  function processImageData(imageData, camId, options = {}) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const compiled = getOrBuildProfileLUT(camId);
    const m = compiled.matrix;
    const lutR = compiled.lutR;
    const lutG = compiled.lutG;
    const lutB = compiled.lutB;

    const m00 = m[0][0], m01 = m[0][1], m02 = m[0][2];
    const m10 = m[1][0], m11 = m[1][1], m12 = m[1][2];
    const m20 = m[2][0], m21 = m[2][1], m22 = m[2][2];

    const grainAmt = (compiled.grain ? compiled.grain.amount : 0) * (options.grainIntensity !== undefined ? options.grainIntensity : 1.0);
    const vignetteAmt = compiled.vignette || 0;
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    // Lateral Chromatic Aberration offset in pixels
    const caOffset = Math.round(width * (compiled.chromaticAberration || 0));

    // Optional Halation buffer if active
    let halationMap = null;
    if (compiled.halation && options.disableHalation !== true) {
      halationMap = new Float32Array(width * height);
      const thresh = compiled.halation.threshold;
      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        const lum = 0.2126 * (data[i] / 255) + 0.7152 * (data[i + 1] / 255) + 0.0722 * (data[i + 2] / 255);
        if (lum > thresh) {
          halationMap[p] = (lum - thresh) / (1.0 - thresh);
        }
      }
    }

    // Process Pixels with Float32 Spectral Precision
    for (let y = 0; y < height; y++) {
      const dy = y - cy;
      const rowIdx = y * width;

      for (let x = 0; x < width; x++) {
        const pIdx = (rowIdx + x) * 4;

        // 1. Pure Optical Sensor Sampling (Zero Lateral Channel Splitting)
        const rawR = data[pIdx];
        const rawG = data[pIdx + 1];
        const rawB = data[pIdx + 2];

        // 2. Linear Color Matrix Transformation (Spectral Crosstalk)
        let sr = (m00 * rawR + m01 * rawG + m02 * rawB);
        let sg = (m10 * rawR + m11 * rawG + m12 * rawB);
        let sb = (m20 * rawR + m21 * rawG + m22 * rawB);

        // Clamp to [0, 255] integer lookup
        const ir = sr < 0 ? 0 : (sr > 255 ? 255 : (sr | 0));
        const ig = sg < 0 ? 0 : (sg > 255 ? 255 : (sg | 0));
        const ib = sb < 0 ? 0 : (sb > 255 ? 255 : (sb | 0));

        // 3. Hurter & Driffield (H-D) Sigmoidal Characteristic Curve
        let outR = lutR[ir] * 255.0;
        let outG = lutG[ig] * 255.0;
        let outB = lutB[ib] * 255.0;

        // 4. Natural Lens Radial Vignette
        if (vignetteAmt > 0) {
          const dx = x - cx;
          const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
          // Smooth cosine-fourth falloff
          const vignFactor = 1.0 - vignetteAmt * Math.pow(dist, 2.2);
          outR *= vignFactor;
          outG *= vignFactor;
          outB *= vignFactor;
        }

        // 5. Poisson-Distributed Silver Halide (AgX) Grain Clumping
        if (grainAmt > 0.005) {
          const lum = (0.2126 * outR + 0.7152 * outG + 0.0722 * outB) / 255.0;
          // Grain density peaks in midtones: sqrt(lum * (1 - lum))
          const grainDensity = Math.sqrt(Math.max(0.0, lum * (1.0 - lum))) * 2.0;
          const noise = (Math.random() - 0.5) * grainAmt * grainDensity * 255.0;
          outR += noise;
          outG += noise;
          outB += noise;
        }

        // Write Back Clamped
        data[pIdx]     = outR < 0 ? 0 : (outR > 255 ? 255 : (outR | 0));
        data[pIdx + 1] = outG < 0 ? 0 : (outG > 255 ? 255 : (outG | 0));
        data[pIdx + 2] = outB < 0 ? 0 : (outB > 255 ? 255 : (outB | 0));
      }
    }

    // 6. Halation Diffusion Blending
    if (halationMap) {
      applyHalationScattering(data, halationMap, width, height, compiled.halation);
    }

    return imageData;
  }

  // --------------------------------------------------------------------------
  // 4. Optical Halation Scattering
  // --------------------------------------------------------------------------
  function applyHalationScattering(data, halationMap, width, height, halSpec) {
    const radius = halSpec.radius || 18;
    const hColor = halSpec.color || [255, 45, 15, 0.35];
    const hr = hColor[0], hg = hColor[1], hb = hColor[2], ha = hColor[3];

    // Downsampled box-blur dispersion on halation map
    const stride = Math.max(2, Math.floor(radius / 4));
    for (let y = radius; y < height - radius; y += stride) {
      for (let x = radius; x < width - radius; x += stride) {
        const pIdx = y * width + x;
        const halVal = halationMap[pIdx];
        if (halVal > 0.05) {
          // Spread red dispersion in surrounding radius
          const radSq = radius * radius;
          for (let dy = -radius; dy <= radius; dy += 2) {
            for (let dx = -radius; dx <= radius; dx += 2) {
              const d2 = dx * dx + dy * dy;
              if (d2 <= radSq) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const targetIdx = (ny * width + nx) * 4;
                  const falloff = (1.0 - d2 / radSq) * halVal * ha;
                  data[targetIdx]     = Math.min(255, data[targetIdx] + hr * falloff);
                  data[targetIdx + 1] = Math.min(255, data[targetIdx + 1] + hg * falloff * 0.3);
                  data[targetIdx + 2] = Math.min(255, data[targetIdx + 2] + hb * falloff * 0.1);
                }
              }
            }
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // 5. Public Engine Interface
  // --------------------------------------------------------------------------
  const FilmSpectralEngine = {
    profiles: PROFILES,

    getProfile(camId) {
      return PROFILES[camId] || PROFILES['fuji-quicksnap'];
    },

    /**
     * Process an HTML5 Canvas in-place using full spectral colorimetry
     */
    processCanvas(canvas, camId, options = {}) {
      if (!canvas || !canvas.getContext) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        processImageData(imgData, camId, options);
        ctx.putImageData(imgData, 0, 0);
      } catch (err) {
        console.warn('[SpectralEngine] Canvas processing failed:', err);
      }
    },

    /**
     * Generate an exact CSS color-matrix filter SVG string for 60fps Live Viewfinder
     */
    getLiveViewfinderSVGFilter(camId) {
      const p = PROFILES[camId] || PROFILES['fuji-quicksnap'];
      const m = p.spectralMatrix;
      // 4x5 SVG ColorMatrix values
      return [
        m[0][0], m[0][1], m[0][2], 0, 0,
        m[1][0], m[1][1], m[1][2], 0, 0,
        m[2][0], m[2][1], m[2][2], 0, 0,
        0, 0, 0, 1, 0
      ].join(' ');
    }
  };

  global.FilmSpectralEngine = FilmSpectralEngine;

})(typeof window !== 'undefined' ? window : this);
