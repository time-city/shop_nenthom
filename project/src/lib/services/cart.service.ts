import prisma from "../prisma";
import { AddToCartInput } from "../validations/cart.schema";

export const CartService = {

    async getOrCreateCart(userId?: string, sessionId?: string) {
        if (!userId && !sessionId) throw new Error('Thiếu thông tin định danh')

        const where = userId ? { user_id: userId } : { session_id: sessionId }

        const existing = await prisma.cart.findFirst({ where })
        if (existing) return existing

        return prisma.cart.create({
            data: userId ? { user_id: userId } : { session_id: sessionId },
        })
    },


    async addToCart(data: AddToCartInput, userId?: string, sessionId?: string) {
        const cart = await CartService.getOrCreateCart(userId, sessionId);
        // Check product tồn tại và còn active
        const product = await prisma.product.findUnique({
            where: { id: data.product_id, is_active: true },
        })
        if (!product) throw new Error('Sản phẩm không tồn tại')

        // Check item đã có trong cart chưa (cùng product + options)
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cart_id: cart.id,
                product_id: data.product_id,
                scent_id: data.scent_id ?? null,
                color_id: data.color_id ?? null,
                size_id: data.size_id ?? null,
                pack_id: data.pack_id ?? null,
            },
        })

        // Nếu đã có → tăng quantity
        if (existingItem) {
            return prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + data.quantity },
            })
        }
        // Chưa có → tạo mới
        return prisma.cartItem.create({
            data: {
                cart_id: cart.id,
                product_id: data.product_id,
                quantity: data.quantity,
                scent_id: data.scent_id,
                color_id: data.color_id,
                size_id: data.size_id,
                pack_id: data.pack_id,
                toppings_json: data.toppings_json ?? [],
            },
        })
    }
}
