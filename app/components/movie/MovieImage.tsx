"use client";

import debounce from "lodash/debounce";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface MovieImageProps {
  posterPath?: string;
  title: string;
  lazy?: boolean;
}

type ImageSize = 92 | 154 | 185 | 342 | 500;

export default function MovieImage({
  posterPath,
  title,
  lazy = false,
}: MovieImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [optimalSize, setOptimalSize] = useState<ImageSize>(342);

  // 컨테이너 크기에 따른 최적 이미지 크기 계산
  const getOptimalImageSize = (width: number): ImageSize => {
    if (width <= 92) return 92;
    if (width <= 154) return 154;
    if (width <= 185) return 185;
    if (width <= 400) return 342;
    return 500;
  };

  // ResizeObserver: 컨테이너 크기 감지 및 최적 이미지 크기 설정
  useEffect(() => {
    const updateOptimalSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newOptimalSize = getOptimalImageSize(rect.width);
        if (newOptimalSize !== optimalSize) {
          setOptimalSize(newOptimalSize);
        }
      }
    };

    updateOptimalSize();
    const debouncedUpdate = debounce(updateOptimalSize, 100);
    const resizeObserver = new ResizeObserver(debouncedUpdate);
    const currentRef = containerRef.current;
    if (currentRef) {
      resizeObserver.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
    };
  }, [optimalSize]);

  // 반응형 sizes 속성 생성
  const generateSizes = () => {
    return "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw";
  };

  return (
    <figure ref={containerRef} className="relative h-full w-full">
      {posterPath ? (
        <Image
          src={`https://image.tmdb.org/t/p/w${optimalSize}/${posterPath}`}
          alt={title}
          fill
          quality={75}
          priority={!lazy}
          loading={lazy ? "lazy" : "eager"}
          className="object-cover"
          sizes={generateSizes()}
          placeholder={"empty"}
        />
      ) : (
        <figcaption className="absolute inset-0 flex items-center justify-center bg-primary-700 p-4 text-white">
          <span className="text-sm">
            {title || "Make a ticket for your own movie review."}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
