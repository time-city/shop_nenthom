import prisma from "../prisma"

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
    }
}