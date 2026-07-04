"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import type { Driver } from "driver.js";
import { useToast } from "@/src/components/ui/toast-provider";
import Spinner from "@/src/components/ui/Spinner";
import { logoutUser } from "@/src/lib/action/auth.action";
import { getCurrentUser, updateProfileAction } from "@/src/lib/action/user.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { PROVINCE_POSTAL_CODE_MAP } from "@/src/lib/utils/provincePostalCodes";
import { useUserStore } from "@/src/store/useUserStore";
import { useCartStore } from "@/src/store/useCartStore";
import { useSupportStore } from "@/src/store/useSupportStore";
import type {
  ClientProfileUserData,
  ProfilePageContentProps,
  ProfileFieldProps,
} from "@/src/lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";

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
        className="text-[0.7rem] font-normal uppercase tracking-[0.1em] text-[#6B4C35] sm:text-xs"
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
          ? "border-[#6B1218] focus:ring-[#6B1218]/10"
          : "border-[#6b4e35]/20 focus:border-[#6B1218] focus:ring-[#6B1218]/10"
          } bg-white px-4 py-3 text-[0.95rem] text-[#2C1810] outline-none transition focus:ring-4 disabled:bg-[#F2E8D9]/40 disabled:text-[#6B4C35]/65 disabled:cursor-not-allowed`}
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

  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");
        if (cancelled) return;

        if (data) {
          const currentStoredUser = useUserStore.getState().user;
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

  useEffect(() => {
    if (isLoading) return;

    let activeDriver: Driver | null = null;
    let isCancelled = false;

    const hasSeenGuide = localStorage.getItem("hasSeenProfileGuide");
    if (!hasSeenGuide) {
      const startTour = async () => {
        try {
          const { driver } = await import("driver.js");
          if (isCancelled) return;

          const driverObj = driver({
            showProgress: true,
            nextBtnText: "Tiếp tục",
            prevBtnText: "Quay lại",
            doneBtnText: "Hoàn tất",
            onNextClick: (_element, _step, { driver: currentDriver }) => {
              if (currentDriver.isLastStep()) {
                currentDriver.destroy();
                return;
              }

              currentDriver.moveNext();
            },
            onCloseClick: (_element, _step, { driver: currentDriver }) => {
              currentDriver.destroy();
            },
            steps: [
              {
                element: "#fullname",
                popover: {
                  title: "Họ và Tên",
                  description: "Nhập họ và tên đầy đủ của bạn để hiển thị trên hóa đơn và thông tin giao nhận.",
                  side: "bottom",
                  align: "start"
                }
              },
              {
                element: "#email",
                popover: {
                  title: "Địa chỉ Email",
                  description: "Địa chỉ email dùng để đăng nhập và nhận thông báo về đơn hàng của bạn.",
                  side: "bottom",
                  align: "start"
                }
              },
              {
                element: "#phone",
                popover: {
                  title: "Số Điện Thoại",
                  description: "Nhập số điện thoại liên hệ chính xác để giao nhận hàng.",
                  side: "bottom",
                  align: "start"
                }
              },
              {
                element: "#city",
                popover: {
                  title: "Tỉnh / Thành Phố",
                  description: "Chọn Tỉnh / Thành phố nơi bạn sinh sống để tính toán phí vận chuyển phù hợp.",
                  side: "bottom",
                  align: "start"
                }
              },
              {
                element: "#address",
                popover: {
                  title: "Địa Chỉ Giao Hàng",
                  description: "Ghi cụ thể địa chỉ nhận hàng của bạn (số nhà, đường, quận/huyện,...).",
                  side: "top",
                  align: "start"
                }
              },
              {
                element: "#zip",
                popover: {
                  title: "Mã Bưu Chính",
                  description: "Mã bưu chính (ZIP code) được tự động điền dựa trên Tỉnh / Thành phố đã chọn.",
                  side: "top",
                  align: "start"
                }
              },
              {
                element: "#profile-submit-btn",
                popover: {
                  title: "Lưu Thay Đổi",
                  description: "Nhấn nút này để hoàn tất và lưu các thông tin cập nhật.",
                  side: "top",
                  align: "start"
                }
              }
            ],
            onDestroyed: () => {
              // Lưu vào localStorage khi tour đóng (Hoàn tất, Bỏ qua hoặc đóng X) để không hiện lại
              localStorage.setItem("hasSeenProfileGuide", "true");
            },
            onPopoverRender: (popover) => {
              if (!popover.footerButtons.querySelector(".profile-tour-skip-btn")) {
                const skipBtn = document.createElement("button");
                skipBtn.setAttribute("type", "button");
                skipBtn.className = "profile-tour-skip-btn";
                skipBtn.innerText = "Bỏ qua";
                skipBtn.addEventListener("click", () => {
                  driverObj.destroy();
                });
                popover.footerButtons.insertBefore(skipBtn, popover.footerButtons.firstChild);
              }
            }
          });

          activeDriver = driverObj;

          window.setTimeout(() => {
            if (activeDriver === driverObj && !isCancelled) {
              driverObj.drive();
            }
          }, 600);
        } catch (err) {
          console.error("Failed to load driver.js:", err);
        }
      };
      void startTour();
    }

    return () => {
      isCancelled = true;
      if (activeDriver) {
        activeDriver.destroy();
      }
    };
  }, [isLoading]);

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

  const handleCityChange = (selectedCity: string) => {
    setProfile((current) => {
      const nextZip = selectedCity
        ? PROVINCE_POSTAL_CODE_MAP[selectedCity] || current.zip
        : "";
      return {
        ...current,
        city: selectedCity,
        zip: nextZip,
      };
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next.city;
      delete next.zip;
      return next;
    });
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
        // Lưu thông tin mới vào Zustand store
        updateUser({
          fullname: profile.fullname,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          zip: profile.zip,
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

    // action-(đăng xuất)
    const result = await callAction(() => logoutUser(), "Không thể đăng xuất. Vui lòng thử lại sau.");

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
    clearCart();
    useSupportStore.getState().clearSupport();
    const message = "Đăng xuất thành công";
    toast.success(message);

    window.setTimeout(() => {
      router.replace("/login");
      router.refresh();
    }, 900);
  };

  return (
    <main className="min-h-[calc(100dvh-5rem)] bg-[#F2E8D9] text-[#2C1810]">

      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:py-10 lg:py-12">
        <div className="rounded-2xl bg-[#F8F0E4] p-5 shadow-[0_4px_24px_rgba(44,24,16,0.08)] sm:p-7 md:p-9 lg:p-10">
          <h2 className="relative mb-7 pb-4 font-serif text-[1.55rem] font-bold text-[#2C1810] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-14 after:bg-[#6B1218] sm:text-[1.9rem]">
            Thông Tin Cá Nhân
          </h2>

          {isLoading ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3">
              <Spinner size="lg" />
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
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="city"
                    className="text-[0.7rem] font-normal uppercase tracking-[0.1em] text-[#6B4C35] sm:text-xs"
                  >
                    Tỉnh / Thành Phố
                  </label>
                  <select
                    id="city"
                    value={profile.city}
                    onChange={(event) => handleCityChange(event.target.value)}
                    className={`w-full rounded-[10px] border-[1.5px] ${errors.city
                      ? "border-[#6B1218] focus:ring-[#6B1218]/10"
                      : "border-[#6b4e35]/20 focus:border-[#6B1218] focus:ring-[#6B1218]/10"
                      } bg-white px-4 py-3 text-[0.95rem] text-[#2C1810] outline-none transition focus:ring-4`}
                  >
                    <option value="">Chọn tỉnh/thành...</option>
                    {Object.keys(PROVINCE_POSTAL_CODE_MAP).map((cityName) => (
                      <option key={cityName} value={cityName}>
                        {cityName}
                      </option>
                    ))}
                    {profile.city && !PROVINCE_POSTAL_CODE_MAP[profile.city] && (
                      <option value={profile.city}>{profile.city}</option>
                    )}
                  </select>
                  {errors.city && (
                    <span className="text-xs text-[#6B1218] mt-1 normal-case tracking-normal font-medium">
                      {errors.city}
                    </span>
                  )}
                </div>
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
                  disabled={true}
                  className="md:col-span-2"
                />
              </div>

              {saveError && (
                <p className="mt-5 text-sm font-medium text-[#6B1218]">
                  {saveError}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  id="profile-submit-btn"
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
