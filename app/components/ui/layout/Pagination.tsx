"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (newPage: number) => void;
  pageHref?: (page: number) => string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageHref,
}: PaginationProps) {
  const visiblePages = useMemo(() => {
    const maxVisible = 7;
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage <= 4) {
      for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
        pages.push(i);
      }
      if (totalPages > 5) {
        pages.push("...");
      }
    } else if (currentPage >= totalPages - 3) {
      if (totalPages > 5) {
        pages.push("...");
      }
      for (let i = Math.max(totalPages - 4, 2); i < totalPages; i++) {
        pages.push(i);
      }
    } else {
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

  if (totalPages <= 1) {
    return null;
  }

  const navButtonClass =
    "flex h-8 w-8 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-gray-600/50 sm:h-10 sm:w-10";
  const disabledClass = "cursor-not-allowed opacity-50";

  const renderNavButton = (
    targetPage: number,
    disabled: boolean,
    label: string,
    children: React.ReactNode,
  ) => {
    if (disabled) {
      return (
        <span className={`${navButtonClass} ${disabledClass}`} aria-label={label}>
          {children}
        </span>
      );
    }

    if (pageHref) {
      return (
        <Link
          href={pageHref(targetPage)}
          className={navButtonClass}
          aria-label={label}
          scroll={false}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        onClick={() => onPageChange?.(targetPage)}
        className={navButtonClass}
        aria-label={label}
      >
        {children}
      </button>
    );
  };

  const renderPageButton = (pageNumber: number) => {
    const isActive = pageNumber === currentPage;
    const className = `flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 sm:h-10 sm:w-10 ${
      isActive
        ? "bg-accent-500 text-white shadow-lg"
        : "text-white hover:bg-gray-600/50"
    }`;

    if (isActive) {
      return (
        <span className={className} aria-current="page" aria-label={`${pageNumber}페이지`}>
          {pageNumber}
        </span>
      );
    }

    if (pageHref) {
      return (
        <Link
          href={pageHref(pageNumber)}
          className={className}
          aria-label={`${pageNumber}페이지로 이동`}
          scroll={false}
        >
          {pageNumber}
        </Link>
      );
    }

    return (
      <button
        onClick={() => onPageChange?.(pageNumber)}
        className={className}
        aria-label={`${pageNumber}페이지로 이동`}
      >
        {pageNumber}
      </button>
    );
  };

  return (
    <nav
      aria-label="페이지 네비게이션"
      className="mt-10 flex items-center justify-center gap-1 sm:gap-2"
    >
      {/* 첫 페이지 버튼 */}
      {renderNavButton(1, currentPage === 1, "첫 페이지로 이동", (
        <>
          <IoChevronBack className="h-4 w-4" />
          <IoChevronBack className="-ml-2 h-4 w-4" />
        </>
      ))}

      {/* 이전 페이지 버튼 */}
      {renderNavButton(currentPage - 1, currentPage === 1, "이전 페이지로 이동", (
        <IoChevronBack className="h-4 w-4" />
      ))}

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

          return (
            <React.Fragment key={page as number}>
              {renderPageButton(page as number)}
            </React.Fragment>
          );
        })}
      </div>

      {/* 다음 페이지 버튼 */}
      {renderNavButton(currentPage + 1, currentPage === totalPages, "다음 페이지로 이동", (
        <IoChevronForward className="h-4 w-4" />
      ))}

      {/* 마지막 페이지 버튼 */}
      {renderNavButton(totalPages, currentPage === totalPages, "마지막 페이지로 이동", (
        <>
          <IoChevronForward className="h-4 w-4" />
          <IoChevronForward className="-ml-2 h-4 w-4" />
        </>
      ))}
    </nav>
  );
}
