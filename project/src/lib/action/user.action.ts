'use server'

import { getSession } from "../session";
import { UpdateProfileFormState, updateProfileSchema } from "../validations/auth.schema";
import { UserService } from "../services/user.service";
import {
    GetUsersParams,
    UserIdInput,
    getUsersSchema,
    updateUserStatusSchema,
    userIdSchema,
} from "../validations/user.schema";

async function requireAdmin() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: 'Không có quyền truy cập' };

    return null;
}

export async function updateProfileAction(data: UpdateProfileFormState){
    // 1. check auth
    const session = await getSession();
    if(!session) return {error: "Bạn chưa đăng nhập"}

    // 2. validate
    const parsed = updateProfileSchema.safeParse({
        fullname: data.fullname,
        phone: data.phone
    })
    
    if(!parsed.success) return {error: parsed.error.issues[0].message};

    // 3. update
    try {
        const user = await UserService.updateProfile(session.sub, parsed.data);
        return {success: true, message: 'Cập nhật thông tin thành công', data: user};
    } catch (err) {
        return {error: (err as Error).message};
    }
}

// Admin lấy danh sách khách hàng đã đăng ký tài khoản, hỗ trợ tìm kiếm, lọc trạng thái và phân trang.
export async function getUsersAction(params: Partial<GetUsersParams> = {}) {
    const authError = await requireAdmin();
    if (authError) return authError;

    const parsed = getUsersSchema.safeParse(params);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const users = await UserService.getUsers(parsed.data);
        return { success: true, ...users };
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function getCustomersAction(params: Partial<GetUsersParams> = {}) {
    return getUsersAction(params);
}

// Admin khóa tài khoản khách hàng để khách không thể đăng nhập hoặc thao tác tài khoản.
export async function lockUserAction(params: UserIdInput) {
    const authError = await requireAdmin();
    if (authError) return authError;

    const parsed = userIdSchema.safeParse(params);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const user = await UserService.updateUserStatus({
            id: parsed.data.id,
            status: 'LOCKED',
        });

        return {
            success: true,
            message: 'Tài khoản đã được khóa',
            data: user,
        };
    } catch (err) {
        return { error: (err as Error).message };
    }
}

// Admin mở khóa tài khoản khách hàng để khách có thể sử dụng lại tài khoản.
export async function unlockUserAction(params: UserIdInput) {
    const authError = await requireAdmin();
    if (authError) return authError;

    const parsed = userIdSchema.safeParse(params);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const user = await UserService.updateUserStatus({
            id: parsed.data.id,
            status: 'ACTIVE',
        });

        return {
            success: true,
            message: 'Tài khoản đã được mở khóa',
            data: user,
        };
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function updateUserStatusAction(params: unknown) {
    const authError = await requireAdmin();
    if (authError) return authError;

    const parsed = updateUserStatusSchema.safeParse(params);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const user = await UserService.updateUserStatus(parsed.data);
        return { success: true, data: user };
    } catch (err) {
        return { error: (err as Error).message };
    }
}
