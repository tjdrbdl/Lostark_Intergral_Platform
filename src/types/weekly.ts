import type { RoiCard } from "./roi";

/** 개별 주간 콘텐츠 항목 */
export interface WeeklyContent {
  id: string;
  name: string;
  category: "레이드" | "가디언토벌" | "어비스던전" | "기타";
  /** 입장 가능 최소 아이템 레벨 */
  minItemLevel: number;
  /** 최대 참여 횟수/관문 수 */
  maxGates: number;
  /** 완료 여부 (서버 데이터 반영 시 사용. mock에서는 false 고정) */
  completed: boolean;
  /** 골드 보상 */
  goldReward: number | null;
}

/** 캐릭터별 주간 체크 현황 */
export interface CharacterWeeklyStatus {
  characterName: string;
  characterClass: string;
  itemLevel: number;
  contents: WeeklyContent[];
}

/** GET /api/weekly/:name 응답 데이터 */
export interface WeeklyData {
  /** 조회한 캐릭터 이름 */
  representativeName: string;
  /** 원정대 내 아이템 레벨 1600 이상 캐릭터만 포함 (골드 획득 기준) */
  // TODO: 기준 레벨을 환경변수 또는 설정 파일로 분리
  characters: CharacterWeeklyStatus[];
  /** 주간 리셋 기준 시각 (ISO 8601) */
  weeklyResetAt: string;
  /** ROI 후속 후보 카드 목록 */
  roiFollowups: RoiCard[];
}
