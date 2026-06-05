"use client";

import TrangChu from "./(client)/trangChu/page";
import TuyChinh from "./(client)/tuyChinh/page";

// Placeholder sections — sẽ được thay thế bằng component thật sau
function BoSuuTapSection() {
  return (
    <div className="min-h-[50vh] bg-[#F8F0E4] flex items-center justify-center text-[#2c1810]">
      <p className="text-lg font-serif">Bộ Sưu Tập — coming soon</p>
    </div>
  );
}

function CauChuyenSection() {
  return (
    <div className="min-h-[50vh] bg-[#2c1810] flex items-center justify-center text-[#F8F0E4]">
      <p className="text-lg font-serif">Câu Chuyện — coming soon</p>
    </div>
  );
}

function LienHeSection() {
  return (
    <div className="min-h-[50vh] bg-[#6B1218] flex items-center justify-center text-[#F8F0E4]">
      <p className="text-lg font-serif">Liên Hệ — coming soon</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero + Banner */}
      <TrangChu />

      {/* Bộ Sưu Tập */}
      <div id="boSuuTap" className="scroll-mt-20">
        <BoSuuTapSection />
      </div>

      {/* Tùy Chỉnh */}
      <div id="tuyChinh" className="scroll-mt-20">
        <TuyChinh />
      </div>

      {/* Câu Chuyện */}
      <div id="cauChuyen" className="scroll-mt-20">
        <CauChuyenSection />
      </div>

      {/* Liên Hệ */}
      <div id="lienHe" className="scroll-mt-20">
        <LienHeSection />
      </div>
    </main>
  );
}
