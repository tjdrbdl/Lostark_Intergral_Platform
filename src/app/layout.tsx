import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LostArk Data Hub",
  description: "로스트아크 캐릭터·원정대·주간 체크 통합 조회",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-lostark-dark">
        {/* 글로벌 헤더 */}
        <header className="sticky top-0 z-50 border-b border-lostark-border bg-lostark-dark/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-lostark-gold tracking-wide">
              LostArk Hub
            </Link>
            <nav className="flex gap-4 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">홈</Link>
            </nav>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>

        {/* 푸터 */}
        <footer className="mt-16 border-t border-lostark-border py-6 text-center text-xs text-gray-600">
          <p>LostArk Data Hub · 비공식 팬사이트 · 스마일게이트RPG와 무관</p>
          <p className="mt-1">데이터 출처: 로스트아크 Open API</p>
        </footer>
      </body>
    </html>
  );
}
