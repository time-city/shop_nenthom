import { ProfilePageContent } from "./profile";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/action/auth.action";

export default async function ProfilePage() {
  // action-(check user profile)
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirect=/profile");
  }

  if (currentUser.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  return (
    <ProfilePageContent
      initialUser={{
        address: "",
        city: "",
        email: currentUser.email,
        fullname: currentUser.fullname ?? "",
        phone: currentUser.phone ?? "",
        role: currentUser.role,
        zip: "",
      }}
    />
  );
}
