"use client";

import Image from "next/image";
import { memo, useEffect, useRef, useState } from "react";
import { usePresignedUrl } from "app/components/user/hooks/usePresignedUrl";

// 헬퍼 함수들
const getImageSrc = (
  previewSrc?: string,
  s3photoKey?: string | null,
  presignedUrl?: string,
) => {
  if (previewSrc) return previewSrc;
  if (s3photoKey) return presignedUrl;
  return undefined;
};

const getFirstLetter = (displayName?: string) => {
  return displayName ? displayName.charAt(0).toUpperCase() : "U";
};

/**
 * 프로필 아바타 컴포넌트
 * @param userDisplayName 사용자 이름(필수)
 * @param s3photoKey S3 이미지 키(선택)
 * @param previewSrc 외부 이미지 URL(선택)
 * @param size 아바타 크기(px)
 * @param className 추가 클래스
 * @param showLoading 로딩 스피너 표시 여부
 * @param isPublic S3 공개 여부
 * @param onImageError 이미지 로딩 실패 시 콜백
 */
interface ProfileAvatarProps {
  userDisplayName: string;
  s3photoKey?: string | null;
  previewSrc?: string;
  size?: number;
  className?: string;
  showLoading?: boolean;
  isPublic?: boolean;
  onImageError?: () => void;
}

function ProfileAvatar({
  userDisplayName,
  s3photoKey,
  previewSrc,
  size = 48,
  className = "",
  showLoading = true,
  isPublic = false,
  onImageError,
}: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // s3photoKey가 있고 화면에 보일 때만 presigned URL 요청
  const shouldFetchUrl = isVisible && s3photoKey && !previewSrc;
  const { url: presignedUrl, loading } = usePresignedUrl({
    key: shouldFetchUrl ? s3photoKey : null,
    isPublic,
  });

  const src = getImageSrc(previewSrc, s3photoKey, presignedUrl);

  // S3 presignedUrl이 필요한 경우에만 Intersection Observer 사용
  useEffect(() => {
    // previewSrc가 있거나 s3photoKey가 없으면 observer 불필요
    if (!s3photoKey || previewSrc) return;

    // 이미 보이면 observer 생성할 필요 없음 (한 번 로드되면 끝)
    if (isVisible) return;

    const currentRef = containerRef.current;
    if (!currentRef) return;

    // rootMargin을 통해 뷰포트 진입 전에 미리 로딩하여 사용자 경험 향상
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "600px 0px" },
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };

    // isVisible을 의존성에 포함하면 observer가 재생성되어 성능 문제 발생
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s3photoKey, previewSrc]);

  // 이미지 소스가 바뀔 때 에러 상태 초기화
  useEffect(() => {
    setImageError(false);
  }, [previewSrc, s3photoKey]);

  // 렌더링 조건들
  const shouldShowImage = !imageError && src;
  const shouldShowLoading = loading && !previewSrc && showLoading;
  const firstLetter = getFirstLetter(userDisplayName);

  return (
    <div
      ref={containerRef}
      className={`isolation-isolate relative transform-gpu overflow-hidden rounded-full will-change-[transform] ${className}`}
      style={{ width: size, height: size, contain: "paint" }}
      aria-label={
        userDisplayName ? `${userDisplayName} 프로필 이미지` : "프로필 이미지"
      }
      data-testid="profile-avatar"
    >
      {shouldShowLoading ? (
        <div className="flex h-full w-full items-center justify-center bg-gray-200">
          <div
            className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
            aria-label="로딩 중"
          ></div>
        </div>
      ) : shouldShowImage && src ? (
        <Image
          src={src}
          alt={userDisplayName || "사용자"}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => {
            setImageError(true);
            if (onImageError) onImageError();
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-500">
          <span
            className="select-none font-bold text-white"
            style={{ fontSize: size * 0.4 }}
          >
            {firstLetter}
          </span>
        </div>
      )}
    </div>
  );
}

export default memo(ProfileAvatar);
