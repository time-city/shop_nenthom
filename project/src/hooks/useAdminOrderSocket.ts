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
}: UseAdminOrderSocketOptions = {}) {
  const onConnectedRef = useRef(onConnected);
  const onNewOrderRef = useRef(onNewOrder);
  const onNewContactRef = useRef(onNewContact);
  const onCancelRequestRef = useRef(onCancelRequest);

  useEffect(() => {
    onConnectedRef.current = onConnected;
    onNewOrderRef.current = onNewOrder;
    onNewContactRef.current = onNewContact;
    onCancelRequestRef.current = onCancelRequest;
  }, [onConnected, onNewContact, onNewOrder, onCancelRequest]);

  useEffect(() => {
    const channel = pusherClient.subscribe("admin_orders");
    console.log("[Pusher Client] Subscribed to channel: admin_orders");

    // Simulate CONNECTED event if needed for compatibility
    channel.bind("pusher:subscription_succeeded", () => {
      console.log("[Pusher Client] Subscription succeeded on admin_orders");
      onConnectedRef.current?.({ pendingContactCount: 0, unreadNotificationCount: 0 }); // You might want to fetch these instead
    });

    channel.bind("NEW_ORDER", (data: any) => {
      console.log("[Pusher Client] Received NEW_ORDER:", data);
      onNewOrderRef.current?.(data);
      mutate('admin-pending-orders');
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-socket-new-order", { detail: data }));
      }
    });
    
    channel.bind("NEW_PAYMENT", (data: any) => {
      console.log("[Pusher Client] Received NEW_PAYMENT:", data);
      mutate('admin-pending-orders'); // or mutate something else if we list payments
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-socket-new-payment", { detail: data }));
      }
    });

    channel.bind("NEW_CONTACT", (data: any) => {
      console.log("[Pusher Client] Received NEW_CONTACT:", data);
      onNewContactRef.current?.(data);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-socket-new-contact", { detail: data }));
      }
    });

    channel.bind("CANCEL_REQUEST", (data: any) => {
      console.log("[Pusher Client] Received CANCEL_REQUEST:", data);
      onCancelRequestRef.current?.(data);
      mutate('admin-pending-orders');
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-socket-cancel-request", { detail: data }));
      }
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe("admin_orders");
    };
  }, []);
}
