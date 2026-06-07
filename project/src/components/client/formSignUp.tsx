"use client";

import {
  Field,
  Form,
  Formik,
  type FormikErrors,
  type FormikHelpers,
} from "formik";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { registerUser } from "../../lib/action/auth.action";
import ModalOTP from "./modalOTP";

interface SignUpValues {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  terms: boolean;
  newsletter: boolean;
}

type PendingSignUp = {
  email: string;
  fullname: string;
  newsletter: boolean;
  password: string;
  phone: string;
};

type RegisterOtpResponse = {
  error?: string;
  message?: string;
  otp?: string;
  success?: boolean;
};

// fe-(gửi OTP đăng ký)
async function sendRegisterOtp(email: string) {
  try {
    const response = await fetch("/api/auth/register/otp", {
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const result = (await response.json()) as RegisterOtpResponse;

    if (!response.ok || !result.success || !result.otp) {
      return {
        error:
          result.error ??
          result.message ??
          "Email không tồn tại hoặc chưa thể gửi OTP",
      };
    }

    return { otp: result.otp, success: true };
  } catch {
    return { error: "Không thể gửi OTP đến email này" };
  }
}

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
  const [otpCode, setOtpCode] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [pendingSignUp, setPendingSignUp] = useState<PendingSignUp | null>(null);
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);

  const openOtpModal = (data: PendingSignUp, otp: string) => {
    setPendingSignUp(data);
    setOtpCode(otp);
    setOtpOpen(true);
    console.log(`OTP đăng ký: ${otp}`);
    toast.info("Mã OTP đã được gửi đến email");
  };

  const handleSubmit = async (
    values: SignUpValues,
    actions: FormikHelpers<SignUpValues>,
  ) => {
    const fullname = values.fullname.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const password = values.password;

    // fe-(gửi OTP đăng ký)
    const otpResult = await sendRegisterOtp(email);

    if (!otpResult.success || !otpResult.otp) {
      const message = otpResult.error ?? "Không thể gửi OTP";
      console.log(message);
      toast.error(message);
      actions.setSubmitting(false);
      return;
    }

    openOtpModal(
      {
        email,
        fullname,
        newsletter: values.newsletter,
        password,
        phone,
      },
      otpResult.otp,
    );
    actions.setSubmitting(false);
  };

  const handleConfirmOtp = async (otp: string) => {
    if (!pendingSignUp) {
      toast.error("Không tìm thấy thông tin đăng ký tạm");
      return;
    }

    if (otp !== otpCode) {
      const message = "Mã OTP không đúng";
      console.log(message);
      toast.error(message);
      return;
    }

    setIsOtpSubmitting(true);

    // action-(đăng ký)
    const result = await registerUser({
      email: pendingSignUp.email,
      fullname: pendingSignUp.fullname,
      password: pendingSignUp.password,
      phone: pendingSignUp.phone,
    });

    if (!result.success) {
      const message = result.error ?? "Đăng ký thất bại";
      console.log(message);
      toast.error(message);
      setIsOtpSubmitting(false);
      return;
    }

    const message = "Đăng ký thành công! Đang chuyển hướng...";
    console.log(message);
    localStorage.setItem("newsletter", String(pendingSignUp.newsletter));
    toast.success(message);
    setOtpOpen(false);
    setPendingSignUp(null);
    setIsOtpSubmitting(false);

    window.setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  const handleResendOtp = async () => {
    if (!pendingSignUp) {
      return;
    }

    // fe-(gửi lại OTP)
    const otpResult = await sendRegisterOtp(pendingSignUp.email);

    if (!otpResult.success || !otpResult.otp) {
      const message = otpResult.error ?? "Không thể gửi lại OTP";
      console.log(message);
      toast.error(message);
      return;
    }

    openOtpModal(pendingSignUp, otpResult.otp);
  };

  return (
    <main>
      <ModalOTP
        email={pendingSignUp?.email ?? ""}
        isSubmitting={isOtpSubmitting}
        onClose={() => setOtpOpen(false)}
        onConfirm={handleConfirmOtp}
        onResend={handleResendOtp}
        open={otpOpen}
      />
      <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center bg-[#7A1218] px-4 pb-6 pt-24 sm:px-6 sm:pb-8 md:px-8 md:pt-[7.5rem]">
        <div className="max-h-[calc(100dvh-8rem)] w-full max-w-[760px] overflow-auto rounded-2xl border border-[#2c1810]/10 bg-[#F5F0E8] p-6 text-[#2C1810] sm:p-8 md:max-h-[calc(100dvh-9rem)] md:p-12">
          <h1 className="text-center font-serif text-[2rem] font-light leading-tight text-[#2C1810] sm:text-[2.2rem]">
            Đăng Ký
          </h1>
          <p className="mb-7 mt-2 text-center text-[0.86rem] font-normal leading-relaxed text-[#2c1810]/70 sm:mb-8 sm:text-[0.88rem]">
            Tạo tài khoản để lưu các sáng tạo của bạn
          </p>

          <Formik
            initialValues={initialValues}
            validate={validateSignUp}
            onSubmit={handleSubmit}
          >
            {({ errors, isSubmitting, touched }) => (
              <Form>
                <div className="grid grid-cols-1 items-start gap-x-6 md:grid-cols-2">
                  <div className="mb-6">
                    <label
                      htmlFor="fullname"
                      className="mb-2 block text-[0.7rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                    >
                      Họ Tên
                    </label>
                    <Field
                      id="fullname"
                      name="fullname"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className={`w-full border bg-[#F2E8D9] p-3 text-[0.95rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/40 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${
                        touched.fullname && errors.fullname
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

                  <div className="mb-6">
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[0.7rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                    >
                      Email
                    </label>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      className={`w-full border bg-[#F2E8D9] p-3 text-[0.95rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/40 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${
                        touched.email && errors.email
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

                  <div className="mb-6">
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[0.7rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                    >
                      Mật Khẩu
                    </label>
                    <Field
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className={`w-full border bg-[#F2E8D9] p-3 text-[0.95rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/40 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${
                        touched.password && errors.password
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

                  <div className="mb-6">
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-[0.7rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                    >
                      Xác Nhận Mật Khẩu
                    </label>
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className={`w-full border bg-[#F2E8D9] p-3 text-[0.95rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/40 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${
                        touched.confirmPassword && errors.confirmPassword
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

                  <div className="mb-6 md:col-span-2">
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-[0.7rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                    >
                      Số Điện Thoại
                    </label>
                    <Field
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="0123456789"
                      className={`w-full border bg-[#F2E8D9] p-3 text-[0.95rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/40 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${
                        touched.phone && errors.phone
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
                  className="mb-6 flex cursor-pointer items-start text-[0.84rem] leading-relaxed text-[#2c1810]/70 sm:text-[0.85rem]"
                >
                  <Field
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="mr-2 mt-1 cursor-pointer accent-[#7A1218]"
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
                  className="mb-6 flex cursor-pointer items-start text-[0.84rem] leading-relaxed text-[#2c1810]/70 sm:text-[0.85rem]"
                >
                  <Field
                    id="newsletter"
                    name="newsletter"
                    type="checkbox"
                    className="mr-2 mt-1 cursor-pointer accent-[#7A1218]"
                  />
                  <span className="flex-1">
                    Gửi cho tôi các tin tức và ưu đãi từ ChamCham
                  </span>
                </label>

                <button
                  type="submit"
                  className="mb-4 w-full bg-[#7A1218] p-3.5 text-[0.76rem] uppercase tracking-[0.12em] text-[#F5F0E8] transition-colors hover:bg-[#6B1218] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[0.8rem]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
                </button>
              </Form>
            )}
          </Formik>

          <div className="my-6 text-center text-[0.85rem] text-[#2c1810]/45">
            hoặc
          </div>

          <div className="flex items-center justify-between gap-4 text-center">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex size-[34px] shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-lg text-[#7A1218] transition-opacity hover:opacity-85"
              aria-label="Back"
            >
              ←
            </button>
            <p className="m-0 flex-1 text-[0.84rem] font-light leading-relaxed text-[#2C1810] sm:text-[0.85rem]">
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
    </main>
  );
}
