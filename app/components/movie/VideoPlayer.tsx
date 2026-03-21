"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import Loading from "app/loading";

// YouTube 전용 플레이어만 import하여 번들 크기 최적화
const ReactPlayer = dynamic(() => import("react-player/youtube"), {
  loading: () => (
    <div className="aspect-video rounded-xl bg-primary-700">
      <div className="flex h-full w-full items-center justify-center">
        <Loading />
      </div>
    </div>
  ),
  ssr: false, // 서버사이드 렌더링 비활성화로 초기 로딩 최적화
});

interface VideoPlayerProps {
  trailerKey: string;
  thumbnailSize?: "large" | "small";
  className?: string;
  onReady?: () => void;
  onStart?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

const VideoPlayer = ({
  trailerKey,
  thumbnailSize = "small",
  onReady,
  onStart,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      },
    );

    const currentRef = containerRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasBeenVisible]);

  return (
    <div ref={containerRef} className="relative aspect-video h-full w-full">
      {(isVisible || hasBeenVisible) && (
        <div className="h-full w-full overflow-hidden rounded-xl">
          <ReactPlayer
            url={`https://www.youtube.com/embed/${trailerKey}`}
            width="100%"
            height="100%"
            controls
            // 썸네일 모드 활성화
            light={`https://img.youtube.com/vi/${trailerKey}/${thumbnailSize === "large" ? "maxresdefault" : "mqdefault"}.jpg`}
            // 플레이어 설정 최적화
            config={{
              playerVars: {
                // 자동재생 비활성화
                autoplay: 0,
                // 관련 동영상 비표시
                rel: 0,
                // 개인정보 보호 모드 (host는 playerVars에서 제거)
                // 모듈형 브랜딩
                modestbranding: 1,
                // 전체화면 버튼 표시
                fs: 1,
              },
            }}
            onReady={onReady}
            onStart={onStart}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
          />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
