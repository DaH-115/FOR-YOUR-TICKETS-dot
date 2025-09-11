"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import LatestReviewTicket from "app/home/components/reviews/LatestReviewTicket";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import { useResponsiveCount } from "app/utils/hooks/useResponsiveCount";

function LatestReviewList({ reviews }: { reviews: ReviewDoc[] }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const maxReviewCount = useResponsiveCount(3, 4, 8); // 모바일: 3개, 태블릿: 4개, 데스크톱: 8개

  // IntersectionObserver 설정 - 한 번만 실행되도록 최적화
  const observerCallback = useCallback(
    ([entry]: IntersectionObserverEntry[]) => {
      // 컴포넌트가 화면에 20% 이상 보일 때 애니메이션 시작
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    },
    [],
  );

  useEffect(() => {
    const currentSection = sectionRef.current;
    if (!currentSection || isVisible) return; // 이미 보이면 observer 생성하지 않음

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.2, // 20% 이상 보일 때 트리거
      rootMargin: "0px 0px -50px 0px", // 하단에서 50px 전에 트리거
    });

    observer.observe(currentSection);

    return () => {
      observer.unobserve(currentSection);
    };
  }, [observerCallback, isVisible]);

  return (
    <section ref={sectionRef} className="py-8 md:pb-16">
      {/* 헤더 영역 애니메이션 */}
      <header
        className={`mb-4 transition-all duration-500 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-white lg:text-4xl">
          새로운 티켓
        </h2>
        <div className="flex items-center">
          <p className="text-sm text-gray-300">
            최근 등록된 티켓을 확인해 보세요
          </p>
          <Link
            href="/ticket-list"
            className="ml-2 text-xs text-accent-300 transition-colors duration-300 hover:font-semibold hover:text-accent-200 hover:underline hover:underline-offset-2"
          >
            모든 티켓 보기
          </Link>
        </div>
      </header>

      {/* 리뷰 티켓 목록 애니메이션 */}
      <div
        className={`mx-auto grid grid-cols-1 gap-4 transition-all duration-500 ease-out md:grid-cols-2 md:py-4 lg:grid-cols-4 ${
          isVisible
            ? "translate-y-0 opacity-100 transition-delay-300"
            : "translate-y-8 opacity-0"
        }`}
      >
        {useMemo(
          () =>
            reviews
              .slice(0, maxReviewCount)
              .map((review) => (
                <LatestReviewTicket key={review.id} review={review} />
              )),
          [reviews, maxReviewCount],
        )}
      </div>
    </section>
  );
}

export default memo(LatestReviewList);
