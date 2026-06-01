/**
 * Scroll Fade-In Animation Manager
 * Handles fade-in effects when sections come into viewport
 */

// Configuration for Intersection Observer
const scrollAnimationConfig = {
    threshold: [0, 0.1, 0.25],
    rootMargin: '0px 0px -100px 0px'
};

// Create the observer
const scrollAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add visible class to trigger animation
            entry.target.classList.add('visible');
            // Optional: unobserve after animation
            // scrollAnimationObserver.unobserve(entry.target);
        } else {
            // Optional: remove visible class when leaving viewport (for repeat effect)
            // entry.target.classList.remove('visible');
        }
    });
}, scrollAnimationConfig);

/**
 * Initialize scroll animations for all fade-section elements
 * Call this after all DOM content is loaded
 */
function initScrollAnimations() {
    // Wait for DOM to be fully ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeAllSections);
    } else {
        observeAllSections();
    }
}

/**
 * Observe all fade-section elements in the document
 */
function observeAllSections() {
    const fadeSections = document.querySelectorAll('.fade-section');
    
    if (fadeSections.length === 0) {
        console.warn('No fade-section elements found');
        return;
    }
    
    fadeSections.forEach(section => {
        // Add animation class if not already visible in viewport
        const rect = section.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
            // Section is below viewport, will animate when scrolled to
            scrollAnimationObserver.observe(section);
        } else if (rect.bottom > 0) {
            // Section is already in or partially in viewport
            section.classList.add('visible');
        }
    });
}

/**
 * Re-observe sections (useful when new sections are added dynamically)
 */
function reobserveSections() {
    const fadeSections = document.querySelectorAll('.fade-section');
    fadeSections.forEach(section => {
        if (!section.classList.contains('observed')) {
            section.classList.add('observed');
            scrollAnimationObserver.observe(section);
        }
    });
}

/**
 * Watch for dynamically added fade-sections using MutationObserver
 */
function watchForNewSections() {
    const config = {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    };
    
    const callback = (mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // New nodes added, check for fade-sections
                const newSections = mutation.addedNodes;
                newSections.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('fade-section')) {
                            scrollAnimationObserver.observe(node);
                        }
                        // Also check children
                        const children = node.querySelectorAll?.('.fade-section');
                        children?.forEach(child => scrollAnimationObserver.observe(child));
                    }
                });
            }
        }
    };
    
    const observer = new MutationObserver(callback);
    observer.observe(document.body, config);
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initScrollAnimations();
        watchForNewSections();
    });
} else {
    initScrollAnimations();
    watchForNewSections();
}

// Also trigger on window load (for images, etc)
window.addEventListener('load', () => {
    reobserveSections();
});
