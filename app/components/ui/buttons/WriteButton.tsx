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
      className={`relative z-50 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary-500 text-white ${
        size === "large" ? "p-4" : "p-3"
      }`}
    >
      <span className={`${size === "large" ? "text-sm" : "text-xs"}`}>
        티켓 만들기
      </span>
      <IoTicket aria-hidden />
    </Link>
  );
}
