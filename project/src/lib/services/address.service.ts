import prisma from "../prisma";

export type AddressCreateInput = {
    fullname: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    city: string;
    postal_code?: string | null;
};

export const AddressService = {
    async getUserAddresses(userId: string) {
        return prisma.shippingAddress.findMany({
            where: { user_id: userId },
            orderBy: [{ is_default: 'desc' }, { id: 'asc' }]
        });
    },

    async createAddress(userId: string, data: AddressCreateInput) {
        // If it's the first address, make it default
        const count = await prisma.shippingAddress.count({ where: { user_id: userId } });
        const isDefault = count === 0;

        return prisma.shippingAddress.create({
            data: {
                ...data,
                user_id: userId,
                is_default: isDefault
            }
        });
    },

    async updateAddress(addressId: string, userId: string, data: AddressCreateInput) {
        return prisma.shippingAddress.update({
            where: { id: addressId, user_id: userId },
            data
        });
    },

    async deleteAddress(addressId: string, userId: string) {
        // Check if the address exists and belongs to the user
        const address = await prisma.shippingAddress.findUnique({
            where: { id: addressId, user_id: userId },
            select: { is_default: true }
        });

        if (!address) throw new Error("Địa chỉ không tồn tại");

        await prisma.shippingAddress.delete({
            where: { id: addressId }
        });

        // If we deleted the default address, make the first remaining address default
        if (address.is_default) {
            const firstRemaining = await prisma.shippingAddress.findFirst({
                where: { user_id: userId }
            });
            if (firstRemaining) {
                await prisma.shippingAddress.update({
                    where: { id: firstRemaining.id },
                    data: { is_default: true }
                });
            }
        }
        return true;
    },

    async setDefaultAddress(addressId: string, userId: string) {
        return prisma.$transaction([
            prisma.shippingAddress.updateMany({
                where: { user_id: userId },
                data: { is_default: false }
            }),
            prisma.shippingAddress.update({
                where: { id: addressId, user_id: userId },
                data: { is_default: true }
            })
        ]);
    }
};
