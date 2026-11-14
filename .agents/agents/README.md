# 에이전트 시스템 아키텍처 (Rebuilt Agent Collective)

이전 개발 사이클의 실패 원인("개발자가 임의로 엉터리 필터와 조종석 UI를 만들고, 숫자 테스트만 통과시키던 구조")을 폐기하고, **사진작가·감성 큐레이터 에이전트를 정점에 둔 14인 에이전트 체계**로 새롭게 구축했습니다.

---

## 1. 사진 총괄 & 8대 감성 에이전트 (Aesthetic Jury — Read & Review Scope)

코드를 직접 고치지 않고 오직 **빛·색감·피부톤·감성 순수성**만 기준으로 거부권(VETO)을 행사합니다.

| 에이전트 | 담당 페르소나 | 담당 영역 | 파일 |
| :--- | :--- | :--- | :--- |
| **`MasterPhotographerAgent`** | **강서진** (`00`) | 수석 사진작가 · 전 감성 총괄 심사 | [`MasterPhotographerAgent/agent.md`](./MasterPhotographerAgent/agent.md) |
| **`VintageFilmAgent`** | **최은우** (`01`) | Classic Vintage 35mm | [`VintageFilmAgent/agent.md`](./VintageFilmAgent/agent.md) |
| **`AirySummerAgent`** | **하루카 미즈노** (`02`) | Airy Japanese Summer | [`AirySummerAgent/agent.md`](./AirySummerAgent/agent.md) |
| **`Y2KFlashAgent`** | **김채린** (`03`) | Y2K CCD & Direct Flash | [`Y2KFlashAgent/agent.md`](./Y2KFlashAgent/agent.md) |
| **`NocturneCinemaAgent`** | **진우성** (`04`) | Nocturne Cinema & Halation | [`NocturneCinemaAgent/agent.md`](./NocturneCinemaAgent/agent.md) |
| **`LoFiYouthAgent`** | **박시후** (`05`) | 90s Disposable Youth Lo-Fi | [`LoFiYouthAgent/agent.md`](./LoFiYouthAgent/agent.md) |
| **`EditorialPortraitAgent`** | **서아현** (`06`) | Editorial Medium Format | [`EditorialPortraitAgent/agent.md`](./EditorialPortraitAgent/agent.md) |
| **`MonochromeStreetAgent`** | **노태현** (`07`) | Pure Silver Monochrome | [`MonochromeStreetAgent/agent.md`](./MonochromeStreetAgent/agent.md) |
| **`DreamyInstantAgent`** | **릴리 정** (`08`) | Dreamy Instant & Diffusion | [`DreamyInstantAgent/agent.md`](./DreamyInstantAgent/agent.md) |

---

## 2. 광학·촉각 디자인·디렉팅 에이전트 (Craft & Design Scope)

| 에이전트 | 담당 페르소나 / 역할 | 핵심 임무 | 파일 |
| :--- | :--- | :--- | :--- |
| **`ColorScientistAgent`** | **한도윤** (`09`) | 3D LUT / GPU Shader / 점광원 할레이션 / 피부 보호 수학 | [`ColorScientistAgent/agent.md`](./ColorScientistAgent/agent.md) |
| **`TactileDesignAgent`** | **윤하늘** (`10`) | 미니멀 3단 UI, 순수 뷰파인더, 0ms 손맛, 가짜 광택 제거 | [`TactileDesignAgent/agent.md`](./TactileDesignAgent/agent.md) |
| **`ProductDirectorAgent`** | **프로덕트 디렉터** | 8대 감성 중심 경험 큐레이션, 기능 비대화 차단 | [`ProductDirectorAgent/agent.md`](./ProductDirectorAgent/agent.md) |

---

## 3. 시스템 구현 & 냉혹한 비평 에이전트 (Execution & Veto Gate)

| 에이전트 | 역할 | 권한 & 원칙 | 파일 |
| :--- | :--- | :--- | :--- |
| **`CameraArchitectAgent`** | **시스템 아키텍트** | **감성/디자인 승인 후에만** GPU 기반 클린 모듈 구현 | [`CameraArchitectAgent/agent.md`](./CameraArchitectAgent/agent.md) |
| **`VisualCriticAgent`** | **비주얼 비평가** (`10`) | DOM 수치가 아니라 **실제 결과 사진·기카 비교·UI 미감**으로 VETO | [`VisualCriticAgent/agent.md`](./VisualCriticAgent/agent.md) |

---

## 실행 순서 (Governance Pipeline)

```text
[기획/감성 제안]
   └─► ProductDirectorAgent (범위 절제)
         └─► MasterPhotographerAgent + 해당 AestheticAgent (빛·피부·감성 승인)
               └─► ColorScientistAgent + TactileDesignAgent (광학 셰이더 & 매트 UI 설계)
                     └─► [사용자 승인] ──► CameraArchitectAgent (GPU/모듈 구현)
                                                 └─► VisualCriticAgent (실제 사진 & 기카 블라인드 최종 PASS/VETO)
```
