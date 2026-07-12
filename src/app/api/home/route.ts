import { NextResponse } from "next/server";
import { getHomeData } from "@/lib/server-data";

export async function GET() {
  try {
    return NextResponse.json(getHomeData());
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: null,
      error: { code: "HOME_FETCH_ERROR", message: error instanceof Error ? error.message : "Unknown error" },
      source: ["unknown"],
      fetchedAt: null,
      cachedAt: null,
      stale: false,
      partial: false,
      warnings: [],
    }, { status: 500 });
  }
}
