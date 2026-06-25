"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import ModalCategory from "@/src/components/admin/modalCategory";
import ModalDeleteConfirm from "@/src/components/admin/modalDeleteConfirm";
import ModalEditCategory from "@/src/components/admin/modalEditCategory";
import LoadingState from "@/src/components/ui/loadingState";
import TableResponsiveWrapper from "@/src/components/admin/TableResponsiveWrapper";
import AdminHeader from "./AdminHeader";
import {
  AdminDeleteButton,
  AdminEditButton,
} from "@/src/components/ui/actionButtons";
import type {
  AdminCategoriesSuccessResponseInterface,
  AdminProductCategoryInterface,
} from "@/src/interface/adminInterface";
import {
  deleteCategoryAction,
  getCategoriesAction,
  getCategoryDeleteImpactAction,
} from "@/src/lib/action/category.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import styles from "@/src/styles/adminCategoryManagement.module.css";
import { callAction } from "@/src/lib/utils/callAction";

type CategoryImpact = {
  categoryId: number;
  categoryName: string;
  productCount: number;
  products: { id: string; name: string }[];
};

export default function CategoryManagementClient() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<AdminProductCategoryInterface | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<AdminProductCategoryInterface | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingImpact, setIsLoadingImpact] = useState(false);
  const [categoryImpact, setCategoryImpact] = useState<CategoryImpact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<AdminProductCategoryInterface[]>([]);

  const loadCategories = useCallback(async (cancelledRef?: { current: boolean }) => {
    setIsLoading(true);
    const result = await callAction(() => getCategoriesAction(), "Không thể tải danh mục. Vui lòng thử lại sau.");
    if (cancelledRef?.current) return;

    if ("error" in result && result.error) {
      const friendlyErr = getFriendlyResponseError(result.error);
      setError(friendlyErr);
      toast.error(friendlyErr);
      setCategories([]);
      setIsLoading(false);
      return;
    }

    if ("success" in result && result.success) {
      const response = result as AdminCategoriesSuccessResponseInterface;
      setError("");
      setCategories(response.categories);
    }

    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    const cancelled = { current: false };
    startTransition(() => {
      void loadCategories(cancelled);
    });
    return () => {
      cancelled.current = true;
    };
  }, [loadCategories]);

  const handleDelete = async () => {
    if (!deleteCategory) return;
    setIsDeleting(true);

    const result = await callAction(() => deleteCategoryAction({ id: deleteCategory.id }), "Không thể xóa danh mục. Vui lòng thử lại sau.");

    if ("error" in result && result.error) {
      toast.error(getFriendlyResponseError(result.error));
      setIsDeleting(false);
      return;
    }

    if ("success" in result && result.success) {
      const data = result.data as { stoppedProductCount?: number } | undefined;
      const stoppedCount = data?.stoppedProductCount ?? 0;
      const msg = stoppedCount > 0
        ? `Đã xóa danh mục "${deleteCategory.name}" và ngừng bán ${stoppedCount} sản phẩm liên quan.`
        : `Đã xóa danh mục "${deleteCategory.name}".`;
      toast.success(msg);
      setDeleteCategory(null);
      setCategoryImpact(null);
      await loadCategories();
    }

    setIsDeleting(false);
  };

  const handleOpenDeleteModal = async (category: AdminProductCategoryInterface) => {
    setDeleteCategory(category);
    setCategoryImpact(null);
    setIsLoadingImpact(true);

    try {
      const result = await callAction(
        () => getCategoryDeleteImpactAction({ id: category.id }),
        "Không thể kiểm tra danh mục. Vui lòng thử lại sau."
      );
      if ("success" in result && result.success) {
        const data = (result as { success: true; data: CategoryImpact }).data;
        setCategoryImpact(data);
      }
    } catch {
      // Ignore impact load error, still allow delete
    } finally {
      setIsLoadingImpact(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Quản lý Danh mục"
        subtitle="Danh sách các loại sản phẩm của cửa hàng"
      >
        <button
          className="product-btn product-btn-primary"
          type="button"
          onClick={() => setIsAddModalOpen(true)}
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
          <span className="hidden sm:inline">Thêm danh mục</span>
        </button>
      </AdminHeader>

      <div className="dashboard-page-content">
        <section className="dashboard-card product-table-card">
          <div className="dashboard-card-body no-padding">
            <div className="dashboard-table-wrapper">
              <TableResponsiveWrapper minWidth={800}>
                <table className="dashboard-admin-table product-admin-table">
                  <thead>
                    <tr>
                      <th className={styles.idColumn}>ID</th>
                      <th>Tên danh mục</th>
                      <th>Mô tả</th>
                      <th className="product-action-col">
                        <span className="sr-only">Thao tác</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isLoading && !error && categories.map((category, index) => (
                      <tr
                        key={category.id}
                        className="transition hover:bg-[#6B1218]/[0.03]"
                      >
                        <td className={styles.idCell}>#{index + 1}</td>
                        <td>
                          <div className={`dashboard-product-name ${styles.categoryName}`}>
                            {category.name}
                          </div>
                        </td>
                        <td className={styles.descriptionCell}>
                          {category.description || "Chưa có mô tả"}
                        </td>
                        <td>
                          <div className="product-row-actions">
                            <AdminEditButton
                              ariaLabel={`Sửa ${category.name}`}
                              onClick={() => setEditCategory(category)}
                            />
                            <AdminDeleteButton
                              ariaLabel={`Xóa ${category.name}`}
                              onClick={() => void handleOpenDeleteModal(category)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableResponsiveWrapper>
            </div>

            {isLoading ? (
              <LoadingState
                label="Đang tải danh sách danh mục..."
                className="m-5"
              />
            ) : null}
            {!isLoading && error ? (
              <div className="px-5 py-8 text-center text-sm text-[#8A1119]">
                {error}
              </div>
            ) : null}
            {!isLoading && !error && categories.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#6B4C35]">
                Chưa có danh mục nào
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <ModalCategory
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={loadCategories}
      />

      <ModalEditCategory
        open={Boolean(editCategory)}
        category={editCategory}
        onClose={() => setEditCategory(null)}
        onSave={loadCategories}
      />

      <ModalDeleteConfirm
        open={Boolean(deleteCategory)}
        itemName={deleteCategory?.name}
        isDeleting={isDeleting}
        title="Xóa danh mục?"
        description={
          <>
            Bạn có chắc muốn xóa{" "}
            <span style={{ color: "#6b1218", fontWeight: 700 }}>
              {deleteCategory?.name}
            </span>
            ? Thao tác này không thể hoàn tác. Nếu xóa, các sản phẩm thuộc danh mục này cũng sẽ bị xóa theo.
            {isLoadingImpact ? (
              <span style={{ display: "block", marginTop: 6, color: "#6B4C35", fontStyle: "italic" }}>
                Đang kiểm tra tác động...
              </span>
            ) : categoryImpact && categoryImpact.productCount > 0 ? (
              <span style={{ display: "block", marginTop: 6, color: "#B91C1C", fontWeight: 600 }}>
                ⚠️ Chi tiết: {categoryImpact.productCount} sản phẩm sẽ bị ngừng bán.
              </span>
            ) : categoryImpact && categoryImpact.productCount === 0 ? (
              <span style={{ display: "block", marginTop: 6, color: "#6B4C35", fontStyle: "italic" }}>
                Danh mục này hiện không có sản phẩm nào.
              </span>
            ) : null}
          </>
        }
        confirmLabel="Xóa danh mục"
        onClose={() => { setDeleteCategory(null); setCategoryImpact(null); }}
        onConfirm={handleDelete}
      />
    </>
  );
}
