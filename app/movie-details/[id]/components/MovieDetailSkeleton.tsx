const CAST_SKELETON_COUNT = 5;
const TRAILER_SKELETON_COUNT = 4;
const SIMILAR_MOVIE_SKELETON_COUNT = 6;

export default function MovieDetailSkeleton() {
  return (
    <>
      <div className="absolute inset-0 -z-10 h-screen w-full">
        <div className="h-full w-full animate-pulse bg-gray-800/60" />
        <div className="absolute inset-0 bg-[#121212]/30" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/10 to-black/70" />
        <div className="absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-[#121212] via-[#121212]/80 to-transparent" />
      </div>

      <main className="relative mx-auto -mt-12 flex max-w-7xl justify-center md:mt-12 md:mb-8">
        <div className="mx-4 flex flex-col justify-center md:w-2/3 md:flex-row md:gap-6">
          {/* 영화 포스터 자리 */}
          <div className="mx-auto w-full md:w-3/4">
            <div className="aspect-2/3 animate-pulse rounded-2xl bg-gray-700/50" />
          </div>

          <article className="mx-auto w-full max-w-md">
            {/* 영화 정보 카드 자리 */}
            <div className="w-full rounded-2xl border-b-2 border-dashed bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-40 animate-pulse rounded bg-gray-200 md:h-10" />
                <div className="h-7 w-14 animate-pulse rounded-full bg-gray-200" />
              </div>
              <div className="mt-2 h-5 w-56 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 h-5 w-44 animate-pulse rounded bg-gray-200" />

              <div className="py-4">
                <div className="h-9 w-20 animate-pulse rounded bg-gray-200" />
              </div>

              <div className="mb-6 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>

              <div className="border-t-2 border-dashed pt-8 pb-4">
                <div className="mb-3 h-4 w-12 animate-pulse rounded bg-gray-200" />
                <ul className="space-y-4">
                  {Array.from({ length: CAST_SKELETON_COUNT }).map((_, idx) => (
                    <li key={idx} className="flex items-center gap-4">
                      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pb-6">
                <div className="mb-3 h-4 w-10 animate-pulse rounded bg-gray-200" />
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </div>
              </div>

              <div className="flex w-full items-center justify-center gap-8 pb-4">
                <div className="h-12 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-12 w-20 animate-pulse rounded bg-gray-200" />
              </div>

              <div className="pb-4">
                <div className="mb-3 h-4 w-10 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
              </div>
            </div>

            <div className="mt-4 h-12 w-full animate-pulse rounded-full bg-gray-700/60" />
          </article>
        </div>
      </main>

      <section className="3xl:max-w-[1600px] mx-4 py-8 lg:mx-12 lg:py-16 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl">
        <header className="mb-4">
          <div className="h-7 w-20 animate-pulse rounded bg-gray-700/60" />
        </header>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: TRAILER_SKELETON_COUNT }).map((_, idx) => (
            <figure key={idx} className="m-0 flex flex-col gap-2">
              <div className="aspect-video animate-pulse rounded-xl bg-gray-700/50" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-700/50" />
            </figure>
          ))}
        </div>
      </section>

      <section className="3xl:max-w-[1600px] mx-4 lg:mx-12 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl">
        <header className="mb-4">
          <div className="h-7 w-24 animate-pulse rounded bg-gray-700/60" />
        </header>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: SIMILAR_MOVIE_SKELETON_COUNT }).map(
            (_, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="aspect-2/3 animate-pulse rounded-2xl bg-gray-700/50" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-700/50" />
              </div>
            ),
          )}
        </div>
      </section>
    </>
  );
}
