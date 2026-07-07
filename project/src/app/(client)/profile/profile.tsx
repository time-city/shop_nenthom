"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { useToast } from "@/src/components/ui/toastProvider";
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
    <div className="flex flex-col gap-5 bg-black/40 backdrop-blur-md border-b border-[#F5F0E8]/10 px-5 py-7 text-[#F5F0E8] sm:px-8 md:flex-row md:items-center md:justify-between md:gap-8 md:px-12 lg:px-16">
      <div className="flex min-w-0 items-center gap-4 sm:gap-5">
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded-full border border-[#D6A15F]/50 bg-gradient-to-br from-[#D6A15F]/20 to-black/40 font-serif text-xl font-bold text-[#D6A15F] shadow-[0_8px_18px_rgba(0,0,0,0.25)] sm:size-[72px]"
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="min-w-0">
          <div className="truncate font-serif text-[1.35rem] font-bold leading-tight text-[#F5F0E8] sm:text-2xl">
            {user.fullname || "Tài khoản"}
          </div>
          {user.email ? (
            <div className="mt-1 truncate text-[0.82rem] font-light text-[#F5F0E8]/70 sm:text-[0.85rem]">
              {user.email}
            </div>
          ) : null}
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#D6A15F]/30 bg-black/30 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[#D6A15F]">
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
              ? "border-[#D6A15F] bg-[#D6A15F]/10 text-[#D6A15F]"
              : "border-transparent text-[#F5F0E8]/60 hover:text-[#F5F0E8]"
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
              ? "border-[#D6A15F] bg-[#D6A15F]/10 text-[#D6A15F]"
              : "border-transparent text-[#F5F0E8]/60 hover:text-[#F5F0E8]"
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
        className="text-[0.7rem] font-normal uppercase tracking-[0.1em] text-[#F5F0E8]/70 sm:text-xs"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(id, event.target.value)}
        className="w-full rounded-[10px] border-[1.5px] border-[#F5F0E8]/20 bg-black/40 px-4 py-3 text-[0.95rem] text-[#F5F0E8] outline-none transition focus:border-[#D6A15F] focus:ring-4 focus:ring-[#D6A15F]/10 placeholder:text-[#F5F0E8]/30"
        required
      />
    </div>
  );
}

export function ProfilePageContent({
  initialUser,
}: ProfilePageContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<Required<ClientProfileUserData>>(
    initialUser ?? defaultUser,
  );

  const updateField = (field: keyof Required<ClientProfileUserData>, value: string) => {
    setUser((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message =
      "Chưa có action cập nhật profile trong auth.action.ts để lưu thay đổi";
    toast.info(message);
  };

  const handleLogout = () => {
    // action-(đăng xuất)
    void logoutUser().then((result) => {
      if (!result.success) {
        const message = "Đăng xuất thất bại";
        toast.error(message);
        return;
      }

      localStorage.removeItem("remember");
      const message = "Đăng xuất thành công";
      toast.success(message);

      window.setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 900);
    });
  };

  return (
    <main 
      className="min-h-screen text-[#F5F0E8] relative bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/assets/option_background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      
      <div className="relative z-10 pt-24">
        <ProfileHeader activeTab="profile" user={user} />

        <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:py-10 lg:py-12">
          <div className="rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] sm:p-7 md:p-9 lg:p-10">
            <h2 className="relative mb-7 pb-4 font-serif text-[1.55rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-14 after:bg-[#D6A15F] sm:text-[1.9rem]">
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
                  className="rounded-full bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] px-8 py-3.5 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#2C1810] shadow-[0_6px_24px_rgba(214,161,95,0.28)] transition hover:-translate-y-0.5 sm:px-10 sm:text-[0.8rem]"
                >
                  Lưu Thay Đổi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const message = "Tính năng đổi mật khẩu sẽ được cập nhật";
                    toast.info(message);
                  }}
                  className="rounded-full border border-[#D6A15F]/50 bg-transparent px-6 py-3.5 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#D6A15F] transition hover:bg-[#D6A15F] hover:text-[#2C1810] sm:text-[0.8rem]"
                >
                  Đổi Mật Khẩu
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-[#F5F0E8]/30 bg-transparent px-6 py-3.5 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] transition hover:border-red-500 hover:bg-red-500/20 hover:text-red-300 sm:text-[0.8rem]"
                >
                  Đăng Xuất
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
