import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { GetProductsParams, CreateProductInput, UpdateProductInput } from "../validations/product.schema";

export const ProductService = {
    async getProducts(param: GetProductsParams) {
        const { page, limit, categoryId, search } = param;
        const skip = (page - 1) * limit;

        const where: Prisma.ProductWhereInput = {
            is_active: true,
            ...(categoryId && { category_id: categoryId }),
            ...(search && {
                name: { contains: search.trim(), mode: 'insensitive' },
            }),
        };

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    created_at: 'desc',
                },
                select: {
                    id: true,
                    category_id: true,
                    name: true,
                    base_price_cents: true,
                    description: true,
                    images: true,
                    is_active: true,
                    created_at: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                },
            }),
            prisma.product.count({ where }),
        ]);

        return {
            data: products,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    async getCustomizationOptions() {
        const [scents, colors, sizes, packagings, toppings] = await Promise.all([
            prisma.scent.findMany({
                where: { is_active: true },
                select: { id: true, name: true, price_extra_cents: true },
            }),
            prisma.waxColor.findMany({
                where: { is_active: true },
                select: { id: true, name: true, hex_code: true, price_extra_cents: true },
            }),
            prisma.candleSize.findMany({
                where: { is_active: true },
                select: { id: true, name: true, weight_gram: true, price_extra_cents: true },
            }),
            prisma.packaging.findMany({
                where: { is_active: true },
                select: { id: true, name: true, price_extra_cents: true },
            }),
            prisma.topping.findMany({
                where: { is_active: true, in_stock: true },
                select: { id: true, name: true, price_extra_cents: true },
            }),
        ])

        return { scents, colors, sizes, packagings, toppings }
    },

    async getProductDetail(id: string) {
        const product = await prisma.product.findUnique({
            where: { id, is_active: true },
            select: {
                id: true,
                name: true,
                base_price_cents: true,
                description: true,
                images: true,
                created_at: true,
                category: {
                    select: { id: true, name: true },
                },
            }
        })
        if (!product) throw new Error('Sản phẩm không tồn tại');

        // Lấy options liên quan song song
        const options = await ProductService.getCustomizationOptions();
        return {
            ...product, options
        }
    },

    async createProduct(data: CreateProductInput) {
        const categoryExists = await prisma.category.findUnique({
            where: { id: data.category_id, is_active: true }
        });
        if (!categoryExists) {
            throw new Error('Danh mục (Category) không tồn tại hoặc đã bị ẩn');
        }

        const existingName = await prisma.product.findFirst({
            where: {
                name: { equals: data.name, mode: 'insensitive' },
                is_active: true
            }
        });
        if (existingName) {
            throw new Error('Tên sản phẩm đã tồn tại');
        }

        const product = await prisma.product.create({
            data: {
                category_id: data.category_id,
                name: data.name,
                base_price_cents: data.base_price_cents,
                description: data.description,
                images: data.images,
                is_active: data.is_active,
            },
            select: {
                id: true,
                category_id: true,
                name: true,
                base_price_cents: true,
                description: true,
                images: true,
                is_active: true,
                created_at: true,
            }
        });
        return product;
    },

    async updateProduct(id: string, data: UpdateProductInput) {
        const product = await prisma.product.findUnique({
            where: { id, is_active: true }
        });
        if (!product) throw new Error('Sản phẩm không tồn tại');

        if (data.category_id !== undefined) {
            const categoryExists = await prisma.category.findUnique({
                where: { id: data.category_id, is_active: true }
            });
            if (!categoryExists) {
                throw new Error('Danh mục (Category) không tồn tại hoặc đã bị ẩn');
            }
        }

        if (data.name) {
            const existingName = await prisma.product.findFirst({
                where: {
                    name: { equals: data.name, mode: 'insensitive' },
                    is_active: true,
                    NOT: { id },
                }
            });
            if (existingName) {
                throw new Error('Tên sản phẩm đã tồn tại');
            }
        }

        const updated = await prisma.product.update({
            where: { id },
            data: {
                category_id: data.category_id,
                name: data.name,
                base_price_cents: data.base_price_cents,
                description: data.description,
                images: data.images,
                is_active: data.is_active,
            },
            select: {
                id: true,
                category_id: true,
                name: true,
                base_price_cents: true,
                description: true,
                images: true,
                is_active: true,
                created_at: true,
            }
        });
        return updated;
    },

    async deleteProduct(id: string) {
        const product = await prisma.product.findUnique({
            where: { id, is_active: true }
        });
        if (!product) throw new Error('Sản phẩm không tồn tại');

        return prisma.product.update({
            where: { id },
            data: { is_active: false },
            select: {
                id: true,
                is_active: true,
            }
        });
    }
}
