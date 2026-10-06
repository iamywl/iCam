# 🤖 SnapStudio 자율 개발 & UI/UX 깨짐 자가 치유 QA 파이프라인
> **Autonomous UI/UX Verification & Self-Healing Pipeline for SnapStudio**  
> *사용자의 개입 없이 자동으로 UI/UX 깨짐·가림·클리핑을 검증하고 자가 치유하는 시스템*

---

## 1. 파이프라인 개요 (Overview)

SnapStudio는 **16종의 레트로/아날로그/스튜디오 카메라**, **17종의 필터 팩**, **6종의 광학 렌즈**, **4종의 아이폰 기기 티어(SE, Mini, Standard, Max)**를 지원하는 대규모 하이브리드 카메라 솔루션입니다.

다양한 해상도와 카메라 모드 간 전환 과정에서 발생할 수 있는 다음 결함을 **인간의 개입 없이 100% 자동 탐지 및 자가 치유**합니다:
1. **상단 뷰파인더 HUD 오버랩**: 활성 카메라 뱃지/스텝퍼와 카메라 OSD 상단 요소(브랜드 태그, 해상도, 플래시 상태 등)의 겹침.
2. **하단 컨트롤 드로어 요소 클리핑**: 드로어 높이 부족 및 CSS 오버플로우로 인한 토글 알약(`vintage-toggles`) 잘림.
3. **드로어와 하단 섹션 간 충돌**: 드로어 하단과 카메라 카테고리 바(`camera-category-bar`), 모드 휠 다이얼 간 간격 부족.
4. **디바이스별 뷰포트 반응형 붕괴**: iPhone SE(667px)부터 Pro Max(932px)까지 safe-area 및 비율 왜곡.

---

## 2. 자율 검증 아키텍처 (Architecture)

```
[개발/변경 발생] ───► [Chrome CDP 자동 구동] ───► [4대 디바이스 티어 설정]
                              │                             │
                              ▼                             ▼
                      [16개 카메라 자동 순회] ◄── [DOM BoundingBox 실측]
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       [검증 성공: 140/140 Pass]      [결함 발견: Bounding Box 충돌]
               │                             │
               ▼                             ▼
       [스크린샷 4종 생성 및 저장]    [오프셋·클리핑 수치 자동 진단]
               │                             │
               ▼                             ▼
       [Git Commit & Push 트리거]     [CSS/HTML 지오메트리 자가 치유]
                                             │
                                             └───► [재검증 루프 (0 Fail까지)]
```

---

## 3. 핵심 자동화 검증 스크립트 (`scripts/test-qa-overlap-and-clipping.py`)

CDP(Chrome DevTools Protocol)를 통해 실제 크롬 브라우저를 백그라운드에서 구동하여 DOM 엘리먼트의 실제 픽셀 좌표(`getBoundingClientRect()`)를 밀리초 단위로 수집하고 물리적 충돌을 검사합니다.

### 4대 디바이스 티어 검증 매트릭스
1. **iPhone SE 2/3 (375 × 667 pt)**: 초소형 화면 (홈버튼 SE)
2. **iPhone 13 mini (375 × 812 pt)**: 컴팩트 노치
3. **iPhone 15/16 Pro (393 × 852 pt)**: 표준 다이내믹 아일랜드 (국내 점유율 1위)
4. **iPhone 16 Pro Max (430 × 932 pt)**: 대화면 플래그십 (글로벌 1위)

### 140개 자동 검증 항목
- **뷰파인더 ↔ 컨트롤 드로어 간격**: 최소 2.0px 이상 분리 여부
- **컨트롤 드로어 ↔ 하단 섹션 간격**: 최소 2.0px 이상 분리 여부
- **카테고리 바 ↔ 모드 다이얼 간격**: 충돌 0px 여부
- **16개 카메라 OSD 상단 ↔ HUD 뱃지 상하 간격**: `osd.top >= badge.bottom + 2.0px`
- **16개 카메라 빈티지 토글 알약 클리핑**: `toggles.bottom <= drawer.bottom + 2.0px`

### 단일 명령 실행 방법
```bash
# 로컬 개발 서버가 구동 중인 상태에서 즉시 실행
python scripts/test-qa-overlap-and-clipping.py
```

### 최근 실행 결과: 140/140 Pass (100.0%)
```text
================================================================================
🚀 SnapStudio Autonomous QA Suite: Zero-Overlap & Zero-Clipping Verification
================================================================================

📱 Testing Viewport Tier: iPhone SE (375x667)
  [PASS] Viewfinder to Drawer gap: 6.0px (>= 2px)
  [PASS] Drawer to Bottom Section gap: 6.0px (>= 2px)
  [PASS] Category Bar to Mode Dial gap: 17.0px (>= 0px)
  🔍 Auditing 16 Camera Panels for HUD Clearance & Zero Clipping...
  📸 Saved screenshot: qa_viewport_se.png

📱 Testing Viewport Tier: iPhone 13 mini (375x812)
  [PASS] Viewfinder to Drawer gap: 6.0px (>= 2px)
  [PASS] Drawer to Bottom Section gap: 6.0px (>= 2px)
  [PASS] Category Bar to Mode Dial gap: 11.5px (>= 0px)
  🔍 Auditing 16 Camera Panels for HUD Clearance & Zero Clipping...
  📸 Saved screenshot: qa_viewport_mini.png

📱 Testing Viewport Tier: iPhone 15/16 Pro (393x852)
  [PASS] Viewfinder to Drawer gap: 6.0px (>= 2px)
  [PASS] Drawer to Bottom Section gap: 6.0px (>= 2px)
  [PASS] Category Bar to Mode Dial gap: 12.5px (>= 0px)
  🔍 Auditing 16 Camera Panels for HUD Clearance & Zero Clipping...
  📸 Saved screenshot: qa_viewport_standard.png

📱 Testing Viewport Tier: iPhone 16 Pro Max (430x932)
  [PASS] Viewfinder to Drawer gap: 6.0px (>= 2px)
  [PASS] Drawer to Bottom Section gap: 6.0px (>= 2px)
  [PASS] Category Bar to Mode Dial gap: 14.5px (>= 0px)
  🔍 Auditing 16 Camera Panels for HUD Clearance & Zero Clipping...
  📸 Saved screenshot: qa_viewport_max.png

================================================================================
🏁 QA Audit Results: 140/140 checks passed (100.0%)
================================================================================
🎉 PERFECT SCORE: ZERO OVERLAP AND ZERO CLIPPING ACROSS ALL 16 CAMERAS AND 4 IPHONE TIERS!
```

---

## 4. 자가 치유(Self-Healing) 규칙 가이드라인

만약 새로운 기능이나 카메라 모델이 추가되어 QA 테스트에서 충돌이 감지될 경우, 파이프라인 에이전트는 다음 치유 공식을 자동 적용합니다:

### 규칙 A: OSD 상단 충돌 치유
- **증상**: `osd.top - badge.bottom < 2.0px`
- **치유**: 해당 OSD 클래스에 `margin-top: 32px !important;` (배너형의 경우 `36px !important;`)를 부여하여 배지(높이 26px) 아래로 강제 이동.

### 규칙 B: 드로어 토글 클리핑 치유
- **증상**: `toggles.bottom > drawer.bottom + 2.0px`
- **치유 1**: `.vintage-toggles`에 `flex-wrap: nowrap; overflow-x: auto;`를 부여하여 알약이 2줄로 꺾여 세로로 팽창하는 현상 원천 차단.
- **치유 2**: `.filter-chip` 패딩을 `3px 8px`, 아이콘 `13px`, 태그 `8px`로 콤팩트화하여 드로어 내 세로 여유 공간 20px 이상 확보.
- **치유 3**: 디바이스별 드로어 높이를 최소 136px~148px로 상향 조정하고 `overflow-y: auto; scrollbar-width: none;` 보장.

### 규칙 C: 디바이스별 상하 간격 충돌 치유
- **증상**: `drawer.top - vf.bottom < 2.0px` 또는 `bottom.top - drawer.bottom < 2.0px`
- **치유**: 황금 레이아웃 지오메트리(뷰파인더 436px, 드로어 142px, 하단 148px)를 준수하여 컴포넌트 간 최소 6px의 절대 마진 유지.
