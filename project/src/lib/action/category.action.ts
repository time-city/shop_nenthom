'use server'

import { requireAdmin } from "../requireAdmin"
import { CategoryService } from "../services/category.service"
import { createCategorySchema, updateCategorySchema, deleteCategorySchema } from "../validations/category.schema"
import { getPublicErrorMessage } from "../utils/publicError"
import prisma from "../prisma"

export async function getCategoriesAction() {
    try {
        const categories = await CategoryService.getCategories();
        return { success: true, categories };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Chưa thể tải danh mục. Vui lòng thử lại.") }
    }
}

export async function createCategoryAction(params: unknown) {
    const authError = await requireAdmin()
    if ("error" in authError) return authError

    const parsed = createCategorySchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const category = await CategoryService.createCategory(parsed.data)
        return { success: true, data: category }
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Chưa thể thêm danh mục. Vui lòng thử lại.") }
    }
}

export async function updateCategoryAction(id: number, params: unknown) {
    const authError = await requireAdmin()
    if ("error" in authError) return authError

    if (!id) return { error: 'Không thể xác định danh mục. Vui lòng tải lại trang.' }

    const parsed = updateCategorySchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const category = await CategoryService.updateCategory(id, parsed.data)
        return { success: true, data: category }
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Chưa thể cập nhật danh mục. Vui lòng thử lại.") }
    }
}

export async function deleteCategoryAction(params: unknown) {
    const authError = await requireAdmin()
    if ("error" in authError) return authError

    const parsed = deleteCategorySchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const category = await CategoryService.deleteCategory(parsed.data.id)
        return {
            success: true,
            data: category,
            message: category.stoppedProductCount > 0
                ? `Đã ẩn danh mục và ngừng bán ${category.stoppedProductCount} sản phẩm.`
                : "Đã ẩn danh mục.",
        }
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Chưa thể xóa danh mục. Vui lòng thử lại.") }
    }
}

export async function getCategoryDeleteImpactAction(params: unknown) {
    const authError = await requireAdmin()
    if ("error" in authError) return authError

    const parsed = deleteCategorySchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const impact = await CategoryService.getDeleteImpact(parsed.data.id)
        return { success: true, data: impact }
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Chưa thể kiểm tra danh mục. Vui lòng thử lại.") }
    }
}

export async function bulkDeleteCategoryAction(params: unknown) {
    const authError = await requireAdmin()
    if ("error" in authError) return authError

    if (!params || typeof params !== 'object' || !('ids' in params) || !Array.isArray((params as any).ids)) {
        return { error: "Danh sách danh mục không hợp lý" }
    }

    const ids = (params as any).ids as number[]
    if (ids.length === 0) return { error: "Vui lòng chọn danh mục để xóa" }

    try {
        let totalStoppedProducts = 0;
        let deletedCount = 0;

        for (const id of ids) {
            try {
                const category = await CategoryService.deleteCategory(id);
                totalStoppedProducts += category.stoppedProductCount;
                deletedCount++;
            } catch (err) {
                console.error(`[bulkDeleteCategoryAction] Error deleting category ${id}:`, err);
            }
        }

        return {
            success: true,
            deletedCount,
            totalStoppedProducts,
            message: totalStoppedProducts > 0
                ? `Đã xóa ${deletedCount} danh mục và ngừng bán ${totalStoppedProducts} sản phẩm liên quan.`
                : `Đã xóa ${deletedCount} danh mục.`,
        };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Chưa thể xóa các danh mục. Vui lòng thử lại.") }
    }
}

export async function getBulkCategoryDeleteImpactAction(params: unknown) {
    const authError = await requireAdmin()
    if ("error" in authError) return authError

    if (!params || typeof params !== 'object' || !('ids' in params) || !Array.isArray((params as any).ids)) {
        return { error: "Danh sách danh mục không hợp lý" }
    }

    const ids = (params as any).ids as number[]
    if (ids.length === 0) return { success: true, data: { productCount: 0 } }

    try {
        const productCount = await prisma.product.count({
            where: {
                category_id: { in: ids },
                is_active: true
            }
        });
        return { success: true, data: { productCount } };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Chưa thể kiểm tra tác động. Vui lòng thử lại.") }
    }
}
