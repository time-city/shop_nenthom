"use client";

import type {
  AdminDeleteButtonProps,
  AdminEditButtonProps,
} from "../../lib/types/admin";

export function AdminEditButton({
  onClick,
  title,
  ariaLabel = "Sửa",
  disabled = false,
}: AdminEditButtonProps) {
  return (
    <button
      className="orders-icon-btn"
      type="button"
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </button>
  );
}

export function AdminDeleteButton({
  onClick,
  title,
  ariaLabel = "Xóa",
  disabled = false,
}: AdminDeleteButtonProps) {
  return (
    <button
      className="orders-icon-btn product-danger-btn"
      type="button"
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  );
}
