import { SocialProvider } from "app/login/components/SocialLogin";

interface SocialLoginButtonProps {
  provider: SocialProvider;
  icon: React.ReactNode;
  label: string;
  onSocialLogin: (provider: SocialProvider) => Promise<void>;
  isLoading: boolean;
}

export default function SocialLoginButton({
  provider,
  icon,
  label,
  onSocialLogin,
  isLoading,
}: SocialLoginButtonProps) {
  return (
    <button
      onClick={() => onSocialLogin(provider)}
      disabled={isLoading}
      className={`relative flex w-full items-center justify-center space-x-3 rounded-2xl border p-4 text-gray-700 transition-all duration-300 ${
        isLoading
          ? "cursor-not-allowed opacity-50"
          : "hover:border-gray-300 hover:bg-gray-100"
      }`}
      aria-label={`${label} 로그인`}
      aria-describedby={isLoading ? `${provider}-loading` : undefined}
    >
      <span className={isLoading ? "opacity-50" : ""} aria-hidden="true">
        {icon}
      </span>
      <span className="text-sm">{isLoading ? `${label} 중...` : label}</span>
      {isLoading && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700"
              aria-hidden="true"
            />
          </div>
          <span id={`${provider}-loading`} className="sr-only">
            {provider === "google" ? "Google" : "GitHub"} 로그인을 처리하고
            있습니다. 잠시만 기다려주세요.
          </span>
        </>
      )}
    </button>
  );
}
