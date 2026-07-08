import Footer from "@/src/components/client/layout/footer";
import Header from "@/src/components/client/layout/header";
import Intro from "../../components/ui/intro";
import AosProvider from "../../components/ui/aosProvider";

import MainWrapper from "@/src/components/client/layout/mainWrapper";
import { PushNotificationPrompt } from "@/src/components/client/user/pushNotificationPrompt";

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
      <MainWrapper>{children}</MainWrapper>
      <Footer />
      <PushNotificationPrompt />
    </>
  );
}
