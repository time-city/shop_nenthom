"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/src/components/ui/toastProvider";
import type { UseUserNotificationSocketOptions } from "@/src/lib/types/client";
import { pusherClient } from "@/src/lib/pusher-client";

/**
 * Hook kết nối Pusher tới channel user_{userId}.
 */
export function useUserNotificationSocket({
  userId,
  onConnected,
  onCartProductsRemoved,
  onOrderCancelled,
  onReviewReplied,
}: UseUserNotificationSocketOptions = {}) {
  const { toast } = useToast();

  const onConnectedRef = useRef(onConnected);
  const onCartProductsRemovedRef = useRef(onCartProductsRemoved);
  const onOrderCancelledRef = useRef(onOrderCancelled);
  const onReviewRepliedRef = useRef(onReviewReplied);

  useEffect(() => {
    onConnectedRef.current = onConnected;
    onCartProductsRemovedRef.current = onCartProductsRemoved;
    onOrderCancelledRef.current = onOrderCancelled;
    onReviewRepliedRef.current = onReviewReplied;
  }, [onConnected, onCartProductsRemoved, onOrderCancelled, onReviewReplied]);

  useEffect(() => {
    if (!userId) return;

    const channelName = `user_${userId}`;
    const channel = pusherClient.subscribe(channelName);
    console.log(`[Pusher Client] Subscribed to channel: ${channelName}`);

    channel.bind("pusher:subscription_succeeded", () => {
      console.log(`[Pusher Client] Subscription succeeded on ${channelName}`);
      onConnectedRef.current?.({ userId });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("user-socket-connected", { detail: { userId } }));
      }
    });

    channel.bind("CART_PRODUCTS_REMOVED", (message: any) => {
      console.log("[Pusher Client] Received CART_PRODUCTS_REMOVED:", message);
      const data = message.data || message;
      const { productNames } = data;

      const productList =
        productNames.length <= 3
          ? productNames.join(", ")
          : `${productNames.slice(0, 3).join(", ")} và ${productNames.length - 3} sản phẩm khác`;

      toast.warning(`Một số sản phẩm trong giỏ hàng của bạn đã ngừng bán: ${productList}.`);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("user-socket-cart-products-removed", { detail: data }),
        );
      }
      onCartProductsRemovedRef.current?.(data);
    });

    channel.bind("ORDER_CANCELLED", (message: any) => {
      console.log("[Pusher Client] Received ORDER_CANCELLED:", message);
      const data = message.data || message;
      
      toast.error(`Đơn hàng #${data.orderNumber} của bạn đã bị huỷ. Lý do: ${data.reason}`);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("user-socket-order-cancelled", { detail: data }),
        );
      }
      onOrderCancelledRef.current?.(data);
    });

    channel.bind("REVIEW_REPLIED", (message: any) => {
      console.log("[Pusher Client] Received REVIEW_REPLIED:", message);
      const data = message.data || message;
      toast.info(`Shop đã trả lời đánh giá của bạn cho sản phẩm "${data.productName}"`);
      onReviewRepliedRef.current?.(data);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [userId, toast]);
}
