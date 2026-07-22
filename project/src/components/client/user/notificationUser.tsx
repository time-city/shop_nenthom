"use client";

import {
  AlertCircle,
  Bell,
  Inbox,
  LoaderCircle,
  ShoppingBag,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getUserNotificationsAction,
  markUserNotificationAsReadAction,
  markAllUserNotificationsAsReadAction,
} from "@/src/lib/action/notification.action";
import { callAction } from "@/src/lib/utils/callAction";
import { useUserNotificationSocket } from "@/src/hooks/useUserNotificationSocket";
import { useCartStore } from "@/src/store/useCartStore";
import type { UserNotification, OrderCancelledData } from "@/src/lib/types/client";
import { useToast } from "@/src/components/ui/toastProvider";

const formatNotificationTime = (value: Date | string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000),
  );

  if (elapsedSeconds < 60) return "Vừa xong";
  if (elapsedSeconds < 3600) {
    return `${Math.floor(elapsedSeconds / 60)} phút trước`;
  }
  if (elapsedSeconds < 86400) {
    return `${Math.floor(elapsedSeconds / 3600)} giờ trước`;
  }
  if (elapsedSeconds < 604800) {
    return `${Math.floor(elapsedSeconds / 86400)} ngày trước`;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatBadge = (count: number) => (count > 99 ? "99+" : String(count));

export default function NotificationUser() {
  const { toast } = useToast();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [arrivalReferenceTime, setArrivalReferenceTime] = useState(0);

  useEffect(() => {
     
    setMounted(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsNotificationOpen(false);
      setIsClosing(false);
    }, 200);
  }, []);

  const loadNotifications = useCallback(async (options: { silent?: boolean } = {}) => {
    if (!options.silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await callAction(() => getUserNotificationsAction({
        limit: 20,
        page: 1,
      }), "Không thể tải thông báo. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        setError(result.error);
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      if ("success" in result && result.success) {
        setNotifications(result.data as UserNotification[]);
        setUnreadCount(result.meta.unreadCount);
        setArrivalReferenceTime(Date.now());
      }
    } catch {
      setError("Không thể tải thông báo. Vui lòng thử lại.");
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (!options.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void loadNotifications();

    const fetchUserId = async () => {
      try {
        const user = await callAction(() => import("@/src/lib/action/user.action").then(m => m.getCurrentUser()), "Error fetching user");
        if (user && "id" in user) {
          setUserId(user.id);
        }
      } catch (e) {
        // ignore
      }
    };
    void fetchUserId();

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };

    if (isNotificationOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isNotificationOpen, closePanel, loadNotifications]);

  // WebSocket realtime: khi có CART_PRODUCTS_REMOVED thì reload notifications và giỏ hàng
  useUserNotificationSocket({
    userId,
    onConnected: useCallback(() => {
      void loadNotifications({ silent: true });
    }, [loadNotifications]),
    onCartProductsRemoved: useCallback(() => {
      void loadNotifications({ silent: true });
      // Reload giỏ hàng để cập nhật badge
      void useCartStore.getState().fetchCartCount();
    }, [loadNotifications]),
    onOrderCancelled: useCallback((data: OrderCancelledData) => {
      if (data.notification) {
        const newNoti: UserNotification = {
          id: data.notification.id,
          user_id: data.userId,
          order_id: data.orderId,
          type: data.notification.type,
          title: data.notification.title,
          message: data.notification.message,
          is_read: data.notification.isRead,
          read_at: null,
          created_at: data.notification.createdAt,
        };
        setNotifications((prev) => [newNoti, ...prev]);
        setArrivalReferenceTime(Date.now());

        // Push toast to user
        toast.info({
          title: data.notification.title,
          message: data.notification.message,
        });
      }
      if (data.unreadNotificationCount !== undefined) {
        setUnreadCount(data.unreadNotificationCount);
      } else if (data.notification) {
        setUnreadCount((prev) => prev + 1);
      }
      void loadNotifications({ silent: true });
    }, [loadNotifications, toast]),
    onOrderStatusUpdated: useCallback((data: any) => {
      if (data.notification) {
        const newNoti: UserNotification = {
          id: data.notification.id,
          user_id: data.userId,
          order_id: data.orderId,
          type: data.notification.type,
          title: data.notification.title,
          message: data.notification.message,
          is_read: data.notification.isRead,
          read_at: null,
          created_at: data.notification.createdAt,
        };
        setNotifications((prev) => [newNoti, ...prev]);
        setArrivalReferenceTime(Date.now());

        toast.info({
          title: data.notification.title,
          message: data.notification.message,
        });
      }
      if (data.unreadNotificationCount !== undefined) {
        setUnreadCount(data.unreadNotificationCount);
      } else if (data.notification) {
        setUnreadCount((prev) => prev + 1);
      }
      void loadNotifications({ silent: true });
    }, [loadNotifications, toast]),
  });

  useEffect(() => {
    if (mounted) {
       
      void loadNotifications();
    }
  }, [mounted, loadNotifications]);

  // Click outside to close
  useEffect(() => {
    if (!isNotificationOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !target.closest(".notification-user-panel") &&
        !target.closest(".notification-user-overlay")
      ) {
        closePanel();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotificationOpen, closePanel]);

  const togglePanel = () => {
    if (isNotificationOpen) {
      closePanel();
    } else {
      setIsNotificationOpen(true);
      void loadNotifications();
    }
  };

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const result = await callAction(() => markUserNotificationAsReadAction(id), "Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại sau.");
      if ("error" in result && result.error) {
        // Rollback on error
        void loadNotifications();
      }
    } catch {
      void loadNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);

    try {
      const result = await callAction(() => markAllUserNotificationsAsReadAction(), "Không thể đánh dấu tất cả thông báo đã đọc. Vui lòng thử lại sau.");
      if ("error" in result && result.error) {
        void loadNotifications();
      }
    } catch {
      void loadNotifications();
    }
  };

  const triggerLabel = useMemo(
    () =>
      unreadCount > 0
        ? `Thông báo, ${unreadCount} mục chưa đọc`
        : "Thông báo",
    [unreadCount],
  );

  return (
    <div className="relative inline-block">
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-notification-fade-in {
          animation: notification-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-notification-fade-out {
          animation: notification-fade-out 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-notification-slide-in {
          animation: notification-slide-in 0.25s cubic-bezier(0.34, 1.25, 0.64, 1) forwards;
        }
        .animate-notification-slide-out {
          animation: notification-slide-out 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes notification-fade-in {
          from { opacity: 0; background-color: rgba(0, 0, 0, 0); backdrop-filter: blur(0px); }
          to { opacity: 1; background-color: rgba(0, 0, 0, 0.15); backdrop-filter: blur(1.5px); }
        }
        @keyframes notification-fade-out {
          from { opacity: 1; background-color: rgba(0, 0, 0, 0.15); backdrop-filter: blur(1.5px); }
          to { opacity: 0; background-color: rgba(0, 0, 0, 0); backdrop-filter: blur(0px); }
        }
        @keyframes notification-slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes notification-slide-out {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-10px) scale(0.96);
          }
        }

        .notification-item-unread-dot {
          animation: dot-pulse 2s infinite ease-in-out;
        }
        @keyframes dot-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.65; }
        }

        .notification-item-new-arrival {
          animation: notification-item-flash 3s cubic-bezier(0.25, 1, 0.5, 1) both;
        }
        @keyframes notification-item-flash {
          0% {
            transform: scale(0.96);
            background-color: rgba(107, 18, 24, 0.12);
          }
          15% {
            transform: scale(1.02);
            background-color: rgba(107, 18, 24, 0.12);
          }
          30% {
            transform: scale(1);
            background-color: rgba(107, 18, 24, 0.06);
          }
          100% {
            background-color: transparent;
          }
        }
      `}} />
      <button
        ref={triggerRef}
        className={`relative flex size-8 md:size-10 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 ${
          isNotificationOpen
            ? "bg-[#F5F0E8] border-[#F5F0E8] text-[#6B1218]"
            : "border-[#f5f0e8]/20 text-[#f5f0e8] hover:border-[#f5f0e8]/40 hover:text-[#F8F0E4]"
        }`}
        type="button"
        aria-label={triggerLabel}
        aria-expanded={isNotificationOpen}
        aria-haspopup="dialog"
        onClick={togglePanel}
      >
        <Bell className="size-4 md:size-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#4A0C10] bg-[#6B1218] px-1 text-[9px] font-bold leading-none text-[#F5F0E8]">
            {formatBadge(unreadCount)}
          </span>
        ) : null}
      </button>

      {isNotificationOpen && mounted ? createPortal(
        <>
          <div
            className={`notification-user-overlay fixed inset-0 z-[1000] transition-opacity ${
              isClosing ? "animate-notification-fade-out" : "animate-notification-fade-in"
            }`}
            aria-hidden="true"
            onClick={closePanel}
          />
          <section
            ref={panelRef}
            style={{ transformOrigin: "top right" }}
            className={`notification-user-panel fixed right-4 top-20 z-[1010] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-[#6B4C35]/15 bg-[#F8F0E4]/95 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.12)] md:right-8 lg:right-16 ${
              isClosing ? "animate-notification-slide-out" : "animate-notification-slide-in"
            }`}
            role="dialog"
            aria-label="Thông báo của bạn"
          >
            <header className="flex items-center justify-between border-b border-[#6B4E35]/12 px-4 py-3.5">
              <div>
                <h2 className="font-serif text-[1.15rem] font-bold text-[#2C1810]">
                  Thông báo
                </h2>
                <p className="text-[11px] text-[#6B4C35]/80 mt-0.5">
                  {unreadCount > 0
                    ? `Bạn có ${unreadCount} mục chưa đọc`
                    : "Không có thông báo mới"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 ? (
                  <button
                    className="text-[10px] font-semibold text-[#6B1218] hover:underline"
                    type="button"
                    onClick={handleMarkAllAsRead}
                  >
                    Đọc tất cả
                  </button>
                ) : null}
                <button
                  className="flex size-7 items-center justify-center rounded-lg text-[#6B4C35] hover:bg-[#6B1218]/8 hover:text-[#B91C1C] transition-colors"
                  type="button"
                  aria-label="Đóng"
                  onClick={closePanel}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="max-h-[360px] overflow-y-auto px-1 py-1">
              {isLoading ? (
                <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 text-[#6B4C35]">
                  <LoaderCircle className="animate-spin text-[#6B1218]" size={22} aria-hidden="true" />
                  <span className="text-xs">Đang tải thông báo...</span>
                </div>
              ) : null}

              {!isLoading && error ? (
                <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 px-4 text-center">
                  <AlertCircle className="text-[#8A1119]" size={22} aria-hidden="true" />
                  <strong className="text-xs text-[#8A1119]">Không tải được thông báo</strong>
                  <span className="text-[11px] text-[#6B4C35]">{error}</span>
                  <button
                    className="mt-2 rounded bg-[#6B1218] px-3 py-1 text-[11px] font-semibold text-[#F5F0E8] hover:bg-[#4A0C10]"
                    type="button"
                    onClick={() => void loadNotifications()}
                  >
                    Thử lại
                  </button>
                </div>
              ) : null}

              {!isLoading && !error && notifications.length === 0 ? (
                <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 text-[#6B4C35]">
                  <Inbox size={26} aria-hidden="true" />
                  <strong className="text-xs">Chưa có thông báo</strong>
                  <span className="text-[10px] text-[#6B4C35]/70">Các cập nhật đơn hàng sẽ xuất hiện tại đây.</span>
                </div>
              ) : null}

              {!isLoading && !error && notifications.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  {notifications.map((notification) => {
                    const isNew =
                      arrivalReferenceTime > 0 &&
                      arrivalReferenceTime - new Date(notification.created_at).getTime() < 15000;
                    return (
                      <article
                        key={notification.id}
                        onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                        className={`group relative flex cursor-pointer gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-[#6B1218]/5 hover:translate-x-0.5 hover:shadow-[0_2px_8px_rgba(107,18,24,0.04)] ${
                          notification.is_read ? "border-l-2 border-transparent pl-2.5" : "bg-[#6B1218]/[0.025] border-l-2 border-[#6B1218] pl-2.5"
                        } ${isNew ? "notification-item-new-arrival" : ""}`}
                      >
                        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          notification.is_read ? "bg-[#6B4C35]/8 text-[#6B4C35]" : "bg-[#6B1218]/10 text-[#6B1218]"
                        }`}>
                          <ShoppingBag size={17} aria-hidden="true" />
                        </span>
                        <div className="flex-1 pr-2">
                          <strong className={`block text-xs text-[#2C1810] group-hover:text-[#6B1218] transition-colors ${
                            notification.is_read ? "font-medium" : "font-bold"
                          }`}>
                            {notification.title}
                          </strong>
                          <p className="mt-1 text-[11px] leading-relaxed text-[#6B4C35]">
                            {notification.message}
                          </p>
                          <span className="mt-1.5 block text-[9px] text-[#6B4C35]/60">
                            {formatNotificationTime(notification.created_at)}
                          </span>
                        </div>
                        {!notification.is_read ? (
                          <span
                            className="notification-item-unread-dot absolute right-3.5 top-4 size-2 rounded-full bg-[#6B1218]"
                            aria-hidden="true"
                          />
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </section>
        </>,
        document.body
      ) : null}
    </div>
  );
}
