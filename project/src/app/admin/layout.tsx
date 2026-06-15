import { redirect } from "next/navigation";
import Navbar from "../../components/admin/navbar";
import { getCurrentUser } from "../../lib/action/auth.action";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // action-(check role admin)
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login?redirect=/admin/dashboard");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="dashboard-admin-layout">
      <Navbar />
      <main className="dashboard-main-content">{children}</main>
    </div>
  );
}
