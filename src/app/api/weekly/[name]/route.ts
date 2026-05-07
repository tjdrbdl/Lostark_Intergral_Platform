import { NextRequest, NextResponse } from "next/server";
import { makeSuccess, makeError } from "@/types/api";
import {
  IS_MOCK_MODE,
  fetchExpeditionCharacters,
} from "@/lib/lostark-api";
import { normalizeSiblings } from "@/lib/normalize";
import { buildWeeklyRoiFollowups } from "@/lib/roi-engine";
import { MOCK_WEEKLY } from "@/lib/mock-data";
import { MOCK_EXPEDITION } from "@/lib/mock-data";
import type { WeeklyData, CharacterWeeklyStatus, WeeklyContent } from "@/types/weekly";

type Params = { params: Promise<{ name: string }> };

// TODO: 아이템 레벨 기준을 환경변수나 설정 파일로 분리
// 제거 기준: 설정 파일 구조 확정 및 관리 방안 합의 후
const GOLD_ELIGIBLE_MIN_ITEM_LEVEL = 1600;

/**
 * 아이템 레벨에 따라 입장 가능한 주간 콘텐츠 목록을 반환
 * TODO: 콘텐츠 목록을 DB 또는 설정 파일에서 관리
 * 제거 기준: 콘텐츠 메타데이터 관리 방안 확정 후
 */
function getAvailableContents(itemLevel: number): WeeklyContent[] {
  const ALL_CONTENTS: WeeklyContent[] = [
    { id: "aegir-nm", name: "에기르 (노말)", category: "레이드", minItemLevel: 1620, maxGates: 4, completed: false, goldReward: 9000 },
    { id: "aegir-hd", name: "에기르 (하드)", category: "레이드", minItemLevel: 1640, maxGates: 4, completed: false, goldReward: 15000 },
    { id: "behemoth", name: "베히모스", category: "레이드", minItemLevel: 1640, maxGates: 2, completed: false, goldReward: 7000 },
    { id: "kazeroth-nm", name: "카제로스 (노말)", category: "레이드", minItemLevel: 1660, maxGates: 4, completed: false, goldReward: 12000 },
    { id: "kazeroth-hd", name: "카제로스 (하드)", category: "레이드", minItemLevel: 1680, maxGates: 4, completed: false, goldReward: 20000 },
  ];
  return ALL_CONTENTS.filter((c) => itemLevel >= c.minItemLevel);
}

function getNextWeeklyReset(): string {
  const now = new Date();
  const day = now.getDay();
  const daysUntilThursday = (4 - day + 7) % 7 || 7;
  const reset = new Date(now);
  reset.setDate(now.getDate() + daysUntilThursday);
  reset.setHours(6, 0, 0, 0);
  return reset.toISOString();
}

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
    const roiFollowups = buildWeeklyRoiFollowups(MOCK_EXPEDITION.characters);
    return NextResponse.json(
      makeSuccess<WeeklyData>(
        { ...MOCK_WEEKLY, roiFollowups },
        { source: "mock" }
      )
    );
  }

  // ── 실제 API 호출 ──────────────────────────────────────────────
  const fetchedAt = new Date().toISOString();

  try {
    const siblingsRes = await fetchExpeditionCharacters(characterName).catch(
      () => null
    );

    if (!siblingsRes) {
      return NextResponse.json(
        makeError(
          "WEEKLY_NOT_FOUND",
          `'${characterName}'의 원정대 정보를 찾을 수 없습니다.`,
          { source: "lostark-openapi", fetchedAt }
        ),
        { status: 404 }
      );
    }

    if (!siblingsRes.data || siblingsRes.data.length === 0) {
      return NextResponse.json(
        makeError(
          "WEEKLY_NOT_FOUND",
          `'${characterName}' 원정대에 속한 캐릭터 데이터가 없습니다.`,
          { source: "lostark-openapi", fetchedAt }
        ),
        { status: 404 }
      );
    }

    const allCharacters = normalizeSiblings(siblingsRes.data);
    const eligibleCharacters = allCharacters.filter(
      (c) => c.itemLevel >= GOLD_ELIGIBLE_MIN_ITEM_LEVEL
    );

    const weeklyCharacters: CharacterWeeklyStatus[] = eligibleCharacters.map(
      (c) => ({
        characterName: c.characterName,
        characterClass: c.characterClass,
        itemLevel: c.itemLevel,
        contents: getAvailableContents(c.itemLevel),
      })
    );

    const weeklyData: WeeklyData = {
      representativeName: characterName,
      weeklyResetAt: getNextWeeklyReset(),
      characters: weeklyCharacters,
      roiFollowups: buildWeeklyRoiFollowups(allCharacters),
    };

    return NextResponse.json(
      makeSuccess<WeeklyData>(weeklyData, {
        source: "lostark-openapi",
        fetchedAt,
      })
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      makeError("WEEKLY_FETCH_ERROR", message, {
        source: "lostark-openapi",
        fetchedAt,
      }),
      { status: 500 }
    );
  }
}
