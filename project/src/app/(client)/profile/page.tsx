import ProfilePageContent from "@/src/components/client/user/profileClient";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/action/user.action";
import { callAction } from "@/src/lib/utils/callAction";

export default async function ProfilePage() {
  // action-(check user profile)
  const currentUser = await callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");

  if (!currentUser) {
    redirect("/login?redirect=/profile");
  }

  if (currentUser.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  return (
    <ProfilePageContent
      initialUser={{
        address: currentUser.address ?? "",
        city: currentUser.city ?? "",
        email: currentUser.email,
        fullname: currentUser.fullname ?? "",
        phone: currentUser.phone ?? "",
        role: currentUser.role,
        zip: currentUser.postal_code ?? "",
      }}
    />
  );
}

