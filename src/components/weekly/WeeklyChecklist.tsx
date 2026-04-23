"use client";

import { useState } from "react";
import type { WeeklyData, CharacterWeeklyStatus } from "@/types/weekly";

interface WeeklyChecklistProps {
  data: WeeklyData;
}

export default function WeeklyChecklist({ data }: WeeklyChecklistProps) {
  // 로컬 완료 상태 (실제 API 없으므로 클라이언트 로컬 상태로 관리)
  // TODO: 서버에서 완료 상태를 관리하려면 user session + 별도 저장소 필요
  // 제거 기준: 사용자 인증 및 완료 상태 저장 API 구현 후
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setCompleted((prev) => ({ ...prev, [key]: !prev[key] }));

  const resetAt = new Date(data.weeklyResetAt).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500">주간 리셋: {resetAt}</p>

      {data.characters.map((char) => (
        <CharacterWeeklyBlock
          key={char.characterName}
          char={char}
          completed={completed}
          onToggle={toggle}
        />
      ))}
    </div>
  );
}

function CharacterWeeklyBlock({
  char,
  completed,
  onToggle,
}: {
  char: CharacterWeeklyStatus;
  completed: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const doneCount = char.contents.filter(
    (c) => completed[`${char.characterName}:${c.id}`]
  ).length;
  const totalGold = char.contents.reduce((sum, c) => sum + (c.goldReward ?? 0), 0);
  const earnedGold = char.contents
    .filter((c) => completed[`${char.characterName}:${c.id}`])
    .reduce((sum, c) => sum + (c.goldReward ?? 0), 0);

  return (
    <div className="rounded-xl border border-lostark-border bg-lostark-panel p-4 space-y-3">
      {/* 캐릭터 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-white">{char.characterName}</p>
          <p className="text-xs text-gray-400">
            {char.characterClass} · {char.itemLevel.toLocaleString()} ℓ
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">
            {doneCount}/{char.contents.length} 완료
          </p>
          <p className="text-sm text-lostark-gold">
            {earnedGold.toLocaleString()} / {totalGold.toLocaleString()} G
          </p>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="h-1.5 w-full rounded-full bg-lostark-navy overflow-hidden">
        <div
          className="h-full rounded-full bg-lostark-gold transition-all"
          style={{
            width: `${char.contents.length > 0 ? (doneCount / char.contents.length) * 100 : 0}%`,
          }}
        />
      </div>

      {/* 콘텐츠 체크리스트 */}
      <ul className="space-y-2">
        {char.contents.map((content) => {
          const key = `${char.characterName}:${content.id}`;
          const done = !!completed[key];
          return (
            <li key={content.id}>
              <button
                onClick={() => onToggle(key)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  done
                    ? "bg-lostark-gold/10 text-gray-400 line-through"
                    : "bg-lostark-navy text-white hover:bg-lostark-navy/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-4 w-4 rounded border flex-shrink-0 ${
                      done
                        ? "border-lostark-gold bg-lostark-gold"
                        : "border-gray-600"
                    }`}
                  >
                    {done && <span className="block text-center text-xs text-lostark-dark leading-4">✓</span>}
                  </span>
                  {content.name}
                </span>
                {content.goldReward && (
                  <span className={done ? "text-gray-600" : "text-lostark-gold"}>
                    {content.goldReward.toLocaleString()} G
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
