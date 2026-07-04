import { NotificationType, OrderStatus, Prisma } from "@prisma/client";
import prisma from "../prisma";
import { emitCartProductsRemovedToUser } from "../events/userCartEvents";
import { GetProductsParams, CreateProductInput, UpdateProductInput } from "../validations/product.schema";

let optionsCache: any = null;
let cacheExpiry: number = 0;

const CUSTOM_CANDLE_CATEGORY_NAME = "Nến tùy chỉnh";
const CUSTOM_CANDLE_PRODUCT_NAME = "Nến tùy chỉnh";
const CUSTOM_CANDLE_BASE_PRICE = 189000;


async function getCachedCustomizationOptions() {
    const now = Date.now();
    if (!optionsCache || now > cacheExpiry) {
        optionsCache = await ProductService.getCustomizationOptions();
        cacheExpiry = now + 5 * 60 * 1000;
    }
    return optionsCache;
}

export const ProductService = {

    async getProducts(param: GetProductsParams) {
        try {
            const { page, limit, categoryId, includeCustom, search, minPrice, maxPrice, scentId } = param;
            const skip = (page - 1) * limit;

            const where: Prisma.ProductWhereInput = {
                is_active: true,
                ...(!includeCustom && { is_custom: false }),
                ...(categoryId && { category_id: categoryId }),
                ...(scentId && {
                    scents: {
                        some: {
                            scent_id: scentId,
                        },
                    },
                }),
                ...(search && {
                    // Sử dụng startsWith nếu logic nghiệp vụ chỉ cần tìm từ đầu chuỗi (Ăn trúng Index)
                    // Nếu bắt buộc phải tìm chứa cụm từ ở giữa, giữ contains nhưng có Index bổ trợ ở Bước 1 gánh tải
                    name: { contains: search.trim(), mode: 'insensitive' },
                }),
                ...((minPrice !== undefined || maxPrice !== undefined) && {
                    base_price_cents: {
                        ...(minPrice !== undefined && { gte: minPrice }),
                        ...(maxPrice !== undefined && { lte: maxPrice }),
                    },
                }),
            };

            // TỐI ƯU: Kích hoạt chạy song song thực sự qua Promise.all độc lập thay vì bọc Transaction khóa kết nối
            const [products, total] = await Promise.all([
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
                        ingredients: true,
                        usage_instructions: true,
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
        } finally {}
    },


    async getScents() {
        try {
            return await prisma.scent.findMany({
                where: { is_active: true },
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    price_extra_cents: true,
                },
            });
        } finally {}
    },


    async getCustomizationOptions() {
        try {
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
            return { scents, colors, waxColors: colors, sizes, packagings, toppings }
        } finally {}
    },


    async getCustomCandleProduct() {
        return prisma.$transaction(async (tx) => {
            let category = await tx.category.findFirst({
                where: {
                    name: CUSTOM_CANDLE_CATEGORY_NAME,
                },
                select: { id: true },
            });

            if (!category) {
                category = await tx.category.create({
                    data: {
                    description: "Danh mục hệ thống dành cho nến tùy chỉnh.",
                    is_active: false,
                        name: CUSTOM_CANDLE_CATEGORY_NAME,
                    },
                    select: { id: true },
                });
            }

            const existingProduct = await tx.product.findFirst({
                where: {
                    is_custom: true,
                    name: CUSTOM_CANDLE_PRODUCT_NAME,
                },
                select: {
                    id: true,
                    name: true,
                    base_price_cents: true,
                    is_custom: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                },
            });

            if (existingProduct) {
                return tx.product.update({
                    where: { id: existingProduct.id },
                    data: {
                        category_id: category.id,
                        is_active: true,
                        is_custom: true,
                    },
                    select: {
                        id: true,
                        name: true,
                        base_price_cents: true,
                        is_custom: true,
                        category: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                });
            }

            return tx.product.create({
                data: {
                    base_price_cents: CUSTOM_CANDLE_BASE_PRICE,
                    category_id: category.id,
                    description: "Sản phẩm hệ thống dùng để lưu cấu hình nến tùy chỉnh.",
                    images: [],
                    is_active: true,
                    is_custom: true,
                    name: CUSTOM_CANDLE_PRODUCT_NAME,
                },
                select: {
                    id: true,
                    name: true,
                    base_price_cents: true,
                    is_custom: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                },
            });
        });
    },


    async getProductDetail(id: string) {
        try {
            // TỐI ƯU: Kích hoạt chạy song song thực sự bằng Promise.all
            const [product, options] = await Promise.all([
                prisma.product.findUnique({
                    where: { id, is_active: true },
                    select: {
                        id: true,
                        name: true,
                        base_price_cents: true,
                        description: true,
                        ingredients: true,
                        usage_instructions: true,
                        images: true,
                        created_at: true,
                        category: {
                            select: { id: true, name: true },
                        },
                    }
                }),
                getCachedCustomizationOptions() // Lấy từ bộ nhớ RAM siêu tốc
            ]);

            if (!product) {
                throw new Error('Sản phẩm này hiện không còn khả dụng.');
            }

            return {
                product,
                options,
            };
        } finally {}
    },




    async createProduct(data: CreateProductInput) {
        try {
            const categoryExists = await prisma.category.findUnique({
                where: { id: data.category_id, is_active: true }
            });
            if (!categoryExists) {
                throw new Error('Danh mục đã chọn hiện không còn khả dụng.');
            }
            const existingName = await prisma.product.findFirst({
                where: {
                    name: { equals: data.name, mode: 'insensitive' },
                    is_active: true
                }
            });
            if (existingName) {
                throw new Error('Tên sản phẩm này đã được sử dụng.');
            }
            const product = await prisma.product.create({
                data: {
                    category_id: data.category_id,
                    name: data.name,
                    base_price_cents: data.base_price_cents,
                    description: data.description,
                    ingredients: data.ingredients,
                    usage_instructions: data.usage_instructions,
                    images: data.images,
                    is_active: data.is_active,
                    scents: {
                        create: (data.scentIds ?? []).map(scentId => ({
                            scent_id: scentId
                        }))
                    }
                },
                select: {
                    id: true,
                    category_id: true,
                    name: true,
                    base_price_cents: true,
                    description: true,
                    ingredients: true,
                    usage_instructions: true,
                    images: true,
                    is_active: true,
                    created_at: true,
                    scents: {
                        select: {
                            scent_id: true
                        }
                    }
                }
            });
            return product;
        } finally {}
    },


    async updateProduct(id: string, data: UpdateProductInput) {
        try {
            const product = await prisma.product.findUnique({
                where: { id, is_active: true }
            });
            if (!product) throw new Error('Sản phẩm này hiện không còn khả dụng.');
            if (data.category_id !== undefined) {
                const categoryExists = await prisma.category.findUnique({
                    where: { id: data.category_id, is_active: true }
                });
                if (!categoryExists) {
                    throw new Error('Danh mục đã chọn hiện không còn khả dụng.');
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
                    throw new Error('Tên sản phẩm này đã được sử dụng.');
                }
            }
            const updated = await prisma.product.update({
                where: { id },
                data: {
                    category_id: data.category_id,
                    name: data.name,
                    base_price_cents: data.base_price_cents,
                    description: data.description,
                    ingredients: data.ingredients,
                    usage_instructions: data.usage_instructions,
                    images: data.images,
                    is_active: data.is_active,
                    ...(data.scentIds !== undefined && {
                        scents: {
                            deleteMany: {},
                            create: data.scentIds.map(scentId => ({
                                scent_id: scentId
                            }))
                        }
                    })
                },
                select: {
                    id: true,
                    category_id: true,
                    name: true,
                    base_price_cents: true,
                    description: true,
                    ingredients: true,
                    usage_instructions: true,
                    images: true,
                    is_active: true,
                    created_at: true,
                    scents: {
                        select: {
                            scent_id: true
                        }
                    }
                }
            });
            return updated;
        } finally {}
    },


    async deleteProduct(id: string) {
        try {
            const product = await prisma.product.findUnique({
                where: { id, is_active: true },
                select: { id: true, name: true },
            });
            if (!product) throw new Error('Sản phẩm này hiện không còn khả dụng.');

            const affectedCarts = await prisma.cartItem.findMany({
                where: { product_id: id },
                select: {
                    cart: {
                        select: { user_id: true },
                    },
                },
            });

            const affectedUserIds = [
                ...new Set(
                    affectedCarts
                        .map((item) => item.cart.user_id)
                        .filter((userId): userId is string => Boolean(userId)),
                ),
            ];

            const [updated, removedCartItems] = await Promise.all([
                prisma.product.update({
                    where: { id },
                    data: { is_active: false },
                    select: {
                        id: true,
                        is_active: true,
                    },
                }),
                prisma.cartItem.deleteMany({
                    where: { product_id: id },
                }),
                affectedUserIds.length > 0
                    ? prisma.notification.createMany({
                        data: affectedUserIds.map((userId) => ({
                            data: {
                                productId: product.id,
                                productName: product.name,
                            },
                            message: `${product.name} đã ngừng bán và được tự động xóa khỏi giỏ hàng của bạn.`,
                            title: "Sản phẩm đã ngừng bán",
                            type: NotificationType.PRODUCT_UNAVAILABLE,
                            user_id: userId,
                        })),
                    })
                    : Promise.resolve({ count: 0 }),
            ]);

            const eventResults = await Promise.allSettled(
                affectedUserIds.map((userId) =>
                    emitCartProductsRemovedToUser(userId, [product.name]),
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
                ...updated,
                notifiedUserCount: affectedUserIds.length,
                removedCartItemCount: removedCartItems.count,
            };
        } finally {}
    },

    async getDeleteImpact(id: string) {
        const product = await prisma.product.findUnique({
            where: { id, is_active: true },
            select: { id: true, name: true },
        });
        if (!product) throw new Error("Sản phẩm này hiện không còn khả dụng.");

        const [cartSummary, carts, activeOrderItems] = await Promise.all([
            prisma.cartItem.aggregate({
                where: { product_id: id },
                _count: { id: true },
                _sum: { quantity: true },
            }),
            prisma.cartItem.findMany({
                where: { product_id: id },
                distinct: ["cart_id"],
                select: { cart_id: true },
            }),
            prisma.orderItem.findMany({
                where: {
                    product_id: id,
                    order: {
                        status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] },
                    },
                },
                select: {
                    quantity: true,
                    order: {
                        select: {
                            order_number: true,
                            shipping_fullname: true,
                            status: true,
                        },
                    },
                },
                orderBy: { order: { created_at: "desc" } },
            }),
        ]);

        const ordersByNumber = new Map<string, {
            customerName: string;
            orderNumber: string;
            quantity: number;
            status: OrderStatus;
        }>();

        for (const item of activeOrderItems) {
            const existing = ordersByNumber.get(item.order.order_number);
            if (existing) {
                existing.quantity += item.quantity;
                continue;
            }

            ordersByNumber.set(item.order.order_number, {
                customerName: item.order.shipping_fullname,
                orderNumber: item.order.order_number,
                quantity: item.quantity,
                status: item.order.status,
            });
        }

        return {
            activeOrderCount: ordersByNumber.size,
            cartCount: carts.length,
            cartItemCount: cartSummary._count.id,
            cartQuantity: cartSummary._sum.quantity ?? 0,
            orders: [...ordersByNumber.values()],
            productId: product.id,
            productName: product.name,
        };
    }
}
