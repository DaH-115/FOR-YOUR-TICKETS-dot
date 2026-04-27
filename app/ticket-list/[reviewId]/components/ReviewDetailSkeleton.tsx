export default function ReviewDetailSkeleton() {
  return (
    <main className="3xl:max-w-[1600px] mx-8 flex flex-col gap-8 lg:mx-12 lg:flex-row lg:items-start lg:justify-center lg:gap-10 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl">
      {/* 영화 포스터 자리 */}
      <div className="mx-auto w-full max-w-md shrink-0 lg:mx-0 lg:w-72 xl:w-80">
        <div className="aspect-2/3 animate-pulse rounded-2xl bg-gray-700/50" />
      </div>

      {/* 리뷰 상세 카드 자리 */}
      <section className="mx-auto w-full max-w-sm shrink-0 lg:mx-0">
        <div className="rounded-2xl border-b-2 border-dashed bg-white px-8 py-6">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="space-y-3 pt-8 pb-12">
            <div className="h-7 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-7 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="flex items-end justify-between">
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        <div className="rounded-t-2xl bg-white px-8 py-6">
          <div className="mb-8 flex items-center justify-between gap-2">
            <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
          </div>

          <div className="space-y-3 pt-8 pb-12">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="rounded-b-2xl bg-white px-8 py-6">
          <div className="mb-4 h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-5/6 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="mt-8 h-20 w-full animate-pulse rounded bg-gray-200" />
        </div>
      </section>
    </main>
  );
}
