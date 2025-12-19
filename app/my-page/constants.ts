// 마이페이지 메뉴 아이템 타입
export interface MyPageMenuItem {
  href: string;
  label: string;
}

/**
 * 마이페이지 메뉴 목록
 * - 데스크톱 사이드 메뉴와 모바일 헤더 메뉴에서 공통으로 사용
 */
export const MY_PAGE_MENU_ITEMS: MyPageMenuItem[] = [
  { href: "/my-page", label: "마이 페이지" },
  { href: "/my-page/my-ticket-list", label: "나의 티켓" },
  { href: "/my-page/liked-ticket-list", label: "좋아요한 티켓" },
  { href: "/my-page/watchlist", label: "보고 싶은 영화" },
];
