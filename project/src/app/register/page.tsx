import { redirect } from "next/navigation";
import Footer from "../../components/client/footer";
import FormSignUp from "../../components/auth/formSignUp";
import Header from "../../components/client/header";
import Intro from "../../components/ui/intro";
import { getCurrentUser } from "../../lib/action/auth.action";

export default async function RegisterPage() {
  // action-(kiểm tra đăng nhập)
  const currentUser = await getCurrentUser();

  if (currentUser?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (currentUser) {
    redirect("/profile");
  }

  return (
    <>
      <Intro />
      <Header />
      <div className="flex flex-1 flex-col pt-20">
        <FormSignUp />
      </div>
      <Footer />
    </>
  );
}
