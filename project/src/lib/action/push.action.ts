"use server";

import webpush from "web-push";
import prisma from "../prisma";
import { getSession } from "../session";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:test@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function saveSubscriptionAction(subscription: any) {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return { error: "Bạn chưa đăng nhập" };
    }

    const { endpoint, keys } = subscription;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return { error: "Dữ liệu subscription không hợp lệ" };
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        user_id: session.sub,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        user_id: session.sub,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Lỗi khi lưu push subscription:", error);
    return { error: "Không thể lưu thông tin nhận thông báo." };
  }
}

export async function sendPushNotificationToUser(userId: string, payload: { title: string; body: string; icon?: string; url?: string }) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { user_id: userId },
    });

    const notifications = subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      return webpush.sendNotification(pushSubscription, JSON.stringify(payload)).catch((error) => {
        if (error.statusCode === 404 || error.statusCode === 410) {
          // Subscription has expired or is no longer valid
          console.log("Subscription expired, deleting from database.");
          return prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error("Lỗi khi gửi push notification:", error);
        }
      });
    });

    await Promise.all(notifications);
  } catch (error) {
    console.error("Lỗi gửi thông báo (sendPushNotificationToUser):", error);
  }
}
