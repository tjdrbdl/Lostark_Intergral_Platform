import { NextRequest, NextResponse } from "next/server";
import { makeSuccess, makeError } from "@/types/api";
import {
  IS_MOCK_MODE,
  LostArkAuthError,
  fetchCharacterProfile,
  fetchCharacterEquipment,
  fetchCharacterGems,
  fetchCharacterEngravings,
  fetchExpeditionCharacters,
} from "@/lib/lostark-api";
import { normalizeCharacterProfile, normalizeSiblings } from "@/lib/normalize";
import { buildRoiCardsV0 } from "@/lib/roi-engine";
import { MOCK_EXPEDITION, MOCK_ROI_CARDS } from "@/lib/mock-data";
import type { ExpeditionData } from "@/types/expedition";

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
      makeSuccess<ExpeditionData>(
        { ...MOCK_EXPEDITION, roiCards: MOCK_ROI_CARDS },
        { source: "mock" }
      )
    );
  }

  // ── 실제 API 호출 ──────────────────────────────────────────────
  const warnings: string[] = [];
  const fetchedAt = new Date().toISOString();

  try {
    // 1. 원정대 캐릭터 목록 조회 (필수)
    const siblingsRes = await fetchExpeditionCharacters(characterName).catch(
      () => null
    );

    if (!siblingsRes) {
      return NextResponse.json(
        makeError(
          "EXPEDITION_NOT_FOUND",
          `'${characterName}'의 원정대 정보를 찾을 수 없습니다.`,
          { source: "lostark-openapi", fetchedAt }
        ),
        { status: 404 }
      );
    }

    if (!siblingsRes.data || siblingsRes.data.length === 0) {
      return NextResponse.json(
        makeError(
          "EXPEDITION_NOT_FOUND",
          `'${characterName}' 원정대에 속한 캐릭터 데이터가 없습니다.`,
          { source: "lostark-openapi", fetchedAt }
        ),
        { status: 404 }
      );
    }

    const allCharacters = normalizeSiblings(siblingsRes.data);
    const topCharacterName = allCharacters[0]?.characterName ?? characterName;

    // 2. 최고 아이템 레벨 캐릭터 상세 조회 (부분 성공 허용)
    let topCharacter = null;
    try {
      const [profileRes, equipRes, gemRes, engravingRes] = await Promise.allSettled([
        fetchCharacterProfile(topCharacterName),
        fetchCharacterEquipment(topCharacterName),
        fetchCharacterGems(topCharacterName),
        fetchCharacterEngravings(topCharacterName),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.data) {
        const equipment =
          equipRes.status === "fulfilled" ? (equipRes.value.data ?? []) : [];
        const gems =
          gemRes.status === "fulfilled" ? (gemRes.value.data?.Gems ?? []) : [];
        const engravings =
          engravingRes.status === "fulfilled" ? (engravingRes.value.data?.Engravings ?? []) : [];
        topCharacter = normalizeCharacterProfile(
          profileRes.value.data,
          equipment,
          gems,
          engravings
        );
      } else {
        warnings.push("대표 캐릭터 상세 정보를 불러오지 못했습니다.");
      }
    } catch {
      warnings.push("대표 캐릭터 상세 정보를 불러오지 못했습니다.");
    }

    const expeditionData: ExpeditionData = {
      representativeName: characterName,
      serverName: allCharacters[0]?.serverName ?? "",
      characters: allCharacters.map((c, i) => ({
        ...c,
        isRepresentative: i === 0,
      })),
      topCharacter,
      totalCharacterCount: allCharacters.length,
      roiCards: buildRoiCardsV0(allCharacters, topCharacter),
    };

    return NextResponse.json(
      makeSuccess<ExpeditionData>(expeditionData, {
        source: "lostark-openapi",
        fetchedAt,
        partial: warnings.length > 0,
        warnings,
      })
    );
  } catch (err) {
    if (err instanceof LostArkAuthError) {
      return NextResponse.json(
        makeError("AUTH_INVALID_KEY", err.message, { source: "lostark-openapi", fetchedAt }),
        { status: 401 }
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      makeError("EXPEDITION_FETCH_ERROR", message, {
        source: "lostark-openapi",
        fetchedAt,
      }),
      { status: 500 }
    );
  }
}
