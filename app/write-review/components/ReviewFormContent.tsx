import { useFormContext, Controller } from "react-hook-form";
import { ReviewFormValues } from "@/write-review/types";
import {
  reviewFormFieldError,
  reviewFormTextFieldBase,
} from "@/write-review/utils/reviewFormFieldClasses";

export default function ReviewFormContent() {
  const { control } = useFormContext<ReviewFormValues>();

  return (
    <div className="space-y-2">
      <label htmlFor="reviewContent" className="text-sm text-gray-600">
        리뷰
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
              className={`resize-none ${reviewFormTextFieldBase}${
                error ? ` ${reviewFormFieldError}` : ""
              }`}
              placeholder="리뷰를 작성해주세요"
            />
            <div className="mt-1 flex items-center justify-between">
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
