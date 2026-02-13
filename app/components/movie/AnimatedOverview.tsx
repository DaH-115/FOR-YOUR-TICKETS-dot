"use client";

import { useState, useRef, useLayoutEffect } from "react";

interface AnimatedOverviewProps {
  overview: string;
  maxLines?: number;
}

export default function AnimatedOverview({
  overview,
  maxLines = 4,
}: AnimatedOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [collapsedHeight, setCollapsedHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // 실제 높이를 정확히 측정하기 위한 useLayoutEffect
  useLayoutEffect(() => {
    if (!contentRef.current) return;

    const element = contentRef.current;

    // requestAnimationFrame으로 DOM 측정 최적화
    const measureHeight = () => {
      // 임시로 높이 제한 해제
      const originalHeight = element.style.height;
      const originalMaxHeight = element.style.maxHeight;

      element.style.height = "auto";
      element.style.maxHeight = "none";

      // 실제 높이 측정 (한 번에 처리)
      const fullHeight = element.scrollHeight;

      // 자식 p 요소의 실제 line-height(px) 계산 (fallback 24)
      const paragraph = element.querySelector("p");
      const computed = paragraph ? window.getComputedStyle(paragraph) : null;
      const lineHeightPx = computed
        ? parseFloat(computed.lineHeight || "0") || 24
        : 24;
      const collapsed = Math.round(lineHeightPx * maxLines);

      // 원래 높이 복원
      element.style.height = originalHeight;
      element.style.maxHeight = originalMaxHeight;

      // 상태 업데이트를 배치로 처리
      requestAnimationFrame(() => {
        setContentHeight(fullHeight);
        setCollapsedHeight(collapsed);
        setShowButton(fullHeight > collapsed);
      });
    };

    // DOM 측정을 다음 프레임으로 지연
    requestAnimationFrame(measureHeight);
  }, [overview, maxLines]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative">
      {/* 실제 표시되는 콘텐츠 */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          height: isExpanded
            ? `${contentHeight}px`
            : `${collapsedHeight || 0}px`,
        }}
      >
        <p className="break-keep text-sm leading-relaxed text-gray-800">
          {overview}
        </p>
      </div>

      {/* 그라데이션 오버레이 */}
      {!isExpanded && showButton && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white to-transparent" />
      )}

      {/* 더 보기/접기 버튼 */}
      {showButton && (
        <div className="flex justify-end">
          <button
            onClick={toggleExpanded}
            className="mt-2 rounded-full px-3 py-1 text-xs text-gray-600 transition-all duration-200 hover:bg-primary-600 hover:text-white focus:outline-hidden focus:ring-1 focus:ring-accent-300 focus:ring-offset-1"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "줄거리 접기" : "줄거리 더 보기"}
          >
            {isExpanded ? "접기" : "더 보기"}
          </button>
        </div>
      )}
    </div>
  );
}
