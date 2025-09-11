"use client";

import { memo, useEffect, useRef, useState } from "react";
import SwiperList from "app/components/swiper/SwiperList";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

interface MovieSectionProps {
  title: string;
  description: string;
  movieList: MovieList[];
  maxItems?: number;
}

const MovieSection = memo(function MovieSection({
  title,
  description,
  movieList,
  maxItems,
}: MovieSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const displayMovies = maxItems ? movieList.slice(0, maxItems) : movieList;

  // IntersectionObserver 설정
  useEffect(() => {
    const currentSection = sectionRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 컴포넌트가 화면에 20% 이상 보일 때 애니메이션 시작
        if (entry.isIntersecting) {
          setIsVisible(true);
          // 한 번 트리거되면 더 이상 관찰하지 않음
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2, // 20% 이상 보일 때 트리거
        rootMargin: "0px 0px -50px 0px", // 하단에서 50px 전에 트리거
      },
    );

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-8">
      {/* 헤더 영역 애니메이션 */}
      <div
        className={`transition-all duration-500 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h2 className="text-2xl font-bold text-white lg:text-4xl">{title}</h2>
        <p className="mt-2 text-sm text-gray-300">{description}</p>
      </div>

      {/* SwiperList 애니메이션 */}
      <div
        className={`transition-all duration-500 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100 transition-delay-300"
            : "translate-y-8 opacity-0"
        }`}
      >
        <SwiperList movieList={displayMovies} />
      </div>
    </section>
  );
});

export default MovieSection;
