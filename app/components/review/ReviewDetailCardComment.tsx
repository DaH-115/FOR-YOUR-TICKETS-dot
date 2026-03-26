"use client";

import { useCallback } from "react";
import { useAppSelector } from "store/redux-toolkit/hooks";
import { selectUser } from "store/redux-toolkit/slice/userSlice";
import { useAlert } from "store/context/alertContext";
import { ReviewDoc } from "types";
import { useComments } from "@/components/review/comment/hooks/useComments";
import CommentForm from "@/components/review/comment/CommentForm";
import { useCommentForm } from "@/components/review/comment/hooks/useCommentForm";
import CommentItem from "@/components/review/comment/CommentItem";

interface ReviewDetailCardCommentProps {
  review: ReviewDoc;
}

export default function ReviewDetailCardComment({
  review,
}: ReviewDetailCardCommentProps) {
  const reviewId = review.id;
  const reviewAuthorId = review.user.uid ?? "";
  const userState = useAppSelector(selectUser);
  const { showConfirmHandler } = useAlert();

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

  // 수정 버튼 클릭 시 확인 다이얼로그 표시 후 수정 모드 진입
  const handleEditWithConfirm = useCallback(
    (id: string, content: string) => {
      showConfirmHandler("댓글 수정", "이 댓글을 수정하시겠습니까?", () =>
        startEdit(id, content),
      );
    },
    [showConfirmHandler, startEdit],
  );

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-b-2xl bg-white px-8 py-6">
        {/* 라벨 */}
        <p className="mb-4 text-sm font-bold tracking-tight text-gray-800">
          {"Comments."}
          <span className="ml-2 font-bold">{comments.length}</span>
        </p>

        {/* 코멘트 영역  */}
        <ul className="mb-8 list-none space-y-8 p-0">
          {comments.map((comment, idx) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              index={idx}
              isLast={idx === comments.length - 1}
              reviewAuthorId={reviewAuthorId}
              currentUserId={userState?.uid}
              onEdit={handleEditWithConfirm}
              onDelete={deleteComment}
            />
          ))}
        </ul>

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
      </div>
    </section>
  );
}
