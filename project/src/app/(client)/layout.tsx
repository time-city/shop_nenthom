import Footer from "@/src/components/client/layout/footer";
import Header from "@/src/components/client/layout/header";
import Intro from "../../components/ui/intro";
import AosProvider from "../../components/ui/aos-provider";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AosProvider />
      <Intro />
      <Header />
      <div className="flex flex-1 flex-col pt-20">{children}</div>
      <Footer />
    </>
  );
}
