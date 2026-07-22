"use client";

import { useEffect, useRef } from "react";
import { pusherClient } from "@/src/lib/pusher-client";
import type { UseAdminOrderSocketOptions } from "@/src/lib/types/admin";
import { mutate } from "swr";

export function useAdminOrderSocket({
  onConnected,
  onNewOrder,
  onNewContact,
  onCancelRequest,
  onNewPayment,
  onOrderUpdated,
  onNewReview,
  onReviewChanged,
}: UseAdminOrderSocketOptions = {}) {
  const onConnectedRef = useRef(onConnected);
  const onNewOrderRef = useRef(onNewOrder);
  const onNewContactRef = useRef(onNewContact);
  const onCancelRequestRef = useRef(onCancelRequest);
  const onNewPaymentRef = useRef(onNewPayment);
  const onOrderUpdatedRef = useRef(onOrderUpdated);
  const onNewReviewRef = useRef(onNewReview);
  const onReviewChangedRef = useRef(onReviewChanged);

  useEffect(() => {
    onConnectedRef.current = onConnected;
    onNewOrderRef.current = onNewOrder;
    onNewContactRef.current = onNewContact;
    onCancelRequestRef.current = onCancelRequest;
    onNewPaymentRef.current = onNewPayment;
    onOrderUpdatedRef.current = onOrderUpdated;
    onNewReviewRef.current = onNewReview;
    onReviewChangedRef.current = onReviewChanged;
  }, [onConnected, onNewContact, onNewOrder, onCancelRequest, onNewPayment, onOrderUpdated, onNewReview, onReviewChanged]);

  useEffect(() => {
    const channel = pusherClient.subscribe("admin_orders");
    console.log("[Pusher Client] Subscribed to channel: admin_orders");

    // Simulate CONNECTED event if needed for compatibility
    channel.bind("pusher:subscription_succeeded", () => {
      console.log("[Pusher Client] Subscription succeeded on admin_orders");
      onConnectedRef.current?.({ pendingContactCount: 0, unreadNotificationCount: 0 }); // You might want to fetch these instead
    });

    channel.bind("NEW_ORDER", (message: any) => {
      const data = message.data || message;
      console.log("[Pusher Client] Received NEW_ORDER:", data);
      onNewOrderRef.current?.(data);
      mutate((key: any) => Array.isArray(key) && key[0] === 'admin-dashboard');
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-socket-new-order", { detail: data }));
      }
    });
    
    channel.bind("NEW_PAYMENT", (message: any) => {
      const data = message.data || message;
      console.log("[Pusher Client] Received NEW_PAYMENT:", data);
      onNewPaymentRef.current?.(data);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-socket-new-payment", { detail: data }));
      }
    });

    channel.bind("ORDER_UPDATED", (message: any) => {
      const data = message.data || message;
      console.log("[Pusher Client] Received ORDER_UPDATED:", data);
      onOrderUpdatedRef.current?.(data);
      mutate((key: any) => Array.isArray(key) && key[0] === 'admin-dashboard');
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-socket-order-updated", { detail: data }));
      }
    });

    channel.bind("NEW_CONTACT", (message: any) => {
      const data = message.data || message;
      console.log("[Pusher Client] Received NEW_CONTACT:", data);
      onNewContactRef.current?.(data);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-socket-new-contact", { detail: data }));
      }
    });

    channel.bind("CANCEL_REQUEST", (message: any) => {
      const data = message.data || message;
      console.log("[Pusher Client] Received CANCEL_REQUEST:", data);
      onCancelRequestRef.current?.(data);
      mutate((key: any) => Array.isArray(key) && key[0] === 'admin-dashboard');
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-socket-cancel-request", { detail: data }));
      }
    });

    channel.bind("NEW_REVIEW", (message: any) => {
      const data = message.data || message;
      console.log("[Pusher Client] Received NEW_REVIEW:", data);
      onNewReviewRef.current?.(data);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-socket-new-review", { detail: data }));
      }
    });

    channel.bind("REVIEW_CHANGED", (message: any) => {
      const data = message.data || message;
      console.log("[Pusher Client] Received REVIEW_CHANGED:", data);
      onReviewChangedRef.current?.(data);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-socket-review-changed", { detail: data }));
      }
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe("admin_orders");
    };
  }, []);
}
