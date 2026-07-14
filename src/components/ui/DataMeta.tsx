interface DataMetaProps {
  source: string[];
  fetchedAt: string | null;
  partial: boolean;
  stale: boolean;
}

export default function DataMeta({ source, fetchedAt, partial, stale }: DataMetaProps) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500" aria-label="데이터 상태">
      <span>출처: {source.join(", ")}</span>
      <span>조회 시각: {fetchedAt ? new Date(fetchedAt).toLocaleString("ko-KR") : "-"}</span>
      <span>부분 성공: {partial ? "예" : "아니오"}</span>
      <span>stale: {stale ? "예" : "아니오"}</span>
    </div>
  );
}
