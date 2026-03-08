"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { IoSearchOutline } from "react-icons/io5";
import { z } from "zod";

const schema = z.object({
  search: z.string().max(30, "최대 30자 이하로 입력"),
});
type FormData = z.infer<typeof schema>;

interface SearchFormProps {
  onSearch?: (term: string) => void;
  basePath?: string;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchForm({
  onSearch,
  basePath,
  placeholder = "검색어를 입력하세요",
  initialValue = "",
}: SearchFormProps) {
  const router = useRouter();
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
  const prevSearchValueRef = useRef<string | null>(null);

  useEffect(() => {
    setValue("search", initialValue);
  }, [initialValue, setValue]);

  // 사용자가 입력을 비웠을 때만 URL 초기화 (마운트 시 빈 값이면 호출 안 함)
  useEffect(() => {
    if (searchValue === "") {
      const hadValue = prevSearchValueRef.current !== null && prevSearchValueRef.current !== "";
      if (hadValue) {
        if (basePath) {
          router.push(basePath);
        } else {
          onSearch?.("");
        }
      }
    }
    prevSearchValueRef.current = searchValue;
  }, [searchValue, onSearch, basePath, router]);

  const onSubmit = (data: FormData) => {
    const trimmedSearch = data.search.trim();
    if (!trimmedSearch) return;

    if (basePath) {
      const params = new URLSearchParams();
      params.set("search", trimmedSearch);
      params.set("page", "1");
      router.push(`${basePath}?${params.toString()}`);
    } else {
      onSearch?.(trimmedSearch);
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
        className="focus:ring-accent-300 w-full rounded-full bg-white py-2 pr-12 pl-4 text-sm tracking-tight text-gray-900 outline-hidden focus:ring-1"
        aria-invalid={!!errors.search}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="absolute right-3"
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
