import ModalContact from "../../../components/client/modalContact";


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

export default function ContactPage() {
  return (
    <section
      id="contact"
      className="page-section contact-main-section fade-section bg-[#6B1218] px-4 py-12 text-[#F5F0E8] sm:px-6 lg:px-8"
    >
      <section className="hero-contact bg-[#6B1218] px-4 py-20 text-[#F5F0E8] sm:px-6 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-serif text-[2.4rem] font-light leading-tight sm:text-[3.2rem]">
            Liên Hệ ChamCham
          </h1>
          <p className="mt-5 max-w-2xl text-[0.95rem] leading-8 text-[#F5F0E8]/75">
            Chúng tôi yêu thích nhận tin từ những người yêu thích nến đẹp. Liên
            hệ ngay để được hỗ trợ hoặc chia sẻ feedback của bạn!
          </p>
        </div>
      </section>
      <section className="contact-section mx-auto grid max-w-5xl gap-12 rounded-[16px] border border-[#F5F0E8]/10 bg-[#F5F0E8]/5 px-6 py-12 sm:px-10 md:grid-cols-2 lg:gap-16 lg:px-12 lg:py-16">
        <div className="contact-form w-full max-w-[500px] rounded-[10px] bg-[#F5F0E8] p-7 text-[#2C1810] shadow-[0_16px_32px_rgba(0,0,0,0.16)] sm:p-10">
          <h2 className="font-serif text-[2rem] font-light leading-tight text-[#2C1810]">
            Gửi Lời Nhắn
          </h2>


          <ModalContact />
        </div>


        <div className="contact-info pt-8 text-[#F5F0E8] md:pt-7 lg:pl-8">
          <h2 className="font-serif text-[2rem] font-light leading-tight text-[#F5F0E8]">
            Thông Tin Liên Hệ
          </h2>


          <div className="mt-9 space-y-9">
            {contactItems.map((item) => (
              <div
                key={item.label}
                className="info-item"
              >
                <div className="info-label text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/55">
                  {item.label}
                </div>
                <div className="info-text mt-2 font-serif text-[1.1rem] font-light leading-tight text-[#F5F0E8]">
                  {item.text}
                </div>
                <div className="info-desc mt-2 text-[0.88rem] leading-6 text-[#F5F0E8]/65">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>


          <div className="social-links mt-9 flex flex-wrap gap-6 border-t border-[#F5F0E8]/12 pt-7">
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

