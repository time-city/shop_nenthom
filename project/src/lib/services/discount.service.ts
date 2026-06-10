import { DiscountType } from "@prisma/client";
import prisma from "../prisma";
import { CreateDiscountInput, UpdateDiscountInput } from "../validations/discount.schema";

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
    // Tạo mã giảm giá mới sau khi chuẩn hóa mã code và kiểm tra trùng.
    async createDiscount(data: CreateDiscountInput) {
        const code = normalizeCode(data.code);
        assertValidDiscountAmount(data.type, data.discount_amount_cents);

        const existing = await prisma.discountCode.findFirst({
            where: {
                code: { equals: code, mode: 'insensitive' },
            },
        });
        if (existing) throw new Error('Mã giảm giá đã tồn tại');

        return prisma.discountCode.create({
            data: {
                ...data,
                code,
            },
        });
    },

    // Cập nhật mã giảm giá và chặn đổi sang mã code đã tồn tại.
    async updateDiscount(id: string, data: UpdateDiscountInput) {
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

        return prisma.discountCode.update({
            where: { id },
            data: {
                ...data,
                code,
            },
        });
    },

    // Vô hiệu hóa mã giảm giá thay vì xóa cứng để giữ lịch sử đơn hàng.
    async disableDiscount(id: string) {
        const discount = await prisma.discountCode.findUnique({ where: { id } });
        if (!discount) throw new Error('Mã giảm giá không tồn tại');

        return prisma.discountCode.update({
            where: { id },
            data: { is_active: false },
        });
    },
};
