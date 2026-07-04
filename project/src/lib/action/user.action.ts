'use server'
import { getPublicErrorMessage } from "../utils/publicError";
import { cache } from "react";
import { requireAdmin } from "../requireAdmin";
import { getSession } from "../session";
import { UpdateProfileFormState, updateProfileSchema } from "../validations/user.schema";
import { UserService } from "../services/user.service";
import prisma from "../prisma";


export async function updateProfileAction(data: UpdateProfileFormState) {
    // 1. check auth
    const session = await getSession();
    if (!session) return { error: "Bạn chưa đăng nhập" }


    // 2. validate
    const parsed = updateProfileSchema.safeParse({
        address: data.address,
        city: data.city,
        fullname: data.fullname,
        phone: data.phone,
        postal_code: data.postal_code,
    })


    if (!parsed.success) return { error: parsed.error.issues[0].message };


    // 3. update
    try {
        const user = await UserService.updateProfile(session.sub, parsed.data);
        return { success: true, message: 'Cập nhật thông tin thành công', data: user };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}


export async function getAllUsersAction(
    params: { page?: number; limit?: number } = {},
) {
    const admin = await requireAdmin();
    if ("error" in admin) return admin;

    const page = Math.max(Math.trunc(params.page ?? 1), 1);
    const limit = Math.min(Math.max(Math.trunc(params.limit ?? 100), 1), 100);

    try {
        const users = await UserService.getAllUsers(page, limit);
        return {
            success: true,
            data: users.data.map(user => ({
                id: user.id,
                name: user.fullname || "Chưa đặt tên",
                email: user.email,
                phone: user.phone || "Chưa có số",
                role: user.role,
                isActive: user.status === "ACTIVE",
                createdAt: user.created_at.toLocaleDateString("vi-VN"),
            })),
            meta: users.meta,
        };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}


export async function toggleUserStatusAction(userId: string) {
    const admin = await requireAdmin();
    if ("error" in admin) return admin;


    try {
        await UserService.toggleUserStatus(userId);
        return { success: true };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}

export async function toggleUserRoleAction(userId: string) {
    const admin = await requireAdmin();
    if ("error" in admin) return admin;


    try {
        await UserService.toggleUserRole(userId);
        return { success: true };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}




export async function getUserOrdersAction(
    userId: string,
    params: { page?: number; limit?: number } = {},
) {
    const admin = await requireAdmin();
    if ("error" in admin) return admin;

    const page = Math.max(Math.trunc(params.page ?? 1), 1);
    const limit = Math.min(Math.max(Math.trunc(params.limit ?? 10), 1), 50);

    try {
        const orders = await UserService.getUserOrders(userId, page, limit);
        return { success: true, ...orders };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
    }
}


const getCurrentUserForRequest = cache(async () => {
    const session = await getSession();

    if (!session?.sub) {
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
            is_newUser: true,
        },
    });

    if (!user || user.status === 'LOCKED') {
        return null;
    }

    const defaultAddress = await prisma.shippingAddress.findFirst({
        where: {
            user_id: user.id,
            is_default: true
        },
        select: {
            address: true,
            city: true,
            postal_code: true,
        }
    })

    return {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        is_newUser: user.is_newUser,
        address: defaultAddress?.address ?? "",
        city: defaultAddress?.city ?? "",
        postal_code: defaultAddress?.postal_code ?? "",
    };
});

export async function getCurrentUser() {
    return getCurrentUserForRequest();
}
