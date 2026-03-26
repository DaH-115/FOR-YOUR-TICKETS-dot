"use client";

import Link from "next/link";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import { FaGithub } from "react-icons/fa";
import { MdDescription } from "react-icons/md";

export default function Footer() {
  const user = useAppSelector(selectUser);
  const isLoggedIn = !!user?.uid;

  const mainMenuItems = [
    { href: "/", label: "홈" },
    { href: "/search", label: "검색" },
    { href: "/ticket-list", label: "티켓 리스트" },
  ];

  const userMenuItems = [
    { href: "/my-page", label: "나의 페이지" },
    {
      href: `/my-page/my-ticket-list?uid=${user?.uid}`,
      label: "나의 티켓",
    },
    { href: "/my-page/liked-ticket-list", label: "좋아요한 티켓" },
  ];

  const authMenuItems = [{ href: "/login", label: "로그인" }];

  const externalLinks = [
    {
      href: "https://zippy-position-4e4.notion.site/Dahyun-Gwak-45235441d63641798c44ee9d7ed607f5",
      label: "이력서",
      icon: MdDescription,
    },
    {
      href: "https://github.com/DaH-115/JUST-YOUR-TICKETS-dot",
      label: "GitHub",
      icon: FaGithub,
    },
  ];

  return (
    <footer className="mt-8 bg-black/80 px-6 text-white lg:mt-16">
      <div className="mx-auto max-w-7xl py-8">
        {/* 메인 푸터 콘텐츠 */}
        <div className="mb-12">
          <h2 className="text-xl font-bold tracking-tighter text-white">
            Just Your Tickets
          </h2>
          <p className="text-xs text-gray-300">
            나만의 영화 티켓을 만들어보세요.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 메인 메뉴 */}
          <div>
            <h3 className="text-lg font-semibold text-white">메인 메뉴</h3>
            <ul className="text-base">
              {mainMenuItems.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-gray-300 transition-colors duration-300 hover:text-white"
                  >
                    <span className="text-xs">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 마이 메뉴 */}
          {isLoggedIn ? (
            <div>
              <h3 className="text-lg font-semibold text-white">나의 메뉴</h3>
              <ul className="text-base">
                {userMenuItems.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-gray-300 transition-colors duration-300 hover:text-white"
                    >
                      <span className="text-xs">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="space-y-2">
              {authMenuItems.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}>
                    <span className="text-sm font-semibold text-white">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 구분선 */}
        <div className="border-primary-500 mt-8 mb-6 border-t-2 border-dashed"></div>

        {/* 하단 저작권 정보 */}
        <div className="mb-6 flex flex-col items-center space-y-2 text-xs md:mb-4 md:flex-row md:space-y-0 md:space-x-2">
          <span>© {new Date().getFullYear()} GWAK DA HYUN</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">All rights reserved</span>
          <span className="text-gray-300">
            포트폴리오 목적으로 제작된 프로젝트
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 md:justify-start">
          {externalLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 transition-colors duration-300 hover:text-white"
              aria-label={label}
            >
              <Icon className="text-xl md:text-2xl" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
