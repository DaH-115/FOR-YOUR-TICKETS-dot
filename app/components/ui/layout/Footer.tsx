"use client";

import Link from "next/link";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";

export default function Footer() {
  const user = useAppSelector(selectUser);
  const isLoggedIn = !!user?.uid;

  const mainMenuItems = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    { href: "/ticket-list", label: "Ticket List" },
  ];

  const userMenuItems = [
    { href: "/my-page", label: "My Page" },
    {
      href: `/my-page/my-ticket-list?uid=${user?.uid}`,
      label: "My Ticket List",
    },
    { href: "/my-page/liked-ticket-list", label: "Liked Tickets" },
  ];

  const authMenuItems = [
    { href: "/login", label: "Login" },
    { href: "/sign-up", label: "Sign Up" },
  ];

  const externalLinks = [
    {
      href: "https://zippy-position-4e4.notion.site/Dahyun-Gwak-45235441d63641798c44ee9d7ed607f5",
      label: "이력서",
    },
    {
      href: "https://github.com/DaH-115/JUST-YOUR-TICKETS-dot",
      label: "GitHub",
    },
  ];

  return (
    <footer className="bg-primary-700 text-white">
      <div className="mx-auto px-6 py-12 sm:px-6 lg:px-8">
        {/* 메인 푸터 콘텐츠 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* 브랜드 섹션 */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tighter text-white">
                Just Your Tickets
              </h2>
              <p className="mt-2 text-sm text-gray-300">
                나만의 영화 티켓을 만들어보세요
              </p>
            </div>
            <div className="flex items-center text-sm lg:text-base">
              {externalLinks.map(({ href, label }, index) => (
                <span key={href} className="flex items-center">
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 transition-colors duration-300 hover:text-white"
                  >
                    {label}
                  </Link>
                  {index < externalLinks.length - 1 && (
                    <span className="mx-2 text-gray-400 lg:mx-3"> · </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* 메인 메뉴 */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-white lg:mb-4">
              Main Menu
            </h3>
            <ul className="space-y-1 lg:space-y-3">
              {mainMenuItems.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-gray-300 transition-colors duration-300 hover:text-white"
                  >
                    <span className="text-sm">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 사용자 메뉴 */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-white lg:mb-4">
              {isLoggedIn ? "My Menu" : "Account"}
            </h3>
            <ul className="space-y-1 lg:space-y-3">
              {isLoggedIn
                ? userMenuItems.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-gray-300 transition-colors duration-300 hover:text-white"
                      >
                        <span className="text-sm">{label}</span>
                      </Link>
                    </li>
                  ))
                : authMenuItems.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-gray-300 transition-colors duration-300 hover:text-white"
                      >
                        <span className="text-sm">{label}</span>
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="my-8 border-t-4 border-dotted border-primary-500"></div>

        {/* 하단 저작권 정보 */}
        <div className="flex flex-col items-center space-y-2 text-sm md:flex-row md:space-x-2 md:space-y-0">
          <span>© {new Date().getFullYear()} GWAK DA HYUN</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">All rights reserved</span>
          <span className="text-xs text-gray-300">
            포트폴리오 목적으로 제작된 프로젝트
          </span>
        </div>
      </div>
    </footer>
  );
}
