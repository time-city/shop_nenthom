import { NotificationType } from "@prisma/client";
import prisma from "../prisma"
import { emitCartProductsRemovedToUser } from "../events/userCartEvents";
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

        const activeProducts = await prisma.product.findMany({
            where: { category_id: id, is_active: true },
            select: { id: true, name: true },
        });
        const productIds = activeProducts.map((product) => product.id);
        const affectedCartItems = productIds.length > 0
            ? await prisma.cartItem.findMany({
                where: { product_id: { in: productIds } },
                select: {
                    product_id: true,
                    cart: { select: { user_id: true } },
                },
            })
            : [];
        const productsById = new Map(
            activeProducts.map((product) => [product.id, product.name]),
        );
        const productsByUser = new Map<string, Set<string>>();

        for (const item of affectedCartItems) {
            const userId = item.cart.user_id;
            const productName = productsById.get(item.product_id);
            if (!userId || !productName) continue;

            const names = productsByUser.get(userId) ?? new Set<string>();
            names.add(productName);
            productsByUser.set(userId, names);
        }

        const [updatedCategory, stoppedProducts, removedCartItems] =
            await Promise.all([
                prisma.category.update({
                    where: { id },
                    data: { is_active: false },
                }),
                prisma.product.updateMany({
                    where: { category_id: id, is_active: true },
                    data: { is_active: false },
                }),
                productIds.length > 0
                    ? prisma.cartItem.deleteMany({
                        where: { product_id: { in: productIds } },
                    })
                    : Promise.resolve({ count: 0 }),
                productsByUser.size > 0
                    ? prisma.notification.createMany({
                        data: [...productsByUser.entries()].map(
                            ([userId, productNames]) => {
                                const names = [...productNames];
                                return {
                                    data: {
                                        categoryId: category.id,
                                        categoryName: category.name,
                                        productNames: names,
                                    },
                                    message: `${names.join(", ")} đã ngừng bán và được tự động xóa khỏi giỏ hàng của bạn.`,
                                    title: "Sản phẩm đã ngừng bán",
                                    type: NotificationType.PRODUCT_UNAVAILABLE,
                                    user_id: userId,
                                };
                            },
                        ),
                    })
                    : Promise.resolve({ count: 0 }),
            ]);

        const eventResults = await Promise.allSettled(
            [...productsByUser.entries()].map(([userId, productNames]) =>
                emitCartProductsRemovedToUser(userId, [...productNames]),
            ),
        );
        for (const result of eventResults) {
            if (result.status === "rejected") {
                console.error(
                    "[emitCartProductsRemovedToUser] Không thể phát sự kiện:",
                    result.reason,
                );
            }
        }

        return {
            ...updatedCategory,
            notifiedUserCount: productsByUser.size,
            removedCartItemCount: removedCartItems.count,
            stoppedProductCount: stoppedProducts.count,
        };
    },

    async getDeleteImpact(id: number) {
        const category = await prisma.category.findUnique({
            where: { id, is_active: true },
            select: {
                id: true,
                name: true,
                products: {
                    where: { is_active: true },
                    orderBy: { name: "asc" },
                    select: { id: true, name: true },
                },
            },
        });
        if (!category) throw new Error("Danh mục không tồn tại");

        return {
            categoryId: category.id,
            categoryName: category.name,
            productCount: category.products.length,
            products: category.products,
        };
    }
}
