import { NextRequest, NextResponse } from "next/server";
import { makeSuccess, makeError } from "@/types/api";
import {
  IS_MOCK_MODE,
  fetchCharacterProfile,
  fetchCharacterEquipment,
  fetchCharacterGems,
  fetchCharacterEngravings,
  fetchExpeditionCharacters,
} from "@/lib/lostark-api";
import { normalizeCharacterProfile, normalizeSiblings } from "@/lib/normalize";
import { MOCK_CHARACTER } from "@/lib/mock-data";
import type { CharacterData } from "@/types/character";

type Params = { params: Promise<{ name: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { name } = await params;
  const characterName = decodeURIComponent(name);

  if (!characterName.trim()) {
    return NextResponse.json(
      makeError("INVALID_NAME", "캐릭터 이름이 비어 있습니다."),
      { status: 400 }
    );
  }

  // ── Mock 모드 ──────────────────────────────────────────────────
  if (IS_MOCK_MODE) {
    return NextResponse.json(
      makeSuccess<CharacterData>(MOCK_CHARACTER, { source: "mock" })
    );
  }

  // ── 실제 API 호출 (부분 성공 처리) ────────────────────────────
  const warnings: string[] = [];
  const fetchedAt = new Date().toISOString();

  try {
    const [profileRes, equipRes, gemRes, engravingRes, siblingRes] =
      await Promise.allSettled([
        fetchCharacterProfile(characterName),
        fetchCharacterEquipment(characterName),
        fetchCharacterGems(characterName),
        fetchCharacterEngravings(characterName),
        fetchExpeditionCharacters(characterName),
      ]);

    // 프로필은 필수 — 실패 시 전체 실패 반환
    if (profileRes.status === "rejected") {
      return NextResponse.json(
        makeError(
          "CHARACTER_NOT_FOUND",
          `캐릭터 '${characterName}'를 찾을 수 없습니다.`,
          { source: "lostark-openapi", fetchedAt }
        ),
        { status: 404 }
      );
    }

    // 장비/보석/각인은 부분 성공 허용
    if (equipRes.status === "rejected") {
      warnings.push("장비 정보를 불러오지 못했습니다.");
    }
    if (gemRes.status === "rejected") {
      warnings.push("보석 정보를 불러오지 못했습니다.");
    }
    if (engravingRes.status === "rejected") {
      warnings.push("각인 정보를 불러오지 못했습니다.");
    }

    const profile = profileRes.value.data;
    const equipment = equipRes.status === "fulfilled" ? (equipRes.value.data ?? []) : [];
    const gems =
      gemRes.status === "fulfilled" ? (gemRes.value.data.Gems ?? []) : [];
    const engravings =
      engravingRes.status === "fulfilled" ? (engravingRes.value.data?.Engravings ?? []) : [];
    const siblings =
      siblingRes.status === "fulfilled"
        ? normalizeSiblings(siblingRes.value.data)
        : [];

    if (siblingRes.status === "rejected") {
      warnings.push("원정대 캐릭터 목록을 불러오지 못했습니다.");
    }

    const character = normalizeCharacterProfile(profile, equipment, gems, engravings);
    const partial = warnings.length > 0;

    return NextResponse.json(
      makeSuccess<CharacterData>(
        {
          character,
          siblings: siblings.map((s) => ({
            characterName: s.characterName,
            characterClass: s.characterClass,
            itemLevel: s.itemLevel,
          })),
        },
        { source: "lostark-openapi", fetchedAt, partial, warnings }
      )
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      makeError("CHARACTER_FETCH_ERROR", message, {
        source: "lostark-openapi",
        fetchedAt,
      }),
      { status: 500 }
    );
  }
}
