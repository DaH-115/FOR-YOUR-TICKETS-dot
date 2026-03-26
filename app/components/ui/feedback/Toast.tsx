"use client";

import { useEffect } from "react";
import { FaCheck, FaExclamationCircle, FaTimes } from "react-icons/fa";
import AlertPortal from "app/components/ui/modal/AlertPortal";

export type ToastType = "success" | "error";

interface ToastProps {
  title: string;
  description: string;
  type?: ToastType;
  onClose: () => void;
  show?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function Toast({
  title,
  description,
  type = "success",
  onClose,
  show = true,
  autoClose = true,
  autoCloseDelay = 3000,
}: ToastProps) {
  useEffect(() => {
    if (!show || !autoClose) return;

    const timer = setTimeout(onClose, autoCloseDelay);
    return () => clearTimeout(timer);
  }, [show, autoClose, autoCloseDelay, onClose]);

  const isError = type === "error";

  return (
    <AlertPortal show={show}>
      <div className="w-full rounded-xl bg-white p-4 shadow-2xl ring-1 ring-gray-200/50 backdrop-blur-xs">
        <div className="flex items-start gap-3">
          {/* 타입별 아이콘 및 색상 */}
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-xs ${
              isError
                ? "bg-linear-to-br from-red-400 to-red-600"
                : "bg-linear-to-br from-emerald-400 to-emerald-600"
            }`}
          >
            {isError ? (
              <FaExclamationCircle className="text-xs text-white" />
            ) : (
              <FaCheck className="text-xs text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-md font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <button
            type="button"
            className="shrink-0 text-gray-400 transition-colors hover:text-gray-600"
            onClick={onClose}
            aria-label="닫기"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AlertPortal>
  );
}
