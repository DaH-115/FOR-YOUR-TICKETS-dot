import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export default function SwiperButton({
  direction,
  onClick,
}: {
  direction: "next" | "prev";
  onClick: () => void;
}) {
  const ariaLabel = direction === "next" ? "다음 슬라이드" : "이전 슬라이드";

  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 z-50 hidden text-3xl text-white/80 opacity-0 transition-all duration-150 ease-out hover:scale-110 group-hover:opacity-100 xl:block ${
        direction === "prev" ? "-left-12" : "-right-12"
      }`}
      aria-label={ariaLabel}
    >
      {direction === "next" ? (
        <IoChevronForward aria-hidden />
      ) : (
        <IoChevronBack aria-hidden />
      )}
    </button>
  );
}
