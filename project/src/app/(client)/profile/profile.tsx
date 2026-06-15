"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { logoutUser } from "../../../lib/action/auth.action";
import type {
  ClientProfileUserData,
  ProfilePageContentProps,
  ProfileFieldProps,
  ProfileHeaderProps,
} from "../../../lib/types/client";

const defaultUser: Required<ClientProfileUserData> = {
  address: "",
  city: "",
  email: "",
  fullname: "",
  phone: "",
  role: "",
  zip: "",
};

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "CC";
};

function ProfileHeader({
  activeTab,
  user,
}: ProfileHeaderProps) {
  const initials = useMemo(() => getInitials(user.fullname), [user.fullname]);

  return (
    <div className="flex flex-col gap-5 bg-[#6B1218] px-5 py-7 text-[#F5F0E8] sm:px-8 md:flex-row md:items-center md:justify-between md:gap-8 md:px-12 lg:px-16">
      <div className="flex min-w-0 items-center gap-4 sm:gap-5">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-full border-[3px] border-[#F5F0E8] bg-[#F2E8D9] font-serif text-xl font-bold text-[#6B1218] shadow-[0_8px_18px_rgba(44,24,16,0.25)] sm:size-[72px]"
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="min-w-0">
          <div className="truncate font-serif text-[1.35rem] font-bold leading-tight text-[#F5F0E8] sm:text-2xl">
            {user.fullname || "Tài khoản"}
          </div>
          {user.email ? (
            <div className="mt-1 truncate text-[0.82rem] font-light text-[#f5f0e8]/70 sm:text-[0.85rem]">
              {user.email}
            </div>
          ) : null}
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#F2E8D9] px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[#6B1218]">
            <span className="text-sm">✦</span>
            {user.role === "ADMIN" ? "Quản trị" : "Thành viên"}
          </div>
        </div>
      </div>

      <div
        className="flex w-full gap-2 overflow-x-auto md:w-auto md:justify-end"
        role="tablist"
        aria-label="Navigation"
      >
        <Link
          href="/profile"
          role="tab"
          aria-selected={activeTab === "profile"}
          className={`shrink-0 rounded-t-xl border-b-2 px-4 py-3 text-center text-[0.78rem] font-normal tracking-[0.08em] transition-colors sm:text-[0.85rem] ${
            activeTab === "profile"
              ? "border-[#F5F0E8] bg-[#f5f0e8]/15 text-[#F5F0E8]"
              : "border-transparent text-[#f5f0e8]/60 hover:text-[#f5f0e8]/95"
          }`}
        >
          Thông Tin Cá Nhân
        </Link>
        <Link
          href="/orders"
          role="tab"
          aria-selected={activeTab === "orders"}
          className={`shrink-0 rounded-t-xl border-b-2 px-4 py-3 text-center text-[0.78rem] font-normal tracking-[0.08em] transition-colors sm:text-[0.85rem] ${
            activeTab === "orders"
              ? "border-[#F5F0E8] bg-[#f5f0e8]/15 text-[#F5F0E8]"
              : "border-transparent text-[#f5f0e8]/60 hover:text-[#f5f0e8]/95"
          }`}
        >
          Lịch Sử Đơn Hàng
        </Link>
      </div>
    </div>
  );
}

function Field({
  className = "",
  id,
  label,
  onChange,
  type = "text",
  value,
}: ProfileFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        htmlFor={id}
        className="text-[0.7rem] font-normal uppercase tracking-[0.1em] text-[#6B4C35] sm:text-xs"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(id, event.target.value)}
        className="w-full rounded-[10px] border-[1.5px] border-[#6b4e35]/20 bg-white px-4 py-3 text-[0.95rem] text-[#2C1810] outline-none transition focus:border-[#6B1218] focus:ring-4 focus:ring-[#6B1218]/10"
        required
      />
    </div>
  );
}

export function ProfilePageContent({
  initialUser,
}: ProfilePageContentProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<Required<ClientProfileUserData>>(
    initialUser ?? defaultUser,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const updateField = (field: keyof Required<ClientProfileUserData>, value: string) => {
    setUser((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message =
      "Cập nhật profile thất bại";
    toast.info(message);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    // action-(đăng xuất)
    const result = await logoutUser();

    if (!result.success) {
      const message = "Đăng xuất thất bại";
      toast.error(message);
      setIsLoggingOut(false);
      return;
    }

    localStorage.removeItem("remember");
    const message = "Đăng xuất thành công";
    toast.success(message);

    window.setTimeout(() => {
      router.replace("/login");
      router.refresh();
    }, 900);
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-[#F2E8D9] text-[#2C1810]">
      <ProfileHeader activeTab="profile" user={user} />

      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:py-10 lg:py-12">
        <div className="rounded-2xl bg-[#F8F0E4] p-5 shadow-[0_4px_24px_rgba(44,24,16,0.08)] sm:p-7 md:p-9 lg:p-10">
          <h2 className="relative mb-7 pb-4 font-serif text-[1.55rem] font-bold text-[#2C1810] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-14 after:bg-[#6B1218] sm:text-[1.9rem]">
            Thông Tin Cá Nhân
          </h2>

          <form autoComplete="off" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <Field
                id="fullname"
                label="Họ và Tên"
                value={user.fullname}
                onChange={updateField}
              />
              <Field
                id="email"
                label="Email"
                type="email"
                value={user.email}
                onChange={updateField}
              />
              <Field
                id="phone"
                label="Số Điện Thoại"
                type="tel"
                value={user.phone}
                onChange={updateField}
              />
              <Field
                id="city"
                label="Thành Phố"
                value={user.city}
                onChange={updateField}
              />
              <Field
                id="address"
                label="Địa Chỉ Giao Hàng"
                value={user.address}
                onChange={updateField}
                className="md:col-span-2"
              />
              <Field
                id="zip"
                label="Mã Bưu Chính"
                value={user.zip}
                onChange={updateField}
                className="md:col-span-2"
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                className="rounded-full border-0 bg-[#6B1218] px-8 py-3.5 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] shadow-[0_6px_24px_rgba(107,18,24,0.28)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] sm:px-10 sm:text-[0.8rem]"
              >
                Lưu Thay Đổi
              </button>
              <button
                type="button"
                onClick={() => {
                  const message = "Tính năng đổi mật khẩu sẽ được cập nhật";
                  toast.info(message);
                }}
                className="rounded-full border-[1.5px] border-[#6B1218] bg-transparent px-6 py-3 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#6B1218] transition hover:bg-[#6B1218] hover:text-[#F5F0E8] sm:text-[0.8rem]"
              >
                Đổi Mật Khẩu
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-full border-[1.5px] border-[#2C1810]/25 bg-transparent px-6 py-3 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#2C1810] transition hover:border-[#6B1218] hover:bg-[#6B1218] hover:text-[#F5F0E8] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[0.8rem]"
              >
                {isLoggingOut ? "Đang Đăng Xuất..." : "Đăng Xuất"}
              </button>
            </div>
          </form>
        </div>
      </section>

    </main>
  );
}
