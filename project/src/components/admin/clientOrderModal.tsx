"use client";

import type { AdminUser as User } from "@/src/lib/types/admin";

interface ClientOrderModalProps {
    user: User | null;
    onClose: () => void;
}

const mockUserOrders: Record<
    string,
    { id: string; date: string; total: string; status: string; items: string }[]
> = {
    "1": [
        { id: "DH-1001", date: "15/01/2024", total: "250.000 đ", status: "Hoàn thành", items: "1x Nến thơm Cozy Home" },
        { id: "DH-1002", date: "10/02/2024", total: "380.000 đ", status: "Hoàn thành", items: "1x Nến thơm Forest Mist, 1x Sáp thơm" }
    ],
    "2": [
        { id: "DH-2001", date: "22/02/2024", total: "620.000 đ", status: "Hoàn thành", items: "2x Nến Lavender Dream" }
    ],
    "4": [
        { id: "DH-4001", date: "16/03/2024", total: "180.000 đ", status: "Đang giao", items: "1x Nến thơm Autumn Woods" }
    ],
    "5": [
        { id: "DH-5001", date: "02/04/2024", total: "490.000 đ", status: "Hoàn thành", items: "1x Nến Cinnamon, 1x Topping Cam Lát" }
    ],
    "7": [
        { id: "DH-7001", date: "08/05/2024", total: "310.000 đ", status: "Đang giao", items: "1x Nến Jasmine Kiss" }
    ]
};

export default function ClientOrderModal({ user, onClose }: ClientOrderModalProps) {
    if (!user) return null;

    const orders = mockUserOrders[user.id] ?? [];

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#F8F0E4] rounded-2xl w-full max-w-2xl overflow-hidden border border-[#6B4E35]/20 shadow-2xl animate-dropdown-slide-down">
                {/* Modal Header */}
                <div className="bg-[#6B1218] px-6 py-4 flex items-center justify-between">
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
                <div className="p-6">
                    <div className="mb-4 text-sm text-[#6B4C35]">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Số điện thoại:</strong> {user.phone}</p>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[#6B4E35]/15 max-h-[350px]">
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
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-[#6B4E35]/10 text-sm text-[#2C1810] hover:bg-[#6B1218]/5 transition-colors"
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
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${order.status === "Hoàn thành"
                                                        ? "bg-[#E8F5E9] text-[#2E7D32]"
                                                        : "bg-[#FFF9C4] text-[#F57F17]"
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-[#6B4C35] text-sm">
                                            Khách hàng này chưa có đơn hàng nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
