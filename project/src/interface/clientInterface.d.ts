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

/** Data response linh hoạt của action chi tiết sản phẩm. */
export interface ClientProductDetailDataInterface {
  options?: ClientProductOptionsInterface;
  product?: Partial<ClientProductDetailInterface>;
  [key: string]: unknown;
}
