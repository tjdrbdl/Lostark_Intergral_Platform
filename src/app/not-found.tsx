import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-6xl">🔍</p>
      <h1 className="text-2xl font-bold text-white">찾을 수 없습니다</h1>
      <p className="text-gray-400">
        캐릭터가 존재하지 않거나 이름을 다시 확인해 주세요.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-lostark-gold px-6 py-2.5 font-semibold text-lostark-dark hover:brightness-110 transition-all"
      >
        홈으로
      </Link>
    </div>
  );
}
