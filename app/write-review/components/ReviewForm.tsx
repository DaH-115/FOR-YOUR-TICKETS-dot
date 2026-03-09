"use client";

import { FormProvider, useForm } from "react-hook-form";
import type { MovieDetails } from "lib/movies/fetchMovieDetails";
import type { ReviewFormValues, ReviewMode } from "@/write-review/types";
import useReviewForm from "@/write-review/hooks/useReviewForm";
import Background from "@/components/ui/layout/Background";
import ReviewFormContent from "@/write-review/components/ReviewFormContent";
import ReviewFormRating from "@/write-review/components/ReviewFormRating";
import ReviewFormTitle from "@/write-review/components/ReviewFormTitle";

interface ReviewFormProps {
  onSubmitMode: ReviewMode;
  movieData: MovieDetails;
  initialData?: ReviewFormValues;
  reviewId?: string;
}

export default function ReviewForm({
  onSubmitMode,
  initialData,
  movieData,
  reviewId,
}: ReviewFormProps) {
  const { onSubmit } = useReviewForm({
    mode: onSubmitMode,
    movieData,
    reviewId,
  });

  const methods = useForm<ReviewFormValues>({
    defaultValues: initialData ?? {
      reviewTitle: "",
      rating: 5,
      reviewContent: "",
      isLiked: false,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isDirty, isValid },
  } = methods;

  const submitHandler = async (data: ReviewFormValues) => {
    await onSubmit(data);
  };

  return (
    <>
      {movieData.backdrop_path && (
        <Background imageUrl={movieData.backdrop_path} isFixed={true} />
      )}
      <main className="relative mt-8 mb-16 drop-shadow-lg lg:mt-16 lg:mb-20">
        <div className="mx-auto w-11/12 max-w-2xl">
          {/* 티켓 헤더 */}
          <h1 className="sr-only">
            {onSubmitMode === "edit" ? "리뷰 수정" : "리뷰 작성"}
          </h1>
          {/* 티켓 작성 폼 */}
          <div className="relative rounded-3xl border-2 bg-white p-8 shadow-2xl">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(submitHandler)}>
                {/* 영화 정보 */}
                <div className="mb-4 text-center">
                  <h2 className="mb-1 text-2xl font-bold text-gray-800">
                    {`${movieData.title}(${movieData.original_title})`}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {movieData.release_date
                      ? movieData.release_date.replaceAll("-", ".")
                      : "개봉일 미정"}
                  </p>
                </div>

                {/* 작성 중 안내 메시지 */}
                {isDirty && (
                  <div className="mb-4 rounded-lg">
                    <div className="flex items-center justify-center">
                      <div className="ml-1">
                        <p className="text-sm text-gray-400">
                          <strong>작성 중입니다!</strong> 페이지를 떠나면 작성한
                          내용이 사라집니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 폼 필드 */}
                <div className="space-y-6 pt-2">
                  <ReviewFormTitle />
                  <ReviewFormRating />
                  <ReviewFormContent />
                  {/* 폼 제출 버튼 */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-accent-400 hover:bg-accent-500 w-full rounded-xl p-4 text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!isValid}
                    >
                      {onSubmitMode === "edit" ? "리뷰 수정" : "리뷰 등록"}
                    </button>
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </main>
    </>
  );
}
