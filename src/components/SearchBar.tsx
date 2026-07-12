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
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-3">
      {/* 검색 유형 탭 */}
      <div className="flex gap-1 text-xs">
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
            className={`rounded-full border px-3 py-1.5 transition-colors ${
              mode === path
                ? "border-amber-300/40 bg-amber-300/10 text-amber-200 font-semibold"
                : "border-transparent text-slate-500 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 입력 */}
      <div className="flex rounded-2xl border border-white/15 bg-black/30 p-2 shadow-2xl shadow-black/30 focus-within:border-amber-300/40">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="캐릭터명을 입력하세요"
          maxLength={12}
          aria-label="캐릭터 또는 원정대 검색"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-white placeholder-slate-600 outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-black text-slate-950 disabled:opacity-40 hover:bg-amber-200 sm:px-7"
        >
          검색
        </button>
      </div>
    </form>
  );
}
