import { NextRequest, NextResponse } from "next/server";
import { makeSuccess, makeError } from "@/types/api";
import { savedStorePatch, savedStoreDelete } from "@/lib/saved-store";

type Props = { params: Promise<{ id: string }> };

/**
 * PATCH /api/saved/:id
 * Body: { pinned?, tags?, label? }
 */
export async function PATCH(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        makeError("INVALID_BODY", "요청 본문이 올바르지 않습니다.", { source: ["memory"] }),
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = {};
    if (body.pinned !== undefined) {
      if (typeof body.pinned !== "boolean") {
        return NextResponse.json(
          makeError("INVALID_BODY", "pinned는 boolean 이어야 합니다.", { source: ["memory"] }),
          { status: 400 }
        );
      }
      patch.pinned = body.pinned;
    }
    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return NextResponse.json(
          makeError("INVALID_BODY", "tags는 배열이어야 합니다.", { source: ["memory"] }),
          { status: 400 }
        );
      }
      patch.tags = body.tags.map(String);
    }
    if (body.label !== undefined) {
      if (typeof body.label !== "string" || !body.label.trim()) {
        return NextResponse.json(
          makeError("INVALID_BODY", "label은 비어 있지 않은 문자열이어야 합니다.", { source: ["memory"] }),
          { status: 400 }
        );
      }
      patch.label = body.label.trim();
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        makeError("INVALID_BODY", "수정 필드(pinned, tags, label) 중 하나 이상을 포함해야 합니다.", { source: ["memory"] }),
        { status: 400 }
      );
    }

    const updated = savedStorePatch(id, patch);
    if (!updated) {
      return NextResponse.json(
        makeError("SAVED_NOT_FOUND", `id=${id} 저장 항목을 찾을 수 없습니다.`, { source: ["memory"] }),
        { status: 404 }
      );
    }

    return NextResponse.json(
      makeSuccess({ item: updated }, { source: ["memory"], fetchedAt: new Date().toISOString() })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      makeError("SAVED_PATCH_ERROR", message, { source: ["memory"] }),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/saved/:id
 */
export async function DELETE(_req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const deleted = savedStoreDelete(id);

    if (!deleted) {
      return NextResponse.json(
        makeError("SAVED_NOT_FOUND", `id=${id} 저장 항목을 찾을 수 없습니다.`, { source: ["memory"] }),
        { status: 404 }
      );
    }

    return NextResponse.json(
      makeSuccess({ deleted: true as const }, { source: ["memory"], fetchedAt: new Date().toISOString() })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      makeError("SAVED_DELETE_ERROR", message, { source: ["memory"] }),
      { status: 500 }
    );
  }
}
