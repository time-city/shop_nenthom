"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import ModalCategory from "@/src/components/admin/modalCategory";
import ModalDeleteConfirm from "@/src/components/admin/modalDeleteConfirm";
import ModalEditCategory from "@/src/components/admin/modalEditCategory";
import LoadingState from "@/src/components/ui/loadingState";
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
} from "@/src/lib/action/category.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import styles from "@/src/styles/adminCategoryManagement.module.css";

export default function CategoryManagementClient() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<AdminProductCategoryInterface | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<AdminProductCategoryInterface | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<AdminProductCategoryInterface[]>([]);

  const loadCategories = useCallback(async (cancelledRef?: { current: boolean }) => {
    setIsLoading(true);
    const result = await getCategoriesAction();
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
    void loadCategories(cancelled);
    return () => {
      cancelled.current = true;
    };
  }, [loadCategories]);

  const handleDelete = async () => {
    if (!deleteCategory) return;
    setIsDeleting(true);

    const result = await deleteCategoryAction({ id: deleteCategory.id });

    if ("error" in result && result.error) {
      toast.error(getFriendlyResponseError(result.error));
      setIsDeleting(false);
      return;
    }

    if ("success" in result && result.success) {
      toast.success("Đã xóa danh mục");
      setDeleteCategory(null);
      await loadCategories();
    }

    setIsDeleting(false);
  };

  return (
    <>
      <header className="dashboard-top-header">
        <div className="dashboard-top-header-left">
          <button
            className="dashboard-mobile-toggle"
            type="button"
            aria-label="Menu"
            onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
          >
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
            <h1 className="dashboard-page-title">Quản lý Danh mục</h1>
            <p className="dashboard-page-subtitle">
              Danh sách các loại sản phẩm của cửa hàng
            </p>
          </div>
        </div>

        <div className="dashboard-top-header-right">
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
            Thêm danh mục
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
                    <th className={styles.idColumn}>ID</th>
                    <th>Tên danh mục</th>
                    <th>Mô tả</th>
                    <th className="product-action-col">
                      <span className="sr-only">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading && !error && categories.map((category) => (
                    <tr
                      key={category.id}
                      className="transition hover:bg-[#6B1218]/[0.03]"
                    >
                      <td className={styles.idCell}>#{category.id}</td>
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
                            onClick={() => setDeleteCategory(category)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        confirmLabel="Xóa danh mục"
        onClose={() => setDeleteCategory(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
