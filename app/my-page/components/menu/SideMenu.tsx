"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MY_PAGE_MENU_ITEMS } from "@/my-page/constants";

/**
 * 마이페이지 데스크톱 사이드 메뉴
 * - 데스크톱 화면에서만 표시 (lg 이상)
 * - 현재 경로에 따라 활성 상태 표시
 */
export default function SideMenu() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-1/3 space-y-1 lg:block xl:space-y-2">
      {MY_PAGE_MENU_ITEMS.map(({ href, label }) => {
        const isActive = pathname === href;

        return (
          <nav key={href} className="w-full">
            <Link
              href={href}
              className={`block w-full transition-all duration-300 ease-in-out ${
                isActive
                  ? "my-2 text-xl font-bold text-accent-300 xl:my-4 xl:text-2xl"
                  : "text-lg text-gray-300 hover:text-accent-300 xl:text-xl"
              }`}
            >
              {label}
            </Link>
          </nav>
        );
      })}
    </aside>
  );
}
