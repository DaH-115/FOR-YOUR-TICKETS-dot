import Image from "next/image";

interface BackgroundProps {
  imageUrl: string;
  isFixed?: boolean;
  height?: string; // 커버 이미지 높이를 조정할 수 있도록 추가
  aspectRatio?: string; // 종횡비를 조정할 수 있도록 추가
}

export default function Background({
  imageUrl,
  isFixed = false,
  height = "50vh", // 기본값을 50vh로 설정 (화면 높이의 50%)
  aspectRatio = "16/9", // 기본 종횡비를 16:9로 설정
}: BackgroundProps) {
  const blurImageUrl = `https://image.tmdb.org/t/p/w342/${imageUrl}`;

  return (
    <div
      className={`${isFixed ? "fixed" : "absolute"} inset-0 -z-10 w-full transition-all duration-1000 ease-out`}
      style={{
        height: isFixed ? "100vh" : height,
        aspectRatio: aspectRatio,
      }}
    >
      <Image
        src={`https://image.tmdb.org/t/p/original/${imageUrl}`}
        alt=""
        role="presentation"
        width={1920}
        height={1080}
        priority
        quality={100}
        placeholder="blur"
        blurDataURL={blurImageUrl}
        className="h-full w-full object-cover object-top"
      />
      {/* 자연스러운 페이드아웃을 위한 다층 그라데이션 - #121212 배경색 적용 */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "#121212", opacity: 0.3 }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 via-transparent to-blue-900/5" />
      {/* 하단 가장자리 부드러운 페이드아웃 - #121212로 페이드 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent" />
    </div>
  );
}
