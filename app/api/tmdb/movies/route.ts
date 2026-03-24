import { NextRequest, NextResponse } from "next/server";
import { fetchGenres } from "lib/movies/fetchGenres";

// GET /api/tmdb/movies - TMDB 영화 검색(쿼리: query, page)
export async function GET(req: NextRequest) {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const page = searchParams.get("page") ?? "1";

  if (!TMDB_API_KEY || !query) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie` +
        `?api_key=${TMDB_API_KEY}` +
        `&query=${encodeURIComponent(query)}` +
        `&include_adult=true&language=ko-KR&page=${page}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      console.error("TMDB HTTP Error:", response.status, await response.text());
      return NextResponse.json(
        { error: "TMDB 검색 요청 실패" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // results 배열 체크
    const results = Array.isArray(data.results) ? data.results : [];
    const genreMap = await fetchGenres();

    type TmdbMovie = {
      genre_ids: number[];
    };

    const movieListWithGenres = results.map((movie: TmdbMovie) => {
      // genre_ids 배열 체크
      const ids = Array.isArray(movie.genre_ids) ? movie.genre_ids : [];
      return {
        ...movie,
        genres: ids.map((id: number) => genreMap[id]).filter(Boolean),
      };
    });

    return NextResponse.json({
      movies: movieListWithGenres,
      totalPages: typeof data.total_pages === "number" ? data.total_pages : 0,
      totalResults:
        typeof data.total_results === "number" ? data.total_results : 0,
    });
  } catch (error) {
    console.error("TMDB 검색 API 실패:", error);
    return NextResponse.json(
      { error: "서버 오류로 영화 검색에 실패했습니다." },
      { status: 500 },
    );
  }
}
