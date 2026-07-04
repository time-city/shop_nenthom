'use server'
import { getPublicErrorMessage } from "../utils/publicError";
import { AuthService } from "../services/auth.service";
import { createSession, deleteSession, getSession } from "../session";
import {
    ChangePasswordInput,
    ForgotPasswordInput,
    LoginFormState,
    RegisterFormState,
    ResendOtpInput,
    ResetPasswordInput,
    changePasswordSchema,
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resendOtpSchema,
    resetPasswordSchema,
} from "../validations/auth.schema";

export async function registerUser(data: RegisterFormState) {
    const parsed = registerSchema.safeParse({
        fullname: data.fullname,
        email: data.email,
        password: data.password,
        phone: data.phone
    })

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    try {
        const user = await AuthService.register(parsed.data);

        return { success: true, user };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}

export async function loginUser(data: LoginFormState) {
    const parsed = loginSchema.safeParse({
        email: data.email,
        password: data.password,
    });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    try {
        const user = await AuthService.validateUser(parsed.data.email, parsed.data.password);
        await createSession({
            id: user.id,
            role: user.role,
        });
        const isNewUser = user.is_newUser
            ? await AuthService.consumeNewUserFlag(user.id)
            : false;

        return {
            success: true,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                is_newUser: isNewUser,
            }
        };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}

export async function logoutUser() {
    await deleteSession();

    return { success: true };
}

export async function forgotPassword(data: ForgotPasswordInput): Promise<
    | { success: true; data: { email: string; token: string }; message: string }
    | { success: false; error: string }
> {
    const parsed = forgotPasswordSchema.safeParse(data);

    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    try {
        const reset = await AuthService.requestPasswordReset(parsed.data);

        return {
            success: true,
            data: reset,
            message: 'Chúng tôi đã gửi mã OTP đặt lại mật khẩu.',
        };
    } catch (err) {
        return { success: false, error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}

export async function resetPassword(data: ResetPasswordInput) {
    const parsed = resetPasswordSchema.safeParse(data);

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    try {
        await AuthService.resetPassword(parsed.data);

        return {
            success: true,
            message: 'Mật khẩu đã được cập nhật. Bạn có thể đăng nhập lại.',
        };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}

export async function resendResetPasswordOtp(data: ResendOtpInput): Promise<
    | { success: true; data: { email: string; token: string }; message: string }
    | { success: false; error: string }
> {
    const parsed = resendOtpSchema.safeParse(data);

    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message };
    }

    try {
        const reset = await AuthService.resendPasswordResetOtp(parsed.data);

        return {
            success: true,
            data: reset,
            message: 'Mã OTP mới đã được gửi đến email của bạn.',
        };
    } catch (err) {
        return { success: false, error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}

export async function changePassword(data: ChangePasswordInput) {
    const parsed = changePasswordSchema.safeParse(data);

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    const session = await getSession();

    if (!session) {
        return { error: 'Vui lòng đăng nhập để đổi mật khẩu' };
    }

    try {
        await AuthService.changePassword(session.sub, parsed.data);

        return {
            success: true,
            message: 'Mật khẩu đã được cập nhật.',
        };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}
