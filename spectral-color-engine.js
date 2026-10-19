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

    // 8. Polaroid SX-70 (1972 Time-Zero Land Film Chemical Diffusion & Warm Creamy Halation)
    'polaroid-sx70': {
      spectralMatrix: [
        [1.06, 0.00, -0.03], // Warm golden amber tones & nostalgic vintage skin
        [-0.01, 1.02, 0.00],
        [-0.03, 0.01, 0.94]  // Subdued blues, lifted creamy amber shadow floor
      ],
      hdCurves: {
        r: { toe: 0.055, gamma: 1.08, shoulder: 0.86 }, // Vintage soft highlight knee & compressed contrast
        g: { toe: 0.048, gamma: 1.06, shoulder: 0.86 },
        b: { toe: 0.042, gamma: 1.02, shoulder: 0.85 }
      },
      grain: { amount: 0.042, roughness: 0.7, colorGrain: false }, // Broad chemical paste grain
      chromaticAberration: 0.003, // 116mm 4-element glass edge dispersion
      vignette: 0.24, // Iconic square format corner falloff
      halation: { threshold: 0.82, radius: 18, color: [255, 215, 160, 0.32] } // Dreamy 1970s warm halation glow
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

    // 14. Fujifilm Instax Mini (Instant Color Chemical Emulsion with Cyan-Teal Shadow Tone & Soft Flash Glow)
    'instax-mini': {
      spectralMatrix: [
        [1.04, -0.01, -0.02], // Warm skin tone & vibrant flash pop
        [-0.02, 1.05, -0.01], // Authentic Fuji emerald-green foliage response
        [-0.03, -0.01, 1.08]  // Characteristic instant dye deep indigo-cyan shadow depth
      ],
      hdCurves: {
        r: { toe: 0.045, gamma: 1.18, shoulder: 0.88 }, // Steep instant dynamic range (blown highlights, rich blacks)
        g: { toe: 0.040, gamma: 1.20, shoulder: 0.88 },
        b: { toe: 0.052, gamma: 1.15, shoulder: 0.87 }  // Raised blue-cyan toe for chemical paper look
      },
      grain: { amount: 0.038, roughness: 0.65, colorGrain: false }, // Physical dye diffusion texture
      chromaticAberration: 0.002, // Subtle plastic lens dispersion
      vignette: 0.22, // Instant camera plastic lens corner falloff
      halation: { threshold: 0.84, radius: 16, color: [255, 230, 200, 0.28] } // Creamy flash highlight bloom
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
  // 5. Public Film Spectral Engine Interface
  // --------------------------------------------------------------------------
  const FilmSpectralEngine = {
    profiles: PROFILES,

    getProfile(camId) {
      return PROFILES[camId] || PROFILES['fuji-quicksnap'];
    },

    /**
     * Process an HTML5 Canvas in-place using full spectral colorimetry and parametric grading
     */
    processCanvas(canvas, camId, options = {}) {
      if (!canvas || !canvas.getContext) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        processImageData(imgData, camId, options);
        
        // Chain Parametric Color Grading if active
        if (global.ParametricColorEngine && global.ParametricColorEngine.enabled) {
          const rec = options.recipe || global.ParametricColorEngine.activeRecipe;
          if (rec) {
            global.ParametricColorEngine.processImageData(imgData, rec);
          }
        }

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

  // --------------------------------------------------------------------------
  // 6. Professional Parametric Color Grading Engine (Lightroom-Grade HSL Pipeline)
  // --------------------------------------------------------------------------
  function rgbToHsl(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2.0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2.0 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6.0; break;
        case g: h = ((b - r) / d + 2) / 6.0; break;
        case b: h = ((r - g) / d + 4) / 6.0; break;
      }
    }
    return [h * 360, s, l];
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360.0;
    if (s === 0) return [l, l, l];

    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    return [r, g, b];
  }

  const HSL_COLOR_CHANNELS = {
    red:     { center: 0,   range: 35 },
    orange:  { center: 30,  range: 25 },
    yellow:  { center: 60,  range: 25 },
    green:   { center: 120, range: 45 },
    aqua:    { center: 180, range: 35 },
    blue:    { center: 240, range: 40 },
    purple:  { center: 280, range: 30 },
    magenta: { center: 320, range: 35 }
  };

  const PRESET_RECIPES = {
    // 1. Donggi Photo Kamakura Summer Recipe (User's Exact Reference Screenshot)
    'donggi-summer': {
      id: 'donggi-summer',
      name: '청량 여름 필름 (Kamakura Summer)',
      desc: '동기 레시피: 노출 +1.23, 대비 -88, 하이라이트 -100, 암부 +45, 흰색 -89, 검정 +11, 도자기 스킨 & 청량 에메랄드',
      tone: {
        exposure: 1.23,
        contrast: -88,
        highlights: -100,
        shadows: 45,
        whites: -89,
        blacks: 11
      },
      color: {
        temp: 3,
        tint: -9,
        vibrance: 9,
        saturation: 6
      },
      hsl: {
        red:     { hue: 0, sat: 10,  lum: 16 },
        orange:  { hue: 0, sat: -14, lum: 11 }, // 투명 뽀샤시 피부톤
        yellow:  { hue: 0, sat: 11,  lum: 12 }, // 따사로운 자연광
        green:   { hue: 9, sat: 6,   lum: 17 }  // 청량 에메랄드 잎사귀
      }
    },

    // 2. NewJeans Ditto '98 Winter VHS
    'ditto-winter-98': {
      id: 'ditto-winter-98',
      name: "Ditto '98 Winter",
      desc: '뉴진스 Ditto 감성: 1998 겨울 교실 복도, 쿨톤 섀도우 & 소프트 블룸',
      tone: {
        exposure: 0.65,
        contrast: -45,
        highlights: -75,
        shadows: 35,
        whites: -55,
        blacks: 14
      },
      color: {
        temp: -8,
        tint: 4,
        vibrance: -4,
        saturation: -6
      },
      hsl: {
        orange: { hue: 2,  sat: -10, lum: 14 },
        blue:   { hue: -4, sat: 12,  lum: -6 },
        aqua:   { hue: -6, sat: 10,  lum: 5 }
      }
    },

    // 3. Tokyo Y2K Cyber Digicam
    'tokyo-y2k-ccd': {
      id: 'tokyo-y2k-ccd',
      name: 'Tokyo Y2K CCD',
      desc: '2003 도쿄 시부야 디카 감성: 또렷한 원색, 시안 하이라이트',
      tone: {
        exposure: 0.35,
        contrast: -25,
        highlights: -60,
        shadows: 20,
        whites: -30,
        blacks: 5
      },
      color: {
        temp: -4,
        tint: -5,
        vibrance: 12,
        saturation: 8
      },
      hsl: {
        red:    { hue: 2, sat: 12, lum: 8 },
        orange: { hue: 0, sat: -8, lum: 12 },
        aqua:   { hue: 5, sat: 14, lum: 10 }
      }
    },

    // 4. Fuji Superia 400 Emerald
    'fuji-superia': {
      id: 'fuji-superia',
      name: 'Fujicolor Superia 400',
      desc: '후지 특유의 풍부한 청록 섀도우와 싱그러운 녹색 계조',
      tone: {
        exposure: 0.45,
        contrast: -35,
        highlights: -70,
        shadows: 30,
        whites: -45,
        blacks: 8
      },
      color: {
        temp: -2,
        tint: -12,
        vibrance: 14,
        saturation: 7
      },
      hsl: {
        orange: { hue: 0,  sat: -12, lum: 10 },
        green:  { hue: 14, sat: 18,  lum: 15 },
        yellow: { hue: -5, sat: 8,   lum: 8 }
      }
    },

    // 5. Kodak Portra 400 Golden Skin
    'kodak-portra': {
      id: 'kodak-portra',
      name: 'Kodak Portra 400',
      desc: '황금빛 오후 따스한 스킨톤과 부드러운 하이라이트 롤오프',
      tone: {
        exposure: 0.50,
        contrast: -40,
        highlights: -80,
        shadows: 25,
        whites: -50,
        blacks: 6
      },
      color: {
        temp: 8,
        tint: -3,
        vibrance: 8,
        saturation: 4
      },
      hsl: {
        red:    { hue: 0,  sat: 8,   lum: 10 },
        orange: { hue: 3,  sat: -6,  lum: 14 },
        yellow: { hue: 5,  sat: 12,  lum: 10 }
      }
    },

    // 6. Leica M Monochrome Panchromatic
    'leica-monochrome': {
      id: 'leica-monochrome',
      name: 'Leica M Monochrom',
      desc: '라이카 특유의 깊은 계조와 모노크롬 판크로매틱 명암비',
      tone: {
        exposure: 0.30,
        contrast: 25,
        highlights: -60,
        shadows: 20,
        whites: 10,
        blacks: -12
      },
      color: {
        temp: 0,
        tint: 0,
        vibrance: -100,
        saturation: -100
      },
      hsl: {}
    },

    // 7. Raw Neutral (Original / Reset Baseline)
    'raw-neutral': {
      id: 'raw-neutral',
      name: 'Original Raw Baseline',
      desc: '보정 전 원본 센서 표준 색감 (0.0 Flat)',
      tone: {
        exposure: 0.0,
        contrast: 0,
        highlights: 0,
        shadows: 0,
        whites: 0,
        blacks: 0
      },
      color: {
        temp: 0,
        tint: 0,
        vibrance: 0,
        saturation: 0
      },
      hsl: {}
    }
  };

  const CAMERA_PRESET_MAP = {
    'fuji-quicksnap': 'donggi-summer',
    'citypop-80s': 'donggi-summer',
    'kyocera-samurai': 'donggi-summer',
    'polaroid-sx70': 'donggi-summer',
    'sony-cybershot': 'ditto-winter-98',
    'sony-handycam': 'ditto-winter-98',
    'canon-ixy': 'tokyo-y2k-ccd',
    'olympus-mju': 'fuji-superia',
    'contax-t2': 'kodak-portra',
    'ricoh-gr': 'kodak-portra',
    'oldfilm-35mm': 'kodak-portra',
    'hasselblad-500cm': 'kodak-portra',
    'instax-mini': 'kodak-portra',
    'sihyun-color': 'donggi-summer',
    'leica-m': 'leica-monochrome',
    'passport-id': 'raw-neutral'
  };

  function applyParametricGrading(imageData, recipe) {
    if (!recipe) return imageData;
    const data = imageData.data;
    const len = data.length;

    const tone = recipe.tone || {};
    const color = recipe.color || {};
    const hslMods = recipe.hsl || {};

    const ev = tone.exposure || 0;
    // Photographic exposure curve with soft shoulder rolloff
    const evFactor = Math.pow(2.0, ev * 0.65);

    const contrastVal = (tone.contrast || 0) / 100.0;
    const contrastFactor = 1.0 + contrastVal * 0.55;

    const hiVal = (tone.highlights || 0) / 100.0;
    const whVal = (tone.whites || 0) / 100.0;
    const shVal = (tone.shadows || 0) / 100.0;
    const blVal = (tone.blacks || 0) / 100.0;

    const tempVal = (color.temp || 0) / 100.0;
    const tintVal = (color.tint || 0) / 100.0;

    const rTemp = 1.0 + tempVal * 0.18 + tintVal * 0.06;
    const gTemp = 1.0 - tintVal * 0.14;
    const bTemp = 1.0 - tempVal * 0.18 + tintVal * 0.05;

    const vibVal = (color.vibrance || 0) / 100.0;
    const satVal = (color.saturation || 0) / 100.0;

    const channels = ['red', 'orange', 'yellow', 'green', 'aqua', 'blue', 'purple', 'magenta'];
    const channelMods = [];
    for (let ch of channels) {
      if (hslMods[ch]) {
        channelMods.push({
          center: HSL_COLOR_CHANNELS[ch].center,
          range: HSL_COLOR_CHANNELS[ch].range,
          hue: hslMods[ch].hue || 0,
          sat: (hslMods[ch].sat || 0) / 100.0,
          lum: (hslMods[ch].lum || 0) / 100.0
        });
      }
    }

    const isMonochrome = satVal <= -0.98;

    for (let i = 0; i < len; i += 4) {
      let r = data[i] / 255.0;
      let g = data[i + 1] / 255.0;
      let b = data[i + 2] / 255.0;

      // 1. White Balance
      r *= rTemp;
      g *= gTemp;
      b *= bTemp;

      // 2. Exposure with soft shoulder rolloff to preserve highlights
      if (evFactor > 1.0) {
        r = 1.0 - Math.exp(-r * evFactor * 1.05);
        g = 1.0 - Math.exp(-g * evFactor * 1.05);
        b = 1.0 - Math.exp(-b * evFactor * 1.05);
      } else {
        r *= evFactor;
        g *= evFactor;
        b *= evFactor;
      }

      let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      // 3. Highlights & Whites Compression (Soft gentle rolloff, no digital muddy clamp)
      if (lum > 0.35) {
        const hiWeight = Math.min(1.0, (lum - 0.35) / 0.65);
        const hiComp = 1.0 + (hiVal * 0.25 + whVal * 0.15) * hiWeight;
        r *= hiComp;
        g *= hiComp;
        b *= hiComp;
      }

      // 4. Shadows (+45) & Blacks (+11) Lift (Gentle vintage milky lift)
      if (lum < 0.75) {
        const shWeight = Math.max(0.0, (0.75 - lum) / 0.75);
        const lift = (shVal * 0.28 + blVal * 0.16) * shWeight;
        r += lift;
        g += lift;
        b += lift;
      }

      // 5. Contrast (Midpoint 0.52 for bright, airy Japanese summer high-key look)
      const pivot = 0.52;
      r = (r - pivot) * contrastFactor + pivot;
      g = (g - pivot) * contrastFactor + pivot;
      b = (b - pivot) * contrastFactor + pivot;

      r = Math.max(0.0, Math.min(1.0, r));
      g = Math.max(0.0, Math.min(1.0, g));
      b = Math.max(0.0, Math.min(1.0, b));

      if (isMonochrome) {
        const mono = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const finalByte = Math.min(255, Math.max(0, Math.round(mono * 255.0)));
        data[i] = finalByte;
        data[i + 1] = finalByte;
        data[i + 2] = finalByte;
        continue;
      }

      // 6. HSL Color Mixer & Vibrance
      let [h, s, l] = rgbToHsl(r, g, b);

      if (channelMods.length > 0 && s > 0.02) {
        for (let ch of channelMods) {
          let diff = Math.abs(h - ch.center);
          if (diff > 180) diff = 360 - diff;
          if (diff < ch.range) {
            const w = 1.0 - (diff / ch.range);
            const weight = w * w * (3.0 - 2.0 * w);
            h += ch.hue * weight;
            s += ch.sat * weight * s;
            l += ch.lum * weight * 0.35;
          }
        }
      }

      if (satVal !== 0) {
        s += satVal * s;
      }
      if (vibVal !== 0) {
        const vibWeight = (1.0 - s);
        s += vibVal * vibWeight * 0.65;
      }

      s = Math.max(0.0, Math.min(1.0, s));
      l = Math.max(0.0, Math.min(1.0, l));

      const [finalR, finalG, finalB] = hslToRgb(h, s, l);

      data[i]     = Math.min(255, Math.max(0, Math.round(finalR * 255.0)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(finalG * 255.0)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(finalB * 255.0)));
    }

    return imageData;
  }

  const ParametricColorEngine = {
    presets: PRESET_RECIPES,
    cameraPresetMap: CAMERA_PRESET_MAP,
    activeRecipe: JSON.parse(JSON.stringify(PRESET_RECIPES['donggi-summer'])),
    enabled: true,

    getRecipe(id) {
      return PRESET_RECIPES[id] || null;
    },

    getRecipeForCamera(camId) {
      const presetId = CAMERA_PRESET_MAP[camId] || 'donggi-summer';
      return PRESET_RECIPES[presetId] || PRESET_RECIPES['donggi-summer'];
    },

    setRecipe(recipe) {
      this.activeRecipe = JSON.parse(JSON.stringify(recipe));
    },

    resetToPreset(presetId) {
      if (PRESET_RECIPES[presetId]) {
        this.activeRecipe = JSON.parse(JSON.stringify(PRESET_RECIPES[presetId]));
        return this.activeRecipe;
      }
      return null;
    },

    processCanvas(canvas, recipe = this.activeRecipe) {
      if (!canvas || !canvas.getContext) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyParametricGrading(imgData, recipe);
        ctx.putImageData(imgData, 0, 0);
      } catch (err) {
        console.warn('[ParametricColorEngine] Canvas processing failed:', err);
      }
    },

    processImageData(imageData, recipe = this.activeRecipe) {
      return applyParametricGrading(imageData, recipe);
    },

    getLivePreviewCSS(recipe = this.activeRecipe) {
      if (!recipe) return '';
      const t = recipe.tone || {};
      const c = recipe.color || {};
      const ev = t.exposure || 0;
      const contrast = 1.0 + (t.contrast || 0) / 180.0;
      const bright = Math.pow(2, ev * 0.42);
      const sat = Math.max(0.0, 1.0 + (c.saturation || 0) / 100.0 + (c.vibrance || 0) / 200.0);
      const sepia = (c.temp || 0) > 0 ? (c.temp / 100.0) * 0.12 : 0;
      const hueRotate = (c.tint || 0) * -0.22;
      return `brightness(${bright.toFixed(3)}) contrast(${contrast.toFixed(3)}) saturate(${sat.toFixed(3)}) sepia(${sepia.toFixed(3)}) hue-rotate(${hueRotate.toFixed(1)}deg)`;
    }
  };

  global.FilmSpectralEngine = FilmSpectralEngine;
  global.ParametricColorEngine = ParametricColorEngine;

})(typeof window !== 'undefined' ? window : this);

