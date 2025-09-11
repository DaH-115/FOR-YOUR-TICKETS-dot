import MovieCertification from "app/components/movie/MovieCertification";
import MoviePoster from "app/components/movie/MoviePoster";
import WriteButton from "app/components/ui/buttons/WriteButton";
import MetaInfoItem from "app/movie-details/[id]/components/MetaInfoItem";
import convertRuntime from "app/movie-details/[id]/utils/convertRuntime";
import formatMovieDate from "app/utils/formatMovieDate";
import { MovieCredits } from "lib/movies/fetchMovieCredits";
import { MovieDetails } from "lib/movies/fetchMovieDetails";
import ProfileAvatar from "app/components/user/ProfileAvatar";
import { FaStar } from "react-icons/fa";
// import AddWatchlistButton from "app/components/movie/AddWatchlistButton";

interface MovieDetailCardProps {
  movieDetails: MovieDetails;
  movieCredits: MovieCredits;
}

export default function MovieDetailCard({
  movieDetails,
  movieCredits,
}: MovieDetailCardProps) {
  const {
    poster_path,
    title,
    original_title,
    overview,
    genres,
    release_date,
    runtime,
    vote_average,
    certification,
  } = movieDetails;

  const movieDate = formatMovieDate(release_date);
  const casts = movieCredits?.cast || [];
  const crews = movieCredits?.crew || [];

  // 런타임 유효성 검사 및 변환
  const isValidRuntime = runtime && typeof runtime === "number" && runtime > 0;
  const convertedRuntime = isValidRuntime ? convertRuntime(runtime) : null;

  // 출연진, 감독 프로필 이미지 주소 생성 함수
  const profilePath = (profile_path: string | null) => {
    return profile_path
      ? `https://image.tmdb.org/t/p/w185${profile_path}`
      : undefined;
  };

  return (
    <main className="relative mb-12 flex w-full items-center justify-center px-4 pt-8 md:my-12 md:px-0 md:pt-16">
      <div className="flex flex-col justify-center gap-4 md:w-2/3 md:flex-row md:gap-6">
        {/* 영화 포스터 */}
        <section className="w-2/3">
          <div className="aspect-[2/3] w-full overflow-hidden rounded-2xl">
            <MoviePoster posterPath={poster_path} title={title} />
          </div>
        </section>
        <div className="mx-auto w-full overflow-hidden">
          {/* 영화 정보 */}
          <article className="shadow-lg">
            <div className="rounded-2xl bg-white px-8 py-6">
              {/* 영화 정보 & 제목 */}
              <h1 className="sr-only">MOVIE DETAILS</h1>
              <div className="flex items-center">
                <h2 className="mr-3 break-keep text-3xl font-bold">{title}</h2>
                {certification && (
                  <MovieCertification
                    certification={certification}
                    showLabel={true}
                  />
                )}
              </div>
              <div className="flex items-center">
                <p className="text-gray-600">
                  {original_title}(
                  {release_date ? release_date.slice(0, 4) : "개봉일 미정"})
                </p>
              </div>

              {/* 장르 */}
              <ul className="flex w-full items-center overflow-x-scroll pt-4 scrollbar-hide">
                {genres
                  .map((genre) => genre.name)
                  .map((genre: string, idx: number) => (
                    <li key={idx} className="flex items-center">
                      <p className="text-nowrap text-sm">
                        {genre}
                        {/* 마지막 아이템이 아니면 점 표시 */}
                        {idx < genres.length - 1 && (
                          <span className="mx-2">·</span>
                        )}
                      </p>
                    </li>
                  ))}
              </ul>

              {/* 평점 */}
              <div className="py-4">
                <div className="flex items-center">
                  <FaStar className="text-2xl text-accent-300" />
                  <p className="ml-2 text-3xl font-bold">
                    {Math.round(vote_average * 10) / 10}
                  </p>
                </div>
              </div>

              {/* 줄거리 */}
              {overview && (
                <div className="mb-6">
                  <p className="break-keep leading-relaxed text-gray-800">
                    {overview}
                  </p>
                </div>
              )}
              {/* 출연진 */}
              <div className="border-t-4 border-dotted pb-4 pt-8">
                <h3 className="mb-2 text-xs font-bold">출연진</h3>
                {casts.length > 0 ? (
                  <ul className="space-y-4">
                    {casts.slice(0, 5).map((cast) => (
                      <li key={cast.id} className="flex items-center gap-2">
                        {/* 출연진 프로필 */}
                        <ProfileAvatar
                          userDisplayName={cast.name}
                          previewSrc={profilePath(cast.profile_path)}
                          size={40}
                          className="flex-shrink-0"
                          showLoading={false}
                        />
                        <div>
                          <div className="mb-1">
                            <p className="text-sm">{cast.name}</p>
                            <p className="text-xs text-gray-500">
                              {cast.original_name}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600">
                            {cast.character}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-sm text-gray-400">
                    출연진 정보가 없습니다.
                  </p>
                )}
              </div>
              {/* 감독 */}
              <div className="pb-8">
                <h3 className="mb-2 text-xs font-bold">감독</h3>
                {crews.length > 0 &&
                crews.filter((crew) => crew.job === "Director").length > 0 ? (
                  <ul className="space-y-1">
                    {crews
                      .filter((crew) => crew.job === "Director")
                      .map((crew) => (
                        <li key={crew.id} className="flex items-center gap-2">
                          <ProfileAvatar
                            userDisplayName={crew.name}
                            previewSrc={profilePath(crew.profile_path)}
                            size={40}
                            className="flex-shrink-0"
                            showLoading={false}
                          />
                          <div>
                            <p className="text-sm">{crew.name}</p>
                            <p className="text-xs text-gray-600">
                              {crew.original_name}
                            </p>
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">감독 정보가 없습니다.</p>
                )}
              </div>
              {/* 기타 정보 */}
              <div className="flex w-full items-center justify-center py-4">
                <MetaInfoItem label={"개봉일"}>
                  {movieDate ? (
                    <p>{movieDate}</p>
                  ) : (
                    <p className="text-gray-400">개봉일 정보가 없습니다.</p>
                  )}
                </MetaInfoItem>
                <MetaInfoItem label={"러닝 타임"}>
                  {convertedRuntime ? (
                    <p>{convertedRuntime}</p>
                  ) : (
                    <span className="text-gray-400">
                      러닝 타임 정보가 없습니다.
                    </span>
                  )}
                </MetaInfoItem>
              </div>
              {/* 제작사 */}
              <div className="py-4">
                <h3 className="mb-3 text-xs font-bold">제작</h3>
                <ul className="flex flex-wrap">
                  {movieDetails.production_companies.map(
                    (company, idx, arr) => (
                      <li key={idx} className="text-sm">
                        {company.name}
                        {/* 마지막 항목이 아니라면 구분 마크(·) 추가 */}
                        {idx < arr.length - 1 && (
                          <span className="mx-1 text-gray-400">·</span>
                        )}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              {/* 리뷰 작성 & 워치리스트 버튼 */}
              <div className="flex items-center gap-3 border-t-4 border-dotted pt-4">
                <WriteButton movieId={movieDetails.id} />
                {/* <AddWatchlistButton movieId={movieDetails.id} /> */}
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
