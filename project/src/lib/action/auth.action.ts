'use server'
import { headers } from "next/headers";
import { getPublicErrorMessage } from "../utils/publicError";
import { AuthService } from "../services/auth.service";
import { createSession, deleteSession, getSession } from "../session";
import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { CartService } from "../services/cart.service";
import { checkRateLimit } from "../utils/rateLimiter";
import { cookies } from "next/headers";
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

const CART_SESSION_COOKIE_NAME = 'guest_session_id';

/** Lấy IP của request từ headers (dùng cho rate limiting). */
async function getClientIp(): Promise<string> {
    const headerStore = await headers();
    return (
        headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headerStore.get("x-real-ip") ??
        "unknown"
    );
}


export async function registerUser(data: RegisterFormState) {
    // Rate limit: 5 lần đăng ký / 1 phút / IP (chặn spam tạo tài khoản)
    const ip = await getClientIp();
    const rl = checkRateLimit(`register:${ip}`, 5, 60_000);
    if (!rl.allowed) {
        return { error: `Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ${rl.retryAfterSeconds} giây.` };
    }

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
    // Rate limit: 5 lần / 1 phút / IP (chặn brute-force mật khẩu)
    const ip = await getClientIp();
    const rl = checkRateLimit(`login:${ip}`, 5, 60_000);
    if (!rl.allowed) {
        return { error: `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${rl.retryAfterSeconds} giây.` };
    }

    const parsed = loginSchema.safeParse({
        email: data.email,
        password: data.password,
    });

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message };
    }

    try {
        const user = await AuthService.validateUser(parsed.data.email, parsed.data.password);

        // Đọc guest session cookie để merge cart
        const cookieStore = await cookies();
        const guestSessionId = cookieStore.get(CART_SESSION_COOKIE_NAME)?.value;

        const [isNewUser, defaultAddress] = await Promise.all([
            user.is_newUser ? AuthService.consumeNewUserFlag(user.id) : Promise.resolve(false),
            prisma.shippingAddress.findFirst({
                where: { user_id: user.id, is_default: true },
                select: { id: true }
            }),
            createSession({
                id: user.id,
                role: user.role,
            })
        ]);

        // Merge cart guest vào cart user (chạy nền, không block login)
        if (guestSessionId) {
            CartService.mergeGuestCartIntoUserCart(guestSessionId, user.id)
                .then(() => {
                    // Xóa guest cookie sau khi merge thành công
                    cookieStore.delete(CART_SESSION_COOKIE_NAME);
                })
                .catch((err) => {
                    console.error('[loginUser] Merge cart guest thất bại:', err);
                });
        }
        
        revalidatePath("/", "layout");
        
        const hasInfo = !!user.phone && !!defaultAddress;

        return {
            success: true,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                is_newUser: isNewUser,
                has_info: hasInfo,
            }
        };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}

export async function logoutUser() {
    await deleteSession();
    revalidatePath("/", "layout");

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

    // Rate limit: 3 lần / 1 giờ / email (chặn spam gửi OTP tốn chi phí SMTP)
    const rl = checkRateLimit(`forgot-password:${parsed.data.email.toLowerCase()}`, 3, 60 * 60_000);
    if (!rl.allowed) {
        return {
            success: false,
            error: `Bạn đã yêu cầu đặt lại mật khẩu quá nhiều lần. Vui lòng thử lại sau ${Math.ceil(rl.retryAfterSeconds / 60)} phút.`,
        };
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
