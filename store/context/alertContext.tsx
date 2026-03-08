"use client";

import { createContext, useCallback, useContext, useState } from "react";
import Toast from "app/components/ui/feedback/Toast";
import ConfirmDialog from "app/components/ui/feedback/ConfirmDialog";

interface AlertContextType {
  showErrorHandler: (title: string, message: string) => void;
  showSuccessHandler: (
    title: string,
    message: string,
    onConfirm?: () => void,
  ) => void;
  showConfirmHandler: (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => void;
  hideErrorHandler: () => void;
  hideSuccessHandler: () => void;
}

interface ErrorType {
  title: string;
  message: string;
}

interface SuccessType {
  title: string;
  message: string;
  onConfirm: () => void;
}

interface ConfirmType {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [errorState, setErrorState] = useState<ErrorType | null>(null);
  const [successState, setSuccessState] = useState<SuccessType | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmType | null>(null);

  const hideErrorHandler = useCallback(() => {
    setErrorState(null);
  }, []);

  const hideSuccessHandler = useCallback(() => {
    setSuccessState(null);
  }, []);

  const showErrorHandler = useCallback((title: string, message: string) => {
    setErrorState({ title, message });
    setSuccessState(null); // 에러 상태일 때는 성공 메시지를 숨깁니다
  }, []);

  const showSuccessHandler = useCallback(
    (title: string, message: string, onConfirm?: () => void) => {
      const handleConfirm = () => {
        if (onConfirm) {
          onConfirm();
        }
        hideSuccessHandler();
      };

      setSuccessState({
        title,
        message,
        onConfirm: handleConfirm,
      });
      setErrorState(null); // 성공 상태일 때는 에러 메시지를 숨깁니다
    },
    [hideSuccessHandler],
  );

  const showConfirmHandler = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setConfirmState({
        title,
        message,
        onConfirm: () => {
          onConfirm();
          setConfirmState(null);
        },
        onCancel: () => {
          setConfirmState(null);
        },
      });
    },
    [],
  );

  return (
    <AlertContext.Provider
      value={{
        showErrorHandler,
        hideErrorHandler,
        showSuccessHandler,
        hideSuccessHandler,
        showConfirmHandler,
      }}
    >
      {children}
      {/* Error Toast */}
      {errorState && (
        <Toast
          title={errorState.title}
          description={errorState.message}
          type="error"
          onClose={hideErrorHandler}
        />
      )}
      {/* Success Toast */}
      {successState && (
        <Toast
          title={successState.title}
          description={successState.message}
          type="success"
          onClose={successState.onConfirm}
        />
      )}
      {/* Confirm Dialog */}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          description={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={confirmState.onCancel}
          isOpen={!!confirmState}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within a AlertProvider");
  }
  return context;
}
