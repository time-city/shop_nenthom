"use client";

import Link from "next/link";
import { useState } from "react";

const scentTags = ["Vanilla & Cedar", "Linen & Sage", "Oud & Amber"];
const bannerSlides = [
  {
    title: "Nến Tùy Chỉnh Premium",
    description:
      "Tạo nên thơm của riêng mình với những mùi hương độc đáo và màu sắc tinh tế.",
    buttonLabel: "Khám Phá",
    bgClass: "bg-[#8B7355]",
    href: "/#tuyChinh",
  },
  {
    title: "Sáp Đậu Nành Tự Nhiên",
    description:
      "Được làm từ nguyên liệu tự nhiên 100%, an toàn cho gia đình bạn.",
    buttonLabel: "Tìm Hiểu Thêm",
    bgClass: "bg-[#D4C5B0]",
    href: "/#boSuuTap",
  },
  {
    title: "Quà Tặng Hoàn Hảo",
    description:
      "Mỗi nến ChamCham là một tác phẩm độc lập, hoàn hảo để tặng người thân.",
    buttonLabel: "Mua Ngay",
    bgClass: "bg-[#C9D4C5]",
    href: "/#boSuuTap",
  },
];

export default function TrangChu() {
  const [activeSlide, setActiveSlide] = useState(0);
  const previousSlide = () => {
    setActiveSlide((current) =>
      current === 0 ? bannerSlides.length - 1 : current - 1,
    );
  };
  const nextSlide = () => {
    setActiveSlide((current) =>
      current === bannerSlides.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <>
      <div
        className="intro-overlay pointer-events-none fixed inset-0 z-[120] hidden items-center justify-center bg-[#2b0508]"
        aria-hidden="true"
      >
        <div className="intro-core relative flex flex-col items-center">
          <div className="intro-flame-wrap relative mb-8 flex h-24 w-24 items-center justify-center">
            <div className="intro-glow absolute size-24 rounded-full bg-[#f8d37a]/30 blur-2xl" />
            <div className="intro-flame relative z-10 h-14 w-8 rounded-t-full rounded-bl-full bg-[#f8d37a] shadow-[0_0_40px_rgba(248,211,122,0.7)]" />
            <div className="intro-wick absolute bottom-4 z-20 h-8 w-1 rounded-full bg-[#2c1810]" />
          </div>

          <div className="intro-candle-scene relative flex h-64 w-80 items-end justify-center">
            <div className="intro-garden absolute inset-x-0 bottom-0 h-36">
              <span className="garden-candle garden-candle-left-far absolute bottom-4 left-4 h-20 w-8 rounded-t-full bg-[#f8f0e4]/80" />
              <span className="garden-candle garden-candle-left-near absolute bottom-0 left-16 h-28 w-10 rounded-t-full bg-[#f8f0e4]" />
              <span className="garden-candle garden-candle-center-back absolute bottom-8 left-1/2 h-24 w-8 -translate-x-1/2 rounded-t-full bg-[#f8f0e4]/75" />
              <span className="garden-candle garden-candle-center-front absolute bottom-0 left-1/2 h-32 w-12 -translate-x-1/2 rounded-t-full bg-[#fff7ea]" />
              <span className="garden-candle garden-candle-right-near absolute bottom-2 right-16 h-28 w-10 rounded-t-full bg-[#f8f0e4]" />
              <span className="garden-candle garden-candle-right-far absolute bottom-5 right-4 h-20 w-8 rounded-t-full bg-[#f8f0e4]/80" />
              <span className="garden-candle garden-candle-back-top absolute bottom-24 left-1/2 h-16 w-7 translate-x-16 rounded-t-full bg-[#f8f0e4]/60" />
            </div>

            <div className="intro-candle-jar relative z-10 flex h-40 w-32 items-center justify-center rounded-b-3xl border border-[#f5f0e8]/25 bg-[#f5f0e8]/10 backdrop-blur">
              <div className="intro-candle-light absolute top-7 size-20 rounded-full bg-[#f8d37a]/30 blur-xl" />
              <div className="intro-candle-lip absolute top-0 h-8 w-36 rounded-full border border-[#f5f0e8]/35 bg-[#f5f0e8]/15" />
              <div className="intro-candle-body h-28 w-24 rounded-b-2xl rounded-t-md bg-[#f8f0e4]/90" />
            </div>
          </div>
        </div>
      </div>

      <div id="trangChu" className="bg-[#7A1218] text-[#F5F0E8] scroll-mt-20">
        <section
          id="home"
          className="hero fade-section visible observed grid h-[calc(100vh-5rem)] min-h-[560px] grid-cols-1 items-center gap-4 overflow-hidden bg-[#7A1218] px-6 py-6 md:grid-cols-2 md:gap-8 md:px-8 lg:gap-16 lg:px-16"
        >
          <div className="hero-text flex w-full max-w-[480px] flex-col items-center text-center opacity-100 md:block md:max-w-none md:text-left">
            <h1 className="mb-4 break-keep text-center font-serif text-[clamp(1.9rem,7vw,2.35rem)] font-light leading-[1.14] text-[#F5F0E8] md:text-left md:text-[clamp(3rem,5vw,4.5rem)] md:leading-[1.08]">
              Nến thơm
              <br />
              <em className="font-serif italic text-[#F5F0E8]">thuần khiết,</em>
              <br />
              dành riêng
              <br />
              cho bạn
            </h1>
            <p className="mb-5 max-w-[420px] text-center text-[0.85rem] leading-[1.6] text-[#F5F0E8]/80 md:max-w-[380px] md:text-left md:text-[0.95rem] md:leading-[1.8] lg:mb-8">
              Tự tạo nên thơm của riêng mình — chọn hương, màu sáp, kích thước
              và bao bì theo phong cách tối giản độc đáo.
            </p>
            <div className="btn-group flex w-full flex-col items-center justify-center gap-2.5 md:w-auto md:flex-row md:flex-wrap md:justify-start lg:gap-4">
              <Link
                href="/#tuyChinh"
                className="btn-primary w-full max-w-[260px] rounded-full border-[1.5px] border-transparent bg-[#F5F0E8] px-6 py-3 text-center text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#2C1810] shadow-[0_10px_28px_rgba(0,0,0,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F2E8D9] hover:text-[#2C1810] hover:shadow-[0_14px_36px_rgba(0,0,0,0.22)] lg:w-auto lg:px-9 lg:py-3.5"
              >
                Tùy chỉnh ngay
              </Link>
              <Link
                href="/#boSuuTap"
                className="btn-secondary w-full max-w-[260px] rounded-full border-[1.5px] border-[#f5f0e8]/45 bg-transparent px-6 py-3 text-center text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f5f0e8]/10 hover:text-[#F5F0E8] lg:w-auto lg:px-[34px]"
              >
                Xem bộ sưu tập
              </Link>
            </div>
          </div>

          <div className="candle-scene relative flex w-full flex-col items-center justify-center gap-4 opacity-100 md:flex-row md:gap-0">
            <div className="candle-3d relative h-[170px] w-[110px] [animation:candle-float_4s_ease-in-out_infinite] [transform-style:preserve-3d] sm:h-[200px] sm:w-[130px] md:h-[240px] md:w-[150px] lg:h-[280px] lg:w-[180px]">
              <div className="glow absolute left-[calc(50%+3px)] top-[-80px] h-20 w-20 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,180,50,0.3)_0%,transparent_70%)] [animation:candle-glow-pulse_1.5s_ease-in-out_infinite] md:left-[calc(50%+4px)] lg:left-[calc(50%+5px)]" />
              <div className="flame absolute left-[calc(50%+3px)] top-[-70px] h-[35px] w-4 -translate-x-1/2 [animation:candle-flicker_1.2s_ease-in-out_infinite] md:left-[calc(50%+4px)] lg:left-[calc(50%+5px)]">
                <div className="flame-outer absolute left-1/2 top-0 h-[35px] w-4 -translate-x-1/2 rounded-[50%_50%_30%_30%] bg-[radial-gradient(ellipse_at_50%_70%,rgba(255,200,50,0.3)_0%,rgba(255,120,0,0.15)_50%,transparent_80%)]" />
                <div className="flame-inner relative top-[7px] mx-auto h-7 w-2.5 rounded-[50%_50%_30%_30%] bg-[radial-gradient(ellipse_at_50%_80%,#fff_0%,#FFE566_30%,#FF9A00_65%,transparent_100%)]" />
              </div>
              <div className="wick absolute left-1/2 top-[-30px] h-[22px] w-0.5 -translate-x-1/2 rounded-[1px] bg-[#2C1810]" />
              <div className="candle-body relative h-full w-full rounded-[8px_8px_4px_4px] bg-[linear-gradient(105deg,#f2e8d9_0%,#f5f0e8_35%,#e7d7bf_60%,#c7b08f_100%)] shadow-[inset_-20px_0_40px_rgba(0,0,0,0.12),inset_8px_0_20px_rgba(255,255,255,0.4),0_20px_60px_rgba(0,0,0,0.15)]">
                <div className="candle-top absolute -top-2.5 left-0 right-0 h-5 rounded-[50%] bg-[linear-gradient(to_bottom,#e2d0b8,#c7b08f)] shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)]" />
              </div>
              <div className="shadow-ground absolute bottom-[-20px] left-1/2 h-5 w-[120px] -translate-x-1/2 bg-[radial-gradient(ellipse,rgba(0,0,0,0.15)_0%,transparent_70%)] [animation:candle-shadow-float_4s_ease-in-out_infinite]" />
            </div>

            <div className="scent-tags relative flex w-full max-w-[300px] flex-wrap justify-center gap-1.5 md:absolute md:right-[-30px] md:top-[50px] md:w-auto md:max-w-none md:flex-col md:flex-nowrap lg:right-[-80px] lg:gap-2.5">
              {scentTags.map((tag) => (
                <div
                  key={tag}
                  className="tag whitespace-nowrap rounded-[20px] border-[1.5px] border-[#f5f0e8]/50 bg-[#f5f0e8]/35 px-2.5 py-1 text-[0.65rem] font-normal tracking-[0.1em] text-[#F5F0E8] backdrop-blur md:px-2.5 md:py-1 md:text-[0.65rem] lg:px-4 lg:py-1.5 lg:text-xs"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="banner-slider relative my-16 w-full max-w-full overflow-hidden rounded-[2px] bg-[#6B1218]">
          <div className="slider-container relative flex h-[200px] w-full bg-[#6B1218] md:h-[240px] lg:h-[320px]">
            {bannerSlides.map((slide, index) => (
              <div
                key={slide.title}
                className={`slide absolute left-0 top-0 flex h-full min-w-full items-center justify-center bg-cover bg-center transition-opacity duration-[800ms] ease-in-out ${slide.bgClass} ${activeSlide === index
                    ? "relative opacity-100"
                    : "pointer-events-none opacity-0"
                  }`}
              >
                <div className="slide-content absolute z-[2] flex size-full box-border flex-col items-center justify-center px-6 py-8 text-center md:px-14 lg:flex-row lg:justify-between lg:px-24 lg:text-left">
                  <div className="slide-text mb-8 max-w-full text-[#F5F0E8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] md:mb-0 lg:max-w-[50%]">
                    <h2 className="mb-3 font-serif text-[1.2rem] font-normal leading-tight text-[#F5F0E8] md:text-[1.6rem] lg:text-[2.2rem]">
                      {slide.title}
                    </h2>
                    <p className="mb-5 text-[0.85rem] font-light leading-[1.6] text-[#F5F0E8] md:text-[0.95rem] lg:mb-6">
                      {slide.description}
                    </p>
                    <Link
                      href={slide.href}
                      className="slide-btn inline-block rounded-full border-none bg-[#F5F0E8] px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-[#6B1218] shadow-[0_10px_24px_rgba(107,18,24,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F2E8D9] hover:shadow-[0_14px_32px_rgba(107,18,24,0.4)] md:px-7 md:py-3 md:text-[0.8rem]"
                    >
                      {slide.buttonLabel}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="slider-nav slider-prev absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[2px] border-none bg-[#f5f0e8]/10 text-[1.2rem] text-[#F5F0E8] transition-all duration-300 hover:bg-[#f5f0e8]/25 md:left-6 md:size-[50px] md:text-2xl"
            aria-label="Banner trước"
            onClick={previousSlide}
          >
            &#10094;
          </button>
          <button
            type="button"
            className="slider-nav slider-next absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[2px] border-none bg-[#f5f0e8]/10 text-[1.2rem] text-[#F5F0E8] transition-all duration-300 hover:bg-[#f5f0e8]/25 md:right-6 md:size-[50px] md:text-2xl"
            aria-label="Banner sau"
            onClick={nextSlide}
          >
            &#10095;
          </button>
          <div className="dots absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-3 md:bottom-6">
            {bannerSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Chuyển đến banner ${index + 1}`}
                className={`dot h-2.5 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 hover:bg-[#f5f0e8]/70 ${activeSlide === index
                    ? "w-7 bg-[#F5F0E8]"
                    : "w-2.5 bg-[#f5f0e8]/35"
                  }`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
