import Image from "next/image";
import TiltWrapper from "@/src/components/ui/tiltWrapper";

const processSteps = [
  {
    number: "01",
    title: "Lựa Chọn",
    text: "Bạn chọn hương, màu sắc, kích thước và bao bì theo sở thích cá nhân của mình.",
  },
  {
    number: "02",
    title: "Chuẩn Bị",
    text: "Chúng tôi chuẩn bị nguyên liệu tối ưu, pha trộn tinh dầu với độ chính xác cao.",
  },
  {
    number: "03",
    title: "Đổ Tay",
    text: "Sáp được đổ vào từng hộp bằng tay, theo truyền thống thủ công lâu đời.",
  },
  {
    number: "04",
    title: "Làm Lạnh",
    text: "Nến được để yên trong 24 giờ để đạt độ cứng hoàn hảo.",
  },
  {
    number: "05",
    title: "Kiểm Tra",
    text: "Mỗi nến được kiểm tra kỹ lưỡng trước khi đóng gói.",
  },
  {
    number: "06",
    title: "Gửi Đến Bạn",
    text: "Nến được đóng gói cẩn thận và gửi đến tay bạn, sẵn sàng tặng hay dùng.",
  },
];

const features = [
  {
    icon: "◎",
    title: "Sáp Đậu Nành Tự Nhiên",
    text: "100% sáp đậu nành có nguồn gốc từ nông trại bền vững, không chứa chất độc hại.",
  },
  {
    icon: "◈",
    title: "Tinh Dầu Thật",
    text: "Chỉ sử dụng tinh dầu nguyên chất từ thực vật, không có hương liệu tổng hợp.",
  },
  {
    icon: "◇",
    title: "Làm Bằng Tay",
    text: "Mỗi nến được đổ tay bởi các nghệ nhân tài năng với nhiều năm kinh nghiệm.",
  },
];

export default function StoryClient() {
  return (
    <section
      id="story"
      className="page-section story-section fade-section relative bg-cover bg-center bg-no-repeat text-[#F5F0E8]"
      style={{ backgroundImage: "url('/wood_bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <section className="hero-about relative z-10 px-4 py-16 text-[#F5F0E8] sm:px-6 lg:px-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 data-aos="fade-up" className="font-serif text-[2.4rem] sm:text-[3.2rem] font-light leading-tight">
            Câu Chuyện Của ChamCham
          </h1>
          <p data-aos="fade-up" data-aos-delay="150" className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-8 text-[#F5F0E8]/75 text-justify sm:text-center">
            Bắt đầu từ một niềm đam mê tạo tác những vật dụng đẹp bằng tay,
            ChamCham được sinh ra để mang ánh sáng và mùi hương vào từng ngôi
            nhà.
          </p>
        </div>
      </section>

      <section className="about-content relative z-10 mx-auto grid max-w-5xl gap-10 px-4 py-6 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center lg:px-0 lg:py-10">
        <div className="about-text mx-auto max-w-lg text-justify md:text-left">
          <h2 data-aos="fade-right" className="font-serif text-[1.8rem] font-light leading-tight text-[#F5F0E8] sm:text-[2.2rem] text-center md:text-left">
            Tinh Tế Trong Từng Chi Tiết
          </h2>
          <p data-aos="fade-right" data-aos-delay="100" className="mt-4 text-[0.95rem] leading-7 text-[#F5F0E8]/78">
            Mỗi sản phẩm ChamCham là một tác phẩm nghệ thuật được chế tác bằng
            tay với sự chuyên tâm tuyệt đối. Từ lựa chọn nguyên liệu tự nhiên,
            kết hợp hương thơm tinh tế, cho đến thiết kế bao bì tối giản nhưng
            sang trọng.
          </p>
          <p data-aos="fade-right" data-aos-delay="200" className="mt-4 text-[0.95rem] leading-7 text-[#F5F0E8]/78">
            Chúng tôi tin rằng, những vật dụng tuyệt vời không chỉ đẹp mắt mà
            còn phải cảm thấy tốt trên tay — từng chi tiết đều được suy tính và
            hoàn thiện tới mức tuyệt vời nhất.
          </p>
        </div>

        <TiltWrapper scale={0.98} maxRotation={5} className="w-full">
          <div data-aos="zoom-in" className="about-image overflow-hidden rounded-xl shadow-[0_18px_48px_rgba(0,0,0,0.3)]">
            <Image
              src="/story1.jpeg"
              alt="Nến ChamCham cao cấp với hộp gỗ tự nhiên"
              width={960}
              height={960}
              className="aspect-square sm:aspect-[4/3] md:aspect-square lg:aspect-[4/3] size-full object-cover"
            />
          </div>
        </TiltWrapper>
      </section>

      <section className="about-content relative z-10 mx-auto grid max-w-5xl gap-10 px-4 pb-12 pt-6 sm:px-6 md:grid-cols-[1.1fr_1fr] md:items-center lg:px-0 lg:pb-16 lg:pt-8">
        <TiltWrapper scale={0.98} maxRotation={5} className="w-full order-2 md:order-1">
          <div data-aos="zoom-in" className="about-image overflow-hidden rounded-xl shadow-[0_18px_48px_rgba(0,0,0,0.3)]">
            <Image
              src="/story2.jpeg"
              alt="Khoảnh khắc bình yên với ánh sáng nến ChamCham"
              width={960}
              height={960}
              className="aspect-square sm:aspect-[4/3] md:aspect-square lg:aspect-[4/3] size-full object-cover"
            />
          </div>
        </TiltWrapper>

        <div className="about-text order-1 mx-auto max-w-lg text-justify md:order-2 md:text-left">
          <h2 data-aos="fade-left" className="font-serif text-[1.8rem] font-light leading-tight text-[#F5F0E8] sm:text-[2.2rem] text-center md:text-left">
            Thắp Sáng Cuộc Sống
          </h2>
          <p data-aos="fade-left" data-aos-delay="100" className="mt-4 text-[0.95rem] leading-7 text-[#F5F0E8]/78">
            Một ngọn nến không chỉ là ánh sáng — nó là cảm xúc, là khoảnh khắc
            bình yên giữa những ngày bận rộn. Hương thơm tinh tế của ChamCham
            lan toả trong không gian, mang theo câu chuyện về sự chú ý và tình
            yêu.
          </p>
          <p data-aos="fade-left" data-aos-delay="200" className="mt-4 text-[0.95rem] leading-7 text-[#F5F0E8]/78">
            Mỗi lần thắp nến ChamCham, bạn không chỉ sáng các góc phòng mà còn
            sáng lên tâm hồn — nhắc nhở mình rằng, những điều tốt đẹp giản dị
            nhất lại quý giá nhất.
          </p>
        </div>
      </section>

      <section className="process-section relative px-4 py-6 text-[#F5F0E8] sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/option_background.jpg')" }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-4 py-10 sm:px-6 lg:px-12 rounded-xl">
          <div className="mx-auto max-w-[1100px]">
            <div data-aos="fade-up" className="section-title font-serif text-[1.8rem] font-light leading-[1.15] text-[#F5F0E8] sm:text-[2.2rem] text-center">
              Quy Trình Tạo Nẽn
            </div>
            <div data-aos="fade-up" data-aos-delay="100" className="section-sub mt-2 text-[0.72rem] uppercase tracking-[0.28em] text-[#F5F0E8]/60 text-center">
              Từ ý tưởng đến thực tế
            </div>

            <div className="process-grid mt-10 grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-3">
              {processSteps.map((step, index) => (
                <TiltWrapper key={step.number} scale={0.94} maxRotation={15}>
                  <div
                    data-aos="zoom-in"
                    data-aos-delay={index * 100}
                    className="process-card flex h-full flex-col rounded-xl bg-white/10 p-6 border border-white/20 shadow-lg backdrop-blur-sm transition-colors hover:bg-white/15"
                  >
                    <div className="process-number font-serif text-[2.2rem] font-bold leading-none text-[#F5F0E8] opacity-80">
                      {step.number}
                    </div>
                    <h3 className="mt-4 font-serif text-[1.15rem] font-medium leading-tight text-[#F5F0E8]">
                      {step.title}
                    </h3>
                    <p className="mx-auto mt-3 max-w-[280px] text-[0.88rem] font-light leading-6 text-[#F5F0E8]/75">
                      {step.text}
                    </p>
                  </div>
                </TiltWrapper>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section relative px-4 pb-16 pt-6 text-[#F5F0E8] sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/option_background.jpg')" }}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-4 py-10 sm:px-6 lg:px-12 rounded-xl">
          <div className="mx-auto max-w-[1100px]">
            <div data-aos="fade-up" className="section-title font-serif text-[1.8rem] font-light leading-[1.15] text-[#F5F0E8] sm:text-[2.2rem] text-center">
              Tại Sao Chọn ChamCham?
            </div>
            <div data-aos="fade-up" data-aos-delay="100" className="section-sub mt-2 text-[0.72rem] uppercase tracking-[0.28em] text-[#F5F0E8]/60 text-center">
              Cam kết chất lượng
            </div>

            <div className="feat-grid mt-10 grid gap-6 md:grid-cols-3">
              {features.map((feature, index) => (
                <TiltWrapper key={feature.title} scale={0.94} maxRotation={15}>
                  <div
                    data-aos="flip-up"
                    data-aos-delay={index * 100}
                    className="feat-card flex h-full flex-col rounded-xl bg-white/10 border border-white/20 p-8 text-center shadow-xl backdrop-blur-sm transition-colors hover:bg-white/15"
                  >
                    <div className="feat-icon text-[2.2rem] leading-none text-[#F5F0E8] opacity-90">
                      {feature.icon}
                    </div>
                    <h4 className="mt-4 font-serif text-[1.2rem] font-medium text-[#F5F0E8]">
                      {feature.title}
                    </h4>
                    <p className="mx-auto mt-3 max-w-[260px] text-[0.92rem] font-light leading-7 text-[#F5F0E8]/75">
                      {feature.text}
                    </p>
                  </div>
                </TiltWrapper>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
