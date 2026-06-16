import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/action/user.action";
import OrdersClient from "@/src/components/client/ordersClient";

export default async function OrdersPage() {
  // action-(check user orders)
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirect=/orders");
  }

  if (currentUser.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  return (
    <OrdersClient
      initialUser={{
        email: currentUser.email,
        fullname: currentUser.fullname ?? "",
        phone: currentUser.phone ?? "",
        role: currentUser.role,
      }}
    />
  );
}

