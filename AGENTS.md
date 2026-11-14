# Workspace Constitution: Persona-First Camera Studio

이 워크스페이스는 **개발자나 기획자의 기능적 관점이 아니라, 실제 사진작가와 감성 큐레이터 페르소나·에이전트들의 시각·광학·미학적 합의**를 출발점으로 삼는다.

## 1. 절대 원칙 (Non-Negotiable Mandates)

1. **개발 선행 금지 (No Code Without Persona Sign-Off)**
   - 사용자의 명시적 승인 없이 임의로 UI, 필터 코드, 프로토타입을 작성하지 않는다.
   - 모든 색감, 톤, 광학 효과, UI 배치 결정은 반드시 [`AESTHETICS.md`](./AESTHETICS.md), [`personas/`](./personas/README.md), 그리고 [`.agents/agents/`](./.agents/agents/README.md)의 에이전트 기준을 먼저 통과해야 한다.

2. **기카 블라인드 테스트 (3-Second Stock Camera Distinction Rule)**
   - 어떤 감성 프리셋/카메라든 스마트폰 기본 카메라("기카") 결과물과 나란히 놓았을 때 **3초 안에 분위기와 색채 철학의 차이가 명백히 느껴져야** 한다.
   - 단, 그 차이는 **인위적으로 망가뜨린 괴이한 색감**이 아니라 **"이 사진이 더 예쁘고 영화/화보 같다"는 미학적 우위**여야 한다.

3. **인물 피부톤 존엄성 (Skin Tone Dignity)**
   - 어떤 빈티지·야간·청량·로파이 감성이든 사람의 얼굴이 **병든 초록빛, 누런 황달, 칙칙한 흙탕물**로 변질되면 즉시 폐기(VETO)한다.
   - 글로벌 `CSS hue-rotate()`, 과도한 흙빛 `sepia()`, 흰 옷과 피부까지 주황색으로 오염시키는 무분별한 전역 틴트를 엄격히 금지한다.

4. **쓸모없는 가짜 광택·시각 공해 금지 (Zero Plastic Tacky Gloss & Clutter)**
   - 뷰파인더와 카메라 UI에 인위적인 무지개 광택(sheen), 싸구려 유리 반사 그라디언트, 조종석 같은 과잉 텍스트/버튼 도배를 절대 넣지 않는다.
   - 주인공은 항상 **뷰파인더 안의 피사체**다.

5. **리소스 낭비 금지 (Zero Unnecessary Local Daemons)**
   - 사용자가 요청하지 않은 로컬 HTTP 서버나 반복적인 무거운 백그라운드 프로세스를 상시 구동하지 않는다.

---

## 2. 에이전트 & 페르소나 조직 (14 Agents / 11 Personas)

상세 정의는 [`.agents/agents/README.md`](./.agents/agents/README.md) 및 [`personas/README.md`](./personas/README.md)를 따른다.

| 계층 | 에이전트 목록 | 권한 경계 |
| :--- | :--- | :--- |
| **총괄 & 8대 감성 사진작가** | `MasterPhotographerAgent` (`00`), `VintageFilmAgent` (`01`), `AirySummerAgent` (`02`), `Y2KFlashAgent` (`03`), `NocturneCinemaAgent` (`04`), `LoFiYouthAgent` (`05`), `EditorialPortraitAgent` (`06`), `MonochromeStreetAgent` (`07`), `DreamyInstantAgent` (`08`) | 읽기·조사·비평·승인/VETO 전용 (코드 직접 수정 불가) |
| **광학·촉각·프로덕트** | `ColorScientistAgent` (`09`), `TactileDesignAgent` (`10`), `ProductDirectorAgent` | 광학 수식·UI 설계·스펙 정의 |
| **구현 & 비주얼 비평** | `CameraArchitectAgent`, `VisualCriticAgent` (`10`) | 승인 후 GPU/모듈 구현 및 실제 화면·결과 사진 최종 VETO |
