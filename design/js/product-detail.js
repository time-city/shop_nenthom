// Product Detail Page Script

let currentProductId = null;
let selectedSize = '100g';
let selectedColor = 'cream';
let selectedPackaging = 'box-white';
let productQuantity = 1;

// Load products from JSON (will be set by collection.js)
async function loadProductDetailPage() {
  // Wait for collectionProducts to be loaded by collection.js
  let attempts = 0;
  while (!collectionProducts || collectionProducts.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
    if (attempts > 50) {
      // Timeout after 5 seconds
      console.error('Failed to load products');
      window.location.href = 'index.html#collection';
      return;
    }
  }
  
  // Load product detail after data is loaded
  currentProductId = getProductIdFromURL();
  const product = collectionProducts.find(p => p.id === currentProductId);
  
  if (product) {
    loadProductDetail(product);
  } else {
    // Redirect to collection if product not found
    window.location.href = 'index.html#collection';
  }
}

// Get product ID from URL parameters
function getProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id')) || 1;
}

// Load product details on page load
document.addEventListener('DOMContentLoaded', loadProductDetailPage);

// Load and display product details
function loadProductDetail(product) {
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-category').textContent = product.category;
  document.getElementById('product-price').textContent = product.price.toLocaleString('vi-VN');
  document.getElementById('product-note').textContent = product.note;
  document.getElementById('tab-ingredients').textContent = product.ingredients;
  
  // Update description tab
  document.getElementById('description').innerHTML = `
    <p>${product.description}</p>
  `;
  
  // Update ingredients tab
  document.getElementById('ingredients').innerHTML = `
    <p><strong>Thành phần chính:</strong></p>
    <p>${product.ingredients}</p>
  `;
  
  // Update usage tab
  document.getElementById('usage').innerHTML = `
    <p><strong>Hướng dẫn sử dụng:</strong></p>
    <p>${product.usage}</p>
  `;
  
  // Update page title
  document.title = `${product.name} - ChamCham`;
  
  // Set candle color
  const candlePreview = document.getElementById('product-candle');
  candlePreview.className = `candle-preview ${product.color}`;
  
  // Reset selections
  selectedSize = '100g';
  selectedColor = product.color || 'cream';
  selectedPackaging = 'box-white';
  productQuantity = 1;
  
  // Update UI
  updateUI();
}

// Update all UI elements
function updateUI() {
  document.getElementById('quantity').textContent = productQuantity;
  
  // Update active buttons
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.querySelectorAll(`[data-size="${selectedSize}"]`).forEach(btn => {
    btn.classList.add('active');
  });
  
  document.querySelectorAll(`[data-color="${selectedColor}"]`).forEach(btn => {
    btn.classList.add('active');
  });
  
  document.querySelectorAll(`[data-packaging="${selectedPackaging}"]`).forEach(btn => {
    btn.classList.add('active');
  });
}

// Select size
function selectSize(button) {
  document.querySelectorAll('[data-size]').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  selectedSize = button.dataset.size;
}

// Select color
function selectColor(button) {
  document.querySelectorAll('[data-color]').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  selectedColor = button.dataset.color;
  
  // Update candle preview color
  const candlePreview = document.getElementById('product-candle');
  candlePreview.className = `candle-preview ${selectedColor}`;
}

// Select packaging
function selectPackaging(button) {
  document.querySelectorAll('[data-packaging]').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  selectedPackaging = button.dataset.packaging;
}

// Increase quantity
function increaseQty() {
  productQuantity++;
  updateUI();
}

// Decrease quantity
function decreaseQty() {
  if (productQuantity > 1) {
    productQuantity--;
    updateUI();
  }
}

// Add to cart
function addToCart() {
  const product = collectionProducts.find(p => p.id === currentProductId);
  
  if (!product) return;
  
  // Get or initialize cart
  let cart = JSON.parse(localStorage.getItem('lumiere-cart')) || [];
  
  // Create cart item
  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: productQuantity,
    size: selectedSize,
    color: selectedColor,
    packaging: selectedPackaging,
    scent: product.scent,
    category: product.category,
    totalPrice: product.price * productQuantity
  };
  
  // Check if product with same options already exists
  const existingIndex = cart.findIndex(item =>
    item.id === cartItem.id &&
    item.size === cartItem.size &&
    item.color === cartItem.color &&
    item.packaging === cartItem.packaging
  );
  
  if (existingIndex >= 0) {
    // Update quantity if exists
    cart[existingIndex].quantity += productQuantity;
    cart[existingIndex].totalPrice = cart[existingIndex].price * cart[existingIndex].quantity;
  } else {
    // Add new item
    cart.push(cartItem);
  }
  
  // Save to localStorage
  localStorage.setItem('lumiere-cart', JSON.stringify(cart));
  
  // Show notification
  showNotification('Sản phẩm đã thêm vào giỏ hàng!');
  
  // Reset quantity
  productQuantity = 1;
  updateUI();
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: #1a1814;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 2px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Switch tabs
function switchTab(button, tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName).classList.add('active');
  button.classList.add('active');
}

// Add animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
