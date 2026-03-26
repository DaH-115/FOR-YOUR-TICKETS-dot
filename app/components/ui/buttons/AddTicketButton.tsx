import Link from "next/link";

interface AddTicketButtonProps {
  movieId: number;
}
export default function AddTicketButton({ movieId }: AddTicketButtonProps) {
  return (
    <Link
      href={`/write-review/new?movieId=${movieId}`}
      className="relative mx-auto block w-full max-w-md overflow-hidden rounded-2xl bg-white px-4 py-6 text-center transition-colors duration-300 ease-in-out hover:bg-gray-100"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[52%] left-1/2 z-0 -translate-x-1/2 text-4xl font-extrabold tracking-tight whitespace-nowrap text-gray-300/70 select-none"
      >
        For your Ticket.
      </span>

      <p className="text-md relative z-10 font-bold tracking-tight lg:text-lg">
        티켓 만들기
      </p>
    </Link>
  );
}
