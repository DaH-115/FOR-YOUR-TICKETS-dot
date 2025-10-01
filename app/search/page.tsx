import { Metadata } from "next";
import SearchPage from "app/search/components/SearchPage";
import { fetchNowPlayingMovies } from "lib/movies/fetchNowPlayingMovies";
import { fetchTrendingMovies } from "lib/movies/fetchTrendingMovies";

export const metadata: Metadata = {
  title: "검색",
  description: "영화를 검색할 수 있는 페이지입니다",
};

export default async function Page() {
  const [nowPlayingMovies, trendingMovies] = await Promise.all([
    fetchNowPlayingMovies(),
    fetchTrendingMovies(),
  ]);

  return (
    <SearchPage
      nowPlayingMovies={nowPlayingMovies}
      trendingMovies={trendingMovies}
    />
  );
}
