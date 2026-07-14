# Sprint 6 안정화 QA Report

검증일: 2026-07-13  
범위: Sprint 6 Close  
Sprint 7: 미착수

## 결과 요약

| 검증 | 결과 |
|---|---|
| `next lint` | PASS — warnings/errors 0 |
| `next build` | PASS — dev server 없이 exit code 0 |
| 김두한오리 character 실데이터 | PASS — success, `lostark-openapi`, sibling 11명 |
| 김두한오리 expedition 실데이터 | PASS — success, `lostark-openapi`, character 11명 |
| 김두한오리 weekly 실데이터 | PASS — success, `lostark-openapi`, weekly character 11명 |
| invalid API key: character | PASS — HTTP 401, `AUTH_INVALID_KEY` |
| invalid API key: expedition | PASS — HTTP 401, `AUTH_INVALID_KEY` |
| invalid API key: weekly | PASS — HTTP 401, `AUTH_INVALID_KEY` |
| nonexistent character: character | PASS — HTTP 404, `CHARACTER_NOT_FOUND` |
| nonexistent character: expedition | PASS — HTTP 404, `EXPEDITION_NOT_FOUND` |
| nonexistent character: weekly | PASS — HTTP 404, `WEEKLY_NOT_FOUND` |
| mock home metadata | PASS — `source=fallback,mock`, `partial=true`, warning/fetchedAt 포함 |
| build artifact | PASS — `tsconfig.tsbuildinfo`는 제거되고 `.gitignore` 처리 |

## Sprint 6 Close 변경

- 홈이 성공 응답의 `partial`, `source`, `warnings`, `fetchedAt`을 상태 영역과 경고 영역에 표시하도록 보완했다.
- mock 모드와 real-mode fallback 모두 샘플 데이터임을 warning으로 표시하도록 통일했다.
- `/api/home`도 페이지와 동일한 공통 `getHomeData()`를 사용하도록 정리했다.
- 김두한오리 character/expedition/weekly 실데이터 흐름을 production build에서 확인했다.

## 검증 방법

- production build 후 `next start`로 테스트 서버를 기동했다.
- 실제 API 키로 `김두한오리`의 세 API를 호출했다.
- 임시 invalid key로 세 API가 401인지 확인했다.
- `Sprint6CloseDefinitelyMissing_20260713`으로 세 API가 404인지 확인했다.
- API 키를 비운 mock 환경에서 `/api/home`의 source/partial/warnings/fetchedAt을 확인했다.
- 각 테스트 서버는 검증 후 종료했다.

## 남은 리스크

- 홈 실데이터 소스는 아직 연결되지 않아 fallback 샘플을 표시한다.
- 원정대/주간 API의 외부 장애와 not-found 분류 정책은 후속 검토가 필요하다.
- 주간 reset 기준 목요일 06:00의 공식 서비스 시간대 확정이 남아 있다.
- 현재 working tree에는 Sprint 6 이전부터 존재하던 UI 변경도 함께 남아 있어, 별도 커밋 분리는 아직 하지 않았다.
