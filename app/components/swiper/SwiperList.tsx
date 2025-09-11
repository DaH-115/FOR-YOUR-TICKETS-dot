import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import { Navigation } from "swiper/modules";
import SwiperButton from "app/components/swiper/SwiperButton";
import SwiperItem from "app/components/swiper/SwiperItem";
import { MovieList } from "lib/movies/fetchNowPlayingMovies";

export default function SwiperList({ movieList }: { movieList: MovieList[] }) {
  return (
    <Swiper
      speed={500}
      loop={true}
      navigation={false}
      modules={[Navigation]}
      breakpoints={{
        320: {
          slidesPerView: 1.5,
        },
        480: {
          slidesPerView: 2.5,
        },
        640: {
          slidesPerView: 3.5,
        },
        768: {
          slidesPerView: 4,
        },
        1024: {
          slidesPerView: 5,
        },
        1280: {
          slidesPerView: 6,
        },
        1440: {
          slidesPerView: 6.5,
        },
      }}
    >
      {movieList.map((movie, idx) => (
        <SwiperSlide key={movie.id} className="px-1 py-4 md:px-2 md:py-6">
          <SwiperItem idx={idx} movie={movie} />
        </SwiperSlide>
      ))}
      <SwiperButton direction="prev" />
      <SwiperButton direction="next" />
    </Swiper>
  );
}
