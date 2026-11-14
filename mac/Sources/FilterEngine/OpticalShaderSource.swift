import Foundation
import simd

/// Byte-for-byte 16-byte-aligned Metal uniform struct (`simd_float4` + scalar only; zero `float3` stride hazard).
public struct MetalRecipeUniforms {
    public var toneParams0: simd_float4      // (exposureEV, wbTempShift, wbTintShift, toeSoftness)
    public var toneParams1: simd_float4      // (midContrast, shoulderStart, shoulderSoftness, highlightDesat)
    public var blackFloor: simd_float4       // (r, g, b, intensity)
    public var monoParams: simd_float4       // (enabled, skinLumBoost, skyLumPull, unused)
    public var monoWeights: simd_float4      // (rW, gW, bW, unused)
    public var skinParams0: simd_float4      // (centerDeg, widthDeg, hueShiftDeg, satDelta)
    public var skinParams1: simd_float4      // (lumDelta, tintShield, chromaSmooth, vibrance)
    public var hueBands0: simd_float4        // (greenHueShift, greenSatDelta, greenLumDelta, blueHueShift)
    public var hueBands1: simd_float4        // (blueSatDelta, redSatDelta, saturation, unused)
    public var shadowTint: simd_float4       // (r, g, b, strength)
    public var highlightTint: simd_float4    // (r, g, b, strength)
    public var halationParams: simd_float4   // (enabled, threshold, knee, strength)
    public var halationTint: simd_float4     // (r, g, b, verticalAnisotropy)
    public var mistParams: simd_float4       // (enabled, threshold, knee, strength)
    public var opticsParams0: simd_float4    // (mistVeil, microContrast, edgeSoftness, ccdMode)
    public var opticsParams1: simd_float4    // (grainAmount, grainSizeNorm, grainChromaRatio, vignetteStrength)
    public var opticsParams2: simd_float4    // (vignettePower, flashCenterBoost, lightLeakStrength, seed)
    public var renderParams: simd_float4     // (debugMaskMode, encodeSRGB, splitX, splitActive)

    public init(recipe: AestheticRecipe, seed: UInt32, debugMaskMode: DebugMaskMode = .normal, encodeSRGB: Bool = true) {
        let bf = recipe.tone.blackFloor
        let mw = recipe.monochrome.rgbWeights
        let st = recipe.colorScience.shadowTintRGB
        let ht = recipe.colorScience.highlightTintRGB
        let hlt = recipe.halation.tintRGB

        toneParams0 = simd_float4(recipe.tone.exposureEV, recipe.tone.wbTempShift, recipe.tone.wbTintShift, recipe.tone.toeSoftness)
        toneParams1 = simd_float4(recipe.tone.midContrast, recipe.tone.shoulderStart, recipe.tone.shoulderSoftness, recipe.tone.highlightDesat)
        blackFloor = simd_float4(bf.count > 0 ? bf[0] : 0, bf.count > 1 ? bf[1] : 0, bf.count > 2 ? bf[2] : 0, recipe.effectiveIntensity)
        monoParams = simd_float4(recipe.monochrome.enabled ? 1.0 : 0.0, recipe.monochrome.skinLumBoost, recipe.monochrome.skyLumPull, 0)
        monoWeights = simd_float4(mw.count > 0 ? mw[0] : 0.5, mw.count > 1 ? mw[1] : 0.36, mw.count > 2 ? mw[2] : 0.14, 0)
        skinParams0 = simd_float4(recipe.colorScience.skinCenterDeg, recipe.colorScience.skinWidthDeg, recipe.colorScience.skinHueShiftDeg, recipe.colorScience.skinSatDelta)
        skinParams1 = simd_float4(recipe.colorScience.skinLumDelta, recipe.colorScience.skinTintShield, recipe.colorScience.skinChromaSmooth, recipe.colorScience.vibrance)
        hueBands0 = simd_float4(recipe.colorScience.greenHueShiftDeg, recipe.colorScience.greenSatDelta, recipe.colorScience.greenLumDelta, recipe.colorScience.blueHueShiftDeg)
        hueBands1 = simd_float4(recipe.colorScience.blueSatDelta, recipe.colorScience.redSatDelta, recipe.colorScience.saturation, 0)
        shadowTint = simd_float4(st.count > 0 ? st[0] : 0, st.count > 1 ? st[1] : 0, st.count > 2 ? st[2] : 0, recipe.colorScience.shadowTintStrength)
        highlightTint = simd_float4(ht.count > 0 ? ht[0] : 1, ht.count > 1 ? ht[1] : 1, ht.count > 2 ? ht[2] : 1, recipe.colorScience.highlightTintStrength)
        halationParams = simd_float4(recipe.halation.enabled ? 1.0 : 0.0, recipe.halation.threshold, recipe.halation.knee, recipe.halation.strength)
        halationTint = simd_float4(hlt.count > 0 ? hlt[0] : 1, hlt.count > 1 ? hlt[1] : 0.2, hlt.count > 2 ? hlt[2] : 0.03, recipe.halation.verticalAnisotropy)
        mistParams = simd_float4(recipe.blackMist.enabled ? 1.0 : 0.0, recipe.blackMist.threshold, recipe.blackMist.knee, recipe.blackMist.strength)
        opticsParams0 = simd_float4(recipe.blackMist.veil, recipe.opticsAndGrain.microContrast, recipe.opticsAndGrain.edgeSoftness, recipe.opticsAndGrain.grainMode == .ccdSensor ? 1.0 : 0.0)
        opticsParams1 = simd_float4(recipe.opticsAndGrain.grainAmount, recipe.opticsAndGrain.grainSizeNorm, recipe.opticsAndGrain.grainChromaRatio, recipe.opticsAndGrain.vignetteStrength)
        opticsParams2 = simd_float4(recipe.opticsAndGrain.vignettePower, recipe.opticsAndGrain.flashCenterBoost, recipe.opticsAndGrain.lightLeakStrength, Float(seed % 10000))
        renderParams = simd_float4(Float(debugMaskMode.rawValue), encodeSRGB ? 1.0 : 0.0, 0.0, 0.0)
    }
}

public enum OpticalShaderSource {
    /// Identical optical math mirrored by WebGL2 GLSL shaders in `web/js/webgl-filter-engine.js`.
    public static let mslSource: String = #"""
    #include <metal_stdlib>
    using namespace metal;

    struct RecipeUniforms {
        float4 toneParams0;      // exposureEV, wbTempShift, wbTintShift, toeSoftness
        float4 toneParams1;      // midContrast, shoulderStart, shoulderSoftness, highlightDesat
        float4 blackFloor;       // r, g, b, intensity
        float4 monoParams;       // enabled, skinLumBoost, skyLumPull, unused
        float4 monoWeights;      // rW, gW, bW, unused
        float4 skinParams0;      // centerDeg, widthDeg, hueShiftDeg, satDelta
        float4 skinParams1;      // lumDelta, tintShield, chromaSmooth, vibrance
        float4 hueBands0;        // greenHueShift, greenSatDelta, greenLumDelta, blueHueShift
        float4 hueBands1;        // blueSatDelta, redSatDelta, saturation, unused
        float4 shadowTint;       // r, g, b, strength
        float4 highlightTint;    // r, g, b, strength
        float4 halationParams;   // enabled, threshold, knee, strength
        float4 halationTint;     // r, g, b, verticalAnisotropy
        float4 mistParams;       // enabled, threshold, knee, strength
        float4 opticsParams0;    // mistVeil, microContrast, edgeSoftness, ccdMode
        float4 opticsParams1;    // grainAmount, grainSizeNorm, grainChromaRatio, vignetteStrength
        float4 opticsParams2;    // vignettePower, flashCenterBoost, lightLeakStrength, seed
        float4 renderParams;     // debugMaskMode, encodeSRGB, splitX, splitActive
    };

    struct BlurUniforms {
        float sigma;
        float texelStepX;
        float texelStepY;
        float tapStep;
    };

    inline float srgbToLinearChan(float c) {
        return (c <= 0.04045f) ? (c / 12.92f) : pow((c + 0.055f) / 1.055f, 2.4f);
    }

    inline float linearToSRGBChan(float c) {
        float x = max(c, 0.0f);
        return (x <= 0.0031308f) ? (12.92f * x) : (1.055f * pow(x, 1.0f / 2.4f) - 0.055f);
    }

    inline float3 linearToSRGB(float3 rgb) {
        return float3(linearToSRGBChan(rgb.r), linearToSRGBChan(rgb.g), linearToSRGBChan(rgb.b));
    }

    inline float3 srgbToLinear(float3 rgb) {
        return float3(srgbToLinearChan(rgb.r), srgbToLinearChan(rgb.g), srgbToLinearChan(rgb.b));
    }

    inline float luma709(float3 c) {
        return dot(c, float3(0.2126f, 0.7152f, 0.0722f));
    }

    inline float hueDistDeg(float a, float b) {
        float d = fabs(a - b);
        return min(d, 360.0f - d);
    }

    inline float3 rgbToHSL(float3 c) {
        float r = max(c.r, 0.0f);
        float g = max(c.g, 0.0f);
        float b = max(c.b, 0.0f);
        float maxC = max(r, max(g, b));
        float minC = min(r, min(g, b));
        float d = maxC - minC;
        float l = 0.5f * (maxC + minC);
        float s = 0.0f;
        float h = 0.0f;
        if (d > 1e-5f) {
            float denom = 1.0f - fabs(2.0f * l - 1.0f);
            s = (denom > 1e-5f) ? clamp(d / denom, 0.0f, 1.0f) : 0.0f;
            if (maxC == r) {
                h = fmod((g - b) / d + 6.0f, 6.0f);
            } else if (maxC == g) {
                h = (b - r) / d + 2.0f;
            } else {
                h = (r - g) / d + 4.0f;
            }
            h *= 60.0f;
        }
        return float3(h, s, clamp(l, 0.0f, 1.0f));
    }

    inline float hue2rgb(float p, float q, float t) {
        float tt = t;
        if (tt < 0.0f) tt += 1.0f;
        if (tt > 1.0f) tt -= 1.0f;
        if (tt < 1.0f / 6.0f) return p + (q - p) * 6.0f * tt;
        if (tt < 0.5f) return q;
        if (tt < 2.0f / 3.0f) return p + (q - p) * (2.0f / 3.0f - tt) * 6.0f;
        return p;
    }

    inline float3 hslToRGB(float3 hsl) {
        float h = fmod(hsl.x + 3600.0f, 360.0f) / 360.0f;
        float s = clamp(hsl.y, 0.0f, 1.0f);
        float l = clamp(hsl.z, 0.0f, 1.0f);
        if (s < 1e-5f) return float3(l);
        float q = (l < 0.5f) ? (l * (1.0f + s)) : (l + s - l * s);
        float p = 2.0f * l - q;
        return float3(
            hue2rgb(p, q, h + 1.0f / 3.0f),
            hue2rgb(p, q, h),
            hue2rgb(p, q, h - 1.0f / 3.0f)
        );
    }

    inline float computeSkinMask(float3 hsl, float centerDeg, float widthDeg) {
        float dh = hueDistDeg(hsl.x, centerDeg);
        float hWeight = exp(-(dh * dh) / max(2.0f * widthDeg * widthDeg, 1.0f));
        float sGate = smoothstep(0.06f, 0.22f, hsl.y);
        float lGateLow = smoothstep(0.07f, 0.22f, hsl.z);
        float lGateHigh = 1.0f - smoothstep(0.86f, 0.98f, hsl.z);
        return hWeight * sGate * lGateLow * lGateHigh;
    }

    inline float applyHDToneCurveScalar(float x, float toeSoftness, float midContrast, float shoulderStart, float shoulderSoftness) {
        float y = clamp(x, 0.0f, 2.0f);
        // Shadow toe lift (smooth boost mostly below 0.35)
        float toeWeight = pow(max(1.0f - y, 0.0f), 2.4f);
        y = y + toeSoftness * 0.14f * toeWeight;

        // S-curve contrast around perceptual film pivot 0.46
        float pivot = 0.46f;
        float t = y - pivot;
        if (midContrast >= 1.0f) {
            float k = (midContrast - 1.0f) * 2.2f;
            float sCurve = tanh(t * (1.0f + k)) / max(tanh(0.5f * (1.0f + k)), 1e-4f) * 0.5f + pivot;
            y = mix(y, sCurve, 0.72f);
        } else {
            float soft = (1.0f - midContrast);
            y = pivot + t * (1.0f - soft * 0.48f);
        }

        // Asymptotic film shoulder roll-off for creamy highlight compression
        if (y > shoulderStart && shoulderSoftness > 0.001f) {
            float span = max(1.0f - shoulderStart, 0.05f);
            float over = (y - shoulderStart) / span;
            float compressed = shoulderStart + span * (over / (1.0f + over * (0.65f + shoulderSoftness * 1.4f)));
            y = mix(y, compressed, clamp(shoulderSoftness * 1.6f, 0.0f, 1.0f));
        }
        return clamp(y, 0.0f, 1.0f);
    }

    inline float hash12(float2 p) {
        float3 p3 = fract(float3(p.xyx) * 0.1031f);
        p3 += dot(p3, p3.yzx + 33.33f);
        return fract((p3.x + p3.y) * p3.z);
    }

    inline float valueNoise(float2 p) {
        float2 i = floor(p);
        float2 f = fract(p);
        float2 u = f * f * (3.0f - 2.0f * f);
        float a = hash12(i);
        float b = hash12(i + float2(1.0f, 0.0f));
        float c = hash12(i + float2(0.0f, 1.0f));
        float d = hash12(i + float2(1.0f, 1.0f));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    // Kernel 1: Stages 1-3 + Extraction for Halation & Black Mist
    kernel void opticalPrePassKernel(
        texture2d<float, access::read> srcLinear [[texture(0)]],
        texture2d<float, access::write> dstGraded [[texture(1)]],
        texture2d<float, access::write> dstGlowSrc [[texture(2)]],
        constant RecipeUniforms &u [[buffer(0)]],
        uint2 gid [[thread_position_in_grid]]
    ) {
        if (gid.x >= srcLinear.get_width() || gid.y >= srcLinear.get_height()) return;

        float4 inPix = srcLinear.read(gid);
        float3 lin = max(inPix.rgb, float3(0.0f));

        // --- Stage 1: Linear Exposure, WB & Weighted Monochrome Mixer ---
        float evMul = exp2(u.toneParams0.x);
        float temp = u.toneParams0.y;
        float tint = u.toneParams0.z;
        float3 wbGain = float3(
            clamp(1.0f + temp * 0.34f + tint * 0.08f, 0.5f, 1.8f),
            clamp(1.0f - tint * 0.24f, 0.5f, 1.6f),
            clamp(1.0f - temp * 0.34f + tint * 0.08f, 0.5f, 1.8f)
        );
        // Preserve neutral exposure gain across white-balance shifts
        wbGain /= max(luma709(wbGain), 0.1f);
        float3 c1 = lin * evMul * wbGain;

        float3 preEnc = clamp(linearToSRGB(c1), 0.0f, 1.0f);
        float3 preHSL = rgbToHSL(preEnc);
        float skinMask = computeSkinMask(preHSL, u.skinParams0.x, u.skinParams0.y);

        // Extract Halation Mask from un-cooled linear radiance so cool tungsten WB never kills bright neon/lamp halation
        // In linear light: 242/255 white shirt = 0.890, whereas saturated 250..255 light sources = 0.955..1.00+
        float halMask = 0.0f;
        float3 halTint = u.halationTint.rgb;
        if (u.halationParams.x > 0.5f) {
            float3 sceneHal = lin * max(evMul, 1.0f);
            float lHal = luma709(sceneHal);
            float maxHal = max(sceneHal.r, max(sceneHal.g, sceneHal.b));
            float energy = 0.55f * lHal + 0.45f * maxHal;
            float rawMask = smoothstep(u.halationParams.y, u.halationParams.y + max(u.halationParams.z, 0.02f), energy);
            // Protect ordinary daytime skin luminance from orange halation bleed
            float skinProtect = 1.0f - skinMask * (1.0f - smoothstep(0.90f, 0.98f, lHal));
            halMask = rawMask * skinProtect;
        }

        // Handle Pure Silver Monochrome Weighted Mixer (Stage 1B) before tone curve
        bool isMono = u.monoParams.x > 0.5f;
        if (isMono) {
            float lBase = dot(c1, u.monoWeights.rgb);
            float skyDH = hueDistDeg(preHSL.x, 218.0f);
            float skyMask = exp(-(skyDH * skyDH) / (2.0f * 36.0f * 36.0f)) * smoothstep(0.10f, 0.35f, preHSL.y);
            float monoDelta = skinMask * u.monoParams.y * 0.30f - skyMask * u.monoParams.z * 0.32f;
            float finalMono = max(lBase * (1.0f + monoDelta), 0.0f);
            c1 = float3(finalMono);
        }

        // --- Stage 2: 4-Zone H-D Film Curve ---
        float3 enc = linearToSRGB(c1);
        float yIn = max(luma709(enc), 1e-5f);
        float yCurve = applyHDToneCurveScalar(
            yIn,
            u.toneParams0.w,
            u.toneParams1.x,
            u.toneParams1.y,
            u.toneParams1.z
        );

        float3 curved = enc * (yCurve / yIn);
        // Gentle highlight shoulder desaturation (creamy film whites)
        float hiSatRoll = smoothstep(u.toneParams1.y, 1.0f, yCurve) * u.toneParams1.w;
        curved = mix(curved, float3(yCurve), clamp(hiSatRoll, 0.0f, 0.85f));
        curved = clamp(curved, 0.0f, 1.0f);

        // --- Stage 3: Skin-Protected Selective Color Calibration & Split Toning ---
        float3 graded = curved;
        float mSkin = skinMask;
        if (!isMono) {
            float3 hsl = rgbToHSL(curved);
            float h = hsl.x;
            float s = hsl.y;
            float l = hsl.z;

            // 3A. Skin protection band (~25 deg)
            mSkin = computeSkinMask(hsl, u.skinParams0.x, u.skinParams0.y);
            // 3B. Foliage green band (~115 deg)
            float gDist = hueDistDeg(h, 115.0f);
            float mGreen = exp(-(gDist * gDist) / (2.0f * 35.0f * 35.0f)) * smoothstep(0.08f, 0.25f, s);
            // 3C. Sky / denim blue band (~215 deg)
            float bDist = hueDistDeg(h, 215.0f);
            float mBlue = exp(-(bDist * bDist) / (2.0f * 38.0f * 38.0f)) * smoothstep(0.08f, 0.25f, s);
            // 3D. Cherry/crimson red band (~355 deg), keeping out of 25 deg orange skin
            float rDist = hueDistDeg(h, 355.0f);
            float mRed = exp(-(rDist * rDist) / (2.0f * 16.0f * 16.0f)) * smoothstep(0.14f, 0.35f, s) * (1.0f - mSkin);

            float hOut = h
                + u.skinParams0.z * mSkin
                + u.hueBands0.x * mGreen
                + u.hueBands0.w * mBlue;

            float sOut = s
                + u.skinParams0.w * mSkin
                + u.hueBands0.y * mGreen
                + u.hueBands1.x * mBlue
                + u.hueBands1.y * mRed;

            // Skin-protected Vibrance & Global Saturation (neutral grays/whites with s < 0.02 stay untouched!)
            float chromaPresent = smoothstep(0.02f, 0.12f, s);
            float vibAmount = u.skinParams1.w * (1.0f - s) * (1.0f - 0.65f * mSkin) * chromaPresent;
            sOut = (sOut + vibAmount) * mix(u.hueBands1.z, 1.0f, 0.35f * mSkin);

            float lOut = l
                + u.skinParams1.x * mSkin
                + u.hueBands0.z * mGreen;

            graded = hslToRGB(float3(hOut, clamp(sOut, 0.0f, 1.0f), clamp(lOut, 0.0f, 1.0f)));

            // 3E. Skin-Shielded Shadow & Highlight Split Toning
            float postLuma = luma709(graded);
            float shWeight = pow(max(1.0f - smoothstep(0.0f, 0.56f, postLuma), 0.0f), 1.55f) * (1.0f - u.skinParams1.y * mSkin);
            float hiWeight = pow(smoothstep(0.42f, 0.98f, postLuma), 1.45f) * (1.0f - 0.70f * u.skinParams1.y * mSkin);

            graded = mix(graded, graded + u.shadowTint.rgb * 0.45f, clamp(u.shadowTint.w * shWeight, 0.0f, 0.85f));
            // Highlight tint softly warms/cools brights without staining neutral pure white muddy
            float hiPureWhiteGuard = 1.0f - smoothstep(0.92f, 0.995f, postLuma) * (1.0f - hsl.y);
            graded = mix(graded, graded * u.highlightTint.rgb, clamp(u.highlightTint.w * hiWeight * hiPureWhiteGuard, 0.0f, 0.75f));
        }

        // Apply Black Floor pedestal cleanly
        float3 bf = u.blackFloor.rgb;
        graded = bf + graded * (1.0f - bf);
        graded = clamp(graded, 0.0f, 1.0f);

        // Extract Black Mist Glow mask (from graded encoded tone)
        float mistMask = 0.0f;
        if (u.mistParams.x > 0.5f) {
            float gLuma = luma709(graded);
            mistMask = smoothstep(u.mistParams.y, u.mistParams.y + max(u.mistParams.z, 0.04f), gLuma);
        }

        // Store graded sRGB-domain values (and linear/packed glow source)
        dstGraded.write(float4(graded, mSkin), gid);
        // RGB = halation glow color * mask, A = mist luma mask (multiplied by graded in composite/downsample)
        float3 mistRGB = graded * mistMask;
        float3 halRGB = halTint * halMask;
        // Pack halation in RGB and mist luminance energy cleanly; wait - let's store mistRGB when halation off, or store separately!
        // Notice dstGlowSrc stores RGB = (halMask > 0 ? halRGB : float3(0)) + (mistMask > 0 ? mistRGB * 0.0 : float3(0)) -> let's use two separate tiny textures in processor for complete independence!
        dstGlowSrc.write(float4(halRGB, mistMask), gid);
    }

    // Kernel 2: Downsample & extract cleanly into half-res glow buffers (RGB = Halation, separate mist pass or packed)
    kernel void downsampleGlowKernel(
        texture2d<float, access::read> gradedTex [[texture(0)]],
        texture2d<float, access::read> glowSrcTex [[texture(1)]],
        texture2d<float, access::write> dstHalTex [[texture(2)]],
        texture2d<float, access::write> dstMistTex [[texture(3)]],
        texture2d<float, access::write> dstLowFreqTex [[texture(4)]],
        uint2 gid [[thread_position_in_grid]]
    ) {
        if (gid.x >= dstHalTex.get_width() || gid.y >= dstHalTex.get_height()) return;

        uint2 base = gid * 2;
        uint w = gradedTex.get_width();
        uint h = gradedTex.get_height();

        float4 gSum = float4(0.0f);
        float4 sSum = float4(0.0f);
        float count = 0.0f;
        for (uint dy = 0; dy < 2; ++dy) {
            for (uint dx = 0; dx < 2; ++dx) {
                uint2 p = uint2(min(base.x + dx, w - 1), min(base.y + dy, h - 1));
                gSum += gradedTex.read(p);
                sSum += glowSrcTex.read(p);
                count += 1.0f;
            }
        }
        float4 gAvg = gSum / count;
        float4 sAvg = sSum / count;
        dstHalTex.write(float4(sAvg.rgb, 1.0f), gid);
        dstMistTex.write(float4(gAvg.rgb * sAvg.a, 1.0f), gid);
        dstLowFreqTex.write(gAvg, gid);
    }

    // Kernel 3A: Separable Horizontal Gaussian Blur (scale-invariant via dynamic tapStep)
    kernel void blurHorizontalKernel(
        texture2d<float, access::sample> src [[texture(0)]],
        texture2d<float, access::write> dst [[texture(1)]],
        constant BlurUniforms &bu [[buffer(0)]],
        uint2 gid [[thread_position_in_grid]]
    ) {
        if (gid.x >= dst.get_width() || gid.y >= dst.get_height()) return;
        constexpr sampler pxSampler(coord::pixel, address::clamp_to_edge, filter::linear);
        float sigma = max(bu.sigma, 0.5f);
        float step = max(bu.tapStep, 1.0f);
        int radius = min(28, max(1, int(ceil((sigma * 2.5f) / step))));
        float invTwoSigmaSq = 1.0f / (2.0f * sigma * sigma);

        float4 sum = float4(0.0f);
        float wSum = 0.0f;
        float cy = float(gid.y) + 0.5f;
        for (int dx = -radius; dx <= radius; ++dx) {
            float dist = float(dx) * step;
            float wt = exp(-(dist * dist) * invTwoSigmaSq);
            sum += src.sample(pxSampler, float2(float(gid.x) + 0.5f + dist, cy)) * wt;
            wSum += wt;
        }
        dst.write(sum / max(wSum, 1e-5f), gid);
    }

    // Kernel 3B: Separable Vertical Gaussian Blur (scale-invariant via dynamic tapStep)
    kernel void blurVerticalKernel(
        texture2d<float, access::sample> src [[texture(0)]],
        texture2d<float, access::write> dst [[texture(1)]],
        constant BlurUniforms &bu [[buffer(0)]],
        uint2 gid [[thread_position_in_grid]]
    ) {
        if (gid.x >= dst.get_width() || gid.y >= dst.get_height()) return;
        constexpr sampler pxSampler(coord::pixel, address::clamp_to_edge, filter::linear);
        float sigma = max(bu.sigma, 0.5f);
        float step = max(bu.tapStep, 1.0f);
        int radius = min(28, max(1, int(ceil((sigma * 2.5f) / step))));
        float invTwoSigmaSq = 1.0f / (2.0f * sigma * sigma);

        float4 sum = float4(0.0f);
        float wSum = 0.0f;
        float cx = float(gid.x) + 0.5f;
        for (int dy = -radius; dy <= radius; ++dy) {
            float dist = float(dy) * step;
            float wt = exp(-(dist * dist) * invTwoSigmaSq);
            sum += src.sample(pxSampler, float2(cx, float(gid.y) + 0.5f + dist)) * wt;
            wSum += wt;
        }
        dst.write(sum / max(wSum, 1e-5f), gid);
    }

    // Kernel 4: Stages 4-8 Optical Composite + Grain + Vignette + Debug Masks
    kernel void opticalCompositeKernel(
        texture2d<float, access::read> srcOrigLinear [[texture(0)]],
        texture2d<float, access::read> gradedTex [[texture(1)]],
        texture2d<float, access::sample> halBlurTex [[texture(2)]],
        texture2d<float, access::sample> mistBlurTex [[texture(3)]],
        texture2d<float, access::sample> lowFreqTex [[texture(4)]],
        texture2d<float, access::read> glowSrcTex [[texture(5)]],
        texture2d<float, access::write> dstOut [[texture(6)]],
        constant RecipeUniforms &u [[buffer(0)]],
        uint2 gid [[thread_position_in_grid]]
    ) {
        uint w = dstOut.get_width();
        uint h = dstOut.get_height();
        if (gid.x >= w || gid.y >= h) return;

        constexpr sampler linSampler(coord::normalized, address::clamp_to_edge, filter::linear);
        float2 uv = (float2(gid) + 0.5f) / float2(float(w), float(h));

        float4 gData = gradedTex.read(gid);
        float3 base = gData.rgb;
        float mSkin = gData.a;
        float4 lowSample = lowFreqTex.sample(linSampler, uv);
        float3 lowRGB = lowSample.rgb;

        // Debug mask modes (1=Skin, 2=Halation, 3=Mist, 4=Grain Bell Curve)
        int debugMode = int(round(u.renderParams.x));
        if (debugMode == 1) {
            dstOut.write(float4(mSkin, mSkin * 0.45f, 0.1f * mSkin, 1.0f), gid);
            return;
        }
        if (debugMode == 2) {
            float3 hMask = glowSrcTex.read(gid).rgb + halBlurTex.sample(linSampler, uv).rgb;
            dstOut.write(float4(clamp(hMask, 0.0f, 1.0f), 1.0f), gid);
            return;
        }
        if (debugMode == 3) {
            float mM = glowSrcTex.read(gid).a;
            float3 mBlur = mistBlurTex.sample(linSampler, uv).rgb;
            dstOut.write(float4(clamp(float3(mM * 0.4f) + mBlur, 0.0f, 1.0f), 1.0f), gid);
            return;
        }

        // --- Stage 6: Luminance-Preserving Skin Chroma Smooth (06) & Local Micro-Contrast & Peripheral Softness (05) ---
        float skinSmooth = u.skinParams1.z * mSkin;
        if (skinSmooth > 0.001f) {
            float yOrig = luma709(base);
            float yLow = max(luma709(lowRGB), 1e-4f);
            // Only smooth chromatic variation while preserving 100% original pore/eye luminance sharpness!
            float3 smoothedChroma = lowRGB * (yOrig / yLow);
            base = mix(base, clamp(smoothedChroma, 0.0f, 1.0f), clamp(skinSmooth, 0.0f, 0.85f));
        }

        // Radial normalized coordinates for optics & vignette
        float minDim = min(float(w), float(h));
        float aspect = float(w) / max(float(h), 1.0f);
        float2 aspectOffset = (uv - 0.5f) * float2(aspect, 1.0f);
        float maxRadius = 0.5f * length(float2(aspect, 1.0f));
        float rNorm = length(aspectOffset) / max(maxRadius, 1e-4f);

        // Peripheral lens softness (05 Disposable plastic lens)
        if (u.opticsParams0.z > 0.001f) {
            float edgeBlend = smoothstep(0.54f, 1.0f, rNorm) * u.opticsParams0.z * 0.72f;
            base = mix(base, lowRGB, clamp(edgeBlend, 0.0f, 0.8f));
        }

        // 3D-Pop Micro-contrast (06 Editorial / 07 Monochrome) with edge-halo protection
        if (u.opticsParams0.y > 0.001f) {
            float rawDetail = luma709(base) - luma709(lowRGB);
            // Edge-stopping halo guard: boost medium-frequency textures while preventing dark ringing near extreme edges
            float edgeGuard = exp(-(rawDetail * rawDetail) / (2.0f * 0.16f * 0.16f));
            float detail = clamp(rawDetail * edgeGuard, -0.12f, 0.12f);
            float skinDamp = 1.0f - 0.55f * mSkin;
            base = clamp(base + detail * u.opticsParams0.y * 1.45f * skinDamp, 0.0f, 1.0f);
        }

        // --- Stage 4: Point-Source Halation / CCD Blooming Composite ---
        if (u.halationParams.x > 0.5f && u.halationParams.w > 0.001f) {
            float3 halGlow = halBlurTex.sample(linSampler, uv).rgb * 3.4f;
            base = base + u.halationParams.w * halGlow * (1.0f - 0.42f * base);
            base = clamp(base, 0.0f, 1.0f);
        }

        // --- Stage 5: Black Mist Highlight Diffusion Composite ---
        if (u.mistParams.x > 0.5f && u.mistParams.w > 0.001f) {
            float3 mistGlow = mistBlurTex.sample(linSampler, uv).rgb;
            float3 mistTerm = clamp(mistGlow * u.mistParams.w, 0.0f, 0.85f);
            // Screen blend keeps sharp darks & core edges intact
            base = 1.0f - (1.0f - base) * (1.0f - mistTerm);
            base = clamp(base + mistGlow * u.opticsParams0.x * 0.5f, 0.0f, 1.0f);
        }

        // --- Stage 7: Bell-Curve Density-Dependent Grain & CCD Texture ---
        float curLuma = luma709(base);
        float bellWeight = exp(-pow((curLuma - 0.475f) / 0.22f, 2.0f))
            * smoothstep(0.02f, 0.12f, curLuma)
            * (1.0f - smoothstep(0.84f, 0.98f, curLuma));

        if (debugMode == 4) {
            dstOut.write(float4(bellWeight, bellWeight, bellWeight, 1.0f), gid);
            return;
        }

        float grainAmount = u.opticsParams1.x;
        if (grainAmount > 0.001f) {
            float seed = u.opticsParams2.w;
            // Aspect & resolution independent grain coordinates (anchored to short edge ~900 units)
            float2 gCoord = (uv * float2(float(w), float(h)) / max(minDim, 1.0f)) * (540.0f / max(u.opticsParams1.y, 0.4f));
            bool ccdMode = u.opticsParams0.w > 0.5f;
            float nLuma;
            float3 nChroma;
            if (ccdMode) {
                float2 qCoord = floor(gCoord * 1.15f);
                nLuma = hash12(qCoord + seed) - 0.5f;
                nChroma = float3(
                    hash12(qCoord + seed + 19.7f) - 0.5f,
                    hash12(qCoord + seed + 47.3f) - 0.5f,
                    hash12(qCoord + seed + 83.1f) - 0.5f
                );
            } else {
                // Organic multi-octave clumped silver halide
                float n1 = valueNoise(gCoord * 0.9f + seed);
                float n2 = hash12(floor(gCoord * 1.65f) + seed * 1.7f);
                nLuma = (0.62f * n1 + 0.38f * n2) - 0.5f;
                nChroma = float3(
                    valueNoise(gCoord * 0.7f + seed + 13.0f) - 0.5f,
                    valueNoise(gCoord * 0.7f + seed + 29.0f) - 0.5f,
                    valueNoise(gCoord * 0.7f + seed + 51.0f) - 0.5f
                );
            }
            float3 grainDelta = mix(float3(nLuma), nChroma, u.opticsParams1.z);
            float scale = grainAmount * 0.24f * (0.25f + 0.75f * bellWeight);
            base = clamp(base + grainDelta * scale, 0.0f, 1.0f);
        }

        // --- Stage 8: Flash Center Pop, Cos^4 Optical Vignette & Organic Light Leak ---
        if (u.opticsParams2.y > 0.001f) {
            float centerPop = exp(-(rNorm * rNorm) / (2.0f * 0.42f * 0.42f)) * u.opticsParams2.y;
            base = clamp(base * (1.0f + centerPop), 0.0f, 1.0f);
        }

        if (u.opticsParams1.w > 0.001f) {
            float vigCurve = pow(smoothstep(0.24f, 1.08f, rNorm), max(u.opticsParams2.x * 0.55f, 0.8f));
            float vigMul = 1.0f - clamp(u.opticsParams1.w * vigCurve, 0.0f, 0.80f);
            base *= vigMul;
        }

        // Seed-varied procedural corner light leak (05 Lo-Fi only)
        if (u.opticsParams2.z > 0.001f) {
            float s = u.opticsParams2.w;
            float side = (fmod(s, 2.0f) < 1.0f) ? 1.0f : 0.0f;
            float yAnchor = 0.22f + 0.55f * fract(s * 0.371f);
            float2 leakOrigin = float2(side, yAnchor);
            float dLeak = length((uv - leakOrigin) * float2(1.45f, 0.78f));
            float leakMask = exp(-(dLeak * dLeak) / (2.0f * 0.26f * 0.26f));
            float3 leakColor = float3(1.0f, 0.38f, 0.10f);
            base = clamp(base + leakColor * leakMask * u.opticsParams2.z * 0.55f, 0.0f, 1.0f);
        }

        // --- Intensity Mix with Stock Original (0%..100%) ---
        float intensity = clamp(u.blackFloor.w, 0.0f, 1.0f);
        float3 finalEncoded = base;
        if (intensity < 0.999f) {
            float3 origEnc = clamp(linearToSRGB(max(srcOrigLinear.read(gid).rgb, 0.0f)), 0.0f, 1.0f);
            finalEncoded = mix(origEnc, base, intensity);
        }

        // Optionally decode back to linear sRGB if caller outputs into linear texture
        float3 outColor = (u.renderParams.y > 0.5f) ? finalEncoded : srgbToLinear(finalEncoded);
        dstOut.write(float4(outColor, 1.0f), gid);
    }
    """#
}
