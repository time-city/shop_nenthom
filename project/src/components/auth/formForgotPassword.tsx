"use client";

import {
  Field,
  Form,
  Formik,
  type FormikErrors,
  type FormikHelpers,
} from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { useToast } from "@/src/components/ui/toastProvider";
import { forgotPassword as forgotPasswordAction } from "../../lib/action/auth.action";
import type { ForgotPasswordValues } from "../../lib/types/client";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { callAction } from "@/src/lib/utils/callAction";

const initialValues: ForgotPasswordValues = {
  email: "",
};

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không đúng định dạng"),
});

const resetEmailKey = "passwordResetEmail";
const resetTokenKey = "passwordResetToken";

const validateForgotPassword = (values: ForgotPasswordValues) => {
  const result = forgotPasswordSchema.safeParse(values);

  if (result.success) return {};

  return result.error.issues.reduce<FormikErrors<ForgotPasswordValues>>(
    (errors, issue) => {
      const field = issue.path[0] as keyof ForgotPasswordValues | undefined;

      if (field && !errors[field]) {
        errors[field] = issue.message;
      }

      return errors;
    },
    {},
  );
};

export default function FormForgotPassword() {
  const { toast } = useToast();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    values: ForgotPasswordValues,
    actions: FormikHelpers<ForgotPasswordValues>,
  ) => {
    const email = values.email.trim().toLowerCase();

    // action-(gửi OTP quên mật khẩu)
    const result = await callAction(() => forgotPasswordAction({ email }), "Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.");
    if (!result.success) {
      const message = result.error ? getFriendlyResponseError(result.error) : "Không thể gửi mã OTP";
      setErrorMessage(message);
      actions.setSubmitting(false);
      return;
    }

    const token = result.data?.token;

    if (!token) {
      const message = "Không nhận được token đặt lại mật khẩu";
      setErrorMessage(message);
      toast.error(message);
      actions.setSubmitting(false);
      return;
    }

    sessionStorage.setItem(resetEmailKey, email);
    sessionStorage.setItem(resetTokenKey, token);
    setErrorMessage("");
    toast.success(result.message ?? "Đã gửi mã OTP đến email của bạn");
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <main 
      className="h-dvh overflow-hidden bg-cover bg-center bg-no-repeat relative animate-bg-fade"
      style={{ backgroundImage: "url('/option_background.jpg')" }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes page-enter {
          0% { opacity: 0; transform: translateY(30px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-page-enter {
          animation: page-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes bg-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-bg-fade {
          animation: bg-fade-in 0.8s ease-out forwards;
        }
      `}} />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <button
        type="button"
        onClick={() => router.push("/login")}
        className="group fixed left-6 top-6 flex size-10 items-center justify-center rounded-full border border-[#F5F0E8]/30 bg-[#F5F0E8]/15 text-lg text-[#F5F0E8] backdrop-blur-sm transition hover:bg-[#F5F0E8] hover:text-[#6B1218] z-50 animate-bg-fade"
        aria-label="Quay lại đăng nhập"
      >
        <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span>
      </button>
      <div className="relative z-10 flex h-full flex-col">
        <section className="flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
          <div className="animate-page-enter relative w-full max-w-[430px] rounded-[22px] border border-[#f5f0e8]/40 bg-[#F5F0E8]/95 px-5 py-6 text-[#2C1810] shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-8 sm:py-8 opacity-0">
            <p className="mb-2 text-center text-[0.7rem] uppercase tracking-[0.22em] text-[#7A1218]/75">
              ChamCham Studio
            </p>
            <h1 className="text-center font-serif text-[2rem] font-light leading-tight text-[#2C1810] sm:text-[2.22rem]">
              Quên Mật Khẩu
            </h1>
            <p className="mb-5 mt-2 text-center text-[0.86rem] leading-relaxed text-[#2c1810]/70">
              Nhập email tài khoản để nhận mã OTP đặt lại mật khẩu
            </p>

            {errorMessage ? (
              <div className="mb-4 rounded-xl border border-[#ffc107] bg-[#fff3cd] px-3.5 py-3 text-[0.82rem] text-[#856404]">
                {errorMessage}
              </div>
            ) : null}

            <Formik
              initialValues={initialValues}
              validate={validateForgotPassword}
              onSubmit={handleSubmit}
            >
              {({ errors, isSubmitting, touched }) => (
                <Form>
                  <div className="mb-5">
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[0.68rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                    >
                      Email
                    </label>
                    <Field
                      id="email"
                      name="email"
                      type="text"
                      placeholder="your@email.com"
                      className={`min-h-11 w-full rounded-xl border bg-white/80 px-3.5 py-2.5 text-[0.92rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:bg-white focus:border-[#7A1218] focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${
                        touched.email && errors.email
                          ? "border-[#6B1218]"
                          : "border-[#2c1810]/20"
                      }`}
                    />
                    {touched.email && errors.email ? (
                      <p className="mt-2 text-xs text-[#6B1218]">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    className="min-h-12 w-full rounded-full bg-[#7A1218] px-4 py-3.5 text-[0.74rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] shadow-[0_14px_28px_rgba(107,18,24,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[0.8rem]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang gửi mã..." : "Gửi Mã OTP"}
                  </button>
                </Form>
              )}
            </Formik>

            <p className="mt-5 text-center text-[0.84rem] font-light text-[#2C1810]">
              Đã nhớ mật khẩu?{" "}
              <Link
                href="/login"
                className="text-[#7A1218] transition-colors hover:text-[#6B1218]"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </section>

        <footer className="shrink-0 border-t border-white/20 px-4 py-3 text-center text-[0.72rem] tracking-[0.12em] text-white/80">
          © 2025 ChamCham · Handcrafted in Việt Nam
        </footer>
      </div>
    </main>
  );
}
