'use server'

import { getSession } from "../session";
import { UpdateProfileFormState, updateProfileSchema } from "../validations/auth.schema";
import { UserService } from "../services/user.service";

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
