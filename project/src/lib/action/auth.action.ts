'use server'
import prisma from "../prisma";
import { AuthService } from "../services/auth.service";
import { createSession, deleteSession, getSession } from "../session";
import { LoginFormState, RegisterFormState, SendVerifyEmailFormState, VerifyEmailFormState, loginSchema, registerSchema, sendVerifyEmailSchema, verifyEmailSchema } from "../validations/auth.schema";

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
        const verifyEmail = await AuthService.sendVerifyEmail(user.email);

        return { success: true, user, verifyToken: verifyEmail.token };
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
export async function sendVerifyEmailAction(data: SendVerifyEmailFormState) {
    const parsed = sendVerifyEmailSchema.safeParse({
        email: data.email,
    })

    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const result = await AuthService.sendVerifyEmail(parsed.data.email)
        return { success: true, token: result.token }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

export async function verifyEmailAction(data: VerifyEmailFormState) {
    const parsed = verifyEmailSchema.safeParse({
        token: data.token,
        email: data.email,
        otp: data.otp,
    })

    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const user = await AuthService.verifyEmail(parsed.data.token, parsed.data.email, parsed.data.otp)
        return { success: true, data: user }
    } catch (err) {
        return { error: (err as Error).message }
    }
}
