import prisma from '../prisma';
import bcryptjs from 'bcryptjs';
import { RegisterFormState } from '../validations/auth.schema';
import { createOtpToken, generateOtp, verifyOtpToken } from '../otp';
import { Mail } from '../mail';
import { verifyEmailTemplate } from '../mail/templates/verify-email';

export const AuthService = {
    async register(data: RegisterFormState) {
        const existing = await prisma.user.findUnique({
            where: { email: data.email }
        })
        if (existing) throw new Error('Email đã tồn tại');
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(data.password, salt);

        const user = await prisma.user.create({
            data: {
                fullname: data.fullname,
                email: data.email,
                password_hash: hashPassword,
                phone: data.phone,
                status: 'LOCKED',
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
        const user = await prisma.user.findUnique({
            where: { email },
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
    async sendVerifyEmail(email: string) {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) throw new Error('Email không tồn tại')
        if (user.status === 'ACTIVE') throw new Error('Email đã được xác thực')

        const otp = generateOtp()
        const token = createOtpToken(email, otp)

        await Mail.send({
            to: email,
            subject: 'Xác nhận email - ChamCham Studio',
            html: verifyEmailTemplate(otp),
        })

        return { token } // trả token về FE để dùng khi verify
    },
    async verifyEmail(token: string, email: string, otp: string) {
        const isValid = verifyOtpToken(token, email, otp)
        if (!isValid) throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn')

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) throw new Error('Email không tồn tại')
        if (user.status === 'ACTIVE') throw new Error('Email đã được xác thực')

        return prisma.user.update({
            where: { email },
            data: { status: 'ACTIVE' },
            select: { id: true, email: true, status: true },
        })
    },
}
