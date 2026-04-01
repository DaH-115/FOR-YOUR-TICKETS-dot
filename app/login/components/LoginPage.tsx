"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { FaArrowRight } from "react-icons/fa";
import { z } from "zod";
import InputField from "app/components/ui/forms/InputField";
import { getPortfolioDemoLoginDefaults } from "app/login/constants/portfolioDemoLogin";
import SocialLogin from "app/login/components/SocialLogin";
import { setRememberMe } from "app/utils/authPersistence";
import { firebaseErrorHandler } from "app/utils/firebaseError";
import { isAuth } from "firebase-config";
import { useAlert } from "store/context/alertContext";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식이 아닙니다."),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요.")
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
  rememberMe: z.boolean().default(false),
});

type LoginInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { showErrorHandler } = useAlert();
  const user = useAppSelector(selectUser);

  const loginDefaultValues = useMemo(() => getPortfolioDemoLoginDefaults(), []);
  const isDemoLoginPrefilled = loginDefaultValues.email.length > 0;

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: loginDefaultValues,
  });
  const isRememberMe = watch("rememberMe");

  // 이미 로그인된 사용자 처리
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const onSubmit: SubmitHandler<LoginInputs> = useCallback(
    async (data) => {
      setIsLoading(true);

      try {
        // 1. 로그인 상태 유지 설정 (Firebase 권장: signIn 전에 호출)
        await setRememberMe(data.rememberMe);

        // 2. 로그인 시도
        await signInWithEmailAndPassword(isAuth, data.email, data.password);

        // 3. 로그인 성공시 리다이렉트
        router.push("/");
      } catch (error) {
        const { title, message } = firebaseErrorHandler(error);
        showErrorHandler(title, message);
      } finally {
        setIsLoading(false);
      }
    },
    [router, showErrorHandler],
  );

  return (
    <main className="p-8 lg:p-0">
      <div className="mx-auto w-full max-w-md">
        {/* 로그인 카드 */}
        <div className="relative" role="region" aria-labelledby="login-title">
          {/* 티켓 메인 부분 */}
          <div className="border-accent-300/30 relative rounded-3xl border-2 bg-white px-6 py-8 shadow-2xl">
            {/* 로그인 헤더 */}
            <header className="mb-8 text-center">
              <h1
                id="login-title"
                className="mb-1 text-xl font-bold text-gray-800"
              >
                로그인
              </h1>
              <p className="text-sm text-gray-600">
                계정에 로그인하여 시작하세요
              </p>
              {isDemoLoginPrefilled && (
                <p className="text-accent-500 mt-2 text-xs">
                  포트폴리오 데모용 계정이 미리 입력되어 있습니다.
                  <br />
                  로그인만 눌러 체험할 수 있어요.
                </p>
              )}
            </header>

            <section aria-labelledby="login-form-title">
              <h2 id="login-form-title" className="sr-only">
                로그인 폼
              </h2>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                aria-label="로그인 양식"
              >
                <div className="space-y-4">
                  <InputField
                    id="email"
                    label="이메일"
                    type="email"
                    placeholder="example@domain.com"
                    register={register}
                    error={errors.email?.message}
                    touched={touchedFields.email}
                    disabled={isLoading}
                    autoComplete={"email"}
                  />

                  <InputField
                    id="password"
                    label="비밀번호"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    register={register}
                    error={errors.password?.message}
                    touched={touchedFields.password}
                    disabled={isLoading}
                    autoComplete={"password"}
                  />
                </div>

                {/* 로그인 상태 유지 */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    {...register("rememberMe")}
                    className="text-accent-500 checked:border-accent-500 checked:bg-accent-500 focus:border-accent-500 focus:ring-accent-500/20 h-4 w-4 rounded-md border-2 border-gray-300 bg-white transition-all duration-200 focus:ring-2 focus:outline-hidden"
                    disabled={isLoading}
                    aria-describedby="rememberMe-description"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="cursor-pointer text-xs text-gray-700 select-none"
                  >
                    로그인 상태 유지
                  </label>
                  <span id="rememberMe-description" className="sr-only">
                    체크하면 다음 방문 시 자동으로 로그인됩니다
                  </span>
                </div>

                <div>
                  <button
                    type="submit"
                    className={`bg-accent-400 w-full rounded-2xl p-4 text-sm text-white transition-all duration-300 ${
                      isLoading
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-accent-500 hover:shadow-lg"
                    }`}
                    disabled={isLoading}
                    aria-describedby={isLoading ? "login-loading" : undefined}
                  >
                    {isLoading ? "로그인 중..." : "로그인"}
                  </button>
                  {isLoading && (
                    <span id="login-loading" className="text-xs text-gray-600">
                      로그인을 처리하고 있습니다. 잠시만 기다려주세요.
                    </span>
                  )}

                  <Link
                    href="/sign-up"
                    className={`mt-4 flex w-full items-center justify-center rounded-2xl border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700 transition-all duration-300 ${
                      isLoading
                        ? "pointer-events-none cursor-not-allowed opacity-50"
                        : "hover:border-gray-400 hover:bg-gray-100"
                    }`}
                    aria-disabled={isLoading}
                    tabIndex={isLoading ? -1 : undefined}
                    onClick={(e) => {
                      if (isLoading) e.preventDefault();
                    }}
                  >
                    회원가입
                    <FaArrowRight size={14} className="ml-2" aria-hidden />
                  </Link>
                </div>
              </form>
            </section>

            {/* 소셜 로그인 */}
            <section aria-labelledby="social-login-title" className="mt-8">
              <h2 id="social-login-title" className="sr-only">
                소셜 로그인
              </h2>
              <SocialLogin rememberMe={isRememberMe} />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
