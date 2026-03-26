import Image from "next/image";

interface BackgroundProps {
  imageUrl: string;
  isFixed?: boolean;
  height?: string;
  aspectRatio?: string;
  className?: string;
  /** LCP 후보 등 즉시 로드가 필요할 때만 true (기본 false, 불필요한 preload 방지) */
  priority?: boolean;
}

export default function Background({
  imageUrl,
  isFixed = false,
  height = "100vh",
  aspectRatio = "16/9",
  className = "",
  priority = false,
}: BackgroundProps) {
  return (
    <div
      className={`${isFixed ? "fixed" : "absolute"} inset-0 -z-10 w-full ${className}`}
      style={{
        height: isFixed ? "100vh" : height,
        aspectRatio: isFixed ? undefined : aspectRatio,
      }}
    >
      <Image
        src={`https://image.tmdb.org/t/p/w1280/${imageUrl}`}
        alt=""
        role="presentation"
        width={1920}
        height={1080}
        priority={priority}
        quality={80}
        placeholder="blur"
        blurDataURL={`https://image.tmdb.org/t/p/w92/${imageUrl}`}
        className="h-full w-full object-cover object-top"
      />

      {/* 오버레이 */}
      <div className="absolute inset-0 bg-[#121212]/30" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/10 to-black/70" />
      <div className="absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-[#121212] via-[#121212]/80 to-transparent" />
    </div>
  );
}
