/** Query params dùng cho trang collection. */
export type CollectionSearchParams = {
 categoryId?: string;
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
export type ClientOrderStatus = "processing" | "shipping" | "done" | "canceled";


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
 onApplyPromo: () => void;
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
};


/** Props header của trang lịch sử đơn hàng. */
export type OrdersHeaderProps = {
 user: Required<ClientOrderUserData>;
};


/** Props nội dung trang lịch sử đơn hàng. */
export type OrdersContentProps = {
 initialUser: Required<ClientOrderUserData>;
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
