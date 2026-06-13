"use client";

import { type MouseEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ModalDeleteConfirm from "../../../components/admin/modalDeleteConfirm";
import ModalEditProduct from "../../../components/admin/modalEditProduct";
import ModalProduct from "../../../components/admin/modalProduct";
import LoadingState from "../../../components/ui/loadingState";
import {
  AdminDeleteButton,
  AdminEditButton,
} from "../../../components/ui/actionButtons";
import type {
  AdminProductListItemInterface,
  AdminProductsSuccessResponseInterface,
} from "../../../interface/adminInterface";
import {
  deleteProductAction,
  getProductsAction,
} from "../../../lib/action/product.action";
import type { AdminProductRow } from "../../../lib/types/admin";

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

export default function ProductManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] =
    useState<AdminProductListItemInterface | null>(null);
  const [deleteProduct, setDeleteProduct] =
    useState<AdminProductListItemInterface | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [products, setProducts] = useState<AdminProductListItemInterface[]>([]);

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);

    // action-(lấy danh sách sản phẩm admin)
    const result = await getProductsAction({ limit: 100, page: 1 });

    if ("error" in result && result.error) {
      setProductError(result.error);
      toast.error(result.error);
      setProducts([]);
      setIsLoadingProducts(false);
      return;
    }

    if ("success" in result && result.success) {
      const productResult = result as AdminProductsSuccessResponseInterface;
      setProductError("");
      setProducts(productResult.data);
    }

    setIsLoadingProducts(false);
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const stopRowClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const handleDeleteProduct = async () => {
    if (!deleteProduct) return;

    setIsDeletingProduct(true);

    // action-(xóa sản phẩm)
    const result = await deleteProductAction({ id: deleteProduct.id });

    if ("error" in result && result.error) {
      toast.error(result.error);
      setIsDeletingProduct(false);
      return;
    }

    if ("success" in result && result.success) {
      toast.success("Đã xóa sản phẩm");
      setDeleteProduct(null);
      await loadProducts();
    }

    setIsDeletingProduct(false);
  };

  return (
    <>
      <header className="dashboard-top-header">
        <div className="dashboard-top-header-left">
          <button className="dashboard-mobile-toggle" type="button" aria-label="Menu">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <h1 className="dashboard-page-title">Quản lý Sản phẩm</h1>
            <p className="dashboard-page-subtitle">
              Danh sách sản phẩm gốc của cửa hàng
            </p>
          </div>
        </div>

        <div className="dashboard-top-header-right">
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
            Thêm sản phẩm
          </button>
        </div>
      </header>

      <div className="dashboard-page-content">
        <section className="dashboard-card product-table-card">
          <div className="dashboard-card-body no-padding">
            <div className="dashboard-table-wrapper">
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
                            <span />
                          </div>
                        </td>
                        <td>
                          <div className="dashboard-product-name">
                            {productRow.name}
                          </div>
                          <div className="dashboard-product-note">
                            {productRow.id}
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
                                setDeleteProduct(product);
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {isLoadingProducts ? (
              <LoadingState
                label="Đang tải danh sách sản phẩm..."
                className="m-5"
              />
            ) : null}
            {!isLoadingProducts && productError ? (
              <div className="px-5 py-8 text-center text-sm text-[#8A1119]">
                {productError}
              </div>
            ) : null}
            {!isLoadingProducts && !productError && products.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#6B4C35]">
                Chưa có sản phẩm nào
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <ModalProduct
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={loadProducts}
      />
      <ModalEditProduct
        open={Boolean(editProduct)}
        product={editProduct}
        onClose={() => setEditProduct(null)}
        onSave={loadProducts}
      />
      <ModalDeleteConfirm
        open={Boolean(deleteProduct)}
        productName={deleteProduct?.name}
        isDeleting={isDeletingProduct}
        title="Xóa sản phẩm?"
        confirmLabel="Xóa sản phẩm"
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDeleteProduct}
      />
    </>
  );
}
