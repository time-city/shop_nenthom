import { DiscountType, Prisma } from "@prisma/client";
import prisma from "../prisma";
import { ApplyDiscountInput, CreateDiscountInput, GetDiscountsParams, UpdateDiscountInput } from "../validations/discount.schema";

// Chuẩn hóa mã để so sánh/lưu trữ thống nhất, tránh lệch do khoảng trắng hoặc chữ thường.
function normalizeCode(code: string) {
    return code.trim().toUpperCase();
}

// Chặn cấu hình sai như mã phần trăm lớn hơn 100%.
function assertValidDiscountAmount(type: DiscountType, amount: number) {
    if (type === 'PERCENTAGE' && amount > 100) {
        throw new Error('Phần trăm giảm giá không được vượt quá 100');
    }
}

export const DiscountService = {
    async applyDiscount(data: ApplyDiscountInput, userId: string) {
        try {
            const code = normalizeCode(data.code);
            const discount = await prisma.discountCode.findFirst({
                where: {
                    code: { equals: code, mode: "insensitive" },
                    is_active: true,
                },
            });

            if (!discount) {
                throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
            }

            if (discount.expires_at && discount.expires_at < new Date()) {
                throw new Error("Mã giảm giá đã hết hạn.");
            }

            if (discount.used_count >= discount.max_uses) {
                throw new Error("Mã giảm giá đã hết lượt sử dụng.");
            }

            const existingUsage = await prisma.discountUsage.findFirst({
                where: {
                    discount_code_id: discount.id,
                    user_id: userId,
                },
                select: { id: true },
            });

            if (existingUsage) {
                throw new Error("Bạn đã sử dụng mã giảm giá này rồi.");
            }

            const discount_cents =
                discount.type === DiscountType.PERCENTAGE
                    ? Math.floor((data.subtotal_cents * discount.discount_amount_cents) / 100)
                    : Math.min(discount.discount_amount_cents, data.subtotal_cents);

            return {
                code: discount.code,
                discount_cents,
                subtotal_cents: data.subtotal_cents,
                total_cents: Math.max(data.subtotal_cents - discount_cents, 0),
                type: discount.type,
            };
        } finally {}
    },

    // Lấy danh sách mã giảm giá cho admin, có phân trang và bộ lọc cơ bản.
    async getDiscounts(params: GetDiscountsParams) {
        try {
            const { page, limit, search, type, is_active } = params;
            const skip = (page - 1) * limit;

            // TỐI ƯU 1: Chuẩn hóa keyword chữ in hoa vì mã giảm giá thường viết hoa
            const keyword = search?.trim().toUpperCase();

            const where: Prisma.DiscountCodeWhereInput = {
                ...(type && { type }),
                ...(is_active !== undefined && { is_active }),
                ...(keyword && {
                    code: {
                        contains: keyword
                    },
                }),
            };

            const [discounts, total] = await Promise.all([
                prisma.discountCode.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { code: 'asc' },
                }),
                prisma.discountCode.count({ where }),
            ]);

            return {
                data: discounts,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } finally {}
    },

    // Tạo mã giảm giá mới sau khi chuẩn hóa mã code và kiểm tra trùng.
    async createDiscount(data: CreateDiscountInput) {
        try {
            const code = normalizeCode(data.code);
            assertValidDiscountAmount(data.type, data.discount_amount_cents);

            const existing = await prisma.discountCode.findFirst({
                where: {
                    code: { equals: code, mode: 'insensitive' },
                },
            });
            if (existing) throw new Error('Mã giảm giá đã tồn tại');

            return await prisma.discountCode.create({
                data: {
                    ...data,
                    code,
                },
            });
        } finally {}
    },

    // Cập nhật mã giảm giá và chặn đổi sang mã code đã tồn tại.
    async updateDiscount(id: string, data: UpdateDiscountInput) {
        try {
            const discount = await prisma.discountCode.findUnique({ where: { id } });
            if (!discount) throw new Error('Mã giảm giá không tồn tại');

            const code = data.code ? normalizeCode(data.code) : undefined;
            const nextType = data.type ?? discount.type;
            const nextAmount = data.discount_amount_cents ?? discount.discount_amount_cents;
            assertValidDiscountAmount(nextType, nextAmount);

            if (code) {
                const existing = await prisma.discountCode.findFirst({
                    where: {
                        code: { equals: code, mode: 'insensitive' },
                        NOT: { id },
                    },
                });
                if (existing) throw new Error('Mã giảm giá đã tồn tại');
            }

            return await prisma.discountCode.update({
                where: { id },
                data: {
                    ...data,
                    code,
                },
            });
        } finally {}
    },

    // Vô hiệu hóa mã giảm giá thay vì xóa cứng để giữ lịch sử đơn hàng.
    async disableDiscount(id: string) {
        try {
            const discount = await prisma.discountCode.findUnique({ where: { id } });
            if (!discount) throw new Error('Mã giảm giá không tồn tại');

            return await prisma.discountCode.update({
                where: { id },
                data: { is_active: false },
            });
        } finally {}
    },
};
