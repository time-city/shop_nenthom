'use server'


import { getSession } from "../session";
import { UpdateProfileFormState, updateProfileSchema } from "../validations/auth.schema";
import { UserService } from "../services/user.service";


export async function updateProfileAction(data: UpdateProfileFormState) {
   // 1. check auth
   const session = await getSession();
   if (!session) return { error: "Bạn chưa đăng nhập" }


   // 2. validate
   const parsed = updateProfileSchema.safeParse({
       fullname: data.fullname,
       phone: data.phone
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


async function requireAdmin() {
   const session = await getSession();
   if (!session || session.role !== 'ADMIN') return { error: 'Không có quyền truy cập' };
   return session;
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

