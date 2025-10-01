import { Metadata } from "next";
import SignUpPage from "app/sign-up/SignUpPage";

export const metadata: Metadata = {
  title: "회원가입",
  description: "Just Your Tickets 회원가입 페이지입니다",
  keywords: ["회원가입", "영화", "티켓", "리뷰"],
  openGraph: {
    title: "회원가입",
    description: "Just Your Tickets 회원가입 페이지입니다",
  },
};

export default function Page() {
  return <SignUpPage />;
}
