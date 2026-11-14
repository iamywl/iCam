# Camera Project — Aesthetic, Persona & Agent Architecture

이전 개발 코드베이스 및 구버전 에이전트 구성을 전면 폐기하고, **사진작가·감성 큐레이터 페르소나와 역할 분리형 에이전트 파일**을 기반으로 처음부터 다시 구축한 리포지토리입니다.

---

## 구조 (Repository Structure)

- [`AGENTS.md`](./AGENTS.md) — 워크스페이스 절대 원칙 및 에이전트 거버넌스 헌법
- [`AESTHETICS.md`](./AESTHETICS.md) — 선정된 **8대 핵심 사진 감성 스펙트럼** 및 기카(기본 카메라) 차별화 기준표
- [`.agents/agents/`](./.agents/agents/README.md) — 새롭게 설계된 **14종 에이전트 정의 파일** (총괄 사진작가 · 8대 감성 사진작가 · 컬러 사이언티스트 · 촉각 디자이너 · 프로덕트 디렉터 · 아키텍트 · 비주얼 비평가)
- [`personas/`](./personas/README.md) — 11인 페르소나 심층 도시에(Dossier): 빛·톤 커브·피부톤 규칙·안티패턴·프롬프트 원형
- [`.agents/skills/persona-council/SKILL.md`](./.agents/skills/persona-council/SKILL.md) — 에이전트 위원회 소집 및 감성 검수 워크플로우 스킬

---

## 현재 단계 (Current Phase)

- [x] 기존 개발 소스코드 및 구버전 에이전트 전면 삭제
- [x] 8대 핵심 사진 감성 선정 ([`AESTHETICS.md`](./AESTHETICS.md))
- [x] 11인 사진작가·장인 페르소나 구축 ([`personas/`](./personas/README.md))
- [x] 역할 분리 및 VETO 권한이 반영된 14종 에이전트 파일 재구축 ([`.agents/agents/`](./.agents/agents/README.md))
- [ ] 확정된 에이전트/감성 기반 신규 아키텍처 및 프로덕트 설계 착수
