// ============================================
// ChamCham - UI Controls
// ============================================

function selectScent(el, name, desc, color) {
    state.scent = name;
    state.scentDesc = desc;
    state.scentColor = color;
    
    const group = el.closest('.options');
    group.querySelectorAll('.scent-chip').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    
    updatePreview();
}

function selectOpt(el, key, val) {
    state[key] = val;
    const group = el.closest('.options');
    group.querySelectorAll('.opt:not(.topping-chip)').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    updatePreview();
}

function selectTopping(el, name, price) {
    el.classList.toggle('active');
    
    // Update selected toppings in state
    if (el.classList.contains('active')) {
        if (!state.selectedToppings.find(t => t.name === name)) {
            state.selectedToppings.push({ name, price });
        }
    } else {
        state.selectedToppings = state.selectedToppings.filter(t => t.name !== name);
    }
    
    updatePreview();
}

function selectColor(el, hex, name) {
    state.color = hex;
    state.colorName = name;
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    el.classList.add('active');
    
    const isDark = (hex === '#2e2b26');
    const miniCandle = document.getElementById('mini-candle');
    
    if (isDark) {
        miniCandle.style.background = `linear-gradient(105deg, #1a1714, ${hex} 40%, #0d0c0a)`;
    } else {
        miniCandle.style.background = `linear-gradient(105deg, ${shadeHex(hex, -15)}, ${hex} 40%, ${shadeHex(hex, -25)})`;
    }
    
    updatePreview();
}

function updatePreview() {
    // Update name and description
    document.getElementById('prev-name').textContent = state.scent;
    document.getElementById('prev-desc').textContent = state.scentDesc;
    
    // Update details
    document.getElementById('prev-size').textContent = state.size;
    document.getElementById('prev-color').textContent = state.colorName;
    document.getElementById('prev-pack').textContent = state.pack;
    
    // Update toppings display
    const toppingList = document.getElementById('topping-list');
    if (state.selectedToppings.length === 0) {
        toppingList.innerHTML = '<div class="no-topping">Chưa chọn topping</div>';
    } else {
        toppingList.innerHTML = state.selectedToppings
            .map(t => `<span class="topping-tag">✓ ${t.name}</span>`)
            .join('');
    }
    
    updatePrice();
}

function updatePrice() {
    const basePrice = prices[state.size] || 189000;
    const toppingTotal = state.selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const totalPrice = basePrice + toppingTotal;
    
    // Create price breakdown
    let breakdown = `<div class="price-line"><span>Nến ${state.size.split(' ')[0]}:</span> <span>${basePrice.toLocaleString('vi-VN')}đ</span></div>`;
    
    if (state.selectedToppings.length > 0) {
        state.selectedToppings.forEach(t => {
            breakdown += `<div class="price-line"><span>+ ${t.name}:</span> <span>${t.price.toLocaleString('vi-VN')}đ</span></div>`;
        });
        breakdown += '<div style="border-top: 1px solid rgba(107, 18, 24, 0.2); margin: 8px 0;"></div>';
    }
    
    breakdown += `<div class="price-total"><span>Tổng:</span> <span id="price-display">${totalPrice.toLocaleString('vi-VN')}đ</span></div>`;
    
    document.getElementById('price-breakdown').innerHTML = breakdown;
}

function addToCart() {
    const basePrice = prices[state.size] || 189000;
    const toppingTotal = state.selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const totalPrice = basePrice + toppingTotal;
    
    const cartItem = {
        scent: state.scent,
        toppings: state.selectedToppings.map(t => t.name),
        color: state.color,
        colorName: state.colorName,
        size: state.size,
        pack: state.pack,
        basePrice: basePrice,
        toppingPrice: toppingTotal,
        price: totalPrice,
        quantity: 1,
        timestamp: Date.now()
    };
    
    let cart = JSON.parse(localStorage.getItem('lumiere-cart')) || [];
    
    // Check if item already exists (matching all properties)
    const existingIndex = cart.findIndex(item => 
        item.scent === cartItem.scent &&
        item.color === cartItem.color &&
        item.size === cartItem.size &&
        item.pack === cartItem.pack &&
        JSON.stringify(item.toppings) === JSON.stringify(cartItem.toppings)
    );
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push(cartItem);
    }
    
    localStorage.setItem('lumiere-cart', JSON.stringify(cart));
    
    // Update cart count in navbar
    if (window.updateCartCount) {
        window.updateCartCount();
    }
    
    // Show feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Thêm thành công!';
    btn.style.background = '#1a1814';
    
    setTimeout(() => {
        btn.textContent = originalText;
    }, 2000);
}
