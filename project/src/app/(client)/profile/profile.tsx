"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "react-toastify";

type UserData = {
  email?: string;
  fullname?: string;
  phone?: string;
  role?: string;
};

type ProfileUpdateRequest = {
  fullname: string;
  phone: string;
};

type ProfileUpdateResponse = {
  data: {
    user: {
      email: string;
      fullname: string;
      id: string;
      phone: string;
    };
  };
  message: string;
  success: boolean;
};

const defaultUser: Required<UserData> = {
  email: "user@example.com",
  fullname: "User",
  phone: "",
  role: "user",
};

const getCookie = (name: string) => {
  if (typeof document === "undefined") {
    return "";
  }

  return (
    document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.split("=")[1] ?? ""
  );
};

const clearCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

const readUser = () => {
  try {
    if (typeof window === "undefined") {
      return defaultUser;
    }

    const stored = localStorage.getItem("lumiere-user");

    // Ưu tiên các key auth rời được lưu sau login/register để profile luôn cập nhật.
    const localUser: UserData = {};
    const email = localStorage.getItem("email");
    const fullname = localStorage.getItem("fullname");
    const phone = localStorage.getItem("phone");
    const role = getCookie("role");

    if (email) {
      localUser.email = email;
    }

    if (fullname) {
      localUser.fullname = fullname;
    }

    if (phone) {
      localUser.phone = phone;
    }

    if (role) {
      localUser.role = decodeURIComponent(role);
    }

    if (!stored) {
      return { ...defaultUser, ...localUser };
    }

    return { ...defaultUser, ...(JSON.parse(stored) as UserData), ...localUser };
  } catch {
    return defaultUser;
  }
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

const saveProfileResponse = (
  currentUser: Required<UserData>,
  response: ProfileUpdateResponse,
) => {
  if (!response.success) {
    return currentUser;
  }

  const updatedUser = {
    ...currentUser,
    email: response.data.user.email,
    fullname: response.data.user.fullname,
    phone: response.data.user.phone,
  };

  localStorage.setItem("lumiere-user", JSON.stringify(updatedUser));
  localStorage.setItem("fullname", updatedUser.fullname);
  localStorage.setItem("email", updatedUser.email);
  localStorage.setItem("phone", updatedUser.phone);

  return updatedUser;
};

function ProfileHeader({
  activeTab,
  user,
}: {
  activeTab: "orders" | "profile";
  user: Required<UserData>;
}) {
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
            {user.fullname}
          </div>
          <div className="mt-1 truncate text-[0.82rem] font-light text-[#f5f0e8]/70 sm:text-[0.85rem]">
            {user.email}
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#F2E8D9] px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[#6B1218]">
            <span className="text-sm">✦</span>
            {user.role === "admin" ? "Quản trị" : "Thành viên"}
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
  id,
  label,
  onChange,
  type = "text",
  value,
}: {
  id: keyof Required<UserData>;
  label: string;
  onChange: (field: keyof Required<UserData>, value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2">
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

export function ProfilePageContent() {
  const [user, setUser] = useState<Required<UserData>>(() => readUser());

  const updateField = (field: keyof Required<UserData>, value: string) => {
    setUser((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const request: ProfileUpdateRequest = {
      fullname: user.fullname.trim(),
      phone: user.phone.trim(),
    };

    // TODO: PUT /api/users/profile với request { fullname, phone } và token trong cookie.
    const response: ProfileUpdateResponse = {
      data: {
        user: {
          email: user.email,
          fullname: request.fullname,
          id: "current-user",
          phone: request.phone,
        },
      },
      message: "Đã lưu thay đổi",
      success: true,
    };

    console.log(response.message);
    setUser(saveProfileResponse(user, response));
    toast.success(response.message);
  };

  const handleLogout = () => {
    localStorage.removeItem("fullname");
    localStorage.removeItem("email");
    localStorage.removeItem("phone");
    localStorage.removeItem("remember");
    localStorage.removeItem("lumiere-user");
    clearCookie("role");
    clearCookie("accessToken");

    const message = "Đăng xuất thành công";
    console.log(message);
    toast.success(message);

    window.setTimeout(() => {
      window.location.href = "/login";
    }, 900);
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-[#F2E8D9] text-[#2C1810]">
      <ProfileHeader activeTab="profile" user={user} />

      <section className="mx-auto w-full max-w-[728px] px-4 py-8 sm:px-6 md:py-10">
        <div className="rounded-2xl bg-[#F8F0E4] p-6 shadow-[0_4px_24px_rgba(44,24,16,0.08)] sm:p-8 md:p-10">
          <h2 className="relative mb-8 pb-3 font-serif text-[1.45rem] font-bold text-[#2C1810] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#6B1218] sm:text-[1.55rem]">
            Thông Tin Cá Nhân
          </h2>

          <form autoComplete="off" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                  console.log(message);
                  toast.info(message);
                }}
                className="rounded-full border-[1.5px] border-[#6B1218] bg-transparent px-6 py-3 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#6B1218] transition hover:bg-[#6B1218] hover:text-[#F5F0E8] sm:text-[0.8rem]"
              >
                Đổi Mật Khẩu
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border-[1.5px] border-[#2C1810]/25 bg-transparent px-6 py-3 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#2C1810] transition hover:border-[#6B1218] hover:bg-[#6B1218] hover:text-[#F5F0E8] sm:text-[0.8rem]"
              >
                Đăng Xuất
              </button>
            </div>
          </form>
        </div>
      </section>

    </main>
  );
}
