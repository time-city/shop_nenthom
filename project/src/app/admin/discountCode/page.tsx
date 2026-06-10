"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import ModalDiscount from "../../../components/admin/modalDiscount";

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
                  <tr>
                    <td
                      colSpan={7}
                      className="border-t border-[#6B4E35]/10 px-5 py-8 text-center text-sm text-[#6B4C35]"
                    >
                      Chưa có dữ liệu mã giảm giá
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <ModalDiscount open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
