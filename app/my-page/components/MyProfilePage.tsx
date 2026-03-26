"use client";

import { useCallback } from "react";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "store/redux-toolkit/hooks";
import {
  selectUser,
  selectUserStatus,
  updateActivityLevel,
} from "store/redux-toolkit/slice/userSlice";
import ProfileAvatar from "@/components/user/ProfileAvatar";
import UserGradeInfo from "@/my-page/components/UserGradeInfo";
import formatDate from "@/utils/formatDate";
import { updateActivityLevel as updateActivityLevelAPI } from "@/utils/api/updateActivityLevel";
import {
  getActivityLevel,
  getActivityLevelInfo,
  getLoadingActivityLevel,
} from "lib/utils/getActivityLevel";

export default function MyProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userStatus = useAppSelector(selectUserStatus);

  // 활동 레벨 계산 - 인라인 로직으로 단순화
  const activityLevel = (() => {
    // 로딩 중일 때는 로딩 상태의 활동 레벨 반환
    if (userStatus === "loading") {
      return getLoadingActivityLevel();
    }

    // 사용자에게 저장된 활동 레벨이 있으면 사용, 없으면 티켓 수로 계산
    if (user?.activityLevel) {
      return getActivityLevelInfo(user.activityLevel);
    }

    return getActivityLevel(user?.myTicketsCount || 0);
  })();

  // 포트폴리오용 등급 변경 핸들러 (실제 API 호출)
  const handleGradeChange = useCallback(
    async (newGrade: string) => {
      if (!user?.uid) {
        throw new Error("사용자 정보가 없습니다.");
      }

      try {
        // 실제 API 호출로 등급 업데이트
        const result = await updateActivityLevelAPI(user.uid, newGrade);

        // Redux 상태 업데이트
        dispatch(updateActivityLevel(newGrade));

        console.log(`등급 변경 완료: ${user.activityLevel} → ${newGrade}`);
        console.log("API 응답:", result);

        // 성공 피드백 (선택적)
        if (typeof window !== "undefined") {
          window.alert(`등급이 ${newGrade}로 변경되었습니다!`);
        }
      } catch (error) {
        console.error("등급 변경 실패:", error);

        // 실패 시 사용자에게 알림
        if (typeof window !== "undefined") {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "등급 변경에 실패했습니다.";
          window.alert(`오류: ${errorMessage}`);
        }

        // 에러를 다시 던져서 UI에서 로딩 상태 해제
        throw error;
      }
    },
    [dispatch, user?.uid, user?.activityLevel],
  );

  return (
    <section className="w-full">
      {/* 프로필 정보 */}
      <div className="mx-auto flex max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-2xl lg:px-8">
        <div className="flex items-center gap-4">
          {/* 프로필 이미지 */}
          <ProfileAvatar
            userDisplayName={user?.displayName || "사용자"}
            s3photoKey={user?.photoKey || undefined}
            size={96}
            showLoading={true}
          />
          {/* 사용자 정보 */}
          <div className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-800">
                  {user?.displayName || "사용자"}
                </h1>
                {/* 사용자 등급 */}
                <UserGradeInfo
                  currentLevel={activityLevel}
                  currentReviewCount={user?.myTicketsCount || 0}
                  onGradeChange={handleGradeChange}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600">{user?.email}</p>
            {/* 프로필 편집 버튼 */}
            <Link
              href="/my-page/edit"
              className="bg-accent-300 hover:bg-accent-500 mt-6 inline-block items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200"
            >
              편집
            </Link>
          </div>
        </div>

        {/* 티켓 통계 */}
        <div className="border-b-2 border-dashed py-3">
          <div className="flex gap-6">
            {/* 내 티켓 수 */}
            <Link
              href={`/my-page/my-ticket-list?uid=${user?.uid}`}
              className="text-center transition-opacity hover:opacity-80"
            >
              <div className="text-lg font-bold text-gray-800">
                {user?.myTicketsCount || 0}
              </div>
              <div className="text-xs text-gray-600">내 티켓</div>
            </Link>

            {/* 좋아요한 티켓 수 */}
            <Link
              href={`/my-page/liked-ticket-list?uid=${user?.uid}`}
              className="text-center transition-opacity hover:opacity-80"
            >
              <div className="text-lg font-bold text-gray-800">
                {user?.likedTicketsCount || 0}
              </div>
              <div className="text-xs text-gray-600">좋아요</div>
            </Link>
          </div>
        </div>

        {/* 자기소개 및 가입일 정보 */}
        <div className="flex-1 pt-3">
          <div className="mb-2 text-xs text-gray-800">자기 소개</div>
          <p className="text-sm">{user?.biography || "소개글이 없습니다."}</p>
          <div className="mt-4 border-t-2 border-dashed pt-3">
            <div className="mb-2 text-xs text-gray-800">가입일</div>
            <p className="text-xs text-gray-800">
              {user?.createdAt ? formatDate(user.createdAt) : "정보 없음"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
