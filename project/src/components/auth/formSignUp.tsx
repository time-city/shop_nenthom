"use client";

import {
  Field,
  Form,
  Formik,
  type FormikErrors,
  type FormikHelpers,
} from "formik";
import Link from "next/link";
import { type ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { registerUser } from "../../lib/action/auth.action";
import type { SignUpValues } from "../../lib/types/client";

const initialValues: SignUpValues = {
  fullname: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  terms: false,
  newsletter: false,
};

const signUpSchema = z
  .object({
    fullname: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập họ tên")
      .min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email")
      .email("Email không đúng định dạng"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    phone: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập số điện thoại")
      .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, "Số điện thoại không hợp lệ"),
    terms: z.boolean().refine((value) => value, {
      message: "Vui lòng đồng ý với Điều khoản dịch vụ",
    }),
    newsletter: z.boolean(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

const validateSignUp = (values: SignUpValues) => {
  const result = signUpSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<FormikErrors<SignUpValues>>(
    (errors, issue) => {
      const field = issue.path[0] as keyof SignUpValues | undefined;

      if (field && !errors[field]) {
        errors[field] = issue.message;
      }

      return errors;
    },
    {},
  );
};

export default function FormSignUp() {
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [isTermsPopupVisible, setIsTermsPopupVisible] = useState(false);

  useEffect(() => {
    if (!showTermsPopup) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsTermsPopupVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [showTermsPopup]);

  const closeTermsPopup = () => {
    setIsTermsPopupVisible(false);

    window.setTimeout(() => {
      setShowTermsPopup(false);
    }, 220);
  };

  const handleSubmit = async (
    values: SignUpValues,
    actions: FormikHelpers<SignUpValues>,
  ) => {
    const fullname = values.fullname.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const password = values.password;

    // action-(đăng ký)
    const result = await registerUser({
      email,
      fullname,
      password,
      phone,
    });

    if (!result.success) {
      const message = result.error ?? "Đăng ký thất bại";
      toast.error(message);
      actions.setSubmitting(false);
      return;
    }

    const message = "Đăng ký thành công! Đang chuyển hướng...";
    localStorage.setItem("newsletter", String(values.newsletter));
    toast.success(message);
    actions.setSubmitting(false);

    window.setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  return (
    <main className="h-dvh overflow-hidden bg-[#7A1218]">
      <div className="flex h-full flex-col">
        <section className="flex min-h-0 flex-1 items-center justify-center px-3 py-3 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-[620px] rounded-[22px] border border-[#f5f0e8]/20 bg-[#F5F0E8] px-4 py-4 text-[#2C1810] shadow-[0_24px_70px_rgba(30,6,8,0.28)] sm:px-6 sm:py-5 lg:px-7">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full border border-[#7A1218]/15 bg-[#F8F0E4] text-lg text-[#7A1218] transition hover:bg-[#7A1218] hover:text-[#F5F0E8]"
              aria-label="Quay lại"
            >
              ←
            </button>
            <p className="mb-2 text-center text-[0.7rem] uppercase tracking-[0.22em] text-[#7A1218]/75">
              ChamCham Studio
            </p>
            <h1 className="text-center font-serif text-[1.85rem] font-light leading-tight text-[#2C1810] sm:text-[2.1rem]">
              Đăng Ký
            </h1>
            <p className="mb-4 mt-1.5 text-center text-[0.82rem] font-normal leading-relaxed text-[#2c1810]/70">
              Tạo tài khoản để lưu các sáng tạo của bạn
            </p>

          <Formik
            initialValues={initialValues}
            validate={validateSignUp}
            onSubmit={handleSubmit}
          >
            {({ errors, isSubmitting, setFieldValue, touched, values }) => (
              <Form>
                <div className="grid grid-cols-1 items-start gap-x-4 sm:grid-cols-2">
                  <div className="mb-3">
                    <label
                      htmlFor="fullname"
                      className="mb-2 block text-[0.68rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                    >
                      Họ Tên
                    </label>
                    <Field
                      id="fullname"
                      name="fullname"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className={`min-h-10 w-full rounded-xl border bg-white px-3.5 py-2 text-[0.9rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${touched.fullname && errors.fullname
                        ? "border-[#ffc107]"
                        : "border-[#2c1810]/20"
                        }`}
                    />
                    {touched.fullname && errors.fullname ? (
                      <p className="mt-2 text-xs text-[#856404]">
                        {errors.fullname}
                      </p>
                    ) : null}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[0.68rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                    >
                      Email
                    </label>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      className={`min-h-10 w-full rounded-xl border bg-white px-3.5 py-2 text-[0.9rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${touched.email && errors.email
                        ? "border-[#ffc107]"
                        : "border-[#2c1810]/20"
                        }`}
                    />
                    {touched.email && errors.email ? (
                      <p className="mt-2 text-xs text-[#856404]">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[0.68rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                    >
                      Mật Khẩu
                    </label>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className={`min-h-10 w-full rounded-xl border bg-white px-3.5 py-2 text-[0.9rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${touched.password && errors.password
                        ? "border-[#ffc107]"
                        : "border-[#2c1810]/20"
                        }`}
                    />
                    {touched.password && errors.password ? (
                      <p className="mt-2 text-xs text-[#856404]">
                        {errors.password}
                      </p>
                    ) : null}
                    <div className="mt-1 text-[0.72rem] leading-relaxed text-[#7A1218] sm:text-xs">
                      Tối thiểu 6 ký tự
                    </div>
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-[0.68rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                    >
                      Xác Nhận Mật Khẩu
                    </label>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className={`min-h-10 w-full rounded-xl border bg-white px-3.5 py-2 text-[0.9rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${touched.confirmPassword && errors.confirmPassword
                        ? "border-[#ffc107]"
                        : "border-[#2c1810]/20"
                        }`}
                    />
                    {touched.confirmPassword && errors.confirmPassword ? (
                      <p className="mt-2 text-xs text-[#856404]">
                        {errors.confirmPassword}
                      </p>
                    ) : null}
                  </div>

                  <div className="mb-3 sm:col-span-2">
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-[0.68rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                    >
                      Số Điện Thoại
                    </label>
                    <Field
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="0123456789"
                      className={`min-h-10 w-full rounded-xl border bg-white px-3.5 py-2 text-[0.9rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${touched.phone && errors.phone
                        ? "border-[#ffc107]"
                        : "border-[#2c1810]/20"
                        }`}
                    />
                    {touched.phone && errors.phone ? (
                      <p className="mt-2 text-xs text-[#856404]">
                        {errors.phone}
                      </p>
                    ) : null}
                  </div>
                </div>

                <label
                  htmlFor="terms"
                  className="mb-3 flex cursor-pointer items-start text-[0.8rem] leading-relaxed text-[#2c1810]/70 sm:text-[0.84rem]"
                >
                  <Field
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={values.terms}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const checked = event.target.checked;
                      void setFieldValue("terms", checked);

                      if (checked) {
                        setShowTermsPopup(true);
                      }
                    }}
                    className="mr-2 mt-1 size-4 shrink-0 cursor-pointer accent-[#7A1218]"
                  />
                  <span className="flex-1">
                    Tôi đồng ý với{" "}
                    <Link href="#" className="text-[#8B7355] no-underline">
                      Điều khoản dịch vụ
                    </Link>{" "}
                    và{" "}
                    <Link href="#" className="text-[#8B7355] no-underline">
                      Chính sách riêng tư
                    </Link>
                  </span>
                </label>
                {touched.terms && errors.terms ? (
                  <p className="-mt-1 mb-3 text-xs text-[#856404]">
                    {errors.terms}
                  </p>
                ) : null}

                <label
                  htmlFor="newsletter"
                  className="mb-4 flex cursor-pointer items-start text-[0.8rem] leading-relaxed text-[#2c1810]/70 sm:text-[0.84rem]"
                >
                  <Field
                    id="newsletter"
                    name="newsletter"
                    type="checkbox"
                    className="mr-2 mt-1 size-4 shrink-0 cursor-pointer accent-[#7A1218]"
                  />
                  <span className="flex-1">
                    Gửi cho tôi các tin tức và ưu đãi từ ChamCham
                  </span>
                </label>

                <button
                  type="submit"
                  className="mb-2 min-h-11 w-full rounded-full bg-[#7A1218] px-4 py-3 text-[0.74rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] shadow-[0_14px_28px_rgba(107,18,24,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[0.8rem]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
                </button>

                {showTermsPopup ? (
                  <div
                    className={`fixed inset-0 z-[200] flex items-center justify-center bg-[#2C1810]/55 px-4 py-6 backdrop-blur-sm transition-opacity duration-300 ease-out ${isTermsPopupVisible ? "opacity-100" : "opacity-0"
                      }`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="terms-popup-title"
                  >
                    <div
                      className={`w-full max-w-[520px] rounded-2xl border border-[#6B1218]/15 bg-[#F8F0E4] p-5 text-[#2C1810] shadow-[0_24px_70px_rgba(30,6,8,0.35)] transition-all duration-300 ease-out sm:p-7 ${isTermsPopupVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
                        }`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h2
                            id="terms-popup-title"
                            className="font-serif text-[1.45rem] font-semibold leading-tight text-[#6B1218] sm:text-[1.7rem]"
                          >
                            Điều khoản & Chính sách
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-[#6B4C35]">
                            Cảm ơn bạn đã đồng ý với các điều khoản của ChamCham.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={closeTermsPopup}
                          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#6B1218]/20 text-lg text-[#6B1218] transition hover:bg-[#6B1218] hover:text-[#F5F0E8]"
                          aria-label="Đóng popup điều khoản"
                        >
                          ×
                        </button>
                      </div>

                      <div className="space-y-3 rounded-xl bg-[#F2E8D9] p-4 text-[0.85rem] leading-7 text-[#2C1810]/80">
                        <p>
                          Chúng tôi chỉ sử dụng thông tin đăng ký để quản lý tài
                          khoản, hỗ trợ đơn hàng và cá nhân hóa trải nghiệm mua
                          sắm của bạn.
                        </p>
                        <p>
                          Bạn có thể cập nhật thông tin cá nhân hoặc đăng xuất
                          khỏi tài khoản bất cứ lúc nào trong trang hồ sơ.
                        </p>
                        <p>
                          Khi tiếp tục, bạn xác nhận thông tin cung cấp là chính
                          xác và đồng ý nhận hỗ trợ từ ChamCham khi cần thiết.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={closeTermsPopup}
                        className="mt-5 min-h-11 w-full rounded-full bg-[#7A1218] px-5 py-3 text-[0.76rem] font-medium uppercase tracking-[0.12em] text-[#F5F0E8] transition hover:bg-[#4A0C10]"
                      >
                        Tôi đã hiểu
                      </button>
                    </div>
                  </div>
                ) : null}
              </Form>
            )}
          </Formik>

          <div className="my-2 text-center text-[0.8rem] text-[#2c1810]/45 sm:text-[0.84rem]">
            hoặc
          </div>

          <div className="text-center">
            <p className="m-0 text-[0.8rem] font-light leading-relaxed text-[#2C1810] sm:text-[0.84rem]">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-[0.85rem] text-[#7A1218] no-underline transition-colors hover:text-[#6B1218]"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
        </section>

        <footer className="shrink-0 border-t border-[#f5f0e8]/10 px-4 py-3 text-center text-[0.72rem] tracking-[0.12em] text-[#F5F0E8]/65">
          © 2025 ChamCham · Handcrafted in Việt Nam
        </footer>
      </div>
    </main>
  );
}
