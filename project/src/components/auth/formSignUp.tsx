"use client";

import {
  Field,
  Form,
  Formik,
  type FormikErrors,
  type FormikHelpers,
} from "formik";
import Link from "next/link";
import { type ChangeEvent, useState } from "react";
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
    <main>
      <div className="flex min-h-dvh items-center justify-center bg-[#7A1218] px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-[980px] overflow-hidden rounded-[24px] border border-[#f5f0e8]/20 bg-[#F5F0E8] text-[#2C1810] shadow-[0_24px_70px_rgba(30,6,8,0.28)] lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="hidden bg-[#4A0C10] px-9 py-10 text-[#F5F0E8] lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-10 flex size-16 items-center justify-center rounded-full border border-[#F5F0E8]/18 bg-[#7A1218] font-serif text-xl font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.2)]">
                C
              </div>
              <p className="mb-4 text-[0.72rem] uppercase tracking-[0.24em] text-[#F5F0E8]/55">
                ChamCham Studio
              </p>
              <h2 className="font-serif text-[2.6rem] font-light leading-[1.06]">
                Lưu lại hương thơm của riêng bạn.
              </h2>
              <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-[#F5F0E8]/72">
                Tạo tài khoản để theo dõi đơn hàng, lưu cấu hình nến và nhận ưu
                đãi dành riêng cho thành viên.
              </p>
            </div>
            <div className="rounded-2xl border border-[#F5F0E8]/12 bg-[#F5F0E8]/8 p-4 text-sm leading-6 text-[#F5F0E8]/78">
              Nến thủ công, phối hương tinh tế, đóng gói tối giản.
            </div>
          </aside>

          <div className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
            <h1 className="text-center font-serif text-[2rem] font-light leading-tight text-[#2C1810] sm:text-[2.45rem]">
              Đăng Ký
            </h1>
            <p className="mb-6 mt-2 text-center text-[0.84rem] font-normal leading-relaxed text-[#2c1810]/70 sm:text-[0.9rem]">
              Tạo tài khoản để lưu các sáng tạo của bạn
            </p>

          <Formik
            initialValues={initialValues}
            validate={validateSignUp}
            onSubmit={handleSubmit}
          >
            {({ errors, isSubmitting, setFieldValue, touched, values }) => (
              <Form>
                <div className="grid grid-cols-1 items-start gap-x-5 sm:grid-cols-2">
                  <div className="mb-4">
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
                      className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.92rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${touched.fullname && errors.fullname
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

                  <div className="mb-4">
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
                      className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.92rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${touched.email && errors.email
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

                  <div className="mb-4">
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
                      className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.92rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${touched.password && errors.password
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

                  <div className="mb-4">
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
                      className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.92rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${touched.confirmPassword && errors.confirmPassword
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

                  <div className="mb-4 sm:col-span-2">
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
                      className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.92rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${touched.phone && errors.phone
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
                  className="mb-4 flex cursor-pointer items-start rounded-xl border border-[#2c1810]/10 bg-[#F8F0E4] px-3.5 py-3 text-[0.8rem] leading-relaxed text-[#2c1810]/70 sm:text-[0.85rem]"
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
                  <p className="-mt-4 mb-6 text-xs text-[#856404]">
                    {errors.terms}
                  </p>
                ) : null}

                <label
                  htmlFor="newsletter"
                  className="mb-5 flex cursor-pointer items-start rounded-xl border border-[#2c1810]/10 bg-[#F8F0E4] px-3.5 py-3 text-[0.8rem] leading-relaxed text-[#2c1810]/70 sm:text-[0.85rem]"
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
                  className="mb-3 min-h-12 w-full rounded-full bg-[#7A1218] px-4 py-3.5 text-[0.74rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] shadow-[0_14px_28px_rgba(107,18,24,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[0.8rem]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
                </button>

                {showTermsPopup ? (
                  <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-[#2C1810]/55 px-4 py-6 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="terms-popup-title"
                  >
                    <div className="w-full max-w-[520px] rounded-2xl border border-[#6B1218]/15 bg-[#F8F0E4] p-5 text-[#2C1810] shadow-[0_24px_70px_rgba(30,6,8,0.35)] sm:p-7">
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
                          onClick={() => setShowTermsPopup(false)}
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
                        onClick={() => setShowTermsPopup(false)}
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

          <div className="my-4 text-center text-[0.82rem] text-[#2c1810]/45 sm:text-[0.85rem]">
            hoặc
          </div>

          <div className="flex items-center justify-between gap-3 text-center sm:gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex size-[34px] shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-lg text-[#7A1218] transition-opacity hover:opacity-85"
              aria-label="Back"
            >
              ←
            </button>
            <p className="m-0 flex-1 text-[0.8rem] font-light leading-relaxed text-[#2C1810] sm:text-[0.85rem]">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-[0.85rem] text-[#7A1218] no-underline transition-colors hover:text-[#6B1218]"
              >
                Đăng nhập
              </Link>
            </p>
            <div className="size-[34px] shrink-0" />
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
