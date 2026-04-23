/** ROI 추천 카드 */
export interface RoiCard {
  id: string;
  targetType: "character" | "expedition";
  targetKey: string;
  title: string;
  reason: string;
  estimatedCost: {
    gold: number;
    time: "low" | "mid" | "high";
  };
  expectedImpact: string;
  roiScore: number;
  confidence: "low" | "mid" | "high";
  actions: string[];
}
