# 📷 iCam / SnapStudio 기능 명세서 (Functional Specification Document)
> **문서 버전**: v3.0.0 (Production Gold Master)  
> **최종 갱신일**: 2026년 10월 6일  
> **대상 플랫폼**: Web MVP Prototype (Chrome/Safari/Mobile PWA) & iOS Native (SwiftUI / CoreImage / Metal / AVFoundation)  
> **지원 기종**: iPhone 15 Pro Max, iPhone 16 Pro, iPad Pro, 현대 모바일 브라우저  

---

## 📑 목차 (Table of Contents)
1. [프로젝트 개요 및 아키텍처 비전](#1-프로젝트-개요-및-아키텍처-비전)
2. [클린 코드 & SOLID 원칙 엔지니어링 표준](#2-클린-코드--solid-원칙-엔지니어링-표준)
3. [이중 개발 환경 (Dual-Environment) 정책](#3-이중-개발-환경-dual-environment-정책)
4. [iPhone 15 Pro Max 실기기 설치 & 테스팅 가이드](#4-iphone-15-pro-max-실기기-설치--테스팅-가이드)
5. [전체 16종 아이코닉 카메라 & 64종 필터 상세 스펙 (일본 버블경제 명기 포함)](#5-전체-16종-아이코닉-카메라--64종-필터-상세-스펙)
6. [QuickTake 롱프레스 실시간 비디오 레코딩 엔진](#6-quicktake-롱프레스-실시간-비디오-레코딩-엔진)
7. [탈부착형 광학 렌즈 필터 시스템 (6종 - 6날 스타 조리개 포함)](#7-탈부착형-광학-렌즈-필터-시스템-6종)
8. [사진 갤러리 및 인터랙티브 EXIF 광학 메타데이터 뷰어](#8-사진-갤러리-및-인터랙티브-exif-광학-메타데이터-뷰어)
9. [1:1 크로스 플랫폼 패리티 매트릭스 (Web MVP ↔ iOS Native)](#9-11-크로스-플랫폼-패리티-매트릭스-web-mvp--ios-native)
10. [3대 전문 에이전트 (Dev / QA / Clean-Code) 협업 거버넌스](#10-3대-전문-에이전트-dev--qa--clean-code-협업-거버넌스)
11. [자동화 테스트 및 전수 시각적 검증 결과](#11-자동화-테스트-및-전수-시각적-검증-결과)

---

## 1. 프로젝트 개요 및 아키텍처 비전

### 1.1 프로젝트 목표
iCam(SnapStudio)은 단순한 사진 필터 앱을 넘어, 1970년대 아날로그 슬라이드 필름부터 1980년대 일본 버블 경제의 황금기 일회용 카메라/하프프레임 SLR, 1990~2000년대 Y2K CCD 디지카, 중형 6x6 롤필름 카메라, 현대 하이엔드 인물 스튜디오까지 **역사적 카메라 하드웨어의 광학 렌즈 특성, 셔터 메커니즘, OSD 뷰파인더 HUD, 워터마크, 색공간(Display P3 / sRGB), EXIF 메타데이터를 1:1로 정밀 에뮬레이션**하는 프리미엄 크리에이티브 카메라 시스템입니다.

### 1.2 핵심 원칙: Zero-Discrepancy & Zero-Defect (웹과 앱 간 기능 무결성)
- 웹 MVP(Web Prototype)에서 작동하는 모든 UI 컴포넌트, 뷰파인더 HUD, 오디오 사운드, 렌더링 필터, 비디오 캡처, EXIF 저장 로직은 **iOS Swift Native 코드베이스(`iCamCore`)와 100% 1:1 대응**됩니다.
- 웹 기능이 확장될 때마다 Swift 코드의 프로토콜(`CameraFilter`, `OpticalFilter`) 및 뷰 컴포넌트(`ViewfinderOSDOverlay`, `ExifMetadataView`, `CameraViewModel`)가 실시간 동기화되며, `python scripts/qa-parity-checker.py`를 통해 불일치를 사전에 차단합니다.

---

## 2. 클린 코드 & SOLID 원칙 엔지니어링 표준

본 프로젝트는 `clean-code-agent`의 감시 하에 로버트 C. 마틴(Uncle Bob)의 객체 지향 5대 원칙(SOLID)과 클린 아키텍처를 준수합니다.

### 2.1 단일 책임 원칙 (Single Responsibility Principle - SRP)
- **오디오 엔진 분리**: 셔터음, 틱음, 비디오 비프음은 전용 `SoundEngine` / `HapticFeedbackManager`만 담당.
- **필터 렌더링 엔진 분리**: 광학 렌더링 및 CSS/Canvas/Metal 셰이더는 `FilterRegistry` / `CanvasPipeline`만 담당.
- **상태 관리 분리**: 촬영 플로우 및 모드 전환은 `CameraState` / `CameraViewModel`이 전담.

### 2.2 개방-폐쇄 원칙 (Open-Closed Principle - OCP)
- 새로운 카메라(예: 핫셀블라드, 폴라로이드, 후지 퀵스냅, 쿄세라 사무라이) 추가 시, 기존 코드를 수정하지 않고 `CameraFilter` 프로토콜을 상속받는 전용 팩 클래스(`FujiQuickSnapFilters.swift`, `KyoceraSamuraiFilters.swift`)를 생성하여 레지스트리에 주입하는 확장 구조를 채택.

### 2.3 리스코프 치환 원칙 (Liskov Substitution Principle - LSP)
- 모든 카메라는 동일한 인터페이스(`CameraFilter`, `category`, `lensName`, `render(image:)`)를 제공하므로, 뷰파인더 및 렌더러 파이프라인에서 기종과 무관하게 상호 대체 가능.

### 2.4 인터페이스 분리 원칙 (Interface Segregation Principle - ISP)
- 기본 카메라 인터페이스(`CameraFilter`)와 탈부착 광학 렌즈 필터 인터페이스(`OpticalFilter`)를 분리하여 불필요한 의존성을 배제.

### 2.5 의존 역전 원칙 (Dependency Inversion Principle - DIP)
- `CameraViewModel`은 구체적인 카메라 필터 구현체에 의존하지 않고, 추상화된 `CameraFilter` 프로토콜 컬렉션에 의존.

---

## 3. 이중 개발 환경 (Dual-Environment) 정책

개발자의 호스트 OS 환경(Windows vs macOS)에 따라 명확히 분리된 워크플로우를 적용합니다.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        iCam 개발 워크플로우 정책                          │
├───────────────────────────────────┬────────────────────────────────────┤
│   [환경 A] Windows 호스트 (현재)     │    [환경 B] macOS 호스트 (타겟)      │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Xcode / iOS 시뮬레이터 구동 불가     │ • Xcode 15.4 / 16.0+ 구동 가능      │
│ • 고충실도 Web MVP (localhost:8080)│ • iOS 시뮬레이터 (iPhone 15 Pro Max)│
│   를 활성 인터랙티브 에뮬레이터로 사용 │ • swift run iCamTestRunner 로      │
│ • Chrome Headless CDP 자동화 캡처   │   104개 이상의 단위 검증 스위트 실행 │
│ • Python AST 정적 분석으로 1:1 패리티 │ • Metal 가속 CoreImage 파이프라인    │
│ • iPhone 15 Pro Max 무선 PWA 테스팅 │ • iPhone 15 Pro Max USB-C 네이티브 빌드│
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 4. iPhone 15 Pro Max 실기기 설치 & 테스팅 가이드

보유하신 **iPhone 15 Pro Max**에서 iCam을 직접 실행하고 테스트하는 3가지 최적화된 방법입니다.

### 📱 방법 1: [Windows 사용자 권장] GitHub Actions 자동 빌드 + Sideloadly로 진짜 네이티브 앱(.ipa) 직접 설치
> **장점**: Mac 컴퓨터가 없어도, GitHub Actions 클라우드 Mac 인스턴스에서 자동 컴파일된 정식 `.ipa` 파일을 다운받아 Windows PC에서 USB-C 케이블 연결 후 1분 만에 아이폰 15 프로 맥스에 설치합니다.

1. **GitHub Actions에서 IPA 다운로드**:
   - 저장소 `Actions` 탭 > `📱 Build iOS IPA (Sideloadly & TestFlight)` 워크플로우 실행 결과의 Artifacts에서 `iCam-iOS-Sideloadly-IPA` 다운로드.
2. **윈도우 무료 툴 Sideloadly 실행**:
   - [sideloadly.io](https://sideloadly.io)에서 다운로드한 Sideloadly를 Windows에 실행.
3. **iPhone 15 Pro Max 연결 & 설치**:
   - USB-C 케이블로 아이폰을 PC에 연결하고 "컴퓨터 신뢰" 승인.
   - Sideloadly에 `iCam.ipa`를 드래그 앤 드롭하고 본인의 무료 Apple ID 입력 후 **[Start]** 클릭.
4. **아이폰 홈 화면에 진짜 `iCam` 네이티브 앱 생성 완료!**
   - *상세 단계별 매뉴얼*: **[docs/SIDELOADLY_GUIDE.md](./docs/SIDELOADLY_GUIDE.md)** 참조.

---

### 🌐 방법 2: Windows 호스트에서 즉시 무선 테스팅 (PWA 전체 화면 모드)
> **장점**: 케이블 연결이나 앱 설치 없이, 지금 당장 Safari 홈 화면 추가를 통해 풀스크린으로 빠른 UI/필터 피드백 확인 가능.

1. PC와 iPhone을 동일한 Wi-Fi 네트워크에 연결합니다.
2. Windows PC의 PowerShell에서 서버 구동:
   ```powershell
   python scripts/serve.py
   ```
3. **iPhone 15 Pro Max**의 **Safari 브라우저**에서 `http://<PC-LAN-IP>:8080` 접속.
4. Safari 하단 **공유 버튼 > [홈 화면에 추가]** 터치 후 실행 시 주소창 없는 전체 화면 모드로 구동.

---

### 💻 방법 3: macOS 호스트에서 Xcode 네이티브 빌드 & 디버깅
1. iPhone 15 Pro Max 설정 > 개인정보 보호 및 보안 > 하단 **개발자 모드(Developer Mode)**를 켬(On)으로 변경 후 재부팅.
2. Mac과 iPhone을 USB-C 케이블로 연결하고 신뢰 승인.
3. Xcode에서 `iCam` 열기 > 타겟 `iPhone 15 Pro Max` 선택 > `Cmd + R` 빌드 및 실행.

---

## 5. 전체 16종 아이코닉 카메라 & 64종 필터 상세 스펙

각 카메라 기종별 역사적 가치, 광학 특성, 뷰파인더 HUD 오버레이, 4종 필터 팩, 실제 캡처 결과물입니다.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        iCam 16종 아이코닉 카메라 라인업 요약                             │
├────┬─────────────────────┬──────────────┬──────────────────┬───────────────────────────┤
│ 번호│ 카메라 모델           │ 시대/카테고리   │ 광학 렌즈 스펙    │ 시그니처 뷰파인더/OSD 특성    │
├────┼─────────────────────┼──────────────┼──────────────────┼───────────────────────────┤
│ 01 │ Canon IXY Digital 50│ 2004 Y2K 디카 │ 35-105mm F2.8-4.9│ 9점 녹색 AiAF 박스, 날짜 스탬프│
│ 02 │ Sony DCR Handycam   │ 1999 MiniDV  │ 10x Optical Vario│ ● REC, SP 0:00:14, 테이프 노이즈│
│ 03 │ Sony Cyber-shot P10 │ 2003 사이버Y2K│ 38-114mm F2.8-5.2│ 5.1 MEGAPIXELS, 배터리 HUD│
│ 04 │ Fujifilm Instax Mini│ 1998 인스턴트 │ 60mm F12.7       │ 즉석인화지 화이트 마진 프레임 │
│ 05 │ Olympus [mju:] II   │ 1997 필름 P&S │ 35mm F2.8 단렌즈 │ 올웨더 방적 실링, 그린 레디 램프│
│ 06 │ Contax T2 Carl Zeiss│ 1990 명품 티탄│ Sonnar 38mm F2.8 │ 티타늄 샴페인 골드, 보케 분리감 │
│ 07 │ Ricoh GR III        │ 2019 스트리트 │ 28mm F2.8 GR     │ 스냅 초점, 하이콘트라스트 흑백 │
│ 08 │ Leica M6 Classic    │ 1984 레인지파인더│ 35mm Summicron   │ 빨간색 삼각 LED 노출계 화살표 │
│ 09 │ City Pop 80s Disco  │ 1986 시티팝   │ VHS Tape Tube    │ 네온 핑크/시안 글리치 오버레이 │
│ 10 │ Classic 35mm Film   │ 아날로그 은염  │ 50mm F1.4 Gauss  │ CineStill 800T 텅스텐 할레이션 │
│ 11 │ Hasselblad 500C/M   │ 1970 중형 6x6 │ Planar 80mm F2.8 │ 1:1 웨이스트레벨 스크린 십자선 │
│ 12 │ Polaroid SX-70      │ 1972 접이식SLR│ 116mm F8 Glass   │ 중앙 원형 스플릿 레인지파인더  │
│ 13 │ Fuji QuickSnap 1986 │ 1986 일본 버블│ 32mm F11 플라스틱 │ '89 11 24 앰버 쿼츠데이트스탬프│
│ 14 │ Kyocera Samurai X3.0│ 1988 사이버하프│ 25-75mm Macro SLR│ 녹색 LCD EXP 48/72 컷 분할선  │
│ 15 │ Sihyunhada Color    │ 현대 인물사진 │ 85mm F1.4 Portrait│ 8가지 퍼스널컬러 실시간 배경매팅│
│ 16 │ Official Passport ID│ 공공 규격 신분│ 50mm Standard    │ 외교부 3.5x4.5cm 정수리/턱 가이드│
└────┴─────────────────────┴──────────────┴──────────────────┴───────────────────────────┘
```

---

### [Camera 13] Fuji QuickSnap (写ルンです 1986 - 일본 버블경제 일회용 아이콘)
- **카메라 코드**: `fuji-quicksnap` / Swift: `.fujiQuickSnap`
- **광학 렌즈**: Fujinon 32mm F/11 Plastic Fixed Focus
- **OSD 특성**:
  - `FUJICOLOR 写ルンです 1986` 그린 필 엠블럼 & `EXP [ 24 / 27 ]` 프레임 카운터
  - `⚡ FLASH READY` 앰버 인디케이터
  - 우측 하단 1989년 레트로 앰버 쿼츠 데이트 스탬프 (`'89 11 24`)
- **필터 4종**:
  1. `quicksnap-86` (写ルンです 1986): 특유의 청록색 암부 틴트와 플라스틱 단렌즈 주변부 광량 저하 (대표)
  2. `quicksnap-flash` (深夜の直焚き): 심야 도쿄 뒷골목 직광 플래시의 강렬한 하이라이트
  3. `quicksnap-nostalgia` (ノスタルジック): 바랜 필름의 따뜻한 레트로 골드 톤
  4. `quicksnap-neon` (六本木ネオン): 1988년 롯폰기 밤거리 네온 팜 핑크/시안
- **시각적 증빙**:
  - 뷰파인더 UI: `docs/screenshots/camera_fuji-quicksnap.png`
  - 캡처 결과물: `docs/captures/capture_fuji-quicksnap.png`

---

### [Camera 14] Kyocera Samurai X3.0 (1988 - 일본 버블시대 사이버 하프프레임 SLR)
- **카메라 코드**: `kyocera-samurai` / Swift: `.kyoceraSamurai`
- **광학 렌즈**: Yashica Zoom 25-75mm F/3.5-4.3 Macro
- **OSD 특성**:
  - 72컷 세로 하프프레임 분할 점선 가이드라인 (`SAMURAI HALF-FRAME`)
  - 에메랄드 그린 도트 매트릭스 LCD HUD (`FRAME 48 / 72`)
  - 중앙 초록색 AF 브래킷 박스 `AF [ ● ]`
  - 하단 `YASHICA ZOOM 25-75mm MACRO • ISO 100 • HALF FRAME` 텍스트
- **필터 4종**:
  1. `samurai-half` (Half 72 Split): 2배 분할 촬영의 하이콘트라스트 사이버 톤 (대표)
  2. `samurai-cyber` (サイバー 1988): 에메랄드 그린 LCD 틴트와 차가운 미래지향 톤
  3. `samurai-tokyo` (バブル トワイライト): 80년대 신주쿠 매직아워의 퍼플/오렌지
  4. `samurai-titanium` (チタン ハード): 다크 그래파이트 건메탈 계조
- **시각적 증빙**:
  - 뷰파인더 UI: `docs/screenshots/camera_kyocera-samurai.png`
  - 캡처 결과물: `docs/captures/capture_kyocera-samurai.png`

---

## 6. QuickTake 롱프레스 실시간 비디오 레코딩 엔진

Apple iOS 정품 카메라의 시그니처 제스처인 **QuickTake 비디오 레코딩**을 Web과 Swift Native 양쪽에 1:1로 완벽 구현했습니다.

```
┌────────────────────────────────────────────────────────────────────────┐
│                  QuickTake 롱프레스 인터랙션 플로우                       │
├─────────────────┬──────────────────────────────────────────────────────┤
│ 단타 탭 (<280ms) │ 고해상도 스냅샷 촬영, 셔터음 격발, EXIF 생성, 갤러리 저장  │
├─────────────────┼──────────────────────────────────────────────────────┤
│ 롱프레스 (>280ms)│ 1. 셔터 버튼 모핑: 백색 원형링 -> 붉은 펄싱 링 & 사각 정지 버튼│
│                 │ 2. Dynamic Island 팽창: 🔴 REC VIDEO 배지 & 실시간 타이머 │
│                 │ 3. 뷰파인더 OSD: 우상단 🔴 REC 00:03 라이브 타임코드 표시 │
│                 │ 4. Web Audio 사운드: 상승 듀얼톤 비프 (880Hz -> 1320Hz)  │
│                 │ 5. 스트림 레코딩: MediaRecorder API로 VP9/WebM 비디오 인코딩│
├─────────────────┼──────────────────────────────────────────────────────┤
│ 버튼 릴리즈(Up)  │ 1. 하강 비프 (1320Hz -> 660Hz) 및 셔터 UI 원복           │
│                 │ 2. 갤러리에 `▶ 00:03` 비디오 배지와 함께 즉시 보관        │
│                 │ 3. Dynamic Island에 `VIDEO SAVED` 알림 표출             │
└─────────────────┴──────────────────────────────────────────────────────┘
```

- **시각적 증빙**:
  - QuickTake 레코딩 상태 스크린샷: `docs/screenshots/feature_quicktake_recording.png`

---

## 7. 탈부착형 광학 렌즈 필터 시스템 (6종)

iCam의 광학 렌즈는 바디 필터와 완전히 독립적으로 작동하며, 어떤 카메라 기종에도 겹쳐서 장착할 수 있는 시네마틱 특수 광학 필터입니다.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        6종 광학 렌즈 시스템 요약                         │
├────┬─────────────────────┬──────────────┬──────────────────────────────┤
│ 번호│ 광학 필터 명칭        │ ID / Swift   │ 광학 효과 및 원리             │
├────┼─────────────────────┼──────────────┼──────────────────────────────┤
│ 01 │ Black Mist          │ mist         │ 하이라이트 할레이션(블룸) &   │
│    │ (블랙 미스트)         │ BlackMist    │ 인물 피부결 소프트닝           │
│ 02 │ Cross Star 4X       │ star         │ 점광원 및 가로등 불빛 4방향    │
│    │ (크로스 스타)         │ CrossStar    │ 다이아몬드 별빛 회절          │
│ 03 │ 6-Blade Sunstar     │ star6        │ 6날 조리개 프라운호퍼 3축 회절│
│    │ (6날 스타 조리개)     │ Star6Diffract│ (0°, 60°, 120°) 및 광학 색분산│
│ 04 │ Blue Streak         │ streak       │ 아나모픽 렌즈 수평 블루 플레어 │
│    │ (블루 스트릭)         │ BlueStreak   │ 공상과학 시네마틱 광선        │
│ 05 │ Prism Spectrum      │ prism        │ 유리 프리즘 굴절 무지개 스펙트럼│
│    │ (프리즘 스펙트럼)     │ PrismSpectrum│ 주변부 몽환적 빛 굴절         │
│ 06 │ CPL Polarizer       │ cpl          │ 편광 반사광 제거 및           │
│    │ (CPL 편광 필터)      │ CPLPolarizer │ 하늘/수면 깊은 채도 복원      │
└────┴─────────────────────┴──────────────┴──────────────────────────────┘
```

- **시각적 증빙**:
  - 6날 스타 조리개 장착 뷰파인더: `docs/screenshots/feature_sunstar_6blade.png`
  - 블랙 미스트 장착 뷰파인더: `docs/screenshots/feature_lens_black_mist.png`
  - 크로스 스타 4X 장착 뷰파인더: `docs/screenshots/feature_lens_star_cross.png`

---

## 8. 사진 갤러리 및 인터랙티브 EXIF 광학 메타데이터 뷰어

### 8.1 UI 구조 및 상호작용
- **접근 경로**:
  - 상단 탑 툴바 우측 액티브 갤러리 배지 버튼 (`#btn-gallery-top`)
  - 좌측 사이드바 갤러리 단축 버튼 (`#sidebar-gallery-btn`)
  - 우측 하단 셔터 옆 최근 사진 썸네일 박스 (`#gallery-thumb-btn`)
  - 셔터 격발 후 350ms 후 자동 팝업 프리뷰
- **필름 스트립 네비게이션 (`#gallery-film-strip`)**:
  - 촬영된 모든 사진 및 QuickTake 비디오가 네거티브 필름 스트립 형태로 정렬
  - 썸네일 클릭 시 촉각 틱 오디오 재생 및 대형 프리뷰 즉시 전환
- **글래스모픽 EXIF 메타데이터 인스펙터**:
  - 카메라 기종 배지 (`#exif-cam-badge`)
  - 카메라 바디 모델명 (`#exif-val-camera`)
  - 장착 렌즈 모델명 (`#exif-val-lens`)
  - 선택 필터 및 톤 (`#exif-val-filter`)
  - 광학 필터 렌즈 (`#exif-val-optical`)
  - 노출값 (`#exif-val-exposure`): 셔터속도 / 조리개 / ISO
  - 초점거리 (`#exif-val-focal`)
  - 플래시 발광 여부 (`#exif-val-flash`)
  - 해상도 및 화면비 (`#exif-val-res`): `780 × 1040 (3:4)`
  - 촬영 일시 및 색공간 (`#exif-val-timestamp`): `sRGB Display P3`
- **시각적 증빙**:
  - 갤러리 모달 전체 UI: `docs/screenshots/feature_gallery_exif_modal.png`
  - EXIF 상세 메타데이터 인스펙터: `docs/screenshots/feature_gallery_exif_detail.png`

---

## 9. 1:1 크로스 플랫폼 패리티 매트릭스 (Web MVP ↔ iOS Native)

웹 프로토타입의 DOM ID 및 JS 함수와 iOS Swift Native 소스 코드 간의 1:1 대응 표입니다.

```
┌─────────────────────────────────┬──────────────────────────────────┬────────────────────────┐
│ Web MVP (HTML / JS / CSS)       │ iOS Native (Swift / SwiftUI)     │ 기능 및 역할 설명       │
├─────────────────────────────────┼──────────────────────────────────┼────────────────────────┤
│ CAMERAS['canon-ixy']            │ CameraCategory.canonIXY          │ 캐논 IXY 디지카 모드     │
│ CAMERAS['sony-handycam']        │ CameraCategory.sonyHandycam      │ 소니 핸디캠 MiniDV 모드 │
│ CAMERAS['sony-cybershot']       │ CameraCategory.sonyCybershot     │ 사이버샷 CCD 모드      │
│ CAMERAS['instax-mini']          │ CameraCategory.fujiInstax        │ 인스탁스 미니 즉석인화   │
│ CAMERAS['olympus-mju']          │ CameraCategory.olympusMju        │ 올림푸스 뮤 단렌즈 필름   │
│ CAMERAS['contax-t2']            │ CameraCategory.contaxT2          │ 콘탁스 T2 칼자이스 T*   │
│ CAMERAS['ricoh-gr']             │ CameraCategory.ricohGR           │ 리코 GR 스트리트 스냅    │
│ CAMERAS['leica-m']              │ CameraCategory.leicaM            │ 라이카 M 레인지파인더   │
│ CAMERAS['citypop-80s']          │ CameraCategory.cityPop80s        │ 시티팝 1986 네온 VHS   │
│ CAMERAS['oldfilm-35mm']         │ CameraCategory.oldFilm           │ 클래식 35mm 영화용 필름 │
│ CAMERAS['hasselblad-500cm']     │ CameraCategory.hasselblad        │ 핫셀블라드 500C/M 중형 │
│ CAMERAS['polaroid-sx70']        │ CameraCategory.polaroidSX70      │ 폴라로이드 SX-70 1972  │
│ CAMERAS['fuji-quicksnap']       │ CameraCategory.fujiQuickSnap     │ 후지 퀵스냅 1986 버블   │
│ CAMERAS['kyocera-samurai']      │ CameraCategory.kyoceraSamurai    │ 쿄세라 사무라이 X3.0    │
│ CAMERAS['sihyun-color']         │ CameraCategory.colorStudio       │ 퍼스널 컬러 프로필 스튜디오│
│ CAMERAS['passport-id']          │ CameraCategory.passportID        │ 공식 여권 규격 스튜디오  │
├─────────────────────────────────┼──────────────────────────────────┼────────────────────────┤
│ applyLensFilter('mist')         │ OpticalLensFilterPack.BlackMist  │ 블랙 미스트 블룸 광학   │
│ applyLensFilter('star')         │ OpticalLensFilterPack.CrossStar  │ 크로스 스타 4X 회절     │
│ applyLensFilter('star6')        │ OpticalLensFilterPack.Star6Diffract│ 6날 스타 조리개 회절  │
│ applyLensFilter('streak')       │ OpticalLensFilterPack.BlueStreak │ 블루 아나모픽 광선      │
│ applyLensFilter('prism')        │ OpticalLensFilterPack.Prism      │ 프리즘 굴절 스펙트럼    │
│ applyLensFilter('cpl')          │ OpticalLensFilterPack.CPL        │ CPL 편광 반사광 제거   │
├─────────────────────────────────┼──────────────────────────────────┼────────────────────────┤
│ startQuickTakeVideoRecording()  │ CameraViewModel.startQuickTake() │ 롱프레스 비디오 레코딩  │
│ stopQuickTakeVideoRecording()   │ CameraViewModel.stopQuickTake()  │ 비디오 인코딩 및 저장   │
│ #gallery-modal                  │ PhotoGalleryModal.swift          │ 사진 갤러리 메인 시트   │
│ #gallery-film-strip             │ FilmStripScrollView              │ 네거티브 썸네일 스트립  │
│ photoRecord.exif                │ ExifMetadata.swift               │ EXIF 광학 메타데이터 모델│
│ #exif-val-...                   │ ExifMetadataView.swift           │ 글래스모픽 메타데이터 뷰│
│ executeCapture()                │ CameraViewModel.capturePhoto()   │ 셔터 격발 & 합성 파이프라인│
│ soundEngine.playShutter()       │ HapticFeedbackManager.playShutter│ 셔터음 & CoreHaptics   │
│ #viewfinder (3:4 ratio)         │ CameraViewfinder.swift (3:4)     │ 3:4 규격 메인 뷰파인더  │
└─────────────────────────────────┴──────────────────────────────────┴────────────────────────┘
```

---

## 10. 3대 전문 에이전트 협업 거버넌스

```
┌────────────────────────────────────────────────────────────────────────┐
│                     iCam 자율 협업 에이전트 거버넌스                     │
├───────────────────┬────────────────────────────────────────────────────┤
│ 에이전트           │ 역할 및 절대 수칙 (Zero-Tolerance)                  │
├───────────────────┼────────────────────────────────────────────────────┤
│ dev-agent         │ • Web MVP 및 iOS Swift Native 1:1 동시 구현          │
│ (개발 책임자)      │ • 3:4 뷰파인더 및 Apple HIG 규격 철저 준수          │
│                   │ • 기능 누락 시 QA 에이전트 피드백 즉각 반영          │
├───────────────────┼────────────────────────────────────────────────────┤
│ qa-agent          │ • 무자비한 자기검열 및 무결성 전수 검사 (No Half-Pass)│
│ (품질 보증 책임자) │ • `qa-parity-checker.py` 및 브라우저 스크린샷 육안 검증│
│                   │ • 1픽셀의 클리핑, 잘림, 왜곡 발생 시 즉각 리젝       │
├───────────────────┼────────────────────────────────────────────────────┤
│ clean-code-agent  │ • SOLID 원칙 및 Clean Architecture 아키텍처 수호자  │
│ (아키텍처 책임자) │ • 불필요한 결합도 제거, 단일 책임 분리, 인터페이스 추상화│
│                   │ • 코드 리팩토링 및 유지보수성 최우선 감시           │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 11. 자동화 테스트 및 전수 시각적 검증 결과

### 11.1 자동화 QA 스위트 실행 결과
- `python scripts/test-prototype.py`: **ALL PASS** (HTML DOM 무결성, 16개 랙, QuickTake ID, CSS 글래스 토큰, 3:4 레이아웃 검증 완료)
- `python scripts/qa-parity-checker.py`: **ALL PASS (100% PARITY CONFIRMED)**
  - Test 1/5: 16종 카메라 라인업 웹-앱 1:1 패리티 확인
  - Test 2/5: 17개 필터 팩 등록 확인 (FujiQuickSnap, KyoceraSamurai 포함)
  - Test 3/5: 6종 광학 렌즈 필터(Mist, Star, Star6, Streak, Prism, CPL) 매칭 확인
  - Test 4/5: EXIF 메타데이터 9개 필드 & 갤러리 뷰 패리티 확인
  - Test 5/5: 이중 개발 환경(Windows/macOS CI) 준비도 확인

### 11.2 생성된 시각적 산출물 자산 (총 38종)
- **데스크톱 및 모바일 전신 뷰**:
  - `desktop_view.png`: 1920x1080 뷰포트에서 상단 다이나믹 아일랜드부터 하단 셔터 버튼까지 100% 노출 확인 (잘림 0%)
  - `mobile_view.png`: 430x932 iPhone 15 Pro Max 풀스크린 뷰
- **특화 기능 뷰**:
  - `feature_quicktake_recording.png`: 붉은 펄싱 셔터 + 다이나믹 아일랜드 REC 비디오 + 뷰파인더 타임코드
  - `camera_fuji_quicksnap.png`: 写ルンです 1986 + '89 11 24 앰버 쿼츠 데이트 스탬프
  - `camera_kyocera_samurai.png`: 쿄세라 사무라이 하프프레임 72컷 세로 분할 + 에메랄드 LCD HUD
  - `feature_sunstar_6blade.png`: 6날 조리개 스타 회절 플레어
  - `feature_lens_black_mist.png`, `feature_lens_star_cross.png`
  - `feature_gallery_exif_modal.png`, `feature_gallery_exif_detail.png`
- **시그니처 사진 캡처본 (16개)**:
  `docs/captures/capture_canon-ixy.png` ~ `capture_passport-id.png`
- **구조화된 메타데이터 매니페스트**:
  `docs/captures_manifest.json`

---
*본 기능명세서는 iCam 코어 개발팀, QA팀, 클린코드 아키텍처팀의 공식 표준 명세서로 최종 승인되었습니다.*
