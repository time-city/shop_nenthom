// Product Data - loaded from JSON
let collectionProducts = [];

// Pagination State
let currentPage = 1;
const itemsPerPage = 10;
let filteredProducts = collectionProducts;

// Load products from JSON
async function loadProductsData() {
  try {
    const response = await fetch('data/products.json');
    const data = await response.json();
    collectionProducts = data.products;
    filteredProducts = collectionProducts;
    
    // Initialize collection if on collection page
    const grid = document.getElementById('collection-grid');
    if (grid) {
      initCollection();
    }
  } catch (error) {
    console.error('Error loading products:', error);
    // Fallback to empty array if loading fails
    collectionProducts = [];
  }
}

// Load data on page load
document.addEventListener('DOMContentLoaded', loadProductsData);

// Initialize Collection on demand
function initCollection() {
  const grid = document.getElementById('collection-grid');
  if (!grid) return;
  
  filteredProducts = collectionProducts;
  currentPage = 1;
  renderCollectionPage();
  setupCollectionFilters();
}

// Render Products for Current Page
function renderCollectionPage() {
  const grid = document.getElementById('collection-grid');
  const noResults = document.getElementById('no-results');
  const pagination = document.getElementById('collection-pagination');
  
  if (!grid) return;
  
  if (filteredProducts.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    if (pagination) pagination.style.display = 'none';
    return;
  }
  
  noResults.style.display = 'none';
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const pageProducts = filteredProducts.slice(startIdx, endIdx);
  
  // Render products
  grid.innerHTML = pageProducts.map(product => `
    <div class="product-card">
      <div class="product-image" onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">
        <div class="candle-preview ${product.color}"></div>
      </div>
      <div class="product-info">
        <h3 onclick="window.location.href='product-detail.html?id=${product.id}'" style="cursor: pointer;">${product.name}</h3>
        <p class="scent-note">${product.note}</p>
        <p class="product-price">${product.price.toLocaleString('vi-VN')}đ</p>
        <button class="btn-add-cart" onclick="window.location.href='product-detail.html?id=${product.id}'">Xem chi tiết</button>
      </div>
    </div>
  `).join('');
  
  // Show/hide pagination
  if (pagination) {
    if (totalPages > 1) {
      pagination.style.display = 'flex';
      renderPaginationButtons(totalPages);
    } else {
      pagination.style.display = 'none';
    }
  }
}

// Render Pagination Buttons
function renderPaginationButtons(totalPages) {
  const pagination = document.getElementById('collection-pagination');
  if (!pagination) return;
  
  let html = '';
  
  // Previous button
  if (currentPage > 1) {
    html += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})">← Trước</button>`;
  }
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      html += `<button class="pagination-btn active">${i}</button>`;
    } else if (i <= 3 || i > totalPages - 3 || Math.abs(i - currentPage) <= 1) {
      html += `<button class="pagination-btn" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === 4 || i === totalPages - 3) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
  }
  
  // Next button
  if (currentPage < totalPages) {
    html += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})">Sau →</button>`;
  }
  
  pagination.innerHTML = html;
}

// Go to Page
function goToPage(page) {
  currentPage = page;
  renderCollectionPage();
  // Scroll to collection
  document.getElementById('collection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Setup Filters
function setupCollectionFilters() {
  const scentFilter = document.getElementById('scent-filter');
  const priceFilter = document.getElementById('price-filter');
  const searchFilter = document.getElementById('search-filter');
  
  if (!scentFilter || !priceFilter || !searchFilter) return;
  
  [scentFilter, priceFilter, searchFilter].forEach(filter => {
    filter.addEventListener('change', applyCollectionFilters);
    filter.addEventListener('keyup', applyCollectionFilters);
  });
}

// Apply Filters
function applyCollectionFilters() {
  const scentFilter = document.getElementById('scent-filter');
  const priceFilter = document.getElementById('price-filter');
  const searchFilter = document.getElementById('search-filter');
  
  if (!scentFilter || !priceFilter || !searchFilter) return;
  
  const scent = scentFilter.value;
  const price = priceFilter.value;
  const search = searchFilter.value.toLowerCase();
  
  filteredProducts = collectionProducts.filter(product => {
    let matches = true;
    
    if (scent && product.scent !== scent) matches = false;
    
    if (price) {
      if (price === 'under-300' && product.price >= 300) matches = false;
      if (price === '300-500' && (product.price < 300 || product.price > 500)) matches = false;
      if (price === '500-800' && (product.price < 500 || product.price > 800)) matches = false;
      if (price === 'over-800' && product.price < 800) matches = false;
    }
    
    if (search && !product.name.toLowerCase().includes(search)) matches = false;
    
    return matches;
  });
  
  currentPage = 1; // Reset to first page when filtering
  renderCollectionPage();
}

// Reset Filters
function resetCollectionFilters() {
  document.getElementById('scent-filter').value = '';
  document.getElementById('price-filter').value = '';
  document.getElementById('search-filter').value = '';
  filteredProducts = collectionProducts;
  currentPage = 1;
  renderCollectionPage();
}

// Add to Cart
function addToCartCollection(productName, price) {
  alert(`Đã thêm "${productName}" vào giỏ hàng!`);
}
