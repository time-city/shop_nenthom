import { tr } from "zod/v4/locales";
import prisma from "../prisma"
import { UpdateProfileFormState } from "../validations/user.schema"


export const UserService = {
    async updateProfile(id: string, data: UpdateProfileFormState) {
        try {
            const existingUser = await prisma.user.findFirst({
                where: {
                    id: {
                        not: id,
                    },
                    phone: data.phone,
                },
                select: { id: true }
            });
            if (existingUser) {
                throw new Error('Số điện thoại đã tồn tại');
            }

            const defaultAddress = await prisma.shippingAddress.findFirst({
                where: {
                    user_id: id,
                    is_default: true
                },
                select: { id: true }
            });

            const operations = [];

            const userUpdate = prisma.user.update({
                where: { id },
                data: {
                    fullname: data.fullname,
                    phone: data.phone
                },
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    phone: true,
                    role: true
                }

            })

            operations.push(userUpdate);

            //Xử lý địa chỉ
            if (data.address && data.city) {
                const receiverName = data.fullname ?? "Người nhận";
                const receiverPhone = data.phone ?? "";

                if (defaultAddress) {
                    operations.push(
                        prisma.shippingAddress.update({
                            where: { id: defaultAddress.id },
                            data: {
                                city: data.city,
                                fullname: receiverName,
                                phone: receiverPhone,
                                address: data.address,
                                postal_code: data.postal_code || null,
                            }
                        })
                    )
                } else {
                    operations.push(
                        prisma.shippingAddress.create({
                            data: {
                                city: data.city,
                                fullname: receiverName,
                                phone: receiverPhone,
                                address: data.address,
                                is_default: true,
                                postal_code: data.postal_code || null,
                                user_id: id,
                            }
                        })
                    )
                }
            }
        } finally {}
    },


    async getAllUsers(page = 1, limit = 100) {
        try {
            const skip = (page - 1) * limit;
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    skip,
                    take: limit,
                    orderBy: { created_at: "desc" },
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        phone: true,
                        role: true,
                        status: true,
                        created_at: true,
                    },
                }),
                prisma.user.count(),
            ]);

            return {
                data: users,
                meta: {
                    limit,
                    page,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } finally {}
    },


    async toggleUserStatus(id: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
                select: { status: true },
            });


            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }


            const newStatus = user.status === "ACTIVE" ? "LOCKED" : "ACTIVE";


            return await prisma.user.update({
                where: { id },
                data: { status: newStatus },
            });
        } finally {}
    },


    async toggleUserRole(id: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
                select: { role: true },
            });
            if (!user) {
                throw new Error("Không tìm thấy người dùng");
            }
            const newRole = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";

            return await prisma.user.update({
                where: { id },
                data: { role: newRole },
            });
        } finally {}
    },


    // hàm get chi tiết đơn hàng của user
    async getUserOrders(userId: string, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const where = { user_id: userId };
            const [orders, total] = await Promise.all([
                prisma.order.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { created_at: "desc" },
                    select: {
                        order_number: true,
                        created_at: true,
                        total_cents: true,
                        status: true,
                        items: {
                            select: {
                                quantity: true,
                                product: {
                                    select: { name: true },
                                },
                            },
                        },
                    },
                }),
                prisma.order.count({ where }),
            ]);

            return {
                data: orders.map((order) => {
                    const statusText = order.status === "CANCELLED"
                        ? "Đã huỷ"
                        : order.status === "PENDING"
                            ? "Đang xác nhận"
                            : "Đã xác nhận";

                    return {
                        id: order.order_number,
                        date: order.created_at.toLocaleDateString("vi-VN"),
                        total: `${order.total_cents.toLocaleString("vi-VN")} đ`,
                        status: statusText,
                        items: order.items.map(item => `${item.quantity}x ${item.product.name}`).join(", "),
                    };
                }),
                meta: {
                    limit,
                    page,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } finally {}
    }
}
