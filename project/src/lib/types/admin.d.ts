import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Loại nguyên liệu có thể quản lý trong kho admin. */
export type AdminIngredientType = "scent" | "color" | "size" | "topping" | "type";

/** Loại option gửi lên action xoá option trong admin. */
export type AdminDeleteOptionType =
  | "packaging"
  | "scent"
  | "size"
  | "topping"
  | "waxColor";

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
  onSave?: () => Promise<void> | void;
  open: boolean;
};

/** Props cho modal thêm danh mục trong admin. */
export type AdminModalCategoryProps = {
  onClose: () => void;
  onSave?: () => Promise<void> | void;
  open: boolean;
};

/** Props cho modal sửa danh mục trong admin. */
export type AdminModalEditCategoryProps = {
  category: import("../../interface/adminInterface").AdminProductCategoryInterface | null;
  onClose: () => void;
  onSave?: () => Promise<void> | void;
  open: boolean;
};

/** Values form tạo/sửa danh mục trong admin. */
export type AdminCategoryFormValues = {
  description: string;
  name: string;
};

/** Props cho modal chỉnh sửa sản phẩm trong admin. */
export type AdminModalEditProductProps = {
  onClose: () => void;
  onSave?: () => Promise<void> | void;
  open: boolean;
  product: import("../../interface/adminInterface").AdminProductListItemInterface | null;
};

/** Props cho modal xem chi tiết sản phẩm trong admin. */
export type AdminModalDetailProductProps = {
  onClose: () => void;
  open: boolean;
  productId: string | null;
};

/** Values form tạo/sửa sản phẩm trong admin. */
export type AdminProductFormValues = {
  base_price_cents: string;
  category_id: string;
  description: string;
  image_data_url: string;
  image_file_name: string;
  is_active: boolean;
  name: string;
};

/** Props cho modal xác nhận xoá sản phẩm trong admin. */
export type AdminModalDeleteProductProps = {
  confirmLabel?: string;
  description?: string;
  isDeleting?: boolean;
  loadingLabel?: string;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  open: boolean;
  productName?: string;
  title?: string;
};

/** Props cho modal xác nhận xoá dùng chung trong admin. */
export type AdminDeleteConfirmModalProps = {
  confirmLabel?: string;
  description?: string;
  isDeleting?: boolean;
  itemName?: string;
  loadingLabel?: string;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
  open: boolean;
  productName?: string;
  title?: string;
};

/** Props cho modal thêm/sửa mã giảm giá trong admin. */
export type AdminModalDiscountProps = {
  onClose: () => void;
  onSave?: () => Promise<void> | void;
  open: boolean;
};

/** Values form tạo mã giảm giá trong admin. */
export type AdminDiscountFormValues = {
  code: string;
  discount_amount_cents: string;
  expires_at: string;
  max_uses: string;
  type: "FIXED" | "PERCENTAGE";
};

/** Một mã giảm giá hiển thị trong danh sách admin. */
export type AdminDiscountItem = {
  code: string;
  discount_amount_cents: number;
  expires_at: Date | null;
  id: string;
  is_active: boolean;
  max_uses: number;
  type: "FIXED" | "PERCENTAGE";
  used_count: number;
};

/** Response thành công khi lấy danh sách mã giảm giá admin. */
export type AdminDiscountsSuccessResponse = {
  data: AdminDiscountItem[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  success: true;
};

/** Props cho modal chỉnh sửa mã giảm giá trong admin. */
export type AdminModalEditDiscountProps = {
  discount: AdminDiscountItem | null;
  onClose: () => void;
  onSave?: () => Promise<void> | void;
  open: boolean;
};

/** Item điều hướng trong sidebar admin. */
export type AdminNavItem = {
  badge?: number | string;
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
  isMarkingReplied?: boolean;
  onClose: () => void;
  onMarkReplied?: (contactId: number | string) => void;
  open: boolean;
};

/** Props cho nút Edit dùng chung. */
export type AdminEditButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

/** Props cho nút Delete dùng chung. */
export type AdminDeleteButtonProps = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  ariaLabel?: string;
  disabled?: boolean;
};

/** Thông tin tài khoản người dùng hiển thị trong trang quản lý khách hàng. */
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

/** Dữ liệu thống kê tổng quan trên dashboard admin. */
export type DashboardStatsData = {
  revenue: number;
  ordersCount: number;
  customersCount: number;
  productsSoldCount: number;
};

/** Sản phẩm bán chạy trên dashboard admin. */
export type DashboardTopProduct = {
  name: string;
  productId: string;
  revenueCents: number;
  soldQuantity: number;
};

/** Đơn hàng mới nhất trên dashboard admin. */
export type DashboardLatestOrder = {
  createdAt: string;
  customer: string;
  orderNumber: string;
  status: string;
  totalCents: number;
};

/** Thời gian lọc thống kê trên dashboard admin. */
export type DashboardActiveChip = "today" | "week" | "month";
