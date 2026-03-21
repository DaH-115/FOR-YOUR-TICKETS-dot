"use client";

import SearchForm from "app/components/search/SearchForm";

interface SearchSectionProps {
  searchTerm: string;
  resultCount: number;
  onSearch?: (term: string) => void;
  basePath?: string;
  /** 검색 중일 때 결과 개수 숨김 (기본값: false) */
  showResultCount?: boolean;
}

export default function SearchSection({
  searchTerm,
  resultCount,
  onSearch,
  basePath,
  showResultCount = true,
}: SearchSectionProps) {
  return (
    <div className="mt-4 mb-8 flex flex-col gap-2">
      <SearchForm
        placeholder="영화 제목으로 검색해 보세요"
        onSearch={onSearch}
        basePath={basePath}
        initialValue={searchTerm}
      />

      {searchTerm && showResultCount && (
        <div className="text-sm text-gray-500">
          <span className="font-medium">{`"${searchTerm}" 검색 결과 ${resultCount !== null ? resultCount.toLocaleString() : "..."}`}</span>
        </div>
      )}
    </div>
  );
}
