# Sprint 2 진행 보고 (1차)

작성일: 2026-04-17  
기준 문서: `docs/pm_handoff_2026-04-17/DEV_PROMPTS_AND_TASK_SCOPE.md`

## 1) 구현 범위

| 영역 | 작업 내용 |
|---|---|
| API 계약 정합성 | `ApiMeta.source`를 `string[]`로 정합화, helper(`makeSuccess/makeError`)에서 문자열/배열 모두 허용하도록 보정 |
| ROI Engine v0 | `src/lib/roi-engine.ts` 신규 추가, 규칙 기반 카드 생성 함수(`buildRoiCardsV0`) 구현 |
| 원정대 API | `GET /api/expedition/:name` 실데이터 경로에서 `roiCards: []` TODO 제거, ROI v0 결과 연결 |
| 검색 흐름 | `/search?q=&type=` 라우트 추가 (`src/app/search/page.tsx`), SearchBar가 `/search`로 진입 후 목적 라우트 리다이렉트 |
| 통합결과 UX | 원정대 페이지에서 `/api/saved` 동시 조회, 관련 저장 항목/변경 이벤트 노출 |
| 상태 정합성 보완 | 캐릭터/주간 페이지에서 `stale` 병합 표시(`result.stale || saved.stale`) 및 주간 변경 이벤트 연관 필터 강화 |
| 문서 | IA에 `/search?q=...` 라우트 명시 추가 |

## 2) API/상태 처리 반영 내용

- 공통 메타 필드 중 `source`를 배열 기준으로 통일:
  - 예: `["lostark-openapi"]`, `["mock"]`, `["unknown"]`
- 기존 API 라우트 코드 변경 없이 helper에서 자동 정규화되도록 처리:
  - `source: "mock"`로 넘겨도 응답은 배열로 반환
- Expedition API 실데이터 경로에서 ROI 카드 생성 규칙 적용:
  - 레벨 마일스톤 기반 후보
  - 보석 저점 보강 후보
  - 후보 부재 시 fallback 카드
- 검색 UX:
  - 홈 검색 입력은 `/search?q=&type=`로 통합
  - `/search`에서 `/expedition|/character|/weekly/:name`로 리다이렉트
- 원정대 통합 결과 페이지에서 저장/변경추적 노출:
  - 원정대 관련 저장 항목 필터링
  - 연관 변경 이벤트 타임라인 표시
  - 저장 데이터 실패 시 partial 경고 + 빈 상태 안내

## 3) 테스트 결과

- 정적 코드 점검: 변경 파일 간 import/type 참조 이상 없음 확인
- 런타임 빌드 테스트: **미실행**
  - 사유: 로컬 환경에 Node.js 미설치 (`node` 명령 인식 불가)
  - 필요 검증 명령:
    - `npm install`
    - `npm run build`
    - `npm run lint`

## 4) 미완료 항목과 이유

| 항목 | 이유 | 다음 대응 |
|---|---|---|
| ROI 규칙 고도화(클래스/시장 반영) | MVP v0 범위는 규칙 기반 최소 후보 생성까지 | Sprint 2 후반에 규칙 튜닝 표로 관리 |
| `/api/saved` 쓰기 기능(POST/PATCH) | DB/사용자 식별 정책 미확정 | Sprint 2~3에서 저장 쓰기 정책 확정 후 구현 |
| E2E 자동화 테스트 | Node 환경 미구성 | 환경 구성 후 시나리오 A/B/C 자동화 추가 |

## 변경 파일
- `src/types/api.ts`
- `src/app/page.tsx`
- `src/components/SearchBar.tsx`
- `src/app/search/page.tsx` (신규)
- `src/lib/roi-engine.ts` (신규)
- `src/app/api/expedition/[name]/route.ts`
- `src/app/expedition/[name]/page.tsx`
- `docs/IA.md`
