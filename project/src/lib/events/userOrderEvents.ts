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
