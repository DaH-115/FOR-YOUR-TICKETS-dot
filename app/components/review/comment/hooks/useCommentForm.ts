import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const commentSchema = z.object({
  comment: z
    .string()
    .min(1, { message: "댓글을 입력해주세요." })
    .max(500, { message: "댓글은 500자 이하로 작성해주세요." }),
});

type CommentForm = z.infer<typeof commentSchema>;

interface UseCommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onUpdate?: (id: string, content: string) => Promise<void>;
  isPosting: boolean;
}

export const useCommentForm = ({
  onSubmit,
  onUpdate,
  isPosting,
}: UseCommentFormProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { comment: "" },
  });

  // 폼 제출 핸들러
  const onFormSubmit = useCallback(
    async (data: CommentForm) => {
      if (!data.comment.trim() || isPosting) {
        return;
      }

      try {
        if (editingId && onUpdate) {
          // 수정 모드
          await onUpdate(editingId, data.comment.trim());
          setEditingId(null);
        } else {
          // 생성 모드
          await onSubmit(data.comment.trim());
        }

        // 성공 시 폼 리셋
        reset({ comment: "" });
      } catch (error) {
        // 에러는 상위에서 처리됨
        console.error("댓글 제출 실패:", error);
      }
    },
    [onSubmit, onUpdate, isPosting, editingId, reset],
  );

  // 댓글 수정 시작
  const startEdit = useCallback(
    (id: string, content: string) => {
      setEditingId(id);
      reset({ comment: content });
    },
    [reset],
  );

  // 수정 취소
  const cancelEdit = useCallback(() => {
    setEditingId(null);
    reset({ comment: "" });
  }, [reset]);

  return {
    register,
    handleSubmit: handleSubmit(onFormSubmit),
    errors,
    isSubmitting,
    editingId,
    startEdit,
    cancelEdit,
    reset,
  };
};
