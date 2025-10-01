"use client";

import React, { useMemo } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // 스마트 페이지 표시 로직
  const visiblePages = useMemo(() => {
    const maxVisible = 7;
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      // 페이지가 적으면 모두 표시
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 항상 첫 페이지와 마지막 페이지 표시
    pages.push(1);

    if (currentPage <= 4) {
      // 현재 페이지가 앞쪽에 있을 때
      for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
        pages.push(i);
      }
      if (totalPages > 5) {
        pages.push("...");
      }
    } else if (currentPage >= totalPages - 3) {
      // 현재 페이지가 뒤쪽에 있을 때
      if (totalPages > 5) {
        pages.push("...");
      }
      for (let i = Math.max(totalPages - 4, 2); i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지가 중간에 있을 때
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const pageChangeHandler = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const goToFirst = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const goToLast = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  // 페이지가 1개 이하면 렌더링하지 않음
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="페이지 네비게이션"
      className="mt-8 flex items-center justify-center gap-1 sm:gap-2"
    >
      {/* 첫 페이지 버튼 */}
      <button
        onClick={goToFirst}
        disabled={currentPage === 1}
        aria-label="첫 페이지로 이동"
        className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-700/50 text-white transition-all duration-200 hover:bg-gray-600/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-700/50 sm:h-10 sm:w-10"
      >
        <IoChevronBack className="h-4 w-4" />
        <IoChevronBack className="-ml-2 h-4 w-4" />
      </button>

      {/* 이전 페이지 버튼 */}
      <button
        onClick={goToPrevious}
        disabled={currentPage === 1}
        aria-label="이전 페이지로 이동"
        className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-700/50 text-white transition-all duration-200 hover:bg-gray-600/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-700/50 sm:h-10 sm:w-10"
      >
        <IoChevronBack className="h-4 w-4" />
      </button>

      {/* 페이지 번호들 */}
      <div className="flex items-center gap-1 sm:gap-2">
        {visiblePages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center text-gray-400 sm:h-10 sm:w-10"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => pageChangeHandler(pageNumber)}
              aria-current={isActive ? "page" : undefined}
              aria-label={`${pageNumber}페이지로 이동`}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-all duration-200 sm:h-10 sm:w-10 ${
                isActive
                  ? "bg-accent-500 text-white shadow-lg"
                  : "bg-gray-700/50 text-white hover:bg-gray-600/50"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* 다음 페이지 버튼 */}
      <button
        onClick={goToNext}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지로 이동"
        className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-700/50 text-white transition-all duration-200 hover:bg-gray-600/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-700/50 sm:h-10 sm:w-10"
      >
        <IoChevronForward className="h-4 w-4" />
      </button>

      {/* 마지막 페이지 버튼 */}
      <button
        onClick={goToLast}
        disabled={currentPage === totalPages}
        aria-label="마지막 페이지로 이동"
        className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-700/50 text-white transition-all duration-200 hover:bg-gray-600/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-gray-700/50 sm:h-10 sm:w-10"
      >
        <IoChevronForward className="h-4 w-4" />
        <IoChevronForward className="-ml-2 h-4 w-4" />
      </button>
    </nav>
  );
}
