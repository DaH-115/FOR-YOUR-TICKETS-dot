import Link from "next/link";
import GenreList from "app/components/movie/GenreList";
import MovieCertification from "app/components/movie/MovieCertification";
import MoviePoster from "app/components/movie/MoviePoster";
import Tooltip from "app/components/ui/feedback/Tooltip";
import getEnrichMovieTitle from "app/utils/getEnrichMovieTitle";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";
import { FaStar } from "react-icons/fa";
import { IoInformationCircle } from "react-icons/io5";
import WriteButton from "app/components/ui/buttons/WriteButton";

export default function SwiperItem({
  idx,
  movie,
}: {
  idx: number;
  movie: MovieList;
}) {
  const {
    id,
    original_title,
    poster_path,
    title,
    vote_average,
    genres,
    release_date,
  } = movie;
  const displayTitle = getEnrichMovieTitle(original_title, title);

  return (
    <article className="relative flex flex-col items-stretch drop-shadow-xl transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:drop-shadow-2xl">
      {/* 랭킹 번호 */}
      <header className="absolute left-0 top-0 z-50 flex w-full items-center justify-between rounded-t-xl bg-gradient-to-t from-transparent to-black px-3 py-2 text-3xl font-bold text-white md:px-4 md:py-3">
        <strong>{idx + 1}</strong>
      </header>
      {/* 영화 포스터 */}
      <div className="aspect-[2/3] overflow-hidden rounded-xl">
        <MoviePoster posterPath={poster_path} title={displayTitle} />
      </div>

      {/* 영화 정보 카드 - 제목, 등급, 평점, 장르 */}
      <section className="overflow-hidden rounded-2xl border-t-8 border-dotted border-gray-300 bg-gradient-to-br from-white to-gray-50 lg:border-t-4">
        <div className="p-2 px-3 pb-0 md:pt-3">
          {/* 영화 제목 */}
          <div className="pb-2">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="flex-1">
                <h3 className="line-clamp-1 text-base font-bold lg:text-lg">
                  {title}
                </h3>
                <p className="line-clamp-1 text-sm leading-tight text-gray-500">
                  {`${original_title} (${release_date.slice(0, 4)})`}
                </p>
              </div>
            </div>
          </div>

          {/* 평점 & 등급 & 인포 버튼 */}
          <div className="flex items-center justify-between gap-2">
            {/* 평점 */}
            <div className="flex items-center">
              <FaStar className="mr-1 text-lg text-accent-300" />
              <span className="text-base font-semibold md:text-lg">
                {vote_average ? Math.round(vote_average * 10) / 10 : 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 등급 */}
              <MovieCertification certification={movie.certification || null} />
              {/* 인포 버튼 */}
              <div className="relative">
                <Link
                  href={`/movie-details/${id}`}
                  aria-label={`${displayTitle} 영화 상세정보 보기`}
                >
                  <IoInformationCircle
                    className="text-xl text-gray-300 transition-all duration-300 ease-in-out hover:text-gray-800"
                    aria-hidden
                  />
                </Link>
                <Tooltip>{displayTitle} 영화 상세정보 보기</Tooltip>
              </div>
            </div>
          </div>

          {/* 장르 */}
          <div className="pb-2 pt-3 md:py-4">
            <GenreList genres={genres?.slice(0, 3) || []} />
          </div>
        </div>

        {/* 티켓 만들기 버튼 */}
        <div className="border-t-4 border-dotted p-2">
          <WriteButton movieId={id} size="small" />
        </div>
      </section>
    </article>
  );
}
