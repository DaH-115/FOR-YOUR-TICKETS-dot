import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface InputFieldProps<TFormValues extends FieldValues> {
  id: Path<TFormValues>;
  label: string;
  type: string;
  placeholder: string;
  register: UseFormRegister<TFormValues>;
  error?: string;
  touched?: boolean;
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
  disabled,
  autoComplete,
  "aria-describedby": ariaDescribedBy,
}: InputFieldProps<TFormValues>) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(id)}
        className={`w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all duration-300 focus:border-accent-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-300 focus:ring-offset-1 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        } ${
          touched && error
            ? "border-red-500 bg-red-50 ring-2 ring-red-500/30"
            : ""
        }`}
        autoComplete={autoComplete}
        aria-describedby={ariaDescribedBy}
        aria-invalid={touched && error ? "true" : "false"}
      />
      {touched && error && (
        <p className="flex items-center space-x-1 text-sm text-red-600">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
