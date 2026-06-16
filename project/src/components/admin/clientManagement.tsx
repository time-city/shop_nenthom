"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import ClientSearchBar from "./clientSearchBar";
import ClientTable from "./clientTable";
import ClientPagination from "./clientPagination";
import ClientOrderModal from "./clientOrderModal";
import LoadingState from "../ui/loadingState";

import type { AdminUser as User } from "@/src/lib/types/admin";

const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Nguyễn Văn A",
    email: "vana@gmail.com",
    phone: "0901234567",
    role: "CUSTOMER",
    isActive: true,
    createdAt: "2026-06-01",
  },
  {
    id: "user-2",
    name: "Trần Thị B",
    email: "thib@gmail.com",
    phone: "0912345678",
    role: "ADMIN",
    isActive: true,
    createdAt: "2026-06-02",
  },
  {
    id: "user-3",
    name: "Lê Văn C",
    email: "vanc@gmail.com",
    phone: "0923456789",
    role: "CUSTOMER",
    isActive: false,
    createdAt: "2026-06-03",
  },
  {
    id: "user-4",
    name: "Phạm Minh D",
    email: "minhd@gmail.com",
    phone: "0934567890",
    role: "CUSTOMER",
    isActive: true,
    createdAt: "2026-06-04",
  },
  {
    id: "user-5",
    name: "Hoàng Thị E",
    email: "thie@gmail.com",
    phone: "0945678901",
    role: "CUSTOMER",
    isActive: true,
    createdAt: "2026-06-05",
  },
];

let localUsers = [...MOCK_USERS];

const getAllUsersAction = async (): Promise<{ success: boolean; data?: User[]; error?: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true, data: localUsers };
};

const toggleUserStatusAction = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  localUsers = localUsers.map((u) =>
    u.id === userId ? { ...u, isActive: !u.isActive } : u
  );
  return { success: true };
};

const toggleUserRoleAction = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  localUsers = localUsers.map((u) =>
    u.id === userId
      ? { ...u, role: u.role === "ADMIN" ? "CUSTOMER" : "ADMIN" }
      : u
  );
  return { success: true };
};

const itemsPerPage = 4;

export default function ClientManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getAllUsersAction();
        if (cancelled) return;
        if ("error" in result && result.error) {
          const friendlyErr = getFriendlyResponseError(result.error);
          setError(friendlyErr);
          toast.error(friendlyErr);
        } else if ("success" in result && result.success) {
          setUsers(result.data as User[]);
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
    void loadUsers();
    return () => {
      cancelled = true;
    };
  }, [toast]);

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

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = useMemo(() => {
    const page = Math.min(currentPage, totalPages || 1);
    const start = (page - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, totalPages]);

  // Adjust page if current is out of range
  const activePage = Math.min(currentPage, totalPages || 1);

  const handleToggleStatus = async (userId: string) => {
    setError(null);
    const result = await toggleUserStatusAction(userId);
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

  const handleToggleRole = async (userId: string) => {
    setError(null);
    const result = await toggleUserRoleAction(userId);
    if ("error" in result && result.error) {
      const friendlyErr = getFriendlyResponseError(result.error);
      toast.error(friendlyErr);
      throw new Error(friendlyErr);
    } else {
      toast.success("Cập nhật vai trò tài khoản thành công");
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, role: user.role === "ADMIN" ? "CUSTOMER" : "ADMIN" }
            : user
        )
      );
    }
  };


  return (
    <>
      <header className="dashboard-top-header">
        <div className="dashboard-top-header-left">
          <button
            className="dashboard-mobile-toggle"
            type="button"
            aria-label="Menu"
            onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
          >
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
            <h1 className="dashboard-page-title">Quản lý Khách hàng</h1>
            <p className="dashboard-page-subtitle">
              Danh sách và thông tin tài khoản thành viên
            </p>
          </div>
        </div>
      </header>

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
                Tổng số: {filteredUsers.length} khách hàng
              </span>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <ClientTable
            users={currentUsers}
            onToggleStatus={handleToggleStatus}
            onToggleRole={handleToggleRole}
            onViewOrders={(user) => setSelectedUser(user)}
          />

          <ClientPagination
            currentPage={activePage}
            totalPages={totalPages}
            onChange={(page) => setCurrentPage(page)}
          />
        </section>
      </div>

      <ClientOrderModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </>
  );
}
