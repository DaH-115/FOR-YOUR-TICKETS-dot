"use client";

import SwiperList from "app/components/swiper/SwiperList";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

export default function SimilarMovieList({
  movieList,
}: {
  movieList: MovieList[];
}) {
  return (
    <section className="px-6 py-8">
      <header className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white">
          비슷한 영화
        </h2>
      </header>
      {/* 비슷한 영화 목록 */}
      {movieList.length > 0 ? (
        <SwiperList movieList={movieList} />
      ) : (
        <div className="w-full text-gray-400">비슷한 영화가 없습니다</div>
      )}
    </section>
  );
}
