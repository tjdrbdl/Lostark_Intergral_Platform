import { makeError, makeSuccess, type ApiResponse } from "@/types/api";
import type { CharacterData } from "@/types/character";
import type { ExpeditionData } from "@/types/expedition";
import type { HomeData } from "@/types/home";
import type { SavedData } from "@/types/saved";
import type { CharacterWeeklyStatus, WeeklyContent, WeeklyData } from "@/types/weekly";
import {
  IS_MOCK_MODE,
  LostArkAuthError,
  LostArkNotFoundError,
  LostArkRateLimitError,
  LostArkRequestError,
  LostArkUpstreamError,
  fetchCharacterEngravings,
  fetchCharacterEquipment,
  fetchCharacterGems,
  fetchCharacterProfile,
  fetchExpeditionCharacters,
} from "@/lib/lostark-api";
import { normalizeCharacterProfile, normalizeSiblings } from "@/lib/normalize";
import { buildRoiCardsV0, buildWeeklyRoiFollowups } from "@/lib/roi-engine";
import { savedStoreGetAll } from "@/lib/saved-store";
import { getNextWeeklyReset } from "@/lib/weekly-reset";
import { MOCK_CHARACTER, MOCK_EXPEDITION, MOCK_HOME, MOCK_ROI_CARDS, MOCK_WEEKLY } from "@/lib/mock-data";

const source = "lostark-openapi";
const fetchedAt = () => new Date().toISOString();

export function getHomeData(): ApiResponse<HomeData> {
  if (IS_MOCK_MODE) return makeSuccess(MOCK_HOME, { source: "mock", warnings: ["현재 mock 샘플 데이터를 표시합니다."] });
  return makeSuccess(MOCK_HOME, {
    source: ["fallback", "mock"], fetchedAt: fetchedAt(), partial: true,
    warnings: ["홈 실데이터 소스 미연동: 샘플을 표시합니다."],
  });
}

export function getSavedData(): ApiResponse<SavedData> {
  try {
    return makeSuccess(savedStoreGetAll(), { source: ["memory"], fetchedAt: fetchedAt() });
  } catch (error) {
    return makeError("SAVED_FETCH_ERROR", error instanceof Error ? error.message : "Unknown error", { source: ["memory"] });
  }
}

function failure<T>(error: unknown, notFoundCode: string, at: string): ApiResponse<T> {
  if (error instanceof LostArkAuthError) return makeError("AUTH_INVALID_KEY", error.message, { source, fetchedAt: at });
  if (error instanceof LostArkNotFoundError) return makeError(notFoundCode, "요청한 데이터를 찾을 수 없습니다.", { source, fetchedAt: at });
  if (error instanceof LostArkRateLimitError) return makeError("RATE_LIMITED", error.message, { source, fetchedAt: at });
  if (error instanceof LostArkUpstreamError || error instanceof LostArkRequestError) return makeError("UPSTREAM_UNAVAILABLE", error.message, { source, fetchedAt: at });
  return makeError("UPSTREAM_UNAVAILABLE", "외부 데이터 소스에 일시적으로 연결할 수 없습니다.", { source, fetchedAt: at });
}

function optionalWarning(error: unknown, label: string): string {
  if (error instanceof LostArkRateLimitError) return `${label} 요청이 제한되었습니다.`;
  if (error instanceof LostArkNotFoundError) return `${label} 데이터를 찾을 수 없습니다.`;
  if (error instanceof LostArkUpstreamError || error instanceof LostArkRequestError) return `${label} 외부 데이터 소스를 사용할 수 없습니다.`;
  return `${label} 정보를 불러오지 못했습니다.`;
}

function hasAuthFailure(results: PromiseSettledResult<unknown>[]) {
  return results.find((result) => result.status === "rejected" && result.reason instanceof LostArkAuthError);
}

export async function getCharacterData(name: string): Promise<ApiResponse<CharacterData>> {
  if (IS_MOCK_MODE) return makeSuccess(MOCK_CHARACTER, { source: "mock" });
  const at = fetchedAt();
  try {
    const [profileRes, equipRes, gemRes, engravingRes, siblingRes] = await Promise.allSettled([
      fetchCharacterProfile(name), fetchCharacterEquipment(name), fetchCharacterGems(name),
      fetchCharacterEngravings(name), fetchExpeditionCharacters(name),
    ]);
    const authFailure = hasAuthFailure([profileRes, equipRes, gemRes, engravingRes, siblingRes]);
    if (authFailure?.status === "rejected") return failure(authFailure.reason, "CHARACTER_NOT_FOUND", at);
    if (profileRes.status === "rejected") return failure(profileRes.reason, "CHARACTER_NOT_FOUND", at);
    if (!profileRes.value.data) return makeError("CHARACTER_NOT_FOUND", `캐릭터 '${name}'를 찾을 수 없습니다.`, { source, fetchedAt: at });

    const warnings: string[] = [];
    const optional = [
      [equipRes, "장비"], [gemRes, "보석"], [engravingRes, "각인"], [siblingRes, "원정대 캐릭터 목록"],
    ] as const;
    for (const [result, label] of optional) if (result.status === "rejected") warnings.push(optionalWarning(result.reason, label));
    const equipment = equipRes.status === "fulfilled" ? equipRes.value.data ?? [] : [];
    const gems = gemRes.status === "fulfilled" ? gemRes.value.data?.Gems ?? [] : [];
    const engravings = engravingRes.status === "fulfilled" ? engravingRes.value.data?.Engravings ?? [] : [];
    const siblings = siblingRes.status === "fulfilled" ? normalizeSiblings(siblingRes.value.data) : [];
    return makeSuccess({
      character: normalizeCharacterProfile(profileRes.value.data, equipment, gems, engravings),
      siblings: siblings.map((s) => ({ characterName: s.characterName, characterClass: s.characterClass, itemLevel: s.itemLevel })),
    }, { source, fetchedAt: at, partial: warnings.length > 0, warnings });
  } catch (error) {
    return failure(error, "CHARACTER_NOT_FOUND", at);
  }
}

export async function getExpeditionData(name: string): Promise<ApiResponse<ExpeditionData>> {
  if (IS_MOCK_MODE) return makeSuccess({ ...MOCK_EXPEDITION, roiCards: MOCK_ROI_CARDS }, { source: "mock" });
  const at = fetchedAt();
  try {
    let siblingsRes;
    try {
      siblingsRes = await fetchExpeditionCharacters(name);
    } catch (error) {
      return failure(error, "EXPEDITION_NOT_FOUND", at);
    }
    if (!siblingsRes.data?.length) return makeError("EXPEDITION_NOT_FOUND", `'${name}'의 원정대 정보를 찾을 수 없습니다.`, { source, fetchedAt: at });
    const allCharacters = normalizeSiblings(siblingsRes.data);
    const topName = allCharacters[0]?.characterName ?? name;
    const [profileRes, equipRes, gemRes, engravingRes] = await Promise.allSettled([
      fetchCharacterProfile(topName), fetchCharacterEquipment(topName), fetchCharacterGems(topName), fetchCharacterEngravings(topName),
    ]);
    const authFailure = hasAuthFailure([profileRes, equipRes, gemRes, engravingRes]);
    if (authFailure?.status === "rejected") return failure(authFailure.reason, "EXPEDITION_NOT_FOUND", at);
    const warnings: string[] = [];
    for (const [result, label] of [[profileRes, "대표 캐릭터"], [equipRes, "대표 캐릭터 장비"], [gemRes, "대표 캐릭터 보석"], [engravingRes, "대표 캐릭터 각인"]] as const) {
      if (result.status === "rejected") warnings.push(optionalWarning(result.reason, label));
    }
    let topCharacter = null;
    if (profileRes.status === "fulfilled" && profileRes.value.data) {
      topCharacter = normalizeCharacterProfile(profileRes.value.data, equipRes.status === "fulfilled" ? equipRes.value.data ?? [] : [], gemRes.status === "fulfilled" ? gemRes.value.data?.Gems ?? [] : [], engravingRes.status === "fulfilled" ? engravingRes.value.data?.Engravings ?? [] : []);
    } else if (profileRes.status === "fulfilled" && !profileRes.value.data) {
      warnings.push("대표 캐릭터 데이터를 찾을 수 없습니다.");
    }
    return makeSuccess({ representativeName: name, serverName: allCharacters[0]?.serverName ?? "", characters: allCharacters.map((c, i) => ({ ...c, isRepresentative: i === 0 })), topCharacter, totalCharacterCount: allCharacters.length, roiCards: buildRoiCardsV0(allCharacters, topCharacter) }, { source, fetchedAt: at, partial: warnings.length > 0, warnings });
  } catch (error) {
    return failure(error, "EXPEDITION_NOT_FOUND", at);
  }
}

const GOLD_ELIGIBLE_MIN_ITEM_LEVEL = 1600;
function getAvailableContents(itemLevel: number): WeeklyContent[] {
  const contents: WeeklyContent[] = [
    { id: "aegir-nm", name: "에기르 (노말)", category: "레이드", minItemLevel: 1620, maxGates: 4, completed: false, goldReward: 9000 },
    { id: "aegir-hd", name: "에기르 (하드)", category: "레이드", minItemLevel: 1640, maxGates: 4, completed: false, goldReward: 15000 },
    { id: "behemoth", name: "베히모스", category: "레이드", minItemLevel: 1640, maxGates: 2, completed: false, goldReward: 7000 },
    { id: "kazeroth-nm", name: "카제로스 (노말)", category: "레이드", minItemLevel: 1660, maxGates: 4, completed: false, goldReward: 12000 },
    { id: "kazeroth-hd", name: "카제로스 (하드)", category: "레이드", minItemLevel: 1680, maxGates: 4, completed: false, goldReward: 20000 },
  ];
  return contents.filter((content) => itemLevel >= content.minItemLevel);
}

export async function getWeeklyData(name: string): Promise<ApiResponse<WeeklyData>> {
  if (IS_MOCK_MODE) return makeSuccess({ ...MOCK_WEEKLY, roiFollowups: buildWeeklyRoiFollowups(MOCK_EXPEDITION.characters) }, { source: "mock" });
  const at = fetchedAt();
  try {
    let siblingsRes;
    try {
      siblingsRes = await fetchExpeditionCharacters(name);
    } catch (error) {
      return failure(error, "WEEKLY_NOT_FOUND", at);
    }
    if (!siblingsRes.data?.length) return makeError("WEEKLY_NOT_FOUND", `'${name}'의 원정대 정보를 찾을 수 없습니다.`, { source, fetchedAt: at });
    const allCharacters = normalizeSiblings(siblingsRes.data);
    const characters: CharacterWeeklyStatus[] = allCharacters.filter((c) => c.itemLevel >= GOLD_ELIGIBLE_MIN_ITEM_LEVEL).map((c) => ({ characterName: c.characterName, characterClass: c.characterClass, itemLevel: c.itemLevel, contents: getAvailableContents(c.itemLevel) }));
    return makeSuccess({ representativeName: name, weeklyResetAt: getNextWeeklyReset(), characters, roiFollowups: buildWeeklyRoiFollowups(allCharacters) }, { source, fetchedAt: at });
  } catch (error) {
    return failure(error, "WEEKLY_NOT_FOUND", at);
  }
}
