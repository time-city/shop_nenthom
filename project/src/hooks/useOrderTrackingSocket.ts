"use client";

import { useEffect, useRef } from "react";
import { pusherClient } from "@/src/lib/pusher-client";

export type OrderStatusUpdatedData = {
  orderId: string;
  orderNumber: string;
  status: string;
  updatedAt: string;
};

export type UseOrderTrackingSocketOptions = {
  orderId?: string | null;
  onPaymentSuccess?: (data: any) => void;
  onOrderStatusUpdated?: (data: OrderStatusUpdatedData) => void;
};

export function useOrderTrackingSocket({
  orderId,
  onPaymentSuccess,
  onOrderStatusUpdated,
}: UseOrderTrackingSocketOptions = {}) {
  const onPaymentSuccessRef = useRef(onPaymentSuccess);
  const onOrderStatusUpdatedRef = useRef(onOrderStatusUpdated);

  useEffect(() => {
    onPaymentSuccessRef.current = onPaymentSuccess;
    onOrderStatusUpdatedRef.current = onOrderStatusUpdated;
  }, [onPaymentSuccess, onOrderStatusUpdated]);

  useEffect(() => {
    if (!orderId) return;

    const channelName = `order_tracking_${orderId}`;
    const channel = pusherClient.subscribe(channelName);
    console.log(`[Pusher Client] Subscribed to channel: ${channelName}`);

    channel.bind("PAYMENT_SUCCESS", (message: any) => {
      console.log("[Pusher Client] Received PAYMENT_SUCCESS:", message);
      const data = message.data || message;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("order-tracking-payment-success", { detail: data })
        );
      }
      onPaymentSuccessRef.current?.(data);
    });

    channel.bind("ORDER_STATUS_UPDATED", (message: any) => {
      console.log("[Pusher Client] Received ORDER_STATUS_UPDATED:", message);
      const data = message.data || message;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("order-tracking-status-updated", { detail: data })
        );
      }
      onOrderStatusUpdatedRef.current?.(data);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [orderId]);
}
