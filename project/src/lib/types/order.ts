import type { OrderStatus, PaymentStatus } from "@prisma/client";
import type { AdminPaymentStatus } from "./admin";

export type AdminOrderResponseStatus = "pending" | "confirmed" | "cancelled" | "cancel_requested";
export type ClientOrderResponseStatus = "pending" | "processing" | "shipped" | "delivered" | "canceled" | "cancel_requested";

export const orderStatusMap: Record<OrderStatus, AdminOrderResponseStatus> = {
  CANCELLED: "cancelled",
  DELIVERED: "confirmed",
  PENDING: "pending",
  PROCESSING: "confirmed",
  SHIPPED: "confirmed",
  CANCEL_REQUESTED: "cancel_requested",
};

export const paymentStatusMap: Record<PaymentStatus, AdminPaymentStatus> = {
  FAILED: "unpaid",
  PAID: "paid",
  UNPAID: "unpaid",
};

export const clientOrderStatusMap = {
  CANCELLED: "canceled",
  DELIVERED: "delivered",
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  CANCEL_REQUESTED: "cancel_requested",
} as const satisfies Record<OrderStatus, ClientOrderResponseStatus>;

