import { getOrdersAction } from "../../../lib/action/order.action";
import OrdersManagementClient from "@/src/components/admin/ordersManagementClient";

export default async function OrdersManagementPage() {
  const result = await getOrdersAction({ limit: 100, page: 1 });

  const orders =
    result && "success" in result && result.success ? result.data ?? [] : [];

  return <OrdersManagementClient orders={orders} />;
}
