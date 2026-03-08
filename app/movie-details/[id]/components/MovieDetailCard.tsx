import MovieCertification from "@/components/movie/MovieCertification";
import MoviePoster from "@/components/movie/MoviePoster";
import WriteButton from "@/components/ui/buttons/WriteButton";
import MetaInfoItem from "@/movie-details/[id]/components/MetaInfoItem";
import convertRuntime from "@/movie-details/[id]/utils/convertRuntime";
import formatMovieDate from "@/utils/formatMovieDate";
import { MovieCredits } from "lib/movies/fetchMovieCredits";
import { MovieDetails } from "lib/movies/fetchMovieDetails";
import ProfileAvatar from "@/components/user/ProfileAvatar";
import { FaStar } from "react-icons/fa";
import GenreList from "@/components/movie/GenreList";

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

  // 한글 포함 여부 체크
  const hasKorean = (text: string) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);

  // 같은 언어인지 체크 (둘 다 한글이거나 둘 다 영어)
  const isSameLanguage = (name: string, originalName: string) => {
    return hasKorean(name) === hasKorean(originalName);
  };

  return (
    <main className="relative mx-auto -mt-12 flex max-w-7xl justify-center md:mt-12 md:mb-8">
      <div className="flex flex-col justify-center md:w-2/3 md:flex-row md:gap-6">
        {/* 영화 포스터 */}
        <section className="mx-auto w-full md:w-3/4">
          <MoviePoster
            posterPath={poster_path || ""}
            title={title}
            importance="hero"
          />
        </section>
        <div className="mx-auto w-full overflow-hidden">
          {/* 영화 정보 */}
          <article className="w-full shadow-lg">
            <div className="w-full rounded-2xl bg-white px-6 pt-6 pb-4 md:px-8">
              {/* 영화 정보 & 제목 */}
              <h1 className="sr-only">MOVIE DETAILS</h1>
              <div className="flex items-center">
                <h2 className="mr-3 text-xl font-bold break-keep md:text-3xl">
                  {title}
                </h2>
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
              <div className="pt-4">
                <GenreList genres={genres.map((genre) => genre.name)} />
              </div>

              {/* 평점 */}
              <div className="py-4">
                <div className="flex items-center">
                  <FaStar className="text-accent-300 text-2xl" />
                  <p className="ml-2 text-3xl font-bold">
                    {Math.round(vote_average * 10) / 10 || 0}
                  </p>
                </div>
              </div>

              {/* 줄거리 */}
              {overview && (
                <div className="mb-6">
                  <p className="text-sm leading-relaxed break-keep text-gray-800">
                    {overview}
                  </p>
                </div>
              )}
              {/* 출연진 */}
              <div className="border-t-4 border-dotted pt-8 pb-4">
                <h3 className="mb-3 text-xs font-bold">출연진</h3>
                {casts.length > 0 ? (
                  <ul className="space-y-4">
                    {casts.slice(0, 5).map((cast) => (
                      <li key={cast.id} className="flex items-center gap-4">
                        {/* 출연진 프로필 */}
                        <ProfileAvatar
                          userDisplayName={cast.name}
                          previewSrc={profilePath(cast.profile_path)}
                          size={40}
                          className="shrink-0"
                          showLoading={false}
                        />
                        <div>
                          <div className="mb-1">
                            <p className="text-sm">{cast.name}</p>
                            {!isSameLanguage(cast.name, cast.original_name) && (
                              <p className="text-xs text-gray-500">
                                {cast.original_name}
                              </p>
                            )}
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
              <div className="pb-6">
                <h3 className="mb-3 text-xs font-bold">감독</h3>
                {crews.length > 0 &&
                crews.filter((crew) => crew.job === "Director").length > 0 ? (
                  <ul className="space-y-1">
                    {crews
                      .filter((crew) => crew.job === "Director")
                      .map((crew) => (
                        <li key={crew.id} className="flex items-center gap-4">
                          <ProfileAvatar
                            userDisplayName={crew.name}
                            previewSrc={profilePath(crew.profile_path)}
                            size={40}
                            className="shrink-0"
                            showLoading={false}
                          />
                          <div>
                            <p className="text-sm">{crew.name}</p>
                            {!isSameLanguage(crew.name, crew.original_name) && (
                              <p className="text-xs text-gray-600">
                                {crew.original_name}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">감독 정보가 없습니다.</p>
                )}
              </div>
              {/* 기타 정보 */}
              <div className="flex w-full items-center justify-center pb-4">
                <MetaInfoItem label={"개봉일"}>
                  {movieDate ? (
                    <p>{movieDate}</p>
                  ) : (
                    <p className="text-sm text-gray-400">
                      개봉일 정보가 없습니다.
                    </p>
                  )}
                </MetaInfoItem>
                <MetaInfoItem label={"러닝 타임"}>
                  {convertedRuntime ? (
                    <p>{convertedRuntime}</p>
                  ) : (
                    <span className="text-sm text-gray-400">
                      러닝 타임 정보가 없습니다.
                    </span>
                  )}
                </MetaInfoItem>
              </div>
              {/* 제작사 */}
              <div className="pb-4">
                <h3 className="mb-3 text-xs font-bold">제작</h3>
                <ul className="flex flex-wrap">
                  {movieDetails.production_companies.map(
                    (company, idx, arr) => (
                      <li key={idx} className="text-xs md:text-sm">
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
              {/* 리뷰 작성 버튼 */}
              <div className="flex w-full items-center border-t-4 border-dotted pt-4">
                <div className="flex-1">
                  <WriteButton movieId={movieDetails.id} />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
