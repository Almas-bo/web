// Mock Product Data
const products = [
    {
        id: 1,
        name: "Air Jordan 1 Retro High OG",
        brand: "Jordan",
        price: 180,
        originalPrice: 220,
        image: "https://images.unsplash.com/photo-1584735175315-9d581f7aee29?q=80&w=1974&auto=format&fit=crop",
        secondaryImage: "https://images.unsplash.com/photo-1597044768588-bc4685740e24?q=80&w=2070&auto=format&fit=crop",
        badge: "Limited",
        gender: "Unisex",
        sizes: [7, 8, 9, 10, 11, 12]
    },
    {
        id: 2,
        name: "Yeezy Boost 350 V2",
        brand: "Yeezy",
        price: 230,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1586525198428-225f6f12cff5?q=80&w=1974&auto=format&fit=crop",
        secondaryImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1974&auto=format&fit=crop",
        badge: "Hot",
        gender: "Men",
        sizes: [8, 9, 10, 11]
    },
    {
        id: 3,
        name: "Dunk Low 'Panda'",
        brand: "Nike",
        price: 110,
        originalPrice: 140,
        image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=1925&auto=format&fit=crop",
        secondaryImage: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?q=80&w=1974&auto=format&fit=crop",
        badge: "-20%",
        gender: "Unisex",
        sizes: [6, 7, 8, 9, 10, 11, 12]
    },
    {
        id: 4,
        name: "New Balance 550",
        brand: "New Balance",
        price: 120,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1636467455664-44449877960a?q=80&w=2070&auto=format&fit=crop",
        secondaryImage: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=2071&auto=format&fit=crop",
        badge: null,
        gender: "Men",
        sizes: [8, 9, 10, 11]
    },
    {
        id: 5,
        name: "Forum Low Shoes",
        brand: "Adidas",
        price: 100,
        originalPrice: 120,
        image: "https://images.unsplash.com/photo-1587562265714-48b1b741f3e2?q=80&w=2070&auto=format&fit=crop",
        secondaryImage: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=2070&auto=format&fit=crop",
        badge: "Sale",
        gender: "Women",
        sizes: [5, 6, 7, 8]
    },
    {
        id: 6,
        name: "Gel-Lyte III OG",
        brand: "Asics",
        price: 130,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop",
        secondaryImage: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1974&auto=format&fit=crop",
        badge: null,
        gender: "Men",
        sizes: [9, 10, 11]
    },
    {
        id: 7,
        name: "Suede Classic XXI",
        brand: "Puma",
        price: 75,
        originalPrice: 90,
        image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=2070&auto=format&fit=crop",
        secondaryImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
        badge: "Sale",
        gender: "Unisex",
        sizes: [7, 8, 9, 10]
    },
    {
        id: 8,
        name: "Air Max 90",
        brand: "Nike",
        price: 130,
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?q=80&w=2030&auto=format&fit=crop",
        secondaryImage: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=2070&auto=format&fit=crop",
        badge: "Limited",
        gender: "Men",
        sizes: [8, 9, 10, 11, 12]
    }
];

let cart = [];

// State
let activeBrand = 'all';

// Selectors
const productGrid = document.getElementById('productGrid');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');
const themeToggle = document.getElementById('themeToggle');
const brandChips = document.querySelectorAll('.brand-chip');
const cartItemsContainer = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartCountDrawer = document.getElementById('cartCountDrawer');
const cartSubtotal = document.getElementById('cartSubtotal');
const toastContainer = document.getElementById('toastContainer');
const quickViewModal = document.getElementById('quickViewModal');
const closeQuickView = document.getElementById('closeQuickView');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    setupEventListeners();
    checkTheme();
});

function setupEventListeners() {
    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    // Cart Drawer Toggle
    cartBtn.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    document.getElementById('startShopping')?.addEventListener('click', toggleCart);

    // Brand Filtering
    brandChips.forEach(chip => {
        chip.addEventListener('click', () => {
            activeBrand = chip.getAttribute('data-brand');
            brandChips.forEach(c => {
                c.classList.remove('bg-primary', 'text-white', 'border-primary');
                c.classList.add('border-gray-200', 'dark:border-gray-800');
            });
            chip.classList.add('bg-primary', 'text-white', 'border-primary');
            chip.classList.remove('border-gray-200', 'dark:border-gray-800');
            
            const filtered = activeBrand === 'all' ? products : products.filter(p => p.brand === activeBrand);
            renderProducts(filtered);
        });
    });

    // Search Autocomplete
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.brand.toLowerCase().includes(query)
        );
        renderProducts(filtered);
    });

    // Quick View Close
    closeQuickView.addEventListener('click', () => {
        quickViewModal.classList.add('hidden');
        quickViewModal.classList.remove('flex');
    });

    // Close on escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cartDrawer.classList.add('translate-x-full');
            cartOverlay.classList.add('opacity-0', 'pointer-events-none');
            quickViewModal.classList.add('hidden');
            quickViewModal.classList.remove('flex');
        }
    });
}

function renderProducts(items) {
    productGrid.innerHTML = '';
    document.getElementById('productCount').textContent = items.length;
    
    items.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all';
        
        const badgeHtml = product.badge ? `<span class="absolute top-4 left-4 z-10 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">${product.badge}</span>` : '';
        
        card.innerHTML = `
            <div class="relative aspect-square overflow-hidden cursor-pointer" onclick="openQuickView(${product.id})">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transition-transform group-hover:scale-105">
                <img src="${product.secondaryImage}" alt="${product.name}" class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity">
                ${badgeHtml}
                <div class="quick-add absolute bottom-0 left-0 w-full p-4 translate-y-full opacity-0 transition-all duration-300 bg-white/10 backdrop-blur-md">
                    <div class="flex gap-2 justify-center mb-3">
                        ${product.sizes.slice(0, 4).map(size => `<button class="w-8 h-8 bg-white dark:bg-dark rounded-md text-[10px] font-bold hover:bg-primary hover:text-white transition">${size}</button>`).join('')}
                    </div>
                </div>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">${product.brand}</p>
                        <h3 class="font-bold text-sm uppercase group-hover:text-primary transition-colors">${product.name}</h3>
                    </div>
                    <button onclick="toggleWishlist(this)" class="text-gray-300 hover:text-red-500 transition">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-lg">$${product.price}</span>
                    ${product.originalPrice ? `<span class="text-sm text-gray-400 line-through">$${product.originalPrice}</span>` : ''}
                </div>
                <div class="mt-6 flex gap-2">
                    <button onclick="addToCart(${product.id})" class="flex-1 bg-dark dark:bg-white dark:text-black text-white py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition transform active:scale-95">
                        Add to Cart
                    </button>
                    <button onclick="openQuickView(${product.id})" class="px-4 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition transform active:scale-95">
                        <i class="fa-solid fa-eye text-xs"></i>
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

function toggleCart() {
    cartDrawer.classList.toggle('translate-x-full');
    cartOverlay.classList.toggle('opacity-0');
    cartOverlay.classList.toggle('pointer-events-none');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    showToast(`${product.name} added to cart!`);
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCountDrawer.textContent = totalItems;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                <i class="fa-solid fa-bag-shopping text-6xl opacity-20"></i>
                <p>Your bag is empty</p>
                <button id="startShopping" onclick="toggleCart()" class="text-primary font-bold uppercase text-xs tracking-widest underline">Start Shopping</button>
            </div>
        `;
        cartSubtotal.textContent = '$0.00';
    } else {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            const itemEl = document.createElement('div');
            itemEl.className = 'flex gap-4 items-center';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg">
                <div class="flex-1">
                    <h4 class="font-bold text-xs uppercase tracking-tight">${item.name}</h4>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mb-2">${item.brand} | Size: 9</p>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center border border-gray-200 dark:border-gray-800 rounded">
                            <button onclick="changeQty(${item.id}, -1)" class="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800">-</button>
                            <span class="px-2 py-1 text-xs font-bold">${item.quantity}</span>
                            <button onclick="changeQty(${item.id}, 1)" class="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-zinc-800">+</button>
                        </div>
                        <span class="font-bold text-sm">$${item.price * item.quantity}</span>
                    </div>
                </div>
                <button onclick="removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500 transition">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
        
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartUI();
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'bg-dark dark:bg-white text-white dark:text-black px-6 py-4 rounded-full shadow-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-primary"></i> ${message}`;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function openQuickView(id) {
    const product = products.find(p => p.id === id);
    document.getElementById('qvImage').src = product.image;
    document.getElementById('qvBrand').textContent = product.brand;
    document.getElementById('qvTitle').textContent = product.name;
    document.getElementById('qvPrice').textContent = `$${product.price}`;
    
    document.getElementById('qvAddToCart').onclick = () => {
        addToCart(id);
        quickViewModal.classList.add('hidden');
        quickViewModal.classList.remove('flex');
    };
    
    quickViewModal.classList.remove('hidden');
    quickViewModal.classList.add('flex');
}

function toggleWishlist(btn) {
    btn.classList.toggle('text-red-500');
    btn.classList.toggle('text-gray-300');
    const count = document.getElementById('wishlistCount');
    let current = parseInt(count.textContent);
    count.textContent = btn.classList.contains('text-red-500') ? current + 1 : current - 1;
}

function checkTheme() {
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
}
