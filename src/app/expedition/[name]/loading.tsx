import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ExpeditionLoading() {
  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-56 animate-pulse rounded bg-lostark-panel" />
        <div className="h-10 w-28 animate-pulse rounded-lg bg-lostark-panel" />
      </div>

      {/* 원정대 요약 스켈레톤 */}
      <div className="rounded-xl border border-lostark-border bg-lostark-panel p-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-16 animate-pulse rounded bg-lostark-navy" />
              <div className="h-6 w-24 animate-pulse rounded bg-lostark-navy" />
            </div>
          ))}
        </div>
      </div>

      {/* 캐릭터 목록 스켈레톤 */}
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg border border-lostark-border bg-lostark-panel"
          />
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <LoadingSpinner label="원정대 정보를 불러오는 중..." />
      </div>
    </div>
  );
}
