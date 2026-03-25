import formatDate from "@/utils/formatDate";
import { Comment } from "@/components/review/comment/hooks/useComments";
import ProfileAvatar from "@/components/user/ProfileAvatar";
import ActivityBadge from "@/components/ui/feedback/ActivityBadge";

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
    <li className={`pb-2 ${!isLast ? "border-b-2 border-dashed" : ""}`}>
      <div className="flex items-start justify-between gap-4 pb-6">
        <div className="flex shrink-0 items-center gap-2">
          {/* 코멘트 인덱스 */}
          <span className="text-xs tracking-tight text-gray-800">
            {index + 1}.
          </span>
          {/* 유저 프로필 */}
          <ProfileAvatar
            s3photoKey={comment.photoKey}
            userDisplayName={comment.displayName}
            size={24}
          />
          <p className="text-xs font-semibold tracking-tight text-gray-800">
            {comment.displayName}
          </p>

          {isAuthor ? (
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
              작성자
            </span>
          ) : (
            <ActivityBadge activityLevel={comment.activityLevel} />
          )}
          {isTemporary && (
            <span className="text-xs text-gray-600">등록 중</span>
          )}
        </div>

        {/* 코멘트 내용 */}
        <p className="w-full text-sm tracking-tight whitespace-pre-line">
          {comment.content}
        </p>
      </div>

      {isOwner && !isTemporary && (
        <div className="mb-1 flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(comment.id, comment.content)}
              className="text-xs text-gray-600"
              aria-label="댓글 수정"
            >
              수정
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs text-gray-600"
              aria-label="댓글 삭제"
            >
              삭제
            </button>
          </div>
        </div>
      )}
      {/* 작성 날짜 */}
      <p className="text-right text-xs tracking-tight text-gray-400">
        {formatDate(comment.createdAt, false)}
      </p>
    </li>
  );
}
