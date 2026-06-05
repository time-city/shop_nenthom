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

interface SignInValues {
  email: string;
  password: string;
  remember: boolean;
}

type AuthResponse = {
  data: {
    accessToken: string;
    user: {
      email: string;
      fullname: string;
      id: string;
      phone: string;
      role: string;
    };
  };
  message: string;
  success: boolean;
};

const initialValues: SignInValues = {
  email: "",
  password: "",
  remember: false,
};

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không đúng định dạng"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
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

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; path=/; max-age=604800; SameSite=Lax`;
};

// Lưu dữ liệu auth theo response backend: user info vào localStorage, role/token vào cookies.
const saveAuthResponse = (response: AuthResponse) => {
  if (!response.success) {
    return;
  }

  const { accessToken, user } = response.data;

  localStorage.setItem("fullname", user.fullname);
  localStorage.setItem("email", user.email);
  localStorage.setItem("phone", user.phone);
  localStorage.setItem(
    "lumiere-user",
    JSON.stringify({
      email: user.email,
      fullname: user.fullname,
      phone: user.phone,
      role: user.role,
    }),
  );

  setCookie("role", user.role);
  setCookie("accessToken", accessToken);
};

export default function FormSignIn() {
  const [errorMessage, setErrorMessage] = useState("");

  const showError = (message: string) => {
    setErrorMessage(message);
    console.log(message);
    toast.error(message);
    window.setTimeout(() => setErrorMessage(""), 4000);
  };

  const handleSubmit = (
    values: SignInValues,
    actions: FormikHelpers<SignInValues>,
  ) => {
    const email = values.email.trim();
    const password = values.password;

    if (!email || !password) {
      showError("Vui lòng điền đầy đủ thông tin");
      actions.setSubmitting(false);
      return;
    }

    const isAdmin = email.toLowerCase() === "admin@gmail.com";

    if (isAdmin && password !== "admin123") {
      showError("Mật khẩu admin không đúng!");
      actions.setSubmitting(false);
      return;
    }

    // Mock response hiện tại; khi gắn API thật thì thay object này bằng response từ server.
    const response: AuthResponse = {
      data: {
        accessToken: `chamcham-${isAdmin ? "admin" : "user"}-${Date.now()}`,
        user: {
          email,
          fullname: isAdmin ? "Admin ChamCham" : "Khách hàng",
          id: isAdmin ? "admin" : "customer",
          phone: localStorage.getItem("phone") ?? "",
          role: isAdmin ? "admin" : "user",
        },
      },
      message: "Đăng nhập thành công! Đang chuyển hướng...",
      success: true,
    };

    console.log(response.message);
    saveAuthResponse(response);
    localStorage.setItem("remember", String(values.remember));
    setErrorMessage("");
    toast.success(response.message);

    const redirect = new URLSearchParams(window.location.search).get("redirect");

    window.setTimeout(() => {
      if (isAdmin) {
        window.location.href = "/admin/dashboard";
      } else if (redirect) {
        window.location.href = redirect;
      } else {
        window.location.href = "/profile";
      }
    }, 1500);

    actions.setSubmitting(false);
  };

  return (
    <main>
      <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center bg-[#7A1218] px-4 pb-6 pt-24 sm:px-6 sm:pb-8 md:px-8 md:pt-32">
        <div className="w-full max-w-[420px] rounded-2xl border border-[#2c1810]/10 bg-[#F5F0E8] p-6 sm:p-8 md:p-12">
          <h1 className="text-center font-serif text-[2rem] font-light leading-tight text-[#2C1810] sm:text-[2.2rem]">
            Đăng Nhập
          </h1>
          <p className="mb-7 mt-2 text-center text-[0.86rem] leading-relaxed text-[#2c1810]/70 sm:mb-8 sm:text-[0.88rem]">
            Chào mừng quay lại ChamCham
          </p>

          {errorMessage ? (
            <div className="mb-6 rounded-sm border border-[#ffc107] bg-[#fff3cd] p-3 text-[0.85rem] text-[#856404]">
              {errorMessage}
            </div>
          ) : null}

          <Formik
            initialValues={initialValues}
            validate={validateSignIn}
            onSubmit={handleSubmit}
          >
            {({ errors, isSubmitting, touched }) => (
              <Form>
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[0.7rem] font-normal uppercase tracking-[0.1em] text-[#2C1810] sm:text-xs"
                  >
                    Email
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className={`w-full border bg-transparent p-3 text-[0.95rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/40 focus:border-[#7A1218] focus:outline-none ${
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
                    className="mb-2 block text-[0.7rem] font-normal uppercase tracking-[0.1em] text-[#2C1810] sm:text-xs"
                  >
                    Mật Khẩu
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className={`w-full border bg-transparent p-3 text-[0.95rem] text-[#2C1810] transition-colors placeholder:text-[#2c1810]/40 focus:border-[#7A1218] focus:outline-none ${
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
                </div>

                <label
                  htmlFor="remember"
                  className="mb-6 flex items-center text-[0.84rem] text-[#2c1810]/70 sm:text-[0.85rem]"
                >
                  <Field
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="mr-2 cursor-pointer accent-[#7A1218]"
                  />
                  <span>Ghi nhớ tôi</span>
                </label>

                <button
                  type="submit"
                  className="mb-4 w-full bg-[#7A1218] p-3.5 text-[0.76rem] uppercase tracking-[0.12em] text-[#F5F0E8] transition-colors hover:bg-[#6B1218] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[0.8rem]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng Nhập"}
                </button>
              </Form>
            )}
          </Formik>

          <div className="my-6 text-center text-[0.85rem] text-[#2c1810]/45">
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
                href="#forgot"
                className="text-[0.85rem] text-[#7A1218] no-underline transition-colors hover:text-[#6B1218]"
              >
                Quên mật khẩu?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
