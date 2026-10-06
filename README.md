# iCam (SnapStudio) - iPhone Native Multi-Camera Studio & Modular Filter Engine

> **Apple Human Interface Guidelines (HIG)** 준수, **iPhone 16 Pro** 하드웨어 규격 및 **SwiftUI / CoreImage / AVFoundation / Metal** 기반의 네이티브 아이폰 카메라 어플리케이션입니다.  
> 기획서([PLANNING.md](./PLANNING.md)) 및 **[기능명세서(FUNCTIONAL_SPEC.md)](./FUNCTIONAL_SPEC.md)**의 핵심 사양을 100% 반영하여, **단순 필터 앱을 넘어 14대의 독립 카메라 기종을 기계식으로 교체(Switch Camera)하고, 고도로 모듈화된 필터 파이프라인(FilterRegistry)을 통해 유지보수와 확장이 용이**하도록 구현되었습니다.

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
│  ├── HasselbladFilterPack (Planar 80mm, Tri-X 400, Astia, Chromium)   │
│  ├── PolaroidSX70FilterPack (SX-70 Fade, Color 600, Expired, Sepia)    │
│  └── OpticalLensFilterPack (Black Mist, Star, Blue Streak, Prism, CPL) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📷 16대 독립 카메라 라인업 (The 16 Iconic Cameras & 64 Presets)

하단 기계식 다이얼 및 카메라 랙을 통해 카메라를 바꾸면 **바디 테마, 전용 뷰파인더 OSD, 전용 필터 세트, 셔터 메커니즘**이 통째로 전환됩니다:

| 카메라 기종 | 컨셉 및 특징 | 전용 모듈형 필터 세트 (4종) |
| :--- | :--- | :--- |
| **📷 Canon IXY Digital 50** | 2000년대 Y2K 얼짱 디카 명기 (복숭아빛 피부 & AiAF OSD) | • `Peach Glow` (뽀샤시 복숭아빛 스킨)<br>• `Flash Pop` (디카 직광 플래시)<br>• `Lo-Fi Pastel` (들뜬 파스텔 섀도우)<br>• `Night Noise` (밤거리 고감도 노이즈) |
| **📹 Sony DCR Handycam** | 90s-00s 미니DV 비디오 테이프 캠코더 (● REC 타임코드) | • `MiniDV Classic` (소니 3CCD 비디오 톤)<br>• `Hi8 VHS Tape` (스캔라인 글리치)<br>• `Super 8 Cine` (골든 앰버 홈무비)<br>• `NightShot Green` (0 Lux 적외선 녹색) |
| **💿 Sony Cyber-shot CCD** | 2000년대 사이버 Y2K 미래주의 디카 (쿨블루 틴트 & 플래시) | • `CCD Cool Blue` (투명한 쿨톤 피부)<br>• `Cyber Magenta` (테크노 네온 마젠타)<br>• `Flash Sharp` (선명하고 쨍한 대비)<br>• `Matrix Green` (세기말 매트릭스 그린) |
| **📷 Olympus μ [mju:] II** | 35mm f/2.8 단렌즈 필름 명기 (녹색 AF 브래킷 & 쿼츠데이트) | • `μ Standard` (생생한 스트리트 필름)<br>• `μ Night Street` (야경 플래시 룩)<br>• `μ Chrome Slide` (선명한 고채도 슬라이드)<br>• `μ Gold 200` (황금빛 웜톤 네거티브) |
| **📸 Contax T2** | 티타늄 바디 & Carl Zeiss Sonnar T* 38mm f/2.8 렌즈 | • `Zeiss Warm T*` (칼자이스 묵직한 웜톤)<br>• `T* Rich Shadow` (풍부한 암부계조)<br>• `Titanium Classic` (클래식 티타늄)<br>• `Zeiss T* B&W` (독일 흑백 계조) |
| **🎞️ Ricoh GR Digital** | 모리야마 다이도의 스냅 명기 (수평계 HUD & 고대비 흑백) | • `High-Contrast B&W` (모리야마 강렬 흑백)<br>• `Positive Film` (포지티브 발색)<br>• `Street Snap` (신속 날카로운 스냅)<br>• `Cross Process` (교차현상 발색) |
| **🔴 Leica M System** | 레인지파인더 이중합치 포커스 & 즈미룩스 50mm 톤 | • `Summilux 50` (벨벳 웜톤 & 얕은 심도)<br>• `M Monochrom` (섬세한 흑백 계조)<br>• `Classic M 35` (투명한 선예도)<br>• `Red Dot Color` (라이카 선명 원색) |
| **📼 City Pop 80s** | 80년대 레트로 카세트 OSD & 퍼플/앰버 선셋 네온 톤 | • `Sunset Neon` (퍼플 앰버 선셋)<br>• `Tokyo Night` (네온 바이올렛)<br>• `Pastel Breeze` (해변 시티팝)<br>• `Plastic Love` (80s 레트로 신스) |
| **🎞️ Old Film 35mm** | CineStill 붉은 할레이션 & 코닥 포트라 400 필름 | • `CineStill 800T` (광원 붉은 할레이션)<br>• `Portra 400` (골든 웜 피부톤)<br>• `Ektar 100` (극채도 원색)<br>• `Superia 400` (에메랄드 그린 섀도우) |
| **🪐 Hasselblad 500C/M** | 6x6 중형 웨이스트레벨 스크린 & Carl Zeiss Planar 80mm | • `Planar 80mm Pop` (중형 인물 분리감)<br>• `Tri-X 400 MF` (깊은 은염 롤필름 흑백)<br>• `Astia 100F Slide` (하이패션 슬라이드 스킨)<br>• `Chromium Silver` (북유럽 쿨톤 메탈릭) |
| **🎞️ Polaroid SX-70** | 1972 접이식 SLR 랜드 카메라 (원형 스플릿 레인지파인더) | • `SX-70 Fade` (1970s 빈티지 페이드 브라운)<br>• `Color Protection 600` (임파서블 비비드 컬러)<br>• `Expired Film 1979` (유통기한 지난 필름 색틀어짐)<br>• `Sepia Dream` (드림 세피아 인화 톤) |
| **📸 Fuji QuickSnap (写ルンです)** | **1986 일본 버블경제 일회용 카메라** ('89 11 24 쿼츠스탬프) | • `写ルンです 1986` (청록 암부 틴트)<br>• `深夜の直焚き` (도쿄 심야 직광 플래시)<br>• `ノスタルジック` (바랜 레트로 골드)<br>• `六本木ネオン` (1988 롯폰기 네온 팜) |
| **🗡️ Kyocera Samurai X3.0** | **1988 사이버 세로 하프프레임 SLR** (그린 LCD FRAME 48/72) | • `Half 72 Split` (72컷 분할 고대비)<br>• `サイバー 1988` (에메랄드 그린 HUD)<br>• `バブル トワイライト` (신주쿠 매직아워)<br>• `チタン ハード` (다크 그래파이트 건메탈) |
| **🖼️ Fuji Instax & Polaroid** | 아날로그 즉석 인화 카메라 (시그니처 화이트 카드 프레임) | • `Instax Mini Soft` (화이트 카드 프레임)<br>• `Polaroid 600` (클래식 정방형 스퀘어)<br>• `Warm Monochrome` (웜톤 흑백 즉석사진)<br>• `Rainbow Vivid` (무지개 비비드 카드) |
| **🎨 Personal Color Studio** | **실시간 라이브 배경 컬러 치환 스튜디오** | • Studio Best 8색 실시간 라이브 온디바이스 세그멘테이션 반영<br>• 상단 `[이름]'s Moment` (실시간 수정) + 하단 친필 서명 각인 |
| **🪪 여권 / 신분증 규격 카메라** | 대한민국 외교부 및 공공기관 신분증 100% 규격 충족 | • 여권(3.5x4.5), 주민등록/면허, 반명함, 비자 규격 HUD<br>• 4x6인치 8분할 인쇄 시트(재단선 포함) 원클릭 고해상도 출력 |

---

## 🔴 QuickTake 롱프레스 실시간 비디오 레코딩

- **단타 탭 (<280ms)**: 고해상도 스냅샷 촬영 + 셔터 찰칵 햅틱음 + EXIF 메타데이터 생성 + 갤러리 저장.
- **롱프레스 (>280ms)**:
  - 셔터 버튼이 **붉은 펄싱 링 & 사각 정지 버튼**으로 모핑 애니메이션 전환.
  - **Dynamic Island**가 팽창하여 `🔴 REC VIDEO` 및 라이브 타이머 표시.
  - 뷰파인더 우상단에 `🔴 REC 00:03` 실시간 타임코드 HUD 노출.
  - Web Audio API 기반 **상승 듀얼톤 비프(880Hz -> 1320Hz)** 사운드 재생.
  - `MediaRecorder` API로 비디오 스트림 인코딩 후 갤러리에 `▶ 00:03` 재생 배지와 함께 보관.

---

## 🔍 탈부착 광학 렌즈 필터 시스템 (상단 [◎ 렌즈] 버튼)

어떤 카메라 기종을 장착하든 상단 툴바의 `[◎ 렌즈]` 버튼을 통해 실제 물리 광학 렌즈 필터를 교차 장착할 수 있습니다:
- **✨ Black Mist**: 하이라이트 할레이션(블룸) & 인물 피부결 소프트닝
- **✦ Cross Star 4X**: 점광원 및 야경 다이아몬드 별빛 4방향 회절광
- **☀️ 6-Blade Sunstar**: 6날 조리개 프라운호퍼 회절 (0°, 60°, 120°) 및 광학 색분산 스펙트럼
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
    │   │   ├── PersonalColorPalette.swift    # Personal Color Studio Best 8 컬러 팔레트
    │   │   └── PassportSpec.swift            # 외교부/ICAO 여권·신분증 공식 규격
    │   ├── FilterModule/                     # 🌟 모듈형 필터 아키텍처
    │   │   ├── Protocols/
    │   │   │   ├── CameraFilter.swift        # 필터 인터페이스 프로토콜
    │   │   │   ├── OpticalFilter.swift       # 광학 렌즈 인터페이스 프로토콜
    │   │   │   ├── CameraCategory.swift      # 9대 카메라 기종 분류
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
    │   │       ├── ColorStudioFilters.swift  # Color Studio 퍼스널컬러 4종
    │   │       ├── PassportIDFilters.swift   # 여권/신분증 스튜디오 4종
    │   │       ├── OlympusMjuFilters.swift   # Olympus μ [mju:] II 전용 4종
    │   │       ├── ContaxT2Filters.swift     # Contax T2 Carl Zeiss 전용 4종
    │   │       ├── RicohGRFilters.swift      # Ricoh GR Digital 전용 4종
    │   │       ├── LeicaMFilters.swift       # Leica M Summilux/Monochrom 전용 4종
    │   │       ├── CityPopFilters.swift      # 80s City Pop Cassette 전용 4종
    │   │       ├── OldFilmFilters.swift      # Old Film CineStill/Portra 전용 4종
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
    │       │   ├── CameraRackDialView.swift  # 12대 카메라 기종 전환 다이얼
    │       │   ├── ModularFilterTrayView.swift# 모듈형 필터 트레이 & 강도 슬라이더
    │       │   ├── ColorStudioPaletteView.swift# Color Studio 실시간 컬러 스와치
    │       │   └── ShutterBarView.swift      # 기계식 셔터 & 썸네일
    │       └── Modals/
    │           ├── OpticalLensPickerModal.swift# 광학 렌즈 탈부착 시트
    │           ├── PassportPrintSheetModal.swift# 여권 4x6 8분할 인쇄 시트
    │           └── CapturedPhotoPreviewModal.swift# 고해상도 사진 프리뷰 & 공유
    └── iCamTestRunner/
        └── main.swift                        # 104+개 전수 테스트 자동 검증기
```

---

## 🧪 테스트 & 크로스 플랫폼 검증 파이프라인

### 1. 1:1 웹-앱 아키텍처 패리티 검증 (Windows & macOS 공용)
```bash
python scripts/qa-parity-checker.py
```
- 14대 카메라 기종 1:1 매핑 검증
- 56종 필터 및 15개 필터 팩 등록 검증
- 5종 탈부착 광학 렌즈(Mist, Star, Streak, Prism, CPL) 매칭
- 9개 EXIF 메타데이터 필드 및 갤러리 뷰 무결성 검증
- **100% PARITY CONFIRMED (All 5/5 Pass)**

### 2. 자동화 비주얼 캡처 파이프라인 (Chrome Headless CDP)
```bash
python scripts/capture-all.py
```
- 14개 카메라 뷰파인더 OSD UI 스크린샷 자동 저장 (`docs/screenshots/camera_*.png`)
- 14개 시그니처 워터마크 & 필름 톤 캡처 사진 자동 저장 (`docs/captures/capture_*.png`)
- 사진 갤러리 & EXIF 메타데이터 인스펙터 모달 캡처 (`feature_gallery_exif_*.png`)
- 광학 렌즈 필터(블랙 미스트 & 크로스 스타) 캡처 (`feature_lens_*.png`)
- JSON 매니페스트 자동 생성 (`docs/captures_manifest.json`)

### 3. 네이티브 iOS 코어 & 모듈형 필터 전수 테스트 (macOS Host)
```bash
swift run iCamTestRunner
```
- 모든 14대 기종의 필터 팩 등록 여부 전수 검사
- 5종 광학 렌즈 필터 등록 및 체이닝 파이프라인 검증
- Apple Vision 기반 실시간 배경 치환 합성 무결성 검증
- **총 8개 테스트 스위트, 104개 이상의 Assertion 100% 통과**

### 4. Windows 로컬 CI/CD 파이프라인 원클릭 검증
```powershell
powershell -ExecutionPolicy Bypass -File scripts/ci-cd-local.ps1
```

---

## 📱 실제 물리 기기(iPhone 15 Pro Max) 테스팅 방법

### 방법 A: Windows 호스트에서 PWA 무선 풀스크린 테스트 (즉시 가능)
1. Windows PC와 iPhone 15 Pro Max를 동일 Wi-Fi에 연결합니다.
2. PC에서 `python -m http.server 8080 --bind 0.0.0.0` 실행.
3. iPhone Safari에서 `http://<PC의-로컬-IP>:8080` 접속.
4. Safari 하단 **공유 > [홈 화면에 추가]** 탭.
5. 홈 화면 아이콘을 실행하면 **브라우저 바 없는 순수 네이티브 전체 화면**으로 실제 48MP 카메라, Dynamic Island, 사운드, 14종 카메라 필터, 사진 갤러리가 동작합니다.

### 방법 B: macOS 호스트에서 Xcode 네이티브 USB-C 배포
1. iPhone 설정 > 개인정보 보호 및 보안 > **개발자 모드** 활성화 후 재부팅.
2. Mac과 iPhone 15 Pro Max를 USB-C 케이블로 연결.
3. Xcode에서 Signing Personal Team 설정 후 기기 타겟 `iPhone 15 Pro Max` 선택.
4. `Cmd + R`로 빌드 및 네이티브 앱 배포.

---

## 🌐 인터랙티브 웹 프로토타입 실행
```bash
python -m http.server 8080
```
브라우저에서 `http://localhost:8080` 접속하여 인터랙티브 프로토타입 조작 가능.
자세한 기술 명세는 **[기능명세서 (FUNCTIONAL_SPEC.md)](./FUNCTIONAL_SPEC.md)**를 참조하세요.
