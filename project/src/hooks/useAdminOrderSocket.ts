"use client";

import { useEffect, useRef, useCallback } from "react";
import type {
  AdminWebSocketMessage,
  UseAdminOrderSocketOptions,
} from "@/src/lib/types/admin";

const ADMIN_ORDER_WEBSOCKET_PATH = "/ws/admin/orders";
const RECONNECT_DELAY_MS = 3000;

/**
 * Hook kết nối WebSocket tới /ws/admin/orders (admin-only).
 * Xử lý auto-reconnect và cleanup khi unmount.
 */
export function useAdminOrderSocket({
  onConnected,
  onNewOrder,
  onNewContact,
}: UseAdminOrderSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const connectRef = useRef<() => void>(() => undefined);

  // Stable refs to avoid re-creating socket on every render
  const onConnectedRef = useRef(onConnected);
  const onNewOrderRef = useRef(onNewOrder);
  const onNewContactRef = useRef(onNewContact);

  useEffect(() => {
    onConnectedRef.current = onConnected;
    onNewOrderRef.current = onNewOrder;
    onNewContactRef.current = onNewContact;
  }, [onConnected, onNewContact, onNewOrder]);

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}${ADMIN_ORDER_WEBSOCKET_PATH}`;
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
          const message = JSON.parse(event.data as string) as AdminWebSocketMessage;

          if (message.event === "CONNECTED") {
            onConnectedRef.current?.(message.data);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("admin-socket-connected", { detail: message.data }));
            }
          } else if (message.event === "NEW_ORDER") {
            onNewOrderRef.current?.(message.data as Parameters<NonNullable<typeof onNewOrder>>[0]);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("admin-socket-new-order", { detail: message.data }));
            }
          } else if (message.event === "NEW_CONTACT") {
            onNewContactRef.current?.(message.data);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("admin-socket-new-contact", { detail: message.data }));
            }
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
  }, [getWebSocketUrl, scheduleReconnect]);

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
