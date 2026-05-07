# Sprint 3 Review + Next Dev Handoff

작성일: 2026-05-07  
목적: 개발창에서 완료한 Saved Write MVP를 PM 기준으로 확인하고, 다음 개발창에 바로 전달할 후속 작업을 정의한다.

## 1. Review Summary

### 확인한 구현 범위

| 항목 | 상태 | 확인 파일 |
|---|---:|---|
| In-memory 단일 사용자 저장소 | 확인 | `src/lib/saved-store.ts` |
| `GET /api/saved` memory store 전환 | 확인 | `src/app/api/saved/route.ts` |
| `POST /api/saved` 저장 생성 | 확인 | `src/app/api/saved/route.ts` |
| `PATCH /api/saved/:id` 수정 | 확인 | `src/app/api/saved/[id]/route.ts` |
| `DELETE /api/saved/:id` 삭제 | 확인 | `src/app/api/saved/[id]/route.ts` |
| `SaveButton` UI | 확인 | `src/components/SaveButton.tsx` |
| 원정대 페이지 저장 버튼 | 확인 | `src/app/expedition/[name]/page.tsx` |
| 캐릭터 페이지 저장 버튼 | 확인 | `src/app/character/[name]/page.tsx` |
| API 문서 업데이트 | 확인 | `docs/API_SCHEMA.md` |

### 검증 결과

| 검증 | 결과 | 비고 |
|---|---:|---|
| `next build` | 통과 | `node .\node_modules\next\dist\bin\next build` 기준 |
| `next lint` | 통과 | `node .\node_modules\next\dist\bin\next lint` 기준 |

참고: 현재 셸에서는 `npm run build`, `npm run lint`가 `Access is denied`로 막힐 수 있다. 이 경우 아래 명령으로 검증한다.

```powershell
& "g:\Coding\Project_LostArk\.tools\node\node.exe" ".\node_modules\next\dist\bin\next" build
& "g:\Coding\Project_LostArk\.tools\node\node.exe" ".\node_modules\next\dist\bin\next" lint
```

## 2. Findings

### F1. 저장/해제 성공 후 서버 컴포넌트 데이터가 즉시 갱신되지 않을 수 있음

현재 `SaveButton`은 버튼 내부 상태만 낙관적으로 바꾼다. 원정대/캐릭터 페이지의 저장 목록, 변경 이벤트, 홈의 저장 목록은 서버 컴포넌트에서 `/api/saved`를 다시 받아와야 갱신된다.

관련 위치:
- `src/components/SaveButton.tsx`
- `src/app/expedition/[name]/page.tsx`
- `src/app/character/[name]/page.tsx`
- `src/app/page.tsx`
- `src/app/weekly/[name]/page.tsx`

권장 처리:
- `SaveButton` 성공 시 `router.refresh()` 실행
- `/api/saved`를 읽는 페이지 fetch는 `{ cache: "no-store" }`로 변경
- 저장/해제 후 홈/원정대/캐릭터/주간에서 최신 저장 상태가 보이는지 확인

### F2. `PATCH /api/saved/:id` 빈 body 처리 정책이 애매함

현재 `{}` 요청도 patch 대상이 없어도 `lastSeenAt`만 갱신될 수 있다. MVP 계약상 수정 API는 `pinned`, `tags`, `label` 중 최소 1개 이상 있어야 명확하다.

권장 처리:
- 유효 patch 필드가 0개면 `INVALID_BODY` 400 반환

### F3. DELETE 응답 계약은 현재 `deleted: true` 기준으로 통일 필요

현재 구현과 `API_SCHEMA.md`는 `data: { deleted: true }` 기준이다. 이전 handoff 초안에는 `deletedId` 표현도 있었으므로, 최신 문서는 `deleted: true`로 고정한다.

## 3. Next Task List

### Must

| ID | Task | Owner | 완료 기준 |
|---|---|---|---|
| S3-F1 | SaveButton 성공 후 `router.refresh()` 적용 | FE | 저장/해제 후 저장 상태와 저장 목록이 즉시 갱신됨 |
| S3-F2 | `/api/saved` 조회 fetch를 `no-store`로 변경 | FE | 홈/원정대/캐릭터/주간 저장 데이터가 캐시에 묶이지 않음 |
| S3-F3 | `PATCH /api/saved/:id` 빈 body 방어 | BE | patch 필드 0개면 `INVALID_BODY` 400 |
| S3-F4 | DELETE 응답 계약 문서 정합성 확인 | Docs | `API_SCHEMA.md`와 구현이 `deleted: true`로 일치 |
| S3-F5 | 저장 흐름 수동 회귀 테스트 | QA | 저장 생성/해제/핀 수정/새로고침 후 상태 확인 |

### Should

| ID | Task | Owner | 완료 기준 |
|---|---|---|---|
| S3-F6 | 저장 실패 UX 점검 | FE/QA | 실패 시 버튼 상태가 원복되고 에러 문구 표시 |
| S3-F7 | 저장 항목 최대 50개 정책 문서화 보강 | Docs | `API_SCHEMA.md`에 정책 유지 |

## 4. Dev Prompt

```text
너는 LostArk Data Hub Sprint 3 후속 보정 담당이다.

[현재 상태]
Saved Write MVP가 구현되어 있다.
GET/POST/PATCH/DELETE /api/saved가 있고, SaveButton이 원정대/캐릭터 페이지에 연결되어 있다.
build/lint는 통과했다.

[이번 작업 목표]
저장/해제 후 서버 컴포넌트 데이터가 즉시 갱신되도록 보정하고, saved write API의 작은 계약 모호성을 정리한다.

[Must]
1. SaveButton 성공 처리에 router.refresh()를 추가한다.
- 저장 성공 후 refresh
- 삭제 성공 후 refresh
- 기존 optimistic UI는 유지

2. /api/saved를 읽는 페이지 fetch를 no-store로 변경한다.
- src/app/page.tsx
- src/app/expedition/[name]/page.tsx
- src/app/character/[name]/page.tsx
- src/app/weekly/[name]/page.tsx

3. PATCH /api/saved/:id에서 빈 patch를 400으로 처리한다.
- pinned, tags, label 중 하나도 없으면 INVALID_BODY

4. API_SCHEMA.md와 구현 계약을 확인한다.
- DELETE 응답은 data.deleted === true 기준 유지

[범위 제한]
- 로그인 구현 금지
- DB 연동 금지
- 협업/권한 기능 금지
- 실시간 시세/랭킹 기능 추가 금지

[검증]
1. 저장 생성 후 버튼과 저장 목록이 갱신되는지 확인
2. 저장 해제 후 버튼과 저장 목록이 갱신되는지 확인
3. PATCH 빈 body가 400을 반환하는지 확인
4. build/lint 실행

[검증 명령]
일반 환경:
npm run build
npm run lint

현재 로컬 포터블 Node 환경에서 npm 접근이 막히면:
& "g:\Coding\Project_LostArk\.tools\node\node.exe" ".\node_modules\next\dist\bin\next" build
& "g:\Coding\Project_LostArk\.tools\node\node.exe" ".\node_modules\next\dist\bin\next" lint

[완료 보고 형식]
1. 구현 범위
2. 수정한 파일
3. API 계약 변경 여부
4. 테스트 결과
5. 남은 리스크
```

## 5. PM TODO

| 우선순위 | TODO | 상태 |
|---:|---|---|
| 1 | 저장 후 서버 데이터 refresh 보정 확인 | 대기 |
| 2 | `/api/saved` no-store 반영 확인 | 대기 |
| 3 | PATCH 빈 body 400 처리 확인 | 대기 |
| 4 | DELETE 응답 계약 `deleted: true` 유지 확인 | 대기 |
| 5 | saved write 수동 테스트 결과 수령 | 대기 |

## 6. Done Criteria

- 저장 버튼을 눌렀을 때 버튼 상태와 저장 목록이 같은 세션에서 갱신된다.
- 저장 해제 후 원정대/캐릭터 페이지에서 저장 상태가 즉시 해제된다.
- `/api/saved` 조회가 캐시 때문에 이전 상태를 보여주지 않는다.
- `PATCH /api/saved/:id`는 빈 수정 요청을 거부한다.
- build/lint 통과 결과가 보고된다.

