"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ModalCategory from "../../../components/admin/modalCategory";
import ModalDeleteConfirm from "../../../components/admin/modalDeleteConfirm";
import ModalEditCategory from "../../../components/admin/modalEditCategory";
import type {
  AdminCategoriesSuccessResponseInterface,
  AdminProductCategoryInterface,
} from "../../../interface/adminInterface";
import {
  deleteCategoryAction,
  getCategoriesAction,
} from "../../../lib/action/category.action";
import styles from "../../../styles/adminCategoryManagement.module.css";

export default function CategoryManagementPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<AdminProductCategoryInterface | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<AdminProductCategoryInterface | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<AdminProductCategoryInterface[]>([]);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    const result = await getCategoriesAction();

    if ("error" in result && result.error) {
      setError(result.error);
      toast.error(result.error);
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
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleDelete = async () => {
    if (!deleteCategory) return;
    setIsDeleting(true);

    const result = await deleteCategoryAction({ id: deleteCategory.id });

    if ("error" in result && result.error) {
      toast.error(result.error);
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
                  {categories.map((category) => (
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
                          <button
                            className="orders-icon-btn"
                            type="button"
                            aria-label={`Sửa ${category.name}`}
                            onClick={() => setEditCategory(category)}
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
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                            </svg>
                          </button>
                          <button
                            className="orders-icon-btn product-danger-btn"
                            type="button"
                            aria-label={`Xóa ${category.name}`}
                            onClick={() => setDeleteCategory(category)}
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
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isLoading ? (
              <div className="px-5 py-8 text-center text-sm text-[#6B4C35]">
                Đang tải danh sách danh mục...
              </div>
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
