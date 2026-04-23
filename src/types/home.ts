/** GET /api/home 응답 데이터 */
export interface HomeData {
  /** 공지 / 점검 배너. 비어있으면 배너 없음 */
  notices: Notice[];
  /** 이번 주 추천 레이드 (최대 3개) */
  featuredContents: FeaturedContent[];
}

export interface Notice {
  id: string;
  title: string;
  type: "maintenance" | "update" | "event";
  /** ISO 8601 */
  startAt: string;
  endAt: string | null;
  url: string | null;
}

export interface FeaturedContent {
  id: string;
  name: string;
  imageUrl: string | null;
  /** 권장 아이템 레벨 */
  recommendedItemLevel: number;
  category: string;
}
