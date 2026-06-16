import { notFound } from "next/navigation";
import { getOrderDetailForAdminAction } from "../../../../lib/action/order.action";
import DetailOrderAdmin from "../../../../components/admin/detailOrderAdmin";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getOrderDetailForAdminAction({ order_number: id });

  if (!result || "error" in result || !result.success || !result.data) {
    notFound();
  }

  // Cast initialOrder because the service fields now exactly match client.d.ts OrderDetail.
  return <DetailOrderAdmin initialOrder={result.data as any} />;
}
