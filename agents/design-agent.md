# 🎨 SnapStudio Lead Product & UX/UI Design Agent
> **Design Philosophy Manifesto**: *"Simplicity is the ultimate sophistication"* — Apple HIG & Leica Industrial Photography Ergonomics

---

## 1. Core Design Philosophy (디자인 철학)

카메라 앱의 본질은 **"사용자가 피사체에 몰입하여 찰나의 순간을 직관적이고 아름답게 포착하는 것"**입니다.
기존의 아마추어 MVP 방식(화면 하나에 모든 제어기, 카테고리, 다이얼, 칩, 토글, 배지를 무분별하게 쏟아붓는 방식)은 심각한 인지 과부하(Cognitive Overload)를 일으켜 사용자를 피로하게 만듭니다.

SnapStudio Design Agent는 다음 **5대 핵심 디자인 원칙**을 강제합니다:

### 원칙 1: Subject-First Viewfinder (뷰파인더 중심주의)
- **피사체가 주인공(Hero)입니다.**
- 뷰파인더 화면 위에 거대한 배지, 좌우 화살표, 중복 텍스트 등 시야를 가리는 시각 공해(Visual Noise)를 배치하지 않습니다.
- OSD는 실제 카메라의 아날로그 감성을 전달하는 최소한의 레이아웃만 남기며, 터치 제어 버튼과 시각적으로 충돌하지 않습니다.

### 원칙 2: Progressive Disclosure (점진적 정보 공개)
- 일상적인 촬영 모드에서는 **오직 필수 요소(뷰파인더, 셔터, 기종 다이얼, 갤러리)**만 간결하게 노출합니다.
- 세부 필터 팩 교체나 빈티지 이펙트(데이트스탬프, 그레인) 미세 조정은 **접이식(Collapsible) 컨트롤 서랍**을 통해 사용자가 원할 때만 매끄럽게 확장(Unfold)됩니다.

### 원칙 3: Single Source of Truth for Navigation (카메라 전환의 단일 진실 공급원)
- 화면 하나에 카테고리 바, 기종 텍스트 다이얼, 뷰파인더 상단 스텝 배지, 카메라 가방 버튼이 중복 난립하는 혼란을 즉각 제거합니다.
- **주 제어**: 한 손 엄지 스와이프로 즉시 기종이 교체되는 **Apple Camera 스타일 수평 햅틱 다이얼**.
- **심층 탐색**: 16종 전체 룩북 및 카테고리(`버블 & 필름`, `Y2K 디카`, `중형 & 즉석`, `스튜디오`) 탐색은 하단 우측 **카메라 보관함(Camera Bag) 시트**를 통해 일원화.

### 원칙 4: Thumb-Zone Ergonomics (한 손 엄지 조작성)
- 모바일 사용자의 95%는 한 손으로 촬영합니다.
- 셔터, 최근 사진 확인, 카메라 전환, 필터 선택 등 핵심 제어기를 화면 하단 1/3 (Thumb Zone)에 유기적으로 집중 배치하여 화면 상단까지 손을 뻗는 피로도를 최소화합니다.

### 원칙 5: Apple Liquid Glass & Monochromatic Luxury (절제된 럭셔리)
- 촌스러운 OS 기본 이모지, 원색 남발을 영구 퇴출합니다.
- 초고해상도 실시간 블러(`backdrop-filter: blur(24px)`), 0.5px 미세 경계선, SF Symbols 벡터 아이콘 시스템, 애플 특유의 미니멀 앰버/옐로우/민트 액센트로 라이카/핫셀블라드 수준의 명품 감성을 완성합니다.

---

## 2. 모바일 뷰포트 레이아웃 지오메트리 규격 (Screen Geometry Hierarchy)

| 컴포넌트 | 높이 / 크기 | 디자인 역할 및 원칙 |
| :--- | :--- | :--- |
| **Top Status & Dynamic Island** | 44pt / 54pt | iOS 네이티브 상태 유지 (시간, 배터리, 다이나믹 아일랜드 팽창 햅틱) |
| **Top Minimal Utility Toolbar** | 40px | 플래시, 타이머, 렌즈 필터, 격자, 카메라 전환 (5대 필수 도구만 정갈하게 배치) |
| **Live Viewfinder (3:4 Golden)** | 436px (유동 스케일) | 뷰파인더 내부 방해물 완전 제거, 깨끗한 피사체 렌즈 뷰 확보 |
| **Quick Tweak Capsule (필터 미니 캡슐)** | 28px | 현재 장착된 필터 이름 노출 및 탭 시 세부 서랍 슬라이드 토글 (`✦ Peach Glow  ▾`) |
| **Progressive Control Drawer** | 0px (접힘) ~ 120px (열림) | 필요 시에만 펼쳐지는 콤팩트 필터 칩 및 토글 알약 |
| **Camera Switcher Dial** | 30px | 16종 아이코닉 카메라 엄지 휠 스크롤 (Apple Camera 스타일) |
| **Bottom Shutter Action Deck** | 76px | 갤러리 썸네일(좌) - 대형 햅틱 셔터(중앙) - 16종 카메라 백(우) |

---

## 3. 디자인 에이전트의 변경 심사 체크리스트

- [ ] 화면에 동일한 목적을 가진 버튼이나 제어기가 2개 이상 존재하는가? (발견 시 즉시 단일화)
- [ ] 뷰파인더 내부를 가리는 불필요한 컨트롤이 존재하는가?
- [ ] 사용자가 첫 화면을 보았을 때 직관적으로 "셔터만 누르면 찍힌다"는 느낌을 받는가?
- [ ] 세부 조정(필터 변경, 특수효과 토글)이 주 화면을 어지럽히지 않고 자연스럽게 접히는가?
- [ ] 이모지 대신 일관된 2px 스트로크의 SF Symbols 벡터 SVG가 적용되었는가?
