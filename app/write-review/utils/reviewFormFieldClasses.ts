/**
 * 리뷰 작성 폼 필드 공통 스타일 (포커스 링 제거, 테두리·배경 통일)
 */

/** input / textarea 공통 */
export const reviewFormTextFieldBase =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-300 focus:border-accent-300 focus:bg-white focus:outline-none focus:ring-0 focus:ring-offset-0";

/** 평점 Listbox 버튼 트리거 */
export const reviewFormListboxButtonBase =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm outline-none transition-all duration-300 focus:border-accent-300 focus:bg-white focus:outline-none focus:ring-0 focus:ring-offset-0 data-focus:border-accent-300 data-focus:bg-white data-focus:outline-none";

/** 검증 오류 시 필드·버튼 공통 (베이스의 focus accent/white 덮어쓰기, 아웃라인·ring 없음) */
export const reviewFormFieldError =
  "border-red-500 bg-red-50 focus:!border-red-500 focus:!bg-red-50 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none data-focus:!border-red-500 data-focus:!bg-red-50 data-focus:outline-none";
