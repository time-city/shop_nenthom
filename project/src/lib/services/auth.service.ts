import prisma from '../prisma';
import bcryptjs from 'bcryptjs';
import { RegisterFormState } from '../validations/auth.schema';

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
}
