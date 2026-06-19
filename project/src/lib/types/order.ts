import type { OrderStatus, PaymentStatus } from "@prisma/client";
import type { AdminPaymentStatus } from "./admin";

export type AdminOrderResponseStatus = "pending" | "confirmed" | "cancelled";
export type ClientOrderResponseStatus = "pending" | "confirmed" | "canceled";

export const orderStatusMap: Record<OrderStatus, AdminOrderResponseStatus> = {
  CANCELLED: "cancelled",
  DELIVERED: "confirmed",
  PENDING: "pending",
  PROCESSING: "confirmed",
  SHIPPED: "confirmed",
};

export const paymentStatusMap: Record<PaymentStatus, AdminPaymentStatus> = {
  FAILED: "unpaid",
  PAID: "paid",
  UNPAID: "unpaid",
};

export const clientOrderStatusMap = {
  CANCELLED: "canceled",
  DELIVERED: "confirmed",
  PENDING: "pending",
  PROCESSING: "confirmed",
  SHIPPED: "confirmed",
} as const satisfies Record<OrderStatus, ClientOrderResponseStatus>;
