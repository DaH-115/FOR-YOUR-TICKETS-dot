"use client";

// 파일 업로드 관련 상수/유틸을 통합 유틸에서 import
import { MAX_FILE_SIZE } from "app/utils/file/validateFileSize";
import { ALLOWED_EXTENSIONS } from "app/utils/file/validateFileExtension";
import { formatFileSize } from "app/utils/file/formatFileSize";
import {
  useAvatarUpload,
  AvatarUploadCallbacks,
} from "app/my-page/hooks/useAvatarUpload";

export default function AvatarUploader(props: AvatarUploadCallbacks) {
  const { isEditing, inputRef, onEditToggle, onFileChange } =
    useAvatarUpload(props);

  return (
    <div className="text-xs">
      {!isEditing ? (
        <button
          type="button"
          onClick={onEditToggle}
          className="rounded-full bg-gray-800 px-3 py-2 text-white transition-colors hover:bg-gray-700"
        >
          프로필 사진 수정
        </button>
      ) : (
        <div className="space-y-3">
          <div className="space-x-2">
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(",")}
              className="hidden"
              onChange={onFileChange}
              data-testid="avatar-file-input"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-xl bg-gray-200 px-3 py-2 transition-colors hover:bg-gray-300"
            >
              이미지 선택
            </button>

            <button
              type="button"
              onClick={onEditToggle}
              className="rounded-xl border border-gray-300 px-3 py-2 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
            >
              취소
            </button>
          </div>

          {/* 파일 제한 안내 */}
          <div className="space-y-1 text-xs text-gray-500">
            <p>• 지원 형식: JPG, PNG, GIF</p>
            <p>• 최대 크기: {formatFileSize(MAX_FILE_SIZE)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
