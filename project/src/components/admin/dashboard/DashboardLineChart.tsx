"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DashboardChartDatum = {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  products: number;
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    payload?: DashboardChartDatum;
  }>;
  label?: string;
};

function formatVnCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  const point = payload?.[0]?.payload as DashboardChartDatum | undefined;
  if (!active || !point) return null;

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg min-w-[240px]"
    >
      <div className="text-gray-800 font-bold mb-3 border-b border-gray-100 pb-2">{label}</div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D6A15F]" />
          <span className="text-gray-600 font-medium text-sm">Doanh thu</span>
          <span className="ml-auto font-bold text-[#D6A15F]">
            {formatVnCurrency(point.revenue)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span className="text-gray-600 font-medium text-sm">Đơn hàng</span>
          <span className="ml-auto font-bold text-[#EF4444]">
            {formatNumber(point.orders)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
          <span className="text-gray-600 font-medium text-sm">Khách hàng</span>
          <span className="ml-auto font-bold text-[#3B82F6]">
            {formatNumber(point.customers)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span className="text-gray-600 font-medium text-sm">Sản phẩm bán được</span>
          <span className="ml-auto font-bold text-[#10B981]">
            {formatNumber(point.products)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLineChart({
  data,
}: {
  data: DashboardChartDatum[];
}) {
  const safeData = useMemo(() => data ?? [], [data]);

  const chartData = safeData;


  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-800 m-0 tracking-wide">
          Biểu đồ doanh thu & hoạt động
        </h2>
      </div>

      <div className="p-6">
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

              {/* Lưới nền xám siêu nhạt */}
              <CartesianGrid stroke="#E5E7EB" vertical={false} strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={{ stroke: "#D1D5DB" }}
                tickLine={{ stroke: "#D1D5DB" }}
                dy={10}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={{ stroke: "#D1D5DB" }}
                tickLine={{ stroke: "#D1D5DB" }}
                width={80}
                tickFormatter={(v) => {
                  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                  return String(v);
                }}
              />

              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#D1D5DB', strokeWidth: 2, strokeDasharray: '5 5' }} 
              />
              
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-gray-600 font-medium ml-1 text-sm">{value}</span>
                )}
              />

              {/* Doanh thu (Màu nâu vàng đồng bộ với web) */}
              <Line
                type="monotone"
                dataKey="revenue"
                name="Doanh thu (VNĐ)"
                stroke="#D6A15F"
                strokeWidth={3}
                dot={{ r: 4, fill: '#fff', stroke: '#D6A15F', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#D6A15F', stroke: '#fff', strokeWidth: 2 }}
              />
              {/* Đơn hàng (Đỏ) */}
              <Line
                type="monotone"
                dataKey="orders"
                name="Đơn hàng"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              {/* Khách hàng (Xanh dương) */}
              <Line
                type="monotone"
                dataKey="customers"
                name="Khách hàng"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              {/* Sản phẩm (Xanh lá) */}
              <Line
                type="monotone"
                dataKey="products"
                name="SP bán được"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}