"use client";

import { FaQuestionCircle } from "react-icons/fa";
import ModalPortal from "app/components/ui/modal/ModalPortal";

interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
  isOpen,
}: ConfirmDialogProps) {
  return (
    <ModalPortal isOpen={isOpen} onClose={onCancel}>
      <div className="flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <FaQuestionCircle className="text-sm text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="flex-1 cursor-pointer rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
            onClick={onConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
