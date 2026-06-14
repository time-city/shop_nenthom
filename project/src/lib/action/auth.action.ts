'use server'
import prisma from "../prisma";
import { AuthService } from "../services/auth.service";
import { createSession, deleteSession, getSession } from "../session";
import {
    ForgotPasswordInput,
    LoginFormState,
    RegisterFormState,
    ResetPasswordInput,
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
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
        return { error: (err as Error).message };
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

        return {
            success: true,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
            }
        };
    } catch (err) {
        return { error: (err as Error).message };
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
        return { success: false, error: (err as Error).message };
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
        return { error: (err as Error).message };
    }
}

export async function getCurrentUser() {
    const session = await getSession();

    if (!session) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.sub },
        select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
            role: true,
            status: true,
        },
    });

    if (!user || user.status === 'LOCKED') {
        return null;
    }

    return user;
}
