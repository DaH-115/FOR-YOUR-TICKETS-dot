import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { useFormContext, Controller } from "react-hook-form";
import { IoChevronDown } from "react-icons/io5";
import { FaExclamationTriangle, FaStar, FaStarHalf } from "react-icons/fa";
import { ReviewFormValues } from "@/write-review/types";

const ratingOptions = [
  { value: 1, label: "1점", stars: 0.5, description: "매우 나쁨" },
  { value: 2, label: "2점", stars: 1, description: "나쁨" },
  { value: 3, label: "3점", stars: 1.5, description: "별로" },
  { value: 4, label: "4점", stars: 2, description: "그저 그럼" },
  { value: 5, label: "5점", stars: 2.5, description: "보통" },
  { value: 6, label: "6점", stars: 3, description: "괜찮음" },
  { value: 7, label: "7점", stars: 3.5, description: "좋음" },
  { value: 8, label: "8점", stars: 4, description: "매우 좋음" },
  { value: 9, label: "9점", stars: 4.5, description: "훌륭함" },
  { value: 10, label: "10점", stars: 5, description: "완벽함" },
];

const Stars = ({ count }: { count: number }) => {
  const fullStars = Math.floor(count);
  const hasHalfStar = count % 1 !== 0;

  return (
    <div className="flex">
      {/* 꽉 찬 별들 */}
      {Array.from({ length: fullStars }, (_, i) => (
        <FaStar key={`full-${i}`} className="text-accent-400" size={14} />
      ))}
      {/* 반개 별 */}
      {hasHalfStar && <FaStarHalf className="text-accent-400" size={14} />}
    </div>
  );
};

export default function ReviewFormRating() {
  const { control } = useFormContext<ReviewFormValues>();

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-600">평점</label>

      <Controller
        name="rating"
        control={control}
        defaultValue={5}
        rules={{ validate: (value) => value > 0 || "평점을 선택해주세요." }}
        render={({ field, fieldState: { error } }) => {
          const selected = ratingOptions.find(
            (opt) => opt.value === field.value,
          );

          return (
            <div className="relative">
              <Listbox value={field.value} onChange={field.onChange}>
                <ListboxButton
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-all focus:outline-none focus:ring-1 focus:ring-accent-300 focus:ring-offset-1 ${
                    error
                      ? "border-red-500 bg-red-50 ring-2 ring-red-500/30"
                      : "bg-gray-white border-gray-200 focus:border-accent-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {selected ? (
                        <>
                          <Stars count={selected.stars} />
                          <div className="space-x-2 text-gray-800">
                            <span className="text-sm text-gray-700">
                              {selected.label}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              {selected.description && selected.description}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">
                          평점을 선택해주세요
                        </span>
                      )}
                    </div>
                    <IoChevronDown
                      className="transition-transform data-[open]:rotate-180"
                      size={16}
                    />
                  </div>
                </ListboxButton>

                <ListboxOptions className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none">
                  {ratingOptions.map((option) => (
                    <ListboxOption
                      key={option.value}
                      value={option.value}
                      className="flex cursor-pointer items-center space-x-3 px-4 py-3 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-accent-50 data-[focus]:bg-accent-100 data-[selected]:bg-accent-50"
                    >
                      <Stars count={option.stars} />
                      <div className="space-x-2 text-gray-800">
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {option.description && option.description}
                        </span>
                      </div>
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </Listbox>

              {error && (
                <p className="mt-1 flex items-center space-x-1 text-sm text-red-600">
                  <span>
                    <FaExclamationTriangle />
                  </span>
                  <span>{error.message}</span>
                </p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
