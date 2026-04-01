// 비밀번호 변경(재인증, 변경, 상태/에러 관리 등) 비즈니스 로직을 담당하는 커스텀 훅
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "store/context/alertContext";
import { isAuth } from "firebase-config";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import { firebaseErrorHandler } from "@/utils/firebaseError";
import {
  PASSWORD_CHANGE_MESSAGES,
  PASSWORD_CHANGE_REDIRECT_PATH,
} from "@/my-page/hooks/constants";

export function useChangePassword() {
  const router = useRouter();
  const currentUser = isAuth.currentUser;
  const user = useAppSelector(selectUser);
  const { showErrorHandler, showSuccessHandler } = useAlert();

  // 상태: 인증 성공, 인증 중, 변경 중
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  /** 재인증 실패 시 인풋 아래 인라인 표시(토스트 대신) */
  const [verifyErrorMessage, setVerifyErrorMessage] = useState<string | null>(
    null,
  );

  const clearVerifyError = useCallback(() => setVerifyErrorMessage(null), []);

  // 현재 비밀번호 재인증 — 실패 시 throw 하지 않음(Next/RHF에서 미처리 rejection 오버레이 방지)
  const onVerifyCurrent = useCallback(
    async (data: { currentPassword: string }): Promise<boolean> => {
      if (!currentUser || !user?.email) {
        setVerifyErrorMessage(PASSWORD_CHANGE_MESSAGES.VERIFY.ERROR.NO_USER);
        return false;
      }

      setIsVerifying(true);
      setVerifyErrorMessage(null);

      try {
        const credential = EmailAuthProvider.credential(
          user.email,
          data.currentPassword,
        );
        await reauthenticateWithCredential(currentUser, credential);

        // UI에 "확인 완료"가 표시되므로 성공 토스트는 생략
        setIsVerified(true);
        setVerifyErrorMessage(null);
        return true;
      } catch (error) {
        setIsVerified(false);
        const { message } = firebaseErrorHandler(error);
        setVerifyErrorMessage(message);
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [currentUser, user?.email],
  );

  // 새 비밀번호로 변경
  const onChangePassword = useCallback(
    async (data: { newPassword: string }) => {
      // 재인증 확인
      if (!isVerified) {
        showErrorHandler(
          PASSWORD_CHANGE_MESSAGES.ALERT_TITLE,
          PASSWORD_CHANGE_MESSAGES.UPDATE.ERROR.NOT_VERIFIED,
        );
        throw new Error(PASSWORD_CHANGE_MESSAGES.UPDATE.ERROR.NOT_VERIFIED);
      }

      if (!currentUser) {
        showErrorHandler(
          PASSWORD_CHANGE_MESSAGES.ALERT_TITLE,
          PASSWORD_CHANGE_MESSAGES.VERIFY.ERROR.NOT_LOGGED_IN,
        );
        router.push(PASSWORD_CHANGE_REDIRECT_PATH);
        throw new Error(PASSWORD_CHANGE_MESSAGES.VERIFY.ERROR.NOT_LOGGED_IN);
      }

      setIsUpdating(true);

      try {
        await updatePassword(currentUser, data.newPassword);

        // 성공 시 상태 초기화
        setIsVerified(false);
        showSuccessHandler(
          PASSWORD_CHANGE_MESSAGES.ALERT_TITLE,
          PASSWORD_CHANGE_MESSAGES.UPDATE.SUCCESS,
        );
      } catch (error) {
        const { title, message } = firebaseErrorHandler(error);
        showErrorHandler(title, message);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [isVerified, currentUser, router, showErrorHandler, showSuccessHandler],
  );

  return {
    isVerified,
    isVerifying,
    isUpdating,
    verifyErrorMessage,
    clearVerifyError,
    onVerifyCurrent,
    onChangePassword,
  };
}
