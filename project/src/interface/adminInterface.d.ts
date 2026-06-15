/** Data mùi hương trả về từ action admin option. */
export interface AdminScentActionDataInterface {
 id: number;
 is_active: boolean;
 name: string;
 price_extra_cents: number;
}


/** Response thành công khi tạo/cập nhật mùi hương. */
export interface AdminScentActionSuccessResponseInterface {
 data: AdminScentActionDataInterface;
 success: true;
}


/** Data màu sáp trả về từ action admin option. */
export interface AdminWaxColorActionDataInterface {
 hex_code: string;
 id: number;
 is_active: boolean;
 name: string;
 price_extra_cents: number;
}


/** Response thành công khi tạo/cập nhật màu sáp. */
export interface AdminWaxColorActionSuccessResponseInterface {
 data: AdminWaxColorActionDataInterface;
 success: true;
}


/** Data kích thước trả về từ action admin option. */
export interface AdminSizeActionDataInterface {
 id: number;
 is_active: boolean;
 name: string;
 price_extra_cents: number;
 weight_gram: number;
}


/** Response thành công khi tạo/cập nhật kích thước. */
export interface AdminSizeActionSuccessResponseInterface {
 data: AdminSizeActionDataInterface;
 success: true;
}


/** Data topping trả về từ action admin option. */
export interface AdminToppingActionDataInterface {
 id: number;
 in_stock: boolean;
 is_active: boolean;
 name: string;
 price_extra_cents: number;
}


/** Response thành công khi tạo/cập nhật topping. */
export interface AdminToppingActionSuccessResponseInterface {
 data: AdminToppingActionDataInterface;
 success: true;
}


/** Data bao bì trả về từ action admin option. */
export interface AdminPackagingActionDataInterface {
 id: number;
 is_active: boolean;
 name: string;
 price_extra_cents: number;
}


/** Response thành công khi tạo/cập nhật bao bì. */
export interface AdminPackagingActionSuccessResponseInterface {
 data: AdminPackagingActionDataInterface;
 success: true;
}


/** Option item trả về từ action lấy danh sách nguyên liệu admin. */
export interface AdminOptionItemInterface {
 hex_code?: string;
 id: number;
 in_stock?: boolean;
 name: string;
 price_extra_cents: number;
 weight_gram?: number;
}


/** Data options tùy chỉnh trả về cho trang kho nguyên liệu admin. */
export interface AdminCustomizationOptionsInterface {
 colors: AdminOptionItemInterface[];
 packagings: AdminOptionItemInterface[];
 scents: AdminOptionItemInterface[];
 sizes: AdminOptionItemInterface[];
 toppings: AdminOptionItemInterface[];
}


/** Response thành công khi lấy danh sách nguyên liệu admin. */
export interface AdminCustomizationOptionsSuccessResponseInterface {
 data: AdminCustomizationOptionsInterface;
 success: true;
}


/** Category đi kèm product ở response admin. */
export interface AdminProductCategoryInterface {
 description?: string | null;
 id: number;
 name: string;
}


/** Response thành công khi lấy danh sách category trong admin. */
export interface AdminCategoriesSuccessResponseInterface {
 categories: AdminProductCategoryInterface[];
 success: true;
}


/** Product item trong response danh sách sản phẩm admin. */
export interface AdminProductListItemInterface {
 base_price_cents: number;
 category?: AdminProductCategoryInterface | null;
 category_id: number;
 description: string | null;
 id: string;
 images: unknown;
 is_active: boolean;
 is_custom?: boolean;
 name: string;
}


/** Product item trả về khi tạo/cập nhật sản phẩm admin. */
export interface AdminProductActionDataInterface {
 base_price_cents: number;
 category_id: number;
 created_at?: Date | string;
 description?: string | null;
 id: string;
 images: unknown;
 is_active: boolean;
 name: string;
}


/** Response thành công khi tạo/cập nhật sản phẩm admin. */
export interface AdminProductActionSuccessResponseInterface {
 data: AdminProductActionDataInterface;
 success: true;
}


/** Option item trong response chi tiết sản phẩm admin. */
export interface AdminProductDetailOptionItemInterface {
 hex_code?: string;
 id: number;
 name: string;
 price_extra_cents: number;
 weight_gram?: number;
}


/** Nhóm option trả về trong chi tiết sản phẩm admin. */
export interface AdminProductDetailOptionsInterface {
 colors: AdminProductDetailOptionItemInterface[];
 packagings: AdminProductDetailOptionItemInterface[];
 scents: AdminProductDetailOptionItemInterface[];
 sizes: AdminProductDetailOptionItemInterface[];
 toppings: AdminProductDetailOptionItemInterface[];
}


/** Data chi tiết sản phẩm trả về từ action admin. */
export interface AdminProductDetailInterface {
 base_price_cents: number;
 category?: AdminProductCategoryInterface | null;
 created_at?: Date | string;
 description: string | null;
 id: string;
 images: unknown;
 name: string;
 options?: AdminProductDetailOptionsInterface;
}


/** Response thành công khi lấy chi tiết sản phẩm admin. */
export interface AdminProductDetailSuccessResponseInterface {
 data: AdminProductDetailInterface;
 success: true;
}


/** Meta pagination trong response danh sách sản phẩm admin. */
export interface AdminProductsMetaInterface {
 limit: number;
 page: number;
 total: number;
 totalPages: number;
}


/** Response thành công khi lấy danh sách sản phẩm admin. */
export interface AdminProductsSuccessResponseInterface {
 data: AdminProductListItemInterface[];
 meta: AdminProductsMetaInterface;
 success: true;
}


/** Response lỗi chung từ action admin. */
export interface AdminActionErrorResponseInterface {
 error: string;
 status?: string;
}


/** Contact item trả về từ action lấy danh sách liên hệ admin. */
export interface AdminContactItemInterface {
 created_at: Date | string;
 email: string;
 id: string;
 message: string;
 name: string;
 status: "PENDING" | "REPLIED";
 subject: string;
}


/** Meta pagination trong response danh sách liên hệ admin. */
export interface AdminContactsMetaInterface {
 limit: number;
 page: number;
 total: number;
 totalPages: number;
}


/** Response thành công khi lấy danh sách liên hệ admin. */
export interface AdminContactsSuccessResponseInterface {
 data: AdminContactItemInterface[];
 meta: AdminContactsMetaInterface;
 success: true;
}



