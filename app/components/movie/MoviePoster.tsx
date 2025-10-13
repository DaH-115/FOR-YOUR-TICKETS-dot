import MovieImage from "@/components/movie/MovieImage";

type Importance = "hero" | "list" | "background";

const POLICY: Record<
  Importance,
  { lazy: boolean; priority: boolean; sizes: string }
> = {
  hero: {
    lazy: false,
    priority: true,
    sizes: "(max-width: 768px) 100vw, 60vw",
  },
  list: {
    lazy: true,
    priority: false,
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw",
  },
  background: {
    lazy: true,
    priority: false,
    sizes: "100vw",
  },
};

interface MoviePosterProps {
  posterPath: string;
  title: string;
  importance?: Importance; // 기본 'list'
  className?: string;
}

export default function MoviePoster({
  posterPath,
  title,
  importance = "list",
  className = "",
}: MoviePosterProps) {
  const policy = POLICY[importance];
  return (
    <div
      className={`group relative aspect-[2/3] overflow-hidden rounded-2xl ${className}`}
    >
      <MovieImage
        posterPath={posterPath}
        title={title}
        lazy={policy.lazy}
        priority={policy.priority}
        sizes={policy.sizes}
      />
      <div className="absolute inset-0 rounded-2xl border border-white/20 transition-all duration-300 ease-out group-hover:border-white/40" />
    </div>
  );
}
