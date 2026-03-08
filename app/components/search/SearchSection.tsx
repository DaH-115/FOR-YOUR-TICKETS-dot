"use client";

import SearchForm from "app/components/search/SearchForm";

interface SearchSectionProps {
  searchTerm: string;
  resultCount: number;
  onSearch?: (term: string) => void;
  basePath?: string;
}

export default function SearchSection({
  searchTerm,
  resultCount,
  onSearch,
  basePath,
}: SearchSectionProps) {
  return (
    <div className="my-8 flex flex-col gap-2">
      <SearchForm
        placeholder="영화 제목으로 검색해 보세요"
        onSearch={onSearch}
        basePath={basePath}
        initialValue={searchTerm}
      />

      {searchTerm && (
        <div className="text-sm text-gray-500">
          <span className="font-medium">{`"${searchTerm}"`}</span> 검색 결과:
          {resultCount}개
        </div>
      )}
    </div>
  );
}
