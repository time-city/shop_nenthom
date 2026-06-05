export default function TuyChinh() {
  return (
    <section
      className="scroll-mt-20 bg-[#6B1218] px-6 py-24 text-[#F8F0E4] md:px-16 lg:px-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#F8F0E4]/70">
            Tùy chỉnh
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Tạo hũ nến mang dấu ấn riêng
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {["Chọn hương", "Chọn màu sáp", "Chọn kích thước", "Chọn bao bì"].map(
            (item) => (
              <div
                key={item}
                className="border border-[#f5f0e8]/15 bg-[#f5f0e8]/10 p-6"
              >
                <h3 className="font-semibold">{item}</h3>
                <p className="mt-3 text-sm leading-6 text-[#F8F0E4]/75">
                  Cá nhân hóa từng chi tiết theo phong cách và không gian của
                  bạn.
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
