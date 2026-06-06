import TrangChu from "./(client)/trangChu/page";
import BoSuuTap from "./(client)/boSuuTap/page";
import TuyChinh from "./(client)/tuyChinh/page";
import CauChuyen from "./(client)/cauChuyen/page";
import LienHe from "./(client)/lienHe/page";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-[#F8F0E4]">
      {/* 1. Trang chủ (Hero + Banner) */}
      <TrangChu />

      {/* 2. Bộ sưu tập */}
      <section id="boSuuTap" className="scroll-mt-20">
        <BoSuuTap />
      </section>

      {/* 3. Tùy chỉnh (Hỗ trợ cả hashtag #tuyChinh và #tuVan) */}
      <section id="tuyChinh" className="scroll-mt-20">
        <div id="tuVan">
          <TuyChinh />
        </div>
      </section>

      {/* 4. Câu chuyện */}
      <section id="cauChuyen" className="scroll-mt-20">
        <CauChuyen />
      </section>

      {/* 5. Liên hệ */}
      <section id="lienHe" className="scroll-mt-20">
        <LienHe />
      </section>
    </main>
  );
}
