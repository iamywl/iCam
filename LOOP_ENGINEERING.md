# 🔄 iCam (SnapStudio) 루프 엔지니어링 & 오류 상태 관리 아키텍처 (LOOP_ENGINEERING.md)
> **문서 버전**: v1.0.0 (Closed-Loop Engineering Standard)  
> **상태 저장소**: [`ERROR_STATE_REGISTRY.json`](./ERROR_STATE_REGISTRY.json)  
> **통합 검증 러너**: [`scripts/test-loop-engineering.py`](./scripts/test-loop-engineering.py)  

---

## 1. 루프 엔지니어링 (Closed-Loop Engineering) 개요

본 프로젝트는 단순한 일회성 구현이 아니라, **기획(Plan) → 오류 레지스트리 사전 대조(Pre-Flight Audit) → 개발(Develop) → 다중 기기/기능 전수 검증(Automated Verification) → 오류 상태 기록 및 재기획 피드백(State Registry & Feedback Re-Planning)**이 끊임없이 순환하며 스스로 진화하는 **폐루프 엔지니어링(Closed-Loop Engineering)** 체계를 따릅니다.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       iCam Closed-Loop Engineering Lifecycle                           │
│                                                                                        │
│   ┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────┐   │
│   │  Phase 1: 감성/기능  │ ───▶  │  Phase 2: 오류 상태  │ ───▶  │ Phase 3: 코드 및 │   │
│   │  기획 및 명세 고도화 │       │  레지스트리 사전대조 │       │ 컬러사이언스 구현│   │
│   │ (PLANNING/DESIGN.md) │       │ (ERROR_STATE_REG...) │       │ (Web + Swift 1:1)│   │
│   └──────────────────────┘       └──────────────────────┘       └──────────────────┘   │
│              ▲                                                            │            │
│              │                                                            ▼            │
│   ┌──────────────────────┐                                      ┌──────────────────┐   │
│   │  Phase 5: 오류 사례  │ ◀─────────────────────────────────── │ Phase 4: 전수 QA │   │
│   │  상태 갱신 & 재기획  │    (결함 발견 시 즉시 상태 등록 &    │ 350+ 자동화 검증 │   │
│   │  피드백 루프 반영    │     회귀 어설션 추가 후 루프 재실행) │ (Multi-Device)   │   │
│   └──────────────────────┘                                      └──────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 5단계 루프 엔지니어링 프로토콜 (5-Stage Protocol)

### Stage 1: 감성 & 기능 기획 (Aesthetic & Functional Planning)
- 새로운 감성(예: **뉴진스 Ditto '98 겨울 캠코더 감성**, **도쿄 Y2K & 1980년대 일본 버블 경제 감성**, **사용자 레퍼런스 16종 실물 카메라 바디 감성**)이나 기능을 도입할 때, 먼저 [`PLANNING.md`](./PLANNING.md), [`FUNCTIONAL_SPEC.md`](./FUNCTIONAL_SPEC.md), [`DESIGN.md`](./DESIGN.md)에 분광학적 컬러 수치, UI 지오메트리, 사용자 인터랙션 명세를 정의합니다.
- 이 단계에서 [`ERROR_STATE_REGISTRY.json`](./ERROR_STATE_REGISTRY.json)의 `preventionRule`들을 기획 요구사항의 제약 조건(Constraints)으로 자동 편입합니다.

### Stage 2: 오류 상태 레지스트리 사전 대조 (Pre-Flight Registry Audit)
- 개발 에이전트(`DeveloperAgent`)와 UI/UX 에이전트(`UIUXDesignerAgent`)는 코드를 단 한 줄이라도 수정하기 전에 [`ERROR_STATE_REGISTRY.json`](./ERROR_STATE_REGISTRY.json)을 읽고 과거 발생한 모든 오류 사례(`ERR-001` ~ `ERR-010`)의 근본 원인(`rootCause`)과 예방 규칙(`preventionRule`)을 확인합니다.
- **절대 위반 금지 체크리스트**:
  - `ERR-001`: 줌 배율(`1x~5x`) 및 모든 뷰파인더 컨트롤은 반드시 **라이브 뷰파인더 + 캡처 캔버스(`executeCapture`) + EXIF** 3곳에 동시 반영되는가?
  - `ERR-002`: 4대 디바이스 티어 × 16종 카메라(64개 상태)에서 수직 레이아웃 겹침(Overlap)이나 하단 클리핑(Clipping)을 유발하지 않는가?
  - `ERR-003`: 가로 모드(`Landscape 4:3`) 전환 시 뷰파인더 비율과 우측 셔터 그립 레이아웃이 깨지지 않는가?
  - `ERR-004`: 스마트폰(iPhone/Galaxy), 태블릿(iPad), 폴더블(Z Fold), 중간 뷰포트(`601px~1100px`)에서 모든 제어기에 접근 가능한가?
  - `ERR-007`: 저장되는 사진에 불필요한 브랜드 로고 워터마크를 찍지 않고, 실시간 날짜(`getLiveVintageTimestamp`)와 선택적 감성 문구(`fimoCaptionEnabled`)만 정교하게 인화하는가?

### Stage 3: 모듈형 개발 구현 (Modular Implementation)
- [`index.html`](./index.html), [`style.css`](./style.css), [`app.js`](./app.js), [`spectral-color-engine.js`](./spectral-color-engine.js), 그리고 iOS 네이티브 코어(`Sources/iCamCore/`)에 기능을 구현합니다.
- 3×3 분광 교차 행렬과 H-D 시그모이드 톤 커브, 16종 커스텀 스큐어모픽 SVG 바디 아이콘, 감성 사진 문구(Caption) 및 노출 아크 다이얼(EV)을 무결점 구현합니다.

### Stage 4: 전수 자동화 검증 (Automated Multi-Suite Verification)
코드 수정 직후 다음 5대 자동화 검증 스위트를 연속 실행하여 **단 1건의 실패도 없어야(100% Pass)** 다음 단계로 넘어갑니다:
1. **`python3 scripts/test-loop-engineering.py`**:
   - `ERROR_STATE_REGISTRY.json` 무결성 및 `ERR-001` ~ `ERR-010` 회귀 가드 전수 검증
   - 뉴진스 Ditto 감성 / 도쿄 Y2K & 일본 버블 경제 감성 / 레퍼런스 16종 카메라 SVG & 페르소나 검증
   - 날짜 ON/OFF, 사진 문구(Caption) ON/OFF 프리뷰 및 실제 캡처 인화 검증
   - 우측 곡면 노출 아크 다이얼(EV) 및 줌 룰러(`1x~5x`) 캡처 반영 검증
2. **`python3 scripts/test-multi-device.py`**:
   - iPhone SE, iPhone 16 Pro, iPhone 16 Pro Max, Galaxy S24 Ultra, iPad Pro, Galaxy Z Fold, Compact Laptop(`900×780`), Fluid Fullscreen 등 32개 멀티 디바이스 항목 전수 검증
3. **`python3 scripts/test-landscape-mode.py`**:
   - 가로 모드(`4:3` 뷰파인더 + 우측 엄지 그립 + `1440×1080` 가로 캡처) 15개 항목 검증
4. **`python3 scripts/test-qa-overlap-and-clipping.py`**:
   - 4개 디바이스 티어 × 16종 카메라 = 64개 뷰파인더/드로어 상태의 픽셀 단위 오버랩/클리핑 148개 항목 검증
5. **`swift test` / `swift run iCamTestRunner`**:
   - iOS Native Swift 코어 엔진 119개 단위 테스트 검증

### Stage 5: 오류 상태 업데이트 및 피드백 재기획 (State Update & Feedback Loop)
- 만약 Stage 4 검증 과정에서 새로운 결함이나 엣지 케이스가 발견되면, 단순히 코드만 고치고 넘어가지 않고 **반드시 [`ERROR_STATE_REGISTRY.json`](./ERROR_STATE_REGISTRY.json)에 새로운 `ERR-XXX` 항목으로 등록**합니다.
- 해당 오류를 영구 차단하는 자동화 어설션(`assertionKey`)을 `scripts/test-loop-engineering.py`에 추가하고, `PLANNING.md` 및 `DESIGN.md`의 설계 규칙에 피드백하여 다음 기획/개발 사이클에서 동일한 실수가 원천 불가능하도록 진화시킵니다.

---

## 3. 등록된 오류 상태 레지스트리 요약 (Registered Error Matrix)

| 오류 ID | 카테고리 | 핵심 증상 요약 | 회귀 검증 스크립트 | 현재 상태 |
| :--- | :--- | :--- | :--- | :--- |
| **`ERR-001`** | `CORE_OPTICS_AND_UX` | 줌 배율(`1x~5x`) 뷰파인더 및 캡처 미반영 | `test-loop-engineering.py` | ✅ `RESOLVED_AND_GUARDED` |
| **`ERR-002`** | `UI_UX_LAYOUT_GEOMETRY` | 16종 카메라 드로어 및 소형 화면 수직 겹침/클리핑 | `test-qa-overlap-and-clipping.py` | ✅ `RESOLVED_AND_GUARDED` |
| **`ERR-003`** | `ERGONOMICS_AND_ORIENTATION` | 가로 모드(`4:3` 뷰파인더 & 우측 그립) 미지원 | `test-landscape-mode.py` | ✅ `RESOLVED_AND_GUARDED` |
| **`ERR-004`** | `CROSS_DEVICE_COMPATIBILITY` | 단일 기기 편향, Galaxy 버튼 오류, 900px 퀵바 누락 | `test-multi-device.py` | ✅ `RESOLVED_AND_GUARDED` |
| **`ERR-005`** | `QA_AUTOMATION_INFRASTRUCTURE` | Headless Chrome CDP `mobile:False` 뷰포트 왜곡 | `test-multi-device.py` | ✅ `RESOLVED_AND_GUARDED` |
| **`ERR-006`** | `CI_CD_AND_NATIVE_BUILD` | `Package.swift` Swift 6.0 / macOS-14 러너 충돌 | `test-loop-engineering.py` | ✅ `RESOLVED_AND_GUARDED` |
| **`ERR-007`** | `PHOTO_PURITY_AND_IDEMPOTENCY` | 사진 내 브랜드 워터마크 인쇄 및 정적 과거 날짜 오류 | `test-loop-engineering.py` | ✅ `RESOLVED_AND_GUARDED` |
| **`ERR-008`** | `VINTAGE_AESTHETIC_FIDELITY` | 레퍼런스 16종 카메라 바디 컬러/실루엣과 SVG 불일치 | `test-loop-engineering.py` | ✅ `RESOLVED_AND_GUARDED` |
| **`ERR-009`** | `VINTAGE_AESTHETIC_FIDELITY` | 뉴진스 Ditto·도쿄 버블 감성 문구(Caption) 및 노출 아크 미연동 | `test-loop-engineering.py` | ✅ `RESOLVED_AND_GUARDED` |
| **`ERR-010`** | `PROCESS_AND_GOVERNANCE` | 기획-개발-검증-오류상태관리 루프 아키텍처 부재 | `test-loop-engineering.py` | ✅ `RESOLVED_AND_GUARDED` |
