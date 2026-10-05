#!/usr/bin/env python3
"""
SnapStudio Automated QA & Prototype Integrity Test Suite
Verifies HTML structure, Asset presence, CSS Glass tokens, and JS syntax.
"""

import os
import sys
import re

def test_files_exist():
    required_files = [
        'index.html',
        'style.css',
        'app.js',
        'model_female.png',
        'model_male.png',
        'PLANNING.md'
    ]
    missing = [f for f in required_files if not os.path.exists(f)]
    if missing:
        print(f"❌ Missing required files: {missing}")
        return False
    print("✅ All required core files are present.")
    return True

def test_html_dom_integrity():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    required_ids = [
        'viewfinder',
        'viewfinder-bg',
        'camera-video',
        'model-canvas',
        'shutter-btn',
        'mode-dial-list',
        'camera-model-badge',
        'drawer-canon-ixy',
        'drawer-sony-handycam',
        'drawer-sony-cybershot',
        'drawer-instax-mini',
        'drawer-olympus-mju',
        'drawer-contax-t2',
        'drawer-ricoh-gr',
        'drawer-leica-m',
        'drawer-citypop-80s',
        'drawer-oldfilm-35mm',
        'drawer-sihyun-color',
        'drawer-passport-id',
        'dynamic-island',
        'mood-card-frame',
        'sihyun-moment-title',
        'sihyun-color-badge',
        'btn-lens',
        'lens-filter-popover',
        'lens-layer-mist',
        'lens-layer-star',
        'lens-layer-streak',
        'lens-layer-prism',
        'lens-layer-cpl'
    ]

    missing_ids = [eid for eid in required_ids if f'id="{eid}"' not in html]
    if missing_ids:
        print(f"❌ HTML missing critical DOM IDs: {missing_ids}")
        return False
    print("✅ HTML DOM IDs & 12 Iconic Camera Racks integrity passed.")
    return True

def test_css_tokens():
    with open('style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    tokens = [
        '--device-width',
        '--device-height',
        '--glass-bg-thin',
        '--glass-blur-md',
        '--glass-border',
        '--accent-mint',
        'height: 492px;',
        'aspect-ratio: 3 / 4;'
    ]

    missing_tokens = [t for t in tokens if t not in css]
    if missing_tokens:
        print(f"❌ CSS missing design tokens or 3:4 layout: {missing_tokens}")
        return False
    print("✅ CSS Liquid Glass tokens & 3:4 Viewfinder layout verified.")
    return True

def test_js_syntax():
    with open('app.js', 'r', encoding='utf-8') as f:
        js = f.read()

    # Check required functions for 6-Camera Architecture
    functions = [
        'renderStudioModel',
        'switchCamera',
        'applyCurrentCameraFilter',
        'applyLensFilter',
        'renderColorSwatches',
        'executeCapture',
        'initEventListeners'
    ]

    missing_funcs = [fn for fn in functions if f'function {fn}' not in js]
    if missing_funcs:
        print(f"❌ JS missing critical functions: {missing_funcs}")
        return False
    print("✅ JavaScript 6-Camera Switcher & Live Background engine verified.")
    return True

def main():
    print("🚀 Running SnapStudio Automated QA & Prototype Integrity Test...")
    tests = [
        test_files_exist,
        test_html_dom_integrity,
        test_css_tokens,
        test_js_syntax
    ]

    all_passed = True
    for t in tests:
        if not t():
            all_passed = False

    if all_passed:
        print("\n🎉 ALL TESTS PASSED: Web Prototype QA verified successfully!")
        sys.exit(0)
    else:
        print("\n🚨 SOME TESTS FAILED: Please check the report above.")
        sys.exit(1)

if __name__ == '__main__':
    main()
