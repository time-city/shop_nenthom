"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import ClientSearchBar from "./clientSearchBar";
import AdminHeader from "./AdminHeader";
import ClientTable from "./clientTable";
import ClientPagination from "./clientPagination";
import ClientOrderModal from "./clientOrderModal";

import type {
  AdminPaginationMeta,
  AdminUser as User,
} from "@/src/lib/types/admin";

import {
  getAllUsersAction,
  toggleUserStatusAction,
} from "../../lib/action/user.action";
import { callAction } from "@/src/lib/utils/callAction";

const itemsPerPage = 10;
const initialMeta: AdminPaginationMeta = {
  limit: itemsPerPage,
  page: 1,
  total: 0,
  totalPages: 1,
};

export default function ClientManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [meta, setMeta] = useState<AdminPaginationMeta>(initialMeta);

  useEffect(() => {
    let cancelled = false;
    const loadUsers = async () => {
      try {
        const result = await callAction(() => getAllUsersAction({
          limit: itemsPerPage,
          page: currentPage,
        }), "Không thể tải danh sách khách hàng. Vui lòng thử lại sau.");
        if (cancelled) return;
        if ("error" in result && result.error) {
          const friendlyErr = getFriendlyResponseError(result.error);
          toast.error(friendlyErr);
        } else if ("success" in result && result.success) {
          setUsers(result.data as User[]);
          setMeta(result.meta);
        }
      } catch {}
    };
    void loadUsers();
    return () => {
      cancelled = true;
    };
  }, [currentPage, toast]);

  // Filter users based on query
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query)
    );
  }, [users, searchQuery]);

  const handleToggleStatus = async (userId: string) => {
    const result = await callAction(() => toggleUserStatusAction(userId), "Không thể cập nhật trạng thái tài khoản. Vui lòng thử lại sau.");
    if ("error" in result && result.error) {
      const friendlyErr = getFriendlyResponseError(result.error);
      toast.error(friendlyErr);
      throw new Error(friendlyErr);
    } else {
      toast.success("Cập nhật trạng thái tài khoản thành công");
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isActive: !user.isActive } : user
        )
      );
    }
  };


  return (
    <>
      <AdminHeader
        title="Quản lý Khách hàng"
        subtitle="Danh sách và thông tin tài khoản thành viên"
      />

      <div className="dashboard-page-content">
        <section className="dashboard-card mb-6 border border-[#6B4E35]/15">
          <div className="dashboard-card-body">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <ClientSearchBar
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
              />
              <span className="text-sm font-medium text-[#6B4C35]">
                {searchQuery
                  ? `Kết quả trang này: ${filteredUsers.length} / ${meta.total}`
                  : `Tổng số: ${meta.total} khách hàng`}
              </span>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <ClientTable
            users={filteredUsers}
            onToggleStatus={handleToggleStatus}
            onViewOrders={(user) => setSelectedUser(user)}
          />

          <ClientPagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onChange={(page) => setCurrentPage(page)}
          />
        </section>
      </div>

      <ClientOrderModal
        key={selectedUser?.id ?? "closed"}
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </>
  );
}
