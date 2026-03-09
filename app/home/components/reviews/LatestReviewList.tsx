"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import LatestReviewTicket from "app/home/components/reviews/LatestReviewTicket";
import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import { IoChevronForward } from "react-icons/io5";

function LatestReviewList({ reviews }: { reviews: ReviewDoc[] }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // 클라이언트 사이드 렌더링 상태 설정
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    <section
      ref={sectionRef}
      className="mx-6 lg:mt-20 xl:mx-auto xl:max-w-5xl 2xl:max-w-6xl"
    >
      {/* 헤더 영역 애니메이션 */}
      <header
        className={`mb-4 flex items-center justify-between transition-all duration-500 ease-out ${
          isClient && isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        <h2 className="text-xl font-bold tracking-tight text-white">
          새로운 티켓
        </h2>
        <div className="flex items-center">
          <Link
            href="/ticket-list"
            className="text-accent-300 text-sm transition-colors duration-300 hover:font-semibold"
          >
            모든 티켓 보기
          </Link>
          <IoChevronForward className="text-accent-300 text-sm" aria-hidden />
        </div>
      </header>

      {/* 티켓 목록 애니메이션 */}
      <div
        className={`mx-auto grid grid-cols-1 gap-x-2 gap-y-2 transition-all duration-500 ease-out md:grid-cols-2 md:gap-y-4 lg:grid-cols-3 lg:gap-y-6 ${
          isClient && isVisible
            ? "transition-delay-300 translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        {reviews.map((review) => (
          <LatestReviewTicket key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}

export default memo(LatestReviewList);
