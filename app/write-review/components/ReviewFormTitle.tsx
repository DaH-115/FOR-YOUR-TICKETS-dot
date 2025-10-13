import { useFormContext, Controller } from "react-hook-form";
import { ReviewFormValues } from "@/write-review/types";

export default function ReviewFormTitle() {
  const { control } = useFormContext<ReviewFormValues>();

  return (
    <div className="space-y-2">
      <label htmlFor="reviewTitle" className="text-sm text-gray-600">
        한 줄 평
      </label>
      <Controller
        name="reviewTitle"
        control={control}
        rules={{
          required: "제목을 입력해주세요.",
          maxLength: {
            value: 50,
            message: "제목은 50자 이하로 입력해주세요.",
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <div>
            <input
              {...field}
              id="reviewTitle"
              className={`w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all duration-300 focus:border-accent-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-300 focus:ring-offset-1 ${
                error ? "border-red-500 bg-red-50 ring-2 ring-red-500/30" : ""
              }`}
              placeholder="한 줄 평을 입력해주세요"
              onBlur={(e) => {
                // 앞뒤 공백 제거
                field.onChange(e.target.value.trim());
                field.onBlur();
              }}
            />
            <div className="mt-1 flex items-center justify-between">
              {error && <p className="text-sm text-red-600">{error.message}</p>}
              <p className="ml-auto text-sm text-gray-400">
                {(field.value || "").length}/50
              </p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
