"use client";

import Image from "next/image";
import { memo, useEffect, useRef, useState } from "react";
import { usePresignedUrl } from "@/components/user/hooks/usePresignedUrl";

const getFirstLetter = (displayName?: string) => {
  return displayName ? displayName.charAt(0).toUpperCase() : "U";
};

export interface ProfileAvatarProps {
  /** 사용자 이름(필수) */
  userDisplayName: string;
  /** S3 이미지 키(선택) */
  s3photoKey?: string | null;
  /** 외부 이미지 URL(선택) */
  previewSrc?: string;
  /** 아바타 크기(px, 기본값: 48) */
  size?: number;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 로딩 스피너 표시 여부(기본값: true) */
  showLoading?: boolean;
  /** 이미지 로딩 실패 시 콜백 */
  onImageError?: () => void;
}

/**
 * 프로필 아바타 컴포넌트
 *
 * 사용자 프로필 이미지를 표시하는 컴포넌트입니다.
 * S3 이미지, 외부 URL, 또는 사용자 이름의 첫 글자를 표시할 수 있습니다.
 *
 * @param props ProfileAvatarProps
 * @returns JSX.Element
 */
function ProfileAvatar({
  userDisplayName,
  s3photoKey,
  previewSrc,
  size = 48,
  className = "",
  showLoading = true,
  onImageError,
}: ProfileAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // s3photoKey가 있고 화면에 보일 때만 presigned URL 요청
  const shouldFetchUrl = isVisible && s3photoKey && !previewSrc;
  const { url: presignedUrl, loading } = usePresignedUrl({
    key: shouldFetchUrl ? s3photoKey : null,
  });

  // 이미지 우선순위: previewSrc > s3photoKey의 presignedUrl > undefined
  const src = previewSrc || (s3photoKey ? presignedUrl : undefined);

  // S3 이미지 지연 로딩을 위한 Intersection Observer
  useEffect(() => {
    if (!s3photoKey || previewSrc || isVisible) return;

    const currentRef = containerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentRef);
        }
      },
      { rootMargin: "300px 0px" }, // 600px에서 300px로 단순화
    );

    observer.observe(currentRef);
    return () => observer.unobserve(currentRef);
  }, [s3photoKey, previewSrc, isVisible]);

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
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
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
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600">
          <span
            className="select-none font-bold text-white drop-shadow-sm"
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
