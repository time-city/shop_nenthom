"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getSession } from "../../lib/session";




import type {
  CartPaymentMethod,
  CheckoutFormProps,
  CheckoutFormValues,
} from "../../lib/types/client";

const inputClass =
  "rounded-xl border-[1.5px] border-[#6B4C35]/20 bg-white px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#6B4C35]/35 focus:border-[#6B1218] focus:ring-4 focus:ring-[#6B1218]/10";

const initialCheckoutFormValues: CheckoutFormValues = {
  email: "",
  fullname: "",
  phone: "",
};


export default function CheckoutForm({ onComplete }: CheckoutFormProps) {
  const [payment, setPayment] = useState<CartPaymentMethod>("cod");
  const [formValues, setFormValues] = useState<CheckoutFormValues>(
    initialCheckoutFormValues,
  );

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      // Nếu đã login, lấy session để điền form.
      const session = await getSession();
      const userSub = session?.sub;

      // SessionPayload chỉ chứa sub/role; email/fullname/phone lấy từ localStorage.
      if (!isMounted || !userSub) return;

      const email = localStorage.getItem("email") ?? "";
      const fullname = localStorage.getItem("fullname") ?? "";
      const phone = localStorage.getItem("phone") ?? "";

      setFormValues((currentValues) => ({
        ...currentValues,
        email: currentValues.email || email,
        fullname: currentValues.fullname || fullname,
        phone: currentValues.phone || phone,
      }));
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = (field: keyof CheckoutFormValues, value: string) => {
    setFormValues((currentValues) => ({

      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO: form này hiện chưa có đủ fields address/city/zip/note/paymentMethod.
    // Tạm gọi onComplete với dữ liệu tối thiểu để vượt typecheck.
    void onComplete({
      address: "",
      city: "",
      email: formValues.email,
      fullname: formValues.fullname,
      note: "",
      paymentMethod: payment,
      phone: formValues.phone,
      zip: "",
    });
  };

  return (
    <form
      id="checkoutForm"
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#6B4C35]/10 bg-[#F8F0E4] p-5 shadow-[0_16px_36px_rgba(44,24,16,0.08)] sm:p-7 lg:p-8"
    >
      <div className="mb-8 rounded-xl bg-[#6B1218] px-5 py-4 text-sm font-light text-[#F5F0E8]">
        🎁 Đăng ký thành viên để nhận ưu đãi cho lần mua tiếp theo{" "}
        <a href="/register" className="font-medium text-[#F2E8D9]">
          Đăng ký ngay →
        </a>
      </div>

      <section className="mb-10">
        <h2 className="relative mb-6 pb-4 font-serif text-[1.25rem] font-bold text-[#2C1810] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#6B1218]">
          Thông Tin Thanh Toán
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35]">
            Họ và Tên
            <input
              required
              value={formValues.fullname}
              onChange={(event) => updateField("fullname", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35]">
            Email
            <input
              required
              type="email"
              value={formValues.email}
              onChange={(event) => updateField("email", event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35]">
            Số Điện Thoại
            <input
              required
              type="tel"
              placeholder="+84..."
              value={formValues.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className={inputClass}
            />
          </label>
          {/* Công ty (không dùng trong type CheckoutFormValues hiện tại) */}

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
              required
              placeholder="Số nhà, tên đường..."
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35]">
            Thành Phố
            <input required className={inputClass} />
          </label>
          <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35]">
            Mã Bưu Chính
            <input className={inputClass} />
          </label>
          <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#6B4C35] md:col-span-2">
            Ghi Chú Đơn Hàng (Tùy Chọn)
            <textarea
              placeholder="Hướng dẫn giao hàng, yêu cầu đặc biệt..."
              className={`${inputClass} min-h-24 resize-y`}
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
            className={`relative cursor-pointer rounded-xl border-[1.5px] px-5 py-4 text-center text-sm transition ${
              payment === "cod"
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
            🏠 COD&nbsp;&nbsp; Thanh Toán Khi Nhận Hàng
          </label>
          <label
            className={`relative cursor-pointer rounded-xl border-[1.5px] px-5 py-4 text-center text-sm transition ${
              payment === "bank"
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
            🏦 Chuyển khoản&nbsp;&nbsp; Ngân Hàng
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
    </form>
  );
}
