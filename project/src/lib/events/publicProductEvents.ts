import "server-only";

import { pusherServer } from "../pusher-server";

export type ProductReviewUpdatedPayload = {
  productId: string;
  message?: string;
  actorId?: string;
};

export async function emitProductReviewUpdated(productId: string, message?: string, actorId?: string) {
  console.log(`[Pusher Server] Triggering REVIEW_LIST_UPDATED on channel public_product_${productId}`);
  await pusherServer.trigger(`public_product_${productId}`, "REVIEW_LIST_UPDATED", { 
    productId,
    message,
    actorId
  });
}
