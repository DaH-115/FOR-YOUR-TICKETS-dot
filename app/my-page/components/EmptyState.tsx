interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center py-8">
      <p className="text-center text-sm text-gray-500">{message}</p>
    </div>
  );
}
