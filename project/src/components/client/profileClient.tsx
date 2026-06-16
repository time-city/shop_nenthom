"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { logoutUser } from "@/src/lib/action/auth.action";
import { getCurrentUser, updateProfileAction } from "@/src/lib/action/user.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useUserStore } from "@/src/store/useUserStore";
import type {
  ClientProfileUserData,
  ProfilePageContentProps,
  ProfileFieldProps,
  ProfileHeaderProps,
} from "@/src/lib/types/client";

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
  error,
}: ProfileFieldProps) {
  const hasError = Boolean(error);
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
        type={type === "email" || type === "tel" ? "text" : type}
        value={value}
        onChange={(event) => onChange(id, event.target.value)}
        className={`w-full rounded-[10px] border-[1.5px] ${
          hasError
            ? "border-[#6B1218] focus:ring-[#6B1218]/10"
            : "border-[#6b4e35]/20 focus:border-[#6B1218] focus:ring-[#6B1218]/10"
        } bg-white px-4 py-3 text-[0.95rem] text-[#2C1810] outline-none transition focus:ring-4`}
      />
      {error && (
        <span className="text-xs text-[#6B1218] mt-1 normal-case tracking-normal font-medium">
          {error}
        </span>
      )}
    </div>
  );
}

export default function ProfilePageContent({
  initialUser,
}: ProfilePageContentProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user: storedUser, setUser, updateAddress, clearUser } = useUserStore();
  
  const [profile, setProfile] = useState<Required<ClientProfileUserData>>(
    initialUser ?? defaultUser,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Required<ClientProfileUserData>, string>>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCurrentUser();
        if (cancelled) return;

        if (data) {
          const userProfile = {
            id: data.id,
            address: data.address || storedUser?.address || initialUser?.address || "",
            city: data.city || storedUser?.city || initialUser?.city || "",
            zip: data.postal_code || storedUser?.zip || initialUser?.zip || "",
            email: data.email ?? initialUser?.email ?? "",
            fullname: data.fullname ?? initialUser?.fullname ?? "",
            phone: data.phone ?? initialUser?.phone ?? "",
            role: data.role ?? initialUser?.role ?? "",
          };
          setProfile(userProfile);
          setUser(userProfile);
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
    void fetchUser();
    return () => {
      cancelled = true;
    };
  }, [initialUser]);

  const validateField = (field: keyof Required<ClientProfileUserData>, value: string): string => {
    const trimmed = value.trim();

    if (["fullname", "email", "phone"].includes(field)) {
      if (!trimmed) {
        return "Vui lòng không để trống";
      }
    }

    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.(com|vn|net|org|edu|gov|io|co|info|biz|me|cc|us|uk|jp|kr|tw|sg|live|store|shop|online|xyz|pro|work|tech|dev|app|asia|eu|ca|fr|de|au)(?:\.[a-z]{2,})?$/i;
      if (!emailRegex.test(trimmed)) {
        return "Email không đúng định dạng";
      }
    }

    if (field === "phone") {
      const phoneRegex = /^(0|\+84)\d{9}$/;
      if (!phoneRegex.test(trimmed)) {
        return "Số điện thoại không hợp lệ";
      }
    }

    return "";
  };

  const updateField = (field: keyof Required<ClientProfileUserData>, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      const errorMsg = validateField(field, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (errorMsg) {
          next[field] = errorMsg;
        } else {
          delete next[field];
        }
        return next;
      });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newErrors: Partial<Record<keyof Required<ClientProfileUserData>, string>> = {};
    const fieldsToValidate: Array<keyof Required<ClientProfileUserData>> = ["fullname", "email", "phone"];

    fieldsToValidate.forEach((field) => {
      const errorMsg = validateField(field, profile[field]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
      }
      return;
    }

    setIsSaving(true);
    updateProfileAction({
      fullname: profile.fullname,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      postal_code: profile.zip,
    }).then((res) => {
      setIsSaving(false);
      if ("error" in res && res.error) {
        toast.error(getFriendlyResponseError(res.error));
      } else {
        // Lưu địa chỉ vào Zustand store (thay vì localStorage)
        updateAddress({
          address: profile.address,
          city: profile.city,
          zip: profile.zip,
        });

        toast.success("Cập nhật thông tin thành công");
        router.refresh();
      }
    }).catch((err) => {
      setIsSaving(false);
      toast.error(err instanceof Error ? err.message : "Cập nhật profile thất bại");
    });
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    // action-(đăng xuất)
    const result = await logoutUser();

    if (!result.success) {
      const errorMsg = (result as { error?: string }).error;
      const message = errorMsg ? getFriendlyResponseError(errorMsg) : "Đăng xuất thất bại";
      toast.error(message);
      setIsLoggingOut(false);
      return;
    }

    localStorage.removeItem("remember");
    // Xóa user khỏi Zustand store khi logout
    clearUser();
    const message = "Đăng xuất thành công";
    toast.success(message);

    window.setTimeout(() => {
      router.replace("/login");
      router.refresh();
    }, 900);
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-[#F2E8D9] text-[#2C1810]">
      <ProfileHeader activeTab="profile" user={profile} />

      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:py-10 lg:py-12">
        <div className="rounded-2xl bg-[#F8F0E4] p-5 shadow-[0_4px_24px_rgba(44,24,16,0.08)] sm:p-7 md:p-9 lg:p-10">
          <h2 className="relative mb-7 pb-4 font-serif text-[1.55rem] font-bold text-[#2C1810] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-14 after:bg-[#6B1218] sm:text-[1.9rem]">
            Thông Tin Cá Nhân
          </h2>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-lg text-[#6B4C35]">Đang tải thông tin cá nhân...</div>
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-lg text-[#6B1218] font-medium">{error}</div>
            </div>
          ) : (
            <form autoComplete="off" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <Field
                  id="fullname"
                  label="Họ và Tên"
                  value={profile.fullname}
                  onChange={updateField}
                  error={errors.fullname}
                />
                <Field
                  id="email"
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={updateField}
                  error={errors.email}
                />
                <Field
                  id="phone"
                  label="Số Điện Thoại"
                  type="tel"
                  value={profile.phone}
                  onChange={updateField}
                  error={errors.phone}
                />
                <Field
                  id="city"
                  label="Thành Phố"
                  value={profile.city}
                  onChange={updateField}
                  error={errors.city}
                />
                <Field
                  id="address"
                  label="Địa Chỉ Giao Hàng"
                  value={profile.address}
                  onChange={updateField}
                  error={errors.address}
                  className="md:col-span-2"
                />
                <Field
                  id="zip"
                  label="Mã Bưu Chính"
                  value={profile.zip}
                  onChange={updateField}
                  error={errors.zip}
                  className="md:col-span-2"
                />
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full border-0 bg-[#6B1218] px-8 py-3.5 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] shadow-[0_6px_24px_rgba(107,18,24,0.28)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] disabled:cursor-not-allowed disabled:opacity-50 sm:px-10 sm:text-[0.8rem]"
                >
                  {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
                <Link
                  href="/profile/changePassword"
                  className="rounded-full border-[1.5px] border-[#6B1218] bg-transparent px-6 py-3 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#6B1218] transition hover:bg-[#6B1218] hover:text-[#F5F0E8] sm:text-[0.8rem] text-center"
                >
                  Đổi Mật Khẩu
                </Link>
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
          )}
        </div>
      </section>
    </main>
  );
}
