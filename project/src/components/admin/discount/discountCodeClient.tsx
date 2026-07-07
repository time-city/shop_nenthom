"use client";

import { Plus } from "lucide-react";
import { startTransition, useCallback, useEffect, useState } from "react";
import { useToast } from "@/src/components/ui/toastProvider";
import dynamic from "next/dynamic";
import ModalDeleteProduct from "@/src/components/admin/product/modalDeleteProduct";
const ModalDiscount = dynamic(() => import("@/src/components/admin/discount/modalDiscount"), { ssr: false });
const ModalEditDiscount = dynamic(() => import("@/src/components/admin/discount/modalEditDiscount"), { ssr: false });
import LoadingState from "@/src/components/ui/loadingState";
import TableResponsiveWrapper from "@/src/components/admin/common/tableResponsiveWrapper";
import AdminHeader from "@/src/components/admin/layout/adminHeader";
import { AdminEditButton } from "@/src/components/ui/actionButtons";
import { disableDiscountAction, getDiscountsAction } from "@/src/lib/action/discount.action";
import type {
  AdminDiscountItem,
  AdminDiscountsSuccessResponse,
} from "@/src/lib/types/admin";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { callAction } from "@/src/lib/utils/callAction";

const formatValue = (item: AdminDiscountItem) => {
  if (item.type === "PERCENTAGE") return `${item.discount_amount_cents}%`;
  return new Intl.NumberFormat("vi-VN").format(item.discount_amount_cents) + " đ";
};

const formatDate = (date: Date | null) => {
  if (!date) return "Không giới hạn";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

export default function DiscountCodeClient() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDiscount, setEditDiscount] = useState<AdminDiscountItem | null>(null);
  const [disableDiscount, setDisableDiscount] = useState<AdminDiscountItem | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [discounts, setDiscounts] = useState<AdminDiscountItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDiscounts = useCallback(async (cancelledRef?: { current: boolean }) => {
    setIsLoading(true);

    const result = await callAction(() => getDiscountsAction({ limit: 100, page: 1 }), "Không thể tải danh sách mã giảm giá. Vui lòng thử lại sau.");
    if (cancelledRef?.current) return;

    if ("error" in result && result.error) {
      const friendlyErr = getFriendlyResponseError(result.error);
      setError(friendlyErr);
      toast.error(friendlyErr);
      setDiscounts([]);
      setIsLoading(false);
      return;
    }

    if ("success" in result && result.success) {
      const response = result as unknown as AdminDiscountsSuccessResponse;
      setError("");
      setDiscounts(response.data);
    }

    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    const cancelled = { current: false };
    startTransition(() => {
      void loadDiscounts(cancelled);
    });
    return () => {
      cancelled.current = true;
    };
  }, [loadDiscounts]);

  const handleDisable = async () => {
    if (!disableDiscount) return;
    setIsDisabling(true);

    const result = await callAction(() => disableDiscountAction({ id: disableDiscount.id }), "Không thể tắt mã giảm giá. Vui lòng thử lại sau.");

    if ("error" in result && result.error) {
      toast.error(getFriendlyResponseError(result.error));
      setIsDisabling(false);
      return;
    }

    if ("success" in result && result.success) {
      toast.success("Đã vô hiệu hóa mã giảm giá");
      setDisableDiscount(null);
      await loadDiscounts();
    }

    setIsDisabling(false);
  };

  const stopRowClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <>
      <AdminHeader
        title="Mã Giảm giá"
        subtitle="Quản lý coupon và khuyến mãi"
      >
        <button
          className="product-btn product-btn-primary"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Thêm mã giảm giá</span>
        </button>
      </AdminHeader>

      <div className="dashboard-page-content">
        <section className="dashboard-card product-table-card">
          <div className="dashboard-card-body no-padding">
            <div className="dashboard-table-wrapper">
              <TableResponsiveWrapper minWidth={900}>
                <table className="dashboard-admin-table">
                  <thead>
                    <tr>
                      <th>Mã code</th>
                      <th>Loại giảm</th>
                      <th>Giá trị</th>
                      <th>Đã dùng / Tối đa</th>
                      <th>Ngày hết hạn</th>
                      <th>Trạng thái</th>
                      <th className="product-action-col">
                        <span className="sr-only">Thao tác</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isLoading && !error && discounts.map((discount) => (
                      <tr
                        key={discount.id}
                        className="transition hover:bg-[#6B1218]/[0.03]"
                      >
                        <td>
                          <span className="rounded-md bg-[#F2E8D9] px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-[#6B1218]">
                            {discount.code}
                          </span>
                        </td>

                        <td>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            discount.type === "PERCENTAGE"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {discount.type === "PERCENTAGE" ? "Phần trăm" : "Số tiền cố định"}
                          </span>
                        </td>

                        <td className="orders-table-amount">
                          {formatValue(discount)}
                        </td>

                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{discount.used_count}</span>
                            <span className="text-white/60">/</span>
                            <span className="text-white/60">{discount.max_uses}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-[#6B4E35]/15">
                            <div
                              className="h-full rounded-full bg-[#6B1218]"
                              style={{
                                width: `${Math.min((discount.used_count / discount.max_uses) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </td>

                        <td>
                          <span className="text-sm text-white/60">{formatDate(discount.expires_at)}</span>
                        </td>

                        <td>
                          {discount.is_active ? (
                            <span className="dashboard-status completed">Đang hoạt động</span>
                          ) : (
                            <span className="dashboard-status cancelled">Đã vô hiệu</span>
                          )}
                        </td>

                        <td>
                          <div className="product-row-actions">
                            <AdminEditButton
                              ariaLabel={`Sửa mã ${discount.code}`}
                              onClick={(event) => {
                                stopRowClick(event);
                                setEditDiscount(discount);
                              }}
                            />

                            {discount.is_active ? (
                              <button
                                className="orders-icon-btn product-danger-btn"
                                type="button"
                                aria-label={`Vô hiệu hóa mã ${discount.code}`}
                                onClick={(event) => {
                                  stopRowClick(event);
                                  setDisableDiscount(discount);
                                }}
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
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                </svg>
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-5">
                          <LoadingState type="table" label="Đang tải danh sách mã giảm giá..." />
                        </td>
                      </tr>
                    ) : null}

                    {!isLoading && error ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-sm text-[#8A1119]">
                          {error}
                        </td>
                      </tr>
                    ) : null}

                    {!isLoading && !error && discounts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center text-sm text-white/60">
                          Chưa có dữ liệu mã giảm giá
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </TableResponsiveWrapper>
            </div>
          </div>
        </section>
      </div>

      <ModalDiscount
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={loadDiscounts}
      />

      <ModalEditDiscount
        open={Boolean(editDiscount)}
        discount={editDiscount}
        onClose={() => setEditDiscount(null)}
        onSave={loadDiscounts}
      />

      <ModalDeleteProduct
        open={Boolean(disableDiscount)}
        itemName={disableDiscount?.code}
        isDeleting={isDisabling}
        title="Vô hiệu hóa mã giảm giá?"
        confirmLabel="Vô hiệu hóa"
        loadingLabel="Đang xử lý..."
        description={`Mã "${disableDiscount?.code ?? ""}" sẽ không còn sử dụng được nữa. Thao tác này không thể hoàn tác.`}
        onClose={() => setDisableDiscount(null)}
        onConfirm={handleDisable}
      />
    </>
  );
}
