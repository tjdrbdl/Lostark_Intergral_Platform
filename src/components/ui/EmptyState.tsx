interface EmptyStateProps {
  message?: string;
  icon?: string;
}

export default function EmptyState({
  message = "데이터가 없습니다.",
  icon = "📭",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
