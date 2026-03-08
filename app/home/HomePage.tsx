"use client";

import dynamic from "next/dynamic";
import { RecommendSection, MovieSection } from "app/home/components";
import type { MovieList, CrewMember } from "types/movie";
import type { ReviewDoc } from "types/review";
import Background from "@/components/ui/layout/Background";

// 컴포넌트 지연 로딩
const LatestReviewList = dynamic(
  () => import("app/home/components/reviews/LatestReviewList"),
  { ssr: false },
);

interface HomePageProps {
  movieList: MovieList[];
  recommendMovie: MovieList;
  trailerKey: string;
  latestReviews: ReviewDoc[];
  genres: string[];
  uniqueDirectors: CrewMember[];
}

export default function HomePage({
  movieList,
  recommendMovie,
  trailerKey,
  latestReviews,
  genres,
  uniqueDirectors,
}: HomePageProps) {
  return (
    <main>
      <Background
        imageUrl={recommendMovie.backdrop_path}
        height="80vh"
        aspectRatio="16/9"
      />
      <RecommendSection
        movie={recommendMovie}
        trailerKey={trailerKey}
        genres={genres}
        uniqueDirectors={uniqueDirectors}
      />
      <MovieSection
        title="상영 중인 영화"
        movieList={movieList}
        maxItems={10}
      />
      <LatestReviewList reviews={latestReviews} />
    </main>
  );
}
