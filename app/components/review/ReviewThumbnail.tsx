"use client";

import Image from "next/image";
import MoviePoster from "@/components/movie/MoviePoster";
import { usePresignedUrl } from "@/components/user/hooks/usePresignedUrl";

interface ReviewThumbnailProps {
  photoKey?: string;
  posterPath: string;
  title: string;
}

export default function ReviewThumbnail({
  photoKey,
  posterPath,
  title,
}: ReviewThumbnailProps) {
  const { url, loading } = usePresignedUrl({ key: photoKey });

  if (photoKey && (url || loading)) {
    return (
      <div className="group/poster relative aspect-2/3 overflow-hidden rounded-2xl bg-gray-100">
        {url ? (
          <Image
            src={url}
            alt={`${title} 리뷰 사진`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full animate-pulse bg-gray-200" />
        )}
        <div className="absolute inset-0 rounded-2xl border border-white/20 transition-all duration-300 ease-out group-hover/poster:border-white/40" />
      </div>
    );
  }

  return <MoviePoster posterPath={posterPath} title={title} />;
}
