import Link from "next/link";

const stats = [
  {
    change: "↑ 12.5%",
    changeType: "up",
    icon: "revenue",
    label: "Doanh thu",
    value: "45.680.000₫",
    svg: (
      <>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
  },
  {
    change: "↑ 8.2%",
    changeType: "up",
    icon: "orders",
    label: "Đơn hàng",
    value: "156",
    svg: (
      <>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    ),
  },
  {
    change: "↓ 3.1%",
    changeType: "down",
    icon: "customers",
    label: "Khách hàng",
    value: "89",
    svg: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    change: "↑ 15.8%",
    changeType: "up",
    icon: "products",
    label: "Sản phẩm bán được",
    value: "342",
    svg: (
      <>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </>
    ),
  },
];

const topProducts = [
  {
    name: "Nến Vanilla Dream",
    note: "Nến hũ",
    revenue: "7.200.000 đ",
    sold: 48,
  },
  {
    name: "Nến Lavender Fields",
    note: "Nến cốc",
    revenue: "5.250.000 đ",
    sold: 35,
  },
  {
    name: "Nến Ocean Breeze",
    note: "Nến trụ",
    revenue: "4.200.000 đ",
    sold: 28,
  },
  {
    name: "Nến Rose Garden",
    note: "Nến hũ",
    revenue: "3.300.000 đ",
    sold: 22,
  },
  {
    name: "Nến Sandalwood",
    note: "Nến cốc",
    revenue: "2.700.000 đ",
    sold: 18,
  },
];

const recentOrders = [
  {
    code: "DH-2024001",
    customer: "Nguyễn Thị Lan",
    status: "Hoàn thành",
    statusType: "done",
    total: "450.000 đ",
  },
  {
    code: "DH-2024002",
    customer: "Trần Văn Minh",
    status: "Đang xử lý",
    statusType: "processing",
    total: "680.000 đ",
  },
  {
    code: "DH-2024003",
    customer: "Lê Thị Hoa",
    status: "Đang giao",
    statusType: "shipping",
    total: "320.000 đ",
  },
  {
    code: "DH-2024004",
    customer: "Phạm Đức An",
    status: "Chờ xác nhận",
    statusType: "pending",
    total: "890.000 đ",
  },
  {
    code: "DH-2024005",
    customer: "Hoàng Thị Mai",
    status: "Hoàn thành",
    statusType: "done",
    total: "1.250.000 đ",
  },
];

export default function DashboardPage() {
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
              <h1 className="dashboard-page-title">Dashboard</h1>
              <p className="dashboard-page-subtitle">
                Xin chào, Admin! Đây là tổng quan hôm nay.
              </p>
            </div>
          </div>

          <div className="dashboard-top-header-right">
            <div className="dashboard-filter-chips">
              <button className="dashboard-filter-chip active" type="button">
                Hôm nay
              </button>
              <button className="dashboard-filter-chip" type="button">
                Tuần
              </button>
              <button className="dashboard-filter-chip" type="button">
                Tháng
              </button>
            </div>
            <div className="dashboard-date-picker-group">
              <input type="date" defaultValue="2024-12-01" />
              <span>đến</span>
              <input type="date" defaultValue="2024-12-05" />
            </div>
          </div>
        </header>

        <div className="dashboard-page-content">
          <section className="dashboard-stats-grid" aria-label="Dashboard stats">
            {stats.map((stat) => (
              <article className="dashboard-stat-card" key={stat.label}>
                <div className="dashboard-stat-header">
                  <div className={`dashboard-stat-icon ${stat.icon}`}>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {stat.svg}
                    </svg>
                  </div>
                  <span className={`dashboard-stat-change ${stat.changeType}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="dashboard-stat-value">{stat.value}</div>
                <div className="dashboard-stat-label">{stat.label}</div>
              </article>
            ))}
          </section>

          <section className="dashboard-grid-2">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">Top sản phẩm bán chạy</h2>
              </div>
              <div className="dashboard-card-body no-padding">
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-admin-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Sản phẩm</th>
                        <th>Đã bán</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product, index) => (
                        <tr key={product.name}>
                          <td>
                            <div className="dashboard-product-rank">
                              🕯️
                            </div>
                          </td>
                          <td>
                            <div className="dashboard-product-name">
                              {product.name}
                            </div>
                            <div className="dashboard-product-note">
                              {product.note}
                            </div>
                          </td>
                          <td>{product.sold}</td>
                          <td>{product.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h2 className="dashboard-card-title">Đơn hàng mới nhất</h2>
                <Link
                  href="/admin/ordersManagement"
                  className="dashboard-btn dashboard-btn-ghost dashboard-btn-sm"
                >
                  Xem tất cả →
                </Link>
              </div>
              <div className="dashboard-card-body no-padding">
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.code}>
                          <td>{order.code}</td>
                          <td>{order.customer}</td>
                          <td>{order.total}</td>
                          <td>
                            <span
                              className={`dashboard-status ${order.statusType}`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
    </>
  );
}
