import { useState, useCallback, useEffect } from "react";
import { apiCallWithTokenRefresh } from "@/utils/getIdToken/apiCallWithTokenRefresh";
import { firebaseErrorHandler } from "@/utils/firebaseError";
import { isAuth } from "firebase-config";
import { useAlert } from "store/context/alertContext";

export interface Comment {
  id: string;
  authorId: string;
  displayName: string;
  photoKey: string | null;
  content: string;
  activityLevel: string;
  createdAt: string | null;
  updatedAt?: string | null;
}

interface UseCommentsProps {
  reviewId: string;
  userState: {
    uid?: string | null;
    displayName?: string | null;
    photoKey?: string | null;
    activityLevel?: string;
  } | null;
}

export const useComments = ({ reviewId, userState }: UseCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const { showErrorHandler, showConfirmHandler } = useAlert();

  // 댓글 목록 가져오는 함수
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/comments/${reviewId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("댓글 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [reviewId]);

  // 댓글 생성 (낙관적 업데이트 적용)
  const createComment = useCallback(
    async (content: string) => {
      if (
        !content.trim() ||
        isPosting ||
        !isAuth.currentUser ||
        !userState?.uid
      ) {
        return;
      }

      setIsPosting(true);

      // 낙관적 업데이트: 임시 댓글을 즉시 UI에 추가
      const tempComment: Comment = {
        id: `temp-${Date.now()}`, // 임시 ID
        authorId: userState.uid,
        displayName: userState.displayName || "사용자",
        photoKey: userState.photoKey || null,
        content: content.trim(),
        activityLevel: userState.activityLevel || "NEWBIE",
        createdAt: new Date().toISOString(),
      };

      // 즉시 UI에 임시 댓글 추가
      setComments((prev) => [...prev, tempComment]);

      try {
        const result = await apiCallWithTokenRefresh(async (authHeaders) => {
          const response = await fetch(`/api/comments/${reviewId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders,
            },
            body: JSON.stringify({
              authorId: userState.uid,
              content: content.trim(),
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "comment/create-failed");
          }

          return response.json();
        });

        // 성공 시 임시 댓글을 실제 댓글로 교체
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === tempComment.id
              ? { ...comment, id: result.id } // 실제 ID로 교체
              : comment,
          ),
        );
      } catch (error) {
        // 실패 시 임시 댓글 제거
        setComments((prev) =>
          prev.filter((comment) => comment.id !== tempComment.id),
        );

        const { message } = firebaseErrorHandler(error);
        showErrorHandler("오류", message);
        throw error;
      } finally {
        setIsPosting(false);
      }
    },
    [isPosting, reviewId, userState, showErrorHandler],
  );

  // 댓글 수정 (낙관적 업데이트 적용)
  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      if (!content.trim() || isPosting || !isAuth.currentUser) {
        return;
      }

      setIsPosting(true);

      // 낙관적 업데이트: 기존 댓글 내용을 즉시 업데이트
      const originalComment = comments.find((c) => c.id === commentId);
      if (originalComment) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  content: content.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : comment,
          ),
        );
      }

      try {
        await apiCallWithTokenRefresh(async (authHeaders) => {
          const response = await fetch(
            `/api/comments/${reviewId}/${commentId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                ...authHeaders,
              },
              body: JSON.stringify({ content: content.trim() }),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "댓글 수정에 실패했습니다.");
          }

          return response.json();
        });

        // 성공 시 서버에서 최신 데이터로 동기화 (선택적)
        // await fetchComments();
      } catch (error) {
        // 실패 시 원래 내용으로 복원
        if (originalComment) {
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId ? originalComment : comment,
            ),
          );
        }

        const { message } = firebaseErrorHandler(error);
        showErrorHandler("오류", message);
        throw error;
      } finally {
        setIsPosting(false);
      }
    },
    [isPosting, reviewId, comments, showErrorHandler],
  );

  // 댓글 삭제 (확인 다이얼로그 후 낙관적 업데이트 적용)
  const performDelete = useCallback(
    async (commentId: string) => {
      if (!userState?.uid || isPosting) {
        return;
      }

      setIsPosting(true);

      // 낙관적 업데이트: 댓글을 즉시 UI에서 제거
      const deletedComment = comments.find((c) => c.id === commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      try {
        await apiCallWithTokenRefresh(async (authHeaders) => {
          const response = await fetch(
            `/api/comments/${reviewId}/${commentId}`,
            {
              method: "DELETE",
              headers: {
                ...authHeaders,
              },
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "댓글 삭제에 실패했습니다.");
          }

          return response.json();
        });

        // 성공 시 추가 작업 없음 (이미 UI에서 제거됨)
      } catch (error) {
        // 실패 시 삭제된 댓글을 다시 복원
        if (deletedComment) {
          setComments((prev) =>
            [...prev, deletedComment].sort(
              (a, b) =>
                new Date(a.createdAt || "").getTime() -
                new Date(b.createdAt || "").getTime(),
            ),
          );
        }

        console.error("댓글 삭제 실패:", error);
        showErrorHandler(
          "오류",
          error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.",
        );
        throw error;
      } finally {
        setIsPosting(false);
      }
    },
    [userState?.uid, isPosting, reviewId, comments, showErrorHandler],
  );

  const deleteComment = useCallback(
    (commentId: string) => {
      if (!userState?.uid || isPosting) {
        return;
      }

      showConfirmHandler(
        "댓글 삭제",
        "정말 이 댓글을 삭제하시겠습니까?",
        () => performDelete(commentId),
      );
    },
    [userState?.uid, isPosting, showConfirmHandler, performDelete],
  );

  // reviewId가 변경될 때 상태 초기화 및 댓글 목록 가져오기
  useEffect(() => {
    setComments([]);
    setIsLoading(true);
    fetchComments();
  }, [reviewId, fetchComments]);

  return {
    comments,
    isLoading,
    isPosting,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  };
};
