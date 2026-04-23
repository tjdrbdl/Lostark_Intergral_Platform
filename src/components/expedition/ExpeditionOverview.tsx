import Link from "next/link";
import type { ExpeditionData } from "@/types/expedition";

interface ExpeditionOverviewProps {
  data: ExpeditionData;
}

export default function ExpeditionOverview({ data }: ExpeditionOverviewProps) {
  const totalGoldEstimate = 0; // TODO: 주간 골드 합산 계산 (weekly 연동 후 구현)

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="rounded-xl border border-lostark-border bg-lostark-panel p-4">
        <p className="text-sm text-gray-400">{data.serverName} 서버</p>
        <p className="text-lg font-bold text-white">{data.representativeName} 원정대</p>
        <p className="mt-1 text-sm text-gray-400">
          보유 캐릭터 {data.totalCharacterCount}개
        </p>
        {totalGoldEstimate > 0 && (
          <p className="mt-1 text-sm text-lostark-gold">
            주간 예상 골드: {totalGoldEstimate.toLocaleString()} G
          </p>
        )}
      </div>

      {/* 캐릭터 목록 */}
      <ul className="space-y-2">
        {data.characters.map((char) => (
          <li key={char.characterName}>
            <Link
              href={`/character/${encodeURIComponent(char.characterName)}`}
              className="flex items-center justify-between rounded-lg border border-lostark-border bg-lostark-panel px-4 py-3 hover:border-lostark-gold transition-colors"
            >
              <div className="flex items-center gap-3">
                {char.isRepresentative && (
                  <span className="rounded bg-lostark-gold px-1.5 py-0.5 text-xs font-bold text-lostark-dark">
                    대표
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {char.characterName}
                  </p>
                  <p className="text-xs text-gray-400">{char.characterClass}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-lostark-gold">
                {char.itemLevel.toLocaleString()} ℓ
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
