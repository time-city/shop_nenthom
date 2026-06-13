import Footer from "../components/client/footer";
import Header from "../components/client/header";
import Intro from "../components/ui/intro";
import { redirect } from "next/navigation";
import HomePage from "./(client)/home/page";
import CollectionPage from "./(client)/collection/page";
import CustomPage from "./(client)/custom/page";
import StoryPage from "./(client)/story/page";
import ContactPage from "./(client)/contact/page";
import { getCurrentUser } from "../lib/action/auth.action";
import type { CollectionPageProps } from "../lib/types/client";

export default async function Home({ searchParams }: CollectionPageProps = {}) {
  // action-(check role trang vào web)
  const currentUser = await getCurrentUser();

  if (currentUser?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

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
