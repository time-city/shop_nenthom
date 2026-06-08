"use client";

import { useState } from "react";
import ModalDeleteProduct from "../../../components/admin/modalDeleteProduct";
import ModalProduct from "../../../components/admin/modalProduct";

const products = [
  {
    id: "SP001",
    name: "Nến Vanilla Dream",
    category: "Nến hũ",
    price: "180.000 đ",
    status: "Đang bán",
    statusType: "completed",
  },
  {
    id: "SP002",
    name: "Nến Lavender Fields",
    category: "Nến cốc",
    price: "150.000 đ",
    status: "Đang bán",
    statusType: "completed",
  },
  {
    id: "SP003",
    name: "Nến Ocean Breeze",
    category: "Nến trụ",
    price: "210.000 đ",
    status: "Ẩn",
    statusType: "pending",
  },
  {
    id: "SP004",
    name: "Nến Rose Garden",
    category: "Nến hũ",
    price: "195.000 đ",
    status: "Đang bán",
    statusType: "completed",
  },
  {
    id: "SP005",
    name: "Nến Sandalwood",
    category: "Nến cốc",
    price: "230.000 đ",
    status: "Hết hàng",
    statusType: "cancelled",
  },
];

export default function ProductManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteProductName, setDeleteProductName] = useState("");

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
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-table-thumb" aria-hidden="true">
                          <span />
                        </div>
                      </td>
                      <td>
                        <div className="dashboard-product-name">{product.name}</div>
                        <div className="dashboard-product-note">{product.id}</div>
                      </td>
                      <td>{product.category}</td>
                      <td className="orders-table-amount">{product.price}</td>
                      <td>
                        <span className={`dashboard-status ${product.statusType}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <div className="product-row-actions">
                          <button
                            className="orders-icon-btn"
                            type="button"
                            aria-label={`Sửa ${product.name}`}
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
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                            </svg>
                          </button>
                          <button
                            className="orders-icon-btn product-danger-btn"
                            type="button"
                            aria-label={`Xóa ${product.name}`}
                            onClick={() => setDeleteProductName(product.name)}
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
          </div>
        </section>
      </div>

      <ModalProduct open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ModalDeleteProduct
        open={Boolean(deleteProductName)}
        productName={deleteProductName}
        onClose={() => setDeleteProductName("")}
      />
    </>
  );
}
