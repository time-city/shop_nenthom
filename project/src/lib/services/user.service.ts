import prisma from "../prisma"
import { UpdateProfileFormState } from "../validations/auth.schema"

export const UserService = {
    async updateProfile(id: string, data: UpdateProfileFormState){
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
                fullname: data.fullname,
                phone: data.phone,
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
    }
}
