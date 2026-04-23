/**
 * 부분 성공(partial) 또는 stale 상태 경고 배너
 */
interface PartialWarningProps {
  warnings: string[];
  stale?: boolean;
}

export default function PartialWarning({ warnings, stale }: PartialWarningProps) {
  if (!stale && warnings.length === 0) return null;

  return (
    <div className="rounded-lg border border-yellow-700 bg-yellow-950/40 p-3 text-sm">
      {stale && (
        <p className="text-yellow-400">
          ⚠ 캐시가 만료되었으나 갱신에 실패했습니다. 이전 데이터를 표시합니다.
        </p>
      )}
      {warnings.map((w, i) => (
        <p key={i} className="text-yellow-300/80">
          • {w}
        </p>
      ))}
    </div>
  );
}
