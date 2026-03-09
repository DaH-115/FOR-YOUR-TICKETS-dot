import Link from "next/link";
import { IoTicket } from "react-icons/io5";

interface WriteButtonProps {
  movieId: number;
}

export default function WriteButton({ movieId }: WriteButtonProps) {
  return (
    <Link
      href={`/write-review/new?movieId=${movieId}`}
      className="bg-primary-500 hover:border-primary-300 relative flex items-center justify-center gap-1 rounded-2xl p-2 text-white transition-colors duration-300"
    >
      <button type="button" className="text-sm tracking-tight">
        티켓 만들기
      </button>
      <IoTicket className="text-base" aria-hidden />
    </Link>
  );
}
