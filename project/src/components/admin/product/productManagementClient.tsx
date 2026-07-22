"use client";

import Image from "next/image";
import {
 startTransition,
 type MouseEvent,
 useCallback,
 useEffect,
 useState,
} from "react";
import useSWR from "swr";
import { useToast } from "@/src/components/ui/toastProvider";
import dynamic from "next/dynamic";
import LoadingState from "@/src/components/ui/loadingState";
import ModalDeleteConfirm from "@/src/components/admin/common/modalDeleteConfirm";
import TableResponsiveWrapper from "@/src/components/admin/common/TableResponsiveWrapper";
import AdminHeader from "@/src/components/admin/layout/AdminHeader";
import ClientPagination from "@/src/components/admin/customer/clientPagination";

const ModalProduct = dynamic(() => import("@/src/components/admin/product/modalProduct"), { ssr: false });
const ModalEditProduct = dynamic(() => import("@/src/components/admin/product/modalEditProduct"), { ssr: false });
import {
  AdminDeleteButton,
  AdminEditButton,
  AdminDeactivateButton,
  AdminActivateButton,
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
  hardDeleteProductAction,
  bulkDeactivateProductsAction,
  bulkHardDeleteProductsAction,
  updateProductAction,
} from "@/src/lib/action/product.action";
import { getCategoriesAction } from "@/src/lib/action/category.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import type { AdminProductRow } from "@/src/lib/types/admin";
import { callAction } from "@/src/lib/utils/callAction";
import { Box, Button, Divider, Modal, Typography } from "@/src/components/ui/mui-mock";
import styles from "@/src/styles/adminModal.module.css";

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
 const [isLoadingProductImpact, setIsLoadingProductImpact] = useState(false);
 const [productImpact, setProductImpact] = useState<ProductImpact | null>(null);
 const [error, setError] = useState("");

  // Categories SWR
  const { data: categoriesResult } = useSWR(
    ['admin-categories'],
    async () => {
      return await callAction(() => getCategoriesAction(), "Không thể tải danh mục. Vui lòng thử lại sau.");
    }
  );

  const categories = categoriesResult && 'success' in categoriesResult && categoriesResult.success
    ? categoriesResult.categories
    : [];

 const initialMeta = {
   limit: 10,
   page: 1,
   total: 0,
   totalPages: 1,
 };

 const [products, setProducts] = useState<AdminProductListItemInterface[]>([]);
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(10);
 const [meta, setMeta] = useState(initialMeta);

  // Selection & New actions states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [productToDeleteChoice, setProductToDeleteChoice] = useState<AdminProductListItemInterface | null>(null);
  const [hardDeleteProduct, setHardDeleteProduct] = useState<AdminProductListItemInterface | null>(null);
  const [isHardDeleting, setIsHardDeleting] = useState(false);
  const [isBulkActionPending, setIsBulkActionPending] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkDeactivateConfirm, setShowBulkDeactivateConfirm] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 5 : 10);
    };
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 const { data: fetchResult, isLoading: isSwrLoading, error: swrError, mutate: mutateProducts } = useSWR(
    ['admin-products', currentPage, itemsPerPage],
    async () => {
      console.log("[Data Source] 🟡 NETWORK QUERY - productManagementClient: Fetching products...");
      const result = await callAction(() => getProductsAction({ limit: itemsPerPage, page: currentPage }), "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      if ("error" in result && result.error) {
        throw new Error(getFriendlyResponseError(result.error));
      }
      return result;
    }
  );

  useEffect(() => {
    if (swrError) {
      const friendlyErr = swrError instanceof Error ? swrError.message : String(swrError);
      setError(friendlyErr);
      toast.error(friendlyErr);
      setProducts([]);
    } else if (fetchResult && "success" in fetchResult && fetchResult.success) {
      console.log("[Data Source] 🟢 UI UPDATED - productManagementClient: Displaying products (from SWR Cache or Network)");
      const productResult = fetchResult as AdminProductsSuccessResponseInterface;
      setError("");
      setProducts(productResult.data.filter((product) => product.is_custom !== true));
      if (productResult.meta) {
        setMeta(productResult.meta);
      }
    }
  }, [fetchResult, swrError, toast]);

  const isLoadingProducts = isSwrLoading && products.length === 0;

  const stopRowClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;
    const targetId = deleteProduct.id;
    const targetName = deleteProduct.name;
    
    setDeleteProduct(null);
    setProductImpact(null);
    setSelectedIds((prev) => prev.filter((id) => id !== targetId));

    const mutationPromise = mutateProducts(
      async (current: any) => {
        const result = await callAction(() => deleteProductAction({ id: targetId }), "Không thể ngừng bán sản phẩm. Vui lòng thử lại sau.");
        if ("error" in result && result.error) throw new Error(getFriendlyResponseError(result.error as string));
        if (!current || !current.data) return current;
        return {
          ...current,
          data: current.data.map((p: any) => p.id === targetId ? { ...p, is_active: false } : p)
        };
      },
      {
        optimisticData: (current: any) => {
          if (!current || !current.data) return current;
          return {
            ...current,
            data: current.data.map((p: any) => p.id === targetId ? { ...p, is_active: false } : p)
          };
        },
        rollbackOnError: true,
        revalidate: false
      }
    );
    toast.info(`Đang ngừng bán "${targetName}"...`);
    try {
      await mutationPromise;
      toast.success(`Đã ngừng bán "${targetName}".`);
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
    }
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

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Activation handler
  const handleActivateProduct = async (product: AdminProductListItemInterface) => {
    const targetId = product.id;
    const targetName = product.name;

    const mutationPromise = mutateProducts(
      async (current: any) => {
        const result = await callAction(() => updateProductAction(targetId, { is_active: true }), "Không thể kích hoạt lại sản phẩm. Vui lòng thử lại sau.");
        if ("error" in result && result.error) throw new Error(getFriendlyResponseError(result.error as string));
        if (!current || !current.data) return current;
        return {
          ...current,
          data: current.data.map((p: any) => p.id === targetId ? { ...p, is_active: true } : p)
        };
      },
      {
        optimisticData: (current: any) => {
          if (!current || !current.data) return current;
          return {
            ...current,
            data: current.data.map((p: any) => p.id === targetId ? { ...p, is_active: true } : p)
          };
        },
        rollbackOnError: true,
        revalidate: false
      }
    );
    toast.info(`Đang kích hoạt "${targetName}"...`);
    try {
      await mutationPromise;
      toast.success(`Đã kích hoạt lại "${targetName}" thành công.`);
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  // Hard delete handler
  const handleHardDeleteProduct = async () => {
    if (!hardDeleteProduct) return;
    const targetId = hardDeleteProduct.id;
    const targetName = hardDeleteProduct.name;
    
    setHardDeleteProduct(null);
    setSelectedIds((prev) => prev.filter((id) => id !== targetId));

    const mutationPromise = mutateProducts(
      async (current: any) => {
        const result = await callAction(() => hardDeleteProductAction({ id: targetId }), "Không thể xóa vĩnh viễn sản phẩm. Vui lòng thử lại sau.");
        if ("error" in result && result.error) throw new Error(getFriendlyResponseError(result.error as string));
        if (!current || !current.data) return current;
        return {
          ...current,
          data: current.data.filter((p: any) => p.id !== targetId)
        };
      },
      {
        optimisticData: (current: any) => {
          if (!current || !current.data) return current;
          return {
            ...current,
            data: current.data.filter((p: any) => p.id !== targetId)
          };
        },
        rollbackOnError: true,
        revalidate: false
      }
    );
    toast.info(`Đang xóa vĩnh viễn "${targetName}"...`);
    try {
      await mutationPromise;
      toast.success(`Đã xóa vĩnh viễn "${targetName}".`);
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  // Bulk deactivation handler
  const handleBulkDeactivate = async () => {
    if (selectedIds.length === 0) return;
    const targetIds = [...selectedIds];
    
    setShowBulkDeactivateConfirm(false);
    setSelectedIds([]);

    const mutationPromise = mutateProducts(
      async (current: any) => {
        const result = await callAction(() => bulkDeactivateProductsAction({ ids: targetIds }), "Không thể ngừng bán hàng loạt. Vui lòng thử lại sau.");
        if ("error" in result && result.error) throw new Error(getFriendlyResponseError(result.error as string));
        if (!current || !current.data) return current;
        return {
          ...current,
          data: current.data.map((p: any) => targetIds.includes(p.id) ? { ...p, is_active: false } : p)
        };
      },
      {
        optimisticData: (current: any) => {
          if (!current || !current.data) return current;
          return {
            ...current,
            data: current.data.map((p: any) => targetIds.includes(p.id) ? { ...p, is_active: false } : p)
          };
        },
        rollbackOnError: true,
        revalidate: false
      }
    );
    toast.info(`Đang ngừng bán ${targetIds.length} sản phẩm...`);
    try {
      await mutationPromise;
      toast.success(`Đã ngừng bán ${targetIds.length} sản phẩm.`);
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  // Bulk hard delete handler
  const handleBulkHardDelete = async () => {
    if (selectedIds.length === 0) return;
    const targetIds = [...selectedIds];
    
    setShowBulkDeleteConfirm(false);
    setSelectedIds([]);

    const mutationPromise = mutateProducts(
      async (current: any) => {
        const result = await callAction(() => bulkHardDeleteProductsAction({ ids: targetIds }), "Không thể xóa hàng loạt. Vui lòng thử lại sau.");
        if ("error" in result && result.error) throw new Error(getFriendlyResponseError(result.error as string));
        if (!current || !current.data) return current;
        return {
          ...current,
          data: current.data.filter((p: any) => !targetIds.includes(p.id))
        };
      },
      {
        optimisticData: (current: any) => {
          if (!current || !current.data) return current;
          return {
            ...current,
            data: current.data.filter((p: any) => !targetIds.includes(p.id))
          };
        },
        rollbackOnError: true,
        revalidate: false
      }
    );
    toast.info(`Đang xóa vĩnh viễn ${targetIds.length} sản phẩm...`);
    try {
      await mutationPromise;
      toast.success(`Đã xóa vĩnh viễn ${targetIds.length} sản phẩm.`);
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message}`);
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
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 mb-4 rounded-2xl border border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-700">
              Đang chọn <strong className="text-gray-900">{selectedIds.length}</strong> sản phẩm
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkDeactivateConfirm(true)}
                disabled={isBulkActionPending}
                className="product-btn"
                style={{ background: "#d97706", color: "white", padding: "6px 16px", borderRadius: "9999px", fontSize: "0.85rem", fontWeight: 600, border: "none", cursor: "pointer" }}
              >
                Ngừng bán đã chọn
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={isBulkActionPending}
                className="product-btn"
                style={{ background: "#dc2626", color: "white", padding: "6px 16px", borderRadius: "9999px", fontSize: "0.85rem", fontWeight: 600, border: "none", cursor: "pointer" }}
              >
                Xóa vĩnh viễn đã chọn
              </button>
            </div>
          </div>
        )}
        <section className="dashboard-card product-table-card overflow-hidden no-padding md:bg-transparent md:border-none bg-white">
          <div className="dashboard-card-body no-padding">
            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col gap-4 p-4">
              {products.length > 0 ? (
                products.map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 shadow-sm relative"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 flex items-center justify-center pt-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => handleSelectRow(product.id)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-3 items-start">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            {Array.isArray(product.images) && typeof product.images[0] === 'string' && product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <span />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
                            <div className="text-xs font-semibold text-gray-700">
                              {product.base_price_cents.toLocaleString('vi-VN')} đ
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Danh mục: {categories.find((c) => c.id === product.category_id)?.name || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded-full font-semibold ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {product.is_active ? "Đang bán" : "Ngừng bán"}
                        </span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <AdminEditButton
                          ariaLabel={`Sửa ${product.name}`}
                          onClick={(event) => {
                            stopRowClick(event);
                            setEditProduct(product);
                          }}
                        />
                        {product.is_active ? (
                          <AdminDeactivateButton
                            ariaLabel={`Ngừng bán ${product.name}`}
                            onClick={(event) => {
                              stopRowClick(event);
                              void handleOpenDeleteProductModal(product);
                            }}
                          />
                        ) : (
                          <AdminActivateButton
                            ariaLabel={`Kích hoạt lại ${product.name}`}
                            onClick={(event) => {
                              stopRowClick(event);
                              void handleActivateProduct(product);
                            }}
                          />
                        )}
                        <AdminDeleteButton
                          ariaLabel={`Xóa vĩnh viễn ${product.name}`}
                          onClick={(event) => {
                            stopRowClick(event);
                            setProductToDeleteChoice(product);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {isLoadingProducts ? "Đang tải..." : "Chưa có sản phẩm nào"}
                </div>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block dashboard-table-wrapper">
              <TableResponsiveWrapper minWidth={950}>
                <table className="dashboard-admin-table product-admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px", paddingLeft: "16px", paddingRight: "0px" }}>
                        <input
                          type="checkbox"
                          checked={products.length > 0 && selectedIds.length === products.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                          style={{ cursor: "pointer" }}
                        />
                      </th>
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
                         className="transition"
                       >
                         <td style={{ paddingLeft: "16px" }}>
                           <input
                             type="checkbox"
                             checked={selectedIds.includes(product.id)}
                             onChange={() => handleSelectRow(product.id)}
                             className="w-4 h-4 rounded border-gray-300 bg-white text-gray-900 focus:ring-gray-900"
                             style={{ cursor: "pointer" }}
                           />
                         </td>
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
                             {product.is_active ? (
                               <AdminDeactivateButton
                                 ariaLabel={`Ngừng bán ${productRow.name}`}
                                 onClick={(event) => {
                                   stopRowClick(event);
                                   void handleOpenDeleteProductModal(product);
                                 }}
                               />
                             ) : (
                               <AdminActivateButton
                                 ariaLabel={`Kích hoạt lại ${productRow.name}`}
                                 onClick={(event) => {
                                   stopRowClick(event);
                                   void handleActivateProduct(product);
                                 }}
                               />
                             )}
                             <AdminDeleteButton
                               ariaLabel={`Xóa vĩnh viễn ${productRow.name}`}
                               title="Xóa vĩnh viễn khỏi Database"
                               onClick={(event) => {
                                 stopRowClick(event);
                                 setProductToDeleteChoice(product);
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
             <LoadingState type="table"
               label="Đang tải danh sách sản phẩm..."
               className="m-5 hidden md:block"
             />
           ) : null}
           {!isLoadingProducts && error ? (
             <div className="px-5 py-8 text-center text-sm text-[#8A1119] hidden md:block">
               {error}
             </div>
           ) : null}
           {!isLoadingProducts && !error && products.length === 0 ? (
             <div className="px-5 py-8 text-center text-sm text-[#6B4E35]/60 hidden md:block">
               Chưa có sản phẩm nào
             </div>
           ) : null}
         </div>
       </section>

       <ClientPagination
         currentPage={meta.page}
         totalPages={meta.totalPages}
         onChange={(page) => setCurrentPage(page)}
       />
     </div>

      <ModalProduct
        open={isModalOpen}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSave={(newProduct) => {
          if (newProduct) {
            mutateProducts(
              (current: any) => {
                if (!current || !current.data) return current;
                return {
                  ...current,
                  data: [newProduct, ...current.data]
                };
              },
              false
            );
          }
        }}
      />
      <ModalEditProduct
        product={editProduct}
        open={Boolean(editProduct)}
        onClose={() => setEditProduct(null)}
        onSave={(updatedProduct) => {
          if (updatedProduct) {
            mutateProducts(
              (current: any) => {
                if (!current || !current.data) return current;
                return {
                  ...current,
                  data: current.data.map((p: any) => p.id === updatedProduct.id ? updatedProduct : p)
                };
              },
              false
            );
          }
        }}
      />
     <ModalDeleteConfirm
       open={Boolean(deleteProduct)}
       productName={deleteProduct?.name}
       isDeleting={isDeletingProduct}
       title="Ngừng bán sản phẩm?"
       confirmLabel="Ngừng bán"
       description={
         <>
           Sản phẩm <span style={{ color: "#E5C07B", fontWeight: 700 }}>{deleteProduct?.name}</span> sẽ được ẩn khỏi cửa hàng. Lịch sử đơn hàng vẫn được giữ nguyên.
           {isLoadingProductImpact ? (
             <span style={{ display: "block", marginTop: 6, color: "rgba(255, 255, 255, 0.6)", fontStyle: "italic" }}>
               Đang kiểm tra tác động...
             </span>
           ) : productImpact && (productImpact.cartCount > 0 || productImpact.activeOrderCount > 0) ? (
             <span style={{ display: "block", marginTop: 6, color: "#ff6b6b", fontWeight: 600 }}>
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

      {/* Choice Modal for delete vs deactivate */}
      <Modal
        open={Boolean(productToDeleteChoice)}
        onClose={() => setProductToDeleteChoice(null)}
      >
        <Box className={`${styles.modalPaper} ${styles.deletePaper}`}>
          <Box className={styles.deleteBody}>
            <Box className={styles.dangerIcon} aria-hidden="true" style={{ color: "#E5C07B", borderColor: "rgba(229, 192, 123, 0.2)" }}>
              ⚠️
            </Box>
            <Box className={styles.deleteContent}>
              <Typography component="h3" className={styles.deleteTitle} style={{ color: "#E5C07B" }}>
                Xóa vĩnh viễn sản phẩm?
              </Typography>
              <Typography className={styles.description}>
                Bạn đang chọn xóa vĩnh viễn sản phẩm <strong style={{ color: "#E5C07B" }}>{productToDeleteChoice?.name}</strong> khỏi cơ sở dữ liệu.
                <span style={{ display: "block", marginTop: "8px", color: "#ff6b6b" }}>
                  ⚠️ CẢNH BÁO: Hành động này sẽ bị lỗi nếu sản phẩm đã có lịch sử đơn hàng (để bảo toàn báo cáo doanh thu).
                </span>
                <span style={{ display: "block", marginTop: "8px" }}>
Chúng tôi khuyến khích bạn chọn <strong>&ldquo;Ngừng bán&rdquo;</strong> (Ẩn khỏi cửa hàng) thay vì xóa cứng để đảm bảo an toàn cho dữ liệu đơn hàng.
                </span>
              </Typography>
            </Box>
          </Box>
          <Divider className={styles.divider} />
          <Box className={styles.footer} style={{ gap: "10px", justifyContent: "flex-end" }}>
            <Button
              type="button"
              onClick={() => setProductToDeleteChoice(null)}
              className={styles.ghostButton}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => {
                const product = productToDeleteChoice;
                setProductToDeleteChoice(null);
                if (product) {
                  void handleOpenDeleteProductModal(product);
                }
              }}
              className={styles.primaryButton}
              style={{ background: "#d97706", color: "white", border: "none", cursor: "pointer" }}
            >
              Ngừng bán (Khuyên dùng)
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => {
                const product = productToDeleteChoice;
                setProductToDeleteChoice(null);
                if (product) {
                  setHardDeleteProduct(product);
                }
              }}
              className={styles.dangerButton}
              style={{ background: "#dc2626", color: "white", border: "none", cursor: "pointer" }}
            >
              Vẫn xóa vĩnh viễn
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Confirmation Modal for Hard Delete */}
      <ModalDeleteConfirm
        open={Boolean(hardDeleteProduct)}
        productName={hardDeleteProduct?.name}
        isDeleting={isHardDeleting}
        title="Xóa vĩnh viễn khỏi Database?"
        confirmLabel="Xóa vĩnh viễn"
        description={
          <>
            Hành động này sẽ <span style={{ color: "#ff6b6b", fontWeight: 700 }}>XÓA CỨNG</span> sản phẩm <strong style={{ color: "#E5C07B" }}>{hardDeleteProduct?.name}</strong> khỏi cơ sở dữ liệu.
            <span style={{ display: "block", marginTop: "8px", color: "#ff6b6b", fontWeight: 600 }}>
⚠️ Khuyên dùng: Nếu có lỗi Ràng buộc khóa ngoại (Foreign Key constraint), nghĩa là sản phẩm đã có đơn hàng trong quá khứ và không thể xóa cứng. Bạn bắt buộc phải dùng &ldquo;Ngừng bán&rdquo;.
            </span>
          </>
        }
        onClose={() => setHardDeleteProduct(null)}
        onConfirm={handleHardDeleteProduct}
      />

      {/* Confirmation Modal for Bulk Hard Delete */}
      <ModalDeleteConfirm
        open={showBulkDeleteConfirm}
        itemName={`${selectedIds.length} sản phẩm được chọn`}
        isDeleting={isBulkActionPending}
        title="Xóa vĩnh viễn hàng loạt?"
        confirmLabel="Xóa vĩnh viễn"
        description={
          <>
            Bạn có chắc chắn muốn <span style={{ color: "#ff6b6b", fontWeight: 700 }}>XÓA CỨNG VĨNH VIỄN</span> <strong style={{ color: "#E5C07B" }}>{selectedIds.length} sản phẩm</strong> đã chọn khỏi cơ sở dữ liệu?
            <span style={{ display: "block", marginTop: "8px", color: "#ff6b6b", fontWeight: 600 }}>
              ⚠️ Khuyên dùng: Nếu có bất kỳ sản phẩm nào đã có lịch sử đơn hàng, hành động xóa hàng loạt sẽ bị chặn hoàn toàn để bảo toàn dữ liệu.
            </span>
          </>
        }
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkHardDelete}
      />

      {/* Confirmation Modal for Bulk Deactivate */}
      <ModalDeleteConfirm
        open={showBulkDeactivateConfirm}
        itemName={`${selectedIds.length} sản phẩm được chọn`}
        isDeleting={isBulkActionPending}
        title="Ngừng bán hàng loạt?"
        confirmLabel="Ngừng bán"
        description={
          <>
            Bạn có chắc chắn muốn <span style={{ color: "#E5C07B", fontWeight: 700 }}>Ngừng bán</span> <strong style={{ color: "#E5C07B" }}>{selectedIds.length} sản phẩm</strong> đã chọn?
            <span style={{ display: "block", marginTop: "8px", color: "rgba(255,255,255,0.6)" }}>
              ⚠️ Lưu ý: Khi ngừng bán hàng loạt, các sản phẩm này sẽ tự động được gỡ bỏ khỏi tất cả giỏ hàng hiện tại của khách hàng.
            </span>
          </>
        }
        onClose={() => setShowBulkDeactivateConfirm(false)}
        onConfirm={handleBulkDeactivate}
      />
    </>
  );
}
