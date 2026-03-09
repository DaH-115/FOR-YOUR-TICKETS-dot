import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-8">
      <h2 className="mb-4 text-2xl font-bold text-gray-300">
        죄송합니다. 현재 영화 정보를 불러올 수 없습니다.
      </h2>
      <p className="mb-8 text-gray-600">잠시 후 다시 시도해 주세요.</p>
      <Link
        href="/"
        className="rounded-lg bg-accent-500 px-4 py-2 text-black hover:bg-accent-700"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
