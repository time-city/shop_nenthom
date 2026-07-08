"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import useSWR from "swr";
import { useToast } from "@/src/components/ui/toastProvider";
import LoadingState from "@/src/components/ui/loadingState";
import { logoutUser } from "@/src/lib/action/auth.action";
import { getCurrentUser, updateProfileAction } from "@/src/lib/action/user.action";
import { getUserAddressesAction, createAddressAction, updateAddressAction, deleteAddressAction, setDefaultAddressAction } from "@/src/lib/action/address.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useUserStore } from "@/src/store/useUserStore";
import { useCartStore } from "@/src/store/useCartStore";
import { useSupportStore } from "@/src/store/useSupportStore";
import type {
  ClientProfileUserData,
  ProfilePageContentProps,
  ProfileFieldProps,
} from "@/src/lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";
import AddressModal, { AddressFormData } from "./addressModal";
import { MapPin, Star, Trash2, Edit2, Plus } from "lucide-react";
import dynamic from "next/dynamic";

const ModalDeleteConfirmClient = dynamic(() => import("@/src/components/client/common/modalDeleteConfirmClient"), { ssr: false });

const defaultUser: Required<ClientProfileUserData> = {
  address: "",
  city: "",
  email: "",
  fullname: "",
  phone: "",
  role: "",
  zip: "",
};

function Field({
  className = "",
  id,
  label,
  onChange,
  type = "text",
  value,
  error,
  disabled = false,
}: ProfileFieldProps & { disabled?: boolean }) {
  const hasError = Boolean(error);
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
        type={type === "email" || type === "tel" ? "text" : type}
        value={value}
        onChange={(event) => onChange(id, event.target.value)}
        disabled={disabled}
        className={`w-full rounded-[10px] border-[1.5px] ${hasError
          ? "border-red-500 focus:ring-red-500/10"
          : "border-[#F5F0E8]/20 focus:border-[#D6A15F] focus:ring-[#D6A15F]/10"
          } bg-black/40 px-4 py-3 text-[0.95rem] text-[#F5F0E8] outline-none transition focus:ring-4 disabled:bg-black/20 disabled:text-[#F5F0E8]/40 disabled:cursor-not-allowed placeholder:text-[#F5F0E8]/30`}
      />
      {error && (
        <span className="text-xs text-red-400 mt-1 normal-case tracking-normal font-medium">
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
  const updateUser = useUserStore((state) => state.updateUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const clearCart = useCartStore((state) => state.clearCart);

  const [profile, setProfile] = useState<Required<ClientProfileUserData>>(
    initialUser ?? defaultUser,
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Required<ClientProfileUserData>, string>>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");

  // Address Book state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressFormData | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);

  const { data: userResponse, mutate: mutateUser } = useSWR<any>(
    "getCurrentUser",
    async () => {
      const data = await callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");
      return data;
    },
    { revalidateOnFocus: false, fallbackData: initialUser }
  );

  const { data: addressesResponse, mutate: mutateAddresses } = useSWR(
    "getUserAddresses",
    async () => {
      const res = await getUserAddressesAction();
      return res.data || [];
    },
    { revalidateOnFocus: false }
  );

  const addresses = addressesResponse || [];

  useEffect(() => {
    if (userResponse && "id" in userResponse) {
      const currentStoredUser = useUserStore.getState().user;
      const data = userResponse as any;
      const userProfile = {
        id: data.id,
        address: data.address || currentStoredUser?.address || initialUser?.address || "",
        city: data.city || currentStoredUser?.city || initialUser?.city || "",
        zip: data.postal_code || currentStoredUser?.zip || initialUser?.zip || "",
        email: data.email ?? initialUser?.email ?? "",
        fullname: data.fullname ?? initialUser?.fullname ?? "",
        phone: data.phone ?? initialUser?.phone ?? "",
        role: data.role ?? initialUser?.role ?? "",
      };
      setProfile(userProfile);
      useUserStore.getState().setUser(userProfile);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [userResponse, initialUser]);

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
    setSaveError("");

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
    setSaveError("");

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
    callAction(() => updateProfileAction({
      fullname: profile.fullname,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      postal_code: profile.zip,
    }), "Không thể cập nhật hồ sơ. Vui lòng thử lại sau.").then((res) => {
      setIsSaving(false);
      if ("error" in res && res.error) {
        const message = getFriendlyResponseError(res.error);
        if (message.toLowerCase().includes("số điện thoại")) {
          setErrors((currentErrors) => ({
            ...currentErrors,
            phone: message,
          }));
        } else {
          setSaveError(message);
        }
      } else {
        updateUser({
          fullname: profile.fullname,
          phone: profile.phone,
        });

        toast.success("Cập nhật thông tin thành công");
      }
    }).catch((err) => {
      setIsSaving(false);
      toast.error(err instanceof Error ? err.message : "Cập nhật profile thất bại");
    });
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const result = await callAction(() => logoutUser(), "Không thể đăng xuất. Vui lòng thử lại sau.");

    if (!result.success) {
      const errorMsg = (result as { error?: string }).error;
      const message = errorMsg ? getFriendlyResponseError(errorMsg) : "Đăng xuất thất bại";
      toast.error(message);
      setIsLoggingOut(false);
      return;
    }

    localStorage.removeItem("remember");
    clearUser();
    clearCart();
    useSupportStore.getState().clearSupport();
    toast.success("Đăng xuất thành công");

    window.setTimeout(() => {
      router.replace("/login");
      router.refresh();
    }, 900);
  };

  const handleSaveAddress = async (data: AddressFormData) => {
    const previousAddresses = addressesResponse;
    const isUpdate = !!data.id;
    
    mutateAddresses(
      (current = []) => {
        if (isUpdate) {
          return current.map((addr: any) => addr.id === data.id ? { ...addr, ...data } : addr);
        } else {
          return [...current, { id: 'temp-id', ...data, is_default: current.length === 0 }];
        }
      },
      false
    );

    try {
      if (isUpdate) {
        const res = await updateAddressAction(data.id!, data);
        if (res.error) throw new Error(res.error);
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        const res = await createAddressAction(data);
        if (res.error) throw new Error(res.error);
        toast.success("Thêm địa chỉ thành công");
      }
      mutateAddresses();
    } catch (err: any) {
      toast.error(err.message || "Lỗi lưu địa chỉ");
      mutateAddresses(previousAddresses, false);
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteAddressId) return;
    const previousAddresses = addressesResponse;
    mutateAddresses((current = []) => current.filter((addr: any) => addr.id !== deleteAddressId), false);
    setDeleteAddressId(null);
    try {
      const res = await deleteAddressAction(deleteAddressId);
      if (res.error) throw new Error(res.error);
      toast.success("Xóa địa chỉ thành công");
      mutateAddresses();
    } catch (err: any) {
      toast.error(err.message || "Lỗi xóa địa chỉ");
      mutateAddresses(previousAddresses, false);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const previousAddresses = addressesResponse;
    mutateAddresses((current = []) => current.map((addr: any) => ({ ...addr, is_default: addr.id === id })), false);
    
    try {
      const res = await setDefaultAddressAction(id);
      if (res.error) throw new Error(res.error);
      toast.success("Đã đặt làm địa chỉ mặc định");
      mutateAddresses();
    } catch (err: any) {
      toast.error(err.message || "Lỗi cập nhật địa chỉ mặc định");
      mutateAddresses(previousAddresses, false);
    }
  };

  return (
    <main 
      className="min-h-screen text-[#F5F0E8] relative bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/assets/option_background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      
      <div className="relative z-10 pt-24 pb-16">
        <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:py-10 lg:py-12">
          
          <div className="flex flex-col gap-8">
            {/* Thông tin tài khoản */}
            <div className="rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] sm:p-7 md:p-9 lg:p-10">
              <h2 className="relative mb-7 pb-4 font-serif text-[1.55rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-14 after:bg-[#D6A15F] sm:text-[1.9rem]">
                Thông Tin Cá Nhân
              </h2>

              {isLoading ? (
                <div className="flex h-40 flex-col items-center justify-center gap-3">
                  <LoadingState type="default" label="Đang tải thông tin cá nhân..." className="border-0 bg-transparent shadow-none" />
                </div>
              ) : error ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="text-lg text-red-400 font-medium">{error}</div>
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
                      disabled
                    />
                    <Field
                      id="phone"
                      label="Số Điện Thoại"
                      type="tel"
                      value={profile.phone}
                      onChange={updateField}
                      error={errors.phone}
                    />
                  </div>

                  {saveError && (
                    <p className="mt-5 text-sm font-medium text-red-400">
                      {saveError}
                    </p>
                  )}

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      id="profile-submit-btn"
                      type="submit"
                      disabled={isSaving}
                      className="rounded-full border-0 bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] px-8 py-3.5 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#2C1810] shadow-[0_6px_24px_rgba(214,161,95,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:px-10 sm:text-[0.8rem]"
                    >
                      {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
                    </button>
                    <Link
                      href="/profile/changePassword"
                      className="rounded-full border border-[#D6A15F]/50 bg-transparent px-6 py-3.5 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#D6A15F] transition hover:bg-[#D6A15F] hover:text-[#2C1810] sm:text-[0.8rem] text-center"
                    >
                      Đổi Mật Khẩu
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="rounded-full border border-[#F5F0E8]/30 bg-transparent px-6 py-3.5 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] transition hover:border-red-500 hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[0.8rem]"
                    >
                      {isLoggingOut ? "Đang Đăng Xuất..." : "Đăng Xuất"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Sổ Địa Chỉ */}
            {!isLoading && !error && (
              <div className="rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] sm:p-7 md:p-9 lg:p-10">
                <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="relative pb-4 font-serif text-[1.55rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-14 after:bg-[#D6A15F] sm:text-[1.9rem]">
                    Sổ Địa Chỉ
                  </h2>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setIsAddressModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-full border border-[#D6A15F]/50 bg-[#D6A15F]/10 px-5 py-2.5 text-sm font-medium text-[#D6A15F] transition hover:bg-[#D6A15F] hover:text-[#2C1810]"
                  >
                    <Plus className="h-4 w-4" /> Thêm Địa Chỉ
                  </button>
                </div>

                <div className="grid gap-4">
                  {addresses.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#F5F0E8]/20 p-8 text-center">
                      <MapPin className="mx-auto mb-3 h-8 w-8 text-[#F5F0E8]/40" />
                      <p className="text-[#F5F0E8]/60">Bạn chưa có địa chỉ giao hàng nào</p>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        className={`relative overflow-hidden rounded-xl border ${addr.is_default ? "border-[#D6A15F] bg-[#D6A15F]/5" : "border-[#F5F0E8]/10 bg-black/30"} p-5 transition-colors hover:border-[#D6A15F]/50`}
                      >
                        {addr.is_default && (
                          <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl bg-[#D6A15F] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1A0506]">
                            <Star className="h-3 w-3 fill-current" /> Mặc định
                          </div>
                        )}
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div>
                            <div className="mb-1 flex items-center gap-3">
                              <span className="font-semibold text-[#F5F0E8]">{addr.fullname}</span>
                              <span className="text-[#F5F0E8]/40">|</span>
                              <span className="text-[#F5F0E8]/80">{addr.phone}</span>
                            </div>
                            <p className="text-[0.95rem] text-[#F5F0E8]/70">
                              {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 border-t border-[#F5F0E8]/10 pt-3">
                          <button
                            onClick={() => {
                              setEditingAddress(addr);
                              setIsAddressModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 text-sm text-[#D6A15F] hover:text-[#E5C07B]"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Chỉnh sửa
                          </button>
                          {!addr.is_default && (
                            <>
                              <button
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-sm text-[#F5F0E8]/60 hover:text-[#D6A15F]"
                              >
                                Thiết lập mặc định
                              </button>
                              <button
                                onClick={() => setDeleteAddressId(addr.id)}
                                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
        defaultFullname={profile.fullname}
        defaultPhone={profile.phone}
      />

      <ModalDeleteConfirmClient
        open={!!deleteAddressId}
        itemName="địa chỉ này"
        isDeleting={false}
        title="Xóa địa chỉ?"
        confirmLabel="Xóa"
        onClose={() => setDeleteAddressId(null)}
        onConfirm={handleDeleteAddress}
      />
    </main>
  );
}
