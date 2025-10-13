import SwiperList from "@/components/swiper/SwiperList";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

export default function SimilarMovieList({
  movieList,
}: {
  movieList: MovieList[];
}) {
  return (
    <section className="mx-4 lg:mx-12 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl 3xl:max-w-[1600px]">
      <header className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white">
          비슷한 영화
        </h2>
      </header>
      {movieList.length > 0 ? (
        <SwiperList movieList={movieList} />
      ) : (
        <p className="w-full py-4 text-center text-sm text-gray-400">
          비슷한 영화가 없습니다
        </p>
      )}
    </section>
  );
}
