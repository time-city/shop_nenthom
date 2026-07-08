"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  ClientOrderRecord,
  ClientOrderUserData,
  OrdersHeaderProps,
} from "../../../lib/types/client";

const defaultUser: Required<ClientOrderUserData> = {
  email: "",
  fullname: "",
  phone: "",
  role: "",
};


const statusLabel: Record<ClientOrderRecord["status"], string> = {
  canceled: "Đã hủy",
  pending: "Đang chờ xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao thành công",
  cancel_requested: "Chờ duyệt hủy",
};

const statusClass: Record<ClientOrderRecord["status"], string> = {
  canceled: "bg-[#2c1810]/10 text-[#6B4C35]",
  pending: "bg-[#F4E2B7] text-[#8B5E3C]",
  processing: "bg-[#F4E2B7] text-[#8B5E3C]",
  shipped: "bg-[#45A05C]/15 text-[#1F6B3A]",
  delivered: "bg-[#45A05C]/15 text-[#1F6B3A]",
  cancel_requested: "bg-red-950/40 text-red-400 border border-red-500/20",
};


const readUser = () => {
  try {
    if (typeof window === "undefined") {
      return defaultUser;
    }

    const stored = localStorage.getItem("lumiere-user");
    const localUser: ClientOrderUserData = {};
    const email = localStorage.getItem("email");
    const fullname = localStorage.getItem("fullname");
    const phone = localStorage.getItem("phone");

    if (email) {
      localUser.email = email;
    }

    if (fullname) {
      localUser.fullname = fullname;
    }

    if (phone) {
      localUser.phone = phone;
    }

    if (!stored) {
      return { ...defaultUser, ...localUser };
    }

    return { ...defaultUser, ...(JSON.parse(stored) as ClientOrderUserData), ...localUser };
  } catch {
    return defaultUser;
  }
};

const readOrders = () => {
  try {
    if (typeof window === "undefined") {
      return [];
    }

    const stored = localStorage.getItem("lumiere-orders");

    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as ClientOrderRecord[];
  } catch {
    return [];
  }
};

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "CC";
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);

function OrdersHeader({ user }: OrdersHeaderProps) {
  const initials = useMemo(() => getInitials(user.fullname), [user.fullname]);

  return (
    <div className="flex flex-col gap-5 bg-black/40 backdrop-blur-md border-b border-[#F5F0E8]/10 px-5 py-7 text-[#F5F0E8] sm:px-8 md:flex-row md:items-center md:justify-between md:gap-8 md:px-12 lg:px-16">
      <div className="flex min-w-0 items-center gap-4 sm:gap-5">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-full border border-[#D6A15F]/50 bg-gradient-to-br from-[#D6A15F]/20 to-black/40 font-serif text-xl font-bold text-[#D6A15F] shadow-[0_8px_18px_rgba(0,0,0,0.25)] sm:size-[72px]"
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate font-serif text-[1.35rem] font-bold leading-tight text-[#F5F0E8] sm:text-2xl">
            {user.fullname || "Tài khoản"}
          </div>
          {user.email ? (
            <div className="mt-1 truncate text-[0.82rem] font-light text-[#F5F0E8]/70 sm:text-[0.85rem]">
              {user.email}
            </div>
          ) : null}
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#D6A15F]/30 bg-black/30 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[#D6A15F]">
            <span className="text-sm">✦</span>
            Thành viên
          </div>
        </div>
      </div>

      <div className="flex w-full gap-2 overflow-x-auto md:w-auto md:justify-end">
        <Link
          href="/profile"
          className="shrink-0 rounded-t-xl border-b-2 border-transparent px-4 py-3 text-center text-[0.78rem] font-normal tracking-[0.08em] text-[#F5F0E8]/60 transition-colors hover:text-[#F5F0E8] sm:text-[0.85rem]"
        >
          Thông Tin Cá Nhân
        </Link>
        <Link
          href="/orders"
          className="shrink-0 rounded-t-xl border-b-2 border-[#D6A15F] bg-[#D6A15F]/10 px-4 py-3 text-center text-[0.78rem] font-normal tracking-[0.08em] text-[#D6A15F] transition-colors sm:text-[0.85rem]"
        >
          Lịch Sử Đơn Hàng
        </Link>
      </div>
    </div>
  );
}

export default function Orders() {
  const [user] = useState<Required<ClientOrderUserData>>(() => readUser());
  const [orders] = useState<ClientOrderRecord[]>(() => readOrders());

  return (
    <main 
      className="min-h-screen text-[#F5F0E8] relative bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/assets/option_background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      
      <div className="relative z-10 pt-24">
        <OrdersHeader user={user} />

        <section className="mx-auto w-full max-w-[908px] px-4 py-8 sm:px-6 md:py-10">
          <h2 className="relative mb-8 pb-3 font-serif text-[1.45rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#D6A15F] sm:text-[1.55rem]">
            Lịch Sử Đơn Hàng
          </h2>

          {orders.length > 0 ? (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] sm:p-6"
                >
                  <div className="flex flex-col gap-3 border-b border-[#F5F0E8]/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-medium text-[#F5F0E8]">{order.id}</div>
                      <div className="mt-1 text-[0.85rem] font-light text-[#F5F0E8]/60">
                        {order.date}
                      </div>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-[0.75rem] font-medium ${statusClass[order.status]}`}
                    >
                      {statusLabel[order.status]}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    {order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.name}`}
                        className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4"
                      >
                        <div>
                          <div className="font-normal text-[#F5F0E8]/90">
                            {item.name}
                          </div>
                          {item.detail ? (
                            <div className="mt-1 text-[0.85rem] font-light italic text-[#F5F0E8]/50">
                              {item.detail}
                            </div>
                          ) : null}
                        </div>
                        <div className="font-sans text-base font-medium text-[#D6A15F] sm:text-right tracking-wide">
                          x{item.quantity} · {formatPrice(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#F5F0E8]/10 pt-5">
                    <button
                      type="button"
                      className="w-full rounded-full border border-[#D6A15F]/50 bg-transparent px-5 py-2.5 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-[#D6A15F] transition hover:bg-[#D6A15F] hover:text-[#2C1810] sm:w-auto"
                    >
                      Xem chi tiết
                    </button>
                    <div className="flex items-end justify-between gap-3 sm:justify-end">
                      <span className="font-light text-[#F5F0E8]/70 mb-1">Tổng</span>
                      <span className="font-sans text-[1.4rem] font-bold text-[#D6A15F] leading-none tracking-wide">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 px-4 py-16 text-center shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
              <div className="text-5xl opacity-80">🛍</div>
              <div className="font-serif text-xl font-light italic text-[#F5F0E8]/70">
                Bạn chưa có đơn hàng nào
              </div>
              <Link
                href="/#collection"
                className="rounded-full bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] px-8 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#2C1810] no-underline shadow-[0_10px_24px_rgba(214,161,95,0.3)] transition hover:-translate-y-0.5"
              >
                Khám Phá Bộ Sưu Tập
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
