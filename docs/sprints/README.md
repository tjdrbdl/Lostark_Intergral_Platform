# Sprint 문서

## 구조

```text
sprints/
  current/
    SPRINT7_HANDOFF.md
    SPRINT7_QA.md
  archive/
    SPRINT5_REVIEW.md
    SPRINT6_QA.md
```

## 사용 원칙

- `current/`만 현재 구현 지시와 완료 판단에 사용합니다.
- `archive/`는 과거 의사결정과 장애 원인을 확인할 때만 읽습니다.
- 제품 범위가 충돌하면 `../PRD.md`가 우선합니다.
- 라우트 책임은 `../IA.md`, API 동작은 `../API_SCHEMA.md`가 우선합니다.
- Sprint가 끝나면 핵심 리뷰와 최종 QA만 `archive/`에 남기고 중간 진행보고와 일회용 프롬프트는 제거합니다.
