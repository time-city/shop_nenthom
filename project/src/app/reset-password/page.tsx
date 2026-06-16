import { redirect } from "next/navigation";
import FormResetPassword from "../../components/auth/formResetPassword";
import { getCurrentUser } from "../../lib/action/user.action";

export default async function ResetPasswordPage() {
  // action-(kiểm tra đăng nhập)
  const currentUser = await getCurrentUser();

  if (currentUser?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (currentUser) {
    redirect("/profile");
  }

  return <FormResetPassword />;
}
