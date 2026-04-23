/** 저장 항목 */
export interface SavedItem {
  id: string;
  type: "character" | "expedition" | "query";
  key: string;
  label: string;
  pinned: boolean;
  tags: string[];
  lastSeenAt: string | null;
}

/** 변경 추적 이벤트 */
export interface ChangeEvent {
  id: string;
  itemId: string;
  eventType: "spec_change" | "weekly_change" | "market_change" | "data_delay";
  summary: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  severity: "low" | "mid" | "high";
  detectedAt: string;
}

/** GET /api/saved 응답 데이터 */
export interface SavedData {
  items: SavedItem[];
  changeEvents: ChangeEvent[];
}
