/**
 * 로스트아크 Open API 원시 응답 → 내부 표준 스키마 정규화
 * Agent.md 원칙 3: 백엔드는 외부 응답을 내부 표준 스키마로 정규화한다.
 */

import type {
  LostArkCharacterProfile,
  LostArkEquipment,
  LostArkGem,
  LostArkEngraving,
  LostArkSibling,
} from "./lostark-api";
import type { CharacterSpec, EquipmentItem, Gem, Engraving } from "@/types/character";
import type { ExpeditionCharacterSummary } from "@/types/expedition";

/** "1,620.00" → 1620 */
function parseItemLevel(raw: string): number {
  return Math.floor(parseFloat(raw.replace(/,/g, "")));
}

export function normalizeCharacterProfile(
  profile: LostArkCharacterProfile,
  equipment: LostArkEquipment[],
  gems: LostArkGem[],
  engravings: LostArkEngraving[]
): CharacterSpec {
  return {
    characterName: profile.CharacterName,
    serverName: profile.ServerName,
    characterClass: profile.CharacterClassName,
    characterLevel: profile.CharacterLevel,
    itemLevel: parseItemLevel(profile.ItemAvgLevel),
    thumbnailUrl: profile.CharacterImage ?? null,
    equipment: normalizeEquipment(equipment),
    gems: normalizeGems(gems),
    engravings: normalizeEngravings(engravings),
    // TODO: 전투 특성은 별도 엔드포인트 필요. 현재 빈 객체로 반환.
    // 제거 기준: /armories/characters/:name/stats 연동 완료 시
    stats: {},
  };
}

function normalizeEquipment(items: LostArkEquipment[]): EquipmentItem[] {
  return items.map((item) => {
    // 티어/레벨은 Tooltip JSON 파싱이 필요하나 현재는 추정값 반환
    // TODO: Tooltip 필드 파싱 후 정확한 값 추출
    return {
      type: item.Type,
      name: item.Name,
      tier: inferTierFromGrade(item.Grade),
      level: 0, // TODO: Tooltip 파싱 시 교체
      quality: 0, // TODO: Tooltip 파싱 시 교체
    };
  });
}

function inferTierFromGrade(grade: string): number {
  // TODO: 실제 Grade→Tier 매핑은 게임 데이터 확인 필요
  if (grade.includes("에스더")) return 3;
  if (grade.includes("유물")) return 3;
  if (grade.includes("고대")) return 3;
  if (grade.includes("영웅")) return 2;
  return 1;
}

function normalizeGems(gems: LostArkGem[]): Gem[] {
  return gems.map((gem) => ({
    level: gem.Level,
    type: gem.Name.includes("홍염") ? "홍염" : "멸화",
    skill: "", // TODO: Tooltip 파싱 시 교체
    effect: gem.Name,
  }));
}

function normalizeEngravings(engravings: LostArkEngraving[]): Engraving[] {
  return engravings.map((e) => ({
    name: e.Name,
    level: e.Level,
  }));
}

export function normalizeSiblings(
  siblings: LostArkSibling[]
): ExpeditionCharacterSummary[] {
  return siblings
    .map((s) => ({
      characterName: s.CharacterName,
      characterClass: s.CharacterClassName,
      itemLevel: parseItemLevel(s.ItemAvgLevel),
      serverName: s.ServerName,
      isRepresentative: false,
    }))
    .sort((a, b) => b.itemLevel - a.itemLevel);
}
