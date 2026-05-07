# Sprint 4 Done Report

작성일: 2026-05-07  
목적: Sprint 4 실데이터 안정화 작업 결과와 남은 보정 항목을 고정한다.

## 1. Summary

Sprint 4에서는 실제 LostArk Open API 응답과 기존 내부 타입/정규화 로직 사이의 차이를 줄이는 안정화 작업을 진행했다.

핵심 결과:
- 실제 각인 API 응답 형태 반영
- 장비/원정대 목록의 `null` 응답 가능성 반영
- 정규화 함수의 null/undefined 방어 강화
- `siblingsRes.data === null` 케이스 404 처리
- `API_SCHEMA.md`에 source 정책, GET 에러 코드, API 키 정책 추가
- build/lint 통과
- `main` 브랜치 push 완료

## 2. Commit

| commit | message |
|---|---|
| `f33fe7c` | `fix: Sprint 4 real-data hardening - null guards, engravings type, sibling null check, API_SCHEMA update` |

현재 상태:

```text
main...origin/main
working tree clean
```

## 3. Implemented Scope

| 영역 | 구현 내용 |
|---|---|
| LostArk API 타입 | `fetchCharacterEngravings` 반환 타입을 객체 래퍼로 수정 |
| LostArk API 타입 | `fetchCharacterEquipment`, `fetchExpeditionCharacters`에 `null` 반환 가능성 반영 |
| normalize | `parseItemLevel` null/undefined/빈 문자열 방어 |
| normalize | 장비/보석/각인/원정대 목록 정규화 함수 null guard 추가 |
| Character API | 각인 응답에서 `data?.Engravings ?? []` 사용 |
| Expedition API | 각인 응답 수정, `siblingsRes.data === null` 404 처리 |
| Weekly API | `siblingsRes.data === null` 404 처리 |
| Docs | API source 정책, GET 에러 코드, API 키 정책, PATCH 빈 body 설명 추가 |

## 4. Verification

개발창 보고 기준:

| 검증 | 결과 |
|---|---:|
| build | 통과 |
| lint | 통과 |

PM 확인 기준:

- 최신 커밋 확인 완료
- 원격 반영 상태 확인 완료
- 워킹트리 clean 확인 완료
- 변경 파일 stat 확인 완료

## 5. Known Issues / Follow-up

| ID | 이슈 | 영향 | 다음 대응 |
|---|---|---|---|
| S4-F1 | `API_SCHEMA.md` source 정책 표에 `lostark-api`로 표기됨 | 구현은 `lostark-openapi`를 사용하므로 문서/코드 표현 불일치 | Sprint 4 보정 또는 Sprint 5 첫 task에서 `lostark-openapi`로 통일 |
| S4-F2 | 실제 API 키로 특정 캐릭터 샘플 응답을 문서화하지 않음 | 실응답 기반 QA 증거 부족 | 샘플 캐릭터 기준 API 응답 요약 문서화 |
| S4-F3 | `Tooltip` 파싱은 아직 TODO | 장비 level/quality, gem skill 정확도 제한 | 후속 Sprint에서 필드 우선순위 판단 |
| S4-F4 | API 401이 500 계열로 문서화됨 | 사용자/개발자 진단성이 낮을 수 있음 | 인증 실패 에러코드 분리 검토 |

## 6. Done Criteria Check

| Done criteria | 상태 |
|---|---:|
| 실제 API 응답의 null 가능성 방어 | 완료 |
| 각인 응답 타입 보정 | 완료 |
| 원정대 목록 null 케이스 처리 | 완료 |
| API_SCHEMA 보강 | 완료 |
| build/lint 통과 | 완료 |
| MVP 범위 밖 기능 추가 없음 | 유지 |

## 7. PM Decision

Sprint 4는 완료로 본다.

다음 Sprint는 기능 확장이 아니라 아래 순서로 진행한다.

1. API 문서/구현 정합성 보정
2. 실제 API 키 기준 QA 증거 수집
3. Tooltip 파싱 우선순위 판단
4. 저장소 영속화 여부 결정

