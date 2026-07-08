import { useOptimistic, useTransition, useState } from "react";
import { ClipboardList, Lock, Unlock } from "lucide-react";
import ClientStatusBadge from "@/src/components/admin/customer/clientStatusBadge";
import ModalDeleteConfirm from "@/src/components/admin/common/modalDeleteConfirm";
import TableResponsiveWrapper from "@/src/components/admin/common/TableResponsiveWrapper";

import type { AdminUser as User } from "@/src/lib/types/admin";

interface ClientTableProps {
  users: User[];
  onToggleStatus: (userId: string) => void | Promise<void>;
  onViewOrders: (user: User) => void;
}

export default function ClientTable({
  users,
  onToggleStatus,
  onViewOrders,
}: ClientTableProps) {
  const [isPending, startTransition] = useTransition();
  const [lockUserId, setLockUserId] = useState<string | null>(null);

  const [optimisticUsers, setOptimisticUsers] = useOptimistic(
    users,
    (state, action: { type: "status"; userId: string }) => {
      return state.map((user) => {
        if (user.id === action.userId) {
          if (action.type === "status") {
            return { ...user, isActive: !user.isActive };
          }
        }
        return user;
      });
    }
  );

  const proceedToggleStatus = (userId: string) => {
    startTransition(async () => {
      setOptimisticUsers({ type: "status", userId });
      try {
        await onToggleStatus(userId);
      } catch {
        // Rollback is automatic
      }
    });
  };

  const handleToggleStatus = (userId: string) => {
    const targetUser = optimisticUsers.find((u) => u.id === userId);
    if (targetUser?.isActive) {
      setLockUserId(userId);
    } else {
      proceedToggleStatus(userId);
    }
  };

  const handleConfirmLock = async () => {
    if (!lockUserId) return;
    const userId = lockUserId;
    setLockUserId(null);
    proceedToggleStatus(userId);
  };

  return (
    <>
      <div className="dashboard-card overflow-hidden no-padding">
        <TableResponsiveWrapper minWidth={850}>
          <table className="dashboard-admin-table">
            <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Liên hệ</th>
              <th>Ngày tham gia</th>
              <th>Trạng thái & Vai trò</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {optimisticUsers.length > 0 ? (
              optimisticUsers.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors"
                >
                  <td className="font-bold text-[#2C1810]">{user.name}</td>
                  <td>
                    <div className="text-xs font-semibold text-[#2C1810]">{user.email}</div>
                    <div className="text-xs text-[#6B4E35]">{user.phone}</div>
                  </td>
                  <td>{user.createdAt}</td>
                  <td>
                    <ClientStatusBadge isActive={user.isActive} role={user.role} />
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onViewOrders(user)}
                        className="p-2 text-xs font-semibold rounded bg-[#F5F0E8] text-[#6B4E35] border border-[#6B4E35]/25 hover:bg-[#EDE5D8] transition-all duration-200"
                        type="button"
                        title="Xem đơn hàng"
                      >
                        <ClipboardList className="size-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`p-2 text-xs font-semibold rounded border transition-all duration-200 flex items-center justify-center ${
                          user.isActive
                            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        }`}
                        type="button"
                        title={user.isActive ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
                      >
                        {user.isActive ? (
                          <Lock className="size-4" />
                        ) : (
                          <Unlock className="size-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#6B4E35]/60 text-sm">
                  Không tìm thấy khách hàng nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableResponsiveWrapper>
    </div>

      <ModalDeleteConfirm
        open={lockUserId !== null}
        title="Xác nhận khóa tài khoản?"
        description={
          lockUserId
            ? `Bạn có chắc chắn muốn khóa tài khoản của khách hàng "${
                optimisticUsers.find((u) => u.id === lockUserId)?.name ?? ""
              }" không?`
            : ""
        }
        confirmLabel="Khóa tài khoản"
        loadingLabel="Đang khóa..."
        isDeleting={isPending}
        onClose={() => setLockUserId(null)}
        onConfirm={handleConfirmLock}
      />
    </>
  );
}
