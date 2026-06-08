"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import ModalDiscount from "../../../components/admin/modalDiscount";

const coupons = [
  {
    code: "WELCOME10",
    discountType: "Phần trăm",
    value: "10%",
    usage: "24 / 100",
    expiredAt: "31/12/2024",
    status: "Đang hoạt động",
    statusType: "completed",
  },
  {
    code: "FREESHIP50",
    discountType: "Cố định",
    value: "50.000 đ",
    usage: "48 / 80",
    expiredAt: "25/12/2024",
    status: "Đang hoạt động",
    statusType: "completed",
  },
  {
    code: "VIP20",
    discountType: "Phần trăm",
    value: "20%",
    usage: "12 / 50",
    expiredAt: "15/01/2025",
    status: "Sắp diễn ra",
    statusType: "pending",
  },
  {
    code: "NOEL2024",
    discountType: "Cố định",
    value: "120.000 đ",
    usage: "100 / 100",
    expiredAt: "24/12/2024",
    status: "Đã hết lượt",
    statusType: "cancelled",
  },
];

export default function DiscountCodePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="dashboard-top-header">
        <div className="dashboard-top-header-left">
          <button className="dashboard-mobile-toggle" type="button" aria-label="Menu">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <h1 className="dashboard-page-title">Mã Giảm giá</h1>
            <p className="dashboard-page-subtitle">
              Quản lý coupon và khuyến mãi
            </p>
          </div>
        </div>

        <div className="dashboard-top-header-right">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#6B1218] px-4 py-2 text-sm font-semibold text-[#F5F0E8] shadow-[0_8px_18px_rgba(107,18,24,0.18)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] hover:shadow-[0_12px_24px_rgba(107,18,24,0.25)]"
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="size-4" aria-hidden="true" />
            Thêm mã giảm giá
          </button>
        </div>
      </header>

      <div className="dashboard-page-content">
        <section className="rounded-2xl border border-[#6B4E35]/15 bg-[#F8F0E4] shadow-[0_6px_18px_rgba(44,24,16,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr>
                  {[
                    "Mã code",
                    "Loại giảm",
                    "Giá trị",
                    "Đã dùng / Tối đa",
                    "Ngày hết hạn",
                    "Trạng thái",
                    "",
                  ].map((header) => (
                    <th
                      key={header}
                      className="bg-[#F2E8D9]/70 px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#6B4C35]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.code} className="transition hover:bg-[#6B1218]/[0.025]">
                    <td className="border-t border-[#6B4E35]/10 px-5 py-4">
                      <span className="font-mono text-sm font-bold uppercase text-[#6B1218]">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="border-t border-[#6B4E35]/10 px-5 py-4 text-sm text-[#2C1810]">
                      {coupon.discountType}
                    </td>
                    <td className="border-t border-[#6B4E35]/10 px-5 py-4">
                      <span className="font-serif font-bold text-[#6B1218]">
                        {coupon.value}
                      </span>
                    </td>
                    <td className="border-t border-[#6B4E35]/10 px-5 py-4 text-sm text-[#2C1810]">
                      {coupon.usage}
                    </td>
                    <td className="border-t border-[#6B4E35]/10 px-5 py-4 text-sm text-[#2C1810]">
                      {coupon.expiredAt}
                    </td>
                    <td className="border-t border-[#6B4E35]/10 px-5 py-4">
                      <span className={`dashboard-status ${coupon.statusType}`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="border-t border-[#6B4E35]/10 px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          className="inline-flex size-9 items-center justify-center rounded-lg border border-[#6B4E35]/20 text-[#6B4C35] transition hover:border-[#6B1218] hover:bg-[#6B1218]/10 hover:text-[#6B1218]"
                          type="button"
                          aria-label={`Sửa ${coupon.code}`}
                          onClick={() => setIsModalOpen(true)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          className="inline-flex size-9 items-center justify-center rounded-lg border border-[#6B4E35]/20 text-[#6B4C35] transition hover:border-[#B91C1C] hover:bg-[#B91C1C]/10 hover:text-[#B91C1C]"
                          type="button"
                          aria-label={`Xóa ${coupon.code}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <ModalDiscount open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
