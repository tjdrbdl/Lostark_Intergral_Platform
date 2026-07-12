import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { CharacterData } from "@/types/character";
import type { SavedData } from "@/types/saved";
import SpecSummary from "@/components/character/SpecSummary";
import ErrorBanner from "@/components/ui/ErrorBanner";
import PartialWarning from "@/components/ui/PartialWarning";
import SaveButton from "@/components/SaveButton";
import Link from "next/link";
import { getCharacterData, getSavedData } from "@/lib/server-data";

type Props = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `${decodeURIComponent(name)} · LostArk Hub`,
  };
}

export default async function CharacterPage({ params }: Props) {
  const { name } = await params;
  const characterName = decodeURIComponent(name);
  const [result, savedResult] = await Promise.all([
    getCharacterData(characterName),
    getSavedData(),
  ]);

  // 404 처리
  if (!result.success && result.error?.code === "CHARACTER_NOT_FOUND") {
    notFound();
  }

  // 전체 실패
  if (!result.success) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-white">{characterName}</h1>
        <ErrorBanner
          title="캐릭터 정보를 불러오지 못했습니다"
          message={result.error?.message ?? "알 수 없는 오류"}
        />
      </div>
    );
  }

  const { data } = result;

  // 이 캐릭터 관련 변경 이벤트 필터
  const relatedChanges = savedResult.success
    ? savedResult.data.changeEvents.filter((event) =>
        savedResult.data.items.some(
          (item) => item.id === event.itemId && item.key === characterName
        )
      )
    : [];

  const mergedWarnings = [...result.warnings];
  if (!savedResult.success) {
    mergedWarnings.push("저장/변경 추적 정보를 불러오지 못했습니다.");
  }
  const mergedStale = result.stale || (savedResult.success ? savedResult.stale : false);

  return (
    <div className="space-y-6">
      {/* 제목 + 저장 버튼 */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">{data.character.characterName}</h1>
        <SaveButton
          savedItem={
            savedResult.success
              ? (savedResult.data.items.find(
                  (i) => i.type === "character" && i.key === characterName
                ) ?? null)
              : null
          }
          target={{
            type: "character",
            key: characterName,
            label: characterName,
          }}
        />
      </div>

      {/* 부분 성공 경고 */}
      <PartialWarning warnings={mergedWarnings} stale={mergedStale} />

      {/* 스펙 요약 */}
      <SpecSummary character={data.character} />

      {/* 같은 원정대 캐릭터 */}
      {data.siblings.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">
            같은 원정대
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.siblings.map((s) => (
              <Link
                key={s.characterName}
                href={`/character/${encodeURIComponent(s.characterName)}`}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  s.characterName === characterName
                    ? "border-lostark-gold bg-lostark-gold/10 text-lostark-gold"
                    : "border-lostark-border bg-lostark-panel text-gray-300 hover:border-lostark-gold"
                }`}
              >
                <span className="font-semibold">{s.characterName}</span>
                <span className="ml-2 text-xs text-gray-400">{s.characterClass}</span>
                <span className="ml-2 text-xs text-lostark-gold">
                  {s.itemLevel.toLocaleString()} ℓ
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 최근 변경 이력 */}
      {relatedChanges.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">
            최근 변경 사항
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

      {/* 빠른 이동 */}
      <div className="flex gap-3 pt-2">
        <Link
          href={`/expedition/${encodeURIComponent(characterName)}`}
          className="rounded-lg border border-lostark-border bg-lostark-panel px-4 py-2 text-sm text-gray-300 hover:border-lostark-gold transition-colors"
        >
          원정대 보기 →
        </Link>
        <Link
          href={`/weekly/${encodeURIComponent(characterName)}`}
          className="rounded-lg border border-lostark-border bg-lostark-panel px-4 py-2 text-sm text-gray-300 hover:border-lostark-gold transition-colors"
        >
          주간 체크 →
        </Link>
      </div>
    </div>
  );
}
