import { redirect } from "next/navigation";
import Navbar from "@/src/components/admin/layout/navbar";
import { getSession } from "../../lib/session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Đọc role từ JWT cookie — không cần query DB
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/admin/dashboard");
  }

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="dashboard-admin-layout">
      <Navbar />
      <main className="dashboard-main-content">{children}</main>
    </div>
  );
}
