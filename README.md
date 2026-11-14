# Camera Project — Aesthetic & Persona Architecture

이전 개발 코드베이스를 전면 폐기하고, **사진작가 및 감성별 큐레이터 페르소나**를 최상위 설계 기준으로 삼아 처음부터 다시 정의하는 리포지토리입니다.

기술과 기능 나열보다 먼저 **"사용자가 기본 카메라 대신 이 카메라를 켜고 셔터를 누르는 감정적·광학적 이유"**를 확립합니다.

---

## 구조 (Repository Structure)

- [`AGENTS.md`](./AGENTS.md) — 워크스페이스 크리에이티브 헌법 및 페르소나 협업 규칙
- [`AESTHETICS.md`](./AESTHETICS.md) — **선정된 8대 핵심 감성 스펙트럼** 및 기카(기본 카메라) 차별화 기준표
- [`personas/`](./personas/README.md) — 수석 사진작가부터 감성별 작가·컬러리스트·촉각 비평가까지 **11인 페르소나 도시에(Dossier)**
- [`.agents/skills/persona-council/SKILL.md`](./.agents/skills/persona-council/SKILL.md) — 페르소나 위원회 소집 및 감성 검수 스킬

---

## 현재 단계 (Current Phase)

- [x] 기존 개발 소스코드 전면 삭제 및 백지화
- [x] 8대 핵심 사진 감성 선정 ([`AESTHETICS.md`](./AESTHETICS.md))
- [x] 사진작가 기반 11인 페르소나 설계 ([`personas/`](./personas/README.md))
- [ ] 사용자 감성/페르소나 피드백 반영 및 확정
- [ ] 확정된 감성/페르소나 기반의 새로운 프로덕트 아키텍처 수립
