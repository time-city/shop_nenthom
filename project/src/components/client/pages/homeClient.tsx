"use client";

import Link from "next/link";
import Image from "next/image";
import heroImage from "@/public/assets/image-Photoroom.png";
import bgImage from "@/public/assets/bg_1.jpg";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import type { MouseEvent } from "react";
import type {
  ClientCategoriesSuccessResponseInterface,
  ClientProductCategoryInterface,
} from "@/src/interface/clientInterface";
import { getCategoriesAction } from "@/src/lib/action/category.action";
import LoadingState from "@/src/components/ui/loadingState";
import { callAction } from "@/src/lib/utils/callAction";

const scentTags = ["Vanilla & Cedar", "Linen & Sage", "Oud & Amber"];
const categoryBgClasses = [
  "bg-[#6B1218]", // Warm Red
  "bg-[#2C1810]", // Deep Wood
  "bg-[#6B4C35]", // Warm Brown
  "bg-[#4A2A22]", // Dark Reddish Brown
  "bg-[#8B262C]", // Lighter Warm Red
];

export default function HomeClient({ initialCategories }: { initialCategories?: any }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const { data: categoriesResult, isLoading: isLoadingCategories } = useSWR(
    'categories',
    async () => {
      console.log("[Data Source] 🟡 NETWORK QUERY - homeClient: Fetching categories from server API...");
      return await callAction(() => getCategoriesAction(), "Không thể tải danh mục. Vui lòng thử lại sau.");
    },
    { fallbackData: initialCategories }
  );

  useEffect(() => {
    if (categoriesResult) {
      console.log(`[Data Source] 🟢 UI UPDATED - homeClient: Displaying categories (from SWR Cache or Network)`);
    }
  }, [categoriesResult]);

  const categories = categoriesResult && 'success' in categoriesResult && categoriesResult.success 
    ? (categoriesResult as ClientCategoriesSuccessResponseInterface).categories 
    : [];

  const categorySlides = useMemo(
    () =>
      categories.map((category, index) => ({
          title: category.name,
          description:
            category.description ||
            "Tinh hoa nến thơm nghệ thuật, chế tác thủ công.",
          buttonLabel: "Xem Danh Mục",
          bgClass: categoryBgClasses[index % categoryBgClasses.length],
          href: "/#collection",
        })),
    [categories],
  );

  // Autoplay category slider: transition every 4 seconds
  useEffect(() => {
    if (categorySlides.length <= 1) return;

    const interval = setInterval(() => {
      setActiveSlide((current) =>
        current === categorySlides.length - 1 ? 0 : current + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [categorySlides.length]);

  const previousSlide = () => {
    if (categorySlides.length === 0) return;

    setActiveSlide((current) =>
      current === 0 ? categorySlides.length - 1 : current - 1,
    );
  };
  const nextSlide = () => {
    if (categorySlides.length === 0) return;

    setActiveSlide((current) =>
      current === categorySlides.length - 1 ? 0 : current + 1,
    );
  };
  const scrollToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();

    const section = document.getElementById(id);
    if (!section) {
      window.location.href = `/#${id}`;
      return;
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
    const searchParams = window.location.search;
    window.history.pushState(null, "", `${window.location.pathname}${searchParams}#${id}`);
  };

  const scrollToCollection = (event: MouseEvent<HTMLAnchorElement>) => {
    scrollToSection(event, "collection");
  };

  return (
    <>
      <div
        className="intro-overlay pointer-events-none fixed inset-0 z-120 hidden items-center justify-center bg-[#2b0508]"
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

      <div 
        className="relative -mt-20 overflow-hidden bg-cover bg-center bg-fixed text-[#F5F0E8]"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(58, 8, 15, 0.75) 0%, rgba(58, 8, 15, 0.85) 55%, rgba(58, 8, 15, 0.95) 100%), url(${bgImage.src})`,
          backgroundBlendMode: "multiply",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,210,170,0.14)_0%,rgba(122,18,24,0.18)_38%,rgba(31,6,8,0.34)_100%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[10%] top-1/2 z-0 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <section
            className="hero fade-section visible observed grid h-screen min-h-[640px] grid-cols-1 items-center justify-center gap-4 overflow-hidden px-4 pb-6 pt-24 lg:grid-cols-2 lg:gap-16 lg:px-16"
          >
          <div className="hero-text flex w-full max-w-[480px] mx-auto flex-col items-center text-center opacity-100 lg:mx-0 lg:block lg:max-w-none lg:text-left">
            <h1 data-aos="fade-right" className="mb-4 break-keep text-center font-serif text-[32px] sm:text-[38px] leading-[1.1] font-light text-[#F5F0E8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] lg:text-left lg:text-[clamp(3rem,5vw,4.5rem)] lg:leading-[1.08] lg:drop-shadow-none">
              Nến thơm
              <br />
              <em className="font-serif italic text-[#F5F0E8]">thuần khiết,</em>
              <br />
              dành riêng
              <br />
              cho bạn
            </h1>
            <p data-aos="fade-right" className="mb-5 mx-auto max-w-[90%] sm:max-w-[80%] text-center text-[15px] sm:text-[17px] leading-[1.5] text-[#F5F0E8] drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] lg:mx-0 lg:max-w-[380px] lg:text-left lg:text-[0.95rem] lg:leading-[1.8] lg:text-[#F5F0E8]/80 lg:drop-shadow-none xl:mb-8">
              Tự tạo nên thơm của riêng mình — chọn hương, màu sáp, kích thước
              và bao bì theo phong cách tối giản độc đáo.
            </p>
            <div className="btn-group flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-6 sm:px-0 lg:justify-start">
              <Link
                href="/#custom"
                onClick={(e) => scrollToSection(e, "custom")}
                className="btn-primary relative w-full sm:w-auto rounded-full border-[1.5px] border-transparent bg-[#F5F0E8] px-5 py-3 text-center text-[0.75rem] sm:text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#2C1810] shadow-[0_10px_28px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#FFFFFF] hover:text-[#2C1810] hover:shadow-[0_0_20px_rgba(245,240,232,0.6)] active:scale-95 md:px-6 md:py-3 lg:w-auto lg:px-9 lg:py-3.5"
              >
                Tùy chỉnh ngay
              </Link>
              <Link
                href="/#collection"
                onClick={(e) => scrollToSection(e, "collection")}
                className="btn-secondary w-full sm:w-auto rounded-full border-[1.5px] border-[#f5f0e8]/45 bg-transparent px-5 py-3 text-center text-[0.75rem] sm:text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] transition-all duration-300 hover:-translate-y-1 hover:border-[#F5F0E8] hover:bg-[#f5f0e8]/15 hover:text-[#F5F0E8] hover:shadow-[0_0_15px_rgba(245,240,232,0.3)] active:scale-95 md:px-6 lg:w-auto lg:px-[34px]"
              >
                Xem bộ sưu tập
              </Link>
            </div>

            {/* Scent tags for mobile ONLY */}
            <div className="scent-tags mt-7 flex flex-wrap justify-center gap-1.5 sm:gap-2 px-2 sm:px-0 lg:hidden">
              {scentTags.map((tag) => (
                <div
                  key={tag}
                  className="tag whitespace-nowrap rounded-[2px] border border-[#D4AF37]/40 bg-[rgba(20,5,5,0.4)] px-2.5 py-1.5 text-[0.65rem] sm:text-[0.7rem] font-light uppercase tracking-widest text-[#F5F0E8] backdrop-blur-md"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          <div className="candle-scene relative hidden h-full w-full items-center justify-center lg:flex">
            
            {/* The Empty Pedestal Focus Area */}
            <div data-aos="zoom-in" data-aos-duration="1500" className="pedestal-focus relative flex h-[350px] w-[350px] items-center justify-center xl:h-[450px] xl:w-[450px]">
              {/* Spotlight / glow */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(248,211,122,0.15)_0%,rgba(212,175,55,0.05)_40%,transparent_70%)] blur-2xl" />
              
              {/* Pedestal Base */}
              <div className="absolute bottom-12 left-1/2 h-10 w-[200px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12)_0%,rgba(248,211,122,0.05)_40%,transparent_70%)] shadow-[0_20px_50px_rgba(0,0,0,0.8)] xl:w-[280px]" />
              
              {/* Subtle light rays */}
              <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_0%,transparent_45%,rgba(248,211,122,0.05)_50%,transparent_55%)] blur-md" />
              
              {/* Hero Image */}
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-15px); }
                }
                .animate-float-custom {
                  animation: float 6s ease-in-out infinite;
                }
              `}} />
              <div className="animate-float-custom absolute bottom-16 z-10 w-[200px] transition-all duration-700 ease-out hover:scale-[1.03] hover:drop-shadow-[0_0_40px_rgba(248,211,122,0.4)] xl:bottom-20 xl:w-[280px]">
                <Image
                  src={heroImage}
                  alt="Nến thơm"
                  className="w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                  priority
                />
              </div>
            </div>

            {/* Scent Tags */}
            <div className="scent-tags relative flex w-full max-w-[300px] flex-wrap justify-center gap-1.5 lg:absolute lg:right-[-20px] lg:top-1/2 lg:-translate-y-1/2 lg:w-auto lg:max-w-none lg:flex-col lg:flex-nowrap lg:gap-8">
              {scentTags.map((tag, index) => (
                <div
                  key={tag}
                  data-aos="fade-left"
                  data-aos-delay={index * 200}
                  className="group relative flex items-center justify-end"
                >
                  {/* Connecting Line */}
                  <div className="absolute right-[calc(100%+10px)] top-1/2 h-[1px] w-16 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-[#D4AF37]/80 transition-all duration-500 group-hover:w-24 group-hover:via-[#F8D37A]/70 group-hover:to-[#F8D37A] group-hover:shadow-[0_0_8px_rgba(248,211,122,0.8)] xl:w-28 xl:group-hover:w-40" />
                  
                  {/* Tag */}
                  <div className="tag relative whitespace-nowrap rounded-[2px] border border-[#D4AF37]/40 bg-[rgba(20,5,5,0.4)] px-4 py-2.5 text-[0.7rem] font-light uppercase tracking-[0.2em] text-[#F5F0E8] backdrop-blur-md transition-all duration-500 group-hover:-translate-x-2 group-hover:border-[#F8D37A] group-hover:bg-[#F8D37A]/20 group-hover:text-[#FFF] group-hover:shadow-[0_0_25px_rgba(248,211,122,0.4)] xl:px-6 xl:py-3 xl:text-xs">
                    {tag}
                  </div>
                </div>
              ))}
            </div>
          </div>
          </section>
          
          {/* category */}
          <div className="banner-slider relative mt-16 w-full max-w-full overflow-hidden rounded-[2px] bg-[#4A0B0E]">
          <div className="slider-container relative flex h-[200px] w-full bg-[#4A0B0E] md:h-[240px] lg:h-[320px]">
            {isLoadingCategories ? (
              <div className="flex size-full items-center justify-center px-6">
                <LoadingState
                  label="Đang tải danh mục..."
                  className="border-[#F5F0E8]/10 bg-[#F5F0E8]/10 text-[#F5F0E8]"
                />
              </div>
            ) : categorySlides.length > 0 ? (
              categorySlides.map((slide, index) => (
                <div
                  key={slide.title}
                  className={`slide absolute left-0 top-0 flex h-full min-w-full items-center justify-center bg-cover bg-center transition-opacity duration-800 ease-in-out ${slide.bgClass} ${activeSlide === index
                    ? "relative opacity-100"
                    : "pointer-events-none opacity-0"
                  }`}
                >
                  <div className="slide-content absolute z-2 flex size-full box-border flex-col items-center justify-center px-6 py-8 text-center md:px-14 lg:flex-row lg:justify-between lg:px-24 lg:text-left">
                    <div className="slide-text mb-8 max-w-full text-[#F5F0E8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] md:mb-0 lg:max-w-[50%]">
                      <h2 className="mb-3 font-serif text-[1.2rem] font-normal leading-tight text-[#F5F0E8] md:text-[1.6rem] lg:text-[2.2rem]">
                        {slide.title}
                      </h2>
                      <p className="mb-5 text-[0.85rem] font-light leading-[1.6] text-[#F5F0E8] md:text-[0.95rem] lg:mb-6">
                        {slide.description}
                      </p>
                      <a
                        href={slide.href}
                        onClick={scrollToCollection}
                        className="slide-btn inline-block rounded-full border-none bg-[#F5F0E8] px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-widest text-[#6B1218] shadow-[0_10px_24px_rgba(107,18,24,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F2E8D9] hover:shadow-[0_14px_32px_rgba(107,18,24,0.4)] md:px-7 md:py-3 md:text-[0.8rem]"
                      >
                        {slide.buttonLabel}
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex size-full items-center justify-center px-6 text-center">
                <p className="text-sm font-light leading-7 text-[#F5F0E8]/75">
                  Chưa có danh mục để hiển thị.
                </p>
              </div>
            )}
          </div>
          {categorySlides.length > 1 ? (
            <>
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
                {categorySlides.map((slide, index) => (
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
            </>
          ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
