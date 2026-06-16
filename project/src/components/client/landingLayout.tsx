import Footer from "./footer";
import Header from "./header";
import Intro from "../ui/intro";
import HomePage from "@/src/app/(client)/home/page";
import CollectionPage from "@/src/app/(client)/collection/page";
import CustomPage from "@/src/app/(client)/custom/page";
import StoryPage from "@/src/app/(client)/story/page";
import ContactPage from "@/src/app/(client)/contact/page";
import type { CollectionPageProps } from "@/src/lib/types/client";

interface LandingLayoutProps {
  searchParams?: CollectionPageProps["searchParams"];
}

export default function LandingLayout({ searchParams }: LandingLayoutProps) {
  return (
    <>
      <Intro />
      <Header />
      <div className="flex flex-1 flex-col pt-20">
        <main className="flex flex-1 flex-col bg-[#F8F0E4]">
          {/* 1. Trang chủ (Hero + Banner) */}
          <section id="home" className="scroll-mt-20">
            <HomePage />
          </section>

          {/* 2. Bộ sưu tập */}
          <section id="collection" className="scroll-mt-20">
            <CollectionPage searchParams={searchParams} />
          </section>

          {/* 3. Tùy chỉnh */}
          <section id="custom" className="scroll-mt-20">
            <CustomPage />
          </section>

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
