import { Prisma } from "@prisma/client"
import prisma from "../prisma"
import { UpdateProfileFormState } from "../validations/auth.schema"
import { GetUsersParams, UpdateUserStatusInput } from "../validations/user.schema"

export const UserService = {
    async getUsers(params: GetUsersParams) {
        const { page, limit, status, search } = params
        const skip = (page - 1) * limit
        const keyword = search?.trim()

        const where: Prisma.UserWhereInput = {
            role: 'CUSTOMER',
            ...(status && { status }),
            ...(keyword && {
                OR: [
                    { fullname: { contains: keyword, mode: 'insensitive' } },
                    { email: { contains: keyword, mode: 'insensitive' } },
                    { phone: { contains: keyword, mode: 'insensitive' } },
                ],
            }),
        }

        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                    status: true,
                    created_at: true,
                    updated_at: true,
                },
            }),
            prisma.user.count({ where }),
        ])

        return {
            data: users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    },

    async updateProfile(id: string, data: UpdateProfileFormState){
        const currentUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                status: true,
            },
        });

        if (!currentUser || currentUser.status === 'LOCKED') {
            throw new Error('Tài khoản không thể cập nhật thông tin lúc này');
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                id: {
                    not: id,
                },
                phone: data.phone,
            },
        });

        if (existingUser) {
            throw new Error('Số điện thoại đã tồn tại');
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                fullname: data.fullname.trim(),
                phone: data.phone.trim(),
            },
            select: {
                id: true,
                fullname: true,
                email: true,
                phone: true,
                role: true,
            },
        });

        return user;
    },

    async updateUserStatus(data: UpdateUserStatusInput) {
        const user = await prisma.user.findUnique({
            where: { id: data.id },
            select: {
                id: true,
                role: true,
                status: true,
            },
        })

        if (!user) {
            throw new Error('Không tìm thấy tài khoản phù hợp')
        }

        if (user.role !== 'CUSTOMER') {
            throw new Error('Không thể thay đổi trạng thái tài khoản này')
        }

        return prisma.user.update({
            where: { id: data.id },
            data: { status: data.status },
            select: {
                id: true,
                fullname: true,
                email: true,
                phone: true,
                status: true,
                created_at: true,
                updated_at: true,
            },
        })
    },
}
