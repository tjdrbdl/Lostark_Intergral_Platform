/**
 * 모든 API 응답이 공유하는 표준 메타 필드
 * Agent.md 원칙 3: 백엔드는 외부 응답을 내부 표준 스키마로 정규화한다.
 */
export interface ApiMeta {
  success: boolean;
  /** 데이터 출처 목록 (e.g. ["lostark-openapi", "cache"]) */
  source: string[];
  /** 외부 API로부터 실제 fetch한 시각 (ISO 8601) */
  fetchedAt: string | null;
  /** 캐시에서 읽어온 시각 (ISO 8601). 캐시 miss면 null */
  cachedAt: string | null;
  /** true이면 캐시가 만료되었으나 재갱신 실패 → stale 데이터 반환 */
  stale: boolean;
  /** true이면 일부 데이터 소스만 성공 (부분 성공) */
  partial: boolean;
  /** 경고 메시지 배열 (빈 배열이면 정상) */
  warnings: string[];
}

/** 성공 응답 */
export interface ApiSuccess<T> extends ApiMeta {
  success: true;
  data: T;
}

/** 실패 응답 */
export interface ApiError extends ApiMeta {
  success: false;
  data: null;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

type ApiMetaOverrides = {
  source?: string | string[];
  fetchedAt?: string | null;
  cachedAt?: string | null;
  stale?: boolean;
  partial?: boolean;
  warnings?: string[];
};

function normalizeSource(source?: string | string[]): string[] {
  if (!source) return ["unknown"];
  return Array.isArray(source) ? source : [source];
}

/** API 응답 생성 헬퍼 */
export function makeSuccess<T>(
  data: T,
  meta: ApiMetaOverrides = {}
): ApiSuccess<T> {
  return {
    success: true,
    data,
    source: normalizeSource(meta.source),
    fetchedAt: meta.fetchedAt ?? new Date().toISOString(),
    cachedAt: meta.cachedAt ?? null,
    stale: meta.stale ?? false,
    partial: meta.partial ?? false,
    warnings: meta.warnings ?? [],
  };
}

export function makeError(
  code: string,
  message: string,
  meta: ApiMetaOverrides = {}
): ApiError {
  return {
    success: false,
    data: null,
    error: { code, message },
    source: normalizeSource(meta.source),
    fetchedAt: meta.fetchedAt ?? null,
    cachedAt: meta.cachedAt ?? null,
    stale: meta.stale ?? false,
    partial: meta.partial ?? false,
    warnings: meta.warnings ?? [],
  };
}
