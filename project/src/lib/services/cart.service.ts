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

}
