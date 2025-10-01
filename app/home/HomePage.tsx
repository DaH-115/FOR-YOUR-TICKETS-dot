"use client";

import dynamic from "next/dynamic";
import { RecommendSection, MovieSection } from "app/home/components";
import LatestReviewSkeleton from "app/home/components/reviews/LatestReviewSkeleton";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import Background from "@/components/ui/layout/Background";

// 컴포넌트 지연 로딩
const LatestReviewList = dynamic(
  () => import("app/home/components/reviews/LatestReviewList"),
  {
    loading: () => <LatestReviewSkeleton />,
  },
);

interface HomePageProps {
  movieList: MovieList[];
  recommendMovie: MovieList;
  trailerKey: string;
  latestReviews: ReviewDoc[];
}

export default function HomePage({
  movieList,
  recommendMovie,
  trailerKey,
  latestReviews,
}: HomePageProps) {
  return (
    <main className="">
      <Background
        imageUrl={recommendMovie.backdrop_path}
        height="60vh"
        aspectRatio="16/9"
      />
      {/* <Background imageUrl={recommendMovie.backdrop_path} /> */}
      <RecommendSection movie={recommendMovie} trailerKey={trailerKey} />
      <MovieSection
        title="상영 중인 영화"
        movieList={movieList}
        maxItems={10}
      />
      <LatestReviewList reviews={latestReviews} />
    </main>
  );
}
