interface DuplicateCheckButtonProps {
  onClick: () => void;
  disabled: boolean;
  isChecking: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

export default function DuplicateCheckButton({
  onClick,
  disabled,
  isChecking,
  className = "",
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: DuplicateCheckButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex-shrink-0 rounded-2xl px-3 py-2 text-xs transition-colors duration-200 ${
        disabled
          ? "cursor-not-allowed bg-gray-200 text-gray-400"
          : "bg-gray-600 text-white hover:bg-gray-400"
      } ${className}`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      data-testid="duplicate-check-button"
    >
      {isChecking ? "확인 중..." : "중복 확인"}
    </button>
  );
}
