import { useFormContext, Controller } from "react-hook-form";
import { ReviewFormValues } from "@/write-review/types";

export default function ReviewFormContent() {
  const { control } = useFormContext<ReviewFormValues>();

  return (
    <div className="space-y-2">
      <label htmlFor="reviewContent" className="text-sm text-gray-600">
        상세 리뷰
      </label>
      <Controller
        name="reviewContent"
        control={control}
        rules={{
          required: "내용을 입력해주세요.",
          maxLength: {
            value: 500,
            message: "리뷰 내용은 500자 이하로 입력해주세요.",
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <div>
            <textarea
              {...field}
              id="reviewContent"
              rows={6}
              className={`w-full resize-none rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all duration-300 focus:border-accent-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-300 focus:ring-offset-1 ${
                error ? "border-red-500 bg-red-50 ring-2 ring-red-500/30" : ""
              }`}
              placeholder="상세 리뷰를 작성해주세요"
            />
            <div className="flex items-center justify-between">
              {error && <p className="text-sm text-red-600">{error.message}</p>}
              <p className="ml-auto text-sm text-gray-400">
                {(field.value || "").length}/500
              </p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
