import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Loại nguyên liệu có thể quản lý trong kho admin. */
export type AdminIngredientType = "scent" | "color" | "size" | "topping" | "type";

/** Cấu hình tab nguyên liệu trong trang kho admin. */
export type AdminMaterialTab = {
  addLabel: string;
  icon: LucideIcon;
  id: AdminIngredientType;
  label: string;
};

/** Một dòng nguyên liệu trong trang kho admin. */
export type AdminIngredientItem = {
  hex?: string;
  id: number;
  in_stock?: boolean;
  name: string;
  price: string;
  stock?: number;
  weight_gram?: number;
};

/** Values form thêm/sửa nguyên liệu admin. */
export type AdminIngredientFormValues = {
  hex?: string;
  in_stock?: boolean;
  is_active?: boolean;
  name: string;
  price_extra_cents: number;
  stock?: number;
  weight_gram?: number;
};

/** Item đang được chọn để chỉnh sửa trong kho nguyên liệu. */
export type AdminIngredientEditTarget = {
  item: AdminIngredientItem;
  type: AdminIngredientType;
};

/** Props cho modal thêm/sửa nguyên liệu trong admin. */
export type AdminModalIngredientProps = {
  ingredientType: AdminIngredientType;
  onClose: () => void;
  onSave?: (
    values: AdminIngredientFormValues,
  ) => boolean | Promise<boolean | void> | void;
  open: boolean;
};

/** Props cho modal chỉnh sửa nguyên liệu trong admin. */
export type AdminModalEditIngredientProps = {
  ingredientType: AdminIngredientType;
  item: AdminIngredientItem | null;
  onClose: () => void;
  onSave?: (
    item: AdminIngredientItem,
    values: AdminIngredientFormValues,
  ) => boolean | Promise<boolean | void> | void;
  open: boolean;
};

/** Props nút thao tác trong bảng kho nguyên liệu. */
export type AdminIngredientActionButtonsProps = {
  onDelete: () => void;
  onEdit: () => void;
};

/** Props bảng nguyên liệu trong admin. */
export type AdminIngredientTableProps = {
  items: AdminIngredientItem[];
  onDelete: (item: AdminIngredientItem) => void;
  onEdit: (item: AdminIngredientItem) => void;
};

/** Props cho modal thêm/sửa sản phẩm trong admin. */
export type AdminModalProductProps = {
  onClose: () => void;
  onSave?: () => void;
  open: boolean;
};

/** Props cho modal xác nhận xoá sản phẩm trong admin. */
export type AdminModalDeleteProductProps = {
  onClose: () => void;
  onConfirm?: () => void;
  open: boolean;
  productName?: string;
};

/** Props cho modal thêm/sửa mã giảm giá trong admin. */
export type AdminModalDiscountProps = {
  onClose: () => void;
  onSave?: () => void;
  open: boolean;
};

/** Item điều hướng trong sidebar admin. */
export type AdminNavItem = {
  badge?: number;
  href: string;
  icon: ReactNode;
  label: string;
};

/** Props cho từng nhóm menu trong sidebar admin. */
export type AdminSidebarSectionProps = {
  links: AdminNavItem[];
  pathname: string;
  title: string;
};

/** Props cho shell table dùng ở trang kho nguyên liệu. */
export type AdminTableShellProps = {
  children: ReactNode;
  headers: ReactNode[];
};

/** Props cho cell trong table kho nguyên liệu. */
export type AdminTableCellProps = {
  children: ReactNode;
};

/** Trạng thái xử lý đơn hàng trong admin. */
export type AdminOrderStatus =
  | "pending"
  | "processing"
  | "shipping"
  | "completed"
  | "cancelled";

/** Trạng thái thanh toán của đơn hàng trong admin. */
export type AdminPaymentStatus = "paid" | "unpaid" | "refunded";

/** Dữ liệu một đơn hàng hiển thị trong trang quản lý đơn. */
export type AdminOrder = {
  customer: string;
  date: string;
  id: string;
  payment: AdminPaymentStatus;
  status: AdminOrderStatus;
  total: number;
};

/** Dữ liệu một sản phẩm hiển thị trong trang quản lý sản phẩm. */
export type AdminProductRow = {
  category: string;
  id: string;
  name: string;
  price: string;
  status: string;
  statusType: string;
};

/** Trạng thái tin nhắn hỗ trợ admin. */
export type AdminSupportStatus = "replied" | "unread";

/** Bộ lọc tin nhắn hỗ trợ admin. */
export type AdminSupportFilter = AdminSupportStatus | "all";

/** Dữ liệu một tin nhắn hỗ trợ admin. */
export type AdminSupportMessage = {
  date: string;
  email: string;
  id: number | string;
  message: string;
  name: string;
  status: AdminSupportStatus;
  subject: string;
};

/** Props modal chi tiết tin nhắn hỗ trợ admin. */
export type AdminModalSupportProps = {
  contact: AdminSupportMessage | null;
  onClose: () => void;
  onMarkReplied?: (contactId: number | string) => void;
  open: boolean;
};
