import prisma from "../prisma";
import { ProductService } from "./product.service";
import { AddToCartInput } from "../validations/cart.schema";

const cartSelect = {
    id: true,
    user_id: true,
    session_id: true,
    items: {
        select: {
            id: true,
            quantity: true,
            toppings_json: true, // Vẫn lấy để xử lý nếu cần
            product: { select: { id: true, name: true, base_price_cents: true, images: true, is_custom: true } },
            color: { select: { id: true, name: true, hex_code: true, price_extra_cents: true } },
            scent: { select: { id: true, name: true, price_extra_cents: true } },
            size: { select: { id: true, name: true, weight_gram: true, price_extra_cents: true } },
            packaging: { select: { id: true, name: true, price_extra_cents: true } },
        }
    }
} as const;

const getToppingIds = (value: unknown) =>
    Array.isArray(value)
        ? value.filter((id): id is number => Number.isInteger(id)).sort((a, b) => a - b)
        : [];

async function attachToppingsToCart<T extends { items: Array<{ toppings_json: unknown }> }>(cart: T) {
    {
        const toppingIds = [
            ...new Set(cart.items.flatMap((item) => getToppingIds(item.toppings_json))),
        ];

        if (!toppingIds.length) return { ...cart, items: cart.items.map(item => ({ ...item, toppings: [] })) };

        const toppings = await prisma.topping.findMany({
            where: { id: { in: toppingIds }, is_active: true },
            select: { id: true, name: true, price_extra_cents: true },
        });

        const toppingById = new Map(toppings.map((topping) => [topping.id, topping]));

        return {
            ...cart,
            items: cart.items.map((item) => ({
                ...item,
                toppings: getToppingIds(item.toppings_json)
                    .map((id) => toppingById.get(id))
                    .filter((topping): topping is NonNullable<typeof topping> => Boolean(topping)),
            })),
        };
    }
}

export const CartService = {

    async getOrCreateCart(userId?: string, sessionId?: string) {
        try {
            if (!userId && !sessionId) throw new Error('Phiên mua sắm đã hết hạn. Vui lòng tải lại trang và thử lại.')

            const where = userId ? { user_id: userId } : { session_id: sessionId }

            let cart = await prisma.cart.findUnique({
                where,
                select: cartSelect,
            })

            // Nếu chưa có giỏ hàng thì tạo mới
            if (!cart) {
                cart = await prisma.cart.create({
                    data: userId ? { user_id: userId } : { session_id: sessionId },
                    select: cartSelect,
                });
            }

            return attachToppingsToCart(cart)
        } finally {}
    },

    // hàm lấy mỗi ID để xử lý nhanh
    async getOrCreateCartId(userId?: string, sessionId?: string) {
        try {
            if (!userId && !sessionId) throw new Error('Phiên mua sắm đã hết hạn. Vui lòng tải lại trang và thử lại.')

            const where = userId ? { user_id: userId } : { session_id: sessionId }

            const existing = await prisma.cart.findFirst({
                where,
                select: { id: true }
            })
            if (existing) return existing.id

            const created = await prisma.cart.create({
                data: userId ? { user_id: userId } : { session_id: sessionId },
                select: { id: true }
            })
            return created.id
        } finally {}
    },


    async addToCart(data: AddToCartInput, userId?: string, sessionId?: string) {
        const cartId = await CartService.getOrCreateCartId(userId, sessionId);
        const product = data.product_id
            ? await prisma.product.findFirst({
                where: { id: data.product_id, is_active: true },
                select: { id: true }
            })
            : await ProductService.getCustomCandleProduct();
        const productId = product?.id;
        // Check product tồn tại và còn active
        if (!productId) throw new Error('Sản phẩm này hiện không còn khả dụng. Vui lòng chọn sản phẩm khác.')
        const toppingIds = getToppingIds(data.toppings_json);

        // Check item đã có trong cart chưa (cùng product + options)
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cart_id: cartId,
                product_id: productId,
                scent_id: data.scent_id ?? null,
                color_id: data.color_id ?? null,
                size_id: data.size_id ?? null,
                pack_id: data.pack_id ?? null,
                toppings_json: { equals: toppingIds },
            },
        })

        // Nếu đã có → tăng quantity
        if (existingItem) {
            return prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: { increment: data.quantity } },
            })
        }
        // Chưa có → tạo mới
        return prisma.cartItem.create({
            data: {
                cart_id: cartId,
                product_id: productId,
                quantity: data.quantity,
                scent_id: data.scent_id,
                color_id: data.color_id,
                size_id: data.size_id,
                pack_id: data.pack_id,
                toppings_json: toppingIds,
            },
        })
    },

    async updateCartItem(cartId: string, itemId: string, quantity: number) {
        // Check item thuộc cart này không
        const item = await prisma.cartItem.findUnique({
            where: { id: itemId },
            select: { cart_id: true }
        })
        if (!item) throw new Error('Không tìm thấy sản phẩm này trong giỏ hàng. Vui lòng tải lại trang.')
        if (item.cart_id !== cartId) throw new Error('Không tìm thấy sản phẩm này trong giỏ hàng. Vui lòng tải lại trang.')

        // update theo cartId để tránh lỗi không tìm thấy
        return prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        })
    },

    async removeCartItem(cartId: string, itemId: string) {
        const item = await prisma.cartItem.findUnique({
            where: { id: itemId },
            select: { cart_id: true } 
        })
        if (!item) throw new Error('Không tìm thấy sản phẩm này trong giỏ hàng. Vui lòng tải lại trang.')
        if (item.cart_id !== cartId) throw new Error('Không tìm thấy sản phẩm này trong giỏ hàng. Vui lòng tải lại trang.')

        return prisma.cartItem.delete({ where: { id: itemId } })
    },

    async clearCart(cartId: string) {
        return prisma.cartItem.deleteMany({ where: { cart_id: cartId } })
    },

    // Merge toàn bộ cart_items của guest sang cart của user sau khi đăng nhập.
    // - Nếu cùng product + combo options → cộng dồn quantity vào item đã có của user.
    // - Nếu chưa có → chuyển cart_id sang cart của user.
    // - Xóa guest cart sau khi merge xong.
    async mergeGuestCartIntoUserCart(guestSessionId: string, userId: string): Promise<void> {
        const [guestCart, userCart] = await Promise.all([
            prisma.cart.findUnique({
                where: { session_id: guestSessionId },
                select: {
                    id: true,
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                            product_id: true,
                            scent_id: true,
                            color_id: true,
                            size_id: true,
                            pack_id: true,
                            toppings_json: true,
                        },
                    },
                },
            }),
            prisma.cart.findUnique({
                where: { user_id: userId },
                select: {
                    id: true,
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                            product_id: true,
                            scent_id: true,
                            color_id: true,
                            size_id: true,
                            pack_id: true,
                            toppings_json: true,
                        },
                    },
                },
            }),
        ]);

        // Không có guest cart → không cần làm gì
        if (!guestCart || guestCart.items.length === 0) return;

        // Tạo user cart nếu chưa có
        const targetCart = userCart ?? await prisma.cart.create({
            data: { user_id: userId },
            select: { id: true, items: { select: { id: true, quantity: true, product_id: true, scent_id: true, color_id: true, size_id: true, pack_id: true, toppings_json: true } } },
        });

        await prisma.$transaction(async (tx) => {
            for (const guestItem of guestCart.items) {
                const guestToppingIds = getToppingIds(guestItem.toppings_json);

                // Tìm item trùng combo trong user cart
                const duplicate = targetCart.items.find((userItem) => {
                    if (userItem.product_id !== guestItem.product_id) return false;
                    if (userItem.scent_id !== guestItem.scent_id) return false;
                    if (userItem.color_id !== guestItem.color_id) return false;
                    if (userItem.size_id !== guestItem.size_id) return false;
                    if (userItem.pack_id !== guestItem.pack_id) return false;
                    const userToppingIds = getToppingIds(userItem.toppings_json);
                    return JSON.stringify(guestToppingIds) === JSON.stringify(userToppingIds);
                });

                if (duplicate) {
                    // Cộng dồn quantity vào item đã có
                    await tx.cartItem.update({
                        where: { id: duplicate.id },
                        data: { quantity: { increment: guestItem.quantity } },
                    });
                    // Xóa item guest (đã merge)
                    await tx.cartItem.delete({ where: { id: guestItem.id } });
                } else {
                    // Chuyển item sang user cart
                    await tx.cartItem.update({
                        where: { id: guestItem.id },
                        data: { cart_id: targetCart.id },
                    });
                }
            }

            // Xóa guest cart (rỗng sau khi đã chuyển hết items)
            await tx.cart.delete({ where: { id: guestCart.id } });
        });
    },

}
