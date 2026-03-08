"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const VIEWPORT_PADDING = 8;
const TOOLTIP_GAP = 8;

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  /** 클릭 시 툴팁 자동 숨김 시간(ms) (기본값: 3000) */
  autoHideMs?: number;
}

export default function Tooltip({
  children,
  content,
  autoHideMs = 3000,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [arrowLeft, setArrowLeft] = useState("50%");
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useLayoutEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;

    let left = triggerCenterX - tooltipRect.width / 2;
    const top = triggerRect.bottom + TOOLTIP_GAP;

    const minLeft = VIEWPORT_PADDING;
    const maxLeft = window.innerWidth - tooltipRect.width - VIEWPORT_PADDING;

    left = Math.max(minLeft, Math.min(left, maxLeft));

    const arrowOffset = triggerCenterX - left;
    setArrowLeft(`${arrowOffset}px`);
    setPosition({ left, top });
    setIsPositioned(true);
  }, [isVisible]);

  const show = useCallback(() => {
    setIsPositioned(false);
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
    setIsPositioned(false);
  }, []);

  const handleClick = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPositioned(false);
    setIsVisible(true);
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsPositioned(false);
    }, autoHideMs);
  }, [autoHideMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={handleClick}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`fixed z-99999 whitespace-nowrap rounded-lg border border-white/20 bg-black px-3 py-2 text-xs text-white shadow-xl transition-opacity duration-200 ${
              isPositioned ? "opacity-100" : "opacity-0"
            }`}
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
            }}
            role="tooltip"
          >
            {content}
            <div
              className="absolute -top-1 h-0 w-0 -translate-x-1/2 border-b-4 border-l-4 border-r-4 border-b-black border-l-transparent border-r-transparent"
              style={{ left: arrowLeft }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
