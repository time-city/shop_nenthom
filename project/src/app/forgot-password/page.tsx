import { redirect } from "next/navigation";
import FormForgotPassword from "../../components/auth/formForgotPassword";
import { getCurrentUser } from "../../lib/action/user.action";

export default async function ForgotPasswordPage() {
  // action-(kiểm tra đăng nhập)
  const currentUser = await getCurrentUser();

  if (currentUser?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (currentUser) {
    redirect("/profile");
  }

  return <FormForgotPassword />;
}
