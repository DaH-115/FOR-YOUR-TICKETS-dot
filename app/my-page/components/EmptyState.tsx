export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <p className="text-center text-sm text-gray-600">{message}</p>
    </div>
  );
}
