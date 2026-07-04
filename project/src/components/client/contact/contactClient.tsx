import ModalContact from "@/src/components/client/contact/modalContact";

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

export default function ContactClient() {
  return (
    <section
      id="contact"
      className="page-section contact-main-section fade-section relative bg-cover bg-center bg-no-repeat px-4 py-6 md:py-8 text-[#F5F0E8] sm:px-6 lg:px-8"
      style={{ backgroundImage: "url('/option_background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <section className="hero-contact relative z-10 px-4 py-6 md:py-8 text-[#F5F0E8] sm:px-6 lg:px-16 mb-4 lg:mb-6">
        <div className="mx-auto max-w-6xl">
          <h1 data-aos="fade-up" className="font-serif text-[2.2rem] sm:text-[2.8rem] font-light leading-tight">
            Liên Hệ ChamCham
          </h1>
          <p data-aos="fade-up" data-aos-delay="150" className="mt-3 max-w-2xl text-[0.9rem] leading-7 text-[#F5F0E8]/75">
            Chúng tôi yêu thích nhận tin từ những người yêu thích nến đẹp. Liên
            hệ ngay để được hỗ trợ hoặc chia sẻ feedback của bạn!
          </p>
        </div>
      </section>
      <section className="contact-section relative z-10 mx-auto grid max-w-5xl gap-8 rounded-md border border-[#F5F0E8]/10 bg-[#F5F0E8]/5 px-5 py-8 sm:px-8 md:grid-cols-2 lg:gap-12 lg:px-10 lg:py-10">
        <div data-aos="fade-right" className="contact-form w-full max-w-[500px] rounded-md border border-white/10 bg-[#3E1C18] p-5 text-[#F5F0E8] shadow-[0_16px_32px_rgba(0,0,0,0.16)] sm:p-7">
          <h2 className="font-serif text-[1.75rem] font-light leading-tight text-[#F5F0E8]">
            Gửi Lời Nhắn
          </h2>

          <ModalContact />
        </div>

        <div data-aos="fade-left" className="contact-info pt-6 text-[#F5F0E8] md:pt-4 lg:pl-6">
          <h2 className="font-serif text-[1.75rem] font-light leading-tight text-[#F5F0E8]">
            Thông Tin Liên Hệ
          </h2>

          <div className="mt-6 space-y-6">
            {contactItems.map((item, index) => (
              <div
                key={item.label}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="info-item"
              >
                <div className="info-label text-[0.7rem] uppercase tracking-[0.1em] text-[#F5F0E8]/55">
                  {item.label}
                </div>
                <div className="info-text mt-1 font-serif text-[1.05rem] font-light leading-tight text-[#F5F0E8]">
                  {item.text}
                </div>
                <div className="info-desc mt-1 text-[0.82rem] leading-5 text-[#F5F0E8]/65">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <div className="social-links mt-6 flex flex-wrap gap-4 border-t border-[#F5F0E8]/12 pt-5">
            {socialLinks.map((item) => (
              <a
                key={item}
                href={`https://www.google.com/search?q=ChamCham+${item.toLowerCase()}`}
                target="_blank"
                rel="noreferrer"
                className="text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70 transition hover:text-[#F5F0E8]"
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
