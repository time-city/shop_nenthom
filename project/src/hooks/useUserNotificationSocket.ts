"use client";

import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import type {
  UserNotificationWebSocketMessage as WebSocketMessage,
  UseUserNotificationSocketOptions,
} from "@/src/lib/types/client";

const USER_NOTIFICATION_WEBSOCKET_PATH = "/ws/users/notifications";
const RECONNECT_DELAY_MS = 3000;

/**
 * Hook kết nối WebSocket tới /ws/users/notifications.
 * Xử lý auto-reconnect và cleanup khi unmount.
 */
export function useUserNotificationSocket({
  onConnected,
  onCartProductsRemoved,
  onOrderCancelled,
}: UseUserNotificationSocketOptions = {}) {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const connectRef = useRef<() => void>(() => undefined);

  // Keep stable refs to callbacks so we don't re-create the socket on every render
  const onConnectedRef = useRef(onConnected);
  const onCartProductsRemovedRef = useRef(onCartProductsRemoved);
  const onOrderCancelledRef = useRef(onOrderCancelled);

  useEffect(() => {
    onConnectedRef.current = onConnected;
    onCartProductsRemovedRef.current = onCartProductsRemoved;
    onOrderCancelledRef.current = onOrderCancelled;
  }, [onCartProductsRemoved, onConnected, onOrderCancelled]);

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}${USER_NOTIFICATION_WEBSOCKET_PATH}`;
  }, []);

  const scheduleReconnect = useCallback(() => {
    reconnectAttemptsRef.current += 1;
    reconnectTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) connectRef.current();
    }, RECONNECT_DELAY_MS);
  }, []);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event: MessageEvent) => {
        if (!isMountedRef.current) return;

        try {
          const message = JSON.parse(event.data as string) as WebSocketMessage;

          if (message.event === "CONNECTED") {
            onConnectedRef.current?.(message.data);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("user-socket-connected", { detail: message.data }));
            }
          } else if (message.event === "CART_PRODUCTS_REMOVED") {
            const { productNames } = message.data;

            const productList =
              productNames.length <= 3
                ? productNames.join(", ")
                : `${productNames.slice(0, 3).join(", ")} và ${productNames.length - 3} sản phẩm khác`;

            toast.warning(
              `Một số sản phẩm trong giỏ hàng của bạn đã ngừng bán: ${productList}.`,
            );

            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("user-socket-cart-products-removed", {
                  detail: message.data,
                }),
              );
            }
            onCartProductsRemovedRef.current?.(message.data);
          } else if (message.event === "ORDER_CANCELLED") {
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("user-socket-order-cancelled", {
                  detail: message.data,
                })
              );
            }
            onOrderCancelledRef.current?.(message.data);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onerror = () => {
        // onclose will handle reconnect
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!isMountedRef.current) return;

        scheduleReconnect();
      };
    } catch {
      scheduleReconnect();
    }
  }, [getWebSocketUrl, scheduleReconnect, toast]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional unmount
        wsRef.current.close(1000, "Component unmounted");
        wsRef.current = null;
      }
    };
  }, [connect]);
}
