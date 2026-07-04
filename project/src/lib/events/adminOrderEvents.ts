import "server-only";

import { NotificationType, OrderStatus, Role, UserStatus } from "@prisma/client";
import type { AdminOrder, AdminOrderStatus } from "../types/admin";
import prisma from "../prisma";

export const ADMIN_ORDER_EVENT_CHANNEL =
  process.env.ADMIN_ORDER_EVENT_CHANNEL ?? "admin_order_events";

export type NewOrderAdminPayload = {
  createdAt: string;
  customerName: string;
  order: AdminOrder;
  orderId: string;
  orderNumber: string;
  pendingOrderCount: number;
  status: "PENDING";
  totalCents: number;
};

export type NewOrderAdminEvent = {
  data: NewOrderAdminPayload;
  event: "NEW_ORDER";
};

export type NewPaymentAdminPayload = {
  order: AdminOrder;
  orderId: string;
  orderNumber: string;
  paidAt: string;
  totalCents: number;
  transactionId: string;
};

export type NewPaymentAdminEvent = {
  data: NewPaymentAdminPayload;
  event: "NEW_PAYMENT";
};

export type OrderUpdatedAdminPayload = {
  order: AdminOrder;
  orderId: string;
  orderNumber: string;
  status: AdminOrderStatus;
};

export type OrderUpdatedAdminEvent = {
  data: OrderUpdatedAdminPayload;
  event: "ORDER_UPDATED";
};

type EmitNewOrderToAdminInput = Omit<
  NewOrderAdminPayload,
  "pendingOrderCount" | "status"
>;

export async function emitNewOrderToAdmin(
  input: EmitNewOrderToAdminInput,
) {
  const orderCreatedAt = new Date(input.createdAt);
  const notificationData = {
    createdAt: input.createdAt,
    customerName: input.customerName,
    orderNumber: input.orderNumber,
    totalCents: input.totalCents,
  };

  const [pendingOrderCount, admins] = await Promise.all([
    prisma.order.count({
      where: { status: OrderStatus.PENDING },
    }),
    prisma.user.findMany({
      where: {
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    }),
  ]);

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        created_at: orderCreatedAt,
        data: notificationData,
        message: `${input.customerName} vừa đặt đơn ${input.orderNumber}`,
        order_id: input.orderId,
        title: "Có đơn hàng mới",
        type: NotificationType.NEW_ORDER,
        user_id: admin.id,
      })),
      skipDuplicates: true,
    });
  }

  const event: NewOrderAdminEvent = {
    data: {
      ...input,
      pendingOrderCount,
      status: "PENDING",
    },
    event: "NEW_ORDER",
  };

  await prisma.$queryRaw`
    SELECT pg_notify(
      ${ADMIN_ORDER_EVENT_CHANNEL},
      ${JSON.stringify(event)}
    )::text
  `;

  return event;
}

export async function emitNewPaymentToAdmin(input: NewPaymentAdminPayload) {
  const event: NewPaymentAdminEvent = {
    data: input,
    event: "NEW_PAYMENT",
  };

  await prisma.$queryRaw`
    SELECT pg_notify(
      ${ADMIN_ORDER_EVENT_CHANNEL},
      ${JSON.stringify(event)}
    )::text
  `;

  return event;
}

export async function emitOrderUpdatedToAdmin(input: OrderUpdatedAdminPayload) {
  const event: OrderUpdatedAdminEvent = {
    data: input,
    event: "ORDER_UPDATED",
  };

  await prisma.$queryRaw`
    SELECT pg_notify(
      ${ADMIN_ORDER_EVENT_CHANNEL},
      ${JSON.stringify(event)}
    )::text
  `;

  return event;
}
