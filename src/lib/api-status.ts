import type { ApiResponse } from "@/types/api";

/** API error code를 HTTP 계약으로 변환하는 단일 매퍼. */
export function getApiHttpStatus<T>(result: ApiResponse<T>): number {
  if (result.success) return 200;
  switch (result.error.code) {
    case "INVALID_NAME":
      return 400;
    case "AUTH_INVALID_KEY":
      return 401;
    case "RATE_LIMITED":
      return 429;
    case "CHARACTER_NOT_FOUND":
    case "EXPEDITION_NOT_FOUND":
    case "WEEKLY_NOT_FOUND":
      return 404;
    case "UPSTREAM_UNAVAILABLE":
      return 502;
    default:
      return 500;
  }
}
