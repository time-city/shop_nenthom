"use client";

import {
  Field,
  Form,
  Formik,
  type FormikErrors,
  type FormikHelpers,
} from "formik";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useToast } from "@/src/components/ui/toast-provider";
import { resetPassword as resetPasswordAction, resendResetPasswordOtp } from "../../lib/action/auth.action";
import type { ResetPasswordValues } from "../../lib/types/client";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";

const initialValues: ResetPasswordValues = {
  confirmPassword: "",
  newPassword: "",
  otp: "",
};

const resetEmailKey = "passwordResetEmail";
const resetTokenKey = "passwordResetToken";

const validateResetPassword = (values: ResetPasswordValues, step: "otp" | "password") => {
  if (step === "otp") {
    const otpResult = z
      .string()
      .trim()
      .regex(/^\d{6}$/, "Mã OTP gồm 6 số")
      .safeParse(values.otp);
    if (!otpResult.success) {
      return { otp: otpResult.error.issues[0].message };
    }
    return {};
  } else {
    const passwordResult = z
      .object({
        confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
        newPassword: z
          .string()
          .min(1, "Vui lòng nhập mật khẩu mới")
          .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
      })
      .refine((v) => v.newPassword === v.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
      })
      .safeParse({
        confirmPassword: values.confirmPassword,
        newPassword: values.newPassword,
      });

    if (passwordResult.success) return {};

    const errors: FormikErrors<ResetPasswordValues> = {};
    passwordResult.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof ResetPasswordValues;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    });
    return errors;
  }
};

export default function FormResetPassword() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"otp" | "password">("otp");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Không tìm thấy email đăng ký");
      return;
    }
    setIsResending(true);
    try {
      const result = await resendResetPasswordOtp({ email });
      if (result.success) {
        toast.success(result.message || "Đã gửi lại mã OTP vào email của bạn");
        setCountdown(60);
      } else {
        toast.error(result.error ? getFriendlyResponseError(result.error) : "Gửi lại OTP thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi lại OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (
    value: string,
    index: number,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const cleaned = value.replace(/\D/g, "");
    const newDigits = [...otpDigits];
    
    if (!cleaned) {
      newDigits[index] = "";
    } else {
      newDigits[index] = cleaned[cleaned.length - 1];
    }
    
    setOtpDigits(newDigits);
    setFieldValue("otp", newDigits.join(""));

    if (cleaned && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`) as HTMLInputElement | null;
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const cleaned = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (cleaned.length > 0) {
      const newDigits = Array(6).fill("");
      for (let i = 0; i < cleaned.length; i++) {
        newDigits[i] = cleaned[i];
      }
      setOtpDigits(newDigits);
      setFieldValue("otp", newDigits.join(""));
      
      const focusIndex = Math.min(cleaned.length, 5);
      const targetInput = document.getElementById(`otp-digit-${focusIndex}`) as HTMLInputElement | null;
      targetInput?.focus();
    }
  };

  useEffect(() => {
    const queryEmail = searchParams.get("email") ?? "";
    const queryToken = searchParams.get("token") ?? "";
    const storedEmail = sessionStorage.getItem(resetEmailKey) ?? "";
    const storedToken = sessionStorage.getItem(resetTokenKey) ?? "";

    const nextEmail = queryEmail || storedEmail;
    const nextToken = queryToken || storedToken;

    setEmail(nextEmail);
    setToken(nextToken);

    if (queryEmail) sessionStorage.setItem(resetEmailKey, queryEmail);
    if (queryToken) sessionStorage.setItem(resetTokenKey, queryToken);
  }, [searchParams]);

  const handleSubmit = async (
    values: ResetPasswordValues,
    actions: FormikHelpers<ResetPasswordValues>,
  ) => {
    if (!email || !token) {
      const message = "Phiên đặt lại mật khẩu không hợp lệ";
      setErrorMessage(message);
      toast.error(message);
      actions.setSubmitting(false);
      return;
    }

    // action-(đặt lại mật khẩu bằng OTP)
    const result = await resetPasswordAction({
      email,
      newPassword: values.newPassword,
      otp: values.otp.trim(),
      token,
    });

    if (!result.success) {
      const message = result.error ? getFriendlyResponseError(result.error) : "OTP sai hoặc đã hết hạn";
      setErrorMessage(message);
      toast.error(message);
      actions.setSubmitting(false);
      return;
    }

    sessionStorage.removeItem(resetEmailKey);
    sessionStorage.removeItem(resetTokenKey);
    setErrorMessage("");
    toast.success("Đổi mật khẩu thành công");
    router.replace("/login");
  };

  return (
    <main className="h-dvh overflow-hidden bg-[#7A1218]">
      <div className="flex h-full flex-col">
        <section className="flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
          <div className="relative w-full max-w-[450px] rounded-[22px] border border-[#f5f0e8]/20 bg-[#F5F0E8] px-5 py-6 text-[#2C1810] shadow-[0_24px_70px_rgba(30,6,8,0.28)] sm:px-8 sm:py-8">
            <button
              type="button"
              onClick={() => {
                if (step === "password") {
                  setStep("otp");
                } else {
                  router.push("/forgot-password");
                }
              }}
              className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full border border-[#7A1218]/15 bg-[#F8F0E4] text-lg text-[#7A1218] transition hover:bg-[#7A1218] hover:text-[#F5F0E8]"
              aria-label="Quay lại"
            >
              ←
            </button>

            <p className="mb-2 text-center text-[0.7rem] uppercase tracking-[0.22em] text-[#7A1218]/75">
              ChamCham Studio
            </p>
            <h1 className="text-center font-serif text-[2rem] font-light leading-tight text-[#2C1810] sm:text-[2.22rem]">
              {step === "otp" ? "Nhập OTP" : "Mật khẩu mới"}
            </h1>
            <p className="mb-5 mt-2 text-center text-[0.86rem] leading-relaxed text-[#2c1810]/70">
              {step === "otp"
                ? "Nhập mã 6 số trong email để xác minh tài khoản"
                : "Tạo mật khẩu mới cho tài khoản của bạn"}
            </p>

            {email ? (
              <div className="mb-4 rounded-xl bg-[#F8F0E4] px-3.5 py-3 text-center text-[0.82rem] text-[#2c1810]/70">
                Email: <span className="font-medium text-[#7A1218]">{email}</span>
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mb-4 rounded-xl border border-[#ffc107] bg-[#fff3cd] px-3.5 py-3 text-[0.82rem] text-[#856404]">
                {errorMessage}
              </div>
            ) : null}

            <Formik
              initialValues={initialValues}
              validate={(values) => validateResetPassword(values, step)}
              onSubmit={handleSubmit}
            >
              {({ errors, isSubmitting, touched, values, setFieldValue, setFieldTouched }) => (
                <Form>
                  {step === "otp" ? (
                    <div className="mb-5">
                      <label
                        htmlFor="otp"
                        className="mb-3 block text-center text-[0.68rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                      >
                        Mã OTP
                      </label>
                      <div className="flex justify-center gap-2 max-w-[320px] mx-auto mb-2">
                        {Array(6).fill(0).map((_, index) => (
                          <input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={otpDigits[index] || ""}
                            onChange={(e) => handleOtpChange(e.target.value, index, setFieldValue)}
                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                            onPaste={(e) => handleOtpPaste(e, setFieldValue)}
                            className={`size-11 sm:size-12 rounded-xl border bg-white text-center text-[1.22rem] font-bold text-[#2C1810] transition-colors focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${
                              touched.otp && errors.otp
                                ? "border-[#6B1218]"
                                : "border-[#2c1810]/20"
                            }`}
                            id={`otp-digit-${index}`}
                          />
                        ))}
                      </div>
                      {touched.otp && errors.otp ? (
                        <p className="mt-2 text-center text-xs text-[#6B1218]">{errors.otp}</p>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label
                          htmlFor="newPassword"
                          className="mb-2 block text-[0.68rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                        >
                          Mật khẩu mới
                        </label>
                        <Field
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          placeholder="••••••••"
                          className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.92rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${
                            touched.newPassword && errors.newPassword
                              ? "border-[#6B1218]"
                              : "border-[#2c1810]/20"
                          }`}
                        />
                        {touched.newPassword && errors.newPassword ? (
                          <p className="mt-2 text-xs text-[#6B1218]">
                            {errors.newPassword}
                          </p>
                        ) : null}
                      </div>

                      <div className="mb-5">
                        <label
                          htmlFor="confirmPassword"
                          className="mb-2 block text-[0.68rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                        >
                          Xác nhận mật khẩu
                        </label>
                        <Field
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          className={`min-h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.92rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${
                            touched.confirmPassword && errors.confirmPassword
                              ? "border-[#6B1218]"
                              : "border-[#2c1810]/20"
                          }`}
                        />
                        {touched.confirmPassword && errors.confirmPassword ? (
                          <p className="mt-2 text-xs text-[#6B1218]">
                            {errors.confirmPassword}
                          </p>
                        ) : null}
                      </div>
                    </>
                  )}

                  {step === "otp" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFieldTouched("otp", true);
                        const errors = validateResetPassword(values, "otp");
                        if (errors.otp) {
                          return;
                        }
                        setStep("password");
                      }}
                      className="min-h-12 w-full rounded-full bg-[#7A1218] px-4 py-3.5 text-[0.74rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] shadow-[0_14px_28px_rgba(107,18,24,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] sm:text-[0.8rem]"
                    >
                      Tiếp tục
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="min-h-12 w-full rounded-full bg-[#7A1218] px-4 py-3.5 text-[0.74rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] shadow-[0_14px_28px_rgba(107,18,24,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[0.8rem]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Đang đổi mật khẩu..." : "Đổi Mật Khẩu"}
                    </button>
                  )}
                </Form>
              )}
            </Formik>

            <p className="mt-5 text-center text-[0.84rem] font-light text-[#2C1810]">
              Chưa nhận được mã?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending || countdown > 0}
                className="text-[#7A1218] transition-colors hover:text-[#6B1218] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isResending
                  ? "Đang gửi..."
                  : countdown > 0
                  ? `Gửi lại sau (${countdown}s)`
                  : "Gửi lại OTP"}
              </button>
            </p>
          </div>
        </section>

        <footer className="shrink-0 border-t border-[#f5f0e8]/10 px-4 py-3 text-center text-[0.72rem] tracking-[0.12em] text-[#F5F0E8]/65">
          © 2025 ChamCham · Handcrafted in Việt Nam
        </footer>
      </div>
    </main>
  );
}
