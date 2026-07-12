import { NextRequest, NextResponse } from "next/server";
import { makeError } from "@/types/api";
import { getExpeditionData } from "@/lib/server-data";

type Params = { params: Promise<{ name: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const name = decodeURIComponent((await params).name);
  if (!name.trim()) return NextResponse.json(makeError("INVALID_NAME", "캐릭터 이름이 비어 있습니다."), { status: 400 });
  const result = await getExpeditionData(name);
  const status = result.success ? 200 : result.error.code === "AUTH_INVALID_KEY" ? 401 : result.error.code === "EXPEDITION_NOT_FOUND" ? 404 : 500;
  return NextResponse.json(result, { status });
}
