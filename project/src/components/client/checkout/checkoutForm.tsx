"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getCurrentUser } from "../../../lib/action/user.action";
import { useUserStore } from "@/src/store/useUserStore";
import type { FullFormValues } from "@/src/interface/clientInterface";
import { PROVINCE_POSTAL_CODE_MAP } from "@/src/lib/utils/provincePostalCodes";
import type {
  CartPaymentMethod,
  CheckoutFormProps,
} from "../../../lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";



const initialCheckoutFormValues: FullFormValues = {
  fullname: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
  note: "",
};

export default function CheckoutForm({ isSubmitting = false, onComplete }: CheckoutFormProps) {
  const { user: storedUser } = useUserStore();
  const [payment, setPayment] = useState<CartPaymentMethod>("cod");
  const [formValues, setFormValues] = useState<FullFormValues>(initialCheckoutFormValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FullFormValues, string>>>({});
  const [hasSession, setHasSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      // action-(lấy user checkout)
      const user = await callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");

      if (!isMounted) return;

      if (user) {
        setHasSession(true);
        // Đọc địa chỉ từ Zustand store (thay vì localStorage)
        const storedAddress = storedUser?.address ?? "";
        const storedCity = storedUser?.city ?? "";
        const storedZip = storedUser?.zip ?? "";

        setFormValues((currentValues) => ({
          ...currentValues,
          email: currentValues.email || user.email || "",
          fullname: currentValues.fullname || user.fullname || "",
          phone: currentValues.phone || user.phone || "",
          address: currentValues.address || user.address || storedAddress,
          city: currentValues.city || user.city || storedCity,
          zip: currentValues.zip || storedZip,
        }));
      } else {
        setHasSession(false);
      }
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [storedUser?.address, storedUser?.city, storedUser?.zip]);

  const validateField = (field: keyof FullFormValues, value: string): string => {
    const trimmed = value.trim();

    // 1. Required check for fullname, email, phone, address, city
    if (["fullname", "email", "phone", "address", "city"].includes(field)) {
      if (!trimmed) {
        return "Vui lòng không để trống";
      }
    }

    // 2. Email format check
    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.(com|vn|net|org|edu|gov|io|co|info|biz|me|cc|us|uk|jp|kr|tw|sg|live|store|shop|online|xyz|pro|work|tech|dev|app|asia|eu|ca|fr|de|au)(?:\.[a-z]{2,})?$/i;
      if (!emailRegex.test(trimmed)) {
        return "Email không đúng định dạng";
      }
    }

    // 3. Phone check: starts with 0 or +84, and has 10 digits
    if (field === "phone") {
      const phoneRegex = /^(0|\+84)\d{9}$/;
      if (!phoneRegex.test(trimmed)) {
        return "Số điện thoại không hợp lệ";
      }
    }

    return "";
  };

  const handleChange = (field: keyof FullFormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

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

  const handleCityChange = (city: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      city,
      zip: city ? PROVINCE_POSTAL_CODE_MAP[city] || currentValues.zip : "",
    }));

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors.city;
      return nextErrors;
    });
  };

  const getInputClass = (fieldName: keyof FullFormValues) => {
    const hasError = Boolean(errors[fieldName]);
    return `rounded-xl border-[1.5px] ${hasError
        ? "border-[#ff6b6b] focus:ring-[#ff6b6b]/20"
        : "border-[#F5F0E8]/20 focus:border-[#D6A15F] focus:ring-[#D6A15F]/20"
      } bg-black/40 px-4 py-3 text-sm text-[#F5F0E8] outline-none transition placeholder:text-[#F5F0E8]/35 focus:ring-4 backdrop-blur-sm`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newErrors: Partial<Record<keyof FullFormValues, string>> = {};
    const fieldsToValidate: Array<keyof FullFormValues> = ["fullname", "email", "phone", "address", "city"];

    fieldsToValidate.forEach((field) => {
      const errorMsg = validateField(field, formValues[field]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0] as keyof FullFormValues;
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.focus();
      }
      return;
    }

    await onComplete({
      address: formValues.address,
      city: formValues.city,
      email: formValues.email,
      fullname: formValues.fullname,
      note: formValues.note,
      paymentMethod: payment,
      phone: formValues.phone,
      zip: formValues.zip,
    });
  };

  return (
    <form
      id="checkoutForm"
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[#F5F0E8]/10 bg-[#F5F0E8]/5 backdrop-blur-md p-5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] sm:p-7 lg:p-8"
    >
      <fieldset disabled={isSubmitting} className="contents">
        {!hasSession && (
          <div className="mb-8 rounded-xl bg-[#3a080f]/80 px-5 py-4 text-sm font-light text-[#F5F0E8]">
            🎁 Đăng ký thành viên để nhận ưu đãi cho lần mua tiếp theo{" "}
            <a href="/register" className="font-medium text-[#D6A15F] hover:text-[#E5C07B] transition">
              Đăng ký ngay →
            </a>
          </div>
        )}

        <section className="mb-10">
          <h2 className="relative mb-6 pb-4 font-serif text-[1.25rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#D6A15F]">
            Thông Tin Thanh Toán
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Họ và Tên
              <input
                type="text"
                name="fullname"
                value={formValues.fullname}
                onChange={(event) => handleChange("fullname", event.target.value)}
                className={getInputClass("fullname")}
              />
              {errors.fullname && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.fullname}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Email
              <input
                type="text"
                name="email"
                value={formValues.email}
                onChange={(event) => handleChange("email", event.target.value)}
                className={getInputClass("email")}
              />
              {errors.email && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.email}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Số Điện Thoại
              <input
                type="text"
                name="phone"
                placeholder="+84..."
                value={formValues.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                className={getInputClass("phone")}
              />
              {errors.phone && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.phone}
                </span>
              )}
            </label>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="relative mb-6 pb-4 font-serif text-[1.25rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#D6A15F]">
            Địa Chỉ Giao Hàng
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70 md:col-span-2">
              Địa Chỉ
              <input
                type="text"
                name="address"
                placeholder="Số nhà, tên đường..."
                value={formValues.address}
                onChange={(event) => handleChange("address", event.target.value)}
                className={getInputClass("address")}
              />
              {errors.address && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.address}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Tỉnh / Thành Phố
              <select
                name="city"
                value={formValues.city}
                onChange={(event) => handleCityChange(event.target.value)}
                className={getInputClass("city")}
              >
                <option value="">Chọn tỉnh/thành...</option>
                {Object.keys(PROVINCE_POSTAL_CODE_MAP).map((provinceName) => (
                  <option key={provinceName} value={provinceName}>
                    {provinceName}
                  </option>
                ))}
                {formValues.city && !PROVINCE_POSTAL_CODE_MAP[formValues.city] && (
                  <option value={formValues.city}>{formValues.city}</option>
                )}
              </select>
              {errors.city && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.city}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Mã Bưu Chính
              <input
                type="text"
                name="zip"
                value={formValues.zip}
                readOnly
                className={`${getInputClass("zip")} cursor-not-allowed bg-black/20 text-[#F5F0E8]/50`}
              />
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70 md:col-span-2">
              Ghi Chú Đơn Hàng (Tùy Chọn)
              <textarea
                name="note"
                placeholder="Hướng dẫn giao hàng, yêu cầu đặc biệt..."
                value={formValues.note}
                onChange={(event) => handleChange("note", event.target.value)}
                className={`${getInputClass("note")} min-h-24 resize-y`}
              />
            </label>
          </div>
        </section>

        <section>
          <h2 className="relative mb-6 pb-4 font-serif text-[1.25rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#D6A15F]">
            Phương Thức Thanh Toán
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label
              className={`relative cursor-pointer rounded-xl border-[1.5px] px-5 py-4 text-center text-sm transition backdrop-blur-sm ${payment === "cod"
                  ? "border-[#D6A15F] bg-[#D6A15F]/20 text-[#D6A15F]"
                  : "border-[#F5F0E8]/20 bg-black/40 text-[#F5F0E8]"
                }`}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
                className="sr-only"
              />
              Thanh Toán Khi Nhận Hàng
            </label>
            <label
              className={`relative cursor-pointer rounded-xl border-[1.5px] px-5 py-4 text-center text-sm transition backdrop-blur-sm ${payment === "bank"
                  ? "border-[#D6A15F] bg-[#D6A15F]/20 text-[#D6A15F]"
                  : "border-[#F5F0E8]/20 bg-black/40 text-[#F5F0E8]"
                }`}
            >
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={payment === "bank"}
                onChange={() => setPayment("bank")}
                className="sr-only"
              />
              Chuyển Khoản Ngân Hàng
            </label>
          </div>

          {payment === "bank" ? (
            <div className="mt-5 rounded-xl bg-black/40 border border-[#F5F0E8]/10 p-4 text-sm leading-7 text-[#F5F0E8]/80 backdrop-blur-sm">
              <p>
                <strong className="text-[#F5F0E8]">Ngân hàng:</strong> Vietcombank
              </p>
              <p>
                <strong className="text-[#F5F0E8]">Số tài khoản:</strong> 1234567890
              </p>
              <p>
                <strong className="text-[#F5F0E8]">Chủ tài khoản:</strong> CHAMCHAM
              </p>
            </div>
          ) : null}
        </section>
      </fieldset>
    </form>
  );
}
