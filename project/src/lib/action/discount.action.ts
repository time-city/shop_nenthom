'use server'

import { DiscountService } from "../services/discount.service";
import { getSession } from "../session";
import { 
    createDiscountSchema, 
    disableDiscountSchema, 
    discountIdSchema, 
    getDiscountsSchema,
    updateDiscountSchema,
    CreateDiscountInput,
    GetDiscountsParams,
    UpdateDiscountInput,
    DisableDiscountInput
} from "../validations/discount.schema";

// Kiểm tra người dùng hiện tại có quyền ADMIN để thao tác quản trị mã giảm giá.
async function requireAdmin() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { error: 'Không có quyền truy cập' };

    return null;
}

// Server Action lấy danh sách mã giảm giá cho trang Admin.
export async function getDiscountsAction(params: Partial<GetDiscountsParams> = {}) {
    const authError = await requireAdmin();
    if (authError) return authError;

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
    if (authError) return authError;

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
    if (authError) return authError;

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
    if (authError) return authError;

    const parsed = disableDiscountSchema.safeParse(params);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const discount = await DiscountService.disableDiscount(parsed.data.id);
        return { success: true, data: discount };
    } catch (err) {
        return { error: (err as Error).message };
    }
}
