"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import useSWR from "swr";
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
  pending: "Đang chờ xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao thành công",
  cancel_requested: "Chờ duyệt huỷ",
};

const statusClass: Record<ClientOrderRecord["status"], string> = {
  canceled: "bg-red-500/15 text-red-300 border border-red-400/25",
  pending: "bg-amber-500/20 text-amber-300 border border-amber-400/30",
  processing: "bg-amber-500/20 text-amber-300 border border-amber-400/30",
  shipped: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
  delivered: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
  cancel_requested: "bg-red-900/40 text-red-300 border border-red-400/30",
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
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: response, error: swrError, isLoading, mutate } = useSWR(
    ['my-orders', currentPage],
    async () => {
      console.log("[Data Source] 🟡 NETWORK QUERY - ordersClient: Fetching orders from server API...");
      return await callAction(() => getMyOrdersAction({
        limit: pageSize,
        page: currentPage,
      }), "Không thể tải đơn hàng của bạn. Vui lòng thử lại sau.");
    }
  );

  useEffect(() => {
    if (response && "data" in response) {
      console.log(`[Data Source] 🟢 UI UPDATED - ordersClient: Displaying ${(response.data as ClientOrderRecord[])?.length || 0} orders (from SWR Cache or Network)`);
    }
  }, [response]);

  useEffect(() => {
    const handleOrderStatusUpdated = () => {
      void mutate();
    };
    window.addEventListener("user-socket-order-status-updated", handleOrderStatusUpdated);
    window.addEventListener("user-socket-order-cancelled", handleOrderStatusUpdated);
    return () => {
      window.removeEventListener("user-socket-order-status-updated", handleOrderStatusUpdated);
      window.removeEventListener("user-socket-order-cancelled", handleOrderStatusUpdated);
    };
  }, [mutate]);

  const orders = response && "success" in response && response.success && "data" in response ? (response.data as ClientOrderRecord[]) : [];
  const meta = response && "success" in response && response.success && "meta" in response ? response.meta : initialMeta;
  const displayError = swrError ? (swrError instanceof Error ? swrError.message : String(swrError)) : (response && "error" in response ? response.error : null);

  useEffect(() => {
    if (meta.total > 0) {
      setOrderCount(meta.total);
    }
  }, [meta.total, setOrderCount]);

  return (
    <main
      className="min-h-screen text-[#F5F0E8] relative bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/assets/option_background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <div className="relative z-10 pt-24">
        <section className="mx-auto w-full max-w-[1024px] px-2 py-8 sm:px-4 md:py-10">
          <h2 className="relative mb-8 pb-3 font-serif text-[1.45rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#D6A15F] sm:text-[1.55rem]">
            Lịch Sử Đơn Hàng
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 px-4 py-8 sm:py-12 text-center shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
              <LoadingState type="default" label="Đang tải lịch sử đơn hàng..." className="border-0 bg-transparent shadow-none" />
            </div>
          ) : displayError ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 px-4 py-12 text-center shadow-[0_16px_36px_rgba(0,0,0,0.5)]">
              <div className="text-xl text-red-400 font-medium">{displayError}</div>
            </div>
          ) : orders.length > 0 ? (
            <div className="flex flex-col gap-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  onClick={() => setSelectedOrderNumber(order.id)}
                  className="group cursor-pointer relative overflow-hidden rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#D6A15F]/40 hover:shadow-[0_20px_40px_rgba(214,161,95,0.15)]"
                >
                  {/* Luminous Glow Effect */}
                  <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#D6A15F] opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-20 pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col gap-3 border-b border-[#F5F0E8]/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-bold text-[#F5F0E8] tracking-wide text-sm">{order.id}</div>
                      <div className="mt-1 text-[0.82rem] font-light text-[#F5F0E8]/55">
                        {order.date}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 mt-2 sm:mt-0">
                      {order.paymentStatus && (
                        <span
                          className={`w-fit rounded-full px-3.5 py-1.5 text-[0.76rem] font-semibold tracking-wide border ${order.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-300 border-green-400/30' : 'bg-orange-500/20 text-orange-300 border-orange-400/30'}`}
                        >
                          {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      )}
                      <span
                        className={`w-fit rounded-full px-3.5 py-1.5 text-[0.76rem] font-semibold tracking-wide flex items-center gap-2 ${statusClass[order.status]}`}
                      >
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                          </span>
                        )}
                        {statusLabel[order.status]}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col gap-3 pt-4">
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

                  <div className="relative z-10 mt-5 flex items-center justify-between border-t border-[#F5F0E8]/10 pt-5">
                    <div className="flex items-center gap-2 text-[#F5F0E8]/40 transition-colors group-hover:text-[#D6A15F]">
                      <span className="text-[0.8rem] font-light italic">Nhấn vào card để xem chi tiết</span>
                      <svg className="size-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <div className="flex items-end justify-end">
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

      </div>

      {selectedOrderNumber && (
        <DetailOrder
          orderNumber={selectedOrderNumber}
          onClose={() => setSelectedOrderNumber(null)}
          onCancelSuccess={() => {
            void mutate();
            setSelectedOrderNumber(null);
          }}
        />
      )}
    </main>
  );
}
