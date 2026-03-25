"use client";

import Image from "next/image";
import { useState } from "react";

const TMDB_IMG = "https://image.tmdb.org/t/p/w780";

/** TMDB poster path → 절대 URL */
const posterSrc = (path: string) => {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${TMDB_IMG}${clean}`;
};

interface MovieImageProps {
  posterPath?: string; // "/abc.jpg"
  title: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

export default function MovieImage({
  posterPath,
  title,
  sizes = "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
  quality = 80,
}: MovieImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!posterPath || hasError) {
    return (
      <figure className="relative h-full w-full">
        <figcaption className="absolute inset-0 flex items-center justify-center bg-primary-600 p-4 text-white">
          <p className="text-sm">{title || "포스터 이미지가 없습니다."}</p>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="relative h-full w-full">
      <Image
        src={posterSrc(posterPath)}
        alt={`${title} poster`}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </figure>
  );
}
