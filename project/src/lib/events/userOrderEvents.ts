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
    data: input,
    event: "ORDER_STATUS_UPDATED",
  };

  // Channel order_tracking_{orderId} cho order timeline
  // Channel order_tracking_{orderId} cho order timeline
  console.log(`[Pusher Server] Triggering ORDER_STATUS_UPDATED on channel order_tracking_${input.orderId}`, event);
  await pusherServer.trigger(`order_tracking_${input.orderId}`, "ORDER_STATUS_UPDATED", event);

  // Gửi Web Push Notification (nếu có userId)
  if (input.userId) {
    try {
      const { sendPushNotificationToUser } = await import("../action/push.action");
      await sendPushNotificationToUser(input.userId, {
        title: "Cập nhật đơn hàng",
        body: `Đơn hàng #${input.orderNumber} đang ở trạng thái: ${input.status}`,
        url: `/user/orders`
      });
    } catch (err) {
      console.error("Lỗi gửi push trạng thái đơn:", err);
    }
  }

  return event;
}
