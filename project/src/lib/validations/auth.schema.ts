import { z } from "zod";

export const registerSchema = z.object({
    fullname: z.string().min(3, 'Họ và tên phải có ít nhất 3 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
})
export type RegisterFormState = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
})
export type LoginFormState = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
    token: z.string().min(1, 'Thiếu token xác thực'),
    email: z.string().email('Email không hợp lệ'),
    otp: z.string().regex(/^\d{6}$/, 'Mã OTP phải gồm 6 chữ số'),
})
export type VerifyEmailFormState = z.infer<typeof verifyEmailSchema>;

export const sendVerifyEmailSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
})
export type SendVerifyEmailFormState = z.infer<typeof sendVerifyEmailSchema>;

export const updateProfileSchema = z.object({
    fullname: z.string().min(3, 'Họ và tên phải có ít nhất 3 ký tự'),
    phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'), 
})
export type UpdateProfileFormState = z.infer<typeof updateProfileSchema>;
