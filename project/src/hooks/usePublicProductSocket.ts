"use client";

import { useEffect, useRef } from "react";
import { pusherClient } from "@/src/lib/pusher-client";

export type UsePublicProductSocketOptions = {
  productId: string;
  onReviewListUpdated?: (data: { productId: string, message?: string, actorId?: string }) => void;
};

export function usePublicProductSocket({
  productId,
  onReviewListUpdated,
}: UsePublicProductSocketOptions) {
  const onReviewListUpdatedRef = useRef(onReviewListUpdated);

  useEffect(() => {
    onReviewListUpdatedRef.current = onReviewListUpdated;
  }, [onReviewListUpdated]);

  useEffect(() => {
    if (!productId) return;

    const channelName = `public_product_${productId}`;
    const channel = pusherClient.subscribe(channelName);
    console.log(`[Pusher Client] Subscribed to channel: ${channelName}`);

    channel.bind("REVIEW_LIST_UPDATED", (message: any) => {
      console.log("[Pusher Client] Received REVIEW_LIST_UPDATED:", message);
      const data = message.data || message;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("public-product-review-list-updated", { detail: data })
        );
      }
      onReviewListUpdatedRef.current?.(data);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(channelName);
    };
  }, [productId]);
}
