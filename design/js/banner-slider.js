let currentSlide = 0;
const slides = [
    {
        title: 'Nến Tùy Chỉnh Premium',
        description: 'Tạo nên thơm của riêng mình với những mùi hương độc đáo và màu sắc tinh tế.',
        button: 'Khám Phá',
        image: 'images/banner-1.jpg',
        bgColor: '#8B7355'
    },
    {
        title: 'Sáp Đậu Nành Tự Nhiên',
        description: 'Được làm từ nguyên liệu tự nhiên 100%, an toàn cho gia đình bạn.',
        button: 'Tìm Hiểu Thêm',
        image: 'images/banner-2.jpg',
        bgColor: '#d4c5b0'
    },
    {
        title: 'Quà Tặng Hoàn Hảo',
        description: 'Mỗi nến ChamCham là một tác phẩm độc lập, hoàn hảo để tặng người thân.',
        button: 'Mua Ngay',
        image: 'images/banner-3.jpg',
        bgColor: '#c9d4c5'
    }
];

function initBannerSlider() {
    renderSlides();
    startAutoSlide();
    attachEventListeners();
}

function renderSlides() {
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const slideEl = document.createElement('div');
        slideEl.className = `slide ${index === 0 ? 'active' : ''}`;
        slideEl.style.backgroundColor = slide.bgColor;
        
        slideEl.innerHTML = `
            <div class="slide-content">
                <div class="slide-text">
                    <h2>${slide.title}</h2>
                    <p>${slide.description}</p>
                    <button class="slide-btn" onclick="document.getElementById('config').scrollIntoView({behavior:'smooth'})">${slide.button}</button>
                </div>
            </div>
        `;
        
        sliderContainer.appendChild(slideEl);
    });

    renderDots();
}

function renderDots() {
    const dotsContainer = document.querySelector('.dots');
    dotsContainer.innerHTML = '';
    
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `dot ${index === currentSlide ? 'active' : ''}`;
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });
}

function goToSlide(index) {
    currentSlide = index;
    updateSlides();
    resetAutoSlide();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlides();
    resetAutoSlide();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlides();
    resetAutoSlide();
}

function updateSlides() {
    const allSlides = document.querySelectorAll('.slide');
    const allDots = document.querySelectorAll('.dot');
    
    allSlides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
    
    allDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

let autoSlideTimer;

function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
        nextSlide();
    }, 5000);
}

function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
}

function attachEventListeners() {
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initBannerSlider);
