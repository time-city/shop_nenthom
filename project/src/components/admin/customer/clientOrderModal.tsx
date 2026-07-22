"use client";

import { useEffect, useState } from "react";
import type { AdminUser as User } from "@/src/lib/types/admin";
import { getUserOrdersAction } from "../../../lib/action/user.action";
import ClientPagination from "@/src/components/admin/customer/clientPagination";
import type { AdminPaginationMeta } from "@/src/lib/types/admin";
import Spinner from "@/src/components/ui/Spinner";
import { callAction } from "@/src/lib/utils/callAction";
import TableResponsiveWrapper from "@/src/components/admin/common/TableResponsiveWrapper";

interface ClientOrderModalProps {
    user: User | null;
    onClose: () => void;
}

interface UserOrder {
    id: string;
    date: string;
    total: string;
    status: string;
    items: string;
}

const pageSize = 10;
const initialMeta: AdminPaginationMeta = {
    limit: pageSize,
    page: 1,
    total: 0,
    totalPages: 1,
};

export default function ClientOrderModal({ user, onClose }: ClientOrderModalProps) {
    const [orders, setOrders] = useState<UserOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState<AdminPaginationMeta>(initialMeta);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await callAction(() => getUserOrdersAction(user.id, {
                    limit: pageSize,
                    page: currentPage,
                }), "Không thể tải đơn hàng của khách hàng. Vui lòng thử lại sau.");
                if (cancelled) return;
                if ("error" in res && res.error) {
                    setError(res.error);
                } else if ("success" in res && res.success && res.data) {
                    setOrders(res.data);
                    setMeta(res.meta);
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
    }, [currentPage, user]);

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="dashboard-card w-full max-w-2xl overflow-hidden shadow-2xl animate-dropdown-slide-down">
                {/* Modal Header */}
                <div className="bg-[#6B1218] px-6 py-4 flex items-center justify-between border-b border-[#D6A15F]/20">
                    <h3 className="text-lg font-serif font-bold text-[#F5F0E8]">
                        Đơn hàng của {user.name}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-[#F5F0E8]/80 hover:text-[#F5F0E8] transition-colors"
                        type="button"
                        aria-label="Đóng"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 bg-[#FFFDF9]">
                    <div className="mb-4 text-sm text-[#2C1810]">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Số điện thoại:</strong> {user.phone}</p>
                    </div>

                    <div className="rounded-lg border border-[#6B4E35]/15 max-h-[350px] overflow-y-auto">
                        <TableResponsiveWrapper minWidth={500}>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#6B1218] text-[#F5F0E8] text-xs uppercase font-semibold">
                                        <th className="px-4 py-3">Mã đơn</th>
                                        <th className="px-4 py-3">Ngày đặt</th>
                                        <th className="px-4 py-3">Sản phẩm</th>
                                        <th className="px-4 py-3">Tổng tiền</th>
                                        <th className="px-4 py-3 text-right">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-[#6B4E35] text-sm">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Spinner size="sm" />
                                                    <span>Đang tải danh sách đơn hàng...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-[#C62828] text-sm">
                                                {error}
                                            </td>
                                        </tr>
                                    ) : orders.length > 0 ? (
                                        orders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="border-b border-[#6B4E35]/10 text-sm text-[#2C1810] hover:bg-[#6B4E35]/5 transition-colors"
                                            >
                                                <td className="px-4 py-3.5 font-bold font-mono text-[#6B1218]">
                                                    {order.id}
                                                </td>
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    {order.date}
                                                </td>
                                                <td className="px-4 py-3.5 max-w-[200px] truncate" title={order.items}>
                                                    {order.items}
                                                </td>
                                                <td className="px-4 py-3.5 font-serif font-bold text-[#6B1218]">
                                                    {order.total}
                                                </td>
                                                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${order.status === "Đã xác nhận"
                                                            ? "bg-[#E8F5E9] text-[#2E7D32]"
                                                            : order.status === "Đã huỷ"
                                                                ? "bg-gray-100 text-gray-500"
                                                                : "bg-[#FFF9C4] text-[#F57F17]"
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-[#6B4E35] text-sm">
                                                Khách hàng này chưa có đơn hàng nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </TableResponsiveWrapper>
                    </div>
                    <ClientPagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        onChange={setCurrentPage}
                    />
                </div>

                {/* Modal Footer */}
                <div className="bg-[#F2E8D9] px-6 py-4 flex justify-end border-t border-[#6B4E35]/15">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#6B1218] hover:bg-[#4A0C10] text-[#F5F0E8] text-sm font-semibold rounded-lg shadow-md transition hover:-translate-y-0.5"
                        type="button"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
