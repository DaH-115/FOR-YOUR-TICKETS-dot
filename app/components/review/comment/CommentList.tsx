"use client";

import { ReviewDoc } from "lib/reviews/fetchReviewsPaginated";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import { useComments } from "@/components/review/comment/hooks/useComments";
import { useCommentForm } from "@/components/review/comment/hooks/useCommentForm";
import CommentItem from "@/components/review/comment/CommentItem";
import CommentForm from "@/components/review/comment/CommentForm";

export default function CommentList({
  id: reviewId,
  reviewAuthorId,
}: Pick<ReviewDoc, "id"> & { reviewAuthorId: string }) {
  const userState = useAppSelector(selectUser);

  // 댓글 관련 커스텀 훅
  const {
    comments,
    isLoading,
    isPosting,
    createComment,
    updateComment,
    deleteComment,
  } = useComments({
    reviewId,
    userState: userState
      ? {
          uid: userState.uid,
          displayName: userState.displayName,
          photoKey: userState.photoKey,
          activityLevel: userState.activityLevel,
        }
      : null,
  });

  // 댓글 폼 관련 커스텀 훅
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    editingId,
    startEdit,
    cancelEdit,
  } = useCommentForm({
    onSubmit: createComment,
    onUpdate: updateComment,
    isPosting,
  });

  return (
    <div className="mx-auto mt-6 w-full max-w-md">
      <p className="mb-2 font-bold text-white">댓글 {comments.length}개</p>
      <section className="rounded-2xl border bg-white p-4">
        {/* 로딩 스피너 */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"></div>
            <span className="ml-2 text-sm text-gray-600">
              댓글을 불러오는 중...
            </span>
          </div>
        )}

        {/* 댓글 목록 */}
        <div
          className={`${!isLoading && comments.length > 0 ? "overflow-y-auto scrollbar-hide" : "hidden"}`}
        >
          <ul className="space-y-2">
            {comments.map((comment, idx) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                index={idx}
                isLast={idx === comments.length - 1}
                reviewAuthorId={reviewAuthorId}
                currentUserId={userState?.uid}
                onEdit={startEdit}
                onDelete={deleteComment}
              />
            ))}
          </ul>
        </div>

        {/* 댓글 작성 폼 */}
        {!isLoading && (
          <CommentForm
            userState={userState}
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            isSubmitting={isSubmitting}
            editingId={editingId}
            onCancelEdit={cancelEdit}
          />
        )}
      </section>
    </div>
  );
}
