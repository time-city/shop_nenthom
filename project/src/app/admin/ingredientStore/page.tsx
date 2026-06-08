"use client";

import {
  Flame,
  Flower2,
  Palette,
  Pencil,
  Plus,
  Ruler,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import ModalIngredient, {
  type IngredientType,
} from "../../../components/admin/modalIngredient";

type MaterialTab = {
  addLabel: string;
  icon: LucideIcon;
  id: IngredientType;
  label: string;
};

const tabs: MaterialTab[] = [
  { addLabel: "Thêm mùi hương", icon: Flower2, id: "scent", label: "Mùi hương" },
  { addLabel: "Thêm màu sáp", icon: Palette, id: "color", label: "Màu sáp" },
  { addLabel: "Thêm kích thước", icon: Ruler, id: "size", label: "Kích thước" },
  { addLabel: "Thêm topping", icon: Sparkles, id: "topping", label: "Topping" },
  { addLabel: "Thêm loại nến", icon: Flame, id: "type", label: "Loại nến" },
];

const scents = [
  { id: 1, name: "Vanilla", price: "20.000 đ" },
  { id: 2, name: "Lavender", price: "25.000 đ" },
  { id: 3, name: "Sandalwood", price: "30.000 đ" },
  { id: 4, name: "Oud & Amber", price: "45.000 đ" },
];

const colors = [
  { hex: "#F5F0E8", id: 1, name: "Cream", price: "0 đ" },
  { hex: "#D9B8C4", id: 2, name: "Rose Dust", price: "12.000 đ" },
  { hex: "#BFD8C2", id: 3, name: "Sage", price: "12.000 đ" },
  { hex: "#C99765", id: 4, name: "Cedar", price: "15.000 đ" },
];

const sizes = [
  { id: 1, name: "100g", price: "0 đ" },
  { id: 2, name: "180g", price: "45.000 đ" },
  { id: 3, name: "250g", price: "85.000 đ" },
];

const toppings = [
  { id: 1, name: "Hoa khô", price: "15.000 đ", stock: 120 },
  { id: 2, name: "Vỏ cam", price: "12.000 đ", stock: 86 },
  { id: 3, name: "Tinh thể đá", price: "20.000 đ", stock: 45 },
];

const candleTypes = [
  { id: 1, name: "Nến hũ", price: "0 đ" },
  { id: 2, name: "Nến cốc", price: "10.000 đ" },
  { id: 3, name: "Nến trụ", price: "20.000 đ" },
  { id: 4, name: "Nến tealight", price: "-15.000 đ" },
];

const counts: Record<IngredientType, number> = {
  color: colors.length,
  scent: scents.length,
  size: sizes.length,
  topping: toppings.length,
  type: candleTypes.length,
};

export default function IngredientStorePage() {
  const [activeTab, setActiveTab] = useState<IngredientType>("scent");
  const [modalType, setModalType] = useState<IngredientType | null>(null);

  const activeConfig = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) ?? tabs[0],
    [activeTab],
  );

  return (
    <>
      <header className="dashboard-top-header">
        <div className="dashboard-top-header-left">
          <button className="dashboard-mobile-toggle" type="button" aria-label="Menu">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <h1 className="dashboard-page-title">Kho Nguyên liệu</h1>
            <p className="dashboard-page-subtitle">
              Quản lý mùi hương, màu sáp, kích thước, topping và loại nến
            </p>
          </div>
        </div>
      </header>

      <div className="dashboard-page-content">
        <section className="rounded-2xl border border-[#6B4E35]/15 bg-[#F8F0E4] p-5 shadow-[0_6px_18px_rgba(44,24,16,0.08)]">
          <div
            className="mb-6 flex gap-0 overflow-x-auto border-b-2 border-[#6B4E35]/15"
            role="tablist"
            aria-label="Kho nguyên liệu"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-[#6B1218] after:transition-transform ${
                    active
                      ? "text-[#6B1218] after:scale-x-100"
                      : "text-[#6B4C35] hover:text-[#2C1810]"
                  }`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-[#6B4C35]">
              {counts[activeTab]} mục trong {activeConfig.label.toLowerCase()}
            </span>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#6B1218] px-4 py-2 text-sm font-semibold text-[#F5F0E8] shadow-[0_8px_18px_rgba(107,18,24,0.18)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] hover:shadow-[0_12px_24px_rgba(107,18,24,0.25)]"
              type="button"
              onClick={() => setModalType(activeTab)}
            >
              <Plus className="size-4" aria-hidden="true" />
              {activeConfig.addLabel}
            </button>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "scent" ? <ScentTable /> : null}
            {activeTab === "color" ? <ColorTable /> : null}
            {activeTab === "size" ? <SizeTable /> : null}
            {activeTab === "topping" ? <ToppingTable /> : null}
            {activeTab === "type" ? <TypeTable /> : null}
          </div>
        </section>
      </div>

      <ModalIngredient
        open={Boolean(modalType)}
        ingredientType={modalType ?? "scent"}
        onClose={() => setModalType(null)}
      />
    </>
  );
}

function ActionButtons() {
  return (
    <div className="flex gap-2">
      <button
        className="inline-flex size-9 items-center justify-center rounded-lg border border-[#6B4E35]/20 text-[#6B4C35] transition hover:border-[#6B1218] hover:bg-[#6B1218]/10 hover:text-[#6B1218]"
        type="button"
        aria-label="Sửa"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        className="inline-flex size-9 items-center justify-center rounded-lg border border-[#6B4E35]/20 text-[#6B4C35] transition hover:border-[#B91C1C] hover:bg-[#B91C1C]/10 hover:text-[#B91C1C]"
        type="button"
        aria-label="Xóa"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function TableShell({
  children,
  headers,
}: {
  children: React.ReactNode;
  headers: React.ReactNode[];
}) {
  return (
    <table className="w-full min-w-[680px] border-collapse text-left">
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="bg-[#F2E8D9]/70 px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#6B4C35]"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-t border-[#6B4E35]/10 px-5 py-4 text-sm text-[#2C1810]">
      {children}
    </td>
  );
}

function ScentTable() {
  return (
    <TableShell headers={["#", "Tên mùi hương", "Giá cộng thêm", ""]}>
      {scents.map((item) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{item.id}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218]">{item.price}</span>
          </TableCell>
          <TableCell>
            <ActionButtons />
          </TableCell>
        </tr>
      ))}
    </TableShell>
  );
}

function ColorTable() {
  return (
    <TableShell headers={["#", "Màu sắc", "Tên màu", "Mã hex", "Giá cộng thêm", ""]}>
      {colors.map((item) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{item.id}</TableCell>
          <TableCell>
            <span
              className="inline-block size-7 rounded-md border-2 border-[#6B4E35]/20 shadow-inner"
              style={{ backgroundColor: item.hex }}
            />
          </TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>{item.hex}</TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218]">{item.price}</span>
          </TableCell>
          <TableCell>
            <ActionButtons />
          </TableCell>
        </tr>
      ))}
    </TableShell>
  );
}

function SizeTable() {
  return (
    <TableShell headers={["#", "Kích thước", "Giá cộng thêm", ""]}>
      {sizes.map((item) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{item.id}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218]">{item.price}</span>
          </TableCell>
          <TableCell>
            <ActionButtons />
          </TableCell>
        </tr>
      ))}
    </TableShell>
  );
}

function ToppingTable() {
  return (
    <TableShell headers={["#", "Tên topping", "Giá cộng thêm", "Tồn kho", ""]}>
      {toppings.map((item) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{item.id}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218]">{item.price}</span>
          </TableCell>
          <TableCell>{item.stock}</TableCell>
          <TableCell>
            <ActionButtons />
          </TableCell>
        </tr>
      ))}
    </TableShell>
  );
}

function TypeTable() {
  return (
    <TableShell headers={["#", "Loại nến", "Giá cộng thêm", ""]}>
      {candleTypes.map((item) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{item.id}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218]">{item.price}</span>
          </TableCell>
          <TableCell>
            <ActionButtons />
          </TableCell>
        </tr>
      ))}
    </TableShell>
  );
}
