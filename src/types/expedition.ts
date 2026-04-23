import type { CharacterSpec } from "./character";
import type { RoiCard } from "./roi";

/** 원정대 소속 캐릭터 요약 */
export interface ExpeditionCharacterSummary {
  characterName: string;
  characterClass: string;
  itemLevel: number;
  serverName: string;
  isRepresentative: boolean;
}

/** GET /api/expedition/:name 응답 데이터 */
export interface ExpeditionData {
  /** 원정대 대표 캐릭터 이름 */
  representativeName: string;
  serverName: string;
  /** 전체 보유 캐릭터 목록 (아이템 레벨 내림차순) */
  characters: ExpeditionCharacterSummary[];
  /** 최고 아이템 레벨 캐릭터 상세 */
  topCharacter: CharacterSpec | null;
  /** 원정대 보유 총 캐릭터 수 */
  totalCharacterCount: number;
  /** ROI 추천 카드 목록 */
  roiCards: RoiCard[];
}
