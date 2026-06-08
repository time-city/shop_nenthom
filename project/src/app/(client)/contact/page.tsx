const contactItems = [
  {
    label: "EMAIL",
    text: "hello@lumiere.vn",
    desc: "Chúng tôi sẽ trả lời trong 24 giờ",
  },
  {
    label: "ĐIỆN THOẠI",
    text: "+84 (0) 123 456 789",
    desc: "Thứ 2 - Thứ 6, 9:00 - 18:00 (Giờ Hà Nội)",
  },
  {
    label: "ĐỊA CHỈ STUDIO",
    text: "Hà Nội, Việt Nam",
    desc: "Chúng tôi làm việc theo lịch hẹn",
  },
];

const socialLinks = ["INSTAGRAM", "SHOPEE", "TIKTOK"];

export default function LienHe() {
  return (
    <section
      id="contact"
      className="page-section contact-main-section fade-section bg-[#6B1218] text-[#F5F0E8]"
    >
      <section className="hero-contact bg-[#7A1218] px-4 py-20 text-center text-[#F5F0E8] sm:px-6 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-[2.4rem] font-light leading-tight sm:text-[3.2rem]">
            Liên Hệ ChamCham
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-8 text-[#F5F0E8]/75">
            Chúng tôi yêu thích nhận tin từ những người yêu thích nến đẹp. Liên
            hệ ngay để được hỗ trợ hoặc chia sẻ feedback của bạn!
          </p>
        </div>
      </section>

      <section className="contact-section mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-[1.15fr_0.85fr] lg:px-0 lg:py-20">
        <div className="contact-form rounded-2xl bg-[#F5F0E8] p-6 shadow-[0_14px_38px_rgba(44,24,16,0.08)] sm:p-8 lg:p-10">
          <h2 className="font-serif text-[2rem] font-light leading-tight text-[#6B1218] sm:text-[2.4rem]">
            Gửi Lời Nhắn
          </h2>

          <form id="contactForm" className="mt-8 space-y-5">
            <div className="form-group">
              <label className="mb-2 block text-[0.72rem] uppercase tracking-[0.14em] text-[#6B4C35]">
                Tên của bạn
              </label>
              <input
                type="text"
                placeholder="Nhập tên"
                required
                className="w-full rounded-md border border-[#2c1810]/15 bg-[#F8F0E4] px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#2c1810]/38 focus:border-[#7A1218] focus:ring-4 focus:ring-[#6B1218]/10"
              />
            </div>

            <div className="form-group">
              <label className="mb-2 block text-[0.72rem] uppercase tracking-[0.14em] text-[#6B4C35]">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                required
                className="w-full rounded-md border border-[#2c1810]/15 bg-[#F8F0E4] px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#2c1810]/38 focus:border-[#7A1218] focus:ring-4 focus:ring-[#6B1218]/10"
              />
            </div>

            <div className="form-group">
              <label className="mb-2 block text-[0.72rem] uppercase tracking-[0.14em] text-[#6B4C35]">
                Chủ đề
              </label>
              <input
                type="text"
                placeholder="Chủ đề của bạn"
                required
                className="w-full rounded-md border border-[#2c1810]/15 bg-[#F8F0E4] px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#2c1810]/38 focus:border-[#7A1218] focus:ring-4 focus:ring-[#6B1218]/10"
              />
            </div>

            <div className="form-group">
              <label className="mb-2 block text-[0.72rem] uppercase tracking-[0.14em] text-[#6B4C35]">
                Tin nhắn
              </label>
              <textarea
                placeholder="Nội dung tin nhắn..."
                required
                rows={6}
                className="min-h-36 w-full resize-y rounded-md border border-[#2c1810]/15 bg-[#F8F0E4] px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#2c1810]/38 focus:border-[#7A1218] focus:ring-4 focus:ring-[#6B1218]/10"
              />
            </div>

            <button
              type="submit"
              className="submit-btn w-full rounded-full bg-[#7A1218] px-6 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] transition hover:-translate-y-0.5 hover:bg-[#6B1218] sm:w-auto sm:px-10"
            >
              Gửi Tin Nhắn
            </button>
          </form>
        </div>

        <div className="contact-info rounded-2xl bg-[#7A1218] p-6 text-[#F5F0E8] shadow-[0_18px_48px_rgba(44,8,12,0.16)] sm:p-8 lg:p-10">
          <h2 className="font-serif text-[2rem] font-light leading-tight sm:text-[2.4rem]">
            Thông Tin Liên Hệ
          </h2>

          <div className="mt-8 space-y-7">
            {contactItems.map((item) => (
              <div
                key={item.label}
                className="info-item border-b border-[#F5F0E8]/12 pb-6 last:border-b-0 last:pb-0"
              >
                <div className="info-label text-[0.68rem] uppercase tracking-[0.16em] text-[#F5F0E8]/55">
                  {item.label}
                </div>
                <div className="info-text mt-2 font-serif text-[1.45rem] font-light leading-tight">
                  {item.text}
                </div>
                <div className="info-desc mt-2 text-sm leading-6 text-[#F5F0E8]/65">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="social-links mt-9 flex flex-wrap gap-3">
            {socialLinks.map((item) => (
              <a
                key={item}
                href={`https://www.google.com/search?q=ChamCham+${item.toLowerCase()}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#F5F0E8]/25 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] transition hover:bg-[#F5F0E8] hover:text-[#7A1218]"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
