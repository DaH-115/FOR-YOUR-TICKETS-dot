import { Metadata } from "next";
import LoginPage from "app/login/components/LoginPage";

export const metadata: Metadata = {
  title: "로그인",
  description: "For Your Tickets. 로그인 페이지입니다",
  keywords: ["로그인", "영화", "티켓", "리뷰"],
  openGraph: {
    title: "로그인",
    description: "For Your Tickets. 로그인 페이지입니다",
  },
};

export default function Page() {
  return <LoginPage />;
}
