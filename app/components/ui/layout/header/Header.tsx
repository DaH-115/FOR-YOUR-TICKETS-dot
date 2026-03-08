"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IoIosMenu } from "react-icons/io";
import HeaderDropDownMenu from "app/components/ui/navigation/HeaderDropDownMenu";
import HeaderSearchBar from "@/components/ui/navigation/HeaderSearchBar";
import HeaderSideMenu from "@/components/ui/navigation/HeaderSideMenu";
import { isAuth } from "firebase-config";
import { useAppDispatch, useAppSelector } from "store/redux-toolkit/hooks";
import { clearUser, selectUser } from "store/redux-toolkit/slice/userSlice";

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "홈" },
  { href: "/search", label: "검색" },
  { href: "/ticket-list", label: "티켓 리스트" },
];

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userDisplayName = user?.displayName;
  const userPhotoURL = user?.photoKey;
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  // 헤더 숨김 상태 (스크롤 다운 시 true)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  const logoutHandler = useCallback(async () => {
    try {
      // 1. Firebase 로그아웃
      await signOut(isAuth);

      // 2. 모든 인증 관련 데이터 정리
      localStorage.removeItem("rememberMe");

      // 3. Redux 상태 초기화
      dispatch(clearUser());

      // 4. 로그인 페이지로 이동
      router.replace("/login");
    } catch (error: unknown) {
      console.error("로그아웃 실패:", error);
      window.alert("로그아웃 중 오류가 발생했습니다.");
    }
  }, [dispatch, router]);

  // 스크롤 방향 감지 및 헤더 숨김/보임 처리
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 모바일과 데스크톱에 따른 다른 동작
      const isMobile = window.innerWidth < 1024; // lg 브레이크포인트

      if (isMobile) {
        // 모바일: 스크롤하는 순간 바로 반응
        if (currentScrollY > lastScrollY) {
          // 아래로 스크롤: 헤더 숨김
          setIsHeaderHidden(true);
        } else if (currentScrollY < lastScrollY) {
          // 위로 스크롤: 헤더 보임
          setIsHeaderHidden(false);
        }
      } else {
        // 데스크톱: 기존 로직 유지
        if (currentScrollY > 100) {
          // 아래로 스크롤: 헤더 숨김
          if (currentScrollY > lastScrollY) {
            setIsHeaderHidden(true);
          }
          // 위로 스크롤: 헤더 보임
          else if (currentScrollY < lastScrollY) {
            setIsHeaderHidden(false);
          }
        } else {
          // 최상단 근처에서는 항상 헤더 보임
          setIsHeaderHidden(false);
        }
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 w-full pt-8 pb-4 transition-all duration-500 ease-in-out lg:pt-4 ${
        // 스크롤 다운 시 헤더를 위로 숨김
        isHeaderHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="3xl:max-w-[1600px] mx-4 flex items-center justify-between md:mx-6 lg:mx-12 xl:mx-auto xl:max-w-6xl 2xl:max-w-7xl">
        {/* LOGO */}
        <Link href="/" className="max-w-48">
          <p className="px-2 text-lg leading-tight font-bold tracking-tighter text-white transition-colors duration-200 md:px-0 md:text-xl">
            Just Your Tickets
          </p>
        </Link>

        <div className="flex items-center justify-between space-x-3">
          {/* DESKTOP 메뉴 */}
          <nav className="hidden px-4 lg:block">
            <ul className="flex items-center justify-center gap-6">
              {navItems.map(({ href, label }) => (
                <li
                  key={href}
                  className="text-white transition-all duration-100 hover:font-semibold"
                >
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          {/* 프로필/로그인 섹션 */}
          <div className="hidden md:flex">
            {userDisplayName ? (
              <div className="px-4 py-3">
                <HeaderDropDownMenu
                  userDisplayName={userDisplayName}
                  userPhotoURL={userPhotoURL}
                  logoutHandler={logoutHandler}
                />
              </div>
            ) : (
              <button
                type="button"
                className="rounded-full bg-white px-4 py-3 text-sm text-black"
              >
                <Link href="/login">로그인</Link>
              </button>
            )}
          </div>

          {/* 검색 바 */}
          <HeaderSearchBar />

          {/* 모바일 메뉴 */}
          <button
            onClick={() => setIsSideMenuOpen((prev) => !prev)}
            className="cursor-pointer px-2 text-white lg:hidden"
            aria-label="메뉴 열기"
          >
            <IoIosMenu size={28} aria-hidden />
          </button>
        </div>
      </div>

      {/* 모바일 사이드 메뉴 */}
      <HeaderSideMenu
        userDisplayName={userDisplayName || "사용자"}
        userPhotoURL={userPhotoURL}
        userEmail={user?.email || ""}
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />
    </header>
  );
}
