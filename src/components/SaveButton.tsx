"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SavedItem } from "@/types/saved";

interface SaveButtonProps {
  /** 현재 저장 여부 */
  savedItem: SavedItem | null;
  /** 저장 대상 정보 */
  target: {
    type: "character" | "expedition" | "query";
    key: string;
    label: string;
  };
  /** 저장/해제 완료 후 페이지 refresh를 외부에서 트리거하기 위한 콜백 (선택) */
  onToggle?: (item: SavedItem | null) => void;
}

export default function SaveButton({ savedItem, target, onToggle }: SaveButtonProps) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<SavedItem | null>(savedItem);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSaved = optimistic !== null;

  async function handleSave() {
    setError(null);
    // 낙관적 업데이트: 임시 항목
    const tempItem: SavedItem = {
      id: "__optimistic__",
      type: target.type,
      key: target.key,
      label: target.label,
      pinned: false,
      tags: [],
      lastSeenAt: new Date().toISOString(),
    };
    setOptimistic(tempItem);

    startTransition(async () => {
      try {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: target.type,
            key: target.key,
            label: target.label,
          }),
        });
        const json = await res.json();
        if (!json.success) {
          setOptimistic(savedItem);
          setError(json.error?.message ?? "저장에 실패했습니다.");
          return;
        }
        setOptimistic(json.data.item as SavedItem);
        onToggle?.(json.data.item as SavedItem);
        router.refresh();
      } catch {
        setOptimistic(savedItem);
        setError("저장 요청 중 오류가 발생했습니다.");
      }
    });
  }

  async function handleUnsave() {
    if (!optimistic) return;
    setError(null);
    const prevItem = optimistic;
    setOptimistic(null); // 낙관적 삭제

    startTransition(async () => {
      try {
        const res = await fetch(`/api/saved/${encodeURIComponent(prevItem.id)}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (!json.success) {
          setOptimistic(prevItem);
          setError(json.error?.message ?? "저장 해제에 실패했습니다.");
          return;
        }
        onToggle?.(null);
        router.refresh();
      } catch {
        setOptimistic(prevItem);
        setError("저장 해제 요청 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={isSaved ? handleUnsave : handleSave}
        disabled={isPending}
        aria-label={isSaved ? "저장 해제" : "저장"}
        className={[
          "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
          isPending ? "cursor-not-allowed opacity-60" : "",
          isSaved
            ? "border-lostark-gold bg-lostark-gold/10 text-lostark-gold hover:bg-lostark-gold/20"
            : "border-lostark-border bg-lostark-panel text-gray-300 hover:border-lostark-gold hover:text-lostark-gold",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isPending ? "처리 중…" : isSaved ? "📌 저장됨" : "+ 저장"}
      </button>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
