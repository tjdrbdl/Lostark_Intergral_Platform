# Sprint 7 Data Trust Handoff

작성일: 2026-07-13  
기준 브랜치: `main`  
기준 커밋: `43b1ec98e05c25ec6b2e5a3a8c43e13b80ac2c98`  
기간: 2주 1 Sprint

## 1. Milestone

### 목표

실데이터 조회 결과를 사용자가 신뢰할 수 있도록 외부 API 실패, 실제 미존재, 부분 성공을 구분하고 데이터 출처와 조회 상태를 핵심 결과 페이지에 일관되게 표시한다.

### MVP 범위 재확인

- 핵심 유저: 다캐릭 성장 관리자(P0), 복귀/중간층 의사결정 혼란 유저(P1)
- 핵심 시나리오: 검색 -> 원정대 통합 결과 -> 주간 보조 -> ROI 실행 후보 확인
- 핵심 페이지: 홈/검색 랜딩, 캐릭터·원정대 통합 결과, 원정대 주간 보조
- 데이터 원칙: 프론트는 LostArk 외부 API를 모르며 `src/lib/server-data.ts`가 정규화한다.
- 홈 원칙: 실데이터 소스 미연동 상태를 유지하며 fallback 샘플임을 명시한다.
- 저장 원칙: Sprint 7에서도 in-memory 단일 사용자 정책을 유지한다.

### Sprint 7 범위

- 외부 API 장애와 not-found 분리
- 캐릭터/원정대/주간 페이지의 공통 메타 표시
- 실패/partial 상태별 사용자 메시지 정합화
- 주간 숙제 초기화 기준을 수요일 06:00 KST로 수정
- API 계약과 QA 문서 갱신

### 범위 밖

- 홈 실데이터 소스 신규 연결
- 저장 데이터 DB 영속화 및 사용자 인증
- ROI 계산 규칙 변경
- 랭킹, 커뮤니티, 협업, 지도/DB, 실시간 시세 기능

## 2. Decision Gates

### DG-1. 외부 오류 계약

Sprint 7에서 아래 최소 오류 계약을 확정한다.

| 상황 | API error code | HTTP | 처리 원칙 |
|---|---|---:|---|
| API 키 오류 | `AUTH_INVALID_KEY` | 401 | not-found/partial로 변환하지 않음 |
| 필수 데이터가 upstream 404 또는 null | route별 `*_NOT_FOUND` | 404 | 실제 미존재일 때만 사용 |
| upstream 429 | `RATE_LIMITED` | 429 | 재시도 가능한 외부 제한으로 표시 |
| upstream 5xx 또는 네트워크 실패 | `UPSTREAM_UNAVAILABLE` | 502 | 사용자 입력 오류로 표시하지 않음 |
| 선택 데이터 일부 실패 | 성공 응답 + `partial=true` | 200 | `warnings`에 실패 항목 표시 |

`EXPEDITION_NOT_FOUND`와 `WEEKLY_NOT_FOUND`는 원정대 목록이 실제 404/null인 경우에만 반환한다. 현재처럼 모든 비인증 예외를 404로 변환하지 않는다.

### DG-2. 캐시 메타 의미

현재 Next 내부 `revalidate` 캐시의 hit 여부와 실제 저장 시각을 애플리케이션에서 확인하지 못한다.

Sprint 7 MVP 정책:

- `fetchedAt`: 서버 응답 조립 시각으로 문서화한다.
- `cachedAt`: 캐시 시각을 확인할 수 없으므로 `null`을 유지한다.
- `stale`: stale fallback을 실제 구현하기 전까지 `false`를 유지한다.
- UI에서 `cachedAt=null`인 값을 캐시 없음으로 단정하지 않는다.
- 별도 캐시 계층이나 DB는 Sprint 7에 추가하지 않는다.

### DG-3. ROI 적용 범위

아이템 레벨 420 캐릭터에 1620 목표 카드가 생성된 사례가 있다. 그러나 지원 레벨 간격과 비용 상한은 기획에서 확정되지 않았다.

- Sprint 7에서 ROI 규칙 코드는 변경하지 않는다.
- 현재 입력/출력 사례와 가능한 제한안만 문서화한다.
- PM이 지원 범위를 승인하기 전 임계값을 코드에 추가하지 않는다.

### DG-4. 주간 초기화 기준

PM 확정값은 **매주 수요일 06:00, `Asia/Seoul`(KST)**이다. 현재 목요일 06:00 계산은 Sprint 7에서 수정한다.

- `weeklyResetAt`은 다음 수요일 06:00 KST를 ISO 8601로 반환한다.
- 수요일 06:00 KST 이전이면 당일 06:00을 반환한다.
- 수요일 06:00 KST 이상이면 다음 주 수요일 06:00을 반환한다.
- 서버 OS의 로컬 시간대에 의존하지 않게 계산한다.

## 3. Task List

### Must

| ID | 담당 | 작업 | 완료 기준 |
|---|---|---|---|
| S7-BE1 | 백엔드 | LostArk client에 auth/not-found/rate-limit/upstream 오류 유형을 분리 | 401, 404, 429, 5xx/network가 서로 다른 내부 오류로 보존됨 |
| S7-BE2 | 백엔드 | character/expedition/weekly loader가 필수·선택 데이터 실패 정책을 적용 | 필수 장애는 502/429, 실제 미존재만 404, 선택 실패는 partial 200 |
| S7-BE3 | 백엔드 | API route의 공통 HTTP status 매핑 정리 | 세 route가 동일 오류 계약을 사용하며 중복 분기 최소화 |
| S7-BE4 | 백엔드 | 주간 reset을 수요일 06:00 KST 기준으로 수정 | 서버 시간대와 무관하며 경계값 테스트 통과 |
| S7-FE1 | 프론트 | 캐릭터/원정대/주간 결과에 source, fetchedAt, partial/stale 최소 상태 표시 | 세 결과 페이지에서 동일한 메타 의미가 보임 |
| S7-FE2 | 프론트 | upstream 장애와 not-found UI를 구분 | 장애는 ErrorBanner, 미존재는 EmptyState로 표시 |
| S7-DOC1 | 문서 | `docs/API_SCHEMA.md` 오류/메타 계약 갱신 | 코드, HTTP status, 문서가 일치 |
| S7-QA1 | QA | 정상/미존재/invalid key/429/5xx·network/partial 테스트 | route별 결과표와 재현 방법이 QA 보고서에 기록됨 |
| S7-QA2 | QA | lint/build/diff check 및 핵심 검색 흐름 회귀 테스트 | 모두 PASS, 검색 -> 결과 -> 주간 이동 유지 |

### Should

| ID | 담당 | 작업 | 완료 기준 |
|---|---|---|---|
| S7-DOC2 | 데이터/문서 | ROI v0 지원 범위 결정 자료 작성 | 저레벨/근접 레벨/상한 초과 사례와 제한안 비교, 코드 변경 없음 |
| S7-QA3 | QA | 화면 메타와 API 메타 대조 | source/fetchedAt/partial/warnings가 화면과 응답에서 일치 |

### Could

| ID | 담당 | 작업 | 완료 기준 |
|---|---|---|---|
| S7-QA4 | QA | 수동 API smoke 명령 문서화 | API 키 값을 노출하지 않는 반복 가능한 명령 제공 |

## 4. Route / Module Ownership

| 모듈 | 책임 | 변경 허용 범위 |
|---|---|---|
| `src/lib/lostark-api.ts` | 외부 API 호출과 원본 HTTP 오류 보존 | typed error와 status 분류 |
| `src/lib/server-data.ts` | 외부 응답 정규화, 필수/선택 실패 정책 | 공통 loader 오류 변환 |
| `src/app/api/character/[name]/route.ts` | character HTTP 계약 | 공통 status mapper 사용 |
| `src/app/api/expedition/[name]/route.ts` | expedition HTTP 계약 | 공통 status mapper 사용 |
| `src/app/api/weekly/[name]/route.ts` | weekly HTTP 계약 | 공통 status mapper 사용 |
| `src/components/ui/*` | 공통 상태 표현 | 기존 디자인을 유지한 최소 메타/오류 컴포넌트 |
| 결과 페이지 3개 | API/loader 결과 소비 | 외부 API 세부사항 노출 금지 |
| `docs/API_SCHEMA.md` | API 계약 원본 | 코드와 동시 갱신 |
| Sprint 7 QA report | 검증 증거 | 키/민감정보 기록 금지 |

## 5. API Contract Examples

### Upstream unavailable

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UPSTREAM_UNAVAILABLE",
    "message": "외부 데이터 소스에 일시적으로 연결할 수 없습니다."
  },
  "source": ["lostark-openapi"],
  "fetchedAt": null,
  "cachedAt": null,
  "stale": false,
  "partial": false,
  "warnings": []
}
```

### Optional source partial failure

```json
{
  "success": true,
  "data": {},
  "error": null,
  "source": ["lostark-openapi"],
  "fetchedAt": "ISO-8601",
  "cachedAt": null,
  "stale": false,
  "partial": true,
  "warnings": ["보석 정보를 불러오지 못했습니다."]
}
```

## 6. Dev Handoff

개발창에 아래 프롬프트를 그대로 전달한다.

```text
docs/sprints/current/SPRINT7_HANDOFF.md를 기준으로 Sprint 7 Data Trust 작업을 진행해줘.

원칙:
- 신규 기능이나 MVP 범위를 추가하지 말 것.
- 프론트에서 LostArk 외부 API를 직접 호출하지 말 것.
- 홈 실데이터, DB, 인증, ROI 규칙은 변경하지 말 것.
- 외부 장애를 not-found로 숨기지 말 것.
- 공통 API 메타 필드 계약을 유지할 것.

구현 순서:
1. lostark-api.ts에서 401, 404, 429, 5xx/network 오류 유형을 분리한다.
2. server-data.ts에서 필수 데이터와 선택 데이터 실패 정책을 적용한다.
3. character/expedition/weekly API route의 HTTP status 매핑을 공통화한다.
4. weeklyResetAt을 매주 수요일 06:00 Asia/Seoul 기준으로 수정한다.
5. 세 결과 페이지에 source/fetchedAt/partial/stale 상태를 일관되게 표시한다.
6. upstream 장애는 ErrorBanner, 실제 미존재는 EmptyState로 구분한다.
7. API_SCHEMA.md와 Sprint 7 QA report를 갱신한다.

필수 검증:
- 정상 실데이터 200
- 실제 미존재 404
- invalid API key 401
- rate limit 429
- upstream 5xx/network 502
- 선택 데이터 실패 partial 200
- 주간 reset 경계값: 수요일 05:59, 06:00, 06:01 KST
- UTC 또는 다른 서버 시간대에서도 동일한 reset 결과
- lint/build/git diff --check
- 검색 -> 원정대 결과 -> 주간 페이지 회귀 확인

주의:
- 실제 API 키를 로그나 문서에 출력하지 말 것.
- 429/5xx 검증을 위해 실제 외부 장애를 유발하지 말고 fetch mock 또는 격리된 테스트 경로를 사용할 것.
- ROI 임계값은 추측으로 구현하지 말 것.
- 검증 전 commit/push하지 말 것.

완료 보고:
1. 변경 파일
2. 오류 계약별 HTTP/API 결과
3. UI 상태 검증
4. lint/build 결과
5. 문서 변경
6. 남은 리스크
```

## 7. Done Criteria

- 정상 character/expedition/weekly 요청은 200을 유지한다.
- 실제 미존재만 route별 not-found 404로 반환한다.
- invalid key는 세 route 모두 401 `AUTH_INVALID_KEY`다.
- 429는 `RATE_LIMITED`, HTTP 429다.
- 외부 5xx/network 실패는 `UPSTREAM_UNAVAILABLE`, HTTP 502다.
- 선택 데이터 실패는 성공 응답, `partial=true`, 구체적 warning을 반환한다.
- 세 결과 페이지에서 source와 fetchedAt을 확인할 수 있다.
- upstream 장애 화면과 미존재 화면이 구분된다.
- `weeklyResetAt`이 수요일 06:00 KST 기준이며 서버 시간대에 영향받지 않는다.
- 수요일 05:59/06:00/06:01 KST 경계값 테스트가 통과한다.
- `docs/API_SCHEMA.md`와 구현이 일치한다.
- lint, build, `git diff --check`가 통과한다.
- Sprint 7 QA report가 작성된다.
- ROI 규칙은 변경되지 않는다.
