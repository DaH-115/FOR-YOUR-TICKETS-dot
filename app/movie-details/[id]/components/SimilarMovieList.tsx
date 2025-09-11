"use client";

import SwiperList from "app/components/swiper/SwiperList";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

export default function SimilarMovieList({
  movieList,
}: {
  movieList: MovieList[];
}) {
  return (
    <section className="p-6">
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">
        Similar Movies
      </h2>
      <p className="pb-2 text-sm text-gray-300">이런 영화는 어떠세요</p>
      {/* 비슷한 영화 목록 */}
      {movieList.length > 0 ? (
        <SwiperList movieList={movieList} />
      ) : (
        <div className="w-full text-gray-400">비슷한 영화가 없습니다</div>
      )}
    </section>
  );
}
