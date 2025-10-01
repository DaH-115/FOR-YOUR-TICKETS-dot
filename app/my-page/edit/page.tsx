import { Metadata } from "next";
import ProfileEditForm from "app/my-page/edit/ProfileEditForm";

export const metadata: Metadata = {
  title: "프로필 편집 - My Page",
  description: "나의 프로필을 편집할 수 있는 페이지입니다",
};

export default function ProfileEditPage() {
  return <ProfileEditForm />;
}
