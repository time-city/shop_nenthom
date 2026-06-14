import type { OrderStatus, PaymentStatus } from "@prisma/client";
import type { AdminOrderStatus, AdminPaymentStatus } from "./admin";

export const orderStatusMap: Record<OrderStatus, AdminOrderStatus> = {
  CANCELLED: "cancelled",
  DELIVERED: "completed",
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipping",
};

export const paymentStatusMap: Record<PaymentStatus, AdminPaymentStatus> = {
  FAILED: "unpaid",
  PAID: "paid",
  UNPAID: "unpaid",
};

export const clientOrderStatusMap = {
  CANCELLED: "canceled",
  DELIVERED: "done",
  PENDING: "processing",
  PROCESSING: "processing",
  SHIPPED: "shipping",
} as const satisfies Record<
  OrderStatus,
  "canceled" | "done" | "processing" | "shipping"
>;
