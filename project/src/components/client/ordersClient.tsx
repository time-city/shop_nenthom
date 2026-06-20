"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  ClientOrdersMeta,
  ClientOrderRecord,
  OrdersContentProps,
} from "@/src/lib/types/client";
import { getMyOrdersAction } from "@/src/lib/action/order.action";
import DetailOrder from "@/src/components/client/detailOrder";
import ClientPagination from "@/src/components/admin/clientPagination";
import { useCartStore } from "@/src/store/useCartStore";

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
        const response = await getMyOrdersAction({
          limit: pageSize,
          page: currentPage,
        });
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
    <main className="min-h-[calc(100dvh-5rem)] bg-[#F2E8D9] text-[#2C1810]">
      <section className="mx-auto w-full max-w-[908px] px-4 py-8 sm:px-6 md:py-10">
        <h2 className="relative mb-8 pb-3 font-serif text-[1.45rem] font-bold text-[#2C1810] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#6B1218] sm:text-[1.55rem]">
          Lịch Sử Đơn Hàng
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#F8F0E4] px-4 py-12 text-center shadow-[0_4px_20px_rgba(44,24,16,0.07)]">
            <div className="text-xl text-[#6B4C35]">Đang tải lịch sử đơn hàng...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#F8F0E4] px-4 py-12 text-center shadow-[0_4px_20px_rgba(44,24,16,0.07)]">
            <div className="text-xl text-[#6B1218] font-medium">{error}</div>
          </div>
        ) : orders.length > 0 ? (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-[14px] bg-[#F8F0E4] p-5 shadow-[0_4px_20px_rgba(44,24,16,0.07)] sm:p-6"
              >
                <div className="flex flex-col gap-3 border-b border-[#6b4e35]/15 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-medium text-[#2C1810]">{order.id}</div>
                    <div className="mt-1 text-[0.85rem] font-light text-[#6B4C35]">
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
                        <div className="font-normal text-[#2C1810]">
                          {item.name}
                        </div>
                        {item.detail ? (
                          <div className="mt-1 text-[0.85rem] font-light italic text-[#6B4C35]">
                            {item.detail}
                          </div>
                        ) : null}
                      </div>
                      <div className="font-serif text-base font-bold text-[#6B1218] sm:text-right">
                        x{item.quantity} · {formatPrice(item.price)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={() => setSelectedOrderNumber(order.id)}
                    type="button"
                    className="w-full rounded-full border-[1.5px] border-[#6B1218] bg-transparent px-4 py-2.5 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-[#6B1218] transition hover:bg-[#6B1218] hover:text-[#F5F0E8] sm:w-auto"
                  >
                    Xem chi tiết
                  </button>
                  <div className="flex items-baseline justify-between gap-2 sm:justify-end">
                    <span className="font-light text-[#6B4C35]">Tổng</span>
                    <span className="font-serif text-lg font-bold text-[#6B1218]">
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
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#F8F0E4] px-4 py-12 text-center shadow-[0_4px_20px_rgba(44,24,16,0.07)]">
            <div className="text-5xl opacity-60">📦</div>
            <div className="font-serif text-xl font-light italic text-[#6B4C35]">
              Bạn chưa có đơn hàng nào
            </div>
            <Link
              href="/#collection"
              className="rounded-full bg-[#6B1218] px-6 py-3 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] no-underline"
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
    </main>
  );
}
