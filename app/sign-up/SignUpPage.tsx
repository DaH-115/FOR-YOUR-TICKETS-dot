"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DuplicateCheckButton from "app/components/ui/buttons/DuplicateCheckButton";
import InputField from "app/components/ui/forms/InputField";
import { useDuplicateCheckState } from "app/my-page/hooks/useDuplicateCheckState";
import { firebaseErrorHandler } from "app/utils/firebaseError";
import { isAuth } from "firebase-config";
import { useAlert } from "store/context/alertContext";

const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "이름은 최소 2글자 이상이어야 합니다.")
      .max(50, "이름은 50글자를 초과할 수 없습니다."),
    displayName: z
      .string()
      .min(2, "닉네임은 최소 2글자 이상이어야 합니다.")
      .max(30, "닉네임은 30글자를 초과할 수 없습니다."),
    email: z
      .string()
      .email("올바른 이메일 형식이 아닙니다.")
      .min(1, "이메일을 입력해주세요.")
      .max(100, "이메일은 100글자를 초과할 수 없습니다."),
    password: z
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
      .max(100, "비밀번호는 100글자를 초과할 수 없습니다.")
      .regex(
        /^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,}$/,
        "비밀번호는 숫자, 특수문자를 하나 이상 포함해야 합니다.",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호와 확인 비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type SignupSchema = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { showErrorHandler, showSuccessHandler } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

  const displayNameValue = watch("displayName");
  const emailValue = watch("email");

  // 닉네임/이메일 중복 체크 훅 사용
  const {
    isChecking: isCheckingName,
    isChecked: isNameChecked,
    isAvailable: isDisplayNameAvailable,
    message: displayNameMessage,
    check: checkNickname,
  } = useDuplicateCheckState({ type: "displayName", value: displayNameValue });

  const {
    isChecking: isCheckingEmail,
    isChecked: isEmailChecked,
    isAvailable: isEmailAvailable,
    message: emailMessage,
    check: checkEmail,
  } = useDuplicateCheckState({ type: "email", value: emailValue });

  // 중복 체크 결과에 따른 알림 표시 (통합 처리)
  useEffect(() => {
    if (isNameChecked && displayNameMessage) {
      if (isDisplayNameAvailable) {
        showSuccessHandler("성공", displayNameMessage);
      } else {
        showErrorHandler("실패", displayNameMessage);
      }
    }
  }, [
    isNameChecked,
    isDisplayNameAvailable,
    displayNameMessage,
    showErrorHandler,
    showSuccessHandler,
  ]);

  useEffect(() => {
    if (isEmailChecked && emailMessage) {
      if (isEmailAvailable) {
        showSuccessHandler("성공", emailMessage);
      } else {
        showErrorHandler("실패", emailMessage);
      }
    }
  }, [
    isEmailChecked,
    isEmailAvailable,
    emailMessage,
    showErrorHandler,
    showSuccessHandler,
  ]);

  // 회원가입 처리
  const onSubmit = useCallback(
    async (data: SignupSchema) => {
      setIsLoading(true);
      try {
        const { displayName, email, password } = data;

        // REST API로 회원가입 처리
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayName,
            email,
            password,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "회원가입에 실패했습니다.");
        }

        // 회원가입 성공 후 자동 로그인
        await signInWithEmailAndPassword(isAuth, email, password);

        showSuccessHandler("회원가입 완료", "환영합니다!", () => {
          router.replace("/");
        });
      } catch (error) {
        const { title, message } = firebaseErrorHandler(error);
        showErrorHandler(title, message);
      } finally {
        setIsLoading(false);
      }
    },
    [router, showErrorHandler, showSuccessHandler],
  );

  return (
    <main className="p-8 lg:p-0">
      <div className="mx-auto w-full max-w-md">
        {/* 회원가입 카드 */}
        <div className="relative" role="region" aria-labelledby="signup-title">
          {/* 티켓 메인 부분 */}
          <div className="relative rounded-3xl border-2 border-accent-300/30 bg-white px-6 pb-10 pt-8 shadow-2xl">
            {/* 회원가입 헤더 */}
            <header className="mb-8 text-center">
              <h1
                id="signup-title"
                className="mb-1 text-xl font-bold text-gray-800"
              >
                회원가입
              </h1>
              <p className="text-sm text-gray-600">
                새로운 계정을 만들어 시작하세요
              </p>
            </header>

            <section aria-labelledby="signup-form-title">
              <h2 id="signup-form-title" className="sr-only">
                회원가입 폼
              </h2>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                aria-label="회원가입 양식"
              >
                <div className="space-y-4">
                  <InputField
                    id="name"
                    label="이름"
                    type="text"
                    placeholder="이름을 입력해 주세요"
                    register={register}
                    error={errors.name?.message}
                    touched={touchedFields.name}
                    disabled={isLoading}
                    autoComplete={"name"}
                  />

                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <InputField
                        id="displayName"
                        label="닉네임"
                        type="text"
                        placeholder="사용하실 닉네임을 입력해 주세요"
                        register={register}
                        error={errors.displayName?.message}
                        touched={touchedFields.displayName}
                        disabled={isLoading}
                        autoComplete={"displayName"}
                        aria-describedby="displayName-status"
                      />
                      {isDisplayNameAvailable !== null && (
                        <p
                          id="displayName-status"
                          className={`mt-1 text-xs ${
                            isDisplayNameAvailable
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                          role="status"
                          aria-live="polite"
                        >
                          {isDisplayNameAvailable
                            ? "사용 가능한 닉네임입니다."
                            : "이미 사용 중인 닉네임입니다."}
                        </p>
                      )}
                    </div>
                    <DuplicateCheckButton
                      onClick={checkNickname}
                      disabled={isCheckingName || !displayNameValue}
                      isChecking={isCheckingName}
                      aria-label="닉네임 중복 확인"
                    />
                  </div>

                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <InputField
                        id="email"
                        label="이메일"
                        type="email"
                        placeholder="이메일을 입력해 주세요"
                        register={register}
                        error={errors.email?.message}
                        touched={touchedFields.email}
                        disabled={isLoading}
                        autoComplete={"email"}
                        aria-describedby="email-status"
                      />
                      {isEmailAvailable !== null && (
                        <p
                          id="email-status"
                          className={`mt-1 text-xs ${
                            isEmailAvailable ? "text-green-600" : "text-red-600"
                          }`}
                          role="status"
                          aria-live="polite"
                        >
                          {isEmailAvailable
                            ? "사용 가능한 이메일입니다."
                            : "이미 사용 중인 이메일입니다."}
                        </p>
                      )}
                    </div>
                    <DuplicateCheckButton
                      onClick={checkEmail}
                      disabled={isCheckingEmail || !emailValue}
                      isChecking={isCheckingEmail}
                      aria-label="이메일 중복 확인"
                    />
                  </div>

                  <InputField
                    id="password"
                    label="비밀번호"
                    type="password"
                    placeholder="비밀번호를 입력해 주세요"
                    register={register}
                    error={errors.password?.message}
                    touched={touchedFields.password}
                    disabled={isLoading}
                    autoComplete={"password"}
                  />

                  <InputField
                    id="confirmPassword"
                    label="비밀번호 확인"
                    type="password"
                    placeholder="비밀번호를 한 번 더 입력해 주세요"
                    register={register}
                    error={errors.confirmPassword?.message}
                    touched={touchedFields.confirmPassword}
                    disabled={isLoading}
                    autoComplete={"confirmPassword"}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      isDisplayNameAvailable !== true ||
                      isEmailAvailable !== true
                    }
                    className={`w-full rounded-2xl bg-accent-400 p-4 text-sm text-white transition-all duration-300 ${
                      isLoading ||
                      isDisplayNameAvailable !== true ||
                      isEmailAvailable !== true
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-accent-500 hover:shadow-lg"
                    }`}
                    aria-describedby={
                      isLoading ? "signup-loading" : "signup-requirements"
                    }
                  >
                    {isLoading ? "가입 중..." : "회원가입"}
                  </button>
                  {isLoading && (
                    <span id="signup-loading" className="text-xs text-gray-600">
                      회원가입을 처리하고 있습니다. 잠시만 기다려주세요.
                    </span>
                  )}
                  {!isLoading &&
                    (isDisplayNameAvailable !== true ||
                      isEmailAvailable !== true) && (
                      <span
                        id="signup-requirements"
                        className="text-xs text-red-600"
                      >
                        닉네임과 이메일 중복 확인을 완료해주세요.
                      </span>
                    )}
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
