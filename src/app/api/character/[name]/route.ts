import { NextRequest, NextResponse } from "next/server";
import { makeError } from "@/types/api";
import { getApiHttpStatus } from "@/lib/api-status";
import { getCharacterData } from "@/lib/server-data";

type Params = { params: Promise<{ name: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const name = decodeURIComponent((await params).name);
  if (!name.trim()) return NextResponse.json(makeError("INVALID_NAME", "캐릭터 이름이 비어 있습니다."), { status: 400 });
  const result = await getCharacterData(name);
  return NextResponse.json(result, { status: getApiHttpStatus(result) });
}
