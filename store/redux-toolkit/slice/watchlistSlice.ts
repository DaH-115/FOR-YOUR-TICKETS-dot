import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAuthHeaders } from "app/utils/getIdToken/getAuthHeaders";

/**
 * 영화 상세 정보 인터페이스
 */
interface MovieDetails {
  id: number;
  title: string;
  poster_path?: string;
  genres: { id: number; name: string }[];
  certification?: string | null;
}

/**
 * 워치리스트 상태 인터페이스
 * @property movies - 영화 상세 정보 목록
 * @property status - 비동기 작업 상태 (idle, loading, succeeded, failed)
 * @property error - 에러 메시지 (있을 경우)
 */
interface WatchlistState {
  movies: MovieDetails[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

/**
 * 워치리스트 초기 상태
 */
const initialState: WatchlistState = {
  movies: [],
  status: "idle",
  error: null,
};

/**
 * 사용자의 보고 싶은 영화 목록을 조회하는 비동기 액션 (영화 상세 정보 포함)
 * @param uid - 사용자 ID
 * @returns 영화 상세 정보 배열 또는 에러
 */
export const fetchWatchlist = createAsyncThunk<
  MovieDetails[],
  string,
  { rejectValue: string }
>("watchlist/fetchWatchlist", async (uid, { rejectWithValue }) => {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`/api/watchlist?uid=${uid}`, {
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("워치리스트 조회 실패");
    const data = await res.json();
    return data.movies;
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : "알 수 없는 오류",
    );
  }
});

/**
 * 영화를 보고 싶은 영화 목록에 추가하는 비동기 액션
 * @param payload - uid와 movieId를 포함한 객체
 * @returns 추가된 영화 ID 또는 에러
 */
export const addWatchlist = createAsyncThunk<
  number,
  { uid: string; movieId: number },
  { rejectValue: string }
>("watchlist/addWatchlist", async (payload, { rejectWithValue }) => {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("워치리스트 추가 실패");
    return payload.movieId;
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : "알 수 없는 오류",
    );
  }
});

/**
 * 보고 싶은 영화 목록에서 영화를 제거하는 비동기 액션
 * @param payload - uid와 movieId를 포함한 객체
 * @returns 제거된 영화 ID 또는 에러
 */
export const removeWatchlist = createAsyncThunk<
  number,
  { uid: string; movieId: number },
  { rejectValue: string }
>("watchlist/removeWatchlist", async (payload, { rejectWithValue }) => {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/watchlist", {
      method: "DELETE",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("워치리스트 삭제 실패");
    return payload.movieId;
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : "알 수 없는 오류",
    );
  }
});

/**
 * 워치리스트 Redux 슬라이스
 * 보고 싶은 영화 목록의 상태를 관리하고 비동기 작업을 처리
 */
const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchWatchlist 액션 처리
      .addCase(fetchWatchlist.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchWatchlist.fulfilled,
        (state, action: PayloadAction<MovieDetails[]>) => {
          state.status = "succeeded";
          state.movies = action.payload;
        },
      )
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "워치리스트 조회에 실패했습니다.";
      })
      // addWatchlist 액션 처리 - 즉시 추가 (사용자 경험 향상)
      .addCase(
        addWatchlist.fulfilled,
        (state, action: PayloadAction<number>) => {
          // 영화가 이미 목록에 있는지 확인
          const isAlreadyAdded = state.movies.some(
            (movie) => movie.id === action.payload,
          );
          if (!isAlreadyAdded) {
            // 영화 상세 정보를 가져와서 추가 (기본 정보만)
            state.movies.unshift({
              id: action.payload,
              title: "영화 정보를 불러오는 중...",
              poster_path: undefined,
              genres: [],
              certification: null,
            });
          }
        },
      )
      // removeWatchlist 액션 처리 - 즉시 제거 (사용자 경험 향상)
      .addCase(
        removeWatchlist.fulfilled,
        (state, action: PayloadAction<number>) => {
          // 영화 상세 정보에서 즉시 제거
          state.movies = state.movies.filter(
            (movie) => movie.id !== action.payload,
          );
        },
      );
  },
});

// 상태 선택자 내보내기
export const selectWatchlist = (state: { watchlist: WatchlistState }) =>
  state.watchlist;

// 리듀서 내보내기
export default watchlistSlice.reducer;
