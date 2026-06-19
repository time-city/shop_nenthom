import Footer from "../../components/client/footer";
import Header from "../../components/client/header";
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
