import { redirect } from "next/navigation";
import FormForgotPassword from "../../components/auth/formForgotPassword";
import { getCurrentUser } from "../../lib/action/user.action";
import { callAction } from "@/src/lib/utils/callAction";

export default async function ForgotPasswordPage() {
  // action-(kiểm tra đăng nhập)
  const currentUser = await callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");

  if (currentUser?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (currentUser) {
    redirect("/profile");
  }

  return <FormForgotPassword />;
}
