import "server-only";

import prisma from "../prisma";
import { ADMIN_ORDER_EVENT_CHANNEL } from "./adminOrderEvents";

export type OrderCancelledUserPayload = {
  orderId: string;
  orderNumber: string;
  reason: string;
  userId: string;
};

export type OrderCancelledUserEvent = {
  data: OrderCancelledUserPayload;
  event: "ORDER_CANCELLED";
};

export type PaymentSuccessPayload = {
  orderId: string;
  orderNumber: string;
  paidAt: string;
  totalCents: number;
  transactionId: string;
};

export type PaymentSuccessEvent = {
  data: PaymentSuccessPayload;
  event: "PAYMENT_SUCCESS";
};

export async function emitOrderCancelledToUser(
  input: OrderCancelledUserPayload,
) {
  const event: OrderCancelledUserEvent = {
    data: input,
    event: "ORDER_CANCELLED",
  };

  await prisma.$queryRaw`
    SELECT pg_notify(
      ${ADMIN_ORDER_EVENT_CHANNEL},
      ${JSON.stringify(event)}
    )::text
  `;

  return event;
}

export async function emitPaymentSuccessToUser(input: PaymentSuccessPayload) {
  const event: PaymentSuccessEvent = {
    data: input,
    event: "PAYMENT_SUCCESS",
  };

  await prisma.$queryRaw`
    SELECT pg_notify(
      ${ADMIN_ORDER_EVENT_CHANNEL},
      ${JSON.stringify(event)}
    )::text
  `;

  return event;
}

