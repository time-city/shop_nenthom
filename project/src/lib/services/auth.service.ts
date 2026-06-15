import prisma from '../prisma';
import bcryptjs from 'bcryptjs';
import { createOtpToken, generateOtp, verifyOtpToken } from '../otp';
import { sendResetPasswordEmail } from '../mailer';
import { ChangePasswordInput, ForgotPasswordInput, RegisterFormState, ResetPasswordInput } from '../validations/auth.schema';

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

export const AuthService = {
    async register(data: RegisterFormState) {
        const email = normalizeEmail(data.email);
        const existing = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive',
                },
            },
        })
        if (existing) throw new Error('Email đã tồn tại');

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(data.password, salt);

        const user = await prisma.user.create({
            data: {
                fullname: data.fullname,
                email,
                password_hash: hashPassword,
                phone: data.phone,
                status: 'ACTIVE',
            },
            select: {
                id: true,
                fullname: true,
                email: true,
                phone: true,
                status: true,
            }
        });

        return user;
    },

    async validateUser(email: string, password: string) {
        const normalizedEmail = normalizeEmail(email);
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: normalizedEmail,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                fullname: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                password_hash: true,
            },
        });

        if (!user) throw new Error('Email hoặc mật khẩu không chính xác');

        const isValidPassword = await bcryptjs.compare(password, user.password_hash);

        if (!isValidPassword) throw new Error('Email hoặc mật khẩu không chính xác');
        if (user.status === 'LOCKED') throw new Error('Tài khoản đã bị khóa');

        return {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
        };
    },

    async requestPasswordReset(data: ForgotPasswordInput) {
        const email = normalizeEmail(data.email);
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive',
                },
                status: 'ACTIVE',
            },
            select: {
                email: true,
            },
        });

        if (!user) {
            throw new Error('Email này chưa được đăng ký');
        }

        const otp = generateOtp();
        const token = createOtpToken(email, otp);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000';
        const resetUrl = `${appUrl}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

        await sendResetPasswordEmail({
            email,
            otp,
            resetUrl,
        });

        return { email, token };
    },

    async resetPassword(data: ResetPasswordInput) {
        const email = normalizeEmail(data.email);
        const isValidOtp = verifyOtpToken(data.token, email, data.otp);

        if (!isValidOtp) {
            throw new Error('Mã xác nhận không đúng hoặc đã hết hạn');
        }

        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive',
                },
                status: 'ACTIVE',
            },
            select: { id: true },
        });

        if (!user) {
            throw new Error('Không tìm thấy tài khoản phù hợp');
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(data.newPassword, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: { password_hash: hashPassword },
        });
    },

    async changePassword(userId: string, data: ChangePasswordInput) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                password_hash: true,
                status: true,
            },
        });

        if (!user || user.status === 'LOCKED') {
            throw new Error('Tài khoản không thể đổi mật khẩu lúc này');
        }

        const isValidPassword = await bcryptjs.compare(data.currentPassword, user.password_hash);

        if (!isValidPassword) {
            throw new Error('Mật khẩu hiện tại chưa đúng');
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(data.newPassword, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: { password_hash: hashPassword },
        });
    },
}
