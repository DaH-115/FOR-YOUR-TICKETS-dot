export default function GenreList({ genres }: { genres: string[] }) {
  if (!genres || genres.length === 0) {
    return <p className="text-xs text-gray-400">장르 정보가 없습니다</p>;
  }

  return (
    <ul className="flex w-full items-center space-x-1 overflow-x-scroll scrollbar-hide">
      {genres.map((genre: string, idx: number) => (
        <li
          key={idx}
          className="flex items-center rounded-full border border-gray-300 px-3 py-1.5 transition-all hover:border-gray-500"
        >
          <p className="text-nowrap text-xs text-gray-800">
            {genre.slice(0, 4)}
          </p>
        </li>
      ))}
    </ul>
  );
}
