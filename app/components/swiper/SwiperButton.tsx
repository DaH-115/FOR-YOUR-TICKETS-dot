import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useSwiper } from "swiper/react";

export default function SwiperButton({
  direction,
}: {
  direction: "next" | "prev";
}) {
  const swiper = useSwiper();
  const ariaLabel = direction === "next" ? "다음 슬라이드" : "이전 슬라이드";

  return (
    <button
      onClick={() =>
        direction === "next" ? swiper.slideNext() : swiper.slidePrev()
      }
      className={`absolute top-1/2 z-50 -translate-y-1/2 items-center justify-center rounded-full bg-gray-900/80 p-2 text-sm text-white shadow-md transition-all duration-300 ease-in-out hover:scale-110 focus:border-none focus:outline-none focus:ring-1 focus:ring-accent-300 md:p-3 md:text-base ${
        direction === "prev" ? "left-2 md:left-4" : "right-2 md:right-4"
      }`}
      aria-label={ariaLabel}
    >
      {direction === "next" ? (
        <FaArrowRight aria-hidden />
      ) : (
        <FaArrowLeft aria-hidden />
      )}
    </button>
  );
}
