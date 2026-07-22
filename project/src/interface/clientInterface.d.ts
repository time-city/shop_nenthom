/** Category đi kèm product ở response client. */
export interface ClientProductCategoryInterface {
description?: string | null;
id: number;
name: string;
}


/** Response thành công của action lấy danh sách category. */
export interface ClientCategoriesSuccessResponseInterface {
categories: ClientProductCategoryInterface[];
success: true;
}


/** Product item trong response danh sách sản phẩm. */
export interface ClientProductItemInterface {
base_price_cents: number;
category?: ClientProductCategoryInterface | null;
description: string | null;
id: string;
images: unknown;
is_custom?: boolean;
name: string;
}


/** Meta pagination hiện action product trả về từ service. */
export interface ClientProductsMetaInterface {
limit: number;
page: number;
total: number;
totalPages: number;
}


/** Pagination dùng sau khi FE normalize danh sách sản phẩm. */
export interface ClientProductPaginationInterface {
limit: number;
page: number;
totalItems: number;
totalPages: number;
}




/** Data đã normalize ở FE cho danh sách sản phẩm. */
export interface ClientProductsDataInterface {
items: ClientProductItemInterface[];
pagination: ClientProductPaginationInterface;
}




/** Response thành công hiện tại của action lấy danh sách sản phẩm. */
export interface ClientProductsSuccessResponseInterface {
data: ClientProductItemInterface[];
meta: ClientProductsMetaInterface;
success: true;
}




/** Response lỗi của action lấy danh sách sản phẩm. */
export interface ClientProductsErrorResponseInterface {
error: string;
success?: false;
}




/** Option item trong response chi tiết sản phẩm. */
export interface ClientProductOptionItemInterface {
hex_code?: string;
id: number;
name: string;
price_extra_cents: number;
weight_gram?: number;
}



/** Nhóm options trong response chi tiết sản phẩm. */
export interface ClientProductOptionsInterface {
colors?: ClientProductOptionItemInterface[];
packagings?: ClientProductOptionItemInterface[];
scents?: ClientProductOptionItemInterface[];
sizes?: ClientProductOptionItemInterface[];
toppings?: ClientProductOptionItemInterface[];
waxColors?: ClientProductOptionItemInterface[];
}


/** Options tùy chỉnh trả về từ action getCustomizationOptionsAction. */
export interface ClientCustomizationOptionsInterface {
colors: ClientProductOptionItemInterface[];
packagings: ClientProductOptionItemInterface[];
scents: ClientProductOptionItemInterface[];
sizes: ClientProductOptionItemInterface[];
toppings: ClientProductOptionItemInterface[];
}




/** Response thành công của action lấy options tùy chỉnh. */
export interface ClientCustomizationOptionsSuccessResponseInterface {
data: ClientCustomizationOptionsInterface;
success: true;
}




/** Product nền dùng cho form nến tùy chỉnh. */
export interface ClientCustomCandleProductInterface {
base_price_cents: number;
category?: ClientProductCategoryInterface | null;
id: string;
name: string;
}




/** Response thành công của action lấy product nền nến tùy chỉnh. */
export interface ClientCustomCandleProductSuccessResponseInterface {
data: ClientCustomCandleProductInterface;
success: true;
}




/** Product detail trả về từ API chi tiết sản phẩm. */
export interface ClientProductDetailInterface {
base_price_cents: number;
category?: {
  id: number;
  name: string;
} | null;
description: string | null;
id: string;
images: unknown;
name: string;
options?: ClientProductOptionsInterface;
}




/** Data response của action chi tiết sản phẩm. */
export interface ClientProductDetailDataInterface {
options: ClientProductOptionsInterface;
product: Omit<ClientProductDetailInterface, "options">;
}




/** Contact item trả về sau khi user gửi form liên hệ. */
export interface ClientContactInterface {
created_at: Date | string;
email: string;
id: string;
message: string;
name: string;
status: "PENDING" | "REPLIED";
subject: string;
}




/** Response thành công của action gửi liên hệ. */
export interface ClientSubmitContactSuccessResponseInterface {
data: ClientContactInterface;
success: true;
}




/** Product nằm trong item giỏ hàng trả về từ action cart. */
export interface ClientCartProductInterface {
base_price_cents: number;
id: string;
images: unknown;
is_custom: boolean;
name: string;
}




/** Option nằm trong item giỏ hàng trả về từ action cart. */
export interface ClientCartOptionInterface {
hex_code?: string;
id: number;
name: string;
price_extra_cents: number;
weight_gram?: number;
}




/** Item giỏ hàng trả về từ action cart. */
export interface ClientCartActionItemInterface {
color?: ClientCartOptionInterface | null;
id: string;
pack_id?: number | null;
packaging?: ClientCartOptionInterface | null;
product: ClientCartProductInterface;
product_id: string;
quantity: number;
scent?: ClientCartOptionInterface | null;
size?: ClientCartOptionInterface | null;
toppings?: ClientCartOptionInterface[];
toppings_json?: unknown;
}


/** Cart trả về từ action lấy/tạo giỏ hàng. */
export interface ClientCartActionCartInterface {
id: string;
items: ClientCartActionItemInterface[];
}


/** Response thành công của action lấy/tạo giỏ hàng. */
export interface ClientCartActionSuccessResponseInterface {
cart: ClientCartActionCartInterface;
success: true;
}

/** Interface chứa các trường thông tin cần thiết cho form checkout. */
export interface FullFormValues {
  fullname: string;
  email: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  zip: string;
  note: string;
}


/** Props cho component DetailCardProductModal */
export interface DetailCardProductModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}