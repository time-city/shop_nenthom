// Load HTML components
async function loadComponent(componentPath, targetSelector) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
        const html = await response.text();
        document.querySelector(targetSelector).innerHTML = html;
    } catch (error) {
        console.error('Component loading error:', error);
    }
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

function initUserNav() {
    const userMenuEl = document.querySelector('.user-menu');
    if (!userMenuEl) return;

    const user = safeParse(localStorage.getItem('lumiere-user'));
    const dropdownId = 'user-dropdown';

    const renderUnauth = () => {
        userMenuEl.innerHTML = `
            <button class="user-avatar-btn" aria-label="User">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="user-dropdown" id="${dropdownId}">
                <div class="user-dropdown-header">
                    <div class="user-dropdown-welcome">Chào mừng đến ChamCham</div>
                    <a class="user-pill login" href="login.html">Đăng Nhập</a>
                </div>
                <a class="user-pill register" href="register.html">Đăng Ký</a>
            </div>
        `;

        // Keep dropdown hidden/show purely by CSS hover
        // (no further JS needed)
    };

    const renderAuth = (userObj) => {
        const fullname = userObj?.fullname || userObj?.name || 'User';
        const email = userObj?.email || 'user@example.com';
        const initials = getInitials(fullname);
        const avatarUrl = userObj?.avatar || userObj?.avatarUrl || userObj?.image;

        userMenuEl.innerHTML = `
            <button class="user-avatar-btn" aria-label="User menu">
                <div class="user-avatar">
                    ${avatarUrl ? `<img src="${avatarUrl}" alt="${fullname}" />` : `${initials}`}
                </div>
            </button>
            <div class="user-dropdown" id="${dropdownId}">
                <div class="user-dropdown-auth">
                    <div class="user-dropdown-auth-top">
                        <div class="user-dropdown-avatar-large">
                            ${avatarUrl ? `<img src="${avatarUrl}" alt="${fullname}" />` : `${initials}`}
                        </div>
                        <div>
                            <p class="user-dropdown-fullname">${fullname}</p>
                            <div class="user-dropdown-email">${email}</div>
                            <div class="user-badge">THÀNH VIÊN</div>
                        </div>
                    </div>
                </div>
                <div class="user-divider"></div>
                <div class="user-dropdown-menu">
                    <a class="user-dropdown-item" href="profile.html">
                        <span class="icon">👤</span>
                        <span>Thông Tin Cá Nhân</span>
                    </a>
                    <a class="user-dropdown-item" href="orders.html">
                        <span class="icon">📦</span>
                        <span>Lịch Sử Đơn Hàng</span>
                    </a>
                    <div class="user-logout">
                        <button class="user-logout-btn" type="button">
                            <span class="icon">🚪</span>
                            <span>Đăng Xuất</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const logoutBtn = userMenuEl.querySelector('.user-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('lumiere-user');
                window.location.href = 'index.html';
                // force reload to re-render navbar state
                setTimeout(() => window.location.reload(), 0);
            });
        }
    };

    if (!user) {
        renderUnauth();
    } else {
        renderAuth(user);
    }
}

// Initialize user nav after navbar injection
function initUserNavAfterNavbarLoad() {
    // navbar is injected by loadComponent; ensure we run after it exists
    setTimeout(() => initUserNav(), 0);
}

// Initialize all components on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Load navbar
    if (document.querySelector('body')) {
        const navContainer = document.createElement('div');
        navContainer.id = 'nav-container';
        document.body.insertBefore(navContainer, document.body.firstChild);
        await loadComponent('components/navbar.html', '#nav-container');
        initUserNavAfterNavbarLoad();
    }

    // Load main sections into main, but only on the homepage (index.html)
    const mainElement = document.querySelector('main');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (mainElement && (currentPage === 'index.html' || currentPage === '')) {
        // Load collection section
        const collectionContainer = document.createElement('div');
        collectionContainer.id = 'collection-container';
        mainElement.appendChild(collectionContainer);
        await loadComponent('components/collection.html', '#collection-container');

        // Initialize collection after loading
        setTimeout(() => initCollection(), 100);

        // Load customize section
        const customizeContainer = document.createElement('div');
        customizeContainer.id = 'customize-container';
        mainElement.appendChild(customizeContainer);
        await loadComponent('components/customize.html', '#customize-container');

        // Load story section
        const storyContainer = document.createElement('div');
        storyContainer.id = 'story-container';
        mainElement.appendChild(storyContainer);
        await loadComponent('components/story.html', '#story-container');

        // Load contact section
        const contactContainer = document.createElement('div');
        contactContainer.id = 'contact-container';
        mainElement.appendChild(contactContainer);
        await loadComponent('components/contact.html', '#contact-container');
    }

    // Load footer (append before body close)
    if (document.querySelector('body')) {
        const footerContainer = document.createElement('div');
        footerContainer.id = 'footer-container';
        document.body.appendChild(footerContainer);
        await loadComponent('components/footer.html', '#footer-container');
    }

    // Initialize cart count and scroll button after components load
    updateCartCount();
    initScrollToTop();
    setActiveNavLink();

    // Re-trigger scroll animations after all components loaded
    if (typeof reobserveSections === 'function') {
        setTimeout(() => {
            reobserveSections();
        }, 200);
    }
});

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-links a');

    // If on index.html, mark home as active
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'index.html' || currentPage === '') {
        // Use scroll position to determine which section is active
        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink();
    } else {
        // For other pages, remove active class
        navLinks.forEach(link => link.classList.remove('active'));
    }
}

function updateActiveLink() {
    const navLinks = document.querySelectorAll('.nav-links a.nav-anchor');
    let activeSection = 'home';

    const sections = ['home', 'collection', 'customize', 'story', 'contact'];

    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= 0) {
                activeSection = section;
            }
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + activeSection) {
            link.classList.add('active');
        }
    });
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('lumiere-cart')) || [];
    const cartCount = document.getElementById('cartCount');
    if (cartCount && cart.length > 0) {
        cartCount.textContent = cart.length;
        cartCount.style.display = 'flex';
    } else if (cartCount) {
        cartCount.style.display = 'none';
    }
}

function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (!scrollToTopBtn) return;

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}



// Initialize all components on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Load navbar
    if (document.querySelector('body')) {
        const navContainer = document.createElement('div');
        navContainer.id = 'nav-container';
        document.body.insertBefore(navContainer, document.body.firstChild);
        await loadComponent('components/navbar.html', '#nav-container');
    }
    
    // Load main sections into main, but only on the homepage (index.html)
    const mainElement = document.querySelector('main');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (mainElement && (currentPage === 'index.html' || currentPage === '')) {
        // Load collection section
        const collectionContainer = document.createElement('div');
        collectionContainer.id = 'collection-container';
        mainElement.appendChild(collectionContainer);
        await loadComponent('components/collection.html', '#collection-container');
        
        // Initialize collection after loading
        setTimeout(() => initCollection(), 100);
        
        // Load customize section
        const customizeContainer = document.createElement('div');
        customizeContainer.id = 'customize-container';
        mainElement.appendChild(customizeContainer);
        await loadComponent('components/customize.html', '#customize-container');
        
        // Load story section
        const storyContainer = document.createElement('div');
        storyContainer.id = 'story-container';
        mainElement.appendChild(storyContainer);
        await loadComponent('components/story.html', '#story-container');
        
        // Load contact section
        const contactContainer = document.createElement('div');
        contactContainer.id = 'contact-container';
        mainElement.appendChild(contactContainer);
        await loadComponent('components/contact.html', '#contact-container');
    }
    
    // Load footer (append before body close)
    if (document.querySelector('body')) {
        const footerContainer = document.createElement('div');
        footerContainer.id = 'footer-container';
        document.body.appendChild(footerContainer);
        await loadComponent('components/footer.html', '#footer-container');
    }
    
    // Initialize cart count and scroll button after components load
    updateCartCount();
    initScrollToTop();
    setActiveNavLink();
    
    // Re-trigger scroll animations after all components loaded
    if (typeof reobserveSections === 'function') {
        setTimeout(() => {
            reobserveSections();
        }, 200);
    }
});

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // If on index.html, mark home as active
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'index.html' || currentPage === '') {
        // Use scroll position to determine which section is active
        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink();
    } else {
        // For other pages, remove active class
        navLinks.forEach(link => link.classList.remove('active'));
    }
}

function updateActiveLink() {
    const navLinks = document.querySelectorAll('.nav-links a.nav-anchor');
    let activeSection = 'home';
    
    const sections = ['home', 'collection', 'customize', 'story', 'contact'];
    
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= 0) {
                activeSection = section;
            }
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + activeSection) {
            link.classList.add('active');
        }
    });
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('lumiere-cart')) || [];
    const cartCount = document.getElementById('cartCount');
    if (cartCount && cart.length > 0) {
        cartCount.textContent = cart.length;
        cartCount.style.display = 'flex';
    } else if (cartCount) {
        cartCount.style.display = 'none';
    }
}

function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (!scrollToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });
    
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
