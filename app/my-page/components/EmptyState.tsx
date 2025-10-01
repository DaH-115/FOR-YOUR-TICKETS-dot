export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex w-full items-center justify-center">
      <p className="pb-8 pt-16 text-center text-sm text-gray-500">{message}</p>
    </div>
  );
}
