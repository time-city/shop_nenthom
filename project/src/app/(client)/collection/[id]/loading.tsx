export default function CollectionLoading() {
  return (
    <main 
      className="-mt-20 pt-20 min-h-dvh relative"
      style={{
        backgroundImage: "url('/option_background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <section className="relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 max-w-[1400px]">
        <div className="p-6 sm:p-8 lg:p-10 rounded-[2rem] bg-black/20 backdrop-blur-xl border border-[#F5F0E8]/10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] animate-pulse">
          <div className="mb-4 h-5 w-24 bg-[#F5F0E8]/10 rounded"></div>
          
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            {/* Image Skeleton */}
            <div className="flex aspect-[4/5] lg:aspect-square lg:h-[340px] items-center justify-center rounded-2xl p-4 border border-[#F5F0E8]/10 bg-[#F5F0E8]/5 w-full mx-auto"></div>
            
            {/* Details Skeleton */}
            <div className="flex flex-col text-left lg:pt-2">
              <div className="h-10 w-3/4 bg-[#F5F0E8]/10 rounded mb-2"></div>
              <div className="h-4 w-1/4 bg-[#F5F0E8]/10 rounded mb-4 mt-2"></div>
              <div className="h-8 w-1/3 bg-[#F5F0E8]/10 rounded mb-4 mt-2"></div>
              <div className="h-4 w-2/3 bg-[#F5F0E8]/10 rounded mb-8 mt-4"></div>
              
              <div className="flex flex-wrap gap-x-12 gap-y-6 border-t mt-8 pt-6 border-[#F5F0E8]/20">
                <div className="flex-1 min-w-[140px]">
                  <div className="h-4 w-24 bg-[#F5F0E8]/10 rounded mb-3"></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-10 w-20 bg-[#F5F0E8]/10 rounded-lg"></div>
                    <div className="h-10 w-24 bg-[#F5F0E8]/10 rounded-lg"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <div className="h-4 w-24 bg-[#F5F0E8]/10 rounded mb-3"></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-10 w-20 bg-[#F5F0E8]/10 rounded-lg"></div>
                    <div className="h-10 w-24 bg-[#F5F0E8]/10 rounded-lg"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <div className="h-4 w-24 bg-[#F5F0E8]/10 rounded mb-3"></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-10 w-20 bg-[#F5F0E8]/10 rounded-lg"></div>
                    <div className="h-10 w-24 bg-[#F5F0E8]/10 rounded-lg"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 space-y-6">
                <div className="border-t pt-6 flex flex-col xl:flex-row xl:items-center gap-5 border-[#F5F0E8]/20">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-20 bg-[#F5F0E8]/10 rounded"></div>
                    <div className="h-9 w-24 bg-[#F5F0E8]/10 rounded-lg"></div>
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 h-11 bg-[#F5F0E8]/10 rounded-full"></div>
                    <div className="flex-1 h-11 bg-[#F5F0E8]/10 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
