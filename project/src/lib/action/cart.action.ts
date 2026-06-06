'use server'

import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { CartService } from "../services/cart.service";
import { getSession } from "../session";
import { addToCartSchema } from "../validations/cart.schema";

const CART_SESSION_COOKIE_NAME = 'guest_session_id';

async function getCartIdentity() {
    const cookieStore = await cookies();
    const session = await getSession();
    let sessionId = cookieStore.get(CART_SESSION_COOKIE_NAME)?.value;

    if (!session && !sessionId) {
        sessionId = randomUUID();
        cookieStore.set(CART_SESSION_COOKIE_NAME, sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 30 ngày
        });
    }

    return {
        userId: session?.sub,
        sessionId: session ? undefined : sessionId,
    };
}

export async function getOrCreateCartAction() {
    try {
        const { userId, sessionId } = await getCartIdentity();
        const cart = await CartService.getOrCreateCart(userId, sessionId);
        return { success: true, cart };
    } catch (err) {
        return { error: (err as Error).message };
    }
}

export async function addToCartAction(params: unknown) {
  const parsed = addToCartSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const { userId, sessionId } = await getCartIdentity()
    const item = await CartService.addToCart(parsed.data, userId, sessionId)
    return { success: true, data: item }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
