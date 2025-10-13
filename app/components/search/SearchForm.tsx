"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { IoSearchOutline } from "react-icons/io5";
import { z } from "zod";

const schema = z.object({
  search: z.string().max(30, "최대 30자 이하로 입력"),
});
type FormData = z.infer<typeof schema>;

interface SearchFormProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchForm({
  onSearch,
  placeholder = "검색어를 입력하세요",
  initialValue = "",
}: SearchFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { search: initialValue },
  });

  const searchValue = watch("search");

  // initialValue가 변경되면 폼 값 업데이트
  useEffect(() => {
    setValue("search", initialValue);
  }, [initialValue, setValue]);

  // 입력이 비워졌을 때만 즉시 초기화
  useEffect(() => {
    if (searchValue === "") {
      onSearch("");
    }
  }, [searchValue, onSearch]);

  const onSubmit = (data: FormData) => {
    const trimmedSearch = data.search.trim();
    if (trimmedSearch) {
      onSearch(trimmedSearch);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative flex h-10 w-64 items-center"
    >
      <input
        {...register("search")}
        type="search"
        placeholder={placeholder}
        className="h-full w-full rounded-full pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-accent-300 focus:ring-offset-1"
        aria-invalid={!!errors.search}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="absolute right-1 top-0 flex h-full w-10 items-center justify-center disabled:opacity-50"
      >
        <IoSearchOutline size={20} />
      </button>

      {errors.search && (
        <p className="absolute -bottom-5 left-0 text-xs text-red-500">
          {errors.search.message}
        </p>
      )}
    </form>
  );
}
