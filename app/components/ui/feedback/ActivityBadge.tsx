import { useMemo } from "react";
import {
  getActivityLevel,
  getActivityLevelInfo,
  ActivityLevel,
} from "lib/utils/getActivityLevel";

interface ActivityBadgeProps {
  activityLevel?: string; // "NEWBIE", "REGULAR", "ACTIVE", "EXPERT"
  size?: "tiny" | "small" | "medium";
  className?: string;
}

// 크기별 스타일 정의 (컴포넌트 외부에서 정의하여 재렌더링마다 재생성 방지)
const sizeClasses = {
  tiny: "p-1 text-[10px] leading-none",
  small: "px-2 py-0.5 text-xs",
  medium: "px-3 py-1 text-sm",
} as const;

export default function ActivityBadge({
  activityLevel,
  size = "tiny",
  className = "",
}: ActivityBadgeProps) {
  // 중앙화된 유틸리티 함수를 활용한 활동 레벨 계산
  const computedActivityLevel = useMemo((): ActivityLevel => {
    if (activityLevel) {
      return getActivityLevelInfo(activityLevel);
    }
    // 기본값: NEWBIE (0개 리뷰)
    return getActivityLevel(0);
  }, [activityLevel]);

  // 최종 스타일 클래스 계산 (중앙화된 badgeColor 사용)
  const badgeClassName = useMemo(() => {
    const baseClasses = `inline-flex items-center justify-center rounded-full font-medium ${sizeClasses[size]}`;
    return `${baseClasses} ${computedActivityLevel.badgeColor} ${className}`.trim();
  }, [computedActivityLevel.badgeColor, size, className]);

  return (
    <div
      className={badgeClassName}
      title={`활동 등급: ${computedActivityLevel.label}`}
    >
      {computedActivityLevel.label}
    </div>
  );
}
