# ArkPilot

원정대 성장 우선순위와 지인 레이드 일정을 한곳에서 정리하는 로스트아크 운영 도구입니다.

## MVP 목표

- 실제 원정대 데이터를 신뢰할 수 있게 조회
- 이번 주 투자 후보를 근거와 함께 최대 3개 제시
- 초대 링크로 원하는 사람들과 레이드 가능 시간을 취합하고 확정

현재 범위와 제외 항목은 `docs/PRD.md`, 레이드 조율 명세는 `docs/RAID_PARTY_MVP.md`를 기준으로 합니다.

## 문서 우선순위
1. 사용자의 현재 요청
2. `docs/PRD.md`
3. `docs/RAID_PARTY_MVP.md` 또는 `docs/API_SCHEMA.md`
4. `docs/IA.md`
5. `docs/sprints/current/*`
6. `docs/sprints/archive/*`

## 초기 작업 순서
1. 홈 / 검색 랜딩 구현 ✅
2. 캐릭터 상세 결과 페이지 구현 ✅
3. 원정대 / 주간 보조 페이지 구현 ✅
4. mock 데이터 연결 ✅
5. 실제 데이터 소스 연결 ✅
6. 데이터 신뢰 계약 안정화
7. 초대형 레이드 모집 MVP

---

## 시작하기

### 1. Node.js 설치

[https://nodejs.org](https://nodejs.org) 에서 LTS 버전 설치 (현재 미설치 상태)

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

```bash
cp .env.local.example .env.local
# .env.local에서 LOSTARK_API_KEY 입력 (없으면 mock 모드로 동작)
```

### 4. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 에서 확인

---

## 프로젝트 구조

```
src/
  app/
    page.tsx                     # 홈 / 검색 랜딩
    layout.tsx                   # 공통 레이아웃
    not-found.tsx                # 404 페이지
    character/[name]/page.tsx    # 캐릭터 상세
    expedition/[name]/page.tsx   # 원정대 요약
    weekly/[name]/page.tsx       # 주간 체크
    api/
      home/route.ts
      character/[name]/route.ts
      expedition/[name]/route.ts
      weekly/[name]/route.ts
  types/
    api.ts          # 표준 응답 스키마
    character.ts
    expedition.ts
    weekly.ts
    home.ts
  lib/
    lostark-api.ts  # 외부 API 클라이언트 (서버 전용)
    normalize.ts    # 원시 응답 → 내부 스키마 정규화
    mock-data.ts    # Mock 데이터 (API 키 없을 때 사용)
  components/
    SearchBar.tsx
    ui/
      LoadingSpinner.tsx
      ErrorBanner.tsx
      EmptyState.tsx
      PartialWarning.tsx
    character/
      SpecSummary.tsx
    expedition/
      ExpeditionOverview.tsx
    weekly/
      WeeklyChecklist.tsx
```

## Mock 모드

`LOSTARK_API_KEY` 환경변수가 비어 있으면 자동으로 mock 모드로 동작합니다.
mock 데이터는 `src/lib/mock-data.ts`에 있습니다.
