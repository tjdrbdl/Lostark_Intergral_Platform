interface ErrorBannerProps {
  title?: string;
  message: string;
  /** 재시도 핸들러 (없으면 버튼 미노출) */
  onRetry?: () => void;
}

export default function ErrorBanner({
  title = "오류가 발생했습니다",
  message,
  onRetry,
}: ErrorBannerProps) {
  return (
    <div className="rounded-lg border border-red-800 bg-red-950/40 p-4">
      <p className="font-semibold text-red-400">{title}</p>
      <p className="mt-1 text-sm text-red-300/80">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded bg-red-700 px-4 py-1.5 text-sm text-white hover:bg-red-600 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
