export default function GenreList({ genres }: { genres: string[] }) {
  if (!genres || genres.length === 0) {
    return <p className="text-xs text-gray-400">장르 정보가 없습니다</p>;
  }

  return (
    <ul className="flex w-full items-center justify-center overflow-x-scroll scrollbar-hide">
      {genres.map((genre: string, idx: number) => (
        <li key={idx} className="flex items-center">
          <p className="text-nowrap text-sm">
            {genre}
            {/* 마지막 아이템이 아니면 점 표시 */}
            {idx < genres.length - 1 && <span className="mx-2">·</span>}
          </p>
        </li>
      ))}
    </ul>
  );
}
