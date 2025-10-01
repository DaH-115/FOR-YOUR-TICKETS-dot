import { Metadata } from "next";
import MyProfilePage from "app/my-page/components/MyProfilePage";

export const metadata: Metadata = {
  title: "마이 페이지",
  description: "나의 프로필 및 나의 티켓을 확인할 수 있는 페이지입니다",
};

export default function MyPage() {
  return <MyProfilePage />;
}
