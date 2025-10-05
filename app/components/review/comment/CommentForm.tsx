import ActivityBadge from "@/components/ui/feedback/ActivityBadge";
import ProfileAvatar from "@/components/user/ProfileAvatar";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface CommentFormData {
  comment: string;
}

interface CommentFormProps {
  userState: {
    uid?: string | null;
    displayName?: string | null;
    photoKey?: string | null;
    activityLevel?: string;
  } | null;
  register: UseFormRegister<CommentFormData>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<CommentFormData>;
  isSubmitting: boolean;
  editingId: string | null;
  onCancelEdit: () => void;
}

export default function CommentForm({
  userState,
  register,
  handleSubmit,
  errors,
  isSubmitting,
  editingId,
  onCancelEdit,
}: CommentFormProps) {
  if (!userState?.uid) {
    return null;
  }

  return (
    <>
      {/* 현재 사용자 프로필 정보 */}
      <div className="border-t-4 border-dotted pt-6">
        <div className="mb-3 flex items-center gap-2">
          <ProfileAvatar
            s3photoKey={userState.photoKey || undefined}
            userDisplayName={userState.displayName || "사용자"}
            size={24}
          />
          <p className="min-w-0 truncate text-sm">
            {userState.displayName || "사용자"}
          </p>
          <ActivityBadge activityLevel={userState.activityLevel} />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          {...register("comment")}
          className={`w-full rounded-md border p-2 text-sm ${
            errors.comment ? "border-red-500" : ""
          }`}
          rows={2}
          placeholder="댓글을 입력하세요"
          aria-label="댓글 입력"
        />

        {errors.comment && (
          <p className="text-xs text-red-500">{errors.comment.message}</p>
        )}

        <div className="mt-2 flex items-center justify-end text-sm">
          {editingId && (
            <button
              type="button"
              className="mr-4 text-gray-700 hover:text-gray-500"
              onClick={onCancelEdit}
              aria-label="댓글 수정 취소"
            >
              취소
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full border border-primary-600 bg-primary-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-primary-400 disabled:bg-gray-400"
            aria-label={editingId ? "댓글 수정 완료" : "댓글 등록"}
          >
            {editingId ? "수정 완료" : "등록"}
          </button>
        </div>
      </form>
    </>
  );
}
