interface MovieCertificationProps {
  certification: string | null;
  showLabel?: boolean;
}

// 투더탑·기본 프로필 아바타와 동일하게 대각선 그라데이션 + 그림자
const certificationColors: Record<string, string> = {
  ALL: "bg-linear-to-br from-green-400 to-green-600",
  "12": "bg-linear-to-br from-blue-400 to-blue-600",
  "15": "bg-linear-to-br from-yellow-500 to-yellow-700",
  "18": "bg-linear-to-br from-red-400 to-red-600",
  // 정보 없음·미지원: 밝은 회색(내부 텍스트 없음 → 대비 부담 적음)
  default: "bg-linear-to-br from-gray-200 to-gray-400",
};

// API에서 내려오는 값과 화면 표기 매핑 (이 목록에만 라벨 표시)
const certificationLabels: Record<string, string> = {
  ALL: "전체",
  "12": "12",
  "15": "15",
  "18": "18",
};

const knownCertificationKeys = new Set(Object.keys(certificationLabels));

function isKnownCertification(
  value: string | null,
): value is keyof typeof certificationLabels {
  return value !== null && knownCertificationKeys.has(value);
}

export default function MovieCertification({
  certification,
  showLabel = true,
}: MovieCertificationProps) {
  const isMissing = !certification;

  const colorClass = isKnownCertification(certification)
    ? certificationColors[certification]
    : certificationColors.default;

  const visibleLabel =
    showLabel && isKnownCertification(certification)
      ? certificationLabels[certification]
      : null;

  const ariaLabel = isMissing
    ? "관람 등급 정보 없음"
    : isKnownCertification(certification)
      ? `${certificationLabels[certification]} 관람 등급`
      : `관람 등급 ${certification}`;

  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${colorClass}`}
      aria-label={ariaLabel}
    >
      {visibleLabel}
    </div>
  );
}
