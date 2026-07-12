import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import type { HomeData } from "@/types/home";
import type { SavedData } from "@/types/saved";
import { getHomeData, getSavedData } from "@/lib/server-data";
import PartialWarning from "@/components/ui/PartialWarning";

export default async function HomePage() {
  const [homeResult, savedResult] = await Promise.all([
    getHomeData(), getSavedData(),
  ]);
  const home = homeResult?.success ? homeResult.data : null;
  const saved = savedResult?.success ? savedResult.data : null;
  const warnings = [
    ...(homeResult?.success ? homeResult.warnings : []),
    ...(savedResult?.success ? savedResult.warnings : []),
    !home && "공지 데이터를 불러오지 못했습니다.",
    !saved && "저장 목록을 불러오지 못했습니다.",
  ].filter(Boolean) as string[];

  return (
    <div className="pb-16">
      <section className="hero-grid relative overflow-hidden rounded-[2rem] border border-white/10 px-6 py-14 sm:px-12 sm:py-20">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-7 flex items-center gap-3 text-xs font-bold tracking-[.18em] text-amber-300">
            <span className="h-px w-8 bg-amber-300" /> EXPEDITION COMMAND CENTER
          </div>
          <h1 className="break-keep text-4xl font-black leading-[1.08] tracking-[-.05em] text-white sm:text-6xl">
            여러 탭을 닫고,<br/><span className="text-gradient">이번 주의 답만 보세요.</span>
          </h1>
          <p className="mt-6 max-w-xl break-keep text-base leading-7 text-slate-300 sm:text-lg">
            캐릭터 스펙, 원정대 숙제, 투자 효율을 한 흐름으로 연결합니다. 지금 가장 먼저 챙길 캐릭터와 골드 사용처를 확인하세요.
          </p>
          <div className="mt-9"><SearchBar /></div>
        </div>
        <div className="orb absolute -right-24 -top-20 h-96 w-96 rounded-full" />
      </section>

      {warnings.length > 0 && <div className="mt-6"><PartialWarning warnings={warnings} stale={homeResult?.success ? homeResult.stale : false}/></div>}
      {homeResult?.success && (homeResult.partial || homeResult.warnings.length > 0) && (
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[.03] px-4 py-3 text-xs text-slate-400">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>데이터 상태: {homeResult.partial ? "부분 성공" : "성공"}</span>
            <span>출처: {homeResult.source.join(", ")}</span>
            <span>조회 시각: {homeResult.fetchedAt ? new Date(homeResult.fetchedAt).toLocaleString("ko-KR") : "-"}</span>
          </div>
        </div>
      )}

      <section className="mt-14 grid gap-4 md:grid-cols-3">
        {[
          ["01", "원정대 한눈에", "캐릭터별 핵심 스펙과 주간 상태를 한 보드에서 비교합니다."],
          ["02", "설명 가능한 ROI", "추천 점수뿐 아니라 예상 비용과 추천 이유까지 함께 보여줍니다."],
          ["03", "저장하고 변화 추적", "매번 검색하지 않아도 저장한 원정대의 중요한 변화를 먼저 확인합니다."],
        ].map(([no, title, body]) => <article key={no} className="glass-card rounded-2xl p-6">
          <span className="text-xs font-black tracking-widest text-amber-300/70">{no}</span>
          <h2 className="mt-8 text-xl font-bold text-white">{title}</h2><p className="mt-3 break-keep text-sm leading-6 text-slate-400">{body}</p>
        </article>)}
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">MY ROSTER</p><h2 className="mt-2 text-2xl font-bold text-white">저장한 원정대</h2></div><span className="text-xs text-slate-500">최근 확인 순</span></div>
          <div className="space-y-3">
            {saved?.items.length ? saved.items.filter((item) => item.type !== "query").slice(0, 3).map((item) => <Link key={item.id} href={`/${item.type === "character" ? "character" : "expedition"}/${encodeURIComponent(item.key)}`} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.035] p-5 hover:border-amber-300/40">
              <div><div className="flex items-center gap-2"><span className="font-bold text-white">{item.label}</span>{item.pinned && <span className="text-amber-300">◆</span>}</div><p className="mt-1 text-xs text-slate-500">{item.tags.join(" · ") || "저장됨"}</p></div><span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-amber-300">→</span>
            </Link>) : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">검색한 원정대를 저장하면 여기에 모아볼 수 있어요.</div>}
          </div>
        </div>
        <aside className="rounded-2xl border border-amber-300/15 bg-amber-300/[.045] p-6">
          <p className="eyebrow">RECENT SIGNALS</p><h2 className="mt-2 text-2xl font-bold text-white">최근 변화</h2>
          <div className="mt-6 space-y-5">
            {saved?.changeEvents.length ? saved.changeEvents.slice(0,3).map(event => <div key={event.id} className="border-l border-amber-300/30 pl-4"><p className="text-sm leading-6 text-slate-200">{event.summary}</p><p className="mt-1 text-[11px] text-slate-500">{new Date(event.detectedAt).toLocaleString("ko-KR")}</p></div>) : <p className="text-sm text-slate-500">아직 감지된 변화가 없습니다.</p>}
          </div>
        </aside>
      </section>

      {home?.featuredContents.length ? <section className="mt-16"><p className="eyebrow">WEEKLY CONTENT</p><h2 className="mt-2 text-2xl font-bold text-white">이번 주 레이드 기준선</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{home.featuredContents.map(content => <div key={content.id} className="rounded-2xl border border-white/10 p-5"><p className="text-xs text-slate-500">{content.category}</p><p className="mt-3 font-bold text-white">{content.name}</p><p className="mt-1 text-sm font-semibold text-amber-300">Lv. {content.recommendedItemLevel.toLocaleString()}+</p></div>)}</div></section> : null}
    </div>
  );
}
