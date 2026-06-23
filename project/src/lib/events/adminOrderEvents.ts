import "server-only";

import { NotificationType, OrderStatus, Role, UserStatus } from "@prisma/client";
import prisma from "../prisma";

export const ADMIN_ORDER_EVENT_CHANNEL =
  process.env.ADMIN_ORDER_EVENT_CHANNEL ?? "admin_order_events";

export type NewOrderAdminPayload = {
  createdAt: string;
  customerName: string;
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

type EmitNewOrderToAdminInput = Omit<
  NewOrderAdminPayload,
  "pendingOrderCount" | "status"
>;

export async function emitNewOrderToAdmin(
  input: EmitNewOrderToAdminInput,
) {
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
