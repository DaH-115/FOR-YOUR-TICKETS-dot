"use client";

import { useState } from "react";
import { FaInfoCircle, FaTimes, FaCog } from "react-icons/fa";
import {
  ActivityLevel,
  gradeInfoData,
  getCurrentGradeInfo,
  getNextGradeInfo,
  getProgressToNext,
} from "lib/utils/getActivityLevel";

interface UserGradeInfoProps {
  currentLevel: ActivityLevel;
  currentReviewCount: number;
  onGradeChange?: (newGrade: string) => Promise<void>; // 개발용 등급 변경 핸들러
}

export default function UserGradeInfo({
  currentLevel,
  currentReviewCount,
  onGradeChange,
}: UserGradeInfoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangingGrade, setIsChangingGrade] = useState(false);

  // 포트폴리오 기능 활성화 (모든 환경에서 사용 가능)
  const isPortfolioMode = true;

  // 중앙화된 유틸리티 함수들 사용
  const currentGradeInfo = getCurrentGradeInfo(currentLevel);
  const nextGradeInfo = getNextGradeInfo(currentLevel);
  const progressPercentage = getProgressToNext(
    currentLevel,
    currentReviewCount,
  );

  // 개발용 등급 변경 핸들러
  const handleGradeChange = async (newGrade: string) => {
    if (!onGradeChange || isChangingGrade) return;

    setIsChangingGrade(true);
    try {
      await onGradeChange(newGrade);
    } catch (error) {
      console.error("등급 변경 실패:", error);
      alert("등급 변경에 실패했습니다.");
    } finally {
      setIsChangingGrade(false);
    }
  };

  // 안전한 스타일 적용을 위한 등급별 클래스 맵핑
  const getBadgeStyle = (
    level: ActivityLevel | { label: string },
    size: "small" | "medium" | "default" = "default",
  ) => {
    const sizeClasses = {
      small: "rounded-full px-2 py-1 text-xs font-medium",
      medium: "rounded-full px-3 py-1 text-sm font-medium",
      default: "rounded-full px-3 py-1 text-xs font-medium",
    };

    const baseClasses = sizeClasses[size];

    switch (level.label) {
      case "NEWBIE":
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case "REGULAR":
        return `${baseClasses} bg-green-100 text-green-700`;
      case "ACTIVE":
        return `${baseClasses} bg-blue-100 text-blue-700`;
      case "EXPERT":
        return `${baseClasses} bg-purple-100 text-purple-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  };

  return (
    <>
      {/* 등급 정보 버튼 */}
      <div className="flex items-center gap-2">
        <div className={getBadgeStyle(currentLevel)}>{currentLevel.label}</div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-gray-300 transition-colors hover:text-gray-500"
          aria-label="등급 정보 보기"
        >
          <FaInfoCircle size={16} />
        </button>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between border-b bg-white p-4">
              <h2 className="text-lg font-bold text-gray-800">
                유저 등급 시스템
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 transition-colors hover:text-gray-600"
                aria-label="모달 닫기"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* 스크롤 가능한 콘텐츠 영역 */}
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="p-4">
                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">
                    현재 등급
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className={getBadgeStyle(currentLevel, "medium")}>
                      {currentLevel.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentReviewCount}개 리뷰 작성
                    </div>
                  </div>
                  {currentGradeInfo && (
                    <p className="mt-2 text-sm text-gray-700">
                      {currentGradeInfo.description}
                    </p>
                  )}
                </div>

                {/* 다음 등급까지의 진행률 */}
                {nextGradeInfo && (
                  <div className="mb-4 rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-800">
                      다음 등급까지
                    </h3>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {nextGradeInfo.label}까지
                      </span>
                      <span className="font-medium text-gray-800">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    {currentGradeInfo && (
                      <p className="text-xs text-gray-600">
                        {currentGradeInfo.nextGoal}
                      </p>
                    )}
                  </div>
                )}

                {/* 모든 등급 정보 */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-800">
                    등급별 상세 정보
                  </h3>
                  <div className="space-y-3">
                    {gradeInfoData.map((grade) => (
                      <div
                        key={grade.label}
                        className={`rounded-lg border-2 p-3 ${
                          grade.label === currentLevel.label
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={getBadgeStyle(
                                { label: grade.label },
                                "small",
                              )}
                            >
                              {grade.label}
                            </div>
                            <span className="text-xs text-gray-600">
                              {grade.range} 리뷰
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {grade.label === currentLevel.label && (
                              <span className="text-xs font-medium text-blue-600">
                                현재 등급
                              </span>
                            )}
                            {/* 포트폴리오 데모용 등급 변경 버튼 */}
                            {isPortfolioMode &&
                              onGradeChange &&
                              grade.label !== currentLevel.label && (
                                <button
                                  onClick={() => handleGradeChange(grade.label)}
                                  disabled={isChangingGrade}
                                  className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-200 disabled:opacity-50"
                                  title="이 등급으로 변경해보기"
                                >
                                  {isChangingGrade ? "변경중..." : "체험"}
                                </button>
                              )}
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-700">
                          {grade.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 포트폴리오 데모 안내 */}
                {isPortfolioMode && onGradeChange && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-center gap-2">
                      <FaCog className="text-amber-600" size={14} />
                      <h4 className="text-sm font-semibold text-amber-800">
                        포트폴리오 데모 기능
                      </h4>
                    </div>
                    <p className="mt-1 text-xs text-amber-700">
                      등급 시스템을 체험해보세요! 각 등급의 &quot;체험&quot;
                      버튼을 클릭하면 실제로 등급이 변경되어 UI 변화를 확인할 수
                      있습니다.
                    </p>
                    <p className="mt-1 text-xs text-amber-600">
                      💡 실제 서비스에서는 리뷰 작성 개수에 따라 자동으로 등급이
                      상승합니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
