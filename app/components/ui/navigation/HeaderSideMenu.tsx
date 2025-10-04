"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoMdClose } from "react-icons/io";
import ProfileAvatar from "app/components/user/ProfileAvatar";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";

interface HeaderSideMenuProps {
  userDisplayName: string;
  userPhotoURL: string | null | undefined;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

export interface MenuItem {
  href: string;
  label: string;
}

const menuItems: MenuItem[] = [
  { href: "/", label: "홈" },
  { href: "/search", label: "검색" },
  { href: "/ticket-list", label: "티켓 리스트" },
];

const userMenuItems: MenuItem[] = [
  { href: "/my-page", label: "나의 프로필" },
  { href: "/my-page/my-ticket-list", label: "나의 티켓" },
  { href: "/my-page/liked-ticket-list", label: "좋아요한 티켓" },
  { href: "/my-page/watchlist", label: "보고 싶은 영화" },
];

export default function HeaderSideMenu({
  userDisplayName,
  userPhotoURL,
  userEmail,
  isOpen,
  onClose,
}: HeaderSideMenuProps) {
  const user = useAppSelector(selectUser);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 스크롤 방지
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-300 ${
        isOpen ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* 메뉴 패널 */}
      <div
        className={`fixed right-0 top-0 h-full w-full bg-black transition-transform duration-300 ease-out md:w-2/3 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="font-semibold text-white">메뉴</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white hover:bg-white/20"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* 사용자 프로필 */}
        <div className="border-y border-white/20 p-6">
          {user?.uid ? (
            <div className="flex items-center space-x-4">
              <ProfileAvatar
                userDisplayName={userDisplayName}
                s3photoKey={userPhotoURL || undefined}
                size={48}
                showLoading={true}
              />
              <div>
                <p className="font-medium text-white">{userDisplayName}</p>
                <p className="text-gray-300">{userEmail}</p>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="block w-full font-medium text-white"
            >
              로그인
            </Link>
          )}
        </div>

        {/* 메인 메뉴 */}
        <div className="p-6">
          <nav>
            <ul>
              {menuItems.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onClose}
                      className={`block w-full rounded-full px-6 py-3 text-left ${
                        isActive
                          ? "font-semibold text-accent-300"
                          : "text-gray-300 hover:text-accent-300"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 사용자 메뉴 */}
          {user?.uid && (
            <div className="mt-6 border-t border-white/20 pt-6">
              <h3 className="mb-2 text-sm font-medium text-gray-400">
                나의 메뉴
              </h3>
              <ul>
                {userMenuItems.map(({ href, label }) => {
                  const isActive = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        className={`block w-full rounded-full px-6 py-3 text-left ${
                          isActive
                            ? "font-semibold text-accent-300"
                            : "text-gray-300 hover:text-accent-300"
                        }`}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
