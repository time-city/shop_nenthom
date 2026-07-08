"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useToast } from "@/src/components/ui/toastProvider";
import { saveSubscriptionAction } from "@/src/lib/action/push.action";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export function PushNotificationPrompt() {
  const { toast } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
    
    // Only show if notifications are supported and not already granted/denied
    if ("Notification" in window && "serviceWorker" in navigator) {
      if (Notification.permission === "default") {
        // Delay prompt to not be too aggressive
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const subscribeUser = async () => {
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string),
        });

        const result = await saveSubscriptionAction(subscription.toJSON());
        if ("error" in result && result.error) {
          toast.error(result.error);
        } else {
          toast.success("Đã bật thông báo trên trình duyệt thành công!");
          setShowPrompt(false);
        }
      } else {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error("Error subscribing to push notifications", error);
      toast.error("Không thể bật thông báo. Vui lòng thử lại sau.");
      setShowPrompt(false);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white p-4 rounded-xl shadow-lg border border-gray-100 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="bg-[#E5C07B]/20 p-2 rounded-full text-[#6B4C35]">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Bật thông báo?</h4>
          <p className="text-sm text-gray-600 mb-3">
            Nhận thông báo khi đơn hàng của bạn được cập nhật hoặc khi shop trả lời đánh giá.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={subscribeUser}
              disabled={isSubscribing}
              className="bg-[#6B4C35] text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-[#8B5E3C] transition-colors disabled:opacity-50"
            >
              {isSubscribing ? "Đang xử lý..." : "Cho phép"}
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              disabled={isSubscribing}
              className="bg-gray-100 text-gray-700 text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
