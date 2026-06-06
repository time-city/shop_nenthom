import { redirect } from "next/navigation";
import FormSignIn from "../../components/client/formSignIn";
import { getCurrentUser } from "../../lib/action/auth.action";

export default async function LoginPage() {
  // action-(kiểm tra đăng nhập)
  const currentUser = await getCurrentUser();

  if (currentUser?.role === "ADMIN") {
    redirect("/admin");
  }

  if (currentUser) {
    redirect("/profile");
  }

  return <FormSignIn />;
}
