"use client";

import Image from "next/image";
import { useState } from "react";

type TmdbSize =
  | "original"
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "w1280";

const tmdbUrl = (size: TmdbSize, path: string) => {
  const clean = path?.startsWith("/") ? path : `/${path ?? ""}`;
  return `https://image.tmdb.org/t/p/${size}${clean}`;
};

interface MovieImageProps {
  posterPath?: string; // "/abc.jpg"
  title: string;
  lazy?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

export default function MovieImage({
  posterPath,
  title,
  lazy = true,
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

  const src = tmdbUrl("w780", posterPath); // 기본 버킷
  const blur = tmdbUrl("w92", posterPath); // 가벼운 블러

  return (
    <figure className="relative h-full w-full">
      <Image
        src={src}
        alt={`${title} poster`}
        fill
        sizes={sizes}
        priority={priority}
        {...(!priority && { loading: lazy ? "lazy" : "eager" })}
        quality={quality}
        placeholder="blur"
        blurDataURL={blur}
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </figure>
  );
}
