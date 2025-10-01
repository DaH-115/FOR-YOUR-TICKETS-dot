"use client";

import { MenuItem } from "app/components/ui/navigation/HeaderSideMenu";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems: MenuItem[] = [
  { href: "/my-page", label: "나의 프로필" },
  { href: "/my-page/my-ticket-list", label: "작성한 티켓" },
  { href: "/my-page/liked-ticket-list", label: "좋아요한 티켓" },
  { href: "/my-page/watchlist", label: "보고 싶은 영화" },
];

export default function SideMenu() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-1/3 space-y-1 md:block xl:space-y-2">
      {menuItems.map(({ href, label }) => {
        const isActive = pathname === href;

        return (
          <div key={href} className="w-full">
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
          </div>
        );
      })}
    </aside>
  );
}
