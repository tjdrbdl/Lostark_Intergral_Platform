/** 캐릭터 장비 아이템 */
export interface EquipmentItem {
  type: string;
  name: string;
  tier: number;
  level: number;
  quality: number;
  /** 연마 효과 등 추가 옵션 */
  extraOptions?: string[];
}

/** 보석 */
export interface Gem {
  level: number;
  type: "멸화" | "홍염" | string;
  skill: string;
  effect: string;
}

/** 각인 */
export interface Engraving {
  name: string;
  level: number;
}

/** 캐릭터 단일 스펙 요약 */
export interface CharacterSpec {
  characterName: string;
  serverName: string;
  characterClass: string;
  characterLevel: number;
  itemLevel: number;
  /** 대표 이미지 URL */
  thumbnailUrl: string | null;
  equipment: EquipmentItem[];
  gems: Gem[];
  engravings: Engraving[];
  /** 전투 특성 (치특, 신속, 제압 등) */
  stats: Record<string, number>;
}

/** GET /api/character/:name 응답 데이터 */
export interface CharacterData {
  character: CharacterSpec;
  /** 같은 원정대의 다른 캐릭터 목록 (미리보기용) */
  siblings: Pick<CharacterSpec, "characterName" | "characterClass" | "itemLevel">[];
}
