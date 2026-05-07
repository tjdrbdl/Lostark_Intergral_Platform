# Sprint 3 Done Report

작성일: 2026-05-07  
목적: Sprint 3 Saved Write MVP 완료 범위, 검증 결과, 다음 의사결정 항목을 고정한다.

## 1. Summary

Sprint 3에서는 Sprint 2까지의 조회/ROI/저장/변경추적 흐름을 기반으로, 저장 목록을 읽기 전용에서 최소 쓰기 가능 상태로 확장했다.

핵심 결과:
- Saved Write MVP 구현 완료
- 저장 생성/수정/삭제 API 구현
- 원정대/캐릭터 페이지 저장/해제 액션 연결
- 저장 후 서버 컴포넌트 데이터 갱신 보정
- build/lint 통과
- `main` 브랜치 push 완료

## 2. Commits

| commit | message |
|---|---|
| `574023e` | `feat: Sprint 3 saved write MVP` |
| `0256a7e` | `fix: Sprint 3 stabilization - router.refresh, no-store, PATCH empty body guard` |

현재 상태:

```text
main...origin/main
working tree clean
```

## 3. Implemented Scope

| 영역 | 구현 내용 |
|---|---|
| Saved store | in-memory 단일 사용자 저장소 구현 |
| GET saved | `GET /api/saved`가 memory store를 반환 |
| Create saved | `POST /api/saved` 구현 |
| Update saved | `PATCH /api/saved/:id` 구현 |
| Delete saved | `DELETE /api/saved/:id` 구현 |
| Save UI | `SaveButton` 클라이언트 컴포넌트 구현 |
| Expedition page | 원정대 저장/해제 액션 연결 |
| Character page | 캐릭터 저장/해제 액션 연결 |
| Refresh behavior | 저장/해제 성공 후 `router.refresh()` 적용 |
| Cache policy | `/api/saved` 조회 fetch를 `cache: "no-store"`로 보정 |
| API guard | `PATCH /api/saved/:id` 빈 body 요청을 `INVALID_BODY` 400으로 처리 |
| Docs | `API_SCHEMA.md`에 saved write 계약 반영 |

## 4. API Contract Status

### Implemented endpoints

- `GET /api/saved`
- `POST /api/saved`
- `PATCH /api/saved/:id`
- `DELETE /api/saved/:id`

### Common meta fields

모든 saved API는 기존 공통 메타 원칙을 유지한다.

- `success`
- `source`
- `fetchedAt`
- `cachedAt`
- `stale`
- `partial`
- `warnings`

### DELETE contract

최신 계약은 아래 기준으로 고정한다.

```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

## 5. Verification

개발창 보고 기준:

| 검증 | 결과 |
|---|---:|
| `build` | 통과 |
| `lint` | 통과 |

PM 확인 기준:

- 최근 커밋 확인 완료
- 원격 반영 상태 확인 완료
- 워킹트리 clean 확인 완료

## 6. Known Constraints

| 제약 | 설명 | 다음 대응 |
|---|---|---|
| 저장소 휘발성 | 현재 saved store는 in-memory라 서버 재시작 시 초기화된다. | Sprint 4에서 영속 저장 여부 결정 |
| 인증 없음 | MVP 범위상 로그인/권한이 없다. | 개인화/협업 기능 전까지 유지 |
| 단일 사용자 정책 | 현재 저장 목록은 단일 사용자 로컬 정책이다. | DB 도입 시 사용자 식별 정책 필요 |
| 변경 이벤트 생성 제한 | 저장/삭제 자체가 의미 있는 변경 이벤트로 자동 누적되는 구조는 아직 아니다. | 필요 시 Sprint 4+에서 검토 |

## 7. Done Criteria Check

| Done criteria | 상태 |
|---|---:|
| 저장 생성/수정/삭제가 MVP 범위 안에서 동작 | 완료 |
| 저장/변경추적 흐름이 홈/원정대/캐릭터 페이지에서 끊기지 않음 | 완료 |
| API 응답이 공통 메타 필드를 유지 | 완료 |
| 실데이터 실패/미연동 구간은 `partial/warnings`로 표시 | 유지 |
| 프론트는 외부 소스를 직접 모름 | 유지 |
| 로그인/협업/실시간 시세/랭킹 전면전 미구현 | 유지 |

## 8. Next Decision

Sprint 4에서 먼저 결정해야 할 것은 아래 두 갈래 중 우선순위다.

1. 실데이터 안정화 우선
2. 저장소 영속화 우선

PM 권장안:
- 먼저 실데이터 안정화를 진행한다.
- 이유: 현재 제품 가치 검증의 핵심은 저장소 자체보다 실제 캐릭터/원정대 조회의 신뢰도다.
- 저장소 영속화는 in-memory 제약을 명확히 안내한 상태에서 다음 단계로 미룬다.

