"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { useToast } from "@/src/components/ui/toastProvider";
import ModalCategory from "@/src/components/admin/category/modalCategory";
import ModalDeleteConfirm from "@/src/components/admin/common/modalDeleteConfirm";
import ModalEditCategory from "@/src/components/admin/category/modalEditCategory";
import LoadingState from "@/src/components/ui/loadingState";
import TableResponsiveWrapper from "@/src/components/admin/common/TableResponsiveWrapper";
import AdminHeader from "@/src/components/admin/layout/AdminHeader";
import {
  AdminDeleteButton,
  AdminEditButton,
} from "@/src/components/ui/actionButtons";
import type {
  AdminCategoriesSuccessResponseInterface,
  AdminProductCategoryInterface,
} from "@/src/interface/adminInterface";
import {
  bulkDeleteCategoryAction,
  deleteCategoryAction,
  getCategoriesAction,
  getBulkCategoryDeleteImpactAction,
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
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<AdminProductCategoryInterface[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeleteImpactCount, setBulkDeleteImpactCount] = useState<number | null>(null);
  const [isLoadingBulkImpact, setIsLoadingBulkImpact] = useState(false);
  const { data: fetchResult, isLoading: isSwrLoading, error: swrError, mutate: mutateCategories } = useSWR(
    ['admin-categories'],
    async () => {
      console.log("[Data Source] 🟡 NETWORK QUERY - categoryManagementClient: Fetching categories...");
      const result = await callAction(() => getCategoriesAction(), "Không thể tải danh mục. Vui lòng thử lại sau.");
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
      setCategories([]);
    } else if (fetchResult && "success" in fetchResult && fetchResult.success) {
      console.log("[Data Source] 🟢 UI UPDATED - categoryManagementClient: Displaying categories (from SWR Cache or Network)");
      const response = fetchResult as AdminCategoriesSuccessResponseInterface;
      setError("");
      setCategories(response.categories);
      const validIds = response.categories.map((c) => c.id);
      setSelectedIds((prev) => prev.filter((id) => validIds.includes(id)));
    }
  }, [fetchResult, swrError, toast]);

  const isLoading = isSwrLoading && categories.length === 0;

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
      await mutateCategories();
    }

    setIsDeleting(false);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === categories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((c) => c.id));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenBulkDeleteModal = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleteModalOpen(true);
    setBulkDeleteImpactCount(null);
    setIsLoadingBulkImpact(true);

    try {
      const result = await callAction(
        () => getBulkCategoryDeleteImpactAction({ ids: selectedIds }),
        "Không thể kiểm tra tác động. Vui lòng thử lại sau."
      );
      if ("success" in result && result.success) {
        setBulkDeleteImpactCount(result.data.productCount);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingBulkImpact(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);

    const result = await callAction(
      () => bulkDeleteCategoryAction({ ids: selectedIds }),
      "Không thể xóa các danh mục. Vui lòng thử lại sau."
    );

    if ("error" in result && result.error) {
      toast.error(getFriendlyResponseError(result.error));
      setIsBulkDeleting(false);
      return;
    }

    if ("success" in result && result.success) {
      toast.success(result.message);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      await mutateCategories();
    }
    setIsBulkDeleting(false);
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
                      <th style={{ width: "40px", paddingLeft: "1.5rem" }}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-[#6B1218] focus:ring-[#6B1218] accent-[#6B1218]"
                          checked={categories.length > 0 && selectedIds.length === categories.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className={styles.idColumn}>STT</th>
                      <th>Tên danh mục</th>
                      <th>Mô tả</th>
                      <th className="product-action-col">
                        <span className="sr-only">Thao tác</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isLoading && !error && categories.map((category, index) => {
                      const isSelected = selectedIds.includes(category.id);
                      return (
                        <tr
                          key={category.id}
                          className={`transition ${isSelected ? "bg-white/5" : ""}`}
                        >
                          <td style={{ width: "40px", paddingLeft: "1.5rem" }}>
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-[#6B1218] focus:ring-[#6B1218] accent-[#6B1218]"
                              checked={isSelected}
                              onChange={() => handleSelectOne(category.id)}
                            />
                          </td>
                          <td className={styles.idCell}>{index + 1}</td>
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
                      );
                    })}
                  </tbody>
                </table>
              </TableResponsiveWrapper>
            </div>

            {isLoading ? (
              <LoadingState type="table"
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
              <div className="px-5 py-8 text-center text-sm text-white/60">
                Chưa có danh mục nào
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <ModalCategory
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={() => { mutateCategories(); }}
      />

      <ModalEditCategory
        open={Boolean(editCategory)}
        category={editCategory}
        onClose={() => setEditCategory(null)}
        onSave={() => { mutateCategories(); }}
      />

      <ModalDeleteConfirm
        open={Boolean(deleteCategory)}
        itemName={deleteCategory?.name}
        isDeleting={isDeleting}
        title="Xóa danh mục?"
        description={
          <>
            Bạn có chắc muốn xóa{" "}
            <span style={{ color: "#E5C07B", fontWeight: 700 }}>
              {deleteCategory?.name}
            </span>
            ? Thao tác này không thể hoàn tác. Nếu xóa, các sản phẩm thuộc danh mục này cũng sẽ bị xóa theo.
            {isLoadingImpact ? (
              <span style={{ display: "block", marginTop: 6, color: "rgba(255, 255, 255, 0.6)", fontStyle: "italic" }}>
                Đang kiểm tra tác động...
              </span>
            ) : categoryImpact && categoryImpact.productCount > 0 ? (
              <span style={{ display: "block", marginTop: 6, color: "#ff6b6b", fontWeight: 600 }}>
                ⚠️ Chi tiết: {categoryImpact.productCount} sản phẩm sẽ bị ngừng bán.
              </span>
            ) : categoryImpact && categoryImpact.productCount === 0 ? (
              <span style={{ display: "block", marginTop: 6, color: "rgba(255, 255, 255, 0.6)", fontStyle: "italic" }}>
                Danh mục này hiện không có sản phẩm nào.
              </span>
            ) : null}
          </>
        }
        confirmLabel="Xóa danh mục"
        onClose={() => { setDeleteCategory(null); setCategoryImpact(null); }}
        onConfirm={handleDelete}
      />

      <ModalDeleteConfirm
        open={isBulkDeleteModalOpen}
        itemName={`${selectedIds.length} danh mục`}
        isDeleting={isBulkDeleting}
        title={`Xóa ${selectedIds.length} danh mục đã chọn?`}
        description={
          <>
            Bạn có chắc chắn muốn xóa <strong style={{ color: "#E5C07B" }}>{selectedIds.length} danh mục</strong> đã chọn?
            Thao tác này không thể hoàn tác. Các sản phẩm thuộc các danh mục này cũng sẽ bị xóa theo.
            {isLoadingBulkImpact ? (
              <span style={{ display: "block", marginTop: 6, color: "rgba(255, 255, 255, 0.6)", fontStyle: "italic" }}>
                Đang kiểm tra tác động...
              </span>
            ) : bulkDeleteImpactCount !== null && bulkDeleteImpactCount > 0 ? (
              <span style={{ display: "block", marginTop: 6, color: "#ff6b6b", fontWeight: 600 }}>
                ⚠️ Chi tiết: {bulkDeleteImpactCount} sản phẩm liên quan sẽ bị ngừng bán.
              </span>
            ) : bulkDeleteImpactCount === 0 ? (
              <span style={{ display: "block", marginTop: 6, color: "rgba(255, 255, 255, 0.6)", fontStyle: "italic" }}>
                Các danh mục này không chứa sản phẩm nào đang hoạt động.
              </span>
            ) : null}
          </>
        }
        confirmLabel="Xóa các danh mục"
        onClose={() => { setIsBulkDeleteModalOpen(false); setBulkDeleteImpactCount(null); }}
        onConfirm={handleBulkDelete}
      />

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-[#1E0608]/95 border border-[#6B1218]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md animate-fade-in"
          style={{ width: "min(90%, 600px)" }}
        >
          <div className="text-sm font-light text-[#F5F0E8]/90">
            Đang chọn <strong className="text-[#E5C07B]">{selectedIds.length}</strong> danh mục
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 text-xs font-medium rounded-xl border border-white/10 hover:bg-white/5 transition active:scale-95 text-[#F5F0E8]"
              onClick={() => setSelectedIds([])}
            >
              Hủy chọn
            </button>
            <button
              type="button"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#6B1218] hover:bg-[#8A1119] transition active:scale-95 text-white flex items-center gap-1.5 shadow-[0_4px_12px_rgba(107,18,24,0.3)]"
              onClick={handleOpenBulkDeleteModal}
            >
              🗑️ Xóa đã chọn ({selectedIds.length})
            </button>
          </div>
        </div>
      )}
    </>
  );
}
