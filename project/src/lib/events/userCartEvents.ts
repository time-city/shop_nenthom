import "server-only";

import { pusherServer } from "../pusher-server";

export type CartProductsRemovedEvent = {
  data: {
    productNames: string[];
    userId: string;
  };
  event: "CART_PRODUCTS_REMOVED";
};

export async function emitCartProductsRemovedToUser(
  userId: string,
  productNames: string[],
) {
  if (productNames.length === 0) return;

  const event: CartProductsRemovedEvent = {
    data: {
      productNames,
      userId,
    },
    event: "CART_PRODUCTS_REMOVED",
  };

  // Migrate từ pg_notify sang Pusher — channel user_{userId}  // Tương tự pg_notify cũ nhưng đổi thành pusherServer.trigger
  console.log(`[Pusher Server] Triggering CART_PRODUCTS_REMOVED on channel user_${userId}`, event);
  await pusherServer.trigger(`user_${userId}`, "CART_PRODUCTS_REMOVED", event);
}
