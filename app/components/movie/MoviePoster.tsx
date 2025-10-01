import MovieImage from "@/components/movie/MovieImage";

interface MoviePosterProps {
  posterPath: string;
  title: string;
}

export default function MoviePoster({ posterPath, title }: MoviePosterProps) {
  return (
    <div className="group relative aspect-[2/3] overflow-hidden rounded-2xl">
      <MovieImage posterPath={posterPath} title={title} />
      {/* 포스터 전용 테두리 효과 */}
      <div className="absolute inset-0 rounded-xl border border-white/20 transition-all duration-300 ease-out group-hover:border-white/40"></div>
    </div>
  );
}
