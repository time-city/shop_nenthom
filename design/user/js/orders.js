document.addEventListener('DOMContentLoaded', function() {
    authGuard();
    initProfileTabNav();
    loadOrders();
});

function authGuard() {
    const user = safeParse(localStorage.getItem('lumiere-user'));
    if (!user) {
        const redirect = encodeURIComponent(window.location.pathname.split('/').pop());
        window.location.href = `login.html?redirect=${redirect}`;
        return;
    }
}

function initProfileTabNav() {
    const tabProfile = document.getElementById('tabProfile');
    const tabOrders = document.getElementById('tabOrders');

    [tabProfile, tabOrders].forEach(tab => {
        if (!tab) return;
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            if (target) window.location.href = target;
        });
    });

    // Load avatar/name/email for both pages
    const user = safeParse(localStorage.getItem('lumiere-user')) || {};
    const profileNameEl = document.getElementById('profileName');
    const profileEmailEl = document.getElementById('profileEmail');
    const avatarEl = document.getElementById('profileAvatar');

    if (profileNameEl) profileNameEl.textContent = user.fullname || user.name || 'User';
    if (profileEmailEl) profileEmailEl.textContent = user.email || 'user@example.com';
    if (avatarEl) avatarEl.textContent = getInitials(user.fullname || user.name || 'User');
}

function loadOrders() {
    const ordersListEl = document.getElementById('ordersList');
    const emptyEl = document.getElementById('ordersEmpty');

    const orders = safeParse(localStorage.getItem('lumiere-orders'));

    // Backward compatibility: existing flow stores only one order at `lumiere-order`
    // We'll normalize to array.
    let normalized = [];
    if (Array.isArray(orders)) {
        normalized = orders;
    } else {
        const single = safeParse(localStorage.getItem('lumiere-order'));
        if (single) normalized = [single];
    }

    if (!normalized.length) {
        if (ordersListEl) ordersListEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'flex';
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    // Render newest first
    normalized.sort((a, b) => {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return db - da;
    });

    ordersListEl.innerHTML = normalized.map(order => renderOrderCard(order)).join('');
}

function renderOrderCard(order) {
    const orderNumber = order.orderNumber || ('DH' + String(Math.floor(Math.random()*1000000)).padStart(6,'0'));
    const createdAt = order.createdAt ? new Date(order.createdAt) : null;
    const dateText = createdAt ? createdAt.toLocaleDateString('vi-VN') : '';

    const status = order.status || mapPaymentMethodToDemoStatus(order.paymentMethod);
    const badgeClass = {
        processing: 'processing',
        shipping: 'shipping',
        done: 'done',
        canceled: 'canceled'
    }[status] || 'processing';

    const statusText = {
        processing: 'Đang xử lý',
        shipping: 'Đang giao',
        done: 'Đã giao',
        canceled: 'Đã hủy'
    }[status] || 'Đang xử lý';

    const total = order.total || (order.subtotal + (order.shipping || 0) + (order.tax || 0));

    const lines = (order.items || []).map(item => {
        const name = item.scent || item.name || 'Sản phẩm';
        const detailBits = [];
        if (item.size) detailBits.push(item.size);
        if (item.color) detailBits.push(item.color);
        const detail = detailBits.length ? detailBits.join(', ') : '';
        const qtyPrice = (item.price * item.quantity);
        return `
            <div class="order-line">
                <div>
                    <div class="name">${escapeHtml(name)}</div>
                    <div class="detail">${escapeHtml(detail)}</div>
                </div>
                <div class="qty-price">${escapeHtml(String(item.quantity))} x ${qtyPrice.toLocaleString('vi-VN')}đ</div>
            </div>
        `;
    }).join('');

    // Order view detail button (demo)
    return `
        <div class="order-card">
            <div class="order-header">
                <div class="order-meta-left">
                    <div class="order-id">#${escapeHtml(orderNumber)}</div>
                    <div class="order-date">${escapeHtml(dateText)}</div>
                </div>
                <div class="order-badge ${badgeClass}">${escapeHtml(statusText)}</div>
            </div>

            <div class="order-body">
                ${lines || ''}
            </div>

            <div class="order-footer">
                <button class="order-view-btn" type="button" onclick="viewOrder('${escapeAttr(orderNumber)}')">Xem Chi Tiết</button>
                <div class="order-total">
                    <div class="label">Tổng:</div>
                    <div class="amount">${escapeHtml((total || 0).toLocaleString('vi-VN'))}đ</div>
                </div>
            </div>
        </div>
    `;
}

function viewOrder(orderNumber) {
    // Simple demo: show an alert. Full modal can be added later.
    alert('Chức năng xem chi tiết sẽ được cập nhật cho từng đơn: ' + orderNumber);
}

function mapPaymentMethodToDemoStatus(paymentMethod) {
    // Since current backend-less demo doesn't keep status, map paymentMethod to a stable demo status.
    if (paymentMethod === 'cod') return 'processing';
    if (paymentMethod === 'transfer') return 'shipping';
    return 'processing';
}

function safeParse(v) {
    try {
        if (!v) return null;
        return JSON.parse(v);
    } catch {
        return null;
    }
}

function getInitials(name) {
    const s = (name || '').trim();
    if (!s) return 'CC';
    const parts = s.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/\"/g, '"')
        .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
    return String(str ?? '').replace(/'/g, "\\'");
}

