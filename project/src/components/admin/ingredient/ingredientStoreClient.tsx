"use client";

import {
  Flame,
  Flower2,
  Palette,
  Plus,
  Ruler,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import dynamic from "next/dynamic";
import ModalDeleteConfirm from "@/src/components/admin/common/modalDeleteConfirm";
const ModalIngredient = dynamic(() => import("@/src/components/admin/ingredient/modalIngredient"), { ssr: false });
const ModalEditIngre = dynamic(() => import("@/src/components/admin/ingredient/modalEditIngre"), { ssr: false });
import LoadingState from "@/src/components/ui/loadingState";
import TableResponsiveWrapper from "@/src/components/admin/common/TableResponsiveWrapper";
import AdminHeader from "@/src/components/admin/layout/AdminHeader";
import {
  AdminDeleteButton,
  AdminEditButton,
} from "@/src/components/ui/actionButtons";
import type {
  AdminCustomizationOptionsSuccessResponseInterface,
  AdminOptionItemInterface,
  AdminPackagingActionSuccessResponseInterface,
  AdminScentActionSuccessResponseInterface,
  AdminSizeActionSuccessResponseInterface,
  AdminToppingActionSuccessResponseInterface,
  AdminWaxColorActionSuccessResponseInterface,
} from "@/src/interface/adminInterface";
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
} from "@/src/lib/action/option.action";
import { getCustomizationOptionsAction } from "@/src/lib/action/product.action";
import {
  getFriendlyResponseError,
  isUserInputError,
} from "@/src/lib/utils/errorMessage";
import type {
  AdminDeleteOptionType,
  AdminIngredientActionButtonsProps,
  AdminIngredientEditTarget,
  AdminIngredientFormValues,
  AdminIngredientItem,
  AdminIngredientTableProps,
  AdminIngredientType,
  AdminMaterialTab,
  AdminTableCellProps,
  AdminTableShellProps,
} from "@/src/lib/types/admin";
import ingredientStyles from "@/src/styles/adminIngredientStore.module.css";
import { callAction } from "@/src/lib/utils/callAction";

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

export default function IngredientStoreClient() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminIngredientType>("scent");
  const [modalType, setModalType] = useState<AdminIngredientType | null>(null);
  const [editTarget, setEditTarget] = useState<AdminIngredientEditTarget | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<AdminIngredientEditTarget | null>(null);
  const [isDeletingIngredient, setIsDeletingIngredient] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scents, setScents] = useState<AdminIngredientItem[]>([]);
  const [colors, setColors] = useState<AdminIngredientItem[]>([]);
  const [sizes, setSizes] = useState<AdminIngredientItem[]>([]);
  const [toppings, setToppings] = useState<AdminIngredientItem[]>([]);
  const [packagings, setPackagings] = useState<AdminIngredientItem[]>([]);

  const handleIngredientFormError = (error: string) => {
    const message = getFriendlyResponseError(error);
    if (isUserInputError(message)) return message;

    toast.error(message);
    return false;
  };

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
    let cancelled = false;
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      setError(null);

      // action-(lấy danh sách nguyên liệu)
      const result = await callAction(() => getCustomizationOptionsAction(), "Không thể tải tùy chọn tùy chỉnh. Vui lòng thử lại sau.");
      if (cancelled) return;

      if ("error" in result && result.error) {
        const friendlyErr = getFriendlyResponseError(result.error);
        setError(friendlyErr);
        toast.error(friendlyErr);
        setIsLoadingOptions(false);
        return;
      }

      if ("success" in result && result.success) {
        const optionsResult = result as AdminCustomizationOptionsSuccessResponseInterface;
        setError(null);
        setScents(optionsResult.data.scents.map(mapOptionToIngredientItem));
        setColors(optionsResult.data.colors.map(mapOptionToIngredientItem));
        setSizes(optionsResult.data.sizes.map(mapOptionToIngredientItem));
        setToppings(optionsResult.data.toppings.map(mapOptionToIngredientItem));
        setPackagings(optionsResult.data.packagings.map(mapOptionToIngredientItem));
      }

      setIsLoadingOptions(false);
    };

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [toast]);

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

  const deleteIngredient = async () => {
    if (!deleteTarget) return;

    setIsDeletingIngredient(true);

    // action-(xóa option nguyên liệu)
    const result = await callAction(() => deleteOptionAction({
      id: deleteTarget.item.id,
      type: deleteOptionTypeMap[deleteTarget.type],
    }), "Không thể xóa tùy chọn. Vui lòng thử lại sau.");

    if ("error" in result && result.error) {
      toast.error(getFriendlyResponseError(result.error));
      setIsDeletingIngredient(false);
      return;
    }

    if ("success" in result && result.success) {
      removeDeletedItem(deleteTarget.type, deleteTarget.item.id);
      setDeleteTarget(null);
      toast.success("Đã xóa nguyên liệu");
    }

    setIsDeletingIngredient(false);
  };

  const saveNewIngredient = async (values: AdminIngredientFormValues) => {
    if (modalType === "scent") {
      // action-(tạo mùi hương)
      const result = await callAction(() => createScentAction({
        is_active: true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      }), "Không thể thêm hương. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        return handleIngredientFormError(result.error);
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
      const result = await callAction(() => createWaxColorAction({
        hex_code: values.hex ?? "#F5E6D3",
        is_active: true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      }), "Không thể thêm màu sáp. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        return handleIngredientFormError(result.error);
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
      const result = await callAction(() => createSizeAction({
        is_active: true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
        weight_gram: values.weight_gram,
      }), "Không thể thêm kích thước. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        return handleIngredientFormError(result.error);
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
      const result = await callAction(() => createToppingAction({
        in_stock: values.in_stock ?? true,
        is_active: true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      }), "Không thể thêm topping. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        return handleIngredientFormError(result.error);
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
      const result = await callAction(() => createPackagingAction({
        is_active: true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      }), "Không thể thêm kiểu đóng gói. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        return handleIngredientFormError(result.error);
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
      const result = await callAction(() => updateScentAction(item.id, {
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      }), "Không thể cập nhật hương. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        return handleIngredientFormError(result.error);
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
      const result = await callAction(() => updateWaxColorAction(item.id, {
        hex_code: values.hex ?? item.hex ?? "#F5E6D3",
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      }), "Không thể cập nhật màu sáp. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        return handleIngredientFormError(result.error);
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
      const result = await callAction(() => updateSizeAction(item.id, {
        name: values.name,
        price_extra_cents: values.price_extra_cents,
        weight_gram: values.weight_gram,
      }), "Không thể cập nhật kích thước. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        return handleIngredientFormError(result.error);
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
      const result = await callAction(() => updateToppingAction(item.id, {
        in_stock: values.in_stock ?? item.in_stock ?? true,
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      }), "Không thể cập nhật topping. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        return handleIngredientFormError(result.error);
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
      const result = await callAction(() => updatePackagingAction(item.id, {
        name: values.name,
        price_extra_cents: values.price_extra_cents,
      }), "Không thể cập nhật kiểu đóng gói. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        return handleIngredientFormError(result.error);
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
      <AdminHeader
        title="Kho Nguyên liệu"
        subtitle="Quản lý mùi hương, màu sáp, kích thước, topping và bao bì"
      />

      <div className="dashboard-page-content">
        <section className="rounded-2xl border border-[#6B4E35]/15 bg-[#F8F0E4] p-5 shadow-[0_6px_18px_rgba(44,24,16,0.08)]">
          <div
            className="mb-6 flex gap-0 overflow-x-auto overflow-y-hidden border-b-2 border-[#6B4E35]/15"
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

          <div className="overflow-visible">
            {isLoadingOptions ? (
              <LoadingState label="Đang tải dữ liệu nguyên liệu..." />
            ) : null}
            {!isLoadingOptions && error ? (
              <div className="px-5 py-8 text-center text-sm text-[#8A1119]">
                {error}
              </div>
            ) : null}
            {!isLoadingOptions && !error && activeTab === "scent" ? (
              <ScentTable
                items={scents}
                onDelete={(item) => setDeleteTarget({ item, type: "scent" })}
                onEdit={(item) => openEditModal("scent", item)}
              />
            ) : null}
            {!isLoadingOptions && !error && activeTab === "color" ? (
              <ColorTable
                items={colors}
                onDelete={(item) => setDeleteTarget({ item, type: "color" })}
                onEdit={(item) => openEditModal("color", item)}
              />
            ) : null}
            {!isLoadingOptions && !error && activeTab === "size" ? (
              <SizeTable
                items={sizes}
                onDelete={(item) => setDeleteTarget({ item, type: "size" })}
                onEdit={(item) => openEditModal("size", item)}
              />
            ) : null}
            {!isLoadingOptions && !error && activeTab === "topping" ? (
              <ToppingTable
                items={toppings}
                onDelete={(item) => setDeleteTarget({ item, type: "topping" })}
                onEdit={(item) => openEditModal("topping", item)}
              />
            ) : null}
            {!isLoadingOptions && !error && activeTab === "type" ? (
              <TypeTable
                items={packagings}
                onDelete={(item) => setDeleteTarget({ item, type: "type" })}
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
      <ModalDeleteConfirm
        open={Boolean(deleteTarget)}
        title="Xóa nguyên liệu?"
        itemName={deleteTarget?.item.name}
        confirmLabel="Xóa nguyên liệu"
        loadingLabel="Đang xóa..."
        isDeleting={isDeletingIngredient}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteIngredient}
      />
    </>
  );
}

function ActionButtons({ onDelete, onEdit }: AdminIngredientActionButtonsProps) {
  return (
    <div className="product-row-actions">
      <AdminEditButton onClick={onEdit} ariaLabel="Sửa" />
      <AdminDeleteButton onClick={onDelete} ariaLabel="Xóa" />
    </div>
  );
}

function TableShell({
  children,
  headers,
}: AdminTableShellProps) {
  return (
    <TableResponsiveWrapper minWidth={680}>
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
    </TableResponsiveWrapper>
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
      {items.map((item, index) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{index + 1}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218] text-xl">{item.price}</span>
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
      {items.map((item, index) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{index + 1}</TableCell>
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
            <span className="font-serif font-bold text-[#6B1218] text-xl">{item.price}</span>
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
      {items.map((item, index) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{index + 1}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218] text-xl">{item.price}</span>
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
      {items.map((item, index) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{index + 1}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218] text-xl">{item.price}</span>
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
      {items.map((item, index) => (
        <tr key={item.id} className="transition hover:bg-[#6B1218]/[0.025]">
          <TableCell>{index + 1}</TableCell>
          <TableCell>
            <span className="font-bold">{item.name}</span>
          </TableCell>
          <TableCell>
            <span className="font-serif font-bold text-[#6B1218] text-xl">{item.price}</span>
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
