// ============================================
// ChamCham Studio - Three.js Configurator
// ============================================

let scene, camera, renderer, candleJar, candleWax, candleLid;
let currentConfig = {
    jarType: 'clear',
    waxColor: '#A8C695',
    lidType: 'gold'
};

const colors = {
    clear: 0xFFFFFF,
    frosted: 0xE8E8E8,
    wax: {
        '#A8C695': 0xA8C695,
        '#B8A8D8': 0xB8A8D8,
        '#E8D4B8': 0xE8D4B8,
        '#D4A5A5': 0xD4A5A5,
        '#A5C8D4': 0xA5C8D4,
        '#D8B8C8': 0xD8B8C8
    },
    gold: 0xD4AF37,
    maroon: 0x5C2D2B
};

// Initialize Three.js Scene
function initThreeScene() {
    const container = document.getElementById('canvas-container');
    
    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 2.5);
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    const rectLight = new THREE.RectAreaLight(0xffffff, 3, 8, 6);
    rectLight.position.set(0, 2, -5);
    scene.add(rectLight);
    
    // Create Candle
    createCandle();
    
    // OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 1.5;
    controls.maxDistance = 4;
    
    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// Create Candle Geometry
function createCandle() {
    // Remove existing candle
    if (candleJar) scene.remove(candleJar);
    if (candleWax) scene.remove(candleWax);
    if (candleLid) scene.remove(candleLid);
    
    // Jar (Outer Container)
    const jarGeometry = new THREE.CylinderGeometry(0.6, 0.6, 1.8, 32);
    
    // Material based on jar type
    let jarColor = colors.clear;
    if (currentConfig.jarType === 'frosted') {
        jarColor = colors.frosted;
    }
    
    const jarMaterial = new THREE.MeshPhysicalMaterial({
        color: jarColor,
        transmission: 0.9,
        thickness: 0.5,
        roughness: currentConfig.jarType === 'frosted' ? 0.8 : 0.0,
        metalness: 0.0,
        side: THREE.DoubleSide
    });
    
    candleJar = new THREE.Mesh(jarGeometry, jarMaterial);
    candleJar.castShadow = true;
    candleJar.receiveShadow = true;
    candleJar.position.y = 0;
    scene.add(candleJar);
    
    // Wax (Inner Cylinder)
    const waxGeometry = new THREE.CylinderGeometry(0.55, 0.55, 1.6, 32);
    const waxColor = colors.wax[currentConfig.waxColor] || colors.wax['#A8C695'];
    
    const waxMaterial = new THREE.MeshPhysicalMaterial({
        color: waxColor,
        roughness: 0.7,
        metalness: 0.0,
        side: THREE.DoubleSide
    });
    
    candleWax = new THREE.Mesh(waxGeometry, waxMaterial);
    candleWax.castShadow = true;
    candleWax.receiveShadow = true;
    candleWax.position.y = 0.1;
    scene.add(candleWax);
    
    // Lid (optional)
    if (currentConfig.lidType === 'gold') {
        const lidGeometry = new THREE.CylinderGeometry(0.65, 0.65, 0.15, 32);
        const lidMaterial = new THREE.MeshPhysicalMaterial({
            color: colors.gold,
            roughness: 0.4,
            metalness: 0.8,
            side: THREE.DoubleSide
        });
        
        candleLid = new THREE.Mesh(lidGeometry, lidMaterial);
        candleLid.castShadow = true;
        candleLid.receiveShadow = true;
        candleLid.position.y = 0.9;
        scene.add(candleLid);
    }
}

// Update Candle Appearance
function updateCandleAppearance() {
    createCandle();
    updatePrice();
}

// Update Price
function updatePrice() {
    const basePrice = 85;
    let upgradePrice = 0;
    
    if (currentConfig.jarType === 'frosted') upgradePrice += 10;
    if (currentConfig.lidType === 'gold') upgradePrice += 15;
    
    const total = basePrice + upgradePrice;
    document.getElementById('price-display').textContent = `$${total.toFixed(2)}`;
}

// UI Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Three.js
    initThreeScene();
    updatePrice();
    
    // Jar Type Buttons
    document.querySelectorAll('.jar-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.jar-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentConfig.jarType = this.dataset.jar;
            updateCandleAppearance();
        });
    });
    
    // Color Buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentConfig.waxColor = this.dataset.color;
            updateCandleAppearance();
        });
    });
    
    // Lid Buttons
    document.querySelectorAll('.lid-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.lid-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentConfig.lidType = this.dataset.lid;
            updateCandleAppearance();
        });
    });
    
    // Add to Cart
    document.querySelector('.add-to-cart-btn').addEventListener('click', addToCart);
});

// Add to Cart Function
function addToCart() {
    const item = {
        name: 'Bespoke Candle',
        config: {...currentConfig},
        price: parseFloat(document.getElementById('price-display').textContent.substring(1)),
        timestamp: Date.now()
    };
    
    let cart = JSON.parse(localStorage.getItem('chamcham-cart')) || [];
    cart.push(item);
    localStorage.setItem('chamcham-cart', JSON.stringify(cart));
    
    // Visual feedback
    const btn = document.querySelector('.add-to-cart-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Added to Cart!';
    btn.style.backgroundColor = '#D4AF37';
    btn.style.color = '#000000';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
    }, 1500);
}

// Handle Window Resize
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
