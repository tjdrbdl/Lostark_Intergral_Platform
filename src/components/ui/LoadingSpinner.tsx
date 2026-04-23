export default function LoadingSpinner({ label = "불러오는 중..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-lostark-border border-t-lostark-gold" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
