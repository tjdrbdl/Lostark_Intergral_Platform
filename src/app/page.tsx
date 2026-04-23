import SearchBar from "@/components/SearchBar";
import type { HomeData } from "@/types/home";
import type { SavedData } from "@/types/saved";
import type { ApiResponse } from "@/types/api";
import ErrorBanner from "@/components/ui/ErrorBanner";
import EmptyState from "@/components/ui/EmptyState";
import PartialWarning from "@/components/ui/PartialWarning";
import Link from "next/link";

async function getHomeData(): Promise<ApiResponse<HomeData>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/home`, { next: { revalidate: 300 } });
    return res.json();
  } catch {
    return {
      success: false,
      data: null,
      error: { code: "HOME_FETCH_ERROR", message: "홈 데이터를 불러올 수 없습니다." },
      source: ["unknown"],
      fetchedAt: null,
      cachedAt: null,
      stale: false,
      partial: false,
      warnings: [],
    };
  }
}

async function getSavedData(): Promise<ApiResponse<SavedData>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/saved`, { next: { revalidate: 60 } });
    return res.json();
  } catch {
    return {
      success: false,
      data: null,
      error: { code: "SAVED_FETCH_ERROR", message: "저장 목록을 불러올 수 없습니다." },
      source: ["unknown"],
      fetchedAt: null,
      cachedAt: null,
      stale: false,
      partial: false,
      warnings: [],
    };
  }
}

export default async function HomePage() {
  const [homeResult, savedResult] = await Promise.all([
    getHomeData(),
    getSavedData(),
  ]);

  const homeData = homeResult.success ? homeResult.data : null;
  const savedData = savedResult.success ? savedResult.data : null;

  // partial 판단: 일부만 성공
  const warnings: string[] = [];
  if (!homeResult.success) warnings.push("홈 데이터 일부를 불러오지 못했습니다.");
  if (!savedResult.success) warnings.push("저장 목록을 불러오지 못했습니다.");

  return (
    <div className="space-y-10">
      {/* 히어로 섹션 */}
      <section className="flex flex-col items-center gap-6 py-10 text-center">
        <h1 className="text-3xl font-bold text-white">
          로스트아크 통합 데이터 허브
        </h1>
        <p className="text-gray-400 max-w-md">
          캐릭터 스펙, 원정대 현황, 주간 숙제를 한 번에 확인하세요.
        </p>
        <SearchBar />
      </section>

      {/* partial/stale 경고 */}
      {warnings.length > 0 && (
        <PartialWarning warnings={warnings} stale={homeResult.success && homeResult.stale} />
      )}

      {/* 전체 실패 */}
      {!homeData && !savedData && (
        <ErrorBanner
          title="데이터를 불러오지 못했습니다"
          message="서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요."
        />
      )}

      {/* 저장 목록 미리보기 */}
      {savedData && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">
            저장 목록
          </h2>
          {savedData.items.length === 0 ? (
            <EmptyState
              message="저장된 항목이 없습니다. 캐릭터나 원정대를 검색하고 저장해보세요."
              icon="📌"
            />
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {savedData.items.map((item) => {
                const href =
                  item.type === "expedition"
                    ? `/expedition/${encodeURIComponent(item.key)}`
                    : item.type === "character"
                    ? `/character/${encodeURIComponent(item.key)}`
                    : `/expedition/${encodeURIComponent(item.key)}`;
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="flex items-center justify-between rounded-lg border border-lostark-border bg-lostark-panel px-4 py-3 text-sm transition-colors hover:border-lostark-gold"
                  >
                    <div className="flex items-center gap-2">
                      {item.pinned && <span className="text-lostark-gold">📌</span>}
                      <span className="font-semibold text-white">{item.label}</span>
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-lostark-navy px-1.5 py-0.5 text-xs text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.type === "expedition" ? "원정대" : item.type === "character" ? "캐릭터" : "검색"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 최근 변경 이벤트 */}
      {savedData && savedData.changeEvents.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">
            최근 변경 사항
          </h2>
          <ul className="space-y-2">
            {savedData.changeEvents.map((event) => (
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

      {/* 점검/공지 배너 */}
      {homeData && homeData.notices.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">
            공지 / 점검
          </h2>
          <ul className="space-y-2">
            {homeData.notices.map((notice) => (
              <li
                key={notice.id}
                className="rounded-lg border border-lostark-border bg-lostark-panel px-4 py-3 text-sm"
              >
                <span
                  className={`mr-2 rounded px-1.5 py-0.5 text-xs font-semibold ${
                    notice.type === "maintenance"
                      ? "bg-yellow-800/60 text-yellow-300"
                      : notice.type === "update"
                      ? "bg-blue-800/60 text-blue-300"
                      : "bg-green-800/60 text-green-300"
                  }`}
                >
                  {notice.type === "maintenance"
                    ? "점검"
                    : notice.type === "update"
                    ? "업데이트"
                    : "이벤트"}
                </span>
                {notice.url ? (
                  <a
                    href={notice.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:underline"
                  >
                    {notice.title}
                  </a>
                ) : (
                  <span className="text-white">{notice.title}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 추천 콘텐츠 */}
      {homeData && homeData.featuredContents.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-widest">
            이번 주 추천 레이드
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {homeData.featuredContents.map((content) => (
              <div
                key={content.id}
                className="rounded-xl border border-lostark-border bg-lostark-panel p-4"
              >
                <p className="text-xs text-gray-400">{content.category}</p>
                <p className="mt-1 font-semibold text-white">{content.name}</p>
                <p className="mt-1 text-sm text-lostark-gold">
                  {content.recommendedItemLevel.toLocaleString()} ℓ 이상
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
