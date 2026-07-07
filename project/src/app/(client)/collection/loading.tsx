export default function CollectionLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="mb-8 flex justify-center">
        <div className="h-10 w-48 bg-[#F5F0E8]/20 rounded-lg"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-[2rem] bg-black/10 backdrop-blur-xl border border-[#F5F0E8]/5 p-4 shadow-lg">
            <div className="aspect-[4/5] w-full rounded-2xl bg-[#F5F0E8]/10"></div>
            <div className="px-2 pb-2">
              <div className="h-5 w-3/4 bg-[#F5F0E8]/10 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-[#F5F0E8]/10 rounded mb-4"></div>
              <div className="h-10 w-full bg-[#F5F0E8]/10 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
