import Footer from "@/src/components/client/layout/footer";
import Header from "@/src/components/client/layout/header";
import Intro from "../../ui/intro";
import HomePage from "@/src/app/(client)/home/section";
import CollectionPage from "@/src/app/(client)/collection/section";
import CustomPage from "@/src/app/(client)/custom/section";
import StoryPage from "@/src/app/(client)/story/section";
import ContactPage from "@/src/app/(client)/contact/section";
import type { CollectionPageProps } from "@/src/lib/types/client";
import mainBgImage from "@/public/assets/bg_1.jpg";

import AosProvider from "../../ui/aosProvider";

interface LandingLayoutProps {
  searchParams?: CollectionPageProps["searchParams"];
  initialCategories?: any;
}

export default function LandingLayout({ searchParams, initialCategories }: LandingLayoutProps) {
  return (
    <>
      <AosProvider />
      <Intro />
      <Header />
      <div className="flex flex-1 flex-col pt-20">
        <main className="flex flex-1 flex-col bg-[#F8F0E4]">
          {/* 1. Trang chủ (Hero + Banner) */}
          <section id="home" className="scroll-mt-20">
            <HomePage initialCategories={initialCategories} />
          </section>

          <div
            className="w-full relative"
            style={{
              backgroundImage: `url(${mainBgImage.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed"
            }}
          >
            {/* Lớp phủ tối mờ giúp nổi bật chữ và UI */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
            {/* 2. Tùy chỉnh */}
            <section id="custom" className="scroll-mt-20 relative z-10">
              <CustomPage />
            </section>

            {/* 3. Bộ sưu tập */}
            <section id="collection" className="scroll-mt-20 relative z-10">
              <CollectionPage searchParams={searchParams} />
            </section>
          </div>

          {/* 4. Câu chuyện */}
          <section id="story" className="scroll-mt-20">
            <StoryPage />
          </section>

          {/* 5. Liên hệ */}
          <section id="contact" className="scroll-mt-20">
            <ContactPage />
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
