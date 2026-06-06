'use server'

import { CategoryService } from "../services/category.service"

export async function getCategoriesAction() {
    try {
        const categories = await CategoryService.getCategories();
        return { success: true, categories };
    } catch (err) {
        return { error: (err as Error).message }
    }
}