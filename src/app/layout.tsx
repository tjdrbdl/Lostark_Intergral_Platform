import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ArkPilot · 로스트아크 원정대 운영 허브",
  description: "원정대 스펙, 주간 숙제, 골드 투자 우선순위를 한 번에 확인하세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        {/* 글로벌 헤더 */}
        <header className="sticky top-0 z-50 border-b border-white/[.07] bg-[#080b10]/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/" className="flex items-center gap-3 text-base font-black tracking-tight text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-amber-300/30 bg-amber-300/10 text-xs text-amber-300">AP</span> ArkPilot
            </Link>
            <nav className="flex gap-5 text-sm text-slate-400">
              <Link href="/" className="hover:text-white">대시보드</Link>
            </nav>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
          {children}
        </main>

        {/* 푸터 */}
        <footer className="border-t border-white/[.07] py-8 text-center text-xs text-slate-600">
          <p>ArkPilot · 비공식 로스트아크 팬 서비스</p><p className="mt-1">데이터 출처: 로스트아크 Open API · 데이터 기준 시각을 확인해주세요.</p>
        </footer>
      </body>
    </html>
  );
}
