import { NextResponse } from "next/server";
import { makeSuccess, makeError } from "@/types/api";
import { IS_MOCK_MODE } from "@/lib/lostark-api";
import { MOCK_SAVED } from "@/lib/mock-data";
import type { SavedData } from "@/types/saved";

export async function GET() {
  try {
    if (IS_MOCK_MODE) {
      return NextResponse.json(
        makeSuccess<SavedData>(MOCK_SAVED, { source: "mock" })
      );
    }

    // TODO: 실제 구현 시 DB/스토리지에서 사용자별 저장 목록 조회
    // 현재는 빈 데이터 반환
    const data: SavedData = { items: [], changeEvents: [] };
    return NextResponse.json(
      makeSuccess<SavedData>(data, {
        source: "db",
        fetchedAt: new Date().toISOString(),
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      makeError("SAVED_FETCH_ERROR", message, { source: "db" }),
      { status: 500 }
    );
  }
}
