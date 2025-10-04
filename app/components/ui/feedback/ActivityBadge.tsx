import { useMemo } from "react";
import {
  getActivityLevel,
  getActivityLevelInfo,
  ActivityLevel,
} from "lib/utils/getActivityLevel";

interface ActivityBadgeProps {
  activityLevel?: string; // "NEWBIE", "REGULAR", "ACTIVE", "EXPERT"
  className?: string;
}

export default function ActivityBadge({
  activityLevel,
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
    const baseClasses = `inline-flex items-center justify-center rounded-full px-1.5 py-1 text-xs leading-none`;
    return `${baseClasses} ${computedActivityLevel.badgeColor} ${className}`.trim();
  }, [computedActivityLevel.badgeColor, className]);

  return (
    <div
      className={badgeClassName}
      title={`활동 등급: ${computedActivityLevel.label}`}
    >
      {computedActivityLevel.label}
    </div>
  );
}
