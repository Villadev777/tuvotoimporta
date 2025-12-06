export function SkeletonCandidato() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gray-200"></div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>

        <div className="h-10 bg-gray-200 rounded-lg"></div>

        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
