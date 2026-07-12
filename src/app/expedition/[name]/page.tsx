import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ExpeditionData } from "@/types/expedition";
import type { SavedData } from "@/types/saved";
import ExpeditionOverview from "@/components/expedition/ExpeditionOverview";
import RoiCardList from "@/components/expedition/RoiCardList";
import SpecSummary from "@/components/character/SpecSummary";
import ErrorBanner from "@/components/ui/ErrorBanner";
import EmptyState from "@/components/ui/EmptyState";
import PartialWarning from "@/components/ui/PartialWarning";
import SaveButton from "@/components/SaveButton";
import Link from "next/link";
import { getExpeditionData, getSavedData } from "@/lib/server-data";

type Props = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `${decodeURIComponent(name)} 원정대 · LostArk Hub`,
  };
}

export default async function ExpeditionPage({ params }: Props) {
  const { name } = await params;
  const characterName = decodeURIComponent(name);
  const [result, savedResult] = await Promise.all([
    getExpeditionData(characterName),
    getSavedData(),
  ]);

  if (!result.success && result.error?.code === "EXPEDITION_NOT_FOUND") {
    notFound();
  }

  if (!result.success) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-white">{characterName} 원정대</h1>
        <ErrorBanner
          title="원정대 정보를 불러오지 못했습니다"
          message={result.error?.message ?? "알 수 없는 오류"}
        />
      </div>
    );
  }

  const { data } = result;
  const characterNames = new Set(data.characters.map((c) => c.characterName));

  const savedItems = savedResult.success
    ? savedResult.data.items.filter((item) => {
        if (item.type === "expedition") {
          return item.key === data.representativeName;
        }
        if (item.type === "character") {
          return characterNames.has(item.key);
        }
        return false;
      })
    : [];

  const savedItemIds = new Set(savedItems.map((item) => item.id));
  const changeEvents = savedResult.success
    ? savedResult.data.changeEvents.filter((event) => savedItemIds.has(event.itemId))
    : [];

  const mergedWarnings = [...result.warnings];
  if (!savedResult.success) {
    mergedWarnings.push("저장/변경 추적 정보를 불러오지 못했습니다.");
  }
  const mergedStale = result.stale || (savedResult.success ? savedResult.stale : false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">
          {data.representativeName} 원정대
        </h1>
        <div className="flex items-center gap-2">
          <SaveButton
            savedItem={
              savedResult.success
                ? (savedResult.data.items.find(
                    (i) => i.type === "expedition" && i.key === data.representativeName
                  ) ?? null)
                : null
            }
            target={{
              type: "expedition",
              key: data.representativeName,
              label: `${data.representativeName} 원정대`,
            }}
          />
          <Link
            href={`/weekly/${encodeURIComponent(characterName)}`}
            className="rounded-lg border border-lostark-border bg-lostark-panel px-4 py-2 text-sm text-gray-300 hover:border-lostark-gold transition-colors"
          >
            주간 체크 →
          </Link>
        </div>
      </div>

      <PartialWarning warnings={mergedWarnings} stale={mergedStale} />

      {/* 캐릭터 목록 */}
      <ExpeditionOverview data={data} />

      {/* ROI 추천 카드 */}
      {data.roiCards && data.roiCards.length > 0 && (
        <RoiCardList cards={data.roiCards} />
      )}

      {/* 최고 캐릭터 스펙 미리보기 */}
      {data.topCharacter && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">
            대표 캐릭터 스펙
          </h2>
          <SpecSummary character={data.topCharacter} />
        </section>
      )}

      {/* 저장 목록 + 변경 추적 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">
          저장/변경 추적
        </h2>

        {!savedResult.success && (
          <EmptyState
            message="저장/변경 데이터를 불러올 수 없습니다."
            icon="⚠"
          />
        )}

        {savedResult.success && savedItems.length === 0 && changeEvents.length === 0 && (
          <EmptyState
            message="이 원정대와 연결된 저장 항목/변경 이력이 없습니다."
            icon="📭"
          />
        )}

        {savedItems.length > 0 && (
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {savedItems.map((item) => {
              const href =
                item.type === "expedition"
                  ? `/expedition/${encodeURIComponent(item.key)}`
                  : `/character/${encodeURIComponent(item.key)}`;
              return (
                <Link
                  key={item.id}
                  href={href}
                  className="flex items-center justify-between rounded-lg border border-lostark-border bg-lostark-panel px-4 py-3 text-sm transition-colors hover:border-lostark-gold"
                >
                  <div className="flex items-center gap-2">
                    {item.pinned && <span className="text-lostark-gold">📌</span>}
                    <span className="font-semibold text-white">{item.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {item.type === "expedition" ? "원정대" : "캐릭터"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {changeEvents.length > 0 && (
          <ul className="space-y-2">
            {changeEvents.map((event) => (
              <li
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-lostark-border bg-lostark-panel px-4 py-3 text-sm"
              >
                <span
                  className={`mt-0.5 rounded px-1.5 py-0.5 text-xs font-semibold ${
                    event.severity === "high"
                      ? "bg-red-800/60 text-red-300"
                      : event.severity === "mid"
                      ? "bg-yellow-800/60 text-yellow-300"
                      : "bg-blue-800/60 text-blue-300"
                  }`}
                >
                  {event.eventType === "spec_change"
                    ? "스펙"
                    : event.eventType === "weekly_change"
                    ? "숙제"
                    : event.eventType === "market_change"
                    ? "시장"
                    : "데이터"}
                </span>
                <div className="flex-1">
                  <p className="text-white">{event.summary}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {new Date(event.detectedAt).toLocaleString("ko-KR")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
