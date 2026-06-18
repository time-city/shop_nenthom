'use server'

import { requireAdmin } from "../requireAdmin";
import { DiscountService } from "../services/discount.service";
import { getSession } from "../session";
import {
    applyDiscountSchema,
    createDiscountSchema,
    disableDiscountSchema,
    discountIdSchema,
    getDiscountsSchema,
    updateDiscountSchema,
    CreateDiscountInput,
    GetDiscountsParams,
    UpdateDiscountInput,
    DisableDiscountInput,
    ApplyDiscountInput
} from "../validations/discount.schema";

// Server Action kiểm tra và tính số tiền giảm cho khách đã đăng nhập trước khi tạo đơn.
export async function applyDiscountAction(params: ApplyDiscountInput) {
    const session = await getSession();
    if (!session) return { error: 'Vui lòng đăng nhập để sử dụng mã giảm giá' };
    if (session.role === 'ADMIN') return { error: 'Tài khoản quản trị không thể dùng mã giảm giá' };

    const parsed = applyDiscountSchema.safeParse(params);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const discount = await DiscountService.applyDiscount(parsed.data, session.sub);
        return { success: true, data: discount };
    } catch (err) {
        return { error: (err as Error).message };
    }
}

// Server Action lấy danh sách mã giảm giá cho trang Admin.
export async function getDiscountsAction(params: Partial<GetDiscountsParams> = {}) {
    const authError = await requireAdmin();
    if ("error" in authError) return authError;

    const parsed = getDiscountsSchema.safeParse(params);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const discounts = await DiscountService.getDiscounts(parsed.data);
        return { success: true, ...discounts };
    } catch (err) {
        return { error: (err as Error).message };
    }
}

// Server Action tạo mã giảm giá mới, chỉ cho phép ADMIN thao tác.
export async function createDiscountAction(params: CreateDiscountInput) {
    const authError = await requireAdmin();
    if ("error" in authError) return authError;

    const parsed = createDiscountSchema.safeParse(params);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const discount = await DiscountService.createDiscount(parsed.data);
        return { success: true, data: discount };
    } catch (err) {
        return { error: (err as Error).message };
    }
}

// Server Action cập nhật mã giảm giá theo id, chỉ cho phép ADMIN thao tác.
export async function updateDiscountAction(id: string, params: UpdateDiscountInput) {
    const authError = await requireAdmin();
    if ("error" in authError) return authError;

    const idParsed = discountIdSchema.safeParse({ id });
    if (!idParsed.success) return { error: idParsed.error.issues[0].message };

    const parsed = updateDiscountSchema.safeParse(params);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const discount = await DiscountService.updateDiscount(idParsed.data.id, parsed.data);
        return { success: true, data: discount };
    } catch (err) {
        return { error: (err as Error).message };
    }
}

// Server Action vô hiệu hóa mã giảm giá thay vì xóa cứng, chỉ cho phép ADMIN thao tác.
export async function disableDiscountAction(params: DisableDiscountInput) {
    const authError = await requireAdmin();
    if ("error" in authError) return authError;

    const parsed = disableDiscountSchema.safeParse(params);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const discount = await DiscountService.disableDiscount(parsed.data.id);
        return { success: true, data: discount };
    } catch (err) {
        return { error: (err as Error).message };
    }
}
