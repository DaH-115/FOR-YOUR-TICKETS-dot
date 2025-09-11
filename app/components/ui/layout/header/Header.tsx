"use client";

import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IoIosMenu } from "react-icons/io";
import HeaderDropDownMenu from "app/components/ui/navigation/HeaderDropDownMenu";
import HeaderSearchBar from "app/components/ui/navigation/HeaderSearchBar";
import HeaderSideMenu from "app/components/ui/navigation/HeaderSideMenu";
import { isAuth } from "firebase-config";
import { useAppDispatch, useAppSelector } from "store/redux-toolkit/hooks";
import { clearUser, selectUser } from "store/redux-toolkit/slice/userSlice";

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/ticket-list", label: "Ticket List" },
];

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userDisplayName = user?.displayName;
  const userPhotoURL = user?.photoKey;
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

      // 스크롤 위치가 100px 이상일 때만 헤더 숨김/보임 처리
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

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSideMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isSideMenuOpen]);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 flex w-full items-center justify-between bg-gradient-to-b from-black via-black/80 to-transparent px-6 pb-4 pt-8 text-xs transition-all duration-500 ease-in-out ${
        // 스크롤 다운 시 헤더를 위로 숨김
        isHeaderHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* LOGO */}
      <h1 className="mr-2 text-lg font-bold tracking-tighter text-white sm:mr-4 md:text-xl">
        Just Your Tickets
      </h1>

      {/* DESKTOP NAVIGATION - 중앙 배치 */}
      <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        <div
          className={`flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 transition-all duration-300 hover:border-white/50 hover:bg-white/20 ${
            !isSideMenuOpen ? "backdrop-blur-sm" : ""
          }`}
        >
          <nav>
            <ul className="flex items-center justify-center gap-2">
              {navItems.map(({ href, label }) => (
                <li key={href} className="group relative">
                  <Link
                    href={href}
                    className="rounded-full px-3 py-2 font-medium text-white/90 transition-all duration-300 ease-in-out hover:bg-white/20 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* USER PROFILE/LOGIN SECTION */}
        <div
          className={`hidden transition-all duration-300 md:flex ${isSearchOpen ? "invisible opacity-0" : "visible opacity-100"}`}
        >
          {userDisplayName ? (
            <div className="px-6 py-3">
              <HeaderDropDownMenu
                userDisplayName={userDisplayName}
                userPhotoURL={userPhotoURL}
                logoutHandler={logoutHandler}
              />
            </div>
          ) : (
            <Link href="/login">
              <button
                type="button"
                className="rounded-full border-2 border-white bg-white px-6 py-3 font-bold text-black shadow-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-xl"
              >
                로그인
              </button>
            </Link>
          )}
        </div>

        {/* SEARCH BAR */}
        <HeaderSearchBar
          isSideMenuOpen={isSideMenuOpen}
          onSearchOpenChange={setIsSearchOpen}
        />

        {/* MOBILE HAMBURGER MENU - 오른쪽 끝 배치 */}
        <button
          onClick={() => setIsSideMenuOpen((prev) => !prev)}
          className="rounded-full p-2 text-white transition-colors duration-300 hover:bg-white/20 md:hidden"
          aria-label="메뉴 열기"
        >
          <IoIosMenu size={32} aria-hidden />
        </button>
      </div>

      {/* MOBILE SIDE MENU */}
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
