import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function WeeklyLoading() {
  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-56 animate-pulse rounded bg-lostark-panel" />
        <div className="h-10 w-28 animate-pulse rounded-lg bg-lostark-panel" />
      </div>

      {/* 주간 체크 스켈레톤 */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-lostark-border bg-lostark-panel p-5"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 animate-pulse rounded bg-lostark-navy" />
              <div className="h-4 w-24 animate-pulse rounded bg-lostark-navy" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-lostark-navy" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="h-10 animate-pulse rounded-lg bg-lostark-navy"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <LoadingSpinner label="주간 체크 정보를 불러오는 중..." />
      </div>
    </div>
  );
}
