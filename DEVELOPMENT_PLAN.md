# Development Plan: Mac `FilterLab` + Mirrored Web Camera

`AGENTS.md`, `AESTHETICS.md`, `.agents/agents/README.md` 합의를 바탕으로 수립된 **맥 네이티브 필터 테스트 앱(`FilterLab`) 및 1:1 미러링 웹 카메라(`web/`)** 통합 개발 계획입니다.

---

## 1. 핵심 아키텍처 (Single Source of Truth, Dual Native Targets)

과거 실패 원인인 *"웹은 CSS/JS 꼼수, 모바일은 별도 코드, 프리뷰와 저장 불일치"*를 구조적으로 해결합니다.

```text
                [ shared/recipes.json ]  (8대 감성 공식 파라미터 단일 소스)
                     /            \
                    ▼              ▼
  [ mac/ (Swift + Metal) ]     [ web/ (WebGL2 + GLSL ES 3.00) ]
   • FilterEngine (iOS 이식형)    • webgl-filter-engine.js (동일 8단계 수식 미러)
   • RGBA16Float 선형 파이프라인   • RGBA16F FBO 멀티패스 블러/커브
   • 사진 드롭/멀티스트립/연속성캠  • 실시간 폰·웹캠 촬영 + 사진 업로드 3×3/스플릿
   • 3×3 시트 · 스플릿 · 200% 루페  • 맥 FilterLab과 레시피 복사/붙여넣기 및 선택적 라이브 싱크
```

---

## 2. 8단계 공통 광학 파이프라인 (`ColorScientistAgent` 계약)

Metal(`MSL`)과 WebGL2(`GLSL`)가 **동일한 수식, 동일 순서, 동일 정규화 스케일**로 실행됩니다.

1. **Stage 1 (Linear Exposure / WB / Monochrome Mixer)**: 선형 sRGB 공간에서 노출($2^{\Delta EV}$), 색온도/틴트, 은염 흑백(`07`)용 오렌지-필터 가중 채널 믹서(`0.50R + 0.35G + 0.15B` + 피부 휘도 리프트/하늘 억제) 적용.
2. **Stage 2 (4-Zone H-D Film Tone Curve)**: 블랙 플로어 페데스탈, 섀도우 토우(Toe), 피벗(`0.46`) 기반 S-커브 대비, 하이라이트 숄더(Shoulder) 압축 및 부드러운 하이라이트 채도 감쇄.
3. **Stage 3 (Skin-Protected Selective Color & Split Toning)**:
   - 오렌지 $25^\circ$ 중심 **피부 보호 가우시안 마스크($M_{skin}$)** 계산.
   - 전역 `hue-rotate()` / 탁한 `sepia()` 영구 금지. 초록(나뭇잎 $115^\circ$)·파랑(하늘 $215^\circ$)·빨강($0^\circ$) 대역을 독립 변조해 피부 오염 차단.
   - `06 Editorial`용 **휘도 보존 크로마 스무딩**(눈·속눈썹 100% 선명 유지 + 피부 얼룩 톤만 균일화).
4. **Stage 4 (2-Pass Point-Source Halation / CCD Blooming)**:
   - 고휘도 점광원($E > \tau_{hal}$, 피부 $L<0.88$ 마스킹 제외) 추출 $\rightarrow$ 분리형 2-Pass 가우시안 블러 $\rightarrow$ 붉은 후광(`04 Nocturne`) 또는 수직 비등방성 CCD 블루밍(`03 Y2K`) 합성.
5. **Stage 5 (2-Pass Black Mist Highlight Diffusion)**:
   - 전체 블러 금지. 하이라이트 추출 마스크만 넓게 블러 후 Screen 블렌딩(`08 Dreamy`)하여 코어 디테일 보존.
6. **Stage 6 (Local 3D Pop Micro-Contrast & Peripheral Softness)**:
   - 저주파 블러 재사용으로 중형 입체감(`06`, `07`) 및 플라스틱 렌즈 주변부 소프트니스(`05`) 구현.
7. **Stage 7 (Bell-Curve Density-Dependent Grain)**:
   - 미드톤($L \in [0.25, 0.70]$) 중심 벨 커브 은염 클럼핑 입자 / CCD 디지털 입자, 해상도 비례 스케일링.
8. **Stage 8 (Cosine⁴ Optical Vignette / Flash Pop / Organic Light Leak)**:
   - 직광 플래시 중심 강조(`03`), 코사인 4승 광학 감쇄, 시드 기반 유기적 모서리 빛샘(`05`).

---

## 3. 단계별 개발 및 검증 마일스톤

### Phase 1: Shared Optical Contract (`shared/recipes.json`)
- `AESTHETICS.md` 기반 `01`~`08` 초기 정밀 레시피 확정 (각 감성 간 시각적 거리 확보 + 인물 피부톤 보호).

### Phase 2: macOS Native `FilterLab` (`mac/`)
- **모듈**: `FilterEngine` (iOS 100% 재사용 가능한 순수 Metal/CoreImage 엔진) + `FilterLabApp` (SwiftUI/AppKit 다크룸 UI).
- **기능**: 사진 Drag & Drop / `⌘O` / `⌘V`, **실시간 웹캠 & iPhone 연속성 카메라(`AVCaptureSession`) 뷰파인더**, 3×3 콘택트 시트(`1`), 드래그 스플릿 + 동기화 100%/200% 루페(`2`), 솔로(`3`), `Space` 0ms 원본 비교, 블라인드 셔플, 마스크 디버그 오버레이, 우측 감성별 튜닝 슬라이더, 풀해상도 이미지/비교 스트립/`recipes.json`/`.cube` LUT 내보내기.
- **리소스 원칙**: 로컬 HTTP/WebSocket 서버는 일절 열지 않으며(상주 백그라운드 데몬 제로), 퍼블릭 GitHub Pages HTTPS URL(`#recipe=` 클라이언트 해시 전달) 및 `shared/recipes.json` 파일로 연동합니다.

### Phase 3: 1:1 Mirrored Web Camera (`web/`)
- **모듈**: WebGL2 멀티패스 셰이더 (`RGBA16F` FBO), `getUserMedia` 카메라 촬영(전/후면 전환, 3:4 뷰파인더, 0ms 셔터 캡처 & 다운로드), 파일 업로드 3×3 시트 & 스플릿 비교, `shared/recipes.json` 로드 및 `#recipe=` URL 해시 / JSON 파일 임포트.
- **UI 원칙**: `#181818` 무채색 다크룸 매트 / `#0E0F12` 매트 크롬, 가짜 광택(`sheen`)·조종석 배지 제로.

### Phase 4: 자동화 컬러·광학 검증 & 시각 검수
- `FilterEngineTests`로 8대 감성별 피부($25^\circ$) 보호, 흑백 오렌지 믹스, `04` 점광원 전용 할레이션(일반 흰색 오염 0%), 톤 커브 다이내믹 레인지를 수치 검증.
- 테스트 차트 + 인물 합성 렌더 PNG를 생성해 직접 눈으로 확인하고 `VisualCriticAgent` 기준으로 최종 PASS 확정.
