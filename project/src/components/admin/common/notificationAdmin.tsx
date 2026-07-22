"use client";

import {
  AlertCircle,
  Bell,
  Headphones,
  Inbox,
  LoaderCircle,
  ShoppingBag,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  getAdminNotificationsAction,
  markAdminNotificationAsReadAction,
  markAllAdminNotificationsAsReadAction,
} from "@/src/lib/action/notification.action";
import type { AdminNotification } from "@/src/lib/types/admin";
import { callAction } from "@/src/lib/utils/callAction";
import { useToast } from "@/src/components/ui/toastProvider";

type NotificationAdminProps = {
  pendingOrdersCount?: number;
  pendingSupportCount?: number;
  variant?: "sidebar" | "header";
};

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

export default function NotificationAdmin({
  pendingOrdersCount = 0,
  pendingSupportCount = 0,
  variant = "sidebar",
}: NotificationAdminProps) {
  const { toast } = useToast();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [arrivalReferenceTime, setArrivalReferenceTime] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
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
      const result = await callAction(() => getAdminNotificationsAction({
        limit: 30,
        page: 1,
      }), "Không thể tải thông báo quản trị. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        setError(result.error);
        setNotifications([]);
        setUnreadNotificationCount(0);
        return;
      }

      if ("success" in result && result.success) {
        setNotifications(result.data);
        setUnreadNotificationCount(result.meta.unreadCount);
        setArrivalReferenceTime(Date.now());
      }
    } catch {
      setError("Không thể tải thông báo. Vui lòng thử lại.");
      setNotifications([]);
      setUnreadNotificationCount(0);
    } finally {
      if (!options.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );
    setUnreadNotificationCount((prev) => Math.max(0, prev - 1));

    try {
      const result = await callAction(
        () => markAdminNotificationAsReadAction(id),
        "Không thể cập nhật trạng thái thông báo."
      );
      if ("error" in result && result.error) {
        void loadNotifications();
      }
    } catch {
      void loadNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true }))
    );
    setUnreadNotificationCount(0);

    try {
      const result = await callAction(
        () => markAllAdminNotificationsAsReadAction(),
        "Không thể cập nhật trạng thái thông báo."
      );
      if ("error" in result && result.error) {
        void loadNotifications();
      }
    } catch {
      void loadNotifications();
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadNotifications]);

  useEffect(() => {
    const handleConnected = (event: Event) => {
      const customEvent = event as CustomEvent<{ pendingContactCount: number; unreadNotificationCount: number }>;
      if (customEvent.detail) {
        setUnreadNotificationCount(customEvent.detail.unreadNotificationCount);
      }
    };

    const handleNewOrder = (event: Event) => {
      const customEvent = event as CustomEvent<{
        notification?: {
          id: string;
          type: string;
          title: string;
          message: string;
          isRead: boolean;
          createdAt: string;
        };
        unreadNotificationCount?: number;
      }>;

      const detail = customEvent.detail;
      if (!detail) return;

      // Update count
      if (detail.unreadNotificationCount !== undefined) {
        setUnreadNotificationCount(detail.unreadNotificationCount);
      } else {
        setUnreadNotificationCount((prev) => prev + 1);
      }

      // Prepend notification
      if (detail.notification) {
        const newNoti: AdminNotification = {
          id: detail.notification.id,
          title: detail.notification.title,
          message: detail.notification.message,
          type: detail.notification.type,
          is_read: detail.notification.isRead,
          created_at: detail.notification.createdAt,
        };
        setNotifications((prev) => [newNoti, ...prev]);
        setArrivalReferenceTime(Date.now());

        // Push toast to admin
        toast.info({
          title: detail.notification.title,
          message: detail.notification.message,
        });
      }

      void loadNotifications({ silent: true });
    };

    window.addEventListener("admin-socket-connected", handleConnected);
    window.addEventListener("admin-socket-new-order", handleNewOrder);

    return () => {
      window.removeEventListener("admin-socket-connected", handleConnected);
      window.removeEventListener("admin-socket-new-order", handleNewOrder);
    };
  }, [loadNotifications, toast]);

  useEffect(() => {
    if (!isNotificationOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (
        rootRef.current &&
        !rootRef.current.contains(target) &&
        !target.closest(".notification-admin-overlay") &&
        !target.closest(".notification-admin-panel") &&
        !target.closest(".notification-admin-mobile-trigger")
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

  const totalBadgeCount =
    Math.max(unreadNotificationCount, pendingOrdersCount) + pendingSupportCount;
  const hasSummary =
    pendingOrdersCount > 0 || pendingSupportCount > 0;
  const isEmpty = !hasSummary && notifications.length === 0;
  const panelId = "admin-notification-panel";

  const triggerLabel = useMemo(
    () =>
      totalBadgeCount > 0
        ? `Thông báo, ${totalBadgeCount} mục chưa xử lý`
        : "Thông báo",
    [totalBadgeCount],
  );

  const togglePanel = () => {
    if (isNotificationOpen) {
      closePanel();
    } else {
      setIsNotificationOpen(true);
      void loadNotifications();
    }
  };

  return (
    <div className="notification-admin-root" ref={rootRef}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .notification-admin-overlay.is-closing {
          animation: notification-admin-overlay-out 0.2s ease both !important;
        }
        .notification-admin-panel.is-closing {
          animation: notification-admin-slide-out-sidebar 0.25s ease both !important;
        }

        @keyframes notification-admin-overlay-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes notification-admin-slide-out-sidebar {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-28px); }
        }

        @media (max-width: 1023px) {
          .notification-admin-panel {
            transform-origin: top right;
            background-color: rgba(255, 253, 249, 0.96) !important;
            backdrop-filter: blur(8px) !important;
            box-shadow: 0 12px 40px rgba(44, 24, 16, 0.16) !important;
            border-radius: 18px !important;
          }
          .notification-admin-panel.is-open {
            animation: notification-admin-slide-in-mobile 0.25s cubic-bezier(0.34, 1.25, 0.64, 1) both !important;
          }
          .notification-admin-panel.is-closing {
            animation: notification-admin-slide-out-mobile 0.2s ease both !important;
          }
        }

        @keyframes notification-admin-slide-in-mobile {
          from { opacity: 0; transform: translateY(-10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes notification-admin-slide-out-mobile {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-10px) scale(0.96); }
        }

        .notification-admin-item-new-arrival {
          animation: notification-admin-item-flash 3s cubic-bezier(0.25, 1, 0.5, 1) both;
        }
        @keyframes notification-admin-item-flash {
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
      {variant === "sidebar" ? (
        <button
          className={`admin-sidebar-link notification-admin-sidebar-trigger${isNotificationOpen ? " active" : ""
            }`}
          type="button"
          aria-controls={panelId}
          aria-expanded={isNotificationOpen}
          aria-haspopup="dialog"
          onClick={togglePanel}
        >
          <Bell className="admin-sidebar-icon" aria-hidden="true" />
          <span>Thông báo</span>
          {totalBadgeCount > 0 ? (
            <span className="admin-sidebar-badge">
              {formatBadge(totalBadgeCount)}
            </span>
          ) : null}
        </button>
      ) : (
        <button
          className="notification-admin-mobile-trigger"
          type="button"
          aria-label={triggerLabel}
          aria-controls={panelId}
          aria-expanded={isNotificationOpen}
          aria-haspopup="dialog"
          onClick={togglePanel}
        >
          <Bell size={21} aria-hidden="true" />
          {totalBadgeCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6B1218] px-1 text-[9px] font-bold text-white leading-none">
              {formatBadge(totalBadgeCount)}
            </span>
          ) : null}
        </button>
      )}

      {isNotificationOpen && mounted ? createPortal(
        <>
          <div
            className={`notification-admin-overlay ${isClosing ? "is-closing" : ""}`}
            aria-hidden="true"
            onClick={closePanel}
          />
          <section
            className={`notification-admin-panel is-open ${isClosing ? "is-closing" : ""}`}
            id={panelId}
            role="dialog"
            aria-label="Thông báo admin"
          >
            <header className="notification-admin-header">
              <div>
                <h2>Thông báo</h2>
                <p>
                  {totalBadgeCount > 0
                    ? `${totalBadgeCount} mục chưa xử lý`
                    : "Cập nhật mới nhất của cửa hàng"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                {unreadNotificationCount > 0 ? (
                  <button
                    className="text-[11px] font-semibold text-[#6B1218] hover:underline"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    type="button"
                    onClick={handleMarkAllAsRead}
                  >
                    Đọc tất cả
                  </button>
                ) : null}
                <button
                  className="notification-admin-close"
                  type="button"
                  aria-label="Đóng thông báo"
                  onClick={closePanel}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="notification-admin-content">
              {isLoading ? (
                <div className="notification-admin-state">
                  <LoaderCircle
                    className="notification-admin-spinner"
                    size={24}
                    aria-hidden="true"
                  />
                  <span>Đang tải thông báo...</span>
                </div>
              ) : null}

              {!isLoading && error ? (
                <div className="notification-admin-state is-error">
                  <AlertCircle size={25} aria-hidden="true" />
                  <strong>Không tải được thông báo</strong>
                  <span>{error}</span>
                  <button type="button" onClick={() => void loadNotifications()}>
                    Thử lại
                  </button>
                </div>
              ) : null}

              {!isLoading && !error && isEmpty ? (
                <div className="notification-admin-state">
                  <Inbox size={29} aria-hidden="true" />
                  <strong>Chưa có thông báo</strong>
                  <span>Các cập nhật mới sẽ xuất hiện tại đây.</span>
                </div>
              ) : null}

              {!isLoading && !error && !isEmpty ? (
                <div className="notification-admin-list">
                  {pendingOrdersCount > 0 ? (
                    <article
                      className="notification-admin-item is-summary"
                      onClick={() => {
                        closePanel();
                        router.push("/admin/ordersManagement");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="notification-admin-item-icon is-order">
                        <ShoppingBag size={19} aria-hidden="true" />
                      </span>
                      <div className="notification-admin-item-body">
                        <strong>Đơn hàng chờ xác nhận</strong>
                        <p>
                          Có {pendingOrdersCount} đơn hàng đang chờ admin xác
                          nhận.
                        </p>
                        <span>Cần xử lý</span>
                      </div>
                      <i aria-hidden="true" />
                    </article>
                  ) : null}

                  {pendingSupportCount > 0 ? (
                    <article
                      className="notification-admin-item is-summary"
                      onClick={() => {
                        closePanel();
                        router.push("/admin/support"); 
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="notification-admin-item-icon is-support">
                        <Headphones size={19} aria-hidden="true" />
                      </span>
                      <div className="notification-admin-item-body">
                        <strong>Yêu cầu hỗ trợ mới</strong>
                        <p>
                          Có {pendingSupportCount} yêu cầu đang chờ xác nhận
                          hoặc xử lý.
                        </p>
                        <span>Cần phản hồi</span>
                      </div>
                      <i aria-hidden="true" />
                    </article>
                  ) : null}

                  {notifications.map((notification) => {
                    const isNew =
                      arrivalReferenceTime > 0 &&
                      arrivalReferenceTime - new Date(notification.created_at).getTime() < 15000;
                    return (
                      <article
                        key={notification.id}
                        className={`notification-admin-item ${
                          !notification.is_read ? "is-unread" : ""
                        }`}
                        onClick={() => {
                          if (!notification.is_read) {
                            handleMarkAsRead(notification.id);
                          }
                          if (notification.type === "ORDER") {
                            router.push("/admin/ordersManagement");
                          }
                          // Add more routing logic based on type if needed
                        }}
                      >
                        <span className="notification-admin-item-icon is-order">
                          <ShoppingBag size={19} aria-hidden="true" />
                        </span>
                        <div className="notification-admin-item-body">
                          <strong>{notification.title}</strong>
                          <p>{notification.message}</p>
                          <span>
                            {formatNotificationTime(notification.created_at)}
                          </span>
                        </div>
                        {!notification.is_read ? <i aria-hidden="true" /> : null}
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
