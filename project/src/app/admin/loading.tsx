export default function AdminLoading() {
  return (
    <div className="w-full p-6 sm:p-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-black/10 rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-black/5 rounded"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-black/10 rounded-lg"></div>
          <div className="h-10 w-32 bg-black/10 rounded-lg"></div>
        </div>
      </div>

      {/* Stats/Overview Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-black/5 rounded-2xl p-6 flex flex-col justify-between border border-black/5">
            <div className="flex justify-between items-start">
              <div className="h-5 w-24 bg-black/10 rounded"></div>
              <div className="h-10 w-10 bg-black/10 rounded-full"></div>
            </div>
            <div className="h-8 w-32 bg-black/10 rounded mt-4"></div>
          </div>
        ))}
      </div>

      {/* Main Content / Table Skeleton */}
      <div className="w-full bg-black/5 rounded-2xl border border-black/5 overflow-hidden">
        {/* Table Header */}
        <div className="h-16 w-full bg-black/10 flex items-center px-6 gap-4">
          <div className="h-4 w-12 bg-black/10 rounded"></div>
          <div className="h-4 w-1/4 bg-black/10 rounded"></div>
          <div className="h-4 w-1/4 bg-black/10 rounded"></div>
          <div className="h-4 w-1/4 bg-black/10 rounded"></div>
        </div>
        {/* Table Rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 w-full border-b border-black/5 flex items-center px-6 gap-4">
            <div className="h-4 w-12 bg-black/5 rounded"></div>
            <div className="flex items-center gap-3 w-1/4">
              <div className="h-10 w-10 bg-black/10 rounded-lg"></div>
              <div className="h-4 w-2/3 bg-black/5 rounded"></div>
            </div>
            <div className="h-4 w-1/4 bg-black/5 rounded"></div>
            <div className="h-4 w-1/4 bg-black/5 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
