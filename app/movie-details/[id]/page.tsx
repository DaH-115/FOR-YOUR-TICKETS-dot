import { Metadata } from "next";
import { notFound } from "next/navigation";
import MovieDetailCard from "@/movie-details/[id]/components/MovieDetailCard";
import MovieTrailerList from "@/movie-details/[id]/components/MovieTrailerList";
import Background from "@/components/ui/layout/Background";
import getMovieTitle from "@/utils/getEnrichMovieTitle";
import { fetchMovieCredits } from "lib/movies/fetchMovieCredits";
import { fetchMovieDetails } from "lib/movies/fetchMovieDetails";
import { fetchSimilarMovies } from "lib/movies/fetchSimilarMovies";
import { fetchVideosMovies } from "lib/movies/fetchVideosMovies";
import SimilarMovieList from "@/movie-details/[id]/components/SimilarMovieList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: number }>;
}): Promise<Metadata> {
  const { id } = await params;

  if (!id) {
    return {
      title: "잘못된 접근",
      description: "올바르지 않은 영화 ID입니다.",
    };
  }

  try {
    const movieDetails = await fetchMovieDetails(id);
    const { original_title, title, backdrop_path, overview } = movieDetails;
    const movieTitle = getMovieTitle(original_title, title);

    return {
      alternates: {
        canonical: `/movie-details/${id}`,
      },
      title: movieTitle,
      description: overview,
      openGraph: {
        images: backdrop_path
          ? [
              {
                url: `https://image.tmdb.org/t/p/original${backdrop_path}`,
              },
            ]
          : [],
      },
    };
  } catch (error: unknown) {
    console.error("메타데이터 생성 실패:", error);
    return {
      title: "오류",
      description: "요청하신 영화 정보를 불러오는데 실패했습니다.",
    };
  }
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  try {
    const movieDetails = await fetchMovieDetails(id);
    if (!movieDetails) {
      return notFound();
    }

    const [movieCredits, movieTrailerData, similarMovies] = await Promise.all([
      fetchMovieCredits(id),
      fetchVideosMovies(id),
      fetchSimilarMovies(id),
    ]);

    const { backdrop_path } = movieDetails;

    return (
      <>
        {backdrop_path && (
          <Background imageUrl={backdrop_path} height="100vh" />
        )}
        <MovieDetailCard
          movieDetails={movieDetails}
          movieCredits={movieCredits}
        />
        <MovieTrailerList trailerList={movieTrailerData.results} />
        <SimilarMovieList movieList={similarMovies} />
      </>
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    return notFound();
  }
}
