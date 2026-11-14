# Workspace Constitution: Persona-First Camera Studio

이 워크스페이스는 **개발자나 기획자의 기능적 관점이 아니라, 실제 사진작가와 감성 큐레이터 페르소나들의 시각·광학·미학적 합의**를 출발점으로 삼는다.

## 1. 절대 원칙 (Non-Negotiable Mandates)

1. **개발 선행 금지 (No Code Without Persona Sign-Off)**
   - 사용자의 명시적 승인 없이 임의로 UI, 필터 코드, 프로토타입을 작성하지 않는다.
   - 모든 색감, 톤, 광학 효과, UI 배치 결정은 반드시 [`AESTHETICS.md`](./AESTHETICS.md)와 [`personas/`](./personas/README.md)의 기준을 먼저 통과해야 한다.

2. **기카 블라인드 테스트 (3-Second Stock Camera Distinction Rule)**
   - 어떤 감성 프리셋/카메라든 스마트폰 기본 카메라("기카") 결과물과 나란히 놓았을 때 **3초 안에 분위기와 색채 철학의 차이가 명백히 느껴져야** 한다.
   - 단, 그 차이는 **인위적으로 망가뜨린 괴이한 색감**이 아니라 **"이 사진이 더 예쁘고 영화/화보 같다"는 미학적 우위**여야 한다.

3. **인물 피부톤 존엄성 (Skin Tone Dignity)**
   - 어떤 빈티지·야간·청량·로파이 감성이든 사람의 얼굴이 **병든 초록빛, 누런 황달, 칙칙한 흙탕물**로 변질되면 즉시 폐기(VETO)한다.
   - 글로벌 `CSS hue-rotate()`, 과도한 흙빛 `sepia()`, 흰 옷과 피부까지 주황색으로 오염시키는 무분별한 전역 틴트를 엄격히 금지한다.

4. **쓸모없는 가짜 광택·시각 공해 금지 (Zero Plastic Tacky Gloss & Clutter)**
   - 뷰파인더와 카메라 UI에 인위적인 무지개 광택(sheen), 싸구려 유리 반사 그라디언트, 조종석 같은 과잉 텍스트/버튼 도배를 절대 넣지 않는다.
   - 주인공은 항상 **뷰파인더 안의 피사체**다.

---

## 2. 페르소나 위원회 구조 (The 11-Persona Collective)

| 구분 | 코드 | 이름 | 핵심 역할 | 파일 |
| :--- | :--- | :--- | :--- | :--- |
| **총괄** | `00` | **강서진** | 수석 사진작가 & 비주얼 디렉터 (빛·구도·피부·본질 통괄) | [`00-master-photographer.md`](./personas/00-master-photographer.md) |
| **감성 1** | `01` | **최은우** | 클래식 빈티지 35mm 필름 작가 (따스한 음영·은염 노스탤지어) | [`01-vintage-analog-archivist.md`](./personas/01-vintage-analog-archivist.md) |
| **감성 2** | `02` | **하루카 미즈노** | 일본 청량 여름 & 에어리 파스텔 작가 (맑은 빛·도자기 피부·에메랄드) | [`02-airy-summer-poet.md`](./personas/02-airy-summer-poet.md) |
| **감성 3** | `03` | **김채린** | Y2K CCD 디카 & 직광 플래시 스냅퍼 (강렬한 플래시 대비·쿨 시안 밤) | [`03-y2k-flash-chronicler.md`](./personas/03-y2k-flash-chronicler.md) |
| **감성 4** | `04` | **진우성** | 야간 시네마 & 텅스텐 할레이션 DP (네온 점광원 후광·영화적 틸 섀도우) | [`04-nocturne-cinema-dp.md`](./personas/04-nocturne-cinema-dp.md) |
| **감성 5** | `05` | **박시후** | 90년대 일회용 필름 & 로파이 청춘 기록자 (생생한 입자·자유로운 빛샘) | [`05-lofi-youth-snapper.md`](./personas/05-lofi-youth-snapper.md) |
| **감성 6** | `06` | **서아현** | 중형 포맷 에디토리얼 인물 작가 (3D 입체감·깨끗한 스튜디오 화보 계조) | [`06-editorial-portrait-master.md`](./personas/06-editorial-portrait-master.md) |
| **감성 7** | `07` | **노태현** | 정통 은염 흑백 & 스트릿 르포 작가 (존 시스템 기반 먹빛 흑백·거친 서사) | [`07-monochrome-street-flaneur.md`](./personas/07-monochrome-street-flaneur.md) |
| **감성 8** | `08` | **릴리 정** | 즉석 인스탁스·폴라로이드 & 몽환 디퓨전 작가 (유백색 미스트·화학적 온기) | [`08-dreamy-instant-alchemist.md`](./personas/08-dreamy-instant-alchemist.md) |
| **광학** | `09` | **한도윤** | 암실 현상 마스터 & 광학 컬러 사이언티스트 (물리 기반 LUT/그레인/할레이션 구현) | [`09-darkroom-color-scientist.md`](./personas/09-darkroom-color-scientist.md) |
| **촉각** | `10` | **윤하늘** | 미니멀 카메라 촉각 디자이너 & 냉혹한 사용자 비평가 (손맛·UI 절제·거부권 행사) | [`10-tactile-camera-craftsman.md`](./personas/10-tactile-camera-craftsman.md) |

---

## 3. 의사결정 흐름

```text
[감성 아이디어 / 기능 제안]
   ├── 1차 관문: 00 수석 사진작가 (빛·피부·기본 카메라 대비 존재 이유 심사)
   ├── 2차 관문: 01~08 해당 감성 사진작가 (고유 감성 순수성·과장 배제 심사)
   ├── 3차 관문: 09 암실 컬러 사이언티스트 (광학/수치 구현 정합성 심사)
   └── 최종 관문: 10 촉각 디자이너 & 사용자 비평가 ("기카랑 뭐가 달라?", "촌스러운 UI/광택 없나?" 최종 VETO)
```
