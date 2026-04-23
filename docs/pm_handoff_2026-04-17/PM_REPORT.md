# LostArk Data Hub PM Report (MVP v1)

작성일: 2026-04-17  
문서 목적: 기획 내용을 개발 가능한 단위로 고정하고, MVP 범위 내에서 구현/검증 우선순위를 명확히 전달한다.

## 1. Product Summary

### 제품 목표 3줄 요약
1. 기능이 많은 포털이 아니라, 유저가 여러 사이트를 오가지 않아도 되는 원정대 운영 허브를 만든다.
2. 원정대 기준으로 스펙, 숙제, 시장 신호, 투자 우선순위를 한 화면에서 연결한다.
3. 저비용 MVP로 빠르게 검증하고, 재방문 근거(저장 목록 + 변경 추적)를 먼저 확보한다.

### MVP가 풀어야 하는 사용자 문제 3개
1. 정보 분산 문제: 캐릭터/원정대/숙제/시장 정보를 여러 사이트에서 수동으로 조합해야 한다.
2. 의사결정 불확실성: 무엇을 먼저 올려야 하는지 근거가 부족해 골드/시간 투입 순서가 흔들린다.
3. 반복 확인 피로: 관심 대상 저장과 변경 추적이 없어 매번 처음부터 다시 확인한다.

### 핵심 유저 시나리오 3개 (요약)
1. 다캐릭 성장 관리자(P0): 원정대 기준 투자 우선순위 확정.
2. 복귀/중간층(P1): 현재 상태 이해 후 다음 액션 후보 선택.
3. 공대장/깐부 운영 유저(P1~P2): 출발 전 준비 상태 빠른 점검.

## 2. User Scenarios

| 시나리오 | 진입점 | 핵심 행동 | 성공 조건 |
|---|---|---|---|
| P0 다캐릭 성장 관리자 | 홈 검색, 저장 항목 클릭 | 원정대 대시보드 확인 → ROI 카드 상위 후보 확인 → 주간 보조에서 병목 캐릭터 체크 | 3분 내 이번 주 실행 후보 1개 이상 확정 |
| P1 복귀/중간층 의사결정 혼란 유저 | 캐릭터 검색, 홈 예시 진입 | 통합 결과 요약 확인 → ROI 카드의 이유/비용/효과 확인 → 후보 저장 | 첫 방문 세션에서 저장 1건 이상 생성 |
| P1~P2 공대장/깐부 기반 운영 유저 | 원정대 URL 직접 진입, 검색 진입 | 주간 보조 페이지에서 준비 상태 확인 → 부족 항목 파악 → 캐릭터 상세로 이동 | 핵심 캐릭터 준비 상태를 2분 내 파악 |

## 3. IA / Routing

### 최소 페이지 IA

#### 페이지 A. 홈 / 검색 랜딩 (`/`)
- 목적: 검색 시작점 + 저장/변경추적 재진입점.
- 주요 섹션:
  - 검색창
  - 저장 목록 미리보기
  - 최근 변경 이벤트
  - 기능 3개 소개 카드
- 주요 CTA:
  - 캐릭터/원정대 검색
  - 저장 항목 열기
  - 예시 결과 보기
- 상태:
  - `loading`: 홈 위젯 스켈레톤
  - `empty`: 저장 항목 없음
  - `error`: 홈 데이터 실패 안내
  - `partial`: 일부 위젯만 표시 + 경고 메시지

#### 페이지 B. 통합 결과 페이지 (`/expedition/:name`, 보조 `/character/:name`)
- 목적: 원정대/캐릭터 정보를 단일 맥락으로 연결.
- 주요 섹션:
  - 원정대 요약
  - 캐릭터 목록 및 핵심 스펙
  - ROI 추천 카드
  - 최근 변경 추적 이벤트
- 주요 CTA:
  - 주간 보조 페이지 이동
  - 캐릭터 상세 보기
  - 저장/핀 고정
- 상태:
  - `loading`: 요약 카드 우선 표시
  - `empty`: 조회 대상 없음
  - `error`: 조회 실패
  - `partial`: 일부 섹션 누락 + `warnings` 노출

#### 페이지 C. 원정대 운영 / 주간 보조 (`/weekly/:name`)
- 목적: 주간 운영 점검과 실행 후보 확정.
- 주요 섹션:
  - 주간 체크 상태
  - 캐릭터별 체크 아이템
  - ROI 후속 후보 카드
- 주요 CTA:
  - 후보 저장
  - 통합 결과 페이지 복귀
  - 캐릭터 상세 이동
- 상태:
  - `loading`: 체크 리스트 로딩
  - `empty`: 체크 대상 없음
  - `error`: 주간 데이터 실패
  - `partial`: 일부 캐릭터 데이터만 반영

### 추천 라우팅 구조
- `/`
- `/search?q={name}` (엔티티 판별 후 리다이렉트)
- `/expedition/:name` (주 라우트)
- `/character/:name` (보조 라우트)
- `/weekly/:name`

### 구조 판단: 원정대 중심 vs 캐릭터 중심
- 결론: 원정대 중심 구조가 MVP 목적에 더 적합.
- 이유:
  - 핵심 타겟(P0)의 의사결정 단위는 단일 캐릭터가 아니라 원정대 포트폴리오다.
  - ROI/저장/변경추적은 다캐릭 맥락에서 재방문 가치가 커진다.
  - 캐릭터 중심 시작은 빠르지만, 운영 우선순위 확정 단계에서 다시 이동 비용이 커진다.

## 4. API Contracts

### 공통 응답 엔벨로프
```json
{
  "success": true,
  "source": ["official_api", "cache", "derived"],
  "fetchedAt": "2026-04-17T00:00:00Z",
  "cachedAt": "2026-04-17T00:00:00Z",
  "stale": false,
  "partial": false,
  "warnings": [],
  "data": {}
}
```

### 데이터 모델 정의

#### character summary
```json
{
  "name": "string",
  "server": "string|null",
  "class": "string|null",
  "itemLevel": 0,
  "role": "main|sub|unknown",
  "engravingCount": 0,
  "gemAvgLevel": 0,
  "cardSet": "string|null",
  "lastUpdatedAt": "string|null"
}
```

#### expedition summary
```json
{
  "name": "string",
  "server": "string|null",
  "characterCount": 0,
  "mainCharacterName": "string|null",
  "avgItemLevel": 0,
  "readyCount": 0,
  "pendingCount": 0
}
```

#### weekly status
```json
{
  "resetAt": "string|null",
  "progressRate": 0,
  "characters": [
    {
      "name": "string",
      "itemLevel": 0,
      "checkItems": [
        {
          "key": "string",
          "label": "string",
          "status": "ready|pending|unknown"
        }
      ]
    }
  ]
}
```

#### roi recommendation card
```json
{
  "id": "string",
  "targetType": "character|expedition",
  "targetKey": "string",
  "title": "string",
  "reason": "string",
  "estimatedCost": {
    "gold": 0,
    "time": "low|mid|high"
  },
  "expectedImpact": "string",
  "roiScore": 0,
  "confidence": "low|mid|high",
  "actions": ["string"]
}
```

#### saved item
```json
{
  "id": "string",
  "type": "character|expedition|query",
  "key": "string",
  "label": "string",
  "pinned": false,
  "tags": ["string"],
  "lastSeenAt": "string|null"
}
```

#### change tracking event
```json
{
  "id": "string",
  "itemId": "string",
  "eventType": "spec_change|weekly_change|market_change|data_delay",
  "summary": "string",
  "before": {},
  "after": {},
  "severity": "low|mid|high",
  "detectedAt": "string"
}
```

### 엔드포인트 최소 응답 스키마

#### `GET /api/home`
```json
{
  "success": true,
  "source": ["cache", "derived"],
  "fetchedAt": "2026-04-17T00:00:00Z",
  "cachedAt": "2026-04-17T00:00:00Z",
  "stale": false,
  "partial": false,
  "warnings": [],
  "data": {
    "hero": {
      "title": "원정대 운영 허브",
      "description": "여러 사이트를 오가지 않고 핵심 의사결정을 지원"
    },
    "savedPreview": [],
    "changePreview": [],
    "roiPreview": []
  }
}
```

#### `GET /api/character/:name`
```json
{
  "success": true,
  "source": ["official_api", "cache"],
  "fetchedAt": "2026-04-17T00:00:00Z",
  "cachedAt": "2026-04-17T00:00:00Z",
  "stale": false,
  "partial": false,
  "warnings": [],
  "data": {
    "character": {},
    "expeditionRef": {
      "name": "string|null"
    },
    "roiCards": [],
    "recentChanges": []
  }
}
```

#### `GET /api/expedition/:name`
```json
{
  "success": true,
  "source": ["official_api", "cache", "derived"],
  "fetchedAt": "2026-04-17T00:00:00Z",
  "cachedAt": "2026-04-17T00:00:00Z",
  "stale": false,
  "partial": false,
  "warnings": [],
  "data": {
    "expedition": {},
    "characters": [],
    "roiCards": [],
    "recentChanges": []
  }
}
```

#### `GET /api/weekly/:name`
```json
{
  "success": true,
  "source": ["derived", "cache"],
  "fetchedAt": "2026-04-17T00:00:00Z",
  "cachedAt": "2026-04-17T00:00:00Z",
  "stale": false,
  "partial": true,
  "warnings": ["일부 캐릭터 데이터 누락"],
  "data": {
    "expedition": {
      "name": "string"
    },
    "weekly": {},
    "roiFollowups": []
  }
}
```

#### `GET /api/saved`
```json
{
  "success": true,
  "source": ["db", "cache", "derived"],
  "fetchedAt": "2026-04-17T00:00:00Z",
  "cachedAt": "2026-04-17T00:00:00Z",
  "stale": false,
  "partial": false,
  "warnings": [],
  "data": {
    "items": [],
    "changeEvents": []
  }
}
```

## 5. ROI Engine v0

### 엔진 타입
- 규칙 기반 추천 엔진(v0).
- 목적: 정답 제시가 아니라 실행 후보를 우선순위와 근거와 함께 제시.

### 입력값
- `character summary`, `expedition summary`, `weekly status`
- 캐시된 비용/시장 스냅샷(실시간 정밀 시세 아님)
- 저장 목록 우선순위(핀 고정/태그/최근 조회)

### 출력값
- `roi recommendation card[]` 정렬 결과
- 각 카드에 `reason`, `estimatedCost`, `expectedImpact`, `confidence` 포함

### 규칙 예시
1. 주간 접근 조건 미달 항목이 있으면 접근 해금형 후보를 상위에 배치.
2. 동일 비용 대비 영향도가 높은 항목이 확인되면 효율형 후보를 상위에 배치.
3. 저장 대상에서 최근 변경 폭이 크면 추적 우선형 후보를 상위에 배치.
4. 데이터 결측이 크면 정보 보강형 후보를 생성하고 confidence를 낮춘다.

### 한계
1. 숙련도/파티조합/플레이 취향을 완전 반영하지 못한다.
2. stale 데이터 구간에서는 비용 정확도가 떨어질 수 있다.
3. v0 점수는 의사결정 보조 지표이며 절대 비교 지표가 아니다.

### 설명 방식
- 카드별 1문장 이유 제공.
- 사용한 입력 필드와 누락 필드 표시.
- `confidence`, `fetchedAt`, `cachedAt`, `stale`를 함께 노출.

### UX 원칙 (정답화 금지)
1. 문구는 "추천 정답"이 아니라 "실행 후보"로 고정.
2. 항상 2~3개 대안 후보를 같이 제시.
3. 사용자는 저장/보류/숨김으로 후보를 직접 관리.
4. 실행 이후 변경 추적으로 재평가 루프를 제공.

## 6. MVP Delivery Plan

### Sprint 제안 (2주 단위)

#### Sprint 1 (주 1~2): 계약과 뼈대
- 목표: 사용자 흐름/상태/데이터 계약 잠금 + mock 우선 개발 시작
- 완료 기준:
  - API 계약 v1 확정
  - 홈/통합결과 페이지 기본 라우팅 완료
  - 5개 API mock 응답 연결 완료

#### Sprint 2 (주 3~4): 핵심 가치 구현
- 목표: 원정대 운영 허브 핵심 가치(ROI/저장/변경추적) 구현
- 완료 기준:
  - 원정대 통합 대시보드 동작
  - ROI Engine v0 규칙 적용
  - 저장 목록 + 변경추적 기본 동작

#### Sprint 3 (주 5~6): 안정화와 검증
- 목표: 외부 의존성 대응력 강화 + QA 시나리오 통과
- 완료 기준:
  - 캐시/partial/warnings 처리 안정화
  - 핵심 3개 시나리오 E2E 통과
  - Non-goal 이탈 없이 MVP 릴리즈 준비 완료

### Must / Should / Could

| 영역 | Must | Should | Could |
|---|---|---|---|
| 프론트 | 3개 핵심 페이지, 상태 4종, 검색→결과→주간 흐름 | 저장/변경추적 UI 고도화 | ROI 카드 정렬 커스터마이즈 |
| 백엔드 | 5개 API, 공통 메타 필드, partial/warnings | ROI 규칙 확장 포인트 | 이벤트 필터 고급화 |
| 데이터 수집 | 공식 소스 우선, 정규화 계층, 캐시 TTL 기본값 | 보조 소스 최소 연결 | 다중 소스 자동 failover |
| 문서화 | API 계약서, 상태 매트릭스, 의사결정 로그, Non-goal 고정 | 운영 플레이북 초안 | 릴리즈 회고 템플릿 |
| QA | 핵심 3개 시나리오 E2E, partial/error 상태 검증 | 성능/로깅 점검 | 실험성 AB 시나리오 |

### Task Breakdown (담당 영역 기준)

#### Frontend
- 홈 검색 랜딩 + 저장/변경 미리보기 UI
- 통합 결과 페이지(원정대 요약/캐릭터 목록/ROI 카드)
- 주간 보조 페이지(체크 상태/후속 후보)
- 페이지별 `loading/empty/error/partial` 상태 구현

#### Backend
- `/api/home`, `/api/character/:name`, `/api/expedition/:name`, `/api/weekly/:name`, `/api/saved`
- 공통 메타 필드 강제
- 부분 성공 응답 + 경고 메시지 규칙 적용
- ROI Engine v0 규칙 서비스 구현

#### Data Collection
- 공식 소스 호출/매핑 검증
- 정규화 스키마 매핑
- 캐시 키/TTL 정책 적용
- 결측/지연 시 fallback 규칙 적용

#### Documentation
- API Contract v1 문서 확정
- UI 상태 매트릭스 문서
- ROI 규칙표 문서
- 범위 제외(Non-goals) 고정 문서

#### QA
- P0/P1/P1~P2 시나리오 기반 테스트
- 결측/partial/stale 표시 검증
- 저장/변경추적 회귀 테스트

## 7. Risks / Non-goals

### 리스크와 완화 전략

| 리스크 | 설명 | 완화 전략 |
|---|---|---|
| 외부 데이터 의존성 | 소스 변경/호출 제한 시 장애 가능 | 백엔드 정규화 계층, 캐시 우선, partial 응답, stale 명시 |
| 계산 정확도/신뢰도 | ROI 결과를 정답으로 오해할 위험 | confidence/근거 노출, 실행 후보 문구 고정, 대안 후보 동시 제시 |
| 범위 팽창 | 포털형 기능 확장 요구 증가 | Must/Should/Could 게이트, 변경 요청은 backlog로 분리 |
| 경쟁사 정면충돌 | 랭킹/실시간 시세 전면전은 비용 과다 | 원정대 CFO형 운영 허브 포지션 유지, 재조합 UX에 집중 |

### Non-goals (MVP 제외)
1. 공개 랭킹 전면전
2. 독립형 지도/DB
3. 독립형 돌/재련/유각 계산기
4. 대형 커뮤니티 게시판
5. 스트리머 허브
6. 완전 자동 협업형 공대 운영
7. 정교한 실시간 시세 포털

### 지금 결정하지 말아야 할 항목
1. 실시간 시세 정밀도 표준: 외부 소스 안정성 검증 전 고정 시 유지비 급증.
2. 협업 권한 모델: 로그인/권한 설계 선행이 필요해 MVP 속도 저하.
3. 클래스별 고도화 ROI 수식: 데이터 누적 전 과적합 위험.
4. 수익화 상세 모델: 실제 사용 패턴 확인 전 고정하면 제품 학습 왜곡.

