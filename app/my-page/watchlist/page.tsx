"use client";

import { useEffect } from "react";
import WatchlistMovieCard from "app/components/movie/WatchlistMovieCard";
import EmptyState from "app/my-page/components/EmptyState";
import { useAppDispatch, useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import {
  selectWatchlist,
  fetchWatchlist,
} from "store/redux-toolkit/slice/watchlistSlice";

export default function Page() {
  return <WatchlistContainer />;
}

function WatchlistContainer() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { movies, status, error } = useAppSelector(selectWatchlist);
  const loading = status === "loading";

  // uid가 있을 때 워치리스트 데이터 가져오기
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchWatchlist(user.uid));
    }
  }, [user?.uid, dispatch]);

  if (!user?.uid) return <EmptyState message="로그인이 필요합니다." />;
  if (error) return <EmptyState message={error} />;

  return (
    <main className="flex w-full flex-col pb-16 md:w-3/4">
      {/* 헤더 */}
      <header className="mb-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            보고 싶은 영화
          </h1>
        </div>
        <p className="text-sm text-gray-300">보고 싶은 영화를 확인해 보세요</p>
      </header>

      {/* 보고 싶은 영화 */}
      {loading ? (
        <EmptyState message="불러오는 중..." />
      ) : movies.length === 0 ? (
        <EmptyState message="보고 싶은 영화가 비어 있습니다." />
      ) : (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
          {movies.map((movie) => (
            <WatchlistMovieCard key={movie.id} movie={movie} />
          ))}
        </section>
      )}
    </main>
  );
}
