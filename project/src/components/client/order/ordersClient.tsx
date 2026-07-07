"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  ClientOrdersMeta,
  ClientOrderRecord,
  OrdersContentProps,
} from "@/src/lib/types/client";
import { getMyOrdersAction } from "@/src/lib/action/order.action";
import DetailOrder from "@/src/components/client/order/detailOrder";
import ClientPagination from "@/src/components/admin/customer/clientPagination";
import { useCartStore } from "@/src/store/useCartStore";
import LoadingState from "@/src/components/ui/loadingState";
import { callAction } from "@/src/lib/utils/callAction";

const statusLabel: Record<ClientOrderRecord["status"], string> = {
  canceled: "Đã huỷ",
  confirmed: "Đã xác nhận",
  pending: "Đang xác nhận",
};

const statusClass: Record<ClientOrderRecord["status"], string> = {
  canceled: "bg-[#2c1810]/10 text-[#6B4C35]",
  confirmed: "bg-[#45A05C]/15 text-[#1F6B3A]",
  pending: "bg-[#F4E2B7] text-[#8B5E3C]",
};

const pageSize = 10;
const initialMeta: ClientOrdersMeta = {
  limit: pageSize,
  page: 1,
  total: 0,
  totalPages: 1,
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);

export default function OrdersClient({ initialUser }: OrdersContentProps) {
  void initialUser;
  const setOrderCount = useCartStore((state) => state.setOrderCount);
  const [orders, setOrders] = useState<ClientOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<ClientOrdersMeta>(initialMeta);

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        const response = await callAction(() => getMyOrdersAction({
          limit: pageSize,
          page: currentPage,
        }), "Không thể tải đơn hàng của bạn. Vui lòng thử lại sau.");
        if (cancelled) return;

        if ("error" in response && response.error) {
          setError(response.error);
        } else if (response.success && response.data) {
          const fetchedOrders = response.data as ClientOrderRecord[];
          setOrders(fetchedOrders);
          setMeta(response.meta);
          setOrderCount(response.meta.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [currentPage, setOrderCount]);

  return (
    <main 
      className="min-h-screen text-[#F5F0E8] relative bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/assets/option_background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      
      <div className="relative z-10 pt-24">
        <section className="mx-auto w-full max-w-[908px] px-4 py-8 sm:px-6 md:py-10">
          <h2 className="relative mb-8 pb-3 font-serif text-[1.45rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#D6A15F] sm:text-[1.55rem]">
            Lịch Sử Đơn Hàng
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 px-4 py-8 sm:py-12 text-center shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
              <LoadingState type="default" label="Đang tải lịch sử đơn hàng..." className="border-0 bg-transparent shadow-none" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 px-4 py-12 text-center shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
              <div className="text-xl text-red-400 font-medium">{error}</div>
            </div>
          ) : orders.length > 0 ? (
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
                    {order.items.map((item, idx) => (
                      <div
                        key={`${order.id}-${item.name}-${idx}`}
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
                        <div className="font-sans text-[1rem] sm:text-[1.05rem] font-medium text-[#D6A15F] sm:text-right tracking-wide">
                          <span className="font-medium">x{item.quantity}</span> · {formatPrice(item.price)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#F5F0E8]/10 pt-5">
                    <button
                      onClick={() => setSelectedOrderNumber(order.id)}
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
              <ClientPagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                onChange={setCurrentPage}
              />
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

        {selectedOrderNumber && (
          <DetailOrder
            orderNumber={selectedOrderNumber}
            onClose={() => setSelectedOrderNumber(null)}
            onCancelSuccess={() => {
              setOrders((currentOrders) =>
                currentOrders.map((order) =>
                  order.id === selectedOrderNumber
                    ? { ...order, status: "canceled" }
                    : order,
                ),
              );
              setSelectedOrderNumber(null);
            }}
          />
        )}
      </div>
    </main>
  );
}
