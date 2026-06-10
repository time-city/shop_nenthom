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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ModalEditIngre from "../../../components/admin/modalEditIngre";
import ModalIngredient from "../../../components/admin/modalIngredient";
import type {
  AdminCustomizationOptionsSuccessResponseInterface,
  AdminOptionItemInterface,
  AdminPackagingActionSuccessResponseInterface,
  AdminScentActionSuccessResponseInterface,
  AdminSizeActionSuccessResponseInterface,
  AdminToppingActionSuccessResponseInterface,
  AdminWaxColorActionSuccessResponseInterface,
} from "../../../interface/adminInterface";
import {
  createPackagingAction,
  createScentAction,
  createSizeAction,
  createToppingAction,
  createWaxColorAction,
  deleteOptionAction,
  updatePackagingAction,
  updateScentAction,
  updateSizeAction,
  updateToppingAction,
  updateWaxColorAction,
} from "../../../lib/action/option.action";
import { getCustomizationOptionsAction } from "../../../lib/action/product.action";
import type {
  AdminIngredientActionButtonsProps,
  AdminIngredientEditTarget,
  AdminIngredientFormValues,
  AdminIngredientItem,
  AdminIngredientTableProps,
  AdminIngredientType,
  AdminMaterialTab,
  AdminTableCellProps,
  AdminTableShellProps,
} from "../../../lib/types/admin";
import ingredientStyles from "../../../styles/adminIngredientStore.module.css";

type AdminDeleteOptionType = "scent" | "waxColor" | "size" | "packaging" | "topping";

const tabs: AdminMaterialTab[] = [
  { addLabel: "Thêm mùi hương", icon: Flower2, id: "scent", label: "Mùi hương" },
  { addLabel: "Thêm màu sáp", icon: Palette, id: "color", label: "Màu sáp" },
  { addLabel: "Thêm kích thước", icon: Ruler, id: "size", label: "Kích thước" },
  { addLabel: "Thêm topping", icon: Sparkles, id: "topping", label: "Topping" },
  { addLabel: "Thêm bao bì", icon: Flame, id: "type", label: "Bao bì" },
];

const formatIngredientPrice = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(value)} đ`;

const mapScentToIngredientItem = (
  scent: AdminScentActionSuccessResponseInterface["data"],
): AdminIngredientItem => ({
  id: scent.id,
  name: scent.name,
  price: formatIngredientPrice(scent.price_extra_cents),
});

const mapWaxColorToIngredientItem = (
  color: AdminWaxColorActionSuccessResponseInterface["data"],
): AdminIngredientItem => ({
  hex: color.hex_code,
  id: color.id,
  name: color.name,
  price: formatIngredientPrice(color.price_extra_cents),
});

const mapSizeToIngredientItem = (
  size: AdminSizeActionSuccessResponseInterface["data"],
): AdminIngredientItem => ({
  id: size.id,
  name: size.name,
  price: formatIngredientPrice(size.price_extra_cents),
  weight_gram: size.weight_gram,
});

const mapToppingToIngredientItem = (
  topping: AdminToppingActionSuccessResponseInterface["data"],
): AdminIngredientItem => ({
  id: topping.id,
  in_stock: topping.in_stock,
  name: topping.name,
  price: formatIngredientPrice(topping.price_extra_cents),
});

const mapPackagingToIngredientItem = (
  packaging: AdminPackagingActionSuccessResponseInterface["data"],
): AdminIngredientItem => ({
  id: packaging.id,
  name: packaging.name,
  price: formatIngredientPrice(packaging.price_extra_cents),
});

const mapOptionToIngredientItem = (
  option: AdminOptionItemInterface,
): AdminIngredientItem => ({
  hex: option.hex_code,
  id: option.id,
  in_stock: option.in_stock ?? true,
  name: option.name,
  price: formatIngredientPrice(option.price_extra_cents),
  weight_gram: option.weight_gram,
});

const deleteOptionTypeMap: Record<AdminIngredientType, AdminDeleteOptionType> = {
  color: "waxColor",
  scent: "scent",
  size: "size",
  topping: "topping",
  type: "packaging",
};

export default function IngredientStorePage() {
  const [activeTab, setActiveTab] = useState<AdminIngredientType>("scent");
  const [modalType, setModalType] = useState<AdminIngredientType | null>(null);
  const [editTarget, setEditTarget] = useState<AdminIngredientEditTarget | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [scents, setScents] = useState<AdminIngredientItem[]>([]);
  const [colors, setColors] = useState<AdminIngredientItem[]>([]);
  const [sizes, setSizes] = useState<AdminIngredientItem[]>([]);
  const [toppings, setToppings] = useState<AdminIngredientItem[]>([]);
  const [packagings, setPackagings] = useState<AdminIngredientItem[]>([]);

  const activeConfig = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) ?? tabs[0],
    [activeTab],
  );
  const counts: Record<AdminIngredientType, number> = {
    color: colors.length,
    scent: scents.length,
    size: sizes.length,
    topping: toppings.length,
    type: packagings.length,
  };

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);

      // action-(lấy danh sách nguyên liệu)
      const result = await getCustomizationOptionsAction();

      if ("error" in result && result.error) {
        toast.error(result.error);
        setIsLoadingOptions(false);
        return;
      }

      if ("success" in result && result.success) {
        const optionsResult = result as AdminCustomizationOptionsSuccessResponseInterface;
        setScents(optionsResult.data.scents.map(mapOptionToIngredientItem));
        setColors(optionsResult.data.colors.map(mapOptionToIngredientItem));
        setSizes(optionsResult.data.sizes.map(mapOptionToIngredientItem));
        setToppings(optionsResult.data.toppings.map(mapOptionToIngredientItem));
        setPackagings(optionsResult.data.packagings.map(mapOptionToIngredientItem));
      }

      setIsLoadingOptions(false);
    };

    void loadOptions();
  }, []);

  const openEditModal = (type: AdminIngredientType, item: AdminIngredientItem) => {
    setEditTarget({ item, type });
  };

  const removeDeletedItem = (
    type: AdminIngredientType,
    itemId: number,
  ) => {
    const filterDeletedItem = (items: AdminIngredientItem[]) =>
      items.filter((item) => item.id !== itemId);

    if (type === "scent") setScents(filterDeletedItem);
    if (type === "color") setColors(filterDeletedItem);
    if (type === "size") setSizes(filterDeletedItem);
    if (type === "topping") setToppings(filterDeletedItem);
    if (type === "type") setPackagings(filterDeletedItem);
  };

  const deleteIngredient = async (
    type: AdminIngredientType,
    item: AdminIngredientItem,
  ) => {
    const shouldDelete = window.confirm(`Bạn có chắc muốn xóa "${item.name}"?`);

    if (!shouldDelete) return;

    // action-(xóa option nguyên liệu)
    const result = await deleteOptionAction({
      id: item.id,
      type: deleteOptionTypeMap[type],
    });

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    if ("success" in result && result.success) {
      removeDeletedItem(type, item.id);
      toast.success("Đã xóa nguyên liệu");
    }
  };

  const saveNewIngredient = async (values: AdminIngredientFormValues) => {
    if (modalType === "scent") {
      // action-(tạo mùi hương)
      const result = await createScentAction({
        is_active: true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return false;
      }

      if ("success" in result && result.success) {
        const scentResult = result as AdminScentActionSuccessResponseInterface;
        setScents((currentItems) => [
          ...currentItems,
          mapScentToIngredientItem(scentResult.data),
        ]);
        toast.success("Đã thêm mùi hương");
      }

      return true;
    }

    if (modalType === "color") {
      // action-(tạo màu sáp)
      const result = await createWaxColorAction({
        hex_code: values.hex ?? "#F5E6D3",
        is_active: true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return false;
      }

      if ("success" in result && result.success) {
        const colorResult = result as AdminWaxColorActionSuccessResponseInterface;
        setColors((currentItems) => [
          ...currentItems,
          mapWaxColorToIngredientItem(colorResult.data),
        ]);
        toast.success("Đã thêm màu sáp");
      }

      return true;
    }

    if (modalType === "size") {
      // action-(tạo kích thước)
      const result = await createSizeAction({
        is_active: true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
        weight_gram: values.weight_gram,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return false;
      }

      if ("success" in result && result.success) {
        const sizeResult = result as AdminSizeActionSuccessResponseInterface;
        setSizes((currentItems) => [
          ...currentItems,
          mapSizeToIngredientItem(sizeResult.data),
        ]);
        toast.success("Đã thêm kích thước");
      }

      return true;
    }

    if (modalType === "topping") {
      // action-(tạo topping)
      const result = await createToppingAction({
        in_stock: values.in_stock ?? true,
        is_active: true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return false;
      }

      if ("success" in result && result.success) {
        const toppingResult = result as AdminToppingActionSuccessResponseInterface;
        setToppings((currentItems) => [
          ...currentItems,
          mapToppingToIngredientItem(toppingResult.data),
        ]);
        toast.success("Đã thêm topping");
      }

      return true;
    }

    if (modalType === "type") {
      // action-(tạo bao bì)
      const result = await createPackagingAction({
        is_active: true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return false;
      }

      if ("success" in result && result.success) {
        const packagingResult = result as AdminPackagingActionSuccessResponseInterface;
        setPackagings((currentItems) => [
          ...currentItems,
          mapPackagingToIngredientItem(packagingResult.data),
        ]);
        toast.success("Đã thêm bao bì");
      }

      return true;
    }

    toast.info("Action cho mục này sẽ được nối sau");
    return false;
  };

  const saveEditedIngredient = async (
    item: AdminIngredientItem,
    values: AdminIngredientFormValues,
  ) => {
    if (editTarget?.type === "scent") {
      // action-(cập nhật mùi hương)
      const result = await updateScentAction(item.id, {
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return false;
      }

      if ("success" in result && result.success) {
        const scentResult = result as AdminScentActionSuccessResponseInterface;
        setScents((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? mapScentToIngredientItem(scentResult.data)
              : currentItem,
          ),
        );
        toast.success("Đã cập nhật mùi hương");
      }

      return true;
    }

    if (editTarget?.type === "color") {
      // action-(cập nhật màu sáp)
      const result = await updateWaxColorAction(item.id, {
        hex_code: values.hex ?? item.hex ?? "#F5E6D3",
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return false;
      }

      if ("success" in result && result.success) {
        const colorResult = result as AdminWaxColorActionSuccessResponseInterface;
        setColors((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? mapWaxColorToIngredientItem(colorResult.data)
              : currentItem,
          ),
        );
        toast.success("Đã cập nhật màu sáp");
      }

      return true;
    }

    if (editTarget?.type === "size") {
      // action-(cập nhật kích thước)
      const result = await updateSizeAction(item.id, {
        name: values.name,
        price_extra_cents: values.price_extra_cents,
        weight_gram: values.weight_gram,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return false;
      }

      if ("success" in result && result.success) {
        const sizeResult = result as AdminSizeActionSuccessResponseInterface;
        setSizes((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? mapSizeToIngredientItem(sizeResult.data)
              : currentItem,
          ),
        );
        toast.success("Đã cập nhật kích thước");
      }

      return true;
    }

    if (editTarget?.type === "topping") {
      // action-(cập nhật topping)
      const result = await updateToppingAction(item.id, {
        in_stock: values.in_stock ?? item.in_stock ?? true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return false;
      }

      if ("success" in result && result.success) {
        const toppingResult = result as AdminToppingActionSuccessResponseInterface;
        setToppings((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? mapToppingToIngredientItem(toppingResult.data)
              : currentItem,
          ),
        );
        toast.success("Đã cập nhật topping");
      }

      return true;
    }

    if (editTarget?.type === "type") {
      // action-(cập nhật bao bì)
      const result = await updatePackagingAction(item.id, {
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return false;
      }

      if ("success" in result && result.success) {
        const packagingResult = result as AdminPackagingActionSuccessResponseInterface;
        setPackagings((currentItems) =>
          currentItems.map((currentItem) =>
            currentItem.id === item.id
              ? mapPackagingToIngredientItem(packagingResult.data)
              : currentItem,
          ),
        );
        toast.success("Đã cập nhật bao bì");
      }

      return true;
    }

    toast.info("Action cho mục này sẽ được nối sau");
    return false;
  };

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
              Quản lý mùi hương, màu sáp, kích thước, topping và bao bì
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
            {isLoadingOptions ? (
              <div className="rounded-xl border border-[#6B4E35]/10 bg-[#F5F0E8]/70 px-5 py-8 text-center text-sm text-[#6B4C35]">
                Đang tải dữ liệu nguyên liệu...
              </div>
            ) : null}
            {!isLoadingOptions && activeTab === "scent" ? (
              <ScentTable
                items={scents}
                onDelete={(item) => void deleteIngredient("scent", item)}
                onEdit={(item) => openEditModal("scent", item)}
              />
            ) : null}
            {!isLoadingOptions && activeTab === "color" ? (
              <ColorTable
                items={colors}
                onDelete={(item) => void deleteIngredient("color", item)}
                onEdit={(item) => openEditModal("color", item)}
              />
            ) : null}
            {!isLoadingOptions && activeTab === "size" ? (
              <SizeTable
                items={sizes}
                onDelete={(item) => void deleteIngredient("size", item)}
                onEdit={(item) => openEditModal("size", item)}
              />
            ) : null}
            {!isLoadingOptions && activeTab === "topping" ? (
              <ToppingTable
                items={toppings}
                onDelete={(item) => void deleteIngredient("topping", item)}
                onEdit={(item) => openEditModal("topping", item)}
              />
            ) : null}
            {!isLoadingOptions && activeTab === "type" ? (
              <TypeTable
                items={packagings}
                onDelete={(item) => void deleteIngredient("type", item)}
                onEdit={(item) => openEditModal("type", item)}
              />
            ) : null}
          </div>
        </section>
      </div>

      <ModalIngredient
        open={Boolean(modalType)}
        ingredientType={modalType ?? "scent"}
        onClose={() => setModalType(null)}
        onSave={saveNewIngredient}
      />
      <ModalEditIngre
        open={Boolean(editTarget)}
        ingredientType={editTarget?.type ?? "scent"}
        item={editTarget?.item ?? null}
        onClose={() => setEditTarget(null)}
        onSave={saveEditedIngredient}
      />
    </>
  );
}

function ActionButtons({ onDelete, onEdit }: AdminIngredientActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        className="inline-flex size-9 items-center justify-center rounded-lg border border-[#6B4E35]/20 text-[#6B4C35] transition hover:border-[#6B1218] hover:bg-[#6B1218]/10 hover:text-[#6B1218]"
        type="button"
        aria-label="Sửa"
        onClick={onEdit}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        className="inline-flex size-9 items-center justify-center rounded-lg border border-[#6B4E35]/20 text-[#6B4C35] transition hover:border-[#B91C1C] hover:bg-[#B91C1C]/10 hover:text-[#B91C1C]"
        type="button"
        aria-label="Xóa"
        onClick={onDelete}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function TableShell({
  children,
  headers,
}: AdminTableShellProps) {
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

function TableCell({ children }: AdminTableCellProps) {
  return (
    <td className="border-t border-[#6B4E35]/10 px-5 py-4 text-sm text-[#2C1810]">
      {children}
    </td>
  );
}

function ScentTable({ items, onDelete, onEdit }: AdminIngredientTableProps) {
  return (
    <TableShell headers={["#", "Tên mùi hương", "Giá cộng thêm", ""]}>
      {items.map((item) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{item.id}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218]">{item.price}</span>
          </TableCell>
          <TableCell>
            <ActionButtons
              onDelete={() => onDelete(item)}
              onEdit={() => onEdit(item)}
            />
          </TableCell>
        </tr>
      ))}
    </TableShell>
  );
}

function ColorTable({ items, onDelete, onEdit }: AdminIngredientTableProps) {
  return (
    <TableShell headers={["#", "Màu sắc", "Tên màu", "Mã hex", "Giá cộng thêm", ""]}>
      {items.map((item) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{item.id}</TableCell>
          <TableCell>
            <span
              className={ingredientStyles.colorSwatch}
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
            <ActionButtons
              onDelete={() => onDelete(item)}
              onEdit={() => onEdit(item)}
            />
          </TableCell>
        </tr>
      ))}
    </TableShell>
  );
}

function SizeTable({ items, onDelete, onEdit }: AdminIngredientTableProps) {
  return (
    <TableShell headers={["#", "Kích thước", "Giá cộng thêm", ""]}>
      {items.map((item) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{item.id}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218]">{item.price}</span>
          </TableCell>
          <TableCell>
            <ActionButtons
              onDelete={() => onDelete(item)}
              onEdit={() => onEdit(item)}
            />
          </TableCell>
        </tr>
      ))}
    </TableShell>
  );
}

function ToppingTable({ items, onDelete, onEdit }: AdminIngredientTableProps) {
  return (
    <TableShell headers={["#", "Tên topping", "Giá cộng thêm", "Trạng thái", ""]}>
      {items.map((item) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{item.id}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218]">{item.price}</span>
          </TableCell>
          <TableCell>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                item.in_stock === false
                  ? "bg-[#B91C1C]/10 text-[#B91C1C]"
                  : "bg-[#15803D]/10 text-[#15803D]"
              }`}
            >
              {item.in_stock === false ? "Hết hàng" : "Còn hàng"}
            </span>
          </TableCell>
          <TableCell>
            <ActionButtons
              onDelete={() => onDelete(item)}
              onEdit={() => onEdit(item)}
            />
          </TableCell>
        </tr>
      ))}
    </TableShell>
  );
}

function TypeTable({ items, onDelete, onEdit }: AdminIngredientTableProps) {
  return (
    <TableShell headers={["#", "Bao bì", "Giá cộng thêm", ""]}>
      {items.map((item) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{item.id}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218]">{item.price}</span>
          </TableCell>
          <TableCell>
            <ActionButtons
              onDelete={() => onDelete(item)}
              onEdit={() => onEdit(item)}
            />
          </TableCell>
        </tr>
      ))}
    </TableShell>
  );
}
