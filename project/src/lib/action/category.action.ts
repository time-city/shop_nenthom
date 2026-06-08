'use server'

import { CategoryService } from "../services/category.service"
import { createCategorySchema, updateCategorySchema, deleteCategorySchema } from "../validations/category.schema"
import { getSession } from "../session"

// Kiểm tra người dùng hiện tại có quyền ADMIN để thao tác quản trị.
async function requireAdmin() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return { error: 'Không có quyền truy cập' }

    return null
}

export async function getCategoriesAction() {
    try {
        const categories = await CategoryService.getCategories();
        return { success: true, categories };
    } catch (err) {
        return { error: (err as Error).message }
    }
}

export async function createCategoryAction(params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = createCategorySchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const category = await CategoryService.createCategory(parsed.data)
        return { success: true, data: category }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

export async function updateCategoryAction(id: number, params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    if (!id) return { error: 'Thiếu category ID' }

    const parsed = updateCategorySchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const category = await CategoryService.updateCategory(id, parsed.data)
        return { success: true, data: category }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

export async function deleteCategoryAction(params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = deleteCategorySchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const category = await CategoryService.deleteCategory(parsed.data.id)
        return { success: true, data: category }
    } catch (err) {
        return { error: (err as Error).message }
    }
}