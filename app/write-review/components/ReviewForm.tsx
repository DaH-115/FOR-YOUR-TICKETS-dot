"use client";

import { FormProvider, useForm } from "react-hook-form";
import type { MovieDetails } from "lib/movies/fetchMovieDetails";
import type { ReviewFormValues, ReviewMode } from "@/write-review/types";
import useReviewForm from "@/write-review/hooks/useReviewForm";
import Background from "@/components/ui/layout/Background";
import ReviewFormContent from "@/write-review/components/ReviewFormContent";
import ReviewFormRating from "@/write-review/components/ReviewFormRating";
import ReviewFormTitle from "@/write-review/components/ReviewFormTitle";
import { formatTodayKorean } from "@/utils/formatMovieDate";

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
      <main className="mt-8 mb-16 drop-shadow-lg lg:mt-16 lg:mb-20">
        <div className="mx-auto max-w-2xl">
          {/* 티켓 헤더 */}
          <h1 className="sr-only">
            {onSubmitMode === "edit" ? "리뷰 수정" : "리뷰 작성"}
          </h1>
          {/* 티켓 작성 폼 */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(submitHandler)}>
              <div className="rounded-2xl border-b-2 border-dashed bg-white p-8 shadow-2xl">
                {/* 영화 정보 */}
                <div className="mb-6 text-center">
                  <h2 className="mb-1 text-2xl font-bold text-gray-800">
                    {`${movieData.title}(${movieData.original_title})`}
                  </h2>
                  <p className="text-sm tracking-tight text-gray-600">
                    {formatTodayKorean()}
                  </p>
                </div>

                {/* 작성 중 안내 메시지 */}
                {isDirty && (
                  <p className="mb-4 text-sm text-gray-400">
                    페이지를 떠나면 작성 중인 내용이 사라집니다.
                  </p>
                )}

                {/* 폼 필드 */}
                <div className="space-y-6 pt-2">
                  <ReviewFormTitle />
                  <ReviewFormRating />
                  <ReviewFormContent />
                </div>
              </div>
              {/* 폼 제출 버튼 */}
              <button
                type="submit"
                disabled={!isValid}
                className="relative mx-auto block w-full overflow-hidden rounded-2xl bg-white px-4 py-6 text-center transition-colors duration-300 ease-in-out hover:bg-gray-100 disabled:cursor-not-allowed"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-[52%] left-1/2 z-0 -translate-x-1/2 text-4xl font-extrabold tracking-tight whitespace-nowrap text-gray-300/70 select-none"
                >
                  For your Ticket.
                </span>
                <p className="text-md relative z-10 font-bold tracking-tight text-gray-800 lg:text-lg">
                  {onSubmitMode === "edit" ? "리뷰 수정" : "리뷰 등록"}
                </p>
              </button>
            </form>
          </FormProvider>
        </div>
      </main>
    </>
  );
}
