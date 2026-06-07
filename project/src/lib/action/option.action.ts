'use server'

import { OptionService } from "../services/option.service"
import { getSession } from "../session"
import { deleteOptionSchema, packagingSchema, scentSchema, sizeSchema, toppingSchema, updatePackagingSchema, updateScentSchema, updateSizeSchema, updateToppingSchema, updateWaxColorSchema, waxColorSchema } from "../validations/option.schema"

// Kiểm tra người dùng hiện tại có quyền ADMIN để thao tác quản trị option.
async function requireAdmin() {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return { error: 'Không có quyền truy cập' }

    return null
}

// Server Action tạo mùi hương, chỉ cho phép ADMIN thao tác.
export async function createScentAction(params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = scentSchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const scent = await OptionService.createScent(parsed.data)
        return { success: true, data: scent }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

// Server Action cập nhật mùi hương theo id, chỉ cho phép ADMIN thao tác.
export async function updateScentAction(id: number, params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = updateScentSchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const scent = await OptionService.updateScent(id, parsed.data)
        return { success: true, data: scent }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

// Server Action tạo màu sáp, chỉ cho phép ADMIN thao tác.
export async function createWaxColorAction(params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = waxColorSchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const color = await OptionService.createWaxColor(parsed.data)
        return { success: true, data: color }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

// Server Action cập nhật màu sáp theo id, chỉ cho phép ADMIN thao tác.
export async function updateWaxColorAction(id: number, params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = updateWaxColorSchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const color = await OptionService.updateWaxColor(id, parsed.data)
        return { success: true, data: color }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

// Server Action tạo kích thước nến, chỉ cho phép ADMIN thao tác.
export async function createSizeAction(params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = sizeSchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const size = await OptionService.createSize(parsed.data)
        return { success: true, data: size }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

// Server Action cập nhật kích thước nến theo id, chỉ cho phép ADMIN thao tác.
export async function updateSizeAction(id: number, params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = updateSizeSchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const size = await OptionService.updateSize(id, parsed.data)
        return { success: true, data: size }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

// Server Action tạo loại bao bì, chỉ cho phép ADMIN thao tác.
export async function createPackagingAction(params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = packagingSchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const packaging = await OptionService.createPackaging(parsed.data)
        return { success: true, data: packaging }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

// Server Action cập nhật loại bao bì theo id, chỉ cho phép ADMIN thao tác.
export async function updatePackagingAction(id: number, params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = updatePackagingSchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const packaging = await OptionService.updatePackaging(id, parsed.data)
        return { success: true, data: packaging }
    } catch (err) {
        return { error: (err as Error).message }
    }
}


// Server Action tạo topping, chỉ cho phép ADMIN thao tác.
export async function createToppingAction(params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = toppingSchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const topping = await OptionService.createTopping(parsed.data)
        return { success: true, data: topping }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

// Server Action cập nhật topping theo id, chỉ cho phép ADMIN thao tác.
export async function updateToppingAction(id: number, params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = updateToppingSchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        const topping = await OptionService.updateTopping(id, parsed.data)
        return { success: true, data: topping }
    } catch (err) {
        return { error: (err as Error).message }
    }
}

// Server Action ẩn một option theo loại và id, chỉ cho phép ADMIN thao tác.
export async function deleteOptionAction(params: unknown) {
    const authError = await requireAdmin()
    if (authError) return authError

    const parsed = deleteOptionSchema.safeParse(params)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    try {
        await OptionService.deleteOption(parsed.data.type, parsed.data.id)
        return { success: true }
    } catch (err) {
        return { error: (err as Error).message }
    }
}
