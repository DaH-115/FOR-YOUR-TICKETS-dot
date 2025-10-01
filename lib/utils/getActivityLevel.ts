export interface ActivityLevel {
  label: string;
  badgeColor: string;
  bgGradient: string;
}

export interface GradeInfo {
  label: string;
  color: string;
  bgGradient: string;
  range: string;
  minThreshold: number;
  description: string;
  nextGoal: string;
  badgeColor: string;
}

// 통합된 등급 정보 - 모든 등급 관련 데이터를 여기서 관리
export const gradeInfoData: GradeInfo[] = [
  {
    label: "NEWBIE",
    color: "bg-yellow-100 text-yellow-700",
    badgeColor: "bg-yellow-100 text-yellow-700",
    bgGradient: "from-yellow-50 to-yellow-100",
    range: "0-4개",
    minThreshold: 0,
    description: "영화 리뷰를 시작한 신입 리뷰어입니다.",
    nextGoal: "5개의 리뷰를 작성하면 REGULAR 등급으로 승급됩니다!",
  },
  {
    label: "REGULAR",
    color: "bg-green-100 text-green-700",
    badgeColor: "bg-green-100 text-green-700",
    bgGradient: "from-green-50 to-green-100",
    range: "5-19개",
    minThreshold: 5,
    description: "꾸준히 리뷰를 작성하는 일반 리뷰어입니다.",
    nextGoal: "20개의 리뷰를 작성하면 ACTIVE 등급으로 승급됩니다!",
  },
  {
    label: "ACTIVE",
    color: "bg-blue-100 text-blue-700",
    badgeColor: "bg-blue-100 text-blue-700",
    bgGradient: "from-blue-50 to-blue-100",
    range: "20-49개",
    minThreshold: 20,
    description: "활발하게 리뷰 활동을 하는 액티브 리뷰어입니다.",
    nextGoal: "50개의 리뷰를 작성하면 EXPERT 등급으로 승급됩니다!",
  },
  {
    label: "EXPERT",
    color: "bg-purple-100 text-purple-700",
    badgeColor: "bg-purple-100 text-purple-700",
    bgGradient: "from-purple-50 to-purple-100",
    range: "50개+",
    minThreshold: 50,
    description: "최고 등급의 전문 리뷰어입니다. 축하합니다!",
    nextGoal: "최고 등급에 도달했습니다! 계속해서 훌륭한 리뷰를 작성해주세요.",
  },
];

// ActivityLevel 객체 생성을 위한 맵핑
const activityLevels = gradeInfoData.reduce(
  (acc, grade) => {
    acc[grade.label as keyof typeof acc] = {
      label: grade.label,
      badgeColor: grade.badgeColor,
      bgGradient: grade.bgGradient,
    };
    return acc;
  },
  {} as Record<string, ActivityLevel>,
);

type ActivityLevelLabel = keyof typeof activityLevels;

export function getActivityLevelInfo(
  level: ActivityLevelLabel | string,
): ActivityLevel {
  if (level in activityLevels) {
    return activityLevels[level as ActivityLevelLabel];
  }
  return activityLevels.NEWBIE;
}

export function getActivityLevel(reviewCount: number): ActivityLevel {
  if (reviewCount >= 50) {
    return activityLevels.EXPERT;
  }
  if (reviewCount >= 20) {
    return activityLevels.ACTIVE;
  }
  if (reviewCount >= 5) {
    return activityLevels.REGULAR;
  }
  return activityLevels.NEWBIE;
}

// 로딩 상태일 때의 기본 등급을 반환합니다.
export function getLoadingActivityLevel(): ActivityLevel {
  return {
    label: "...",
    badgeColor: "bg-gray-100 text-gray-600",
    bgGradient: "from-gray-50 to-gray-100",
  };
}

// 등급 정보 관련 유틸리티 함수들
export function getCurrentGradeInfo(
  currentLevel: ActivityLevel,
): GradeInfo | undefined {
  return gradeInfoData.find((info) => info.label === currentLevel.label);
}

export function getNextGradeInfo(
  currentLevel: ActivityLevel,
): GradeInfo | null {
  const currentIndex = gradeInfoData.findIndex(
    (info) => info.label === currentLevel.label,
  );
  return currentIndex < gradeInfoData.length - 1
    ? gradeInfoData[currentIndex + 1]
    : null;
}

export function getProgressToNext(
  currentLevel: ActivityLevel,
  currentReviewCount: number,
): number {
  const currentGrade = getCurrentGradeInfo(currentLevel);
  const nextGrade = getNextGradeInfo(currentLevel);

  if (!nextGrade || !currentGrade) return 100;

  const currentThreshold = currentGrade.minThreshold;
  const nextThreshold = nextGrade.minThreshold;

  const progress =
    ((currentReviewCount - currentThreshold) /
      (nextThreshold - currentThreshold)) *
    100;
  return Math.min(Math.max(progress, 0), 100);
}
