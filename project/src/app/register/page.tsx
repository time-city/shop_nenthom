import { redirect } from "next/navigation";
import FormSignUp from "../../components/auth/formSignUp";
import { getCurrentUser } from "../../lib/action/user.action";

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
    <FormSignUp />
  );
}
