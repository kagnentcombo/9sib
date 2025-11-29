interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  type?: "text" | "card" | "table" | "profile";
}

export default function SkeletonLoader({
  className = "",
  lines = 3,
  type = "text",
}: SkeletonLoaderProps) {
  if (type === "profile") {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header */}
        <div className="h-8 w-48 bg-gray-200 rounded" />
        
        {/* User card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-60 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Premium status card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 animate-pulse ${className}`}>
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-gray-200 rounded ${
                i === lines - 1 ? "w-2/3" : "w-full"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="animate-pulse">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-4 flex gap-4">
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
          </div>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="border-t border-gray-200 p-4 flex gap-4">
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-200 rounded ${
            i === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}
