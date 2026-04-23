import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function HomeLoading() {
  return (
    <div className="space-y-10">
      {/* 히어로 스켈레톤 */}
      <section className="flex flex-col items-center gap-6 py-10 text-center">
        <div className="h-9 w-64 animate-pulse rounded bg-lostark-panel" />
        <div className="h-5 w-80 animate-pulse rounded bg-lostark-panel" />
        <div className="h-12 w-full max-w-xl animate-pulse rounded-lg bg-lostark-panel" />
      </section>

      {/* 저장 목록 스켈레톤 */}
      <section>
        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-lostark-panel" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg border border-lostark-border bg-lostark-panel"
            />
          ))}
        </div>
      </section>

      {/* 콘텐츠 스켈레톤 */}
      <section>
        <div className="mb-3 h-4 w-32 animate-pulse rounded bg-lostark-panel" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-lostark-border bg-lostark-panel"
            />
          ))}
        </div>
      </section>

      <div className="flex justify-center pt-4">
        <LoadingSpinner label="홈 데이터를 불러오는 중..." />
      </div>
    </div>
  );
}
