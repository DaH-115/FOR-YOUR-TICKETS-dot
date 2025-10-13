"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MY_PAGE_MENU_ITEMS } from "@/my-page/constants";

/**
 * 마이페이지 모바일 헤더 메뉴
 * - 모바일/태블릿 화면에서만 표시 (lg 이하)
 * - 현재 경로에 따라 활성 상태 표시
 */
export default function MobileMenu() {
  const pathname = usePathname();

  return (
    <nav className="mb-12 flex w-full items-center space-x-2 overflow-x-auto text-gray-300 scrollbar-hide lg:hidden">
      {MY_PAGE_MENU_ITEMS.map(({ href, label }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
              isActive
                ? "border-white bg-white text-black"
                : "border-gray-600 text-gray-300 hover:border-gray-400 hover:text-gray-100"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
