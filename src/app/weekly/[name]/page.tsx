import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ApiResponse } from "@/types/api";
import type { WeeklyData } from "@/types/weekly";
import type { SavedData } from "@/types/saved";
import WeeklyChecklist from "@/components/weekly/WeeklyChecklist";
import RoiCardList from "@/components/expedition/RoiCardList";
import ErrorBanner from "@/components/ui/ErrorBanner";
import EmptyState from "@/components/ui/EmptyState";
import PartialWarning from "@/components/ui/PartialWarning";
import Link from "next/link";

type Props = { params: Promise<{ name: string }> };

async function getWeeklyData(name: string): Promise<ApiResponse<WeeklyData>> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/weekly/${encodeURIComponent(name)}`,
    { next: { revalidate: 60 } }
  );
  return res.json();
}

async function getSavedData(): Promise<ApiResponse<SavedData>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/saved`, { cache: "no-store" });
    return res.json();
  } catch {
    return {
      success: false,
      data: null,
      error: { code: "SAVED_FETCH_ERROR", message: "저장/변경 정보를 불러올 수 없습니다." },
      source: ["unknown"],
      fetchedAt: null,
      cachedAt: null,
      stale: false,
      partial: false,
      warnings: [],
    };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `${decodeURIComponent(name)} 주간체크 · LostArk Hub`,
  };
}

export default async function WeeklyPage({ params }: Props) {
  const { name } = await params;
  const characterName = decodeURIComponent(name);
  const [result, savedResult] = await Promise.all([
    getWeeklyData(characterName),
    getSavedData(),
  ]);

  if (!result.success && result.error?.code === "WEEKLY_NOT_FOUND") {
    notFound();
  }

  if (!result.success) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-white">{characterName} 주간 체크</h1>
        <ErrorBanner
          title="주간 정보를 불러오지 못했습니다"
          message={result.error?.message ?? "알 수 없는 오류"}
        />
      </div>
    );
  }

  const { data } = result;
  const characterNames = new Set(data.characters.map((c) => c.characterName));

  const relatedItemIds = savedResult.success
    ? new Set(
        savedResult.data.items
          .filter((item) => {
            if (item.type === "expedition") {
              return item.key === data.representativeName;
            }
            if (item.type === "character") {
              return characterNames.has(item.key);
            }
            return false;
          })
          .map((item) => item.id)
      )
    : new Set<string>();

  const relatedChanges = savedResult.success
    ? savedResult.data.changeEvents.filter((event) =>
        relatedItemIds.has(event.itemId)
      )
    : [];

  const mergedWarnings = [...result.warnings];
  if (!savedResult.success) {
    mergedWarnings.push("저장/변경 추적 정보를 불러오지 못했습니다.");
  }
  const mergedStale = result.stale || (savedResult.success ? savedResult.stale : false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {data.representativeName} 주간 체크
        </h1>
        <Link
          href={`/expedition/${encodeURIComponent(characterName)}`}
          className="rounded-lg border border-lostark-border bg-lostark-panel px-4 py-2 text-sm text-gray-300 hover:border-lostark-gold transition-colors"
        >
          원정대 보기 →
        </Link>
      </div>

      <PartialWarning warnings={mergedWarnings} stale={mergedStale} />

      {data.characters.length === 0 ? (
        <EmptyState
          message="골드 획득 가능한 캐릭터가 없습니다. (최소 1600 ℓ 이상)"
          icon="🪙"
        />
      ) : (
        <WeeklyChecklist data={data} />
      )}

      {/* ROI 후속 후보 카드 */}
      {data.roiFollowups && data.roiFollowups.length > 0 && (
        <RoiCardList cards={data.roiFollowups} />
      )}

      {/* 최근 주간 변경 이력 */}
      {relatedChanges.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">
            최근 주간 변경 사항
          </h2>
          <ul className="space-y-2">
            {relatedChanges.map((event) => (
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
        </section>
      )}
    </div>
  );
}
