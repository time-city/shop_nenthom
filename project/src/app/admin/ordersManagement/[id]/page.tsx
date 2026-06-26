import { notFound } from "next/navigation";
import { getOrderDetailForAdminAction } from "../../../../lib/action/order.action";
import DetailOrderAdmin from "../../../../components/admin/detailOrderAdmin";
import type { OrderDetail } from "../../../../lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await callAction(() => getOrderDetailForAdminAction({ order_number: id }), "Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.");

  if (!result || "error" in result || !result.success || !result.data) {
    notFound();
  }

  // Cast initialOrder because the service fields now exactly match client.d.ts OrderDetail.
  return (
    <DetailOrderAdmin initialOrder={result.data as unknown as OrderDetail} />
  );
}
