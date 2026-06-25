/** Query params dùng cho trang collection. */
export type CollectionSearchParams = {
  categoryId?: string;
  scentId?: string;
  page?: string;
  productId?: string;
  q?: string;
  priceRange?: string;
};


/** Props của trang collection trong App Router. */
export type CollectionPageProps = {
  searchParams?: Promise<CollectionSearchParams>;
};


/** Props card sản phẩm phía client. */
export type CardProductProps = {
  candleColor?: string;
  href: string;
  id: number | string;
  imageUrl?: string;
  index?: number;
  name: string;
  price: number | string;
  scentNote?: string;
};


/** Props trang chi tiết sản phẩm theo params id. */
export type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};


/** Props modal/detail card sản phẩm. */
export type DetailCardProductProps = {
  isAuthenticated?: boolean;
  product: import("../../interface/clientInterface").ClientProductDetailInterface;
  onClose?: () => void;
  isModal?: boolean;
};


/** Props wrapper modal chi tiết sản phẩm. */
export type DetailCardModalProps = {
  isAuthenticated?: boolean;
};


/** Props nhóm option trong detail card sản phẩm. */
export type DetailOptionGroupProps = {
  label: string;
  onSelect: (item: import("../../interface/clientInterface").ClientProductOptionItemInterface) => void;
  options: import("../../interface/clientInterface").ClientProductOptionItemInterface[];
  renderLabel?: (item: import("../../interface/clientInterface").ClientProductOptionItemInterface) => string;
  selectedId?: number;
  noBorder?: boolean;
};


/** Props form tùy chỉnh nến. */
export type FormCustomProps = {
  basePrice?: number;
  baseProductId?: string;
  isAuthenticated?: boolean;
  options?: import("../../interface/clientInterface").ClientCustomizationOptionsInterface;
};


/** Link điều hướng trong header client. */
export type ClientNavLink = {
  href: string;
  label: string;
};


/** Props danh sách link điều hướng client. */
export type ClientNavLinksProps = {
  className?: string;
  linkClassName?: string;
  links: ClientNavLink[];
  onLinkClick?: () => void;
};


/** Values form đăng nhập. */
export type SignInValues = {
  email: string;
  password: string;
  remember: boolean;
};


/** Values form đăng ký. */
export type SignUpValues = {
  confirmPassword: string;
  email: string;
  fullname: string;
  newsletter: boolean;
  password: string;
  phone: string;
  terms: boolean;
};


/** Values form liên hệ phía client. */
export type ClientContactFormValues = {
  email: string;
  message: string;
  name: string;
  subject: string;
};


/** Thông tin user tối thiểu cho trang orders. */
export type ClientOrderUserData = {
  email?: string;
  fullname?: string;
  phone?: string;
  role?: string;
};


/** Trạng thái đơn hàng phía client. */
export type ClientOrderStatus = "pending" | "confirmed" | "canceled";


/** Item trong một đơn hàng phía client. */
export type ClientOrderItem = {
  detail?: string;
  name: string;
  price: number;
  quantity: number;
};


/** Dữ liệu một đơn hàng phía client. */
export type ClientOrderRecord = {
  date: string;
  id: string;
  items: ClientOrderItem[];
  status: ClientOrderStatus;
  total: number;
};


/** Item giỏ hàng legacy lưu ở localStorage phía client. */
export type ClientCartItem = {
  color?: string;
  itemId?: string;
  name?: string;
  pack?: string | null;
  price: number;
  productId?: string;
  quantity: number;
  scent: string;
  size?: string;
  imageUrl?: string;
};


/** Bước đang hiển thị trong trang giỏ hàng. */
export type CartPageStep = "cart" | "checkout";


/** Props item trong trang giỏ hàng. */
export type CartItemProps = {
  disabled?: boolean;
  index: number;
  item: ClientCartItem;
  onQuantityChange: (index: number, change: number) => void;
  onSelectChange: (index: number, selected: boolean) => void;
  quantityDisabled?: boolean;
  selected?: boolean;
};


/** Props khối tổng tóm tắt đơn ở trang giỏ hàng. */
export type CartSummaryProps = {
  disabled?: boolean;
  onCheckout: () => void;
  subtotal: number;
};


/** Phương thức thanh toán trong checkout. */
export type CartPaymentMethod = "bank" | "cod";


/** Dữ liệu form thanh toán phía client. */
export type CheckoutFormValues = {
  email: string;
  fullname: string;
  phone: string;
};


/** Props form thanh toán. */
export type CheckoutFormProps = {
  isSubmitting?: boolean;
  onComplete: (data: {
    address: string;
    city: string;
    email: string;
    fullname: string;
    note: string;
    paymentMethod: CartPaymentMethod;
    phone: string;
    zip: string;
  }) => Promise<void> | void;
};


/** Props khối tổng tóm tắt đơn ở trang checkout. */
export type CheckoutSummaryProps = {
  isSubmitting?: boolean;
  items: ClientCartItem[];
  onBackToCart: () => void;
  onApplyPromo: (code: string) => Promise<{ success: boolean; error?: string }>;
  appliedDiscountCode?: string;
  discountAmount?: number;
  discountType?: string;
};


/** Props header của trang lịch sử đơn hàng. */
export type OrdersHeaderProps = {
  user: Required<ClientOrderUserData>;
};


/** Props nội dung trang lịch sử đơn hàng. */
export type OrdersContentProps = {
  initialUser: Required<ClientOrderUserData>;
};

/** Metadata phân trang lịch sử đơn hàng khách hàng. */
export type ClientOrdersMeta = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};


/** Thông tin user dùng trong trang profile. */
export type ClientProfileUserData = {
  address?: string;
  city?: string;
  email?: string;
  fullname?: string;
  phone?: string;
  role?: string;
  zip?: string;
};


/** Tab đang active trong profile. */
export type ClientProfileTab = "orders" | "profile";


/** Props header profile. */
export type ProfileHeaderProps = {
  activeTab: ClientProfileTab;
  user: Required<ClientProfileUserData>;
};


/** Props nội dung trang profile. */
export type ProfilePageContentProps = {
  initialUser: Required<ClientProfileUserData>;
};


/** Props field trong form profile. */
export type ProfileFieldProps = {
  className?: string;
  error?: string;
  id: keyof Required<ClientProfileUserData>;
  label: string;
  onChange: (field: keyof Required<ClientProfileUserData>, value: string) => void;
  type?: string;
  value: string;
};


/** Phase hiển thị intro animation. */
export type IntroPhase = "black" | "candle" | "garden" | "hide";


/** Layer cây trong intro animation. */
export type IntroTreeLayer = "far" | "mid" | "near";


/** Props cây trong intro animation. */
export type IntroTreeProps = {
  h: number;
  layer: IntroTreeLayer;
  opacity: number;
  w: number;
  x: string;
};


/** Props hoa trong intro animation. */
export type IntroFlowerProps = {
  colors: string[];
  delay: string;
  h: number;
  opacity: number;
  size: number;
  x: string;
};


/** Values form yêu cầu đặt lại mật khẩu. */
export type ForgotPasswordValues = {
  email: string;
};


/** Values form xác nhận OTP và mật khẩu mới. */
export type ResetPasswordValues = {
  confirmPassword: string;
  newPassword: string;
  otp: string;
};


/** Item chi tiết đơn hàng (dùng cho cả admin và client). */
export type OrderDetailItem = {
  colorHex?: string;
  colorName?: string;
  detail?: string;
  name: string;
  price: number;
  quantity: number;
  scent?: string;
  size?: string;
  toppings?: string[];
};


/** Log lịch sử thay đổi trạng thái đơn hàng. */
export type OrderHistoryLog = {
  admin?: string | null;
  createdAt: string;
  currentStatus: string;
  id: string;
  note?: string | null;
  previousStatus?: string | null;
  updatedBy?: string | null;
};


/** Chi tiết đầy đủ một đơn hàng (client & admin). */
export type OrderDetail = {
  date: string;
  discount: number;
  discountCode?: string | null;
  email?: string | null;
  historyLogs: OrderHistoryLog[];
  id: string;
  items: OrderDetailItem[];
  paymentMethod: "bank" | "cod";
  paymentStatus: "paid" | "unpaid";
  phone: string;
  shipping: number;
  shippingAddress: string;
  shippingCity: string;
  shippingFullname: string;
  shippingNote?: string | null;
  status: ClientOrderStatus;
  subtotal: number;
  total: number;
};


/** Props trang chi tiết đơn hàng. */
export type DetailOrderProps = {
  isAdmin?: boolean;
  onClose: () => void;
  orderNumber: string;
  onCancelSuccess?: () => void;
};


/** Alias phương thức thanh toán dùng trong order confirmation. */
export type OrderPaymentMethod = CartPaymentMethod;


/** Item trong order confirmation. */
export type OrderItem = {
  color?: string;
  name: string;
  pack?: string;
  price: number;
  quantity: number;
  scent?: string;
  size?: string;
};


/** Đơn hàng lưu ở localStorage sau khi đặt hàng thành công. */
export type Order = {
  address: string;
  city: string;
  createdAt: string;
  email: string;
  fullname: string;
  isGuest: boolean;
  items: OrderItem[];
  note?: string | null;
  orderId: string;
  orderNumber: string;
  paymentMethod: OrderPaymentMethod;
  phone: string;
  shipping: number;
  subtotal: number;
  total: number;
  zip?: string;
};

/** Dữ liệu sản phẩm ngừng bán được gửi từ WebSocket của user */
export type CartProductsRemovedData = {
  productNames: string[];
  userId: string;
};

export type OrderCancelledData = {
  orderId: string;
  orderNumber: string;
  reason: string;
  userId: string;
  notification?: {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  };
  unreadNotificationCount?: number;
};

/** Message WebSocket nhận từ cổng thông báo của user */
export type UserNotificationWebSocketMessage =
  | { event: "CONNECTED"; data: { userId: string } }
  | { event: "CART_PRODUCTS_REMOVED"; data: CartProductsRemovedData }
  | { event: "ORDER_CANCELLED"; data: OrderCancelledData };

/** Options truyền vào hook useUserNotificationSocket */
export type UseUserNotificationSocketOptions = {
  onConnected?: (data: { userId: string }) => void;
  onCartProductsRemoved?: (data: CartProductsRemovedData) => void;
  onOrderCancelled?: (data: OrderCancelledData) => void;
};

/** Thông báo hiển thị phía User */
export type UserNotification = {
  id: string;
  user_id: string;
  order_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: Date | string | null;
  created_at: Date | string;
};
