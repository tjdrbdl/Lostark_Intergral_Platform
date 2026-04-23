# Sprint 3 Kickoff Prompt

```text
너는 LostArk Data Hub Sprint 3 개발 담당이다.

[핵심 목표]
Sprint 2에서 완성된 조회/ROI/변경추적 흐름을 운영 가능한 수준으로 안정화한다.

[우선순위 Must]
1) /api/saved 쓰기 계약 확정
- POST /api/saved (저장 생성)
- PATCH /api/saved/:id (핀/태그/라벨 수정)
- DELETE /api/saved/:id (저장 해제)
- 인증/권한은 MVP 범위 밖이므로 단일 사용자 로컬 정책으로 제한

2) 에러/부분성공 회귀 테스트
- /character, /expedition, /weekly, /saved 경로에서 partial/stale/error 케이스 점검
- warnings 노출 누락 여부 확인

3) 런타임 검증
- npm run build
- npm run lint
- 핵심 시나리오 A/B/C 수동 리그레션

[Should]
1) ROI 규칙표 문서화(입력/규칙/설명/한계)
2) API_SCHEMA 문서에 weekly roiFollowups, saved write 계약 반영

[Could]
1) 저장 목록 정렬/필터(핀 우선, 최근 변경 우선)
2) 변경 이벤트 severity 필터 UI

[절대 규칙]
- MVP 범위 외 기능 금지
- 프론트 직접 외부 소스 호출 금지
- 실패 시 전체 실패보다 partial/warnings 우선

[완료 보고 형식]
1) 구현 범위
2) API 계약 반영 내용
3) 테스트/검증 결과
4) 남은 리스크
```

