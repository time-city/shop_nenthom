import { redirect } from "next/navigation";
import FormSignIn from "../../components/auth/formSignIn";
import { getCurrentUser } from "../../lib/action/user.action";
import { callAction } from "@/src/lib/utils/callAction";

export default async function LoginPage() {
  // action-(kiểm tra đăng nhập)
  const currentUser = await callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");

  if (currentUser?.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (currentUser) {
    const hasInfo = !!currentUser.phone && !!currentUser.address;
    if (!hasInfo) {
      redirect("/profile");
    } else {
      redirect("/");
    }
  }

  return (
    <FormSignIn />
  );
}
