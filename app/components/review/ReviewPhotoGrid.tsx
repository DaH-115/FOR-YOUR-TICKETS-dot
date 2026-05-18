"use client";

import Image from "next/image";
import { usePresignedUrl } from "@/components/user/hooks/usePresignedUrl";

interface ReviewPhotoGridProps {
  photoKeys?: string[];
  compact?: boolean;
}

function ReviewPhotoItem({
  photoKey,
  compact = false,
}: {
  photoKey: string;
  compact?: boolean;
}) {
  const { url, loading } = usePresignedUrl({ key: photoKey });

  if (!url && !loading) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gray-100 ${
        compact ? "h-32" : "h-40"
      }`}
    >
      {url ? (
        <Image
          src={url}
          alt="리뷰 사진"
          fill
          sizes="(max-width: 768px) 50vw, 240px"
          className="object-cover"
        />
      ) : (
        <div className="h-full w-full animate-pulse bg-gray-200" />
      )}
    </div>
  );
}

export default function ReviewPhotoGrid({
  photoKeys,
  compact = false,
}: ReviewPhotoGridProps) {
  const visiblePhotoKeys = photoKeys?.filter(Boolean) ?? [];

  if (visiblePhotoKeys.length === 0) return null;

  return (
    <div className={`grid grid-cols-2 gap-2 ${compact ? "py-3" : "py-6"}`}>
      {visiblePhotoKeys.map((photoKey) => (
        <ReviewPhotoItem key={photoKey} photoKey={photoKey} compact={compact} />
      ))}
    </div>
  );
}
