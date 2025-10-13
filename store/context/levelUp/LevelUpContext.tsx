"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import LevelUpModal from "@/my-page/components/LevelUpModal";

interface LevelUpContextType {
  showLevelUpModal: (newLevel: string) => void;
  closeLevelUpModal: () => void;
}

// LevelUp Context 생성
const LevelUpContext = createContext<LevelUpContextType | undefined>(undefined);

// LevelUp Context Provider Props
interface LevelUpProviderProps {
  children: ReactNode;
}

/**
 * 레벨업 모달을 전역으로 관리하는 Context Provider
 *
 * @example
 * ```tsx
 * const { showLevelUpModal } = useLevelUp();
 * showLevelUpModal("REGULAR");
 * ```
 */
export function LevelUpProvider({ children }: LevelUpProviderProps) {
  const [levelUpState, setLevelUpState] = useState<{
    isOpen: boolean;
    level: string;
  }>({
    isOpen: false,
    level: "",
  });

  // 레벨업 모달 표시
  const showLevelUpModal = (newLevel: string) => {
    setLevelUpState({
      isOpen: true,
      level: newLevel,
    });
  };

  // 레벨업 모달 닫기
  const closeLevelUpModal = () => {
    setLevelUpState({
      isOpen: false,
      level: "",
    });
  };

  return (
    <LevelUpContext.Provider value={{ showLevelUpModal, closeLevelUpModal }}>
      {children}
      {/* 전역 레벨업 모달 */}
      <LevelUpModal
        open={levelUpState.isOpen}
        onClose={closeLevelUpModal}
        newLevel={levelUpState.level}
      />
    </LevelUpContext.Provider>
  );
}

/**
 * LevelUp Context를 사용하는 커스텀 훅
 * @throws Provider 외부에서 사용 시 에러 발생
 *
 * @example
 * ```tsx
 * const { showLevelUpModal } = useLevelUp();
 * ```
 */
export function useLevelUp() {
  const context = useContext(LevelUpContext);

  if (context === undefined) {
    throw new Error("useLevelUp must be used within a LevelUpProvider");
  }

  return context;
}
