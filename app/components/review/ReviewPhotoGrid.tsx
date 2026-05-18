"use client";

import Image from "next/image";
import { useState } from "react";
import { usePresignedUrl } from "@/components/user/hooks/usePresignedUrl";

interface ReviewPhotoGridProps {
  photoKeys?: string[];
  compact?: boolean;
}

function ReviewPhotoItem({
  photoKey,
  compact = false,
  onOpen,
}: {
  photoKey: string;
  compact?: boolean;
  onOpen: (url: string) => void;
}) {
  const { url, loading } = usePresignedUrl({ key: photoKey });

  if (!url && !loading) return null;

  return (
    <button
      type="button"
      className={`relative overflow-hidden rounded-lg bg-gray-100 ${
        compact ? "h-32" : "h-40"
      }`}
      onClick={(event) => {
        event.stopPropagation();
        if (url) onOpen(url);
      }}
      aria-label="리뷰 사진 크게 보기"
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
    </button>
  );
}

export default function ReviewPhotoGrid({
  photoKeys,
  compact = false,
}: ReviewPhotoGridProps) {
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const visiblePhotoKeys = photoKeys?.filter(Boolean) ?? [];

  if (visiblePhotoKeys.length === 0) return null;

  return (
    <>
      <div className={`grid grid-cols-2 gap-2 ${compact ? "py-3" : "py-6"}`}>
        {visiblePhotoKeys.map((photoKey) => (
          <ReviewPhotoItem
            key={photoKey}
            photoKey={photoKey}
            compact={compact}
            onOpen={setSelectedPhotoUrl}
          />
        ))}
      </div>

      {selectedPhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPhotoUrl(null)}
        >
          <button
            type="button"
            className="absolute top-5 right-5 z-10 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
            onClick={() => setSelectedPhotoUrl(null)}
          >
            닫기
          </button>
          <div
            className="relative h-[85vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedPhotoUrl}
              alt="리뷰 사진 원본 보기"
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
