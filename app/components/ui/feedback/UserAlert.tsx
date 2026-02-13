import { FaCheck, FaTimes } from "react-icons/fa";
import { useEffect } from "react";
import AlertPortal from "app/components/ui/modal/AlertPortal";

interface UserAlertProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose?: () => void;
  show?: boolean; // 알림 표시 여부를 외부에서 제어할 수 있도록 추가
  autoClose?: boolean; // 자동으로 닫힐지 여부
  autoCloseDelay?: number; // 자동으로 닫히는 시간 (밀리초)
}

export default function UserAlert({
  title,
  description,
  onConfirm,
  onClose,
  show = true, // 기본값은 true로 설정
  autoClose = true, // 기본값은 true로 설정
  autoCloseDelay = 3000, // 기본값은 3초
}: UserAlertProps) {
  // 자동으로 닫히는 기능
  useEffect(() => {
    if (!show || !autoClose) return;

    const timer = setTimeout(() => {
      onConfirm();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [show, autoClose, autoCloseDelay, onConfirm]);
  return (
    <AlertPortal show={show}>
      <div className="w-full rounded-xl bg-white p-4 shadow-2xl ring-1 ring-gray-200/50 backdrop-blur-xs">
        {/* Toast Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 shadow-xs">
            <FaCheck className="text-xs text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-xs text-gray-600">{description}</p>
          </div>
          {/* 닫기 버튼 */}
          <button
            type="button"
            className="text-gray-400 transition-colors hover:text-gray-600"
            onClick={onConfirm}
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* 액션 버튼들 (필요한 경우에만 표시) */}
        {onClose && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600"
              onClick={onConfirm}
            >
              확인
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              onClick={onClose}
            >
              취소
            </button>
          </div>
        )}
      </div>
    </AlertPortal>
  );
}
