import { ReactNode, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Link 요소를 직접 찾기 (아이콘이 있는 요소)
    const linkElement = triggerRef.current?.parentElement?.querySelector("a");
    if (!linkElement) return;

    const updatePosition = () => {
      const rect = linkElement.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 12,
      });
    };

    const handleMouseEnter = () => {
      updatePosition();
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleClick = () => {
      updatePosition();
      setIsVisible(true);
      // 클릭 후 3초 뒤에 자동으로 사라지게
      setTimeout(() => setIsVisible(false), 3000);
    };

    linkElement.addEventListener("mouseenter", handleMouseEnter);
    linkElement.addEventListener("mouseleave", handleMouseLeave);
    linkElement.addEventListener("click", handleClick);

    return () => {
      linkElement.removeEventListener("mouseenter", handleMouseEnter);
      linkElement.removeEventListener("mouseleave", handleMouseLeave);
      linkElement.removeEventListener("click", handleClick);
    };
  }, [mounted]);

  if (!isVisible)
    return (
      <div ref={triggerRef} className="pointer-events-none absolute inset-0" />
    );

  const tooltipContent = (
    <div
      className="animate-in fade-in fixed z-99999 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/20 bg-black px-3 py-2 text-xs text-white shadow-xl duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      role="tooltip"
    >
      {children}
      {/* 툴팁 화살표 */}
      <div className="absolute -top-1 left-1/2 h-0 w-0 -translate-x-1/2 border-b-4 border-l-4 border-r-4 border-b-black border-l-transparent border-r-transparent"></div>
    </div>
  );

  return (
    <>
      <div ref={triggerRef} className="pointer-events-none absolute inset-0" />
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(tooltipContent, document.body)}
    </>
  );
}
