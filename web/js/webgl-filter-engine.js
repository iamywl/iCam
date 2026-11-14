// WebGL2 GLSL ES 3.00 8-Stage Linear Optical & Film Engine
// Strictly mirrors /mac/Sources/FilterEngine/OpticalShaderSource.swift equation-for-equation.

const VERTEX_SHADER_SRC = `#version 300 es
precision highp float;
in vec2 aPos;
out vec2 vUV;
void main() {
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const COMMON_GLSL = `
precision highp float;
precision highp int;

float srgbToLinearChan(float c) {
  return (c <= 0.04045) ? (c / 12.92) : pow((c + 0.055) / 1.055, 2.4);
}

float linearToSRGBChan(float c) {
  float x = max(c, 0.0);
  return (x <= 0.0031308) ? (12.92 * x) : (1.055 * pow(x, 1.0 / 2.4) - 0.055);
}

vec3 linearToSRGB(vec3 rgb) {
  return vec3(linearToSRGBChan(rgb.r), linearToSRGBChan(rgb.g), linearToSRGBChan(rgb.b));
}

vec3 srgbToLinear(vec3 rgb) {
  return vec3(srgbToLinearChan(rgb.r), srgbToLinearChan(rgb.g), srgbToLinearChan(rgb.b));
}

float luma709(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

float hueDistDeg(float a, float b) {
  float d = abs(a - b);
  return min(d, 360.0 - d);
}

vec3 rgbToHSL(vec3 c) {
  float r = max(c.r, 0.0);
  float g = max(c.g, 0.0);
  float b = max(c.b, 0.0);
  float maxC = max(r, max(g, b));
  float minC = min(r, min(g, b));
  float d = maxC - minC;
  float l = 0.5 * (maxC + minC);
  float s = 0.0;
  float h = 0.0;
  if (d > 1e-5) {
    float denom = 1.0 - abs(2.0 * l - 1.0);
    s = (denom > 1e-5) ? clamp(d / denom, 0.0, 1.0) : 0.0;
    if (maxC == r) {
      h = mod((g - b) / d + 6.0, 6.0);
    } else if (maxC == g) {
      h = (b - r) / d + 2.0;
    } else {
      h = (r - g) / d + 4.0;
    }
    h *= 60.0;
  }
  return vec3(h, s, clamp(l, 0.0, 1.0));
}

float hue2rgb(float p, float q, float t) {
  float tt = t;
  if (tt < 0.0) tt += 1.0;
  if (tt > 1.0) tt -= 1.0;
  if (tt < 1.0 / 6.0) return p + (q - p) * 6.0 * tt;
  if (tt < 0.5) return q;
  if (tt < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - tt) * 6.0;
  return p;
}

vec3 hslToRGB(vec3 hsl) {
  float h = mod(hsl.x + 3600.0, 360.0) / 360.0;
  float s = clamp(hsl.y, 0.0, 1.0);
  float l = clamp(hsl.z, 0.0, 1.0);
  if (s < 1e-5) return vec3(l);
  float q = (l < 0.5) ? (l * (1.0 + s)) : (l + s - l * s);
  float p = 2.0 * l - q;
  return vec3(
    hue2rgb(p, q, h + 1.0 / 3.0),
    hue2rgb(p, q, h),
    hue2rgb(p, q, h - 1.0 / 3.0)
  );
}

float computeSkinMask(vec3 hsl, float centerDeg, float widthDeg) {
  float dh = hueDistDeg(hsl.x, centerDeg);
  float hWeight = exp(-(dh * dh) / max(2.0 * widthDeg * widthDeg, 1.0));
  float sGate = smoothstep(0.06, 0.22, hsl.y);
  float lGateLow = smoothstep(0.07, 0.22, hsl.z);
  float lGateHigh = 1.0 - smoothstep(0.86, 0.98, hsl.z);
  return hWeight * sGate * lGateLow * lGateHigh;
}

float applyHDToneCurveScalar(float x, float toeSoftness, float midContrast, float shoulderStart, float shoulderSoftness) {
  float y = clamp(x, 0.0, 2.0);
  float toeWeight = pow(max(1.0 - y, 0.0), 2.4);
  y = y + toeSoftness * 0.14 * toeWeight;

  float pivot = 0.46;
  float t = y - pivot;
  if (midContrast >= 1.0) {
    float k = (midContrast - 1.0) * 2.2;
    float sCurve = tanh(t * (1.0 + k)) / max(tanh(0.5 * (1.0 + k)), 1e-4) * 0.5 + pivot;
    y = mix(y, sCurve, 0.72);
  } else {
    float soft = (1.0 - midContrast);
    y = pivot + t * (1.0 - soft * 0.48);
  }

  if (y > shoulderStart && shoulderSoftness > 0.001) {
    float span = max(1.0 - shoulderStart, 0.05);
    float over = (y - shoulderStart) / span;
    float compressed = shoulderStart + span * (over / (1.0 + over * (0.65 + shoulderSoftness * 1.4)));
    y = mix(y, compressed, clamp(shoulderSoftness * 1.6, 0.0, 1.0));
  }
  return clamp(y, 0.0, 1.0);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
`;

const UNIFORM_DECLS = `
uniform vec4 uToneParams0;      // exposureEV, wbTempShift, wbTintShift, toeSoftness
uniform vec4 uToneParams1;      // midContrast, shoulderStart, shoulderSoftness, highlightDesat
uniform vec4 uBlackFloor;       // r, g, b, intensity
uniform vec4 uMonoParams;       // enabled, skinLumBoost, skyLumPull, mirrorX
uniform vec4 uMonoWeights;      // rW, gW, bW, unused
uniform vec4 uSkinParams0;      // centerDeg, widthDeg, hueShiftDeg, satDelta
uniform vec4 uSkinParams1;      // lumDelta, tintShield, chromaSmooth, vibrance
uniform vec4 uHueBands0;        // greenHueShift, greenSatDelta, greenLumDelta, blueHueShift
uniform vec4 uHueBands1;        // blueSatDelta, redSatDelta, saturation, unused
uniform vec4 uShadowTint;       // r, g, b, strength
uniform vec4 uHighlightTint;    // r, g, b, strength
uniform vec4 uHalationParams;   // enabled, threshold, knee, strength
uniform vec4 uHalationTint;     // r, g, b, verticalAnisotropy
uniform vec4 uMistParams;       // enabled, threshold, knee, strength
uniform vec4 uOpticsParams0;    // mistVeil, microContrast, edgeSoftness, ccdMode
uniform vec4 uOpticsParams1;    // grainAmount, grainSizeNorm, grainChromaRatio, vignetteStrength
uniform vec4 uOpticsParams2;    // vignettePower, flashCenterBoost, lightLeakStrength, seed
uniform vec4 uRenderParams;     // debugMaskMode, encodeSRGB, mirrorX, unused
`;

// Pre-pass outputs graded + glowSrc to MRT (layout location 0, 1) AND optional flipped original linear
const PREPASS_FRAG_SRC = `#version 300 es
${COMMON_GLSL}
in vec2 vUV;
uniform sampler2D uSrcTex;
${UNIFORM_DECLS}

layout(location = 0) out vec4 outGraded;
layout(location = 1) out vec4 outGlowSrc;

void main() {
  vec2 uv = vec2(uRenderParams.z > 0.5 ? (1.0 - vUV.x) : vUV.x, vUV.y);
  vec3 encIn = clamp(texture(uSrcTex, uv).rgb, 0.0, 1.0);
  vec3 lin = srgbToLinear(encIn);

  float evMul = exp2(uToneParams0.x);
  float temp = uToneParams0.y;
  float tint = uToneParams0.z;
  vec3 wbGain = vec3(
    clamp(1.0 + temp * 0.34 + tint * 0.08, 0.5, 1.8),
    clamp(1.0 - tint * 0.24, 0.5, 1.6),
    clamp(1.0 - temp * 0.34 + tint * 0.08, 0.5, 1.8)
  );
  wbGain /= max(luma709(wbGain), 0.1);
  vec3 c1 = lin * evMul * wbGain;

  vec3 preEnc = clamp(linearToSRGB(c1), 0.0, 1.0);
  vec3 preHSL = rgbToHSL(preEnc);
  float skinMask = computeSkinMask(preHSL, uSkinParams0.x, uSkinParams0.y);

  // Halation mask from un-cooled linear radiance
  float halMask = 0.0;
  vec3 halTint = uHalationTint.rgb;
  if (uHalationParams.x > 0.5) {
    vec3 sceneHal = lin * max(evMul, 1.0);
    float lHal = luma709(sceneHal);
    float maxHal = max(sceneHal.r, max(sceneHal.g, sceneHal.b));
    float energy = 0.55 * lHal + 0.45 * maxHal;
    float rawMask = smoothstep(uHalationParams.y, uHalationParams.y + max(uHalationParams.z, 0.02), energy);
    float skinProtect = 1.0 - skinMask * (1.0 - smoothstep(0.90, 0.98, lHal));
    halMask = rawMask * skinProtect;
  }

  bool isMono = uMonoParams.x > 0.5;
  if (isMono) {
    float lBase = dot(c1, uMonoWeights.rgb);
    float skyDH = hueDistDeg(preHSL.x, 218.0);
    float skyMask = exp(-(skyDH * skyDH) / (2.0 * 36.0 * 36.0)) * smoothstep(0.10, 0.35, preHSL.y);
    float monoDelta = skinMask * uMonoParams.y * 0.30 - skyMask * uMonoParams.z * 0.32;
    float finalMono = max(lBase * (1.0 + monoDelta), 0.0);
    c1 = vec3(finalMono);
  }

  vec3 enc = linearToSRGB(c1);
  float yIn = max(luma709(enc), 1e-5);
  float yCurve = applyHDToneCurveScalar(yIn, uToneParams0.w, uToneParams1.x, uToneParams1.y, uToneParams1.z);

  vec3 curved = enc * (yCurve / yIn);
  float hiSatRoll = smoothstep(uToneParams1.y, 1.0, yCurve) * uToneParams1.w;
  curved = mix(curved, vec3(yCurve), clamp(hiSatRoll, 0.0, 0.85));
  curved = clamp(curved, 0.0, 1.0);

  vec3 graded = curved;
  float mSkin = skinMask;
  if (!isMono) {
    vec3 hsl = rgbToHSL(curved);
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;

    mSkin = computeSkinMask(hsl, uSkinParams0.x, uSkinParams0.y);
    float gDist = hueDistDeg(h, 115.0);
    float mGreen = exp(-(gDist * gDist) / (2.0 * 35.0 * 35.0)) * smoothstep(0.08, 0.25, s);
    float bDist = hueDistDeg(h, 215.0);
    float mBlue = exp(-(bDist * bDist) / (2.0 * 38.0 * 38.0)) * smoothstep(0.08, 0.25, s);
    float rDist = hueDistDeg(h, 355.0);
    float mRed = exp(-(rDist * rDist) / (2.0 * 16.0 * 16.0)) * smoothstep(0.14, 0.35, s) * (1.0 - mSkin);

    float hOut = h + uSkinParams0.z * mSkin + uHueBands0.x * mGreen + uHueBands0.w * mBlue;
    float sOut = s + uSkinParams0.w * mSkin + uHueBands0.y * mGreen + uHueBands1.x * mBlue + uHueBands1.y * mRed;

    float chromaPresent = smoothstep(0.02, 0.12, s);
    float vibAmount = uSkinParams1.w * (1.0 - s) * (1.0 - 0.65 * mSkin) * chromaPresent;
    sOut = (sOut + vibAmount) * mix(uHueBands1.z, 1.0, 0.35 * mSkin);

    float lOut = l + uSkinParams1.x * mSkin + uHueBands0.z * mGreen;
    graded = hslToRGB(vec3(hOut, clamp(sOut, 0.0, 1.0), clamp(lOut, 0.0, 1.0)));

    float postLuma = luma709(graded);
    float shWeight = pow(max(1.0 - smoothstep(0.0, 0.56, postLuma), 0.0), 1.55) * (1.0 - uSkinParams1.y * mSkin);
    float hiWeight = pow(smoothstep(0.42, 0.98, postLuma), 1.45) * (1.0 - 0.70 * uSkinParams1.y * mSkin);

    graded = mix(graded, graded + uShadowTint.rgb * 0.45, clamp(uShadowTint.w * shWeight, 0.0, 0.85));
    float hiPureWhiteGuard = 1.0 - smoothstep(0.92, 0.995, postLuma) * (1.0 - hsl.y);
    graded = mix(graded, graded * uHighlightTint.rgb, clamp(uHighlightTint.w * hiWeight * hiPureWhiteGuard, 0.0, 0.75));
  }

  vec3 bf = uBlackFloor.rgb;
  graded = bf + graded * (1.0 - bf);
  graded = clamp(graded, 0.0, 1.0);

  float mistMask = 0.0;
  if (uMistParams.x > 0.5) {
    float gLuma = luma709(graded);
    mistMask = smoothstep(uMistParams.y, uMistParams.y + max(uMistParams.z, 0.04), gLuma);
  }

  outGraded = vec4(graded, mSkin);
  outGlowSrc = vec4(halTint * halMask, mistMask);
}
`;

// Downsample pass writes Halation, Black Mist, LowFreq to MRT (3 targets)
const DOWNSAMPLE_FRAG_SRC = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uGradedTex;
uniform sampler2D uGlowSrcTex;
uniform vec2 uSrcTexel;

layout(location = 0) out vec4 outHal;
layout(location = 1) out vec4 outMist;
layout(location = 2) out vec4 outLow;

void main() {
  vec2 d = 0.5 * uSrcTexel;
  vec4 gSum =
    texture(uGradedTex, vUV + vec2(-d.x, -d.y)) +
    texture(uGradedTex, vUV + vec2( d.x, -d.y)) +
    texture(uGradedTex, vUV + vec2(-d.x,  d.y)) +
    texture(uGradedTex, vUV + vec2( d.x,  d.y));
  vec4 sSum =
    texture(uGlowSrcTex, vUV + vec2(-d.x, -d.y)) +
    texture(uGlowSrcTex, vUV + vec2( d.x, -d.y)) +
    texture(uGlowSrcTex, vUV + vec2(-d.x,  d.y)) +
    texture(uGlowSrcTex, vUV + vec2( d.x,  d.y));

  vec4 gAvg = gSum * 0.25;
  vec4 sAvg = sSum * 0.25;
  outHal = vec4(sAvg.rgb, 1.0);
  outMist = vec4(gAvg.rgb * sAvg.a, 1.0);
  outLow = gAvg;
}
`;

const BLUR_FRAG_SRC = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUV;
uniform sampler2D uTex;
uniform vec2 uDirectionStep; // (texelStepX, 0) or (0, texelStepY)
uniform float uSigma;
uniform int uRadius;

out vec4 outColor;

void main() {
  float sigma = max(uSigma, 0.5);
  float invTwoSigmaSq = 1.0 / (2.0 * sigma * sigma);
  vec4 sum = vec4(0.0);
  float wSum = 0.0;
  for (int i = -28; i <= 28; ++i) {
    if (i < -uRadius || i > uRadius) continue;
    float wt = exp(-float(i * i) * invTwoSigmaSq);
    sum += texture(uTex, clamp(vUV + uDirectionStep * float(i), 0.0, 1.0)) * wt;
    wSum += wt;
  }
  outColor = sum / max(wSum, 1e-5);
}
`;

const COMPOSITE_FRAG_SRC = `#version 300 es
${COMMON_GLSL}
in vec2 vUV;
uniform sampler2D uOrigSrcTex;
uniform sampler2D uGradedTex;
uniform sampler2D uHalBlurTex;
uniform sampler2D uMistBlurTex;
uniform sampler2D uLowFreqTex;
uniform sampler2D uGlowSrcTex;
uniform vec2 uOutputSize;
${UNIFORM_DECLS}

out vec4 fragColor;

void main() {
  vec4 gData = texture(uGradedTex, vUV);
  vec3 base = gData.rgb;
  float mSkin = gData.a;
  vec3 lowRGB = texture(uLowFreqTex, vUV).rgb;

  int debugMode = int(round(uRenderParams.x));
  if (debugMode == 1) {
    fragColor = vec4(mSkin, mSkin * 0.45, 0.1 * mSkin, 1.0);
    return;
  }
  if (debugMode == 2) {
    vec3 hMask = texture(uGlowSrcTex, vUV).rgb + texture(uHalBlurTex, vUV).rgb;
    fragColor = vec4(clamp(hMask, 0.0, 1.0), 1.0);
    return;
  }
  if (debugMode == 3) {
    float mM = texture(uGlowSrcTex, vUV).a;
    vec3 mBlur = texture(uMistBlurTex, vUV).rgb;
    fragColor = vec4(clamp(vec3(mM * 0.4) + mBlur, 0.0, 1.0), 1.0);
    return;
  }

  // Stage 6: Luminance-preserving skin chroma smooth
  float skinSmooth = uSkinParams1.z * mSkin;
  if (skinSmooth > 0.001) {
    float yOrig = luma709(base);
    float yLow = max(luma709(lowRGB), 1e-4);
    vec3 smoothedChroma = lowRGB * (yOrig / yLow);
    base = mix(base, clamp(smoothedChroma, 0.0, 1.0), clamp(skinSmooth, 0.0, 0.85));
  }

  float w = max(uOutputSize.x, 1.0);
  float h = max(uOutputSize.y, 1.0);
  float minDim = min(w, h);
  float aspect = w / h;
  vec2 topDownUV = vec2(vUV.x, 1.0 - vUV.y);
  vec2 aspectOffset = (topDownUV - 0.5) * vec2(aspect, 1.0);
  float maxRadius = 0.5 * length(vec2(aspect, 1.0));
  float rNorm = length(aspectOffset) / max(maxRadius, 1e-4);

  // Peripheral lens softness (05 Lo-Fi)
  if (uOpticsParams0.z > 0.001) {
    float edgeBlend = smoothstep(0.54, 1.0, rNorm) * uOpticsParams0.z * 0.72;
    base = mix(base, lowRGB, clamp(edgeBlend, 0.0, 0.8));
  }

  // 3D-Pop micro-contrast with edge-stopping halo guard
  if (uOpticsParams0.y > 0.001) {
    float rawDetail = luma709(base) - luma709(lowRGB);
    float edgeGuard = exp(-(rawDetail * rawDetail) / (2.0 * 0.16 * 0.16));
    float detail = clamp(rawDetail * edgeGuard, -0.12, 0.12);
    float skinDamp = 1.0 - 0.55 * mSkin;
    base = clamp(base + detail * uOpticsParams0.y * 1.45 * skinDamp, 0.0, 1.0);
  }

  // Stage 4: Halation / CCD Blooming
  if (uHalationParams.x > 0.5 && uHalationParams.w > 0.001) {
    vec3 halGlow = texture(uHalBlurTex, vUV).rgb * 3.4;
    base = base + uHalationParams.w * halGlow * (1.0 - 0.42 * base);
    base = clamp(base, 0.0, 1.0);
  }

  // Stage 5: Black Mist highlight diffusion
  if (uMistParams.x > 0.5 && uMistParams.w > 0.001) {
    vec3 mistGlow = texture(uMistBlurTex, vUV).rgb;
    vec3 mistTerm = clamp(mistGlow * uMistParams.w, 0.0, 0.85);
    base = 1.0 - (1.0 - base) * (1.0 - mistTerm);
    base = clamp(base + mistGlow * uOpticsParams0.x * 0.5, 0.0, 1.0);
  }

  // Stage 7: Bell-curve grain & CCD sensor texture
  float curLuma = luma709(base);
  float bellWeight = exp(-pow((curLuma - 0.475) / 0.22, 2.0))
    * smoothstep(0.02, 0.12, curLuma)
    * (1.0 - smoothstep(0.84, 0.98, curLuma));

  if (debugMode == 4) {
    fragColor = vec4(bellWeight, bellWeight, bellWeight, 1.0);
    return;
  }

  float grainAmount = uOpticsParams1.x;
  if (grainAmount > 0.001) {
    float seed = uOpticsParams2.w;
    vec2 gCoord = (topDownUV * vec2(w, h) / max(minDim, 1.0)) * (540.0 / max(uOpticsParams1.y, 0.4));
    bool ccdMode = uOpticsParams0.w > 0.5;
    float nLuma;
    vec3 nChroma;
    if (ccdMode) {
      vec2 qCoord = floor(gCoord * 1.15);
      nLuma = hash12(qCoord + seed) - 0.5;
      nChroma = vec3(
        hash12(qCoord + seed + 19.7) - 0.5,
        hash12(qCoord + seed + 47.3) - 0.5,
        hash12(qCoord + seed + 83.1) - 0.5
      );
    } else {
      float n1 = valueNoise(gCoord * 0.9 + seed);
      float n2 = hash12(floor(gCoord * 1.65) + seed * 1.7);
      nLuma = (0.62 * n1 + 0.38 * n2) - 0.5;
      nChroma = vec3(
        valueNoise(gCoord * 0.7 + seed + 13.0) - 0.5,
        valueNoise(gCoord * 0.7 + seed + 29.0) - 0.5,
        valueNoise(gCoord * 0.7 + seed + 51.0) - 0.5
      );
    }
    vec3 grainDelta = mix(vec3(nLuma), nChroma, uOpticsParams1.z);
    float scale = grainAmount * 0.24 * (0.25 + 0.75 * bellWeight);
    base = clamp(base + grainDelta * scale, 0.0, 1.0);
  }

  // Stage 8: Flash pop, Cos^4 vignette & corner light leak
  if (uOpticsParams2.y > 0.001) {
    float centerPop = exp(-(rNorm * rNorm) / (2.0 * 0.42 * 0.42)) * uOpticsParams2.y;
    base = clamp(base * (1.0 + centerPop), 0.0, 1.0);
  }

  if (uOpticsParams1.w > 0.001) {
    float vigCurve = pow(smoothstep(0.24, 1.08, rNorm), max(uOpticsParams2.x * 0.55, 0.8));
    float vigMul = 1.0 - clamp(uOpticsParams1.w * vigCurve, 0.0, 0.80);
    base *= vigMul;
  }

  if (uOpticsParams2.z > 0.001) {
    float s = uOpticsParams2.w;
    float side = (mod(s, 2.0) < 1.0) ? 1.0 : 0.0;
    float yAnchor = 0.22 + 0.55 * fract(s * 0.371);
    vec2 leakOrigin = vec2(side, yAnchor);
    float dLeak = length((topDownUV - leakOrigin) * vec2(1.45, 0.78));
    float leakMask = exp(-(dLeak * dLeak) / (2.0 * 0.26 * 0.26));
    vec3 leakColor = vec3(1.0, 0.38, 0.10);
    base = clamp(base + leakColor * leakMask * uOpticsParams2.z * 0.55, 0.0, 1.0);
  }

  float intensity = clamp(uBlackFloor.w, 0.0, 1.0);
  vec3 finalEncoded = base;
  if (intensity < 0.999) {
    vec2 origUV = vec2(uRenderParams.z > 0.5 ? (1.0 - vUV.x) : vUV.x, vUV.y);
    vec3 origEnc = clamp(texture(uOrigSrcTex, origUV).rgb, 0.0, 1.0);
    finalEncoded = mix(origEnc, base, intensity);
  }

  fragColor = vec4(finalEncoded, 1.0);
}
`;

export class WebGLFilterEngine {
  constructor(canvas) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true
    });
    if (!gl) {
      throw new Error("이 브라우저는 WebGL2를 지원하지 않습니다.");
    }
    this.gl = gl;
    this.useFloatFBO = Boolean(
      gl.getExtension("EXT_color_buffer_float") ||
      gl.getExtension("EXT_color_buffer_half_float")
    );

    this.quadVBO = this.#createQuadVBO();
    this.srcTex = this.#createTexture(gl.LINEAR);

    this.prePassProg = this.#createProgram(VERTEX_SHADER_SRC, PREPASS_FRAG_SRC);
    this.downsampleProg = this.#createProgram(VERTEX_SHADER_SRC, DOWNSAMPLE_FRAG_SRC);
    this.blurProg = this.#createProgram(VERTEX_SHADER_SRC, BLUR_FRAG_SRC);
    this.compositeProg = this.#createProgram(VERTEX_SHADER_SRC, COMPOSITE_FRAG_SRC);

    this.targets = null;
    this.allocW = 0;
    this.allocH = 0;
  }

  render(source, recipe, options = {}) {
    const gl = this.gl;
    const srcW = source.videoWidth || source.naturalWidth || source.width;
    const srcH = source.videoHeight || source.naturalHeight || source.height;
    if (!srcW || !srcH) return;

    const outW = options.width || this.canvas.width || srcW;
    const outH = options.height || this.canvas.height || srcH;
    if (this.canvas.width !== outW || this.canvas.height !== outH) {
      this.canvas.width = outW;
      this.canvas.height = outH;
    }

    this.#ensureRenderTargets(outW, outH);
    this.#uploadSource(source);

    const seed = options.seed ?? 42;
    const debugMaskMode = options.debugMaskMode ?? 0;
    const mirrorX = options.mirrorX ? 1.0 : 0.0;
    const scissor = options.scissor || null; // { x, y, w, h }

    // Pass 1: PrePass -> gradedTex & glowSrcTex
    gl.disable(gl.SCISSOR_TEST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.targets.preFBO);
    gl.viewport(0, 0, outW, outH);
    gl.useProgram(this.prePassProg);
    this.#bindTextureUnit(this.prePassProg, "uSrcTex", this.srcTex, 0);
    this.#uploadRecipeUniforms(this.prePassProg, recipe, seed, debugMaskMode, mirrorX);
    this.#drawQuad(this.prePassProg);

    // Pass 2: Downsample -> halA, mistA, lowA
    const halfW = this.targets.halfW;
    const halfH = this.targets.halfH;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.targets.downFBO);
    gl.viewport(0, 0, halfW, halfH);
    gl.useProgram(this.downsampleProg);
    this.#bindTextureUnit(this.downsampleProg, "uGradedTex", this.targets.gradedTex, 0);
    this.#bindTextureUnit(this.downsampleProg, "uGlowSrcTex", this.targets.glowSrcTex, 1);
    gl.uniform2f(gl.getUniformLocation(this.downsampleProg, "uSrcTexel"), 1.0 / outW, 1.0 / outH);
    this.#drawQuad(this.downsampleProg);

    // Pass 3: Separable Blurs
    const minDim = Math.min(outW, outH);
    if (recipe.halation?.enabled && (recipe.halation.strength ?? 0) > 0.001) {
      const baseSigma = Math.max(0.8, (recipe.halation.radiusNorm ?? 0.014) * minDim * 0.5);
      const sigmaY = baseSigma * (recipe.halation.verticalAnisotropy ?? 1.0);
      this.#runSeparableBlur(this.targets.halA, this.targets.halB, baseSigma, sigmaY, halfW, halfH);
    }

    if (recipe.blackMist?.enabled && (recipe.blackMist.strength ?? 0) > 0.001) {
      const mistSigma = Math.max(1.0, (recipe.blackMist.radiusNorm ?? 0.015) * minDim * 0.5);
      this.#runSeparableBlur(this.targets.mistA, this.targets.mistB, mistSigma, mistSigma, halfW, halfH);
    }

    const needsLowFreq =
      (recipe.colorScience?.skinChromaSmooth ?? 0) > 0.001 ||
      (recipe.opticsAndGrain?.microContrast ?? 0) > 0.001 ||
      (recipe.opticsAndGrain?.edgeSoftness ?? 0) > 0.001;
    if (needsLowFreq) {
      const lowSigma = Math.max(1.0, minDim * 0.006 * 0.5);
      this.#runSeparableBlur(this.targets.lowA, this.targets.lowB, lowSigma, lowSigma, halfW, halfH);
    }

    // Pass 4: Composite to canvas default framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, outW, outH);
    if (scissor) {
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(scissor.x, scissor.y, scissor.w, scissor.h);
    }
    gl.useProgram(this.compositeProg);
    this.#bindTextureUnit(this.compositeProg, "uOrigSrcTex", this.srcTex, 0);
    this.#bindTextureUnit(this.compositeProg, "uGradedTex", this.targets.gradedTex, 1);
    this.#bindTextureUnit(this.compositeProg, "uHalBlurTex", this.targets.halA.tex, 2);
    this.#bindTextureUnit(this.compositeProg, "uMistBlurTex", this.targets.mistA.tex, 3);
    this.#bindTextureUnit(this.compositeProg, "uLowFreqTex", this.targets.lowA.tex, 4);
    this.#bindTextureUnit(this.compositeProg, "uGlowSrcTex", this.targets.glowSrcTex, 5);
    gl.uniform2f(gl.getUniformLocation(this.compositeProg, "uOutputSize"), outW, outH);
    this.#uploadRecipeUniforms(this.compositeProg, recipe, seed, debugMaskMode, mirrorX);
    this.#drawQuad(this.compositeProg);
    gl.disable(gl.SCISSOR_TEST);
  }

  #runSeparableBlur(pairA, pairB, sigmaX, sigmaY, w, h) {
    const gl = this.gl;
    gl.useProgram(this.blurProg);

    // Horizontal pass A -> B
    const radX = Math.min(28, Math.max(1, Math.ceil(sigmaX * 2.5)));
    gl.bindFramebuffer(gl.FRAMEBUFFER, pairB.fbo);
    gl.viewport(0, 0, w, h);
    this.#bindTextureUnit(this.blurProg, "uTex", pairA.tex, 0);
    gl.uniform2f(gl.getUniformLocation(this.blurProg, "uDirectionStep"), 1.0 / w, 0.0);
    gl.uniform1f(gl.getUniformLocation(this.blurProg, "uSigma"), sigmaX);
    gl.uniform1i(gl.getUniformLocation(this.blurProg, "uRadius"), radX);
    this.#drawQuad(this.blurProg);

    // Vertical pass B -> A
    const radY = Math.min(28, Math.max(1, Math.ceil(sigmaY * 2.5)));
    gl.bindFramebuffer(gl.FRAMEBUFFER, pairA.fbo);
    gl.viewport(0, 0, w, h);
    this.#bindTextureUnit(this.blurProg, "uTex", pairB.tex, 0);
    gl.uniform2f(gl.getUniformLocation(this.blurProg, "uDirectionStep"), 0.0, 1.0 / h);
    gl.uniform1f(gl.getUniformLocation(this.blurProg, "uSigma"), sigmaY);
    gl.uniform1i(gl.getUniformLocation(this.blurProg, "uRadius"), radY);
    this.#drawQuad(this.blurProg);
  }

  #uploadRecipeUniforms(prog, recipe, seed, debugMaskMode, mirrorX) {
    const gl = this.gl;
    const t = recipe.tone;
    const m = recipe.monochrome;
    const c = recipe.colorScience;
    const h = recipe.halation;
    const bm = recipe.blackMist;
    const og = recipe.opticsAndGrain;

    const u4 = (name, x, y, z, w) => {
      const loc = gl.getUniformLocation(prog, name);
      if (loc) gl.uniform4f(loc, x, y, z, w);
    };

    u4("uToneParams0", t.exposureEV, t.wbTempShift, t.wbTintShift, t.toeSoftness);
    u4("uToneParams1", t.midContrast, t.shoulderStart, t.shoulderSoftness, t.highlightDesat);
    u4("uBlackFloor", t.blackFloor[0] ?? 0, t.blackFloor[1] ?? 0, t.blackFloor[2] ?? 0, recipe.intensity ?? 1.0);
    u4("uMonoParams", m.enabled ? 1.0 : 0.0, m.skinLumBoost, m.skyLumPull, mirrorX);
    u4("uMonoWeights", m.rgbWeights[0] ?? 0.5, m.rgbWeights[1] ?? 0.36, m.rgbWeights[2] ?? 0.14, 0.0);
    u4("uSkinParams0", c.skinCenterDeg, c.skinWidthDeg, c.skinHueShiftDeg, c.skinSatDelta);
    u4("uSkinParams1", c.skinLumDelta, c.skinTintShield, c.skinChromaSmooth, c.vibrance);
    u4("uHueBands0", c.greenHueShiftDeg, c.greenSatDelta, c.greenLumDelta, c.blueHueShiftDeg);
    u4("uHueBands1", c.blueSatDelta, c.redSatDelta, c.saturation, 0.0);
    u4("uShadowTint", c.shadowTintRGB[0] ?? 0, c.shadowTintRGB[1] ?? 0, c.shadowTintRGB[2] ?? 0, c.shadowTintStrength);
    u4("uHighlightTint", c.highlightTintRGB[0] ?? 1, c.highlightTintRGB[1] ?? 1, c.highlightTintRGB[2] ?? 1, c.highlightTintStrength);
    u4("uHalationParams", h.enabled ? 1.0 : 0.0, h.threshold, h.knee, h.strength);
    u4("uHalationTint", h.tintRGB[0] ?? 1, h.tintRGB[1] ?? 0.2, h.tintRGB[2] ?? 0.05, h.verticalAnisotropy ?? 1.0);
    u4("uMistParams", bm.enabled ? 1.0 : 0.0, bm.threshold, bm.knee, bm.strength);
    u4("uOpticsParams0", bm.veil ?? 0.0, og.microContrast, og.edgeSoftness, og.grainMode === "ccdSensor" ? 1.0 : 0.0);
    u4("uOpticsParams1", og.grainAmount, og.grainSizeNorm, og.grainChromaRatio, og.vignetteStrength);
    u4("uOpticsParams2", og.vignettePower, og.flashCenterBoost, og.lightLeakStrength, seed);
    u4("uRenderParams", debugMaskMode, 1.0, mirrorX, 0.0);
  }

  #ensureRenderTargets(w, h) {
    if (this.targets && this.allocW === w && this.allocH === h) return;
    this.#disposeTargets();

    const gl = this.gl;
    const halfW = Math.max(1, Math.ceil(w / 2));
    const halfH = Math.max(1, Math.ceil(h / 2));

    let internalFmt = this.useFloatFBO ? gl.RGBA16F : gl.RGBA8;
    let pixType = this.useFloatFBO ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;

    const makeFBOAttachment = (tw, th) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFmt, tw, th, 0, gl.RGBA, pixType, null);
      return tex;
    };

    let gradedTex = makeFBOAttachment(w, h);
    let glowSrcTex = makeFBOAttachment(w, h);
    const preFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, preFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, gradedTex, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, glowSrcTex, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);

    // Fallback gracefully to RGBA8 if driver reports incomplete float FBO
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE && this.useFloatFBO) {
      this.useFloatFBO = false;
      internalFmt = gl.RGBA8;
      pixType = gl.UNSIGNED_BYTE;
      gl.deleteTexture(gradedTex);
      gl.deleteTexture(glowSrcTex);
      gradedTex = makeFBOAttachment(w, h);
      glowSrcTex = makeFBOAttachment(w, h);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, gradedTex, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, glowSrcTex, 0);
    }

    const makeSingleTarget = (tw, th) => {
      const tex = makeFBOAttachment(tw, th);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
      return { tex, fbo };
    };

    const halA = makeSingleTarget(halfW, halfH);
    const halB = makeSingleTarget(halfW, halfH);
    const mistA = makeSingleTarget(halfW, halfH);
    const mistB = makeSingleTarget(halfW, halfH);
    const lowA = makeSingleTarget(halfW, halfH);
    const lowB = makeSingleTarget(halfW, halfH);

    const downFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, downFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, halA.tex, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, mistA.tex, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, lowA.tex, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.targets = { halfW, halfH, preFBO, downFBO, gradedTex, glowSrcTex, halA, halB, mistA, mistB, lowA, lowB };
    this.allocW = w;
    this.allocH = h;
  }

  #disposeTargets() {
    if (!this.targets) return;
    const gl = this.gl;
    const t = this.targets;
    [t.preFBO, t.downFBO, t.halA.fbo, t.halB.fbo, t.mistA.fbo, t.mistB.fbo, t.lowA.fbo, t.lowB.fbo].forEach((f) => f && gl.deleteFramebuffer(f));
    [t.gradedTex, t.glowSrcTex, t.halA.tex, t.halB.tex, t.mistA.tex, t.mistB.tex, t.lowA.tex, t.lowB.tex].forEach((tx) => tx && gl.deleteTexture(tx));
    this.targets = null;
  }

  #uploadSource(source) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }

  #createQuadVBO() {
    const gl = this.gl;
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    return vbo;
  }

  #drawQuad(prog) {
    const gl = this.gl;
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  #createTexture(filter) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  #bindTextureUnit(prog, uniformName, tex, unit) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const loc = gl.getUniformLocation(prog, uniformName);
    if (loc) gl.uniform1i(loc, unit);
  }

  #createProgram(vSrc, fSrc) {
    const gl = this.gl;
    const vs = this.#compileShader(gl.VERTEX_SHADER, vSrc);
    const fs = this.#compileShader(gl.FRAGMENT_SHADER, fSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error("WebGL2 program link error: " + gl.getProgramInfoLog(prog));
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
  }

  #compileShader(type, src) {
    const gl = this.gl;
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error("WebGL2 shader compile error: " + gl.getShaderInfoLog(sh));
    }
    return sh;
  }
}
