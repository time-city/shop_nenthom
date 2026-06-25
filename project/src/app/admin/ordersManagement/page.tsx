import { getOrdersAction } from "../../../lib/action/order.action";
import OrdersManagementClient from "@/src/components/admin/ordersManagementClient";
import { callAction } from "@/src/lib/utils/callAction";

export default async function OrdersManagementPage() {
  const result = await callAction(() => getOrdersAction({ limit: 100, page: 1 }), "Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");

  const orders =
    result && "success" in result && result.success ? result.data ?? [] : [];

  return <OrdersManagementClient orders={orders} />;
}
