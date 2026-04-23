import type { RoiCard } from "@/types/roi";
import Link from "next/link";

interface RoiCardListProps {
  cards: RoiCard[];
}

export default function RoiCardList({ cards }: RoiCardListProps) {
  if (cards.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">
        스펙업 실행 후보
      </h2>
      <p className="mb-4 text-xs text-gray-500">
        규칙 기반 분석 결과입니다. 정답이 아닌 의사결정 보조 지표로 활용하세요.
      </p>
      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-lostark-border bg-lostark-panel p-5 transition-colors hover:border-lostark-gold/50"
          >
            {/* 헤더 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{card.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{card.reason}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    card.roiScore >= 80
                      ? "bg-green-800/60 text-green-300"
                      : card.roiScore >= 60
                      ? "bg-yellow-800/60 text-yellow-300"
                      : "bg-gray-700/60 text-gray-300"
                  }`}
                >
                  ROI {card.roiScore}
                </span>
                <span
                  className={`text-xs ${
                    card.confidence === "high"
                      ? "text-green-400"
                      : card.confidence === "mid"
                      ? "text-yellow-400"
                      : "text-gray-500"
                  }`}
                >
                  신뢰도 {card.confidence === "high" ? "높음" : card.confidence === "mid" ? "보통" : "낮음"}
                </span>
              </div>
            </div>

            {/* 비용/효과 */}
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-500">예상 비용: </span>
                <span className="text-lostark-gold">
                  {card.estimatedCost.gold.toLocaleString()} G
                </span>
                <span className="ml-1 text-xs text-gray-500">
                  ({card.estimatedCost.time === "low" ? "단시간" : card.estimatedCost.time === "mid" ? "보통" : "장시간"})
                </span>
              </div>
              <div>
                <span className="text-gray-500">기대 효과: </span>
                <span className="text-white">{card.expectedImpact}</span>
              </div>
            </div>

            {/* 액션 */}
            {card.actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {card.actions.map((action) => (
                  <span
                    key={action}
                    className="rounded-md bg-lostark-navy px-2.5 py-1 text-xs text-gray-300"
                  >
                    {action}
                  </span>
                ))}
              </div>
            )}

            {/* 캐릭터 상세 링크 */}
            <div className="mt-3">
              <Link
                href={`/character/${encodeURIComponent(card.targetKey)}`}
                className="text-xs text-lostark-gold hover:underline"
              >
                {card.targetKey} 상세 보기 →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
