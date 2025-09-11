"use client";

import { usePathname } from "next/navigation";
import ScrollToTopButton from "app/components/ui/buttons/ScrollToTopButton";
import LoginHeader from "app/login/components/LoginHeader";
import Footer from "app/components/ui/layout/Footer";
import Header from "app/components/ui/layout/header/Header";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/sign-up";

  if (isAuthPage) {
    // 로그인/회원가입 페이지: 전용 헤더 사용
    return (
      <div className="flex min-h-screen flex-col">
        <LoginHeader />
        <main className="flex-1">{children}</main>
        <div id="modal-root" />
        <div id="alert-root" />
        <Footer />
        <ScrollToTopButton />
      </div>
    );
  }

  // 일반 페이지: 헤더/푸터 포함
  return (
    <div className="flex min-h-screen flex-col pt-24 lg:pt-32">
      <Header />
      <main className="flex-1">{children}</main>
      <div id="modal-root" />
      <div id="alert-root" />
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
