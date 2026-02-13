import { useFormContext } from "react-hook-form";

interface BioInputProps {
  originalValue?: string | null;
  isEditing: boolean;
}

export default function BioInput({ isEditing, originalValue }: BioInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label
        htmlFor="biography"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        소개
      </label>
      {isEditing ? (
        <>
          <textarea
            id="biography"
            {...register("biography")}
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-hidden focus:ring-1 focus:ring-accent-300 focus:ring-offset-1"
            placeholder="자신을 소개해보세요"
          />
          {errors.biography?.message && (
            <p className="mt-1 text-xs text-red-500">
              {errors.biography.message as string}
            </p>
          )}
        </>
      ) : (
        <div className="mt-1">
          <p className="border-b border-gray-500 py-2 text-gray-800">
            {originalValue || "바이오 없음"}
          </p>
        </div>
      )}
    </div>
  );
}
