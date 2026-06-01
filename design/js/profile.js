document.addEventListener('DOMContentLoaded', function() {
    authGuard();
    initProfileTabNav();
    loadUserProfile();


    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfile();
        });
    }

    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            alert('Chức năng đổi mật khẩu sẽ được cập nhật ở phiên bản tiếp theo.');
        });
    }
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
}

function loadUserProfile() {
    const user = safeParse(localStorage.getItem('lumiere-user')) || {};

    const fullnameEl = document.getElementById('fullname');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    const addressEl = document.getElementById('address');
    const cityEl = document.getElementById('city');
    const zipEl = document.getElementById('zip');

    const profileNameEl = document.getElementById('profileName');
    const profileEmailEl = document.getElementById('profileEmail');
    const avatarEl = document.getElementById('profileAvatar');

    if (profileNameEl) profileNameEl.textContent = user.fullname || user.name || 'User';
    if (profileEmailEl) profileEmailEl.textContent = user.email || 'user@example.com';
    if (avatarEl) avatarEl.textContent = getInitials(user.fullname || user.name || 'User');

    if (fullnameEl) fullnameEl.value = user.fullname || user.name || '';
    if (emailEl) emailEl.value = user.email || '';

    if (phoneEl) phoneEl.value = user.phone || '';
    if (addressEl) addressEl.value = user.address || '';
    if (cityEl) cityEl.value = user.city || '';
    if (zipEl) zipEl.value = user.zip || '';
}

function saveProfile() {
    const user = safeParse(localStorage.getItem('lumiere-user')) || {};

    const fullname = document.getElementById('fullname')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const phone = document.getElementById('phone')?.value?.trim();
    const address = document.getElementById('address')?.value?.trim();
    const city = document.getElementById('city')?.value?.trim();
    const zip = document.getElementById('zip')?.value?.trim();

    if (!fullname || !email || !phone || !address || !city || !zip) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
        return;
    }

    const updated = {
        ...user,
        fullname,
        email,
        phone,
        address,
        city,
        zip
    };

    localStorage.setItem('lumiere-user', JSON.stringify(updated));
    showToast('Đã lưu thay đổi');

    // keep header display in sync
    loadUserProfile();
}

function showToast(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const toastSpan = toast.querySelector('span:last-child');
    if (toastSpan) toastSpan.textContent = text;

    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 3000);
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

