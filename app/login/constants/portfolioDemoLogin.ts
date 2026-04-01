/**
 * 포트폴리오용 로그인 폼 기본값
 */
export function getPortfolioDemoLoginDefaults() {
  return {
    email: process.env.NEXT_PUBLIC_PORTFOLIO_DEMO_EMAIL?.trim() ?? "",
    password: process.env.NEXT_PUBLIC_PORTFOLIO_DEMO_PASSWORD ?? "",
    rememberMe: false as const,
  };
}
