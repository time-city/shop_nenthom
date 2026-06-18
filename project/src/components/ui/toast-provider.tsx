"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastType = "success" | "error" | "info" | "warning";

type ToastItem = {
  exiting?: boolean;
  id: number;
  message: string;
  title: string;
  type: ToastType;
};

type ToastInput = string | { message?: string; title?: string };

type ToastApi = Record<ToastType, (input: ToastInput) => void>;

type ToastContextValue = {
  toast: ToastApi;
};

const AUTO_DISMISS_MS = 3000;

const toastMeta: Record<
  ToastType,
  {
    accent: string;
    className: string;
    defaultTitle: string;
    icon: ReactNode;
  }
> = {
  success: {
    accent: "#A0404A",
    className: "toast-custom-success",
    defaultTitle: "Thành công",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
  },
  error: {
    accent: "#6B1218",
    className: "toast-custom-error",
    defaultTitle: "Có lỗi xảy ra",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    ),
  },
  info: {
    accent: "#6B1218",
    className: "toast-custom-info",
    defaultTitle: "Thông báo",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  warning: {
    accent: "#8B2020",
    className: "toast-custom-warning",
    defaultTitle: "Lưu ý",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 10 18H2L12 3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
};

const ToastContext = createContext<ToastContextValue | null>(null);

const normalizeToastInput = (input: ToastInput, type: ToastType) => {
  if (typeof input === "string") {
    return {
      message: input,
      title: toastMeta[type].defaultTitle,
    };
  }

  return {
    message: input.message ?? "",
    title: input.title ?? toastMeta[type].defaultTitle,
  };
};

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timerRef = useRef<Map<number, number>>(new Map());

  const removeToast = useCallback((id: number) => {
    const timer = timerRef.current.get(id);
    if (timer) window.clearTimeout(timer);
    timerRef.current.delete(id);

    setToasts((current) =>
      current.map((item) =>
        item.id === id ? { ...item, exiting: true } : item,
      ),
    );

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 220);
  }, []);

  const pushToast = useCallback(
    (type: ToastType, input: ToastInput) => {
      const id = idRef.current + 1;
      idRef.current = id;

      const nextToast: ToastItem = {
        id,
        type,
        ...normalizeToastInput(input, type),
      };

      setToasts((current) => [nextToast, ...current].slice(0, 5));

      const timer = window.setTimeout(() => {
        removeToast(id);
      }, AUTO_DISMISS_MS);
      timerRef.current.set(id, timer);
    },
    [removeToast],
  );

  const toast = useMemo<ToastApi>(
    () => ({
      error: (input) => pushToast("error", input),
      info: (input) => pushToast("info", input),
      success: (input) => pushToast("success", input),
      warning: (input) => pushToast("warning", input),
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-custom-container" aria-live="polite" aria-atomic="true">
        {toasts.map((item) => {
          const meta = toastMeta[item.type];

          return (
            <div
              key={item.id}
              className={`toast-custom ${meta.className} ${
                item.exiting ? "toast-custom-exit" : ""
              }`}
              role={item.type === "error" ? "alert" : "status"}
            >
              <div className="toast-custom-icon">{meta.icon}</div>
              <div className="toast-custom-content">
                <div className="toast-custom-title">{item.title}</div>
                {item.message ? (
                  <div className="toast-custom-message">{item.message}</div>
                ) : null}
              </div>
              <button
                type="button"
                className="toast-custom-close"
                onClick={() => removeToast(item.id)}
                aria-label="Đóng thông báo"
              >
                ×
              </button>
              <div
                className="toast-custom-progress"
                style={{ backgroundColor: meta.accent }}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
