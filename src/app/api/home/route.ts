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

    // TODO: 실제 로스트아크 공지 API가 없으므로 현재 빈 배열 반환
    // 제거 기준: 공식 공지 API 엔드포인트 확보 및 연동 완료 시
    const data: HomeData = { notices: [], featuredContents: [] };
    return NextResponse.json(
      makeSuccess<HomeData>(data, {
        source: "lostark-openapi",
        fetchedAt: new Date().toISOString(),
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      makeError("HOME_FETCH_ERROR", message, { source: "lostark-openapi" }),
      { status: 500 }
    );
  }
}
