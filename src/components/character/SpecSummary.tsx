import type { CharacterSpec } from "@/types/character";

interface SpecSummaryProps {
  character: CharacterSpec;
}

export default function SpecSummary({ character }: SpecSummaryProps) {
  return (
    <div className="rounded-xl border border-lostark-border bg-lostark-panel p-5 space-y-5">
      {/* 기본 정보 */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-lg bg-lostark-navy flex items-center justify-center text-2xl">
          ⚔
        </div>
        <div>
          <p className="text-xl font-bold text-white">{character.characterName}</p>
          <p className="text-sm text-gray-400">
            {character.serverName} · {character.characterClass} · Lv.{character.characterLevel}
          </p>
          <p className="mt-1 text-lg font-semibold text-lostark-gold">
            {character.itemLevel.toLocaleString()} ℓ
          </p>
        </div>
      </div>

      {/* 전투 특성 */}
      {Object.keys(character.stats).length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            전투 특성
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(character.stats).map(([stat, value]) => (
              <span
                key={stat}
                className="rounded bg-lostark-navy px-2 py-1 text-xs text-gray-300"
              >
                {stat} <span className="text-white font-semibold">{value}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 각인 */}
      {character.engravings.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            각인
          </h3>
          <div className="flex flex-wrap gap-2">
            {character.engravings.map((e) => (
              <span
                key={e.name}
                className="rounded bg-lostark-navy px-2 py-1 text-xs"
              >
                <span className="text-lostark-gold">{e.name}</span>
                <span className="ml-1 text-gray-400">Lv.{e.level}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 보석 */}
      {character.gems.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            보석
          </h3>
          <div className="flex flex-wrap gap-2">
            {character.gems.map((g, i) => (
              <span
                key={i}
                className={`rounded px-2 py-1 text-xs ${
                  g.type === "홍염"
                    ? "bg-red-950/60 text-red-300"
                    : "bg-blue-950/60 text-blue-300"
                }`}
              >
                {g.level}레벨 {g.type}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 장비 */}
      {character.equipment.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            장비
          </h3>
          <ul className="space-y-1">
            {character.equipment.map((item, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{item.type}</span>
                <span className="text-white">{item.name}</span>
                {item.quality > 0 && (
                  <span
                    className={`text-xs ${
                      item.quality >= 90
                        ? "text-orange-400"
                        : item.quality >= 70
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    품질 {item.quality}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
