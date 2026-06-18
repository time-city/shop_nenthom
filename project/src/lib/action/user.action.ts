'use server'
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
        return { error: (err as Error).message };
    }
}


export async function getAllUsersAction() {
    const admin = await requireAdmin();
    if ("error" in admin) return admin;


    try {
        const users = await UserService.getAllUsers();
        return {
            success: true,
            data: users.map(user => ({
                id: user.id,
                name: user.fullname || "Chưa đặt tên",
                email: user.email,
                phone: user.phone || "Chưa có số",
                role: user.role,
                isActive: user.status === "ACTIVE",
                createdAt: user.created_at.toLocaleDateString("vi-VN"),
            }))
        };
    } catch (err) {
        return { error: (err as Error).message };
    }
}


export async function toggleUserStatusAction(userId: string) {
    const admin = await requireAdmin();
    if ("error" in admin) return admin;


    try {
        await UserService.toggleUserStatus(userId);
        return { success: true };
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function toggleUserRoleAction(userId: string) {
    const admin = await requireAdmin();
    if ("error" in admin) return admin;


    try {
        await UserService.toggleUserRole(userId);
        return { success: true };
    } catch (err) {
        return { error: (err as Error).message };
    }
}




export async function getUserOrdersAction(userId: string) {
    const admin = await requireAdmin();
    if ("error" in admin) return admin;


    try {
        const orders = await UserService.getUserOrders(userId);
        return { success: true, data: orders };
    } catch (err) {
        return { error: (err as Error).message };
    }
}


export async function getCurrentUser() {
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
        address: defaultAddress?.address ?? "",
        city: defaultAddress?.city ?? "",
        postal_code: defaultAddress?.postal_code ?? "",
    };
}
