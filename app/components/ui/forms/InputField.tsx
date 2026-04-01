import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface InputFieldProps<TFormValues extends FieldValues> {
  id: Path<TFormValues>;
  label: string;
  type: string;
  placeholder: string;
  register: UseFormRegister<TFormValues>;
  error?: string;
  touched?: boolean;
  /** 서버/비동기 검증 등 폼 외부 오류(클라이언트 검증과 동일한 시각 스타일) */
  inlineError?: string;
  disabled?: boolean;
  autoComplete?: string;
  "aria-describedby"?: string;
}

export default function InputField<TFormValues extends FieldValues>({
  id,
  label,
  type,
  placeholder,
  register,
  error,
  touched,
  inlineError,
  disabled,
  autoComplete,
  "aria-describedby": ariaDescribedBy,
}: InputFieldProps<TFormValues>) {
  const validationMessage = touched && error ? error : undefined;
  const displayMessage = validationMessage ?? inlineError;
  const hasError = Boolean(displayMessage);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(id)}
        className={`focus:border-accent-500 focus:ring-accent-300 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-offset-1 focus:outline-hidden ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        } ${hasError ? "border-red-500 bg-red-50 ring-2 ring-red-500/30" : ""}`}
        autoComplete={autoComplete}
        aria-describedby={ariaDescribedBy}
        aria-invalid={hasError ? "true" : "false"}
      />
      {displayMessage && (
        <p className="mt-1 flex items-center space-x-1 text-xs text-red-500">
          <span>{displayMessage}</span>
        </p>
      )}
    </div>
  );
}
