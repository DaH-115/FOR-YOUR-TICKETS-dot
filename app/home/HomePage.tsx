"use client";

import dynamic from "next/dynamic";
import { RecommendSection, MovieSection } from "app/home/components";
import LatestReviewSkeleton from "app/home/components/reviews/LatestReviewSkeleton";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";

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
  trendingMovies: MovieList[];
  latestReviews: ReviewDoc[];
}

export default function HomePage({
  movieList,
  recommendMovie,
  trailerKey,
  latestReviews,
}: HomePageProps) {
  return (
    <main className="px-6">
      <MovieSection
        title="Now Playing"
        description="지금 상영 중인 영화들을 만나보세요"
        movieList={movieList}
        maxItems={10}
      />
      <RecommendSection movie={recommendMovie} trailerKey={trailerKey} />
      <LatestReviewList reviews={latestReviews} />
    </main>
  );
}
