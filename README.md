# SnapStudio (Multi-Camera Studio) - 인터랙티브 웹 MVP 프로토타입

> **Apple Human Interface Guidelines (HIG)** 준수 및 **iPhone 16 Pro** 하드웨어 프레임 기반의 멀티 카메라 프로토타입 시안입니다.  
> 기획서([PLANNING.md](./PLANNING.md))의 핵심 사양을 100% 반영하여, **단순 필터 앱을 넘어 6대의 독립 카메라 기종을 교체(Switch Camera)하고 실시간으로 배경사진/색상을 라이브 치환**할 수 있습니다.

---

## 📱 핵심 구현 아키텍처: 6 Iconic Cameras & Live Background

### 1. 6대 독립 카메라 기종 (The 6 Iconic Cameras)
하단 다이얼 및 좌측 카메라 랙(Camera Rack)을 통해 카메라를 바꾸면 **바디 디자인, 전용 뷰파인더 OSD, 전용 필터 세트(각 4종), 셔터 메커니즘**이 통째로 전환됩니다.

| 카메라 기종 | 컨셉 및 특징 | 전용 필터 세트 (카메라별 4종 고유) |
| :--- | :--- | :--- |
| **📷 Canon IXY Digital 50** | 2000년대 Y2K 얼짱 디카 명기 (복숭아빛 피부 & AiAF OSD) | • `Peach Glow` (뽀샤시 복숭아빛 스킨)<br>• `Flash Pop` (디카 직광 플래시)<br>• `Pastel Haze` (들뜬 파스텔 섀도우)<br>• `Night Party` (밤거리 고감도 노이즈) |
| **📹 Sony DCR Handycam** | 90s-00s 미니DV 비디오 테이프 캠코더 (● REC 타임코드) | • `MiniDV Classic` (소니 3CCD 비디오 톤)<br>• `Hi8 Tape Glitch` (스캔라인 글리치)<br>• `Super 8mm Cine` (골든 앰버 홈무비)<br>• `NightShot Green` (0 Lux 적외선 녹색) |
| **💿 Sony Cyber-shot CCD** | 2000년대 사이버 Y2K 미래주의 디카 (쿨블루 틴트 & 플래시) | • `CCD Cool Blue` (투명한 쿨톤 피부)<br>• `Cyber Magenta` (테크노 네온 마젠타)<br>• `Flash Sharp` (선명하고 쨍한 대비)<br>• `Matrix Green` (세기말 매트릭스 그린) |
| **🖼️ Fuji Instax & Polaroid** | 아날로그 즉석 인화 카메라 (시그니처 화이트 카드 프레임) | • `Instax Soft` (화이트 카드 프레임)<br>• `Polaroid 600` (클래식 정방형 스퀘어)<br>• `Warm Mono` (웜톤 흑백 즉석사진)<br>• `Rainbow Edge` (무지개 카드 프레임) |
| **🎨 시현하다 Color Studio** | **실시간 라이브 배경 컬러·사진 치환 스튜디오** | • 시현하다 Best 8색 + 📷 배경 사진/텍스처 6종 + 4계절 16색 + 그라디언트 4종 실시간 라이브 반영<br>• 상단 `[이름]'s Moment` (직접 수정 가능) + 하단 친필 서명 각인 |
| **🪪 여권 / 신분증 규격 카메라** | 대한민국 여권 및 공공기관 신분증 100% 규격 충족 | • 여권(3.5x4.5), 주민등록/면허, 반명함, 비자 규격 HUD<br>• 4x6인치 8분할 인쇄 시트(재단선 포함) 원클릭 고해상도 출력 |

---

### 2. 탈부착 광학 렌즈 필터 시스템 (상단 [◎] 버튼)
어떤 카메라 기종을 장착하든 상단 툴바의 `[◎ 렌즈]` 버튼을 통해 실제 광학 렌즈 필터를 교차 장착할 수 있습니다:
- **✨ Black Mist**: 하이라이트 할레이션(블룸) & 인물 피부결 소프트닝
- **✦ Cross Star 4X**: 점광원 및 야경 다이아몬드 별빛 4방향 회절광
- **━ Blue Streak**: 아나모픽 네온 사이언 수평 플레어
- **🌈 Prism Spectrum**: 무지개 색수차 분광 및 림라이트
- **🪞 CPL 편광**: 불필요한 반사광 억제 및 색상 채도·선명도 극대화

---

### 3. 실시간 라이브 배경사진/색 치환 엔진
- 시현하다 카메라 장착 시, 하단 드로어의 스와치를 누르는 순간 **인물 뒤 뷰파인더 배경(`viewfinder-bg`)이 실시간으로 부드러운 애니메이션과 함께 즉각 변경**됩니다.
- 시현하다 Best 8색, 실제 스튜디오 텍스처(유화 캔버스, 노을, 매직 아워 등), 4계절 16색, 커스텀 HEX 피커 지원.

---

### 4. Apple HIG 규격 3:4 픽셀 퍼펙트 레이아웃
- iPhone 16 Pro 내부 높이 844px 기준:
  - Status Bar: `0 ~ 52px`
  - Top Toolbar: `52 ~ 96px`
  - Viewfinder (정확한 3:4 황금비 369 x 492px): `100 ~ 592px`
  - Camera Drawer: `598 ~ 724px`
  - Camera Switcher Dial & Shutter: `728 ~ 832px`
  - Home Indicator: `836 ~ 841px`
  *(1픽셀도 겹치지 않고 오차 없는 완벽한 정렬)*
- **Dynamic Viewport Scaling**: 맥북 13~15인치 뷰포트(높이 800~920px)에서 세로 잘림/스크롤 없이 아이폰 전체가 한눈에 쏙 들어오도록 자동 축소 반응형 적용.

---

## 🚀 로컬 실행 & 자동화 CI/CD

### 1. 로컬 웹 서버 접속
```bash
python3 -m http.server 8080
```
브라우저에서 `http://localhost:8080` 접속.

### 2. 로컬 CI/CD 파이프라인 원클릭 검증
```bash
./scripts/ci-cd-local.sh
```
- Prototype Integrity Test Suite (DOM, CSS, JS 무결성 전수 검사)
- Local HTTP Server 상태 체크
- Git 릴리즈 준비 상태 검증
