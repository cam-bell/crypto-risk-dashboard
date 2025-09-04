import { LoadingSpinner } from "./Skeleton";

interface FullPageLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function FullPageLoader({
  message = "Loading...",
  size = "lg",
}: FullPageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

// Specialized loaders for specific scenarios
export function AuthLoader() {
  return <FullPageLoader message="Authenticating..." size="md" />;
}

export function ErrorLoader({ message }: { message: string }) {
  return <FullPageLoader message={message} size="md" />;
}

export function InitialLoadLoader() {
  return <FullPageLoader message="Initializing application..." size="lg" />;
}
