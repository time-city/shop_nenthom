import { useOptimistic, useTransition } from "react";
import ClientStatusBadge from "./clientStatusBadge";

import type { AdminUser as User } from "@/src/lib/types/admin";

interface ClientTableProps {
  users: User[];
  onToggleStatus: (userId: string) => void | Promise<void>;
  onToggleRole: (userId: string) => void | Promise<void>;
  onViewOrders: (user: User) => void;
}

export default function ClientTable({
  users,
  onToggleStatus,
  onToggleRole,
  onViewOrders,
}: ClientTableProps) {
  const [isPending, startTransition] = useTransition();

  const [optimisticUsers, setOptimisticUsers] = useOptimistic(
    users,
    (state, action: { type: "status" | "role"; userId: string }) => {
      return state.map((user) => {
        if (user.id === action.userId) {
          if (action.type === "status") {
            return { ...user, isActive: !user.isActive };
          }
          if (action.type === "role") {
            return { ...user, role: user.role === "ADMIN" ? "USER" : "ADMIN" };
          }
        }
        return user;
      });
    }
  );

  const handleToggleStatus = (userId: string) => {
    startTransition(async () => {
      setOptimisticUsers({ type: "status", userId });
      try {
        await onToggleStatus(userId);
      } catch (err) {
        // Rollback is automatic
      }
    });
  };

  const handleToggleRole = (userId: string) => {
    startTransition(async () => {
      setOptimisticUsers({ type: "role", userId });
      try {
        await onToggleRole(userId);
      } catch (err) {
        // Rollback is automatic
      }
    });
  };

  return (
    <div className="overflow-x-auto rounded-[12px] border border-[#6B4E35]/15 bg-[#F8F0E4] shadow-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#6B1218] text-[#F5F0E8] text-xs uppercase font-semibold">
            <th className="px-6 py-4">Họ và tên</th>
            <th className="px-6 py-4">Liên hệ</th>
            <th className="px-6 py-4">Ngày tham gia</th>
            <th className="px-6 py-4">Trạng thái & Vai trò</th>
            <th className="px-6 py-4 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {optimisticUsers.length > 0 ? (
            optimisticUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[#6B4E35]/10 text-sm text-[#2C1810] hover:bg-[#6B1218]/5 transition-colors"
              >
                <td className="px-6 py-4 font-bold text-[#6B1218]">{user.name}</td>
                <td className="px-6 py-4">
                  <div className="text-xs font-semibold">{user.email}</div>
                  <div className="text-xs text-[#6B4C35]/80">{user.phone}</div>
                </td>
                <td className="px-6 py-4">{user.createdAt}</td>
                <td className="px-6 py-4">
                  <ClientStatusBadge isActive={user.isActive} role={user.role} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onViewOrders(user)}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-[#F2E8D9] text-[#6B1218] border border-[#6B1218]/15 hover:bg-[#6B1218]/10 transition-all duration-200"
                      type="button"
                    >
                      Đơn hàng
                    </button>
                    <button
                      onClick={() => handleToggleRole(user.id)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-[#F2E8D9] text-[#6B4C35] border border-[#6B4C35]/15 hover:bg-[#F2E8D9]/80 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                    >
                      {user.role === "ADMIN" ? "Hạ cấp USER" : "Thăng cấp ADMIN"}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      disabled={isPending}
                      className={`px-3 py-1.5 text-xs font-semibold rounded border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                        user.isActive
                          ? "bg-[#FFEBEE] text-[#C62828] border-[#C62828]/15 hover:bg-[#FFEBEE]/80"
                          : "bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/15 hover:bg-[#E8F5E9]/80"
                      }`}
                      type="button"
                    >
                      {user.isActive ? "Khóa" : "Kích hoạt"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-[#6B4C35] text-sm">
                Không tìm thấy khách hàng nào phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

