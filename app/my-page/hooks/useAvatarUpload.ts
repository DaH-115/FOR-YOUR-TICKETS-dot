// 프로필 아바타(이미지) 업로드 관련 비즈니스 로직을 담당하는 커스텀 훅
// - 파일 선택, 확장자/용량/타입 검증, 프리뷰, 에러 상태, 입력 리셋 등 UI와 분리된 로직을 제공
// - UI 컴포넌트는 이 훅에서 반환하는 상태와 함수만 사용하면 됨
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { validateFileExtension } from "app/utils/file/validateFileExtension";
import { validateFileType } from "app/utils/file/validateFileType";
import {
  validateFileSize,
  MAX_FILE_SIZE,
} from "app/utils/file/validateFileSize";
import { formatFileSize } from "app/utils/file/formatFileSize";

// 콜백 타입 정의
export interface AvatarUploadCallbacks {
  onPreview?: (url: string) => void;
  onCancelPreview?: () => void;
  onFileSelect?: (file: File | null) => void;
  onImageChange?: (hasImage: boolean) => void;
  onError?: (message: string) => void;
}

export function useAvatarUpload(callbacks: AvatarUploadCallbacks = {}) {
  // 편집 모드 여부 (true: 이미지 업로드/변경 중)
  const [isEditing, setIsEditing] = useState(false);
  // 이미지 미리보기 URL (File 객체로부터 생성)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // 업로드할 파일 객체
  const [file, setFile] = useState<File | null>(null);
  // 에러 메시지 (검증 실패 시)
  const [error, setError] = useState<string | null>(null);
  // 파일 입력(input) DOM 참조
  const inputRef = useRef<HTMLInputElement | null>(null);

  // URL cleanup 함수
  const cleanupUrl = (url: string | null) => {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  };

  // 컴포넌트 언마운트 시 URL 해제
  useEffect(() => {
    return () => {
      if (previewUrl) {
        cleanupUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  /**
   * 편집 모드 토글 핸들러
   * - 편집 모드 진입/종료 시 상태 초기화
   */
  const onEditToggle = () => {
    const nextIsEditing = !isEditing;
    setIsEditing(nextIsEditing);
    setError(null);
    // 편집 종료 시 프리뷰/파일/입력값 초기화
    if (!nextIsEditing) {
      // 부모가 previewSrc를 먼저 비우도록 콜백을 먼저 호출 (revoked URL 표시 방지)
      callbacks.onCancelPreview?.();
      callbacks.onFileSelect?.(null);
      callbacks.onImageChange?.(false);
      // 기존 URL 해제
      if (previewUrl) {
        cleanupUrl(previewUrl);
      }
      setPreviewUrl(null);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  /**
   * 파일 선택/변경 이벤트 핸들러
   * - 확장자, 타입, 용량 등 검증 후 상태 업데이트
   * - 실패 시 에러 메시지 및 입력값 초기화
   */
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    if (!file) {
      // 부모가 previewSrc를 먼저 비우도록 콜백을 먼저 호출 (revoked URL 표시 방지)
      callbacks.onFileSelect?.(null);
      callbacks.onCancelPreview?.();
      callbacks.onImageChange?.(false);
      // 기존 URL 해제
      if (previewUrl) {
        cleanupUrl(previewUrl);
      }
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    // 확장자 검증 (예: .jpg, .png 등)
    if (!validateFileExtension(file.name)) {
      const msg = `지원하지 않는 파일 형식입니다. (JPG, PNG, GIF 파일만 업로드 가능)`;
      setError(msg);
      callbacks.onError?.(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    // MIME 타입 검증 (예: image/jpeg 등)
    if (!validateFileType(file.type)) {
      const msg =
        "지원하지 않는 파일 형식입니다. (JPG, PNG, GIF 파일만 업로드 가능)";
      setError(msg);
      callbacks.onError?.(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    // 용량 제한 검증
    if (!validateFileSize(file.size)) {
      const msg = `파일 크기가 너무 큽니다. (최대 ${formatFileSize(MAX_FILE_SIZE)}, 현재 파일: ${formatFileSize(file.size)})`;
      setError(msg);
      callbacks.onError?.(msg);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    // 검증 통과 시 상태 업데이트
    // 기존 URL 해제 후 새로운 URL 생성
    if (previewUrl) {
      cleanupUrl(previewUrl);
    }
    setFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    callbacks.onFileSelect?.(file);
    callbacks.onPreview?.(url);
    callbacks.onImageChange?.(true);
  };

  // UI에서 사용할 상태/함수 반환
  return {
    isEditing,
    setIsEditing,
    previewUrl,
    file,
    error,
    inputRef,
    onEditToggle,
    onFileChange,
  };
}
