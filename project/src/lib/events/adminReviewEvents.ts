import "server-only";

import { pusherServer } from "../pusher-server";

export type NewReviewAdminPayload = {
  reviewId: string;
  productName: string;
  rating: number;
  content: string;
  customerName: string;
  createdAt: string;
};

export type NewReviewAdminEvent = {
  data: NewReviewAdminPayload;
  event: "NEW_REVIEW";
};

export async function emitNewReviewToAdmin(input: NewReviewAdminPayload) {
  const event: NewReviewAdminEvent = {
    data: input,
    event: "NEW_REVIEW",
  };

  console.log(`[Pusher Server] Triggering NEW_REVIEW on channel admin_orders`, event);
  await pusherServer.trigger("admin_orders", "NEW_REVIEW", event);

  return event;
}

export async function emitReviewChangedToAdmin(message: string) {
  console.log(`[Pusher Server] Triggering REVIEW_CHANGED on channel admin_orders`);
  await pusherServer.trigger("admin_orders", "REVIEW_CHANGED", { message });
}
