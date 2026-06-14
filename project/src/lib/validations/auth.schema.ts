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

export const updateProfileSchema = z.object({
    fullname: z.string().min(3, 'Họ và tên phải có ít nhất 3 ký tự'),
    phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'), 
})
export type UpdateProfileFormState = z.infer<typeof updateProfileSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Vui lòng nhập email hợp lệ'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Liên kết đặt lại mật khẩu không hợp lệ'),
  email: z.string().email('Vui lòng nhập email hợp lệ'),
  otp: z.string().length(6, 'Mã xác nhận gồm 6 số'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
