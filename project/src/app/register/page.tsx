import { redirect } from "next/navigation";
import FormSignUp from "../../components/client/formSignUp";
import { getCurrentUser } from "../../lib/action/auth.action";

export default async function RegisterPage() {
  // action-(kiểm tra đăng nhập)
  const currentUser = await getCurrentUser();

  if (currentUser?.role === "ADMIN") {
    redirect("/admin");
  }

  if (currentUser) {
    redirect("/profile");
  }

  return <FormSignUp />;
}
