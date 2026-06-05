"use client";

import {
  Field,
  Form,
  Formik,
  type FormikErrors,
  type FormikHelpers,
} from "formik";
import Link from "next/link";
import { toast } from "react-toastify";
import { z } from "zod";

interface SignUpValues {
  fullname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  terms: boolean;
  newsletter: boolean;
}

type RegisterRequest = {
  email: string;
  fullname: string;
  password: string;
  phone: string;
};

type RegisterResponse = {
  message: string;
  success: boolean;
};

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
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[a-z]/, "Mật khẩu cần có chữ thường")
      .regex(/[A-Z]/, "Mật khẩu cần có chữ hoa")
      .regex(/\d/, "Mật khẩu cần có số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    phone: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập số điện thoại")
      .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không đúng định dạng"),
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

// Register API chỉ trả success/message, nên dùng request để tạm fill profile sau khi đăng ký.
const saveRegisterRequest = (
  request: RegisterRequest,
  response: RegisterResponse,
) => {
  if (!response.success) {
    return;
  }

  localStorage.setItem("fullname", request.fullname);
  localStorage.setItem("email", request.email);
  localStorage.setItem("phone", request.phone);
  localStorage.setItem(
    "lumiere-user",
    JSON.stringify({
      email: request.email,
      fullname: request.fullname,
      phone: request.phone,
      role: "user",
    }),
  );
};

export default function FormSignUp() {
  const handleSubmit = (
    values: SignUpValues,
    actions: FormikHelpers<SignUpValues>,
  ) => {
    const fullname = values.fullname.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const password = values.password;
    const request: RegisterRequest = { email, fullname, password, phone };

    // TODO: POST /api/auth/register với request { fullname, email, phone, password }.
    const response: RegisterResponse = {
      message: "Đăng ký thành công! Đang chuyển hướng...",
      success: true,
    };

    console.log(response.message);
    saveRegisterRequest(request, response);
    localStorage.setItem("newsletter", String(values.newsletter));
    toast.success(response.message);

    window.setTimeout(() => {
      window.location.href = "/login";
    }, 1500);

    actions.setSubmitting(false);
  };

  return (
    <main>
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
                      Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số
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
