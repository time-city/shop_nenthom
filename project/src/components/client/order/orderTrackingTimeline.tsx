"use client";

import { Check, Clock, Package, Truck, XCircle } from "lucide-react";
import { useOrderTrackingSocket } from "@/src/hooks/useOrderTrackingSocket";
import { useEffect, useState } from "react";
import type { ClientOrderStatus } from "@/src/lib/types/client";

export type OrderTrackingTimelineProps = {
  orderId: string;
  initialStatus: ClientOrderStatus;
};

type Step = {
  id: string;
  label: string;
  icon: any;
  statusMatch: ClientOrderStatus[];
};

const trackingSteps: Step[] = [
  {
    id: "step1",
    label: "Chờ xác nhận",
    icon: Clock,
    statusMatch: ["pending"],
  },
  {
    id: "step2",
    label: "Đang xử lý",
    icon: Check,
    statusMatch: ["processing"],
  },
  {
    id: "step3",
    label: "Đang giao hàng",
    icon: Truck,
    statusMatch: ["shipped"],
  },
  {
    id: "step4",
    label: "Đã giao thành công",
    icon: Package,
    statusMatch: ["delivered"],
  },
];

export function OrderTrackingTimeline({ orderId, initialStatus }: OrderTrackingTimelineProps) {
  const [currentStatus, setCurrentStatus] = useState<ClientOrderStatus>(initialStatus);

  useOrderTrackingSocket({
    orderId,
    onOrderStatusUpdated: (data) => {
      setCurrentStatus(data.status as ClientOrderStatus);
    },
  });

  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    if (currentStatus === "canceled" || currentStatus === "cancel_requested") return "disabled";
    
    const currentIndex = trackingSteps.findIndex((s) => s.statusMatch.includes(currentStatus as any));
    if (currentIndex === -1) return "disabled";
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  if (currentStatus === "canceled") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-red-500">
        <XCircle className="w-12 h-12 mb-4" />
        <h3 className="text-lg font-bold">Đơn hàng đã bị hủy</h3>
      </div>
    );
  }

  if (currentStatus === "cancel_requested") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-orange-500">
        <Clock className="w-12 h-12 mb-4 animate-pulse" />
        <h3 className="text-lg font-bold">Đang chờ duyệt hủy đơn</h3>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-[#4F3E34]/10" />
        <div 
          className="absolute top-6 left-6 h-0.5 bg-[#6B4C35] transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, (trackingSteps.findIndex(s => s.statusMatch.includes(currentStatus)) / (trackingSteps.length - 1)) * 100))}%`
          }}
        />

        <div className="relative flex justify-between">
          {trackingSteps.map((step, index) => {
            const status = getStepStatus(index, currentStatus);
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center relative">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors duration-300 border-2 ${
                    status === "completed" ? "bg-[#6B4C35] border-[#6B4C35] text-[#F8F0E4]" :
                    status === "current" ? "bg-[#F8F0E4] border-[#6B4C35] text-[#6B4C35] shadow-lg" :
                    "bg-[#F8F0E4] border-[#4F3E34]/20 text-[#4F3E34]/40"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-4 text-center">
                  <span className={`text-sm text-white font-medium ${
                    status === "completed" || status === "current" ? "text-[#4F3E34]" : "text-[#4F3E34]/40"
                  }`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
