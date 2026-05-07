import { NextResponse } from "next/server";
import { makeSuccess, makeError } from "@/types/api";
import { IS_MOCK_MODE } from "@/lib/lostark-api";
import { MOCK_HOME } from "@/lib/mock-data";
import type { HomeData } from "@/types/home";

export async function GET() {
  try {
    if (IS_MOCK_MODE) {
      return NextResponse.json(
        makeSuccess<HomeData>(MOCK_HOME, { source: "mock" })
      );
    }

    // TODO: 실데이터 소스 미연동 상태에서는 UI 공백을 피하기 위해 샘플 데이터를 fallback 반환
    // 제거 기준: 홈 데이터 실소스(공지/추천 콘텐츠) 연동 완료 시
    return NextResponse.json(
      makeSuccess<HomeData>(MOCK_HOME, {
        source: ["fallback", "mock"],
        fetchedAt: new Date().toISOString(),
        partial: true,
        warnings: ["홈 실데이터 소스 미연동: 샘플 데이터를 표시합니다."],
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      makeError("HOME_FETCH_ERROR", message, { source: "unknown" }),
      { status: 500 }
    );
  }
}
