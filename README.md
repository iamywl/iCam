# iCam (SnapStudio) - iPhone Native Multi-Camera Studio & Modular Filter Engine

> **Apple Human Interface Guidelines (HIG)** 준수, **iPhone 16 Pro** 하드웨어 규격 및 **SwiftUI / CoreImage / AVFoundation / Metal** 기반의 네이티브 아이폰 카메라 어플리케이션입니다.  
> 기획서([PLANNING.md](./PLANNING.md))의 핵심 사양을 100% 반영하여, **단순 필터 앱을 넘어 6대의 독립 카메라 기종을 기계식으로 교체(Switch Camera)하고, 고도로 모듈화된 필터 파이프라인(FilterRegistry)을 통해 유지보수와 확장이 용이**하도록 구현되었습니다.

---

## 📱 핵심 아키텍처: 모듈형 카메라 필터 시스템 (Modular Filter Architecture)

카메라 필터 시스템은 **Open-Closed Principle (OCP)**을 철저히 준수하여 프로토콜 기반으로 완전 모듈화되어 있습니다.  
새로운 카메라 기종이나 필터를 추가할 때 **카메라 뷰나 엔진 코드를 1줄도 수정할 필요 없이** 독립 파일로 생성 후 `FilterRegistry`에 등록(Plug-and-play)하기만 하면 됩니다.

```
                    ┌──────────────────────────────┐
                    │    CameraService / AVEngine  │
                    └──────────────┬───────────────┘
                                   │ Raw CIImage
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   FilterPipeline (Chain Executor)                      │
│                                                                        │
│  [Step 1] Live Background Matting (Vision VNGeneratePersonSegmentation)│
│  [Step 2] Modular CameraFilter (Canon, Handycam, Cybershot, etc.)      │
│  [Step 3] Detachable OpticalFilter (Black Mist, Star, Streak, etc.)    │
│  [Step 4] Sensor Grain / Halation / Film Vignette Composite            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│               FilterRegistry (Thread-safe Central Registry)             │
│                                                                        │
│  ├── CanonIXYFilterPack (Peach Glow, Flash Pop, Lo-Fi, Night Noise)    │
│  ├── SonyHandycamFilterPack (MiniDV, Hi8 Tape, Super 8, NightShot)     │
│  ├── SonyCybershotFilterPack (CCD Blue, Magenta, Flash Sharp, Matrix)  │
│  ├── FujiInstaxFilterPack (Instax Soft, Polaroid 600, Warm Mono, Vivid)│
│  ├── SihyunFilterPack (Spring Warm, Summer Cool, Autumn, Winter Deep)  │
│  ├── PassportIDFilterPack (Neutral 5000K, Sharp Softbox, Mono, Warm)   │
│  └── OpticalLensFilterPack (Black Mist, Star, Blue Streak, Prism, CPL) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📷 6대 독립 카메라 라인업 (The 6 Iconic Cameras)

하단 기계식 다이얼 및 카메라 랙을 통해 카메라를 바꾸면 **바디 테마, 전용 뷰파인더 OSD, 전용 필터 세트(각 4종), 셔터 메커니즘**이 통째로 전환됩니다:

| 카메라 기종 | 컨셉 및 특징 | 전용 모듈형 필터 세트 (카메라별 4종 고유) |
| :--- | :--- | :--- |
| **📷 Canon IXY Digital 50** | 2000년대 Y2K 얼짱 디카 명기 (복숭아빛 피부 & AiAF OSD) | • `Peach Glow` (뽀샤시 복숭아빛 스킨)<br>• `Flash Pop` (디카 직광 플래시)<br>• `Lo-Fi Pastel` (들뜬 파스텔 섀도우)<br>• `Night Noise` (밤거리 고감도 노이즈) |
| **📹 Sony DCR Handycam** | 90s-00s 미니DV 비디오 테이프 캠코더 (● REC 타임코드) | • `MiniDV Classic` (소니 3CCD 비디오 톤)<br>• `Hi8 VHS Tape` (스캔라인 글리치)<br>• `Super 8 Cine` (골든 앰버 홈무비)<br>• `NightShot Green` (0 Lux 적외선 녹색) |
| **💿 Sony Cyber-shot CCD** | 2000년대 사이버 Y2K 미래주의 디카 (쿨블루 틴트 & 플래시) | • `CCD Cool Blue` (투명한 쿨톤 피부)<br>• `Cyber Magenta` (테크노 네온 마젠타)<br>• `Flash Sharp` (선명하고 쨍한 대비)<br>• `Matrix Green` (세기말 매트릭스 그린) |
| **🖼️ Fuji Instax & Polaroid** | 아날로그 즉석 인화 카메라 (시그니처 화이트 카드 프레임) | • `Instax Mini Soft` (화이트 카드 프레임)<br>• `Polaroid 600` (클래식 정방형 스퀘어)<br>• `Warm Monochrome` (웜톤 흑백 즉석사진)<br>• `Rainbow Vivid` (무지개 비비드 카드) |
| **🎨 시현하다 Color Studio** | **실시간 라이브 배경 컬러 치환 스튜디오** | • 시현하다 Best 8색 실시간 라이브 온디바이스 세그멘테이션 반영<br>• 상단 `[이름]'s Moment` (실시간 수정) + 하단 친필 서명 각인 |
| **🪪 여권 / 신분증 규격 카메라** | 대한민국 외교부 및 공공기관 신분증 100% 규격 충족 | • 여권(3.5x4.5), 주민등록/면허, 반명함, 비자 규격 HUD<br>• 4x6인치 8분할 인쇄 시트(재단선 포함) 원클릭 고해상도 출력 |

---

## 🔍 탈부착 광학 렌즈 필터 시스템 (상단 [◎ 렌즈] 버튼)

어떤 카메라 기종을 장착하든 상단 툴바의 `[◎ 렌즈]` 버튼을 통해 실제 물리 광학 렌즈 필터를 교차 장착할 수 있습니다:
- **✨ Black Mist**: 하이라이트 할레이션(블룸) & 인물 피부결 소프트닝
- **✦ Cross Star 4X**: 점광원 및 야경 다이아몬드 별빛 4방향 회절광
- **━ Blue Streak**: 아나모픽 네온 사이언 수평 플레어
- **🌈 Prism Spectrum**: 무지개 색수차 분광 및 림라이트
- **🪞 CPL Polarizer**: 불필요한 반사광 억제 및 색상 채도·선명도 극대화

---

## 📂 프로젝트 구조 (iOS Native Codebase)

```
iCam/
├── Package.swift                             # Swift 패키지 & 모듈 의존성 정의
├── Info.plist                                # 카메라 & 사진첩 권한 설정 (NSCameraUsageDescription)
└── Sources/
    ├── iCamCore/
    │   ├── App/
    │   │   └── iCamApp.swift                 # iOS 앱 엔트리포인트
    │   ├── Models/
    │   │   ├── PersonalColorPalette.swift    # 시현하다 Best 8 컬러 팔레트
    │   │   └── PassportSpec.swift            # 외교부/ICAO 여권·신분증 공식 규격
    │   ├── FilterModule/                     # 🌟 모듈형 필터 아키텍처
    │   │   ├── Protocols/
    │   │   │   ├── CameraFilter.swift        # 필터 인터페이스 프로토콜
    │   │   │   ├── OpticalFilter.swift       # 광학 렌즈 인터페이스 프로토콜
    │   │   │   ├── CameraCategory.swift      # 6대 카메라 기종 분류
    │   │   │   └── FilterParameter.swift     # 필터 파라미터 제어 모델
    │   │   ├── Helpers/
    │   │   │   └── FilterHelpers.swift       # 고성능 CoreImage 최적화 유틸
    │   │   ├── Engine/
    │   │   │   ├── FilterRegistry.swift      # 모듈형 필터 동적 등록/조회 중앙 레지스트리
    │   │   │   └── FilterPipeline.swift      # 필터 체이닝 및 세그멘테이션 합성 파이프라인
    │   │   └── Packs/                        # 각 카메라별 독립 필터 팩 (유지보수 극대화)
    │   │       ├── CanonIXYFilters.swift     # Canon IXY 전용 4종
    │   │       ├── SonyHandycamFilters.swift # Sony Handycam 전용 4종
    │   │       ├── SonyCybershotFilters.swift# Sony Cyber-shot 전용 4종
    │   │       ├── FujiInstaxFilters.swift   # Fuji Instax/Polaroid 전용 4종
    │   │       ├── SihyunColorFilters.swift  # 시현하다 퍼스널컬러 4종
    │   │       ├── PassportIDFilters.swift   # 여권/신분증 스튜디오 4종
    │   │       └── OpticalLensFilters.swift  # 탈부착 광학 렌즈 5종
    │   ├── CameraEngine/
    │   │   ├── CameraService.swift           # AVFoundation 캡처 세션
    │   │   ├── SegmentationService.swift     # Apple Vision 온디바이스 인물 누끼 분리
    │   │   └── HapticFeedbackManager.swift   # 하드웨어 기계식 햅틱 진동 피드백
    │   ├── ViewModels/
    │   │   └── CameraViewModel.swift         # 리액티브 UI 상태 & 비즈니스 로직
    │   └── Views/
    │       ├── MainView.swift                # 메인 뷰 컨테이너
    │       ├── Viewfinder/
    │       │   ├── ViewfinderView.swift      # 3:4 픽셀 퍼펙트 뷰파인더
    │       │   └── ViewfinderOSDOverlay.swift# 기종별 레트로 OSD 오버레이
    │       ├── Controls/
    │       │   ├── TopToolbarView.swift      # 상단 플래시/타이머/렌즈/그리드
    │       │   ├── CameraRackDialView.swift  # 6대 카메라 기종 전환 다이얼
    │       │   ├── ModularFilterTrayView.swift# 모듈형 필터 트레이 & 강도 슬라이더
    │       │   ├── ColorStudioPaletteView.swift# 시현하다 실시간 컬러 스와치
    │       │   └── ShutterBarView.swift      # 기계식 셔터 & 썸네일
    │       └── Modals/
    │           ├── OpticalLensPickerModal.swift# 광학 렌즈 탈부착 시트
    │           ├── PassportPrintSheetModal.swift# 여권 4x6 8분할 인쇄 시트
    │           └── CapturedPhotoPreviewModal.swift# 고해상도 사진 프리뷰 & 공유
    └── iCamTestRunner/
        └── main.swift                        # 45개 전수 테스트 자동 검증기
```

---

## 🧪 테스트 & CI/CD 자동화

### 1. 네이티브 iOS 코어 & 모듈형 필터 전수 테스트
```bash
swift run iCamTestRunner
```
- 모든 6대 기종의 필터 팩 등록 여부 전수 검사
- 5종 광학 렌즈 필터 등록 및 체이닝 파이프라인 검증
- Apple Vision 기반 실시간 배경 치환 합성 무결성 검증
- 외부 플러그인 필터 동적 주입(OCP 확장성) 검증
- **총 45개 테스트 100% 통과 (Passed: 45, Failed: 0)**

### 2. 로컬 CI/CD 파이프라인 원클릭 검증
```bash
./scripts/ci-cd-local.sh
```
- 웹 프로토타입 DOM & 반응형 무결성 테스트
- 네이티브 Swift 모듈형 필터 테스트 자동 실행
- 로컬 웹 서버 구동 상태 확인
- Git 릴리즈 커밋 상태 검증

---

## 🌐 인터랙티브 웹 프로토타입 실행
```bash
python3 -m http.server 8080
```
브라우저에서 `http://localhost:8080` 접속하여 인터랙티브 프로토타입 조작 가능.
