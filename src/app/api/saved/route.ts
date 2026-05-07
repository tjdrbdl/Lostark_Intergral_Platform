import { NextRequest, NextResponse } from "next/server";
import { makeSuccess, makeError } from "@/types/api";
import { savedStoreGetAll, savedStoreCreate } from "@/lib/saved-store";
import type { SavedData, SavedItem } from "@/types/saved";

export async function GET() {
  try {
    const store = savedStoreGetAll();
    return NextResponse.json(
      makeSuccess<SavedData>(store, {
        source: ["memory"],
        fetchedAt: new Date().toISOString(),
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      makeError("SAVED_FETCH_ERROR", message, { source: ["memory"] }),
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved
 * Body: { type, key, label, pinned?, tags? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.type !== "string" || typeof body.key !== "string" || typeof body.label !== "string") {
      return NextResponse.json(
        makeError("INVALID_BODY", "type, key, label 필드가 필요합니다.", { source: ["memory"] }),
        { status: 400 }
      );
    }

    const validTypes = ["character", "expedition", "query"] as const;
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        makeError("INVALID_TYPE", `type은 ${validTypes.join("|")} 중 하나여야 합니다.`, { source: ["memory"] }),
        { status: 400 }
      );
    }

    const input: Omit<SavedItem, "id" | "lastSeenAt"> = {
      type: body.type,
      key: String(body.key).trim(),
      label: String(body.label).trim(),
      pinned: Boolean(body.pinned ?? false),
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    };

    if (!input.key || !input.label) {
      return NextResponse.json(
        makeError("INVALID_BODY", "key, label은 빈 문자열일 수 없습니다.", { source: ["memory"] }),
        { status: 400 }
      );
    }

    const { created, alreadyExists } = savedStoreCreate(input);

    return NextResponse.json(
      makeSuccess(
        { item: created },
        {
          source: ["memory"],
          fetchedAt: new Date().toISOString(),
          warnings: alreadyExists ? ["이미 저장된 항목입니다. lastSeenAt이 갱신되었습니다."] : [],
        }
      ),
      { status: alreadyExists ? 200 : 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      makeError("SAVED_CREATE_ERROR", message, { source: ["memory"] }),
      { status: 500 }
    );
  }
}

