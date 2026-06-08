import prisma from "../prisma"
import { CreateCategoryInput, UpdateCategoryInput } from "../validations/category.schema";

export const CategoryService = {
    async getCategories(){
        return prisma.category.findMany({
            where: {is_active: true},
            select: {
                id: true,
                name: true,
                description: true
            },
            orderBy: {name: 'asc'},
        });
    },

    async createCategory(data: CreateCategoryInput) {
        const existing = await prisma.category.findFirst({
            where: {
                name: { equals: data.name, mode: 'insensitive' },
                is_active: true
            }
        });
        if (existing) throw new Error('Tên danh mục đã tồn tại');

        return prisma.category.create({
            data
        });
    },

    async updateCategory(id: number, data: UpdateCategoryInput) {
        const category = await prisma.category.findUnique({
            where: { id, is_active: true }
        });
        if (!category) throw new Error('Danh mục không tồn tại');

        if (data.name) {
            const existing = await prisma.category.findFirst({
                where: {
                    name: { equals: data.name, mode: 'insensitive' },
                    is_active: true,
                    NOT: { id }
                }
            });
            if (existing) throw new Error('Tên danh mục đã tồn tại');
        }

        return prisma.category.update({
            where: { id },
            data
        });
    },

    async deleteCategory(id: number) {
        const category = await prisma.category.findUnique({
            where: { id, is_active: true }
        });
        if (!category) throw new Error('Danh mục không tồn tại');

        return prisma.category.update({
            where: { id },
            data: { is_active: false }
        });
    }
}