import type { ExpeditionCharacterSummary } from "@/types/expedition";
import type { CharacterSpec } from "@/types/character";
import type { RoiCard } from "@/types/roi";

interface NextMilestone {
  level: number;
  rewardGold: number;
  contentName: string;
}

const MILESTONES: NextMilestone[] = [
  { level: 1620, rewardGold: 9000, contentName: "에기르 (노말)" },
  { level: 1640, rewardGold: 22000, contentName: "에기르 (하드) + 베히모스" },
  { level: 1660, rewardGold: 12000, contentName: "카제로스 (노말)" },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function inferConfidence(levelGap: number): RoiCard["confidence"] {
  if (levelGap <= 10) return "high";
  if (levelGap <= 30) return "mid";
  return "low";
}

function buildLevelUpCard(character: ExpeditionCharacterSummary): RoiCard | null {
  const next = MILESTONES.find((m) => character.itemLevel < m.level);
  if (!next) return null;

  const levelGap = next.level - character.itemLevel;
  const estimatedCostGold = Math.max(5000, levelGap * 9000);
  const paybackWeeks = estimatedCostGold / next.rewardGold;
  const roiScore = clamp(Math.round(95 - paybackWeeks * 12), 35, 90);

  return {
    id: `roi-levelup-${character.characterName}-${next.level}`,
    targetType: "character",
    targetKey: character.characterName,
    title: `${character.characterName} ${next.level} 달성 후보`,
    reason: `${next.level} 달성 시 ${next.contentName} 진입 가능`,
    estimatedCost: {
      gold: estimatedCostGold,
      time: levelGap <= 8 ? "low" : levelGap <= 20 ? "mid" : "high",
    },
    expectedImpact: `주간 골드 +${next.rewardGold.toLocaleString()} 예상`,
    roiScore,
    confidence: inferConfidence(levelGap),
    actions: [`재련 우선순위 점검`, `${next.level} 도달까지 +${levelGap} 단계`],
  };
}

function buildGemCard(topCharacter: CharacterSpec | null): RoiCard | null {
  if (!topCharacter || topCharacter.gems.length === 0) return null;
  const minGemLevel = Math.min(...topCharacter.gems.map((g) => g.level));
  if (minGemLevel >= 9) return null;

  const gap = 9 - minGemLevel;
  const estimatedCostGold = Math.max(8000, gap * 12000);
  const roiScore = clamp(68 - gap * 4, 45, 72);

  return {
    id: `roi-gem-${topCharacter.characterName}`,
    targetType: "character",
    targetKey: topCharacter.characterName,
    title: `${topCharacter.characterName} 보석 저점 보강`,
    reason: `최저 보석 레벨(${minGemLevel}) 구간이 있어 딜 사이클 효율 저하 가능`,
    estimatedCost: {
      gold: estimatedCostGold,
      time: gap <= 1 ? "low" : "mid",
    },
    expectedImpact: "핵심 스킬 기대 효율 개선",
    roiScore,
    confidence: gap <= 1 ? "mid" : "low",
    actions: ["저레벨 보석 우선 상향", "핵심 스킬 기준으로 정렬 점검"],
  };
}

/**
 * ROI Engine v0
 * - 규칙 기반으로 실행 후보를 생성한다.
 * - 결과는 정답이 아니라 의사결정 후보이며 최대 3개만 반환한다.
 */
export function buildRoiCardsV0(
  characters: ExpeditionCharacterSummary[],
  topCharacter: CharacterSpec | null
): RoiCard[] {
  const levelCards = characters
    .map(buildLevelUpCard)
    .filter((card): card is RoiCard => card !== null);

  const gemCard = buildGemCard(topCharacter);
  const allCards = gemCard ? [...levelCards, gemCard] : levelCards;

  if (allCards.length === 0) {
    return [
      {
        id: "roi-fallback-data-refresh",
        targetType: "expedition",
        targetKey: characters[0]?.characterName ?? "unknown",
        title: "추가 데이터 확인 후보",
        reason: "현재 데이터 기준으로 즉시 우선순위가 높은 후보가 확인되지 않았습니다.",
        estimatedCost: { gold: 0, time: "low" },
        expectedImpact: "다음 조회 시 추천 정확도 개선",
        roiScore: 40,
        confidence: "low",
        actions: ["캐릭터 상태 업데이트 후 재조회"],
      },
    ];
  }

  return allCards.sort((a, b) => b.roiScore - a.roiScore).slice(0, 3);
}

/**
 * 주간 보조 페이지용 ROI 후속 후보
 * - 주간 콘텐츠 입장 가능 여부 기준으로 병목 캐릭터 식별
 * - 최대 2개 반환
 */
export function buildWeeklyRoiFollowups(
  characters: ExpeditionCharacterSummary[]
): RoiCard[] {
  // 레벨업 카드 중 주간 콘텐츠 접근 해금에 가까운 후보만 필터
  const followups = characters
    .map(buildLevelUpCard)
    .filter((card): card is RoiCard => card !== null)
    .sort((a, b) => b.roiScore - a.roiScore)
    .slice(0, 2);

  return followups;
}

