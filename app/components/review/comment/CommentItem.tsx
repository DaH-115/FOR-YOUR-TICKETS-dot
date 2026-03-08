import ActivityBadge from "@/components/ui/feedback/ActivityBadge";
import ProfileAvatar from "@/components/user/ProfileAvatar";
import formatDate from "@/utils/formatDate";
import { Comment } from "@/components/review/comment/hooks/useComments";

interface CommentItemProps {
  comment: Comment;
  index: number;
  isLast: boolean;
  reviewAuthorId: string;
  currentUserId?: string | null;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export default function CommentItem({
  comment,
  index,
  isLast,
  reviewAuthorId,
  currentUserId,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const isAuthor = comment.authorId === reviewAuthorId;
  const isOwner = currentUserId === comment.authorId;
  const isTemporary = comment.id.startsWith("temp-"); // 임시 댓글인지 확인

  return (
    <li
      className={`py-2 ${!isLast ? "border-b-4 border-dotted" : ""} ${
        isTemporary ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-800">{`${index + 1}.`}</span>
            <ProfileAvatar
              s3photoKey={comment.photoKey || undefined}
              userDisplayName={comment.displayName || "익명"}
              size={24}
            />
            <p className="text-sm text-gray-800">
              {comment.displayName || "익명"}
            </p>
            <ActivityBadge activityLevel={comment.activityLevel} />
          </div>
          {isAuthor && (
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
              작성자
            </span>
          )}
          {isTemporary && (
            <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">
              등록 중...
            </span>
          )}
        </div>

        {/* 댓글 작성자와 로그인한 유저가 같을 때만 수정/삭제 버튼 노출 */}
        {isOwner && !isTemporary && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(comment.id, comment.content)}
              className="text-xs text-black"
              aria-label="댓글 수정"
            >
              수정
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs text-red-600"
              aria-label="댓글 삭제"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <p className="py-4 text-sm text-gray-800">{comment.content}</p>

      <span className="mt-2 block text-right text-xs text-gray-400">
        {formatDate(comment.createdAt)}
      </span>
    </li>
  );
}
