const SKELETON_COUNT = 14;

export default function TicketListSkeleton() {
  return (
    <main className="3xl:max-w-[1600px] mx-4 lg:mx-12 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl">
      {/* 헤더 */}
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-700/60" />
          <div className="h-6 w-8 animate-pulse rounded bg-gray-700/40" />
        </div>
      </header>

      {/* 검색 영역 */}
      <div className="mt-4 mb-8">
        <div className="h-10 w-64 animate-pulse rounded-full bg-gray-700/40" />
      </div>

      {/* 티켓 그리드 */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} className="flex flex-col">
            {/* 포스터 자리 */}
            <div className="aspect-2/3 animate-pulse rounded-2xl bg-gray-700/50" />
            {/* 정보 카드 자리 */}
            <div className="mx-auto w-full max-w-md">
              <div className="flex h-56 flex-col gap-3 rounded-2xl bg-white p-4">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
