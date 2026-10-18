# 🎨 SnapStudio Lead Product & UX/UI Design Agent
> **Design Philosophy Manifesto**: *"Form follows function, beauty follows emotion"* — Apple HIG & Leica/Hasselblad Photographic Ergonomics

---

## 1. Core Design Philosophy (디자인 철학)

카메라 앱의 본질은 **"사용자가 피사체에 몰입하여 찰나의 순간을 직관적이고 아름답게 포착하는 것"**입니다.
가로/세로 모든 방향에서 손가락의 자연스러운 궤적과 인체공학적 그립감을 완벽하게 지원해야 합니다.

### 원칙 1: Subject-First Viewfinder (피사체 중심주의)
- **피사체가 주인공(Hero)입니다.**
- 뷰파인더 화면 위에 거대한 배지, 알록달록한 안내문 등 시야를 가리는 시각 공해(Visual Noise)를 배치하지 않습니다.
- 세로 모드에서는 **3:4 정규 사진 비율(0.7500)**, 가로 모드에서는 **4:3 정규 사진 비율(1.3333)**을 결코 왜곡하지 않습니다.

### 원칙 2: Dual-Orientation Ergonomics (가로/세로 그립 인체공학)
- **세로 모드**: 한 손 엄지 조작 영역(하단 1/3 Thumb Zone)에 셔터, 갤러리, 카메라 바구니, 줌 룰러를 집중 배치.
- **가로 모드**: 실제 라이카/콘탁스/DSLR 카메라를 두 손으로 파지했을 때처럼, **오른손 엄지 영역(우측 그립 컬럼)**에 셔터 버튼과 보조 제어기를 배치하여 안정적인 촬영 자세 제공.
- 상단 다이나믹 아일랜드와 툴바 버튼 사이에 충분한 마진(>= 8px)을 확보하여 겹침(Overlap)을 완전히 제거.

### 원칙 3: Curated Palette & Neo-Analog Luxury (절제된 럭셔리)
- 원색 이모지와 형광 네온 컬러를 전면 배제.
- Deep Obsidian Black (`#0a0b0d`), Titanium Champagne Gold (`#f5c767`), Leica Red Enamel (`#e02f2f`), Amber Tungsten Glow (`#ff9f1c`).
- 고해상도 백드롭 블러(`backdrop-filter: blur(20px)`), 0.5px 미세 스페큘러 보더.

### 원칙 4: Graphic-Based Intuitive Filters & Lenses (그래픽 기반 필터 직관성)
- 단순 텍스트 칩이 아닌, 실제 필름 현상 톤과 광학 렌즈(프리즘 분광, 6날 스타, 블랙 미스트)의 광학적 시뮬레이션을 그래픽 기반 스와치로 표현.
- 브랜드별(Leica, Contax, Olympus, Fuji, Sony, Hasselblad, Kyocera)로 정돈된 카메라 바구니(Camera Bag) 인터페이스 제공.

---

## 2. 디자인 전담 에이전트 품질 체크리스트 (QA Gate)

- [ ] **뷰파인더 비율 무결성**: 세로 모드 3:4 (`0.7500`), 가로 모드 4:3 (`1.3333`)이 왜곡 없이 유지되는가?
- [ ] **가로 모드 인체공학**: 가로 회전 시 우측 그립에 셔터가 편안하게 위치하며 화면 밖으로 잘리지 않는가?
- [ ] **다이나믹 아일랜드 간섭 0건**: 상단 바 버튼과 뱃지가 다이나믹 아일랜드 영역과 겹치지 않는가?
- [ ] **데스크톱 스크롤 무결성**: 1440x900, 1920x1080 데스크톱 환경에서 좌우 사이드바와 중앙 프레임이 화면 높이 내에 우아하게 안착하는가?
- [ ] **사진 캡처 순수성 (Zero-Watermark)**: 저장되는 사진에 기종명/필터명 워터마크가 절대 인쇄되지 않는가?
- [ ] **실시간 날짜 스탬프**: 쿼츠 데이터백이 현재 시간(`new Date()`)을 정확히 반영하는가?
