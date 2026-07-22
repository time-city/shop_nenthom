"use client";

import { Check, Clock, Package, Truck, XCircle, Copy } from "lucide-react";
import { useOrderTrackingSocket } from "@/src/hooks/useOrderTrackingSocket";
import { useState } from "react";
import { useToast } from "@/src/components/ui/toastProvider";
import type { ClientOrderStatus } from "@/src/lib/types/client";

export type OrderTrackingTimelineProps = {
  orderId: string;
  initialStatus: ClientOrderStatus;
  trackingCode?: string | null;
  shippingCarrier?: string | null;
};

type Step = {
  id: string;
  label: string;
  description: string;
  icon: any;
  statusMatch: ClientOrderStatus[];
};

const trackingSteps: Step[] = [
  {
    id: "step1",
    label: "Mới đặt hàng",
    description: "Đơn hàng đang chờ xác nhận",
    icon: Clock,
    statusMatch: ["pending"],
  },
  {
    id: "step2",
    label: "Đang lấy hàng",
    description: "Người bán đang chuẩn bị hàng",
    icon: Package,
    statusMatch: ["processing"],
  },
  {
    id: "step3",
    label: "Đang giao",
    description: "Đơn hàng đã được giao cho đơn vị vận chuyển",
    icon: Truck,
    statusMatch: ["shipped"],
  },
  {
    id: "step4",
    label: "Thành công",
    description: "Giao hàng thành công",
    icon: Check,
    statusMatch: ["delivered"],
  },
];

export function OrderTrackingTimeline({ orderId, initialStatus, trackingCode, shippingCarrier }: OrderTrackingTimelineProps) {
  const { toast } = useToast();
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

  const copyToClipboard = () => {
    if (trackingCode) {
      navigator.clipboard.writeText(trackingCode);
      toast.success("Đã copy mã vận đơn");
    }
  };

  if (currentStatus === "canceled") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-zinc-500 bg-zinc-950 rounded-xl border border-zinc-800/50">
        <XCircle className="w-12 h-12 mb-4 text-zinc-600" />
        <h3 className="text-lg font-medium text-zinc-300">Đơn hàng đã bị hủy</h3>
      </div>
    );
  }

  if (currentStatus === "cancel_requested") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-zinc-500 bg-zinc-950 rounded-xl border border-zinc-800/50">
        <Clock className="w-12 h-12 mb-4 animate-pulse text-zinc-400" />
        <h3 className="text-lg font-medium text-zinc-300">Đang chờ duyệt hủy đơn</h3>
      </div>
    );
  }

  return (
    <div className="w-full bg-zinc-950 rounded-2xl border border-zinc-800/50 p-6 overflow-hidden">
      {/* Tracking Info Section */}
      {trackingCode && shippingCarrier && (
        <div className="flex items-center justify-between p-4 mb-8 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-1">
              Đơn vị vận chuyển
            </span>
            <span className="text-sm font-semibold text-zinc-200">
              {shippingCarrier === "SPX" ? "SPX Express" : shippingCarrier}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-1">
              Mã vận đơn
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-zinc-300 tracking-wide">{trackingCode}</span>
              <button 
                onClick={copyToClipboard}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                title="Copy mã vận đơn"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vertical Timeline */}
      <div className="relative pl-4 space-y-8">
        {trackingSteps.map((step, index) => {
          const status = getStepStatus(index, currentStatus);
          const Icon = step.icon;
          const isLast = index === trackingSteps.length - 1;
          
          return (
            <div key={step.id} className="relative flex items-start gap-6">
              {/* Vertical line connecting dots */}
              {!isLast && (
                <div 
                  className={`absolute left-[11px] top-8 bottom-[-24px] w-[2px] ${
                    status === "completed" || status === "current" 
                      ? "bg-zinc-600" 
                      : "bg-zinc-800"
                  }`} 
                />
              )}
              
              {/* Dot Icon */}
              <div 
                className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 transition-all duration-300 ${
                  status === "completed" 
                    ? "bg-zinc-700 text-white" 
                    : status === "current"
                    ? "bg-zinc-200 text-zinc-950 shadow-[0_0_12px_rgba(228,228,231,0.3)] ring-4 ring-zinc-800/50"
                    : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={status === "current" ? 3 : 2} />
              </div>
              
              {/* Content */}
              <div className="flex flex-col pt-1">
                <span className={`text-sm font-medium ${
                  status === "completed" 
                    ? "text-zinc-400" 
                    : status === "current"
                    ? "text-zinc-100"
                    : "text-zinc-600"
                }`}>
                  {step.label}
                </span>
                <span className={`text-xs mt-1 ${
                  status === "current" ? "text-zinc-400" : "text-zinc-600"
                }`}>
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
