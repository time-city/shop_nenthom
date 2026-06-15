import Footer from "../../components/client/footer";
import Header from "../../components/client/header";
import Intro from "../../components/ui/intro";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Intro />
      <Header />
      <div className="flex flex-1 flex-col pt-20">{children}</div>
      <Footer />
    </>
  );
}
