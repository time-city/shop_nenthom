"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getCurrentUser } from "../../lib/action/user.action";
import { useUserStore } from "@/src/store/useUserStore";
import type {
  CartPaymentMethod,
  CheckoutFormProps,
  CheckoutFormValues,
} from "../../lib/types/client";

interface FullFormValues {
  fullname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  note: string;
}

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
      const user = await getCurrentUser();

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
  }, []);

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

  const getInputClass = (fieldName: keyof FullFormValues) => {
    const hasError = Boolean(errors[fieldName]);
    return `rounded-xl border-[1.5px] ${hasError
        ? "border-[#6B1218] focus:ring-[#6B1218]/10"
        : "border-[#6B4C35]/20 focus:border-[#6B1218] focus:ring-[#6B1218]/10"
      } bg-white px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#6B4C35]/35 focus:ring-4`;
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
      className="rounded-2xl border border-[#6B4C35]/10 bg-[#F8F0E4] p-5 shadow-[0_16px_36px_rgba(44,24,16,0.08)] sm:p-7 lg:p-8"
    >
      <fieldset disabled={isSubmitting} className="contents">
        {!hasSession && (
          <div className="mb-8 rounded-xl bg-[#6B1218] px-5 py-4 text-sm font-light text-[#F5F0E8]">
            🎁 Đăng ký thành viên để nhận ưu đãi cho lần mua tiếp theo{" "}
            <a href="/register" className="font-medium text-[#F2E8D9]">
              Đăng ký ngay →
            </a>
          </div>
        )}

        <section className="mb-10">
          <h2 className="relative mb-6 pb-4 font-serif text-[1.25rem] font-bold text-[#2C1810] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#6B1218]">
            Thông Tin Thanh Toán
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35]">
              Họ và Tên
              <input
                type="text"
                name="fullname"
                value={formValues.fullname}
                onChange={(event) => handleChange("fullname", event.target.value)}
                className={getInputClass("fullname")}
              />
              {errors.fullname && (
                <span className="text-xs text-[#6B1218] mt-1 normal-case tracking-normal font-medium">
                  {errors.fullname}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35]">
              Email
              <input
                type="text"
                name="email"
                value={formValues.email}
                onChange={(event) => handleChange("email", event.target.value)}
                className={getInputClass("email")}
              />
              {errors.email && (
                <span className="text-xs text-[#6B1218] mt-1 normal-case tracking-normal font-medium">
                  {errors.email}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35]">
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
                <span className="text-xs text-[#6B1218] mt-1 normal-case tracking-normal font-medium">
                  {errors.phone}
                </span>
              )}
            </label>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="relative mb-6 pb-4 font-serif text-[1.25rem] font-bold text-[#2C1810] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#6B1218]">
            Địa Chỉ Giao Hàng
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35] md:col-span-2">
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
                <span className="text-xs text-[#6B1218] mt-1 normal-case tracking-normal font-medium">
                  {errors.address}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35]">
              Thành Phố
              <input
                type="text"
                name="city"
                value={formValues.city}
                onChange={(event) => handleChange("city", event.target.value)}
                className={getInputClass("city")}
              />
              {errors.city && (
                <span className="text-xs text-[#6B1218] mt-1 normal-case tracking-normal font-medium">
                  {errors.city}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35]">
              Mã Bưu Chính
              <input
                type="text"
                name="zip"
                value={formValues.zip}
                onChange={(event) => handleChange("zip", event.target.value)}
                className={getInputClass("zip")}
              />
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35] md:col-span-2">
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
          <h2 className="relative mb-6 pb-4 font-serif text-[1.25rem] font-bold text-[#2C1810] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#6B1218]">
            Phương Thức Thanh Toán
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label
              className={`relative cursor-pointer rounded-xl border-[1.5px] px-5 py-4 text-center text-sm transition ${payment === "cod"
                  ? "border-[#6B1218] bg-[#6B1218]/5 text-[#2C1810]"
                  : "border-[#6B4C35]/20 bg-white text-[#2C1810]"
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
              className={`relative cursor-pointer rounded-xl border-[1.5px] px-5 py-4 text-center text-sm transition ${payment === "bank"
                  ? "border-[#6B1218] bg-[#6B1218]/5 text-[#2C1810]"
                  : "border-[#6B4C35]/20 bg-white text-[#2C1810]"
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
            <div className="mt-5 rounded-xl bg-white p-4 text-sm leading-7 text-[#6B4C35]">
              <p>
                <strong>Ngân hàng:</strong> Vietcombank
              </p>
              <p>
                <strong>Số tài khoản:</strong> 1234567890
              </p>
              <p>
                <strong>Chủ tài khoản:</strong> CHAMCHAM
              </p>
            </div>
          ) : null}
        </section>
      </fieldset>
    </form>
  );
}

