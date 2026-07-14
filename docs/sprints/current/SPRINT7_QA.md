# Sprint 7 Data Trust QA Report

검증일: 2026-07-14  
기준 커밋: `43b1ec98e05c25ec6b2e5a3a8c43e13b80ac2c98`  
범위: 외부 오류 계약, partial 정책, KST weekly reset, 결과 페이지 상태 표시

## 1. 오류 계약 검증

| 상황 | 결과 |
|---|---|
| 정상 실데이터 `김두한오리` character | PASS — HTTP 200, `success=true`, `source=lostark-openapi` |
| 정상 실데이터 `김두한오리` expedition | PASS — HTTP 200, `success=true`, 캐릭터 11명 |
| 정상 실데이터 `김두한오리` weekly | PASS — HTTP 200, `success=true`, 주간 대상 11명 |
| 실제 미존재 character/expedition/weekly | PASS — 모두 HTTP 404, route별 `*_NOT_FOUND` |
| invalid API key character/expedition/weekly | PASS — 모두 HTTP 401, `AUTH_INVALID_KEY` |
| upstream 429 | PASS — 격리 mock에서 HTTP 429, `RATE_LIMITED` |
| upstream 5xx/network | PASS — 격리 mock에서 HTTP 502, `UPSTREAM_UNAVAILABLE` |
| 선택 데이터 실패 | PASS — 격리 mock에서 HTTP 200, `partial=true`, 구체적 warning |

429/5xx/network/partial 검증은 실제 외부 장애를 유발하지 않고, 새 테스트 프레임워크나 의존성 없이 일회성 격리 mock harness로 수행했다. 자동화된 프로젝트 테스트 스위트는 추가하지 않았다.

### 재현 방법 구분

- 실제 API 검증: production build 후 `next start`에서 API 키 값을 출력하지 않은 상태로 `김두한오리`, 미존재 이름, invalid key를 호출했다.
- 격리 mock 검증: typed upstream status classifier와 `server-data.ts`의 dependency를 메모리에서 대체해 429, 502, 선택 데이터 partial 정책을 확인했다.
- API 키, 환경변수 값, 응답 로그 원문은 문서에 기록하지 않았다.

## 2. Weekly reset 경계값

`Asia/Seoul` 기준 수요일 reset을 UTC ISO 시각으로 검증했다.

| 입력 시각 | 기대 `weeklyResetAt` | 결과 |
|---|---|---|
| 수요일 05:59 KST (`2026-07-15T05:59+09:00`) | 당일 06:00 KST (`2026-07-14T21:00Z`) | PASS |
| 수요일 06:00 KST (`2026-07-15T06:00+09:00`) | 다음 주 수요일 06:00 KST (`2026-07-21T21:00Z`) | PASS |
| 수요일 06:01 KST (`2026-07-15T06:01+09:00`) | 다음 주 수요일 06:00 KST (`2026-07-21T21:00Z`) | PASS |

UTC와 `America/Los_Angeles` 서버 TZ에서도 동일한 결과를 확인했다.

## 3. UI/회귀 검증

- character/expedition/weekly 성공 페이지에서 `source`, `fetchedAt`, `partial`, `stale` 표시 확인.
- 실제 미존재 결과 페이지에서 `EmptyState` 표시 확인.
- upstream 장애/제한은 `ErrorBanner` 경로로 유지하고, partial은 `PartialWarning`으로 표시하도록 코드 경로 확인.
- 선택 데이터 404는 `데이터를 찾을 수 없습니다`, 429는 `요청이 제한되었습니다`, 5xx/network는 `외부 데이터 소스를 사용할 수 없습니다` 경고 문구로 구분됨을 확인.
- `/search?q=김두한오리&type=expedition` 검색 경로가 원정대 결과로 이동하고, 원정대 결과의 주간 이동 링크가 유지됨.
- 프론트 페이지는 외부 LostArk API를 직접 호출하지 않고 `server-data.ts` loader를 사용함.

## 4. 정적 검증

| 검증 | 결과 |
|---|---|
| `next lint` | PASS — warnings/errors 0 |
| `next build` | PASS — exit code 0 |
| `git diff --check` | PASS |

## 5. 문서/계약 변경

- `docs/API_SCHEMA.md`에 `RATE_LIMITED` 429, `UPSTREAM_UNAVAILABLE` 502, 필수/선택 실패 정책을 반영했다.
- `fetchedAt`은 서버 응답 조립 시각, `cachedAt=null`, `stale=false` 정책을 명시했다.
- `weeklyResetAt` 수요일 06:00 `Asia/Seoul` 기준을 문서화했다.

## 남은 리스크

- 홈 실데이터 소스와 별도 캐시 계층은 범위 밖으로 유지되어 fallback 샘플을 표시한다.
- upstream의 비표준 4xx는 `UPSTREAM_UNAVAILABLE`로 보수 처리된다.
- 실제 브라우저 클릭 자동화 대신 production HTML/redirect와 서버 결과 링크를 사용한 회귀 검증이다.
