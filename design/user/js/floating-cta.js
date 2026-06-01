// ============================================
// ChamCham - Floating CTA Bar
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initFloatingCTA();
});

function initFloatingCTA() {
    // Create floating CTA bar HTML
    const floatingBar = document.createElement('div');
    floatingBar.className = 'floating-cta';
    floatingBar.innerHTML = `
        <button class="floating-cta-btn primary" onclick="scrollToSection('collection')">
            Xem Bộ Sưu Tập
        </button>
        <button class="floating-cta-btn secondary" onclick="scrollToSection('customize')">
            Tùy Chỉnh Ngay
        </button>
    `;
    document.body.appendChild(floatingBar);

    // Listen to scroll events
    window.addEventListener('scroll', handleFloatingCTAScroll, { passive: true });
}

function handleFloatingCTAScroll() {
    const floatingBar = document.querySelector('.floating-cta');
    const hero = document.querySelector('[class*="hero"][class*="fade"]') || 
                 document.querySelector('section.hero') ||
                 document.querySelector('main > *:first-child');
    
    if (!floatingBar || !hero) return;

    // Get hero section bottom position
    const heroRect = hero.getBoundingClientRect();
    const heroBottom = heroRect.bottom;

    // Show CTA when scrolled past hero section
    if (heroBottom < 0) {
        floatingBar.classList.add('visible');
        document.body.classList.add('cta-visible');
    } else {
        floatingBar.classList.remove('visible');
        document.body.classList.remove('cta-visible');
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId + '-container') || 
                    document.getElementById(sectionId);
    
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
