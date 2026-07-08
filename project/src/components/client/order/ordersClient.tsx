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
        <section className="mx-auto w-full max-w-[908px] px-4 py-8 sm:px-6 md:py-10">
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
                  className="overflow-hidden rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] sm:p-6"
                >
                  <div className="flex flex-col gap-3 border-b border-[#F5F0E8]/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-bold text-[#F5F0E8] tracking-wide text-sm">{order.id}</div>
                      <div className="mt-1 text-[0.82rem] font-light text-[#F5F0E8]/55">
                        {order.date}
                      </div>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3.5 py-1.5 text-[0.76rem] font-semibold tracking-wide ${statusClass[order.status]}`}
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
