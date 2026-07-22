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
import { type ChangeEvent, useEffect, useState, useTransition } from "react";
import { useToast } from "@/src/components/ui/toastProvider";
import { z } from "zod";
import { loginUser } from "../../lib/action/auth.action";
import type { SignInValues } from "../../lib/types/client";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useCartStore } from "@/src/store/useCartStore";
import { callAction } from "@/src/lib/utils/callAction";

const initialValues: SignInValues = {
  email: "",
  password: "",
  remember: false,
};

const rememberKey = "remember";
const rememberedEmailKey = "rememberedEmail";

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không đúng định dạng"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  remember: z.boolean(),
});

const validateSignIn = (values: SignInValues) => {
  const result = signInSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  return result.error.issues.reduce<FormikErrors<SignInValues>>(
    (errors, issue) => {
      const field = issue.path[0] as keyof SignInValues | undefined;

      if (field && !errors[field]) {
        errors[field] = issue.message;
      }

      return errors;
    },
    {},
  );
};

export default function FormSignIn() {
  const { toast } = useToast();
  const router = useRouter();
  const [isPendingNavigation, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState("");
  const [formInitialValues, setFormInitialValues] =
    useState<SignInValues>(initialValues);

  useEffect(() => {
    const shouldRemember = localStorage.getItem(rememberKey) === "true";
    const rememberedEmail = localStorage.getItem(rememberedEmailKey) ?? "";

    if (shouldRemember && rememberedEmail) {
      setTimeout(() => {
        setFormInitialValues({
          email: rememberedEmail,
          password: "",
          remember: true,
        });
      }, 0);
    }
  }, []);

  const showError = (message: string) => {
    setErrorMessage(message);
    window.setTimeout(() => setErrorMessage(""), 4000);
  };

  const handleSubmit = async (
    values: SignInValues,
    actions: FormikHelpers<SignInValues>,
  ) => {
    const email = values.email.trim();
    const password = values.password;

    if (!email || !password) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin");
      window.setTimeout(() => setErrorMessage(""), 4000);
      actions.setSubmitting(false);
      return;
    }

    // action-(đăng nhập)
    const result = await callAction(() => loginUser({
      email,
      password,
    }), "Không thể đăng nhập. Vui lòng thử lại sau.");

    if (!result.success) {
      showError(getFriendlyResponseError(result.error ?? "Đăng nhập thất bại"));
      actions.setSubmitting(false);
      return;
    }

    const message = "Đăng nhập thành công!";

    // Remember me chỉ lưu email và trạng thái checkbox, không lưu mật khẩu.
    if (values.remember) {
      localStorage.setItem(rememberKey, "true");
      localStorage.setItem(rememberedEmailKey, email);
    } else {
      localStorage.removeItem(rememberKey);
      localStorage.removeItem(rememberedEmailKey);
    }

    setErrorMessage("");
    toast.success(message);
    
    // Fetch cart count in background without blocking navigation
    setTimeout(() => {
      useCartStore.getState().clearCart();
      void useCartStore.getState().fetchCartCount();
    }, 0);

    if (result.user?.is_newUser) {
      localStorage.removeItem("hasSeenProfileGuide");
    }

    const redirect = new URLSearchParams(window.location.search).get("redirect");
    const targetPath =
      result.user?.role === "ADMIN"
        ? "/admin/dashboard"
        : redirect || (!result.user?.has_info ? "/profile" : "/");

    startTransition(() => {
      router.refresh();
      router.replace(targetPath);
    });
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
      {/* Overlay to ensure form readability against background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <button
        type="button"
        onClick={() => router.push("/")}
        className="group fixed left-6 top-6 flex size-10 items-center justify-center rounded-full border border-[#F5F0E8]/30 bg-[#F5F0E8]/15 text-lg text-[#F5F0E8] backdrop-blur-sm transition hover:bg-[#F5F0E8] hover:text-[#6B1218] z-50 animate-bg-fade"
        aria-label="Quay về trang chủ"
      >
        <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">←</span>
      </button>
      <div className="relative z-10 flex h-full flex-col">
        <section className="flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
        <div 
          className="animate-page-enter relative w-full max-w-[440px] rounded-[22px] border border-[#f5f0e8]/40 bg-[#F5F0E8]/95 px-5 py-6 text-[#2C1810] shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-8 sm:py-7 opacity-0"
        >
          <p className="mb-2 text-center text-[0.7rem] uppercase tracking-[0.22em] text-[#7A1218]/75">
            ChamCham Studio
          </p>
          <h1 className="text-center font-serif text-[2.05rem] font-light leading-tight text-[#2C1810] sm:text-[2.25rem]">
            Đăng Nhập
          </h1>
          <p className="mb-5 mt-2 text-center text-[0.86rem] leading-relaxed text-[#2c1810]/70">
            Chào mừng quay lại ChamCham
          </p>

          {errorMessage ? (
            <div className="mb-4 rounded-xl border border-[#ffc107] bg-[#fff3cd] px-3.5 py-3 text-[0.82rem] text-[#856404]">
              {errorMessage}
            </div>
          ) : null}

          <Formik
            initialValues={formInitialValues}
            enableReinitialize
            validate={validateSignIn}
            onSubmit={handleSubmit}
            validateOnMount={true}
          >
            {({ errors, isSubmitting, setFieldValue, touched, values, isValid }) => (
              <Form>
                <div className="relative mb-4 pb-5">
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
                    className={`min-h-11 w-full rounded-xl border bg-white/80 px-3.5 py-2.5 text-[0.92rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${
                      touched.email && errors.email
                        ? "border-[#6B1218]"
                        : "border-[#2c1810]/20"
                    }`}
                  />
                  {touched.email && errors.email ? (
                    <p className="absolute bottom-0 left-0 text-[11px] text-[#6B1218] sm:text-xs">
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                <div className="relative mb-4 pb-5">
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[0.68rem] font-normal uppercase tracking-widest text-[#2C1810] sm:text-xs"
                  >
                    Mật khẩu
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className={`min-h-11 w-full rounded-xl border bg-white/80 px-3.5 py-2.5 text-[0.92rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/35 focus:border-[#7A1218] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6B1218]/10 ${
                      touched.password && errors.password
                        ? "border-[#6B1218]"
                        : "border-[#2c1810]/20"
                    }`}
                  />
                  {touched.password && errors.password ? (
                    <p className="absolute bottom-0 left-0 text-[11px] text-[#6B1218] sm:text-xs">
                      {errors.password}
                    </p>
                  ) : null}
                </div>

                <label
                  htmlFor="remember"
                  className="mb-5 flex cursor-pointer items-center text-[0.84rem] text-[#2c1810]/70 sm:text-[0.85rem]"
                >
                  <Field
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={values.remember}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const checked = event.target.checked;
                      void setFieldValue("remember", checked);

                      if (checked) {
                        localStorage.setItem(rememberKey, "true");

                        if (values.email.trim()) {
                          localStorage.setItem(
                            rememberedEmailKey,
                            values.email.trim(),
                          );
                        }
                      } else {
                        localStorage.removeItem(rememberKey);
                        localStorage.removeItem(rememberedEmailKey);
                      }
                    }}
                    className="mr-2 cursor-pointer accent-[#7A1218]"
                  />
                  <span>Ghi nhớ tôi</span>
                </label>

                <button
                  type="submit"
                  className="mb-3 min-h-12 w-full rounded-full bg-[#7A1218] px-4 py-3.5 text-[0.74rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] shadow-[0_14px_28px_rgba(107,18,24,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[0.8rem]"
                  disabled={isSubmitting || isPendingNavigation || !isValid}
                >
                  {isSubmitting || isPendingNavigation ? "Đang xử lý..." : "Đăng Nhập"}
                </button>
              </Form>
            )}
          </Formik>

          <div className="my-4 text-center text-[0.82rem] text-[#2c1810]/45 sm:text-[0.85rem]">
            hoặc
          </div>

          <div className="text-center">
            <p className="mb-2 text-[0.84rem] font-light leading-relaxed text-[#2C1810] sm:text-[0.85rem]">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-[0.85rem] text-[#7A1218] no-underline transition-colors hover:text-[#6B1218]"
              >
                Đăng ký ngay
              </Link>
            </p>
            <p className="mb-2 text-[0.84rem] font-light leading-relaxed text-[#2C1810] sm:text-[0.85rem]">
              <Link
                href="/forgot-password"
                className="text-[0.85rem] text-[#7A1218] no-underline transition-colors hover:text-[#6B1218]"
              >
                Quên mật khẩu?
              </Link>
            </p>
          </div>
        </div>
        </section>

        <footer className="shrink-0 border-t border-white/20 px-4 py-3 text-center text-[0.72rem] tracking-[0.12em] text-white/80">
          © 2025 ChamCham · Handcrafted in Việt Nam
        </footer>
      </div>
    </main>
  );
}
