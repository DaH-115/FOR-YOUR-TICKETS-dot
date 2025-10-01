"use client";

import { useAppDispatch, useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import {
  selectWatchlist,
  addWatchlist,
  removeWatchlist,
} from "store/redux-toolkit/slice/watchlistSlice";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

export default function AddWatchlistButton({ movieId }: { movieId: number }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { movies, status } = useAppSelector(selectWatchlist);
  const savedList = movies.some((movie) => movie.id === movieId);

  const handleClick = () => {
    if (!user?.uid) {
      return;
    }

    if (status === "loading") {
      return;
    }

    if (savedList) {
      dispatch(removeWatchlist({ uid: user.uid, movieId }));
    } else {
      dispatch(addWatchlist({ uid: user.uid, movieId }));
    }
  };

  const isDisabled = !user?.uid || status === "loading";

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={
        savedList ? "보고 싶은 영화에서 제거" : "보고 싶은 영화에 추가"
      }
      className={`text-xl ${
        isDisabled
          ? "cursor-not-allowed text-gray-300"
          : "text-accent-300 hover:text-accent-500"
      }`}
    >
      {savedList ? <FaBookmark /> : <FaRegBookmark />}
    </button>
  );
}
