import Link from "next/link";
import { IoTicket } from "react-icons/io5";

interface WriteButtonProps {
  movieId: number;
  size?: "large" | "small";
}

export default function WriteButton({
  movieId,
  size = "large",
}: WriteButtonProps) {
  return (
    <Link
      href={`/write-review/new?movieId=${movieId}`}
      className={`relative flex items-center justify-center gap-1 rounded-xl border border-white bg-primary-500 text-white transition-colors duration-300 hover:border-primary-300 ${
        size === "large" ? "p-5" : "p-4"
      }`}
    >
      <button
        type="button"
        className={`${size === "large" ? "text-base" : "text-xs"} tracking-tight`}
      >
        티켓 만들기
      </button>
      <IoTicket
        className={`${size === "large" ? "text-base" : "text-xs"}`}
        aria-hidden
      />
    </Link>
  );
}
