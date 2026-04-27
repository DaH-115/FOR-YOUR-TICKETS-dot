import Link from "next/link";

interface AddTicketButtonProps {
  movieId: number;
  variant?: "default" | "large";
}

export default function AddTicketButton({
  movieId,
  variant = "default",
}: AddTicketButtonProps) {
  const isLarge = variant === "large";

  return (
    <Link
      href={`/write-review/new?movieId=${movieId}`}
      className={`group/ticket relative mx-auto block w-full max-w-md overflow-hidden rounded-2xl bg-white px-4 text-center transition-colors duration-300 ease-in-out hover:bg-gray-100 ${
        isLarge ? "py-8" : "py-6"
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[url('/patterns/ticket-text-pattern.svg')] bg-cover bg-center select-none"
      />

      <p
        className={`relative z-10 font-bold tracking-tight text-gray-400 transition-colors duration-300 ease-in-out group-hover/ticket:text-gray-800 ${
          isLarge ? "text-xl lg:text-2xl" : "text-md lg:text-lg"
        }`}
      >
        Admit One
      </p>
    </Link>
  );
}
