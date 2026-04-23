import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CharacterLoading() {
  return (
    <div className="space-y-6">
      {/* 이름 스켈레톤 */}
      <div className="h-8 w-48 animate-pulse rounded bg-lostark-panel" />

      {/* 스펙 카드 스켈레톤 */}
      <div className="space-y-4 rounded-xl border border-lostark-border bg-lostark-panel p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-lostark-navy" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-lostark-navy" />
            <div className="h-4 w-24 animate-pulse rounded bg-lostark-navy" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-lostark-navy"
            />
          ))}
        </div>
      </div>

      {/* 원정대 목록 스켈레톤 */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-36 animate-pulse rounded-lg border border-lostark-border bg-lostark-panel"
          />
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <LoadingSpinner label="캐릭터 정보를 불러오는 중..." />
      </div>
    </div>
  );
}
