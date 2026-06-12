import Image from "next/image";

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

export default function StoryPage() {
  return (
    <section
      id="story"
      className="page-section story-section fade-section bg-[#2C1810] text-[#F5F0E8]"
    >
      <section className="hero-about bg-[#7A1218] px-4 py-20 text-center text-[#F5F0E8] sm:px-6 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-[2.4rem] font-light leading-tight sm:text-[3.2rem]">
            Câu Chuyện Của ChamCham
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-8 text-[#F5F0E8]/75">
            Bắt đầu từ một niềm đam mê tạo tác những vật dụng đẹp bằng tay,
            ChamCham được sinh ra để mang ánh sáng và mùi hương vào từng ngôi
            nhà.
          </p>
        </div>
      </section>

      <section className="about-content mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center lg:px-0 lg:py-20">
        <div className="about-text">
          <h2 className="font-serif text-[2rem] font-light leading-tight text-[#F5F0E8] sm:text-[2.4rem]">
            Tinh Tế Trong Từng Chi Tiết
          </h2>
          <p className="mt-5 text-[0.95rem] leading-8 text-[#F5F0E8]/78">
            Mỗi sản phẩm ChamCham là một tác phẩm nghệ thuật được chế tác bằng
            tay với sự chuyên tâm tuyệt đối. Từ lựa chọn nguyên liệu tự nhiên,
            kết hợp hương thơm tinh tế, cho đến thiết kế bao bì tối giản nhưng
            sang trọng.
          </p>
          <p className="mt-4 text-[0.95rem] leading-8 text-[#F5F0E8]/78">
            Chúng tôi tin rằng, những vật dụng tuyệt vời không chỉ đẹp mắt mà
            còn phải cảm thấy tốt trên tay — từng chi tiết đều được suy tính và
            hoàn thiện tới mức tuyệt vời nhất.
          </p>
        </div>

        <div className="about-image overflow-hidden rounded-2xl shadow-[0_18px_48px_rgba(44,24,16,0.16)]">
          <Image
            src="/story1.jpeg"
            alt="Nến ChamCham cao cấp với hộp gỗ tự nhiên"
            width={960}
            height={1280}
            className="aspect-[3/4] size-full object-cover"
          />
        </div>
      </section>

      <section className="about-content mx-auto grid max-w-6xl gap-8 px-4 pb-14 sm:px-6 md:grid-cols-2 md:items-center lg:px-0 lg:pb-20">
        <div className="about-image order-2 overflow-hidden rounded-2xl shadow-[0_18px_48px_rgba(44,24,16,0.16)] md:order-1">
          <Image
            src="/story2.jpeg"
            alt="Khoảnh khắc bình yên với ánh sáng nến ChamCham"
            width={960}
            height={1280}
            className="aspect-[3/4] size-full object-cover"
          />
        </div>

        <div className="about-text order-1 md:order-2">
          <h2 className="font-serif text-[2rem] font-light leading-tight text-[#F5F0E8] sm:text-[2.4rem]">
            Thắp Sáng Cuộc Sống
          </h2>
          <p className="mt-5 text-[0.95rem] leading-8 text-[#F5F0E8]/78">
            Một ngọn nến không chỉ là ánh sáng — nó là cảm xúc, là khoảnh khắc
            bình yên giữa những ngày bận rộn. Hương thơm tinh tế của ChamCham
            lan toả trong không gian, mang theo câu chuyện về sự chú ý và tình
            yêu.
          </p>
          <p className="mt-4 text-[0.95rem] leading-8 text-[#F5F0E8]/78">
            Mỗi lần thắp nến ChamCham, bạn không chỉ sáng các góc phòng mà còn
            sáng lên tâm hồn — nhắc nhở mình rằng, những điều tốt đẹp giản dị
            nhất lại quý giá nhất.
          </p>
        </div>
      </section>

      <section className="process-section bg-[#7A1218] px-4 py-16 text-[#F5F0E8] sm:px-6 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="section-title text-center font-serif text-[2.2rem] font-light leading-tight sm:text-[2.8rem]">
            Quy Trình Tạo Nến
          </div>
          <div className="section-sub mt-2 text-center text-sm uppercase tracking-[0.18em] text-[#F5F0E8]/55">
            Từ ý tưởng đến thực tế
          </div>

          <div className="process-grid mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="process-card rounded-xl border border-[#F5F0E8]/12 bg-[#8B363A]/70 p-6 shadow-[0_14px_36px_rgba(44,8,12,0.18)]"
              >
                <div className="process-number font-serif text-4xl text-[#F5F0E8]/35">
                  {step.number}
                </div>
                <h3 className="mt-4 font-serif text-2xl font-light">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#F5F0E8]/70">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section bg-[#F2E8D9] px-4 py-16 sm:px-6 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="section-title text-center font-serif text-[2.2rem] font-light leading-tight text-[#6B1218] sm:text-[2.8rem]">
            Tại Sao Chọn ChamCham?
          </div>
          <div className="section-sub mt-2 text-center text-sm uppercase tracking-[0.18em] text-[#2c1810]/45">
            Cam kết chất lượng
          </div>

          <div className="feat-grid mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feat-card rounded-2xl bg-[#F8F0E4] p-7 text-center shadow-[0_12px_34px_rgba(44,24,16,0.08)]"
              >
                <div className="feat-icon text-4xl text-[#7A1218]">
                  {feature.icon}
                </div>
                <h4 className="mt-5 font-serif text-xl font-light text-[#2C1810]">
                  {feature.title}
                </h4>
                <p className="mt-3 text-sm leading-7 text-[#2c1810]/62">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
