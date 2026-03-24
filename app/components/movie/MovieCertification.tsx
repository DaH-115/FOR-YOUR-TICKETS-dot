interface MovieCertificationProps {
  certification: string | null;
  className?: string;
  showLabel?: boolean;
}

const certificationColors: Record<string, string> = {
  ALL: "bg-green-500",
  "12": "bg-blue-500",
  "15": "bg-yellow-500",
  "18": "bg-red-500",
  default: "bg-gray-500",
};

const certificationLabels: Record<string, string> = {
  ALL: "전체",
  "12": "12",
  "15": "15",
  "18": "18",
  default: "0",
};

export default function MovieCertification({
  certification,
  className,
  showLabel = true,
}: MovieCertificationProps) {
  // 등급 정보가 없을 때는 기본(회색) 배지로 폴백
  const isMissing = !certification;

  const colorClass = isMissing
    ? certificationColors.default
    : certificationColors[certification] || certificationColors.default;
  const knownLabel = certification
    ? certificationLabels[certification]
    : undefined;
  const label = isMissing
    ? certificationLabels.default
    : (knownLabel ?? certificationLabels.default);
  const ariaLabel = isMissing
    ? "관람 등급 정보 없음"
    : knownLabel
      ? `${knownLabel} 관람 등급`
      : `관람 등급 ${certification}`;

  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${colorClass} ${
        className || ""
      }`}
      aria-label={ariaLabel}
    >
      {showLabel && label}
    </div>
  );
}
