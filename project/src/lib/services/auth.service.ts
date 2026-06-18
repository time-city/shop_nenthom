import bcryptjs from 'bcryptjs';
import { after } from 'next/server';
import { createOtpToken, generateOtp, verifyOtpToken } from '../otp';
import { sendResetPasswordEmail } from '../mailer';
import { ChangePasswordInput, ForgotPasswordInput, RegisterFormState, ResendOtpInput, ResetPasswordInput } from '../validations/auth.schema';
import prisma from '../prisma';

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

export const AuthService = {
    async register(data: RegisterFormState) {
        const normalizedEmail = normalizeEmail(data.email);
        const existing = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        })
        if (existing) throw new Error('Email đã tồn tại');

        const hashPassword = await bcryptjs.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                fullname: data.fullname,
                email: normalizedEmail,
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
        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
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
                id: true,
                reset_otp_version: true,
            },
        });

        if (!user) {
            throw new Error('Email này chưa được đăng ký');
        }

        const otp = generateOtp();
        const nextOtpVersion = user.reset_otp_version + 1;
        await prisma.user.update({
            where: { id: user.id },
            data: {
                reset_otp_version: {
                    increment: 1,
                },
            },
        });
        const token = createOtpToken(email, otp, nextOtpVersion);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000';
        const resetUrl = `${appUrl}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

        after(async () => {
            await sendResetPasswordEmail({
                email,
                otp,
                resetUrl,
            });
        });

        return { email, token };
    },

    async resendPasswordResetOtp(data: ResendOtpInput) {
        return AuthService.requestPasswordReset(data);
    },

    async resetPassword(data: ResetPasswordInput) {
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
                id: true,
                reset_otp_version: true,
            },
        });

        if (!user) {
            throw new Error('Không tìm thấy tài khoản phù hợp');
        }

        const isValidOtp = verifyOtpToken(data.token, email, data.otp, user.reset_otp_version);

        if (!isValidOtp) {
            throw new Error('Mã xác nhận không đúng hoặc đã hết hạn');
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(data.newPassword, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password_hash: hashPassword,
                reset_otp_version: {
                    increment: 1,
                },
            },
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
