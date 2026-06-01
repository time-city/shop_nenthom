/* ============================================
   ChamCham Admin — Core JavaScript
   ============================================ */

// ── Auth Check ──
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('lumiere-user') || 'null');
    if (!user || user.role !== 'admin') {
        window.location.href = '../user/login.html?redirect=' + encodeURIComponent(window.location.href);
        return null;
    }
    return user;
}

// ── Sidebar ──
function initSidebar() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.sidebar-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });

    // Mobile toggle
    const toggle = document.querySelector('.mobile-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

// ── Modal ──
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });
}

// ── Tabs ──
function initTabs() {
    document.querySelectorAll('.tabs').forEach(tabContainer => {
        const buttons = tabContainer.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                // Deactivate all
                buttons.forEach(b => b.classList.remove('active'));
                tabContainer.parentElement.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                // Activate clicked
                btn.classList.add('active');
                const panel = document.getElementById(target);
                if (panel) panel.classList.add('active');
            });
        });
    });
}

// ── Toast Notifications ──
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: '✓',
        warning: '⚠',
        error: '✕',
        info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || '•'}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ── Format Currency ──
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Logout ──
function logout() {
    localStorage.removeItem('lumiere-user');
    window.location.href = '../user/login.html';
}

// ── Mock Data ──
const MOCK_DATA = {
    stats: {
        revenue: 45680000,
        revenueChange: 12.5,
        orders: 156,
        ordersChange: 8.2,
        customers: 89,
        customersChange: -3.1,
        productsSold: 342,
        productsSoldChange: 15.8
    },

    topProducts: [
        { name: 'Nến Vanilla Dream', category: 'Nến hũ', sold: 48, revenue: 7200000, img: '🕯️' },
        { name: 'Nến Lavender Fields', category: 'Nến cốc', sold: 35, revenue: 5250000, img: '🕯️' },
        { name: 'Nến Ocean Breeze', category: 'Nến trụ', sold: 28, revenue: 4200000, img: '🕯️' },
        { name: 'Nến Rose Garden', category: 'Nến hũ', sold: 22, revenue: 3300000, img: '🕯️' },
        { name: 'Nến Sandalwood', category: 'Nến cốc', sold: 18, revenue: 2700000, img: '🕯️' }
    ],

    orders: [
        { id: 'DH-2024001', date: '2024-12-01T10:30:00', customer: 'Nguyễn Thị Lan', total: 450000, status: 'completed', payment: 'paid' },
        { id: 'DH-2024002', date: '2024-12-01T14:20:00', customer: 'Trần Văn Minh', total: 680000, status: 'processing', payment: 'paid' },
        { id: 'DH-2024003', date: '2024-12-02T09:15:00', customer: 'Lê Thị Hoa', total: 320000, status: 'shipping', payment: 'paid' },
        { id: 'DH-2024004', date: '2024-12-02T16:45:00', customer: 'Phạm Đức An', total: 890000, status: 'pending', payment: 'unpaid' },
        { id: 'DH-2024005', date: '2024-12-03T08:00:00', customer: 'Hoàng Thị Mai', total: 1250000, status: 'completed', payment: 'paid' },
        { id: 'DH-2024006', date: '2024-12-03T11:30:00', customer: 'Vũ Quốc Bảo', total: 550000, status: 'cancelled', payment: 'refunded' },
        { id: 'DH-2024007', date: '2024-12-04T13:20:00', customer: 'Đỗ Thanh Hà', total: 730000, status: 'shipping', payment: 'paid' },
        { id: 'DH-2024008', date: '2024-12-04T15:00:00', customer: 'Bùi Minh Tuấn', total: 420000, status: 'processing', payment: 'paid' },
        { id: 'DH-2024009', date: '2024-12-05T09:45:00', customer: 'Ngô Thị Yến', total: 960000, status: 'completed', payment: 'paid' },
        { id: 'DH-2024010', date: '2024-12-05T17:10:00', customer: 'Lý Văn Hùng', total: 1100000, status: 'pending', payment: 'unpaid' }
    ],

    orderDetail: {
        id: 'DH-2024002',
        date: '2024-12-01T14:20:00',
        customer: {
            name: 'Trần Văn Minh',
            phone: '0987654321',
            email: 'minh.tran@email.com',
            address: '123 Nguyễn Huệ, Quận 1, TP.HCM'
        },
        payment: 'Chuyển khoản ngân hàng',
        items: [
            { name: 'Nến Vanilla Dream', scent: 'Vanilla & Musk', color: '#F5E6D3', colorName: 'Kem nhạt', size: 'Lớn (300g)', topping: 'Hoa khô lavender', qty: 2, price: 180000 },
            { name: 'Nến Lavender Fields', scent: 'Lavender & Chamomile', color: '#D4B0E0', colorName: 'Tím nhạt', size: 'Vừa (200g)', topping: 'Không', qty: 1, price: 150000 },
            { name: 'Nến Custom', scent: 'Rose & Oud', color: '#E8C4C4', colorName: 'Hồng pastel', size: 'Nhỏ (100g)', topping: 'Quế + Hoa hồng khô', qty: 1, price: 170000 }
        ],
        timeline: [
            { time: '2024-12-01T14:20:00', status: 'Đơn hàng được tạo', user: 'Khách hàng', note: 'Đặt hàng qua website' },
            { time: '2024-12-01T15:00:00', status: 'Xác nhận đơn hàng', user: 'Admin Hà', note: 'Đã kiểm tra thông tin và xác nhận' },
            { time: '2024-12-02T09:30:00', status: 'Đang chế tác', user: 'Admin Hà', note: 'Bắt đầu đổ nến và chuẩn bị nguyên liệu' },
            { time: '2024-12-03T14:00:00', status: 'Đang giao hàng', user: 'Admin Hà', note: 'Đã giao cho GHTK, mã vận đơn: GHK12345' }
        ],
        status: 'shipping',
        total: 680000
    },

    products: [
        { id: 1, name: 'Nến Vanilla Dream', category: 'Nến hũ', price: 180000, active: true, img: '🕯️' },
        { id: 2, name: 'Nến Lavender Fields', category: 'Nến cốc', price: 150000, active: true, img: '🕯️' },
        { id: 3, name: 'Nến Ocean Breeze', category: 'Nến trụ', price: 200000, active: true, img: '🕯️' },
        { id: 4, name: 'Nến Rose Garden', category: 'Nến hũ', price: 165000, active: false, img: '🕯️' },
        { id: 5, name: 'Nến Sandalwood Nights', category: 'Nến cốc', price: 190000, active: true, img: '🕯️' },
        { id: 6, name: 'Nến Citrus Burst', category: 'Nến hũ', price: 145000, active: true, img: '🕯️' }
    ],

    materials: {
        scents: [
            { id: 1, name: 'Vanilla & Musk', price: 15000 },
            { id: 2, name: 'Lavender & Chamomile', price: 18000 },
            { id: 3, name: 'Rose & Oud', price: 22000 },
            { id: 4, name: 'Sandalwood & Cedar', price: 20000 },
            { id: 5, name: 'Ocean Breeze', price: 16000 },
            { id: 6, name: 'Citrus & Bergamot', price: 14000 }
        ],
        colors: [
            { id: 1, name: 'Trắng ngà', hex: '#FFFDF5', price: 0 },
            { id: 2, name: 'Kem nhạt', hex: '#F5E6D3', price: 5000 },
            { id: 3, name: 'Hồng pastel', hex: '#E8C4C4', price: 8000 },
            { id: 4, name: 'Tím nhạt', hex: '#D4B0E0', price: 8000 },
            { id: 5, name: 'Xanh mint', hex: '#B8E0D2', price: 8000 },
            { id: 6, name: 'Vàng mật ong', hex: '#E8C97A', price: 6000 }
        ],
        sizes: [
            { id: 1, name: 'Nhỏ (100g)', price: 0 },
            { id: 2, name: 'Vừa (200g)', price: 30000 },
            { id: 3, name: 'Lớn (300g)', price: 60000 },
            { id: 4, name: 'XL (500g)', price: 100000 }
        ],
        toppings: [
            { id: 1, name: 'Hoa khô lavender', price: 12000, inStock: true },
            { id: 2, name: 'Quế thanh', price: 8000, inStock: true },
            { id: 3, name: 'Hoa hồng khô', price: 15000, inStock: true },
            { id: 4, name: 'Vỏ cam sấy', price: 10000, inStock: false },
            { id: 5, name: 'Hạt cà phê', price: 7000, inStock: true },
            { id: 6, name: 'Lá bạc hà khô', price: 9000, inStock: true }
        ],
        types: [
            { id: 1, name: 'Nến hũ', price: 20000 },
            { id: 2, name: 'Nến cốc', price: 15000 },
            { id: 3, name: 'Nến trụ', price: 25000 },
            { id: 4, name: 'Nến tealight', price: 5000 },
            { id: 5, name: 'Nến nổi', price: 18000 }
        ]
    },

    coupons: [
        { id: 1, code: 'WELCOME10', type: 'percent', value: 10, used: 45, max: 100, expiry: '2025-03-31' },
        { id: 2, code: 'FREESHIP', type: 'fixed', value: 30000, used: 78, max: 200, expiry: '2025-02-28' },
        { id: 3, code: 'TET2025', type: 'percent', value: 20, used: 12, max: 50, expiry: '2025-02-15' },
        { id: 4, code: 'VIP50K', type: 'fixed', value: 50000, used: 5, max: 20, expiry: '2025-06-30' },
        { id: 5, code: 'CHAMCHAM15', type: 'percent', value: 15, used: 30, max: 80, expiry: '2025-04-30' }
    ],

    contacts: [
        { id: 1, date: '2024-12-05T10:30:00', name: 'Nguyễn Thị Lan', email: 'lan.nguyen@email.com', subject: 'Hỏi về thời gian giao hàng', status: 'unread', message: 'Chào shop, mình muốn hỏi về thời gian giao hàng cho đơn hàng DH-2024001. Mình đặt hàng từ ngày 1/12 nhưng chưa nhận được hàng. Mong shop phản hồi sớm ạ. Cảm ơn shop!' },
        { id: 2, date: '2024-12-04T15:20:00', name: 'Trần Minh Đức', email: 'duc.tran@email.com', subject: 'Yêu cầu đổi sản phẩm', status: 'replied', message: 'Mình nhận được nến nhưng mùi hương không đúng như mình chọn. Mình đặt hương Vanilla & Musk nhưng nhận được hương Lavender. Mong shop đổi lại giúp mình nhé!' },
        { id: 3, date: '2024-12-04T09:00:00', name: 'Lê Hoàng Anh', email: 'anh.le@email.com', subject: 'Hỏi giá sỉ', status: 'unread', message: 'Shop ơi, mình muốn lấy sỉ nến thơm để bán lại. Shop có chính sách giá sỉ không ạ? Số lượng khoảng 50-100 cây/tháng. Mong shop báo giá.' },
        { id: 4, date: '2024-12-03T18:45:00', name: 'Phạm Thu Hà', email: 'ha.pham@email.com', subject: 'Feedback sản phẩm', status: 'replied', message: 'Mình rất thích nến của shop! Mùi hương rất tự nhiên và thời gian cháy lâu. Sẽ ủng hộ shop dài dài ạ 😍' },
        { id: 5, date: '2024-12-02T12:00:00', name: 'Hoàng Văn Nam', email: 'nam.hoang@email.com', subject: 'Hủy đơn hàng', status: 'unread', message: 'Mình muốn hủy đơn hàng DH-2024010 vì mình đặt nhầm. Mong shop xử lý giúp. Cảm ơn!' }
    ]
};

// ── Status Helpers ──
function getOrderStatusBadge(status) {
    const map = {
        'pending':    { label: 'Chờ xác nhận', class: 'badge-warning badge-dot' },
        'processing': { label: 'Đang xử lý', class: 'badge-info badge-dot' },
        'shipping':   { label: 'Đang giao', class: 'badge-primary badge-dot' },
        'completed':  { label: 'Hoàn thành', class: 'badge-success badge-dot' },
        'cancelled':  { label: 'Đã hủy', class: 'badge-danger badge-dot' }
    };
    const s = map[status] || { label: status, class: 'badge-neutral' };
    return `<span class="badge ${s.class}">${s.label}</span>`;
}

function getPaymentStatusBadge(status) {
    const map = {
        'paid':     { label: 'Đã thanh toán', class: 'badge-success' },
        'unpaid':   { label: 'Chưa thanh toán', class: 'badge-warning' },
        'refunded': { label: 'Đã hoàn tiền', class: 'badge-neutral' }
    };
    const s = map[status] || { label: status, class: 'badge-neutral' };
    return `<span class="badge ${s.class}">${s.label}</span>`;
}

function getContactStatusBadge(status) {
    const map = {
        'unread':  { label: 'Chưa phản hồi', class: 'badge-warning badge-dot' },
        'replied': { label: 'Đã phản hồi', class: 'badge-success badge-dot' }
    };
    const s = map[status] || { label: status, class: 'badge-neutral' };
    return `<span class="badge ${s.class}">${s.label}</span>`;
}

// ── Sidebar Template ──
function renderSidebar(activePage) {
    return `
    <aside class="sidebar">
        <div class="sidebar-header">
            <img src="images/logo.svg" alt="ChamCham" class="sidebar-logo">
            <div class="sidebar-brand">
                <span class="sidebar-brand-name">ChamCham</span>
                <span class="sidebar-brand-sub">Admin Panel</span>
            </div>
        </div>
        <nav class="sidebar-nav">
            <div class="sidebar-section">
                <div class="sidebar-section-title">Tổng quan</div>
                <a href="dashboard.html" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                    Dashboard
                </a>
            </div>
            <div class="sidebar-section">
                <div class="sidebar-section-title">Quản lý</div>
                <a href="orders.html" class="sidebar-link ${activePage === 'orders' ? 'active' : ''}">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    Đơn hàng
                    <span class="sidebar-badge">3</span>
                </a>
                <a href="products.html" class="sidebar-link ${activePage === 'products' ? 'active' : ''}">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    Sản phẩm
                </a>
                <a href="materials.html" class="sidebar-link ${activePage === 'materials' ? 'active' : ''}">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    Kho nguyên liệu
                </a>
                <a href="coupons.html" class="sidebar-link ${activePage === 'coupons' ? 'active' : ''}">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    Mã giảm giá
                </a>
            </div>
            <div class="sidebar-section">
                <div class="sidebar-section-title">Khác</div>
                <a href="support.html" class="sidebar-link ${activePage === 'support' ? 'active' : ''}">
                    <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Hỗ trợ
                    <span class="sidebar-badge">3</span>
                </a>
            </div>
        </nav>
        <div class="sidebar-footer">
            <div class="sidebar-user">
                <div class="sidebar-avatar">AD</div>
                <div class="sidebar-user-info">
                    <div class="sidebar-user-name">Admin ChamCham</div>
                    <div class="sidebar-user-role">Quản trị viên</div>
                </div>
            </div>
            <button class="sidebar-logout" onclick="logout()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Đăng xuất
            </button>
        </div>
    </aside>`;
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initModals();
    initTabs();
});
