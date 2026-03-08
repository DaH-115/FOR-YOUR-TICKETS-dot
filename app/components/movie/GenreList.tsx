export default function GenreList({ genres }: { genres: string[] }) {
  if (!genres || genres.length === 0) return null;

  return (
    <ul className="scrollbar-hide flex w-full items-center space-x-1 overflow-x-scroll">
      {genres.slice(0, 3).map((genre: string, idx: number) => (
        <li key={idx} className="flex items-center">
          <p className="text-xs text-nowrap text-gray-600">{genre}</p>
        </li>
      ))}
    </ul>
  );
}
