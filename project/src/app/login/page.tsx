import { redirect } from "next/navigation";
import Footer from "../../components/client/footer";
import FormSignIn from "../../components/client/formSignIn";
import Header from "../../components/client/header";
import Intro from "../../components/ui/intro";
import { getCurrentUser } from "../../lib/action/auth.action";

export default async function LoginPage() {
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
        <FormSignIn />
      </div>
      <Footer />
    </>
  );
}
