import "server-only";

import { pusherServer } from "../pusher-server";
import type { ClientOrderStatus } from "../types/client";

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

export type OrderStatusUpdatedPayload = {
  orderId: string;
  orderNumber: string;
  status: ClientOrderStatus;
  updatedAt: string;
  trackingCode?: string;
  shippingCarrier?: string;
  isGuest?: boolean;
};

export type OrderStatusUpdatedEvent = {
  data: OrderStatusUpdatedPayload;
  event: "ORDER_STATUS_UPDATED";
};

export async function emitOrderCancelledToUser(
  input: OrderCancelledUserPayload,
) {
  const event: OrderCancelledUserEvent = {
    data: input,
    event: "ORDER_CANCELLED",
  };

  // Channel user_{userId} cho thông báo cá nhân
  // Channel user_{userId} cho thông báo cá nhân
  console.log(`[Pusher Server] Triggering ORDER_CANCELLED on channel user_${input.userId}`, event);
  await pusherServer.trigger(`user_${input.userId}`, "ORDER_CANCELLED", event);

  // Gửi Web Push Notification
  try {
    const { sendPushNotificationToUser } = await import("../action/push.action");
    await sendPushNotificationToUser(input.userId, {
      title: "Đơn hàng đã bị hủy",
      body: `Đơn hàng #${input.orderNumber} của bạn đã bị hủy. Lý do: ${input.reason}`,
      url: `/user/orders?tab=canceled`
    });
  } catch (err) {
    console.error("Lỗi gửi push thông báo hủy đơn:", err);
  }

  return event;
}

export async function emitPaymentSuccessToUser(input: PaymentSuccessPayload) {
  const event: PaymentSuccessEvent = {
    data: input,
    event: "PAYMENT_SUCCESS",
  };

  // Channel order_tracking_{orderId} cho order timeline
  // Channel order_tracking_{orderId} cho order timeline
  console.log(`[Pusher Server] Triggering PAYMENT_SUCCESS on channel order_tracking_${input.orderId}`, event);
  await pusherServer.trigger(`order_tracking_${input.orderId}`, "PAYMENT_SUCCESS", event);

  return event;
}

export async function emitOrderStatusUpdatedToUser(input: OrderStatusUpdatedPayload & { userId?: string }) {
  const event: OrderStatusUpdatedEvent = {
    data: {
      ...input,
      isGuest: !input.userId,
    },
    event: "ORDER_STATUS_UPDATED",
  };

  // Channel order_tracking_{orderId} cho order timeline
  // Channel order_tracking_{orderId} cho order timeline
  console.log(`[Pusher Server] Triggering ORDER_STATUS_UPDATED on channel order_tracking_${input.orderId}`, event);
  await pusherServer.trigger(`order_tracking_${input.orderId}`, "ORDER_STATUS_UPDATED", event);

  // Gửi Web Push Notification và lưu thông báo (nếu có userId)
  if (input.userId) {
    try {
      const statusMap: Record<ClientOrderStatus, string> = {
        canceled: "Đã huỷ",
        pending: "Đang chờ xác nhận",
        processing: "Đang xử lý",
        shipped: "Đang giao",
        delivered: "Đã giao thành công",
        cancel_requested: "Chờ duyệt huỷ",
      };
      const statusLabel = statusMap[input.status] || input.status;

      const { default: prisma } = await import("../prisma");
      // Dùng upsert để tránh P2002 unique constraint khi cùng đơn được update nhiều lần
      // Schema: @@unique([user_id, type, order_id]) → compound name: user_id_type_order_id
      const notification = await prisma.notification.upsert({
        where: {
          user_id_type_order_id: {
            user_id: input.userId,
            type: "ORDER_STATUS_UPDATED",
            order_id: input.orderId,
          },
        },
        update: {
          title: "Cập nhật đơn hàng",
          message: `Đơn hàng #${input.orderNumber} đang ở trạng thái: ${statusLabel}`,
          is_read: false,
          read_at: null,
          created_at: new Date(),
        },
        create: {
          user_id: input.userId,
          order_id: input.orderId,
          type: "ORDER_STATUS_UPDATED",
          title: "Cập nhật đơn hàng",
          message: `Đơn hàng #${input.orderNumber} đang ở trạng thái: ${statusLabel}`,
        },
      });

      // Gửi Pusher tới channel user_{userId} — luôn chạy sau upsert thành công
      console.log(`[Pusher Server] Triggering ORDER_STATUS_UPDATED on channel user_${input.userId}`);
      await pusherServer.trigger(`user_${input.userId}`, "ORDER_STATUS_UPDATED", {
        ...event,
        notification: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: notification.is_read,
          createdAt: notification.created_at.toISOString(),
        },
      });

      // Web Push: fire-and-forget, không block luồng chính
      import("../action/push.action")
        .then(({ sendPushNotificationToUser }) =>
          sendPushNotificationToUser(input.userId!, {
            title: "Cập nhật đơn hàng",
            body: `Đơn hàng #${input.orderNumber} đang ở trạng thái: ${statusLabel}`,
            url: `/user/orders`,
          })
        )
        .catch((err) => console.error("Lỗi gửi web push trạng thái đơn:", err));
    } catch (err) {
      console.error("Lỗi upsert notification hoặc gửi Pusher user channel:", err);
    }
  }

  return event;
}
