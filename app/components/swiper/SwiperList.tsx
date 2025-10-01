"use client";

import { useRef } from "react";
import { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper/modules";
import SwiperItem from "@/components/swiper/SwiperItem";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";
import SwiperButton from "@/components/swiper/SwiperButton";

export default function SwiperList({ movieList }: { movieList: MovieList[] }) {
  const swiperRef = useRef<SwiperClass | null>(null);

  return (
    <div className="group relative">
      {/* Swiper */}
      <Swiper
        loop={true}
        modules={[Navigation, Pagination]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        breakpoints={{
          320: { slidesPerView: 2, spaceBetween: 10 },
          640: { slidesPerView: 3, spaceBetween: 10 },
          768: { slidesPerView: 4, spaceBetween: 10 },
          1000: { slidesPerView: 5, spaceBetween: 10 },
          1080: { slidesPerView: 6, spaceBetween: 10 },
          1440: { slidesPerView: 7, spaceBetween: 10 },
        }}
      >
        {movieList.map((movie, idx) => (
          <SwiperSlide key={movie.id}>
            <SwiperItem idx={idx} movie={movie} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 좌측 버튼 */}
      <SwiperButton
        direction="prev"
        onClick={() => swiperRef.current?.slidePrev()}
      />

      {/* 우측 버튼 */}
      <SwiperButton
        direction="next"
        onClick={() => swiperRef.current?.slideNext()}
      />
    </div>
  );
}
