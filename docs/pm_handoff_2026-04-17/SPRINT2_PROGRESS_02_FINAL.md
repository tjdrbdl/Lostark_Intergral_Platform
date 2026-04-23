# Sprint 2 종합 보고 (Final)

작성일: 2026-04-17  
기준 문서: `docs/pm_handoff_2026-04-17/DEV_PROMPTS_AND_TASK_SCOPE.md`

## 1) 구현 범위 (최종)

| 영역 | 작업 내용 |
|---|---|
| API 계약 정합성 | `ApiMeta.source`를 `string[]` 기준으로 통일 (`makeSuccess/makeError` 자동 정규화 포함) |
| 검색 흐름 | `/search?q=&type=` 라우트 추가, 검색 입력에서 캐릭터/원정대/주간 라우트 리다이렉트 |
| ROI Engine v0 | 원정대용 `buildRoiCardsV0`, 주간용 `buildWeeklyRoiFollowups` 규칙 함수 반영 |
| Expedition API/UI | 실데이터 경로 ROI 카드 반환 + 통합결과 페이지 저장/변경추적 연동 |
| Weekly API/UI | `WeeklyData.roiFollowups` 추가, 주간 페이지 ROI 후속 카드 + 변경 이력 연동 |
| Character UI | 캐릭터 페이지 저장/변경 추적 연동 |
| 상태 처리 보완 | 캐릭터/주간/원정대 페이지에서 `stale` 병합 표시, partial 경고 유지 |

## 2) Sprint 2 완료 기준 달성 현황

| 기준 | 상태 |
|---|---|
| 원정대 통합 대시보드 동작 | ✅ |
| ROI Engine v0 규칙 적용 | ✅ |
| 저장 목록 + 변경추적 기본 동작 | ✅ (홈/원정대/주간/캐릭터 노출) |
| 검색 → 통합결과 → 주간 흐름 | ✅ |

## 3) 추가 보정 사항 (PM 검증 반영)

1. 주간 페이지 변경 이벤트 필터를 “연관 저장 항목 기준”으로 제한했다.  
2. 캐릭터/주간 페이지 `PartialWarning`에 `saved` API의 `stale` 상태를 병합 반영했다.

## 4) 남은 항목 (Sprint 3 진입)

| 항목 | 이유 | 대응 |
|---|---|---|
| `/api/saved` 쓰기 API (`POST/PATCH`) | DB/사용자 식별 정책 미확정 | Sprint 3에서 저장 정책 확정 후 구현 |
| 런타임 빌드/린트 검증 | 현재 셸에서 Node 미탐지 | 사용자 개발환경에서 `npm install && npm run build && npm run lint` |
| E2E 자동 테스트 | 도구/환경 미구성 | 핵심 시나리오 A/B/C 자동화 |

## 5) 최종 변경 파일 (핵심)

- `src/types/api.ts`
- `src/types/weekly.ts`
- `src/lib/roi-engine.ts`
- `src/lib/mock-data.ts`
- `src/app/search/page.tsx`
- `src/components/SearchBar.tsx`
- `src/app/api/expedition/[name]/route.ts`
- `src/app/api/weekly/[name]/route.ts`
- `src/app/expedition/[name]/page.tsx`
- `src/app/weekly/[name]/page.tsx`
- `src/app/character/[name]/page.tsx`
- `docs/IA.md`

