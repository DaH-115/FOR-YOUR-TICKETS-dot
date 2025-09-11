import { useEffect, useState } from "react";

/**
 * 화면 크기에 따른 반응형 아이템 개수 조절 훅
 * @param mobileCount 모바일에서 보여줄 개수 (기본: 3)
 * @param tabletCount 태블릿에서 보여줄 개수 (기본: 4)
 * @param desktopCount 데스크톱에서 보여줄 개수 (기본: 8)
 * @returns 현재 화면 크기에 맞는 아이템 개수
 */
export const useResponsiveCount = (
  mobileCount: number = 3,
  tabletCount: number = 4,
  desktopCount: number = 8,
) => {
  const [itemCount, setItemCount] = useState(tabletCount); // 기본값: 태블릿

  useEffect(() => {
    const updateItemCount = () => {
      const width = window.innerWidth;
      if (width < 768) {
        // 모바일
        setItemCount(mobileCount);
      } else if (width < 1024) {
        // 태블릿
        setItemCount(tabletCount);
      } else {
        // 데스크톱
        setItemCount(desktopCount);
      }
    };

    // 초기 설정
    updateItemCount();

    // 디바운스된 리사이즈 핸들러
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateItemCount, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [mobileCount, tabletCount, desktopCount]);

  return itemCount;
};
