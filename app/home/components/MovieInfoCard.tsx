"use client";

import Link from "next/link";
import { FaStar } from "react-icons/fa";
import GenreList from "app/components/movie/GenreList";
import MovieCertification from "app/components/movie/MovieCertification";
import Tooltip from "app/components/ui/feedback/Tooltip";
import formatMovieDate from "app/utils/formatMovieDate";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";
import { useMovieDetails } from "store/context/movieDetailsContext";
import { IoInformationCircle } from "react-icons/io5";

export default function MovieInfoCard({ movie }: { movie: MovieList }) {
  const { id, title, original_title, release_date, vote_average } = movie;
  const releaseDate = formatMovieDate(release_date);
  const { genres, uniqueDirectors } = useMovieDetails();

  return (
    <section className="w-full overflow-hidden break-keep rounded-2xl border-t-8 border-dotted border-gray-300 bg-white">
      <div className="p-4">
        {/* 헤더: 영화 제목, 상세정보 아이콘, 원제목, 개봉년도, 등급 */}
        <header>
          <div className="mb-1 flex justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            {/* 상세정보 아이콘 및 툴팁 */}
            <div className="relative">
              <Link
                href={`/movie-details/${id}`}
                aria-label={`${title}(${original_title}) 영화 상세정보 보기`}
                role="button"
                className="relative inline-block text-gray-300 transition-all duration-300 ease-in-out hover:text-gray-800"
              >
                <IoInformationCircle className="text-2xl" aria-hidden />
              </Link>
              <Tooltip>
                {title}({original_title}) 영화 상세정보 보기
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-gray-500">{`${original_title}(${release_date ? release_date.slice(0, 4) : "개봉일 미정"})`}</h2>
            <MovieCertification certification={movie.certification ?? null} />
          </div>
        </header>

        {/* 장르 리스트 */}
        <section className="pb-8 pt-6">
          <GenreList genres={genres.slice(0, 4)} />
        </section>

        {/* 개봉일, 감독, 평점 */}
        <section className="flex">
          <div className="flex-1">
            <p className="mb-2 text-xs text-gray-500">개봉일</p>
            <p className="p-3 text-center text-sm">{releaseDate}</p>
          </div>
          <div className="flex-1">
            <p className="mb-2 text-xs text-gray-500">감독</p>
            <ul className="space-y-2 p-3 text-center">
              {uniqueDirectors.length > 0 ? (
                uniqueDirectors.map((director) => {
                  // 영어 이름과 원래 이름이 같거나 비슷하면 원래 이름 생략
                  const shouldShowOriginalName =
                    director.name !== director.original_name &&
                    director.original_name.trim() !== "";

                  return (
                    <li key={`director-${director.id}`}>
                      <p className="text-sm">{director.name}</p>
                      {shouldShowOriginalName && (
                        <p className="text-xs text-gray-500">
                          {director.original_name}
                        </p>
                      )}
                    </li>
                  );
                })
              ) : (
                <li className="text-gray-300">감독 정보가 없습니다</li>
              )}
            </ul>
          </div>
          <div className="flex-1">
            <p className="mb-2 text-xs text-gray-500">평점</p>
            <div className="flex flex-1 items-center justify-center p-3">
              <FaStar className="mr-1 text-accent-300" size={24} />
              <div className="text-2xl font-bold">
                {Math.round(vote_average * 10) / 10}
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
