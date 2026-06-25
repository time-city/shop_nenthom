"use client";

import Image from "next/image";
import {
 startTransition,
 type MouseEvent,
 useCallback,
 useEffect,
 useState,
} from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import dynamic from "next/dynamic";
import LoadingState from "@/src/components/ui/loadingState";
import ModalDeleteConfirm from "@/src/components/admin/modalDeleteConfirm";
import TableResponsiveWrapper from "@/src/components/admin/TableResponsiveWrapper";
import AdminHeader from "./AdminHeader";

const ModalProduct = dynamic(() => import("@/src/components/admin/modalProduct"), { ssr: false });
const ModalEditProduct = dynamic(() => import("@/src/components/admin/modalEditProduct"), { ssr: false });
import {
 AdminDeleteButton,
 AdminEditButton,
} from "@/src/components/ui/actionButtons";
import type {
 AdminProductListItemInterface,
 AdminProductsSuccessResponseInterface,
 AdminProductCategoryInterface,
} from "@/src/interface/adminInterface";
import {
 deleteProductAction,
 getProductDeleteImpactAction,
 getProductsAction,
} from "@/src/lib/action/product.action";
import { getCategoriesAction } from "@/src/lib/action/category.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import type { AdminProductRow } from "@/src/lib/types/admin";
import { callAction } from "@/src/lib/utils/callAction";

type ProductImpact = {
 activeOrderCount: number;
 cartCount: number;
 cartItemCount: number;
 cartQuantity: number;
 orders: { customerName: string; orderNumber: string; quantity: number; status: string }[];
 productId: string;
 productName: string;
};

const formatCurrency = (value: number) =>
 `${new Intl.NumberFormat("vi-VN").format(value)} đ`;

const mapProductToRow = (
 product: AdminProductListItemInterface,
): AdminProductRow => ({
 category: product.category?.name ?? "Chưa phân loại",
 id: product.id,
 name: product.name,
 price: formatCurrency(product.base_price_cents),
 status: product.is_active ? "Đang bán" : "Đã ẩn",
 statusType: product.is_active ? "completed" : "cancelled",
});

export default function ProductManagementClient() {
 const { toast } = useToast();
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editProduct, setEditProduct] =
   useState<AdminProductListItemInterface | null>(null);
 const [deleteProduct, setDeleteProduct] =
   useState<AdminProductListItemInterface | null>(null);
 const [isDeletingProduct, setIsDeletingProduct] = useState(false);
 const [isLoadingProducts, setIsLoadingProducts] = useState(true);
 const [isLoadingProductImpact, setIsLoadingProductImpact] = useState(false);
 const [productImpact, setProductImpact] = useState<ProductImpact | null>(null);
 const [error, setError] = useState("");
 const [products, setProducts] = useState<AdminProductListItemInterface[]>([]);
 const [categories, setCategories] = useState<AdminProductCategoryInterface[]>([]);

 const loadProducts = useCallback(async (cancelledRef?: { current: boolean }) => {
   setIsLoadingProducts(true);

   // action-(lấy danh sách sản phẩm admin)
   const result = await callAction(() => getProductsAction({ limit: 100, page: 1 }), "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
   if (cancelledRef?.current) return;

   if ("error" in result && result.error) {
     const friendlyErr = getFriendlyResponseError(result.error);
     setError(friendlyErr);
     toast.error(friendlyErr);
     setProducts([]);
     setIsLoadingProducts(false);
     return;
   }

   if ("success" in result && result.success) {
     const productResult = result as AdminProductsSuccessResponseInterface;
     setError("");
     setProducts(productResult.data.filter((product) => product.is_custom !== true));
   }

   setIsLoadingProducts(false);
 }, [toast]);

 useEffect(() => {
   const cancelled = { current: false };
   startTransition(() => {
     void loadProducts(cancelled);
   });

   return () => {
     cancelled.current = true;
   };
 }, [loadProducts]);

 useEffect(() => {
   const loadCategories = async () => {
     const result = await callAction(() => getCategoriesAction(), "Không thể tải danh mục. Vui lòng thử lại sau.");
     if ("success" in result && result.success) {
       setCategories(result.categories);
     }
   };
   void loadCategories();
 }, [toast]);

 const stopRowClick = (event: MouseEvent<HTMLButtonElement>) => {
   event.stopPropagation();
 };

 const handleDeleteProduct = async () => {
   if (!deleteProduct) return;

   setIsDeletingProduct(true);

   // action-(ngừng bán sản phẩm)
   const result = await callAction(() => deleteProductAction({ id: deleteProduct.id }), "Không thể ngừng bán sản phẩm. Vui lòng thử lại sau.");

   if ("error" in result && result.error) {
     toast.error(getFriendlyResponseError(result.error));
     setIsDeletingProduct(false);
     return;
   }
   if ("success" in result && result.success) {
     const data = result.data as { removedCartItemCount?: number } | undefined;
     const removedCount = data?.removedCartItemCount ?? 0;
     const msg = removedCount > 0
       ? `Đã ngừng bán sản phẩm "${deleteProduct.name}", đã cập nhật ${removedCount} giỏ hàng.`
       : `Đã ngừng bán sản phẩm "${deleteProduct.name}".`;
     toast.success(msg);
     setDeleteProduct(null);
     setProductImpact(null);
     await loadProducts();
   }

   setIsDeletingProduct(false);
 };

 const handleOpenDeleteProductModal = async (product: AdminProductListItemInterface) => {
   setDeleteProduct(product);
   setProductImpact(null);
   setIsLoadingProductImpact(true);

   try {
     const result = await callAction(
       () => getProductDeleteImpactAction({ id: product.id }),
       "Không thể kiểm tra sản phẩm. Vui lòng thử lại sau."
     );
     if ("success" in result && result.success) {
       const data = (result as { success: true; data: ProductImpact }).data;
       setProductImpact(data);
     }
   } catch {
     // Ignore impact load error, still allow delete
   } finally {
     setIsLoadingProductImpact(false);
   }
 };

 return (
   <>
      <AdminHeader
        title="Quản lý Sản phẩm"
        subtitle="Danh sách sản phẩm gốc của cửa hàng"
      >
        <button
          className="product-btn product-btn-primary"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="hidden sm:inline">Thêm sản phẩm</span>
        </button>
      </AdminHeader>

     <div className="dashboard-page-content">
       <section className="dashboard-card product-table-card">
         <div className="dashboard-card-body no-padding">
           <div className="dashboard-table-wrapper">
             <TableResponsiveWrapper minWidth={950}>
               <table className="dashboard-admin-table product-admin-table">
                 <thead>
                   <tr>
                     <th className="product-thumb-col">
                       <span className="sr-only">Ảnh</span>
                     </th>
                     <th>Tên sản phẩm</th>
                     <th>Danh mục</th>
                     <th>Giá gốc</th>
                     <th>Trạng thái</th>
                     <th className="product-action-col">
                       <span className="sr-only">Thao tác</span>
                     </th>
                   </tr>
                 </thead>
                 <tbody>
                   {products.map((product) => {
                     const productRow = mapProductToRow(product);

                     return (
                       <tr
                         key={product.id}
                         className="transition hover:bg-[#6B1218]/[0.03]"
                       >
                         <td>
                           <div className="product-table-thumb" aria-hidden="true">
                             {Array.isArray(product.images) && typeof product.images[0] === "string" && product.images[0] ? (
                               <Image
                                 src={product.images[0]}
                                 alt={product.name}
                                 width={48}
                                 height={48}
                                 unoptimized
                                 className="h-full w-full object-cover rounded-[7px]"
                               />
                             ) : (
                               <span />
                             )}
                           </div>
                         </td>
                         <td className="wrap-content">
                           <div className="dashboard-product-name">
                             {productRow.name}
                           </div>
                         </td>
                         <td>{productRow.category}</td>
                         <td className="orders-table-amount">{productRow.price}</td>
                         <td>
                           <span className={`dashboard-status ${productRow.statusType}`}>
                             {productRow.status}
                           </span>
                         </td>
                         <td>
                           <div className="product-row-actions">
                             <AdminEditButton
                               ariaLabel={`Sửa ${productRow.name}`}
                               onClick={(event) => {
                                 stopRowClick(event);
                                 setEditProduct(product);
                               }}
                             />
                             <AdminDeleteButton
                               ariaLabel={`Xóa ${productRow.name}`}
                               onClick={(event) => {
                                 stopRowClick(event);
                                 void handleOpenDeleteProductModal(product);
                               }}
                             />
                           </div>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </TableResponsiveWrapper>
           </div>
           {isLoadingProducts ? (
             <LoadingState
               label="Đang tải danh sách sản phẩm..."
               className="m-5"
             />
           ) : null}
           {!isLoadingProducts && error ? (
             <div className="px-5 py-8 text-center text-sm text-[#8A1119]">
               {error}
             </div>
           ) : null}
           {!isLoadingProducts && !error && products.length === 0 ? (
             <div className="px-5 py-8 text-center text-sm text-[#6B4C35]">
               Chưa có sản phẩm nào
             </div>
           ) : null}
         </div>
       </section>
     </div>

      <ModalProduct
        open={isModalOpen}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSave={loadProducts}
      />
      <ModalEditProduct
        open={Boolean(editProduct)}
        product={editProduct}
        categories={categories}
        onClose={() => setEditProduct(null)}
        onSave={loadProducts}
      />
     <ModalDeleteConfirm
       open={Boolean(deleteProduct)}
       productName={deleteProduct?.name}
       isDeleting={isDeletingProduct}
       title="Ngừng bán sản phẩm?"
       confirmLabel="Ngừng bán"
       description={
         <>
           Sản phẩm <span style={{ color: "#6b1218", fontWeight: 700 }}>{deleteProduct?.name}</span> sẽ được ẩn khỏi cửa hàng. Lịch sử đơn hàng vẫn được giữ nguyên.
           {isLoadingProductImpact ? (
             <span style={{ display: "block", marginTop: 6, color: "#6B4C35", fontStyle: "italic" }}>
               Đang kiểm tra tác động...
             </span>
           ) : productImpact && (productImpact.cartCount > 0 || productImpact.activeOrderCount > 0) ? (
             <span style={{ display: "block", marginTop: 6, color: "#B91C1C", fontWeight: 600 }}>
               {productImpact.cartCount > 0 && (
                 <span style={{ display: "block" }}>⚠️ {productImpact.cartCount} giỏ hàng có chứa sản phẩm này sẽ bị ảnh hưởng.</span>
               )}
               {productImpact.activeOrderCount > 0 && (
                 <span style={{ display: "block" }}>⚠️ {productImpact.activeOrderCount} đơn hàng đang chờ xử lý có chứa sản phẩm này.</span>
               )}
             </span>
           ) : null}
         </>
       }
       onClose={() => { setDeleteProduct(null); setProductImpact(null); }}
       onConfirm={handleDeleteProduct}
     />
   </>
 );
}
