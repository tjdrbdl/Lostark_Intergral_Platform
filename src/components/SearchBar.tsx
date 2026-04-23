"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  /** 기본으로 채울 검색어 */
  defaultValue?: string;
  /** 검색 후 이동할 기본 대상 (기본: /expedition) */
  pathPrefix?: "/character" | "/expedition" | "/weekly";
}

export default function SearchBar({
  defaultValue = "",
  pathPrefix = "/expedition",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"/character" | "/expedition" | "/weekly">(pathPrefix);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    const type = mode.replace("/", "");
    const params = new URLSearchParams({
      q: trimmed,
      type,
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl flex-col gap-2">
      {/* 검색 유형 탭 */}
      <div className="flex gap-1 text-sm">
        {(
          [
            { path: "/character", label: "캐릭터" },
            { path: "/expedition", label: "원정대" },
            { path: "/weekly", label: "주간 체크" },
          ] as const
        ).map(({ path, label }) => (
          <button
            key={path}
            type="button"
            onClick={() => setMode(path)}
            className={`rounded px-3 py-1 transition-colors ${
              mode === path
                ? "bg-lostark-gold text-lostark-dark font-semibold"
                : "bg-lostark-panel text-gray-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="캐릭터 또는 원정대 이름 입력"
          maxLength={12}
          className="flex-1 rounded-lg border border-lostark-border bg-lostark-panel px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-lostark-gold transition-colors"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="rounded-lg bg-lostark-gold px-5 py-2.5 font-semibold text-lostark-dark disabled:opacity-40 hover:brightness-110 transition-all"
        >
          검색
        </button>
      </div>
    </form>
  );
}
