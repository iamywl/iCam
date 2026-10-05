# [PRD] SnapStudio (iCam) - Multi-Camera Studio & Modular Filter System
## 올인원 아이폰 멀티 카메라 기종 셀렉터 & 모듈형 감성 필터 시스템 제품 기획서

---

## 1. 프로젝트 개요 (Executive Summary)

### 1.1 서비스 컨셉
- **서비스명**: **SnapStudio** (내부 코드명: `iCam`)
- **슬로건**: *"하나의 아이폰에 담긴 전설적인 카메라와 필름의 황금기"*
- **핵심 가치 제안 (Value Proposition)**:
  1. **실제 카메라 기종 자체를 교체(Switch Camera)**하는 기계식 하드웨어 아키텍처.
  2. 카메라 기종을 교체하면 **카메라 바디 메탈 테마, 뷰파인더 레트로 OSD, 전용 4종 모듈형 필터 팩, 셔터 사운드/햅틱 메커니즘**이 통째로 전환.
  3. **빈티지 광학 컬러 사이언스 완벽 고증**: 2000년대 초기 CCD 디지털 센서부터 80년대 일본 시티팝, 라이카 M 레인지파인더, CineStill 붉은 할레이션 시네마 필름까지 철저한 광학적 모사 구현.
  4. **Personal Color Studio (퍼스널 컬러 프로필 스튜디오)**: Apple Vision 온디바이스 세그멘테이션을 통해 **인물 뒤 배경색이 0.1초 만에 실시간으로 전환되는 다이내믹 라이브 뷰** 및 맞춤 각인 모먼트 프레임 제공.
  5. **Standard ID & Passport Cam (여권/신분증 규격 카메라)**: 외교부·ICAO 규격을 100% 충족하는 HUD 안면 가이드라인과 4x6인치 8분할 인화용 시트 원클릭 출력.
  6. **탈부착 광학 렌즈 필터 시스템**: 블랙 미스트, 크로스 스타 등 전문 렌즈 필터를 12대 모든 카메라 기종에 자유롭게 교차 체이닝.
  7. **모듈형 필터 엔진 (FilterModule / FilterRegistry)**: OCP(Open-Closed Principle)를 준수하여 카메라 뷰나 캡처 파이프라인의 수정 없이 새로운 기종과 필터를 무한히 플러그인(Plug-and-play)할 수 있는 확장형 아키텍처.

---

## 2. 빈티지 카메라 필터 고증 및 광학 모사 분석 보고서 (Optical & Color Science Audit)

기획 및 컬러 사이언스 관점에서 시중의 단순 틴트(단순 색조 입히기) 앱과의 차별화를 위해 다음 3대 광학 영역을 체계적으로 분석하고 모사 파이프라인을 수립했습니다.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Optical & Color Science Architecture                            │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│     디지털 CCD 센서 렌더링    │   할로겐화은 화학 필름 렌더링 │     라이카 광학계 고증 │
├───────────────────────────────┼───────────────────────────────┼────────────────────────┤
│ • 좁은 다이내믹 레인지(DR)    │ • 완만한 S자 톤 커브 (Soft-S) │ • 미세 콘트라스트(Micro)│
│ • 하이라이트 블로우아웃       │ • 붉은 림 할레이션 (CineStill)│ • 3D 팝(3D Pop) 입체감 │
│ • 블루/마젠타 시프트 (Cool CCD)│ • 유기적 불규칙 할라이드 그레인│ • 순수 흑백 계조(Monochrom)│
│ • 디카 직광 플래시 비네팅     │ • 필름실 차광 빛샘(Light Leak)│ • 이중합치 레인지파인더│
└───────────────────────────────┴───────────────────────────────┴────────────────────────┘
```

### 2.1 초기 디지털 CCD 센서 vs 아날로그 유제 필름 고증 비교
1. **2000년대 초기 CCD 센서 (Canon IXY, Sony Cyber-shot)**:
   - **다이내믹 레인지 한계**: 현대 CMOS 센서와 달리 하이라이트가 급격히 클리핑되며 부드러운 롤오프 없이 화이트아웃(Blowout)되는 특성을 재현.
   - **컬러 튜닝**: 실내 플래시 촬영 시 피사체 중심부는 강한 웜/뉴트럴 톤으로 뜨고, 조명이 닿지 않는 주변부는 차가운 암청색(Deep Cyan-Blue)으로 섀도우가 떨어지는 직광 플래시 감성 모사.
   - **노이즈 특성**: 균일한 노이즈가 아닌, 색상 채널별 불규칙한 크로마 노이즈(Chroma Noise)를 합성.

2. **할로겐화은(Silver Halide) 유제 필름 (Kodak Portra, CineStill, Contax T2)**:
   - **톤 커브 (Tone Response Curve)**: 디지털의 선형(Linear) 반응과 달리, 하이라이트와 섀도우가 완만하게 압축되는 완만한 S-커브 곡선 적용.
   - **유기적 필름 그레인**: 디지털 가우시안 노이즈 대신, 유제 입자의 크기와 밀도가 노출도에 따라 달라지는 3차원 유기적 그레인 텍스처 오버레이.
   - **빛샘 (Light Leak)**: 카메라 후면 차광 스펀지(Mousse) 노화로 필름 가장자리로 스며드는 따뜻한 주황빛/적색 플레어 효과 파이프라인 탑재.

3. **CineStill 텅스텐 시네마 필름의 붉은 할레이션 (Red Halation)**:
   - 영화용 필름(Kodak Vision3)에서 뒷면의 흑연 층(Remjet)을 제거할 때 발생하는 특유의 현상.
   - 강한 광원(가로등, 네온사인, 촛불)의 빛이 유제층을 뚫고 필름 베이스 뒷면에 반사되어 **광원 경계면에 붉은 테두리(Red Rim Glow)**를 형성하는 광학적 특성을 셰이더로 완벽 모사.

4. **80년대 일본 시티팝 (Japanese City Pop 80s) 컬러 사이언스**:
   - 1980년대 도쿄의 여름 해변, 야간 수도고속도로, 카세트 테이프 앨범 아트워크(스즈키 에이진, 나가이 히로시) 특유의 발색 고증.
   - 섀도우 영역의 깊은 마젠타-퍼플 틴트와 하이라이트 영역의 눈부신 골든 앰버(Golden Amber) 대비를 통해 낭만적인 노스탤지어 구현.

---

## 3. 독립 12대 프리미엄 카메라 라인업 기획 명세 (The 12 Iconic Cameras)

사용자는 하단 기계식 다이얼 및 카메라 랙(Camera Rack)을 통해 빈티지/명품 필름·디카 10종과 전문 스튜디오 2종, 총 **12대의 독립 카메라**를 자유롭게 전환합니다.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       SnapStudio Multi-Camera Rack                                     │
├────────────────┬────────────────┬────────────────┬──────────────┬──────────────┬──────────────┬────────┤
│  📷 Canon IXY  │  📹 Sony DCR   │  💿 Cyber-shot │  📸 Olympus  │  🎞️ Contax   │  🖤 Ricoh GR │  🖼️ ...│
│    Digital 50  │    Handycam    │    DSC-P10     │   μ [mju:] II│      T2      │    Digital   │ Instax │
├────────────────┼────────────────┼────────────────┼──────────────┴──────────────┴──────────────┴────────┤
│  🔴 Leica M    │  🌆 City Pop   │  🎞️ Old Film   │  🎨 Personal Color Studio  │  🪪 Standard ID Cam     │
│     Series     │      80s       │     Master     │      Profile Studio        │     & Passport Cam      │
└────────────────┴────────────────┴────────────────┴────────────────────────────┴─────────────────────────┘
```

---

### 3.1 [Camera 1] Canon IXY Digital 50 (Y2K 얼짱 디카 웜톤 명기)
- **컨셉**: 2000년대 얼짱 문화를 풍미했던 일본 명기 디카의 복숭아빛 피부톤과 직광 플래시.
- **하드웨어 바디 테마**: 실버 메탈릭 브러시드 알루미늄 & 레트로 디카 원형 버튼.
- **전용 뷰파인더 OSD**: `AiAF` 9포인트 초점 박스, 오렌지 디지털 데이트 각인 `'26 10 05 14:28`, 플래시 레디 인디케이터.
- **전용 모듈형 필터 세트 (4종)**:
  1. `[Peach Glow]`: 맑고 뽀샤시한 웜톤 피부결, 화사한 복숭아빛 치크, 부드러운 하이라이트 롤오프.
  2. `[Flash Pop]`: 2000년대 디카 직광 플래시 재현, 중심부 고대비 및 외곽 비네팅.
  3. `[Lo-Fi Pastel]`: 채도가 빠지고 섀도우가 살짝 들뜬 2000년대 싸이월드 감성 파스텔 톤.
  4. `[Night Noise]`: 밤거리 감성의 고감도 ISO 컬러 노이즈 및 레트로 입자감.

---

### 3.2 [Camera 2] Sony DCR Handycam (90s-00s 미니DV 캠코더)
- **컨셉**: 레트로 홈비디오 감성의 아날로그 비디오 테이프 질감 및 스캔라인 글리치.
- **하드웨어 바디 테마**: 다크 티타늄 텍스처 & 레드 `● REC` 셔터 버튼.
- **전용 뷰파인더 OSD**: `● REC`, `SP 0:00:14`, `SONY DCR`, `Hi-Fi STEREO [DV]`, 배터리 잔량 게이지, 중앙 크로스헤어.
- **전용 모듈형 필터 세트 (4종)**:
  1. `[MiniDV Classic]`: 90년대 소니 3CCD 비디오 특유의 묵직하고 따뜻한 비디오 원색 질감.
  2. `[Hi8 VHS Tape]`: 브라운관 수평 스캔라인 글리치, 아날로그 색 번짐(Chroma Blur).
  3. `[Super 8 Cine]`: 1970년대 홈무비 시네 필름 비네팅 & 골든 앰버 톤.
  4. `[NightShot Green]`: 소니 특유의 0 Lux 적외선 야간 투시 나이트샷 그린 톤.

---

### 3.3 [Camera 3] Sony Cyber-shot DSC-P10 (사이버 Y2K 쿨톤 CCD 디카)
- **컨셉**: 2000년대 미래주의 테크 감성, 푸른빛 틴트와 쨍한 대비의 CCD 센서 표현.
- **하드웨어 바디 테마**: 쿨 사이버 블루-그레이 메탈 바디 & 사이버 테크 엠블럼.
- **전용 뷰파인더 OSD**: `Cyber-shot`, `5.1 MEGAPIXELS`, `DSC-P10`, `ISO 100`, 정밀 4코너 포커스 브래킷.
- **전용 모듈형 필터 세트 (4종)**:
  1. `[CCD Cool Blue]`: 차가운 블루 틴트 & 투명하고 하얀 쿨톤 피부, 차가운 섀도우.
  2. `[Cyber Magenta]`: 2000년대 테크노 마젠타 하이라이트 & 네온 글로우.
  3. `[Flash Sharp]`: 어둠 속에서 피사체만 쨍하게 얼려버리는 직광 플래시.
  4. `[Matrix Green]`: 세기말 SF 사이버 무드의 에메랄드 틴트.

---

### 3.4 [Camera 4] Olympus μ [mju:] II (90년대 필름 똑딱이의 제왕)
- **컨셉**: 90년대 전 세계를 사로잡은 슬라이딩 커버 필름 똑딱이, F2.8 대구경 단렌즈의 쨍한 콘트라스트와 극적인 비네팅.
- **하드웨어 바디 테마**: 샴페인 골드 & 차콜 콤팩트 쉘, 슬라이딩 배리어 도어 인터랙션.
- **전용 뷰파인더 OSD**: `[AF]` 타원 스팟 존, 뷰파인더 녹색 초점 인디케이터, 플래시 충전 LED.
- **전용 모듈형 필터 세트 (4종)**:
  1. `[Mju Crisp F2.8]`: 쨍하고 날카로운 선예도, 원색 발색이 깊은 90년대 필름 룩.
  2. `[Flash Snapshot]`: 파티나 어두운 실내에서 피사체만 완벽히 분리되는 직광 플래시 비네팅.
  3. `[Tokyo Street 400]`: 일본 길거리 스냅 느낌의 은은한 그린 섀도우와 감성 띰.
  4. `[Rainy Day Muted]`: 비 오는 날 물방울 맺힌 유리창 너머의 촉촉하고 차분한 무드.

---

### 3.5 [Camera 5] Contax T2 (칼자이스 명품 티타늄 프리미엄 필름)
- **컨셉**: 칼자이스(Carl Zeiss) T* Sonnar 렌즈 특유의 압도적인 해상력과 영롱한 보케, 고급스러운 샴페인 골드 필름 톤.
- **하드웨어 바디 테마**: 매트 티타늄 샴페인 골드 바디 & 사파이어 셔터 버튼.
- **전용 뷰파인더 OSD**: `CONTAX T2`, `Carl Zeiss T* Sonnar 2.8/38`, 붉은색 LED 셔터스피드 표시 (`1/500`, `1/125`).
- **전용 모듈형 필터 세트 (4종)**:
  1. `[Zeiss T* Warmth]`: 칼자이스 특유의 풍부한 계조, 따스하고 우아한 앰버 하이라이트.
  2. `[Titanium Velvet]`: 깊고 매끄러운 암부 계조와 벨벳 질감의 프리미엄 피부 톤.
  3. `[Golden Hour 38mm]`: 노을빛 황금 시간대의 극적인 역광 플레어와 부드러운 감성.
  4. `[High Fashion 90s]`: 90년대 보그/엘르 매거진 화보 스타일의 모던 클래식 필름.

---

### 3.6 [Camera 6] Ricoh GR Digital (스트리트 하이 콘트라스트 흑백 스냅)
- **컨셉**: 모리야마 다이도 감성의 거칠고 강렬한 하이 콘트라스트 흑백, 거침없는 순간 포착.
- **하드웨어 바디 테마**: 마그네슘 합금 블랙 질감 바디 & 가죽 그립 텍스처.
- **전용 뷰파인더 OSD**: `GR DIGITAL`, `SNAP FOCUS [2.5m]`, `F2.4 1/250`, 황금비율 격자선.
- **전용 모듈형 필터 세트 (4종)**:
  1. `[High Contrast B&W]`: 칠흑 같은 암부와 눈부신 백색의 강렬한 흑백 스트리트 스냅.
  2. `[Grainy Raw Street]`: 거친 입자감(Rough Grain)이 살아있는 언더그라운드 흑백.
  3. `[Positive Film Tone]`: 리코 GR 특유의 청량한 블루와 짙은 레드의 슬라이드 필름 발색.
  4. `[Cross Process Cool]`: 교차 현상 특유의 기묘하고 매혹적인 사이언-마젠타 톤.

---

### 3.7 [Camera 7] 🔴 Leica M Series (독일 장인정신 레인지파인더 명기)
- **컨셉**: 앙리 카르티에 브레송부터 현대 다큐멘터리 사진가들의 성지, 전설적인 즈미룩스(Summilux) 렌즈의 '3D Pop' 입체감과 타협 없는 라이카 모노크롬 계조.
- **하드웨어 바디 테마**: 매트 블랙 페인트 황동 바디, 클래식 다이아몬드 로렛팅 휠 & 시그니처 레드 닷(Red Dot).
- **전용 뷰파인더 OSD**: 
  - 정중앙 **이중합치식(Split-Image) 노란색 레인지파인더 포커스 패치**.
  - 화각 프레임라인 (`35mm / 50mm Brightline Frames`).
  - 우측 하단 아날로그 셔터스피드 다이얼 인디케이터 (`B - 1/1000s`).
- **전용 모듈형 필터 세트 (4종)**:
  1. `[Leica Monochrom]`: 컬러 필터 어레이가 없는 순수 흑백 센서 특유의 무결점 광학 계조, 묵직하고 깊은 피아노 블랙 암부.
  2. `[Summilux 3D Pop]`: 중심부 피사체가 배경으로부터 분리되어 튀어나올 듯한 마이크로 콘트라스트 및 부드러운 주변부 비네팅.
  3. `[M9 Classic CCD]`: 코닥 풀프레임 CCD 센서 특유의 묵직하고 농밀한 유화 같은 발색과 맑은 피부 톤.
  4. `[Wetzlar Nostalgia]`: 독일 베츨러 클래식 렌즈의 부드러운 글로우 하이라이트와 은은한 세피아 틴트.

---

### 3.8 [Camera 8] 🌆 Japanese City Pop 80s (일본 시티팝 & 쇼와 레트로)
- **컨셉**: 1980년대 타츠로 야마시타, 마츠바라 미키의 낭만적인 음악이 흐르는 도쿄의 네온사인, 해변의 앰버 석양과 카세트 테이프 감성.
- **하드웨어 바디 테마**: 소니 초대 워크맨 TPS-L2 블루 바디 & 크롬 메탈릭 다이얼, 빈티지 이어폰 잭 텍스처.
- **전용 뷰파인더 OSD**:
  - 상단 회전하는 **아날로그 듀얼 카세트 테이프 릴 (Cassette Reel Animated HUD)**.
  - 레트로 인디케이터: `SIDE-A [AUTO REVERSE]`, `FM 80.0MHz TOKYO`, `DOLBY B NR [ON]`.
  - 우측 하단 쇼와 80년대 전광판 도트 폰트 날짜 각인 `'84 07 21`.
- **전용 모듈형 필터 세트 (4종)**:
  1. `[Plastic Love Neon]`: 섀도우에 드리우는 딥 마젠타-퍼플 틴트와 네온사인 사이언 하이라이트, 몽환적인 시티 야경.
  2. `[Pacific Breeze Amber]`: 태평양 해변 리조트의 타오르는 오렌지빛 석양과 골든 아워 앰버 필터.
  3. `[Midnight Expressway]`: 도쿄 수도고속도로를 달리는 자동차 헤드라이트의 아나모픽 네온 플레어와 짙은 블루 톤.
  4. `[Cassette Tape Warmth]`: 마그네틱 테이프가 지닌 특유의 부드럽고 따뜻한 채도 감쇄 및 아날로그 노이즈.

---

### 3.9 [Camera 9] 🎞️ Old Film Master (CineStill 800T & Kodak Portra 시네마 유제)
- **컨셉**: 영화 촬영용 텅스텐 시네마 필름의 붉은 할레이션과 인물 사진의 최고봉 코닥 포트라의 압도적 스킨 톤.
- **하드웨어 바디 테마**: 클래식 브라스(황동) 에이징 바디 & 후면 필름 메모 홀더(Film Carton Box Slot).
- **전용 뷰파인더 OSD**:
  - 필름 잔여 컷수 카운터: `[S - 1 ... 36]`.
  - 유제 정보: `TUNGSTEN 800T / EI 800`, `36 EXP. 135-36`.
  - 셔터 릴리즈 시 아날로그 와인딩 레버 회전 애니메이션.
- **전용 모듈형 필터 세트 (4종)**:
  1. `[CineStill 800T]`: 강한 광원 경계면에 맺히는 **시그니처 레드 림 할레이션(Red Halation)**과 텅스텐 3200K 나이트 시네마 블루.
  2. `[Kodak Portra 400]`: 전 세계 인물 사진가들의 표준, 눈부시게 자연스러운 피부 톤과 부드럽고 따스한 파스텔 하이라이트.
  3. `[Vintage Light Leak]`: 필름실 차광 부식으로 인한 따뜻한 오렌지-적색 광선 스며듦(좌/우 불규칙 배치).
  4. `[Retro Slide E100]`: 후지/코닥 포지티브 슬라이드 필름의 짙고 농밀한 원색 발색과 고선명 대비.

---

### 3.10 [Camera 10] Fuji Instax & Polaroid (아날로그 즉석 인화 카메라)
- **컨셉**: 손에 잡히는 한 장의 인화 사진 감성 및 화이트/무지개 카드 프레임.
- **하드웨어 바디 테마**: 매트 웜 화이트 토이 카메라 바디 & 인화 카트리지 카운터 `[10]`.
- **전용 뷰파인더 OSD**: `instax mini` 시그니처 화이트 카드 프레임 & 필름 배출 가이드.
- **전용 모듈형 필터 세트 (4종)**:
  1. `[Instax Mini Soft]`: 부드럽고 화사한 파스텔 톤 & 들뜬 섀도우 (화이트 카드 프레임).
  2. `[Polaroid 600 Square]`: 묵직하고 따스한 클래식 정방형 즉석 인화 톤.
  3. `[Warm Monochrome]`: 클래식 아날로그 흑백 즉석 사진.
  4. `[Rainbow Vivid]`: 비비드한 원색 발색 & 레트로 무지개 카드 프레임.

---

### 3.11 [Camera 11] Personal Color Studio (실시간 배경 컬러 프로필 스튜디오)
- **컨셉**: 나만의 퍼스널 컬러 배경이 뷰파인더에서 실시간으로 라이브 변환되는 프리미엄 프로필 카메라.
- **하드웨어 바디 테마**: 럭셔리 딥 버건디 & 샴페인 골드 스튜디오 바디.
- **핵심 기술 - 실시간 라이브 배경 치환 (Live Backdrop Swapping)**:
  - Apple Vision의 `VNGeneratePersonSegmentationRequest`를 통해 인물과 배경을 초정밀 분리(Portrait Matte).
  - 뷰파인더 하단 8색 팔레트 탭 시 즉시 배경색이 실시간 변경 (지연시간 < 100ms).
  - **Best 8 퍼스널 컬러 팔레트**:
    - Blossom Pink (`#F38B95`), Sage Olive (`#80926C`), Soft Sky (`#89B6D7`), Oat Beige (`#DFCBB5`)
    - Crimson Wine (`#781F2F`), Pop Fuchsia (`#E93B81`), Camel Ochre (`#C89A58`), Muted Lavender (`#9B8CB4`)
  - **스튜디오 조명 효과**: 중앙 방사형 소프트 라이트(Radial Lighting Vignette).
  - **모먼트 카드 프레임**: 상단 `[이름]'s Moment` (사용자 직접 수정 가능) + 하단 촬영일자 및 친필 서명 각인.
- **전용 모듈형 필터 세트 (4종)**:
  1. `[Spring Warm Tone]`: 생기 넘치는 피치 코랄 톤 & 피부 요철 소프트닝.
  2. `[Summer Cool Tone]`: 맑고 투명한 라벤더-로즈 틴트 & 톤업.
  3. `[Autumn Deep Tone]`: 차분하고 분위기 있는 브릭-올리브 무드.
  4. `[Winter Vivid Tone]`: 선명하고 세련된 하이 콘트라스트 모던 프로필.

---

### 3.12 [Camera 12] Standard ID & Passport Cam (여권/신분증 정밀 규격 카메라)
- **컨셉**: 외교부 여권 및 공공기관 신분증 규격을 100% 충족하는 온디바이스 홈 스튜디오.
- **하드웨어 바디 테마**: 테크놀로지 펄 화이트 & 사파이어 블루 악센트.
- **전용 뷰파인더 HUD**: 대한민국 여권(3.5x4.5cm), 주민등록증, 반명함(3x4cm), 비자(5x5cm) 가이드라인(정수리선, 눈높이선, 턱끝선, 어깨 수평선).
- **특화 기능**:
  - 단색 배경 실시간 감지 안내.
  - 조명 균형 판정 및 수평 인디케이터.
  - **4x6인치 8분할 인화 시트 원클릭 출력**: 재단선(Crop Marks) 및 여백 자동 렌더링.
- **전용 모듈형 필터 세트 (4종)**:
  1. `[Neutral Studio 5000K]`: 색 왜곡 없는 정확한 표준 주광색 증명사진.
  2. `[Sharp Softbox ID]`: 소프트박스 조명 시뮬레이션 및 선명한 윤곽선.
  3. `[Mono Document]`: 공공 서류 및 자격증 제출용 고대비 흑백.
  4. `[Warm Business]`: 사원증 및 비즈니스 프로필용 부드러운 웜톤.

---

## 4. 탈부착 광학 렌즈 필터 시스템 (Detachable Optical Lens Filters)

사용자는 상단 툴바의 `[◎ 렌즈]` 버튼을 통해 12대 어떤 카메라 기종에도 아래 5종의 전문 물리 광학 렌즈를 자유롭게 탈부착하여 중첩 효과를 연출할 수 있습니다.

| 광학 렌즈 | 효과 및 광학적 특성 | 추천 결합 시나리오 |
| :--- | :--- | :--- |
| **✨ Black Mist** | 하이라이트 할레이션(블룸 광선) 확산 및 인물 피부 요철 소프트닝 | Leica M Series, Contax T2, Personal Color Studio |
| **✦ Cross Star 4X** | 야경 조명 및 점광원을 다이아몬드 별빛 4방향 회절광으로 변환 | City Pop 80s, Olympus μ-II, 밤거리 네온 |
| **━ Blue Streak** | 영화용 아나모픽 렌즈의 네온 사이언 수평 플레어 연출 | CineStill 800T, Cyber-shot CCD, 야간 드라이브 |
| **🌈 Prism Spectrum** | 렌즈 가장자리의 영롱한 무지개 색수차 분광 및 림라이트 | City Pop 80s, Fuji Instax, 감성 일상 스냅 |
| **🪞 CPL Polarizer** | 유리창/피부 반사광 억제, 하늘 파란색 및 피사체 원색 채도 극대화 | Standard ID 여권, Ricoh GR 야외 풍경 |

---

## 5. 모듈형 카메라 필터 시스템 아키텍처 (Modular Filter Architecture)

### 5.1 설계 원칙 및 아키텍처
카메라 필터 엔진은 객체지향 5대 원칙 중 **OCP (Open-Closed Principle: 개방-폐쇄 원칙)**을 철저히 준수합니다:
- **확장에 개방 (Open for Extension)**: 신규 카메라 기종(예: Leica M, City Pop 80s, Old Film Master) 추가 시 독립 파일 생성 후 등록만 수행.
- **수정에 폐쇄 (Closed for Modification)**: 카메라 프리뷰 뷰파인더, AVFoundation 캡처 엔진, UI 컨트롤 코드를 1줄도 수정하지 않음.

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
│  [Step 2] Modular CameraFilter (Leica, City Pop, CineStill, IXY, etc.) │
│  [Step 3] Detachable OpticalFilter (Black Mist, Star, Streak, etc.)    │
│  [Step 4] Sensor Grain / Red Halation / Light Leak / Film Vignette     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│               FilterRegistry (Thread-safe Central Registry)             │
│                                                                        │
│  ├── CanonIXYFilterPack (Peach Glow, Flash Pop, Lo-Fi, Night Noise)    │
│  ├── SonyHandycamFilterPack (MiniDV, Hi8 Tape, Super 8, NightShot)     │
│  ├── SonyCybershotFilterPack (CCD Blue, Magenta, Flash Sharp, Matrix)  │
│  ├── OlympusMjuFilterPack (Crisp F2.8, Flash Snapshot, Street, Rainy)  │
│  ├── ContaxT2FilterPack (Zeiss Warmth, Titanium, Golden Hour, Fashion) │
│  ├── RicohGRDFilterPack (High Contrast BW, Grainy, Positive, Cross)    │
│  ├── LeicaMFilterPack (Monochrom, Summilux 3D, M9 CCD, Wetzlar) [NEW]  │
│  ├── CityPop80sFilterPack (Plastic Love, Pacific, Midnight, Cassette)  │
│  ├── OldFilmMasterPack (CineStill 800T, Portra 400, LightLeak, E100)   │
│  ├── FujiInstaxFilterPack (Instax Soft, Polaroid 600, Warm Mono, Vivid)│
│  ├── PersonalColorFilterPack (Spring Warm, Summer Cool, Autumn, Winter)│
│  ├── PassportIDFilterPack (Neutral 5000K, Sharp Softbox, Mono, Warm)   │
│  └── OpticalLensFilterPack (Black Mist, Star, Blue Streak, Prism, CPL) │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.2 핵심 프로토콜 정의
1. **`CameraFilter` Protocol**:
   - `id: String`: 고유 식별자
   - `name: String`, `localizedName: String`: 표시명
   - `cameraCategory: CameraCategory`: 속한 12대 기종 카테고리
   - `filterDescription: String`: 필터 설명 문구
   - `iconName: String`: SF Symbol 아이콘
   - `apply(to: CIImage, context: CIContext, intensity: Double) -> CIImage`: 코어 이미지 필터링 함수
2. **`OpticalFilter` Protocol**:
   - `id: String`, `name: String`, `localizedName: String`
   - `apply(to: CIImage, context: CIContext, strength: Double) -> CIImage`: 광학 렌즈 굴절/블룸 효과 함수
3. **`FilterRegistry` Class**:
   - `Thread-safe` 싱글톤 중앙 레지스트리.
   - `register(filter: CameraFilter)`, `register(opticalFilter: OpticalFilter)`
   - `filters(for category: CameraCategory) -> [CameraFilter]`
   - `opticalFilters() -> [OpticalFilter]`
4. **`FilterPipeline` Class**:
   - 4단계 체이닝(인물 누끼 배경 합성 ➔ 기종별 카메라 필터 ➔ 탈부착 광학 렌즈 ➔ 레드 할레이션/빛샘/필름 텍스처)을 Metal GPU 가속 기반 `CIContext`에서 60fps로 실시간 처리.

---

## 6. UI/UX 화면 구조 및 인터랙션 사양 (iPhone 16 Pro 규격)

### 6.1 레이아웃 구조 (393pt x 852pt)
```
[ Top: 0 ~ 52pt ]       iOS Status Bar & Dynamic Island
[ Top: 52 ~ 96pt ]      Top Toolbar (플래시, 타이머, ◎광학렌즈, 규격가이드, 전/후면 전환)
[ Top: 100 ~ 592pt ]    3:4 Live Viewfinder Canvas (369pt x 492pt WYSIWYG)
                        - 선택된 카메라 기종 바디 텍스처 (Leica 황동, City Pop 워크맨, IXY 등)
                        - 실시간 배경 누끼 레이어 (퍼스널 컬러 스튜디오 모드)
                        - 기종별 레트로 OSD 오버레이 (Leica 레인지파인더 패치, 카세트 릴, REC 등)
[ Top: 598 ~ 724pt ]    Camera Rack Drawer
                        - [일반 카메라] 전용 필터 4종 카드 & 강도 슬라이더
                        - [퍼스널 컬러] 실시간 8색 컬러 스와치 & 모먼트 텍스트 필드
                        - [여권/신분증] 여권/면허/비자 규격 탭 & 4x6 인화 시트 버튼
[ Top: 728 ~ 832pt ]    Camera Switcher Dial & Shutter Action Row
                        - 12대 카메라 기계식 다이얼 휠 ([LEICA] [CITY POP] [OLDFILM] [IXY] ...)
                        - 기계식 햅틱 셔터 버튼 & 갤러리 썸네일
[ Top: 836 ~ 852pt ]    Home Indicator
```

### 6.2 iOS 전용 특화 UX
1. **기계식 햅틱 피드백 (`HapticFeedbackManager`)**:
   - 다이얼 휠 스크롤: 휠 틱마다 정밀한 `UISelectionFeedbackGenerator`.
   - 셔터 릴리즈: 중후한 메카니컬 셔터 충격파 모사 (Leica 실키 셔터 vs Handycam 버튼 햅틱 구분).
   - 가이드라인 정합: 여권 안면 가이드 완벽 일치 시 `UINotificationFeedbackGenerator(.success)`.
2. **물리 하드웨어 키 연동**:
   - 볼륨 상/하 버튼 물리 셔터 연동.
   - iPhone 15 Pro / 16 시리즈 Action Button 단축어 연동.

---

## 7. CI/CD 및 릴리즈 배포 파이프라인 명세 (CI/CD Specifications)

SnapStudio는 **Web MVP Prototype**과 **iOS Native Production App**의 2-Track 품질 보증 및 자동 배포 체계를 운영합니다.

### 7.1 자동화 테스트 체계 (`iCamTestRunner`)
총 **45개 이상의 전수 테스트 항목**이 Swift 네이티브 러너(`swift run iCamTestRunner`)를 통해 100% 자동 검증됩니다:
- **Suite 1: 기종별 필터 등록 검증**: 각 카메라 기종의 등록 여부 및 기종별 최소 4종 이상 고유 필터 장착 여부
- **Suite 2: 탈부착 광학 렌즈 등록 검증**: 5종 광학 렌즈(Black Mist, Star 4X, Blue Streak, Prism, CPL) 등록 및 메타데이터 무결성
- **Suite 3: CoreImage 렌더링 파이프라인 무결성**: 기종별 전용 필터에 대한 실제 CIImage 프로세싱 및 출력 Extent 검증
- **Suite 4: 광학 렌즈 필터 체이닝 검증**: 기본 카메라 필터 + 5종 광학 렌즈의 순차 체이닝 렌더링 유효성 검증
- **Suite 5: 실시간 인물 누끼 & 배경 합성 검증**: Apple Vision Portrait Matte 마스크와 Hex 컬러 배경 합성 파이프라인 무결성
- **Suite 6: 동적 플러그인 확장(OCP) 검증**: 외부 플러그인 필터의 런타임 동적 등록 및 정상 호출 여부

### 7.2 로컬 CI/CD 파이프라인 스크립트 (`scripts/ci-cd-local.sh`)
개발자가 커밋 전 로컬 환경에서 1-Click으로 실행하는 통합 품질 검증 스크립트:
1. Python 기반 웹 프로토타입 DOM & 반응형 무결성 테스트 (`scripts/test-prototype.py`).
2. Swift 컴파일 및 네이티브 테스트 러너(`swift run iCamTestRunner`) 실행.
3. 로컬 웹 서버 및 포트 바인딩 헬스체크.
4. Git 스테이징 및 릴리즈 태그 정합성 확인.

### 7.3 GitHub Actions CI/CD 워크플로우 (`.github/workflows/ci-cd.yml`)
GitHub 리포지토리의 `main`, `master`, `develop` 브랜치 푸시 및 PR 시 자동 실행되는 3-Tier Job:

| Job | 환경(Runner) | 역할 및 세부 단계 |
| :--- | :--- | :--- |
| **1. Web QA & Validation** | `ubuntu-latest` | • `htmlhint`, `stylelint`, `eslint` 정적 분석<br>• Python 기반 웹 프로토타입 자동화 테스트<br>• 웹 아티팩트 빌드 및 보관 (14일) |
| **2. GitHub Pages Deployment** | `ubuntu-latest` | • Web QA 통과 후 `main` 브랜치 자동 배포<br>• 웹 인터랙티브 데모 사이트 호스팅 자동 갱신 |
| **3. iOS Native CI** | `macos-14` | • Xcode 15.4 / Swift 5.10+ 환경 검증<br>• SwiftLint 정적 린팅 수행<br>• `swift build` 및 `swift run iCamTestRunner` 전수 테스트 통과 검증 |

### 7.4 iOS TestFlight 및 App Store 릴리즈 배포 명세
- **Apple Developer Program 연계**:
  - `Bundle Identifier`: `com.snapstudio.icam`
  - `Code Signing`: Fastlane Match (git 기반 인증서/프로비저닝 프로파일 동기화)
- **App Store 필수 Info.plist 프라이버시 권한 정책**:
  - `NSCameraUsageDescription`: "레트로 카메라 뷰파인더 촬영 및 규격 증명사진 측정을 위해 카메라 접근 권한이 필요합니다."
  - `NSPhotoLibraryUsageDescription`: "촬영한 필름 및 증명사진을 앨범에 저장하기 위해 권한이 필요합니다."
- **배포 단계**:
  - `Alpha/Nightly`: GitHub Actions ➔ TestFlight Internal 테스터 자동 배포.
  - `Beta/RC`: 기능 완료 태그(`v1.0.0-rc*`) 생성 시 TestFlight External 배포.
  - `Production`: App Store Connect 최종 심사 제출.

---

## 8. 구현 완료 현황 및 마일스톤

- [x] **웹 인터랙티브 MVP 프로토타입**: 멀티 카메라 기종 전환, 실시간 컬러 치환, 4x6 인화 시트 출력, CI/CD 자동화 완료.
- [x] **모듈형 필터 시스템 아키텍처 (`FilterModule`)**: OCP 준수 프로토콜 및 `FilterRegistry` 플러그인 엔진 구현 완료.
- [x] **독립 카메라 라인업 및 고유 필터 팩 분리**: 기종별 전용 필터 및 탈부착 광학 렌즈 5종 완비.
- [x] **빈티지 광학 컬러 사이언스 고증**: CCD 하이라이트 블로우아웃, CineStill 레드 할레이션, 시티팝 네온 틴트, 라이카 모노크롬 계조 수립 완료.
- [x] **Apple Vision 온디바이스 인물 세그멘테이션**: `SegmentationService` 및 실시간 배경 합성 파이프라인 구현 완료.
- [x] **SwiftUI 3:4 뷰파인더 & 전용 레트로 OSD 오버레이**: 바디 테마 및 OSD 뷰 레이어 구현 완료.
- [x] **자동화 테스트 스위트 45개 100% 통과**: `iCamTestRunner` 전수 검증 통과.
- [x] **CI/CD 배포 파이프라인 구축**: 로컬 스크립트 및 GitHub Actions 3-Tier 워크플로우 가동 중.

---

## 9. 최종 결론

SnapStudio는 **"12대 독립 카메라 라인업(라이카 M, 80s 시티팝, 시네스틸/올드필름, Y2K 디카, 캠코더, 프로필 스튜디오 등)"**, **"광학 컬러 사이언스 기반 정밀 고증"**, **"실시간 라이브 배경 컬러 치환"**, **"탈부착 광학 렌즈 필터"**, **"모듈형 필터 레지스트리 아키텍처"**, **"자동화된 3-Tier CI/CD"**를 통해 기술적 완성도와 아날로그의 정서적 감성을 완벽하게 융합한 독보적인 차세대 iOS 카메라 제품입니다.
