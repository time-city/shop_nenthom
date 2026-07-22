"use client";

import { useState } from "react";
import { useToast } from "@/src/components/ui/toastProvider";
import { updateOrderTrackingAction } from "@/src/lib/action/order.action";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  initialCarrier?: string | null;
  initialCode?: string | null;
}

const CARRIERS = [
  { value: "SPX", label: "SPX Express" },
];

export default function UpdateTrackingForm({ orderId, initialCarrier, initialCode }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carrier, setCarrier] = useState(initialCarrier || "SPX");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const carrier = "SPX";
    const code = formData.get("tracking_code") as string;

    if (!carrier || !code) {
      toast.error("Vui lòng nhập đầy đủ hãng vận chuyển và mã vận đơn");
      return;
    }

    setIsSubmitting(true);
    const res = await updateOrderTrackingAction({
      order_id: orderId,
      shipping_carrier: carrier,
      tracking_code: code,
    });
    setIsSubmitting(false);

    if (res && "error" in res && res.error) {
      toast.error(res.error as string);
    } else {
      toast.success("Cập nhật mã vận đơn thành công");
      router.refresh(); 
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-5 overflow-hidden">
      <div className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide px-5 py-4 border-b border-gray-100 bg-gray-50">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mr-2 text-gray-400"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1.5 5h3m-3 3h3m-5 4h7m-7 3h7" />
        </svg>
        Vận đơn & Theo dõi (Tracking)
      </div>
      
      <div className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <label htmlFor="shipping_carrier" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Đơn vị vận chuyển
            </label>
            <input
              type="text"
              name="shipping_carrier"
              id="shipping_carrier"
              value="SPX Express"
              disabled
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
            />
          </div>

          <div className="w-full md:w-1/2">
            <label htmlFor="tracking_code" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Mã vận đơn
            </label>
            <input
              type="text"
              name="tracking_code"
              id="tracking_code"
              defaultValue={initialCode || ""}
              placeholder="VD: SPXVN062550364907"
              className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
            />
          </div>

          <div className="w-full md:w-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto h-10 px-6 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu mã vận đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
