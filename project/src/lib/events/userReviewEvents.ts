import "server-only";

import { pusherServer } from "../pusher-server";

export type ReviewRepliedPayload = {
  reviewId: string;
  productName: string;
  productId: string;
  reply: string;
  repliedAt: string;
  userId: string;
};

export type ReviewRepliedEvent = {
  data: ReviewRepliedPayload;
  event: "REVIEW_REPLIED";
};

export async function emitReviewRepliedToUser(input: ReviewRepliedPayload) {
  const event: ReviewRepliedEvent = {
    data: input,
    event: "REVIEW_REPLIED",
  };

  // Channel user_{userId} để bắn thông báo riêng cho từng user
  console.log(`[Pusher Server] Triggering REVIEW_REPLIED on channel user_${input.userId}`, event);
  await pusherServer.trigger(`user_${input.userId}`, "REVIEW_REPLIED", event);

  // Gửi Web Push Notification
  try {
    const { sendPushNotificationToUser } = await import("../action/push.action");
    await sendPushNotificationToUser(input.userId, {
      title: "Phản hồi đánh giá",
      body: `Shop đã phản hồi đánh giá của bạn cho sản phẩm "${input.productName}": ${input.reply}`,
      url: `/products/${input.productId}`
    });
  } catch (err) {
    console.error("Lỗi gửi push phản hồi đánh giá:", err);
  }

  return event;
}
