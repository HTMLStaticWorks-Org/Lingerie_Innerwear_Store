/**
 * VELORA - Luxury Innerwear & Lingerie
 * Core Application Script: Cart, Wishlist, Search, Quick View, Theme, Size Calculator
 */

// --- Global State ---
let cartState = JSON.parse(localStorage.getItem('velora_cart')) || [];
let wishlistState = JSON.parse(localStorage.getItem('velora_wishlist')) || [];
let activeQuickViewProduct = null;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initHeader();
  initLucideIcons();
  updateCartUI();
  updateWishlistUI();
  initModalsAndDrawers();
  initSearch();
  initGlobalForms();

  // Page-specific initializers
  if (document.getElementById('products-grid')) {
    initProductsPage();
  }
  if (document.getElementById('size-calculator-container')) {
    initSizeCalculator();
  }
  if (document.getElementById('contact-form')) {
    initContactForm();
  }
  if (document.querySelector('.accordion-btn') || document.querySelector('.accordion-group') || document.querySelector('.faq-accordion')) {
    initAccordions();
  }
  if (document.getElementById('home1-product-slider')) {
    renderHome1Products();
  }
  if (document.getElementById('home2-bestseller-grid')) {
    renderHome2Bestsellers();
  }
});

// --- Lucide Icons Safe Init ---
function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- Theme Management (Light / Dark) ---
function initTheme() {
  const savedTheme = localStorage.getItem('velora_theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcons(savedTheme);

  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      const newTheme = isDark ? 'dark' : 'light';
      localStorage.setItem('velora_theme', newTheme);
      updateThemeIcons(newTheme);
      showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'info');
    });
  });
}

function updateThemeIcons(theme) {
  const moonIcons = document.querySelectorAll('.theme-icon-moon');
  const sunIcons = document.querySelectorAll('.theme-icon-sun');
  if (theme === 'dark') {
    moonIcons.forEach(el => el.classList.add('hidden'));
    sunIcons.forEach(el => el.classList.remove('hidden'));
  } else {
    moonIcons.forEach(el => el.classList.remove('hidden'));
    sunIcons.forEach(el => el.classList.add('hidden'));
  }
}

// --- RTL Direction Management ---
function initRTL() {
  const savedDir = localStorage.getItem('velora_dir') || 'ltr';
  applyRTLState(savedDir);

  const rtlToggles = document.querySelectorAll('.rtl-toggle-btn');
  rtlToggles.forEach(btn => {
    btn.onclick = null; // Prevent duplicate execution from inline onclick
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleRTL();
    });
  });
}

function applyRTLState(dir) {
  const html = document.documentElement;
  const isRTL = dir === 'rtl';

  if (isRTL) {
    html.setAttribute('dir', 'rtl');
    if (document.body) document.body.setAttribute('dir', 'rtl');
    html.classList.add('rtl-mode');
  } else {
    html.removeAttribute('dir');
    if (document.body) document.body.removeAttribute('dir');
    html.classList.remove('rtl-mode');
  }

  updateRTLButtons(isRTL);
}

function updateRTLButtons(isRTL) {
  const buttons = document.querySelectorAll('.rtl-toggle-btn');
  buttons.forEach(btn => {
    if (isRTL) {
      btn.classList.add('active-rtl');
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('title', 'Switch to LTR Layout');
    } else {
      btn.classList.remove('active-rtl');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('title', 'Switch to RTL Layout');
    }
  });
}

function toggleRTL() {
  const html = document.documentElement;
  const currentDir = html.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
  const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';

  localStorage.setItem('velora_dir', newDir);
  applyRTLState(newDir);
  showToast(newDir === 'rtl' ? 'RTL layout enabled' : 'LTR layout enabled', 'info');
}

window.toggleRTL = toggleRTL;
window.applyRTLState = applyRTLState;

// --- Header & Scroll Effects ---
function initHeader() {
  const header = document.getElementById('main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('shadow-md', 'py-3');
      header.classList.remove('py-5');
    } else {
      header.classList.remove('shadow-md', 'py-3');
      header.classList.add('py-5');
    }
  });

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');

  function openMobileMenu() {
    if (mobileMenuDrawer && mobileMenuBackdrop) {
      mobileMenuDrawer.classList.add('active');
      mobileMenuBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileMenuDrawer && mobileMenuBackdrop) {
      mobileMenuDrawer.classList.remove('active');
      mobileMenuBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', openMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
  if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

}

// --- Modals and Drawers Setup ---
function initModalsAndDrawers() {
  // Cart Drawer
  const cartTriggers = document.querySelectorAll('.cart-drawer-trigger');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartClose = document.getElementById('cart-close-btn');

  function openCart() {
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
    const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
    if (mobileMenuDrawer && mobileMenuBackdrop) {
      mobileMenuDrawer.classList.remove('active');
      mobileMenuBackdrop.classList.remove('active');
    }
    if (cartDrawer && cartBackdrop) {
      cartDrawer.classList.add('active');
      cartBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      renderCartItems();
    }
  }

  function closeCart() {
    if (cartDrawer && cartBackdrop) {
      cartDrawer.classList.remove('active');
      cartBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  cartTriggers.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  }));

  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  // Quick View Modal
  const quickViewModal = document.getElementById('quick-view-modal');
  const quickViewClose = document.getElementById('quick-view-close');

  if (quickViewClose && quickViewModal) {
    quickViewClose.addEventListener('click', () => {
      quickViewModal.classList.remove('active');
      document.body.style.overflow = '';
    });

    quickViewModal.addEventListener('click', (e) => {
      if (e.target === quickViewModal) {
        quickViewModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Search Modal
  const searchTriggers = document.querySelectorAll('.search-modal-trigger');
  const searchModal = document.getElementById('search-modal');
  const searchClose = document.getElementById('search-close-btn');

  function openSearch() {
    const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
    const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
    if (mobileMenuDrawer && mobileMenuBackdrop) {
      mobileMenuDrawer.classList.remove('active');
      mobileMenuBackdrop.classList.remove('active');
    }
    if (searchModal) {
      searchModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      const input = document.getElementById('search-input');
      if (input) setTimeout(() => input.focus(), 100);
    }
  }

  function closeSearch() {
    if (searchModal) {
      searchModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  searchTriggers.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openSearch();
  }));

  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeSearch();
      if (quickViewModal) quickViewModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// --- Cart Operations ---
function addToCart(productId, size = null, color = null, quantity = 1) {
  const product = VELORA_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const chosenSize = size || product.sizes[0];
  const chosenColor = color || (product.colors[0] ? product.colors[0].name : 'Default');

  // Check if item with same id, size, and color exists
  const existingIndex = cartState.findIndex(
    item => item.id === productId && item.size === chosenSize && item.color === chosenColor
  );

  if (existingIndex > -1) {
    cartState[existingIndex].quantity += quantity;
  } else {
    cartState.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: chosenSize,
      color: chosenColor,
      quantity: quantity
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added "${product.name}" to your shopping bag.`, 'success');

  // Trigger quick animation or open cart
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  if (cartDrawer && cartBackdrop) {
    cartDrawer.classList.add('active');
    cartBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCartItems();
  }
}

function updateCartQuantity(index, delta) {
  if (cartState[index]) {
    cartState[index].quantity += delta;
    if (cartState[index].quantity <= 0) {
      cartState.splice(index, 1);
      showToast('Item removed from cart.', 'info');
    }
    saveCart();
    updateCartUI();
    renderCartItems();
  }
}

function removeFromCart(index) {
  if (cartState[index]) {
    const item = cartState[index];
    cartState.splice(index, 1);
    saveCart();
    updateCartUI();
    renderCartItems();
    showToast(`Removed "${item.name}" from shopping bag.`, 'info');
  }
}

function saveCart() {
  localStorage.setItem('velora_cart', JSON.stringify(cartState));
}

function updateCartUI() {
  const totalCount = cartState.reduce((sum, item) => sum + item.quantity, 0);
  const countBadges = document.querySelectorAll('.cart-badge-count');
  countBadges.forEach(badge => {
    badge.textContent = totalCount;
    if (totalCount > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

function renderCartItems() {
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal-price');
  const emptyStateEl = document.getElementById('cart-empty-state');
  const footerEl = document.getElementById('cart-footer-section');

  if (!container) return;

  if (cartState.length === 0) {
    container.innerHTML = '';
    if (emptyStateEl) emptyStateEl.classList.remove('hidden');
    if (footerEl) footerEl.classList.add('hidden');
    return;
  }

  if (emptyStateEl) emptyStateEl.classList.add('hidden');
  if (footerEl) footerEl.classList.remove('hidden');

  let subtotal = 0;
  container.innerHTML = cartState.map((item, idx) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return `
      <div class="flex items-center gap-4 py-4 border-b border-[#E8D8C7]/50 dark:border-[#572B3A]/30">
        <img src="${item.image}" alt="${item.name}" class="w-16 h-20 object-cover rounded-lg border border-[#E8D8C7]/60 dark:border-[#572B3A]/40" />
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-sm text-[#252326] dark:text-[#F8F4EF] truncate">${item.name}</h4>
          <p class="text-xs text-[#572B3A]/80 dark:text-[#C88F91] mt-0.5">Size: <span class="font-semibold">${item.size}</span> | ${item.color}</p>
          <div class="flex items-center justify-between mt-3">
            <div class="flex items-center border border-[#E8D8C7] dark:border-[#572B3A] rounded-full overflow-hidden text-xs">
              <button onclick="updateCartQuantity(${idx}, -1)" class="px-2.5 py-1 hover:bg-[#E8D8C7]/30 dark:hover:bg-[#572B3A]/40 transition text-[#252326] dark:text-[#F8F4EF]">-</button>
              <span class="px-2 font-medium text-[#252326] dark:text-[#F8F4EF]">${item.quantity}</span>
              <button onclick="updateCartQuantity(${idx}, 1)" class="px-2.5 py-1 hover:bg-[#E8D8C7]/30 dark:hover:bg-[#572B3A]/40 transition text-[#252326] dark:text-[#F8F4EF]">+</button>
            </div>
            <span class="text-sm font-semibold text-[#572B3A] dark:text-[#E8D8C7]">$${itemTotal.toFixed(2)}</span>
          </div>
        </div>
        <button onclick="removeFromCart(${idx})" class="text-[#252326]/40 hover:text-[#572B3A] dark:text-[#F8F4EF]/40 dark:hover:text-[#C88F91] p-1.5 transition" title="Remove item">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `;
  }).join('');

  if (subtotalEl) {
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  }

  // Update Free Shipping Progress Bar ($150 target)
  const freeShippingTarget = 150;
  const progressEl = document.getElementById('shipping-progress-bar');
  const progressTextEl = document.getElementById('shipping-progress-text');

  if (progressEl && progressTextEl) {
    const pct = Math.min(100, Math.round((subtotal / freeShippingTarget) * 100));
    progressEl.style.width = `${pct}%`;
    if (subtotal >= freeShippingTarget) {
      progressTextEl.innerHTML = `<span class="text-emerald-700 dark:text-emerald-400 font-semibold">✨ Congratulations! You unlocked complimentary luxury shipping.</span>`;
    } else {
      const remaining = (freeShippingTarget - subtotal).toFixed(2);
      progressTextEl.innerHTML = `Add <span class="font-bold text-[#572B3A] dark:text-[#C88F91]">$${remaining}</span> more for Complimentary Discreet Express Delivery.`;
    }
  }

  initLucideIcons();
}

// --- Wishlist Management ---
function toggleWishlist(productId) {
  const index = wishlistState.indexOf(productId);
  const product = VELORA_PRODUCTS.find(p => p.id === productId);

  if (index > -1) {
    wishlistState.splice(index, 1);
    showToast(`Removed from wishlist.`, 'info');
  } else {
    wishlistState.push(productId);
    showToast(`Saved "${product ? product.name : 'Item'}" to your wishlist.`, 'success');
  }

  localStorage.setItem('velora_wishlist', JSON.stringify(wishlistState));
  updateWishlistUI();
}

function updateWishlistUI() {
  const countBadges = document.querySelectorAll('.wishlist-badge-count');
  countBadges.forEach(badge => {
    badge.textContent = wishlistState.length;
    if (wishlistState.length > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });

  // Update heart icons across cards
  const heartButtons = document.querySelectorAll('[data-wishlist-id]');
  heartButtons.forEach(btn => {
    const id = btn.getAttribute('data-wishlist-id');
    const icon = btn.querySelector('svg') || btn.querySelector('i');
    if (wishlistState.includes(id)) {
      btn.classList.add('text-rose-600', 'fill-rose-600');
      btn.classList.remove('text-[#252326]/70', 'dark:text-[#F8F4EF]/70');
      if (icon) icon.style.fill = '#C88F91';
    } else {
      btn.classList.remove('text-rose-600', 'fill-rose-600');
      btn.classList.add('text-[#252326]/70', 'dark:text-[#F8F4EF]/70');
      if (icon) icon.style.fill = 'none';
    }
  });
}

// --- Quick View Modal ---
function openQuickView(productId) {
  const product = VELORA_PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  activeQuickViewProduct = product;
  const modal = document.getElementById('quick-view-modal');
  const container = document.getElementById('quick-view-content');
  if (!modal || !container) return;

  let selectedSize = product.sizes[0];
  let selectedColor = product.colors[0] ? product.colors[0].name : '';

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6 md:p-8">
      <!-- Image Gallery -->
      <div>
        <div class="product-img-frame aspect-[4/5]">
          <img id="qv-main-image" src="${getProductDisplayImage(product)}" alt="${product.name}" class="product-img-el ${getProductImageCropClass(product, getProductDisplayImage(product))}" />
        </div>
        ${product.gallery && product.gallery.length > 1 ? `
          <div class="flex gap-2 mt-3">
            ${product.gallery.map((img, i) => `
              <button onclick="document.getElementById('qv-main-image').src='${img}'" class="w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-[#572B3A] dark:hover:border-[#C88F91] transition">
                <img src="${img}" alt="Thumbnail ${i}" class="w-full h-full object-cover" />
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Product Details -->
      <div class="flex flex-col">
        <span class="text-xs uppercase tracking-widest text-[#572B3A] dark:text-[#C88F91] font-semibold">${product.gender.toUpperCase()} • ${product.category.toUpperCase()}</span>
        <h2 class="font-serif text-2xl md:text-3xl text-[#252326] dark:text-[#F8F4EF] mt-1 font-semibold">${product.name}</h2>
        
        <div class="flex items-center gap-3 mt-2">
          <div class="flex text-amber-500">
            ${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))}
          </div>
          <span class="text-xs text-stone-500 dark:text-stone-400">(${product.reviewCount} verified reviews)</span>
        </div>

        <div class="flex items-baseline gap-3 mt-4">
          <span class="text-2xl font-semibold text-[#572B3A] dark:text-[#E8D8C7]">$${product.price.toFixed(2)}</span>
          ${product.originalPrice ? `<span class="text-stone-400 line-through text-sm">$${product.originalPrice.toFixed(2)}</span>` : ''}
          ${product.badge ? `<span class="text-xs px-2.5 py-0.5 rounded-full bg-[#E8D8C7]/40 text-[#572B3A] dark:bg-[#572B3A]/50 dark:text-[#E8D8C7] font-medium">${product.badge}</span>` : ''}
        </div>

        <p class="text-sm text-[#252326]/80 dark:text-[#F8F4EF]/80 mt-4 leading-relaxed">${product.description}</p>
        
        <div class="text-xs bg-[#F8F4EF] dark:bg-[#252326]/60 p-3 rounded-lg border border-[#E8D8C7]/60 dark:border-[#572B3A]/40 mt-3">
          <span class="font-semibold text-[#572B3A] dark:text-[#C88F91]">Fabric:</span> ${product.fabricDetails}
        </div>

        <!-- Color Selector -->
        <div class="mt-5">
          <label class="text-xs font-semibold uppercase tracking-wider text-[#252326] dark:text-[#F8F4EF]">Color: <span id="qv-color-label" class="font-normal text-[#572B3A] dark:text-[#C88F91]">${selectedColor}</span></label>
          <div class="flex items-center gap-3 mt-2">
            ${product.colors.map((c, idx) => `
              <button 
                onclick="setQvColor('${c.name}', this)" 
                class="w-7 h-7 rounded-full border-2 transition ${idx === 0 ? 'border-[#572B3A] dark:border-[#C88F91] scale-110' : 'border-stone-300 hover:scale-105'}" 
                style="background-color: ${c.hex};" 
                title="${c.name}">
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Size Selector -->
        <div class="mt-5">
          <div class="flex justify-between items-center">
            <label class="text-xs font-semibold uppercase tracking-wider text-[#252326] dark:text-[#F8F4EF]">Select Size: <span id="qv-size-label" class="font-normal text-[#572B3A] dark:text-[#C88F91]">${selectedSize}</span></label>
            <a href="size-guide.html" class="text-xs underline text-[#572B3A] dark:text-[#C88F91] hover:opacity-80">Size Chart</a>
          </div>
          <div class="flex flex-wrap gap-2 mt-2">
            ${product.sizes.map((s, idx) => `
              <button 
                onclick="setQvSize('${s}', this)" 
                class="px-3.5 py-1.5 text-xs font-medium rounded-lg border transition ${idx === 0 ? 'border-[#572B3A] bg-[#572B3A] text-white dark:border-[#C88F91] dark:bg-[#C88F91] dark:text-[#252326]' : 'border-[#E8D8C7] hover:border-[#572B3A] dark:border-[#572B3A]/60 dark:hover:border-[#C88F91] text-[#252326] dark:text-[#F8F4EF]'}">
                ${s}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3 mt-6">
          <button 
            onclick="addToCart('${product.id}', window._qvSize || '${selectedSize}', window._qvColor || '${selectedColor}', 1); document.getElementById('quick-view-modal').classList.remove('active'); document.body.style.overflow='';"
            class="flex-1 py-3.5 px-6 rounded-full bg-[#572B3A] text-white font-medium hover:bg-[#3e1e29] dark:bg-[#C88F91] dark:text-[#252326] dark:hover:bg-[#d69fa1] transition shadow-lg flex items-center justify-center gap-2">
            <i data-lucide="shopping-bag" class="w-4 h-4"></i> Add to Bag
          </button>
          <button 
            onclick="toggleWishlist('${product.id}')" 
            class="p-3.5 rounded-full border border-[#E8D8C7] hover:border-[#572B3A] dark:border-[#572B3A] dark:hover:border-[#C88F91] transition text-[#252326] dark:text-[#F8F4EF]" title="Add to Wishlist">
            <i data-lucide="heart" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="mt-4 flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
          <span class="flex items-center gap-1.5"><i data-lucide="shield-check" class="w-3.5 h-3.5 text-[#572B3A] dark:text-[#C88F91]"></i> Discreet Packaging</span>
          <span class="flex items-center gap-1.5"><i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-[#572B3A] dark:text-[#C88F91]"></i> 30-Day Easy Returns</span>
        </div>
      </div>
    </div>
  `;

  window._qvSize = selectedSize;
  window._qvColor = selectedColor;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  initLucideIcons();
}

window.setQvSize = function(size, btn) {
  window._qvSize = size;
  const label = document.getElementById('qv-size-label');
  if (label) label.textContent = size;
  const container = btn.parentElement;
  container.querySelectorAll('button').forEach(b => {
    b.className = 'px-3.5 py-1.5 text-xs font-medium rounded-lg border transition border-[#E8D8C7] hover:border-[#572B3A] dark:border-[#572B3A]/60 dark:hover:border-[#C88F91] text-[#252326] dark:text-[#F8F4EF]';
  });
  btn.className = 'px-3.5 py-1.5 text-xs font-medium rounded-lg border transition border-[#572B3A] bg-[#572B3A] text-white dark:border-[#C88F91] dark:bg-[#C88F91] dark:text-[#252326]';
};

window.setQvColor = function(colorName, btn) {
  window._qvColor = colorName;
  const label = document.getElementById('qv-color-label');
  if (label) label.textContent = colorName;
  const container = btn.parentElement;
  container.querySelectorAll('button').forEach(b => {
    b.classList.remove('border-[#572B3A]', 'dark:border-[#C88F91]', 'scale-110');
    b.classList.add('border-stone-300');
  });
  btn.classList.add('border-[#572B3A]', 'dark:border-[#C88F91]', 'scale-110');
  btn.classList.remove('border-stone-300');
};

// --- Search Functionality ---
function initSearch() {
  const input = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');
  if (!input || !resultsContainer) return;

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
      resultsContainer.innerHTML = `
        <div class="text-center py-10 text-stone-400">
          <i data-lucide="sparkles" class="w-8 h-8 mx-auto mb-2 opacity-60"></i>
          <p class="text-sm">Search for silk bralettes, modal trunks, boxers, lace panties, or sleepwear...</p>
        </div>
      `;
      initLucideIcons();
      return;
    }

    const matches = VELORA_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.gender.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      resultsContainer.innerHTML = `
        <div class="text-center py-10 text-stone-400">
          <p class="text-sm">No luxury essentials found matching "${query}".</p>
          <a href="products.html" class="inline-block mt-3 text-xs uppercase tracking-wider font-semibold text-[#572B3A] dark:text-[#C88F91] underline">Browse Full Catalog</a>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${matches.map(p => `
          <div onclick="openQuickView('${p.id}'); document.getElementById('search-modal').classList.remove('active'); document.body.style.overflow='';" class="cursor-pointer group flex items-center gap-3 p-3 rounded-xl hover:bg-[#E8D8C7]/20 dark:hover:bg-[#572B3A]/20 transition border border-transparent hover:border-[#E8D8C7]/60">
            <img src="${getProductDisplayImage(p)}" alt="${p.name}" class="w-16 h-20 object-cover rounded-lg group-hover:scale-105 transition" />
            <div class="min-w-0">
              <span class="text-[10px] uppercase tracking-wider text-[#572B3A] dark:text-[#C88F91] font-semibold">${p.gender} • ${p.category}</span>
              <h4 class="font-medium text-sm text-[#252326] dark:text-[#F8F4EF] truncate">${p.name}</h4>
              <p class="text-xs font-semibold text-[#572B3A] dark:text-[#E8D8C7] mt-1">$${p.price.toFixed(2)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    initLucideIcons();
  });
}

// --- Home 1 Product Carousel/Slider ---
function renderHome1Products() {
  const container = document.getElementById('home1-product-slider');
  if (!container) return;

  const items = VELORA_PRODUCTS.slice(0, 6);
  container.innerHTML = items.map(p => createEditorialProductCard(p)).join('');
  initLucideIcons();
}

// --- Home 2 Bestseller Grid ---
function renderHome2Bestsellers() {
  const container = document.getElementById('home2-bestseller-grid');
  if (!container) return;

  const items = VELORA_PRODUCTS.filter(p => p.collections.includes('bestsellers')).slice(0, 4);
  container.innerHTML = items.map(p => createEditorialProductCard(p)).join('');
  initLucideIcons();
}

// --- Reusable Product Card HTML ---
function getProductDisplayImage(p) {
  if (!p) return '';
  const isProductsPage = window.location.pathname.includes('products.html') || !!document.getElementById('products-grid');
  return (isProductsPage && p.productPageImage) ? p.productPageImage : p.image;
}

function getProductImageCropClass(p, displayImg) {
  if (!p) return '';
  if (p.id === 'w-01') return 'crop-w01';
  if (p.id === 'w-02' && displayImg === p.productPageImage) return 'crop-w02';
  if (p.id === 'w-05') return 'crop-w05';
  return '';
}

function createEditorialProductCard(p) {
  const isWish = wishlistState.includes(p.id);
  const displayImg = getProductDisplayImage(p);
  const cropClass = getProductImageCropClass(p, displayImg);
  return `
    <div class="luxury-card group relative bg-white dark:bg-[#252326] rounded-2xl overflow-hidden border border-[#E8D8C7]/70 dark:border-[#572B3A]/40 flex flex-col h-full shadow-sm p-3">
      <!-- Image Container (Uniform Framed Box) -->
      <div class="product-img-frame">
        <img src="${displayImg}" alt="${p.name}" loading="lazy" class="product-img-el ${cropClass}" />
        
        <!-- Badge -->
        ${p.badge ? `
          <div class="absolute top-3 left-3 z-10">
            <span class="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#F8F4EF]/95 backdrop-blur-md text-[#572B3A] border border-[#E8D8C7] shadow-sm dark:bg-[#252326]/95 dark:text-[#E8D8C7] dark:border-[#572B3A]">
              ${p.badge}
            </span>
          </div>
        ` : ''}

        <!-- Wishlist Button -->
        <button 
          data-wishlist-id="${p.id}"
          onclick="toggleWishlist('${p.id}')" 
          class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 dark:bg-[#252326]/95 backdrop-blur-md flex items-center justify-center text-[#252326] dark:text-[#F8F4EF] shadow-md hover:scale-110 transition ${isWish ? 'text-rose-600' : ''}"
          title="Save to Wishlist">
          <i data-lucide="heart" class="w-4 h-4" style="${isWish ? 'fill: #C88F91;' : ''}"></i>
        </button>

        <!-- Hover Quick Actions Bar -->
        <div class="absolute inset-x-3 bottom-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
          <button 
            onclick="openQuickView('${p.id}')" 
            class="flex-1 py-2.5 px-3 rounded-xl bg-white/95 dark:bg-[#252326]/95 backdrop-blur-md text-xs font-semibold text-[#252326] dark:text-[#F8F4EF] hover:bg-[#572B3A] hover:text-white dark:hover:bg-[#C88F91] dark:hover:text-[#252326] transition shadow-md flex items-center justify-center gap-1.5">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i> Quick View
          </button>
          <button 
            onclick="addToCart('${p.id}')" 
            class="py-2.5 px-3 rounded-xl bg-[#572B3A] text-white hover:bg-[#3a1924] dark:bg-[#C88F91] dark:text-[#252326] dark:hover:bg-[#d49ea0] transition shadow-md flex items-center justify-center"
            title="Add to Bag">
            <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <!-- Card Body -->
      <div class="pt-4 px-2 pb-1 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-medium mb-1">
            <span>${p.gender} • ${p.category}</span>
            <div class="flex items-center gap-1 text-amber-500 font-semibold">
              ★ <span>${p.rating}</span>
            </div>
          </div>
          <h3 class="font-serif text-lg font-medium text-[#252326] dark:text-[#F8F4EF] line-clamp-1 min-h-[1.75rem] group-hover:text-[#572B3A] dark:group-hover:text-[#C88F91] transition">
            ${p.name}
          </h3>
        </div>

        <div class="mt-4 pt-3 border-t border-[#E8D8C7]/40 dark:border-[#572B3A]/30 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            ${p.colors.slice(0, 3).map(c => `
              <span class="w-3 h-3 rounded-full border border-stone-300 dark:border-stone-600" style="background-color: ${c.hex};" title="${c.name}"></span>
            `).join('')}
            ${p.colors.length > 3 ? `<span class="text-[10px] text-stone-400">+${p.colors.length - 3}</span>` : ''}
          </div>
          <div class="flex items-baseline gap-2">
            ${p.originalPrice ? `<span class="text-xs text-stone-400 line-through">$${p.originalPrice.toFixed(2)}</span>` : ''}
            <span class="font-semibold text-[#572B3A] dark:text-[#E8D8C7] text-base">$${p.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- Products Page Filter & Sort Engine ---
function initProductsPage() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('products-count');
  if (!grid) return;

  let activeGender = 'all';
  let activeCategory = 'all';
  let activeSort = 'popular';
  let activePrice = 'all';

  function filterAndRender() {
    let list = [...VELORA_PRODUCTS];

    if (activeGender !== 'all') {
      list = list.filter(p => p.gender === activeGender);
    }

    if (activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }

    if (activePrice === 'under-50') {
      list = list.filter(p => p.price < 50);
    } else if (activePrice === '50-100') {
      list = list.filter(p => p.price >= 50 && p.price <= 100);
    } else if (activePrice === 'over-100') {
      list = list.filter(p => p.price > 100);
    }

    if (activeSort === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (activeSort === 'newest') {
      list.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0));
    }

    if (countEl) {
      countEl.textContent = `Showing ${list.length} luxury styles`;
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-16">
          <p class="font-serif text-xl text-stone-500 dark:text-stone-400">No products match your selected criteria.</p>
          <button onclick="resetFilters()" class="mt-4 px-6 py-2.5 rounded-full bg-[#572B3A] text-white dark:bg-[#C88F91] dark:text-[#252326] text-xs font-semibold uppercase tracking-wider">Reset Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(p => createEditorialProductCard(p)).join('');
    initLucideIcons();
  }

  // Gender Filter Pills
  const genderPills = document.querySelectorAll('.gender-filter-btn');
  const gatewayCards = document.querySelectorAll('.gateway-gender-card');

  function updateGatewayActiveCard(gender) {
    gatewayCards.forEach(card => {
      const g = card.getAttribute('data-gender');
      const badge = card.querySelector('.active-badge');
      if (g === gender) {
        card.classList.add('ring-2', 'ring-offset-2', g === 'women' ? 'ring-velora-rose' : 'ring-velora-champagne');
        if (badge) badge.classList.remove('hidden');
      } else {
        card.classList.remove('ring-2', 'ring-offset-2', 'ring-velora-rose', 'ring-velora-champagne');
        if (badge) badge.classList.add('hidden');
      }
    });
  }

  function setGender(newGender, shouldScroll = false) {
    activeGender = newGender;
    genderPills.forEach(b => {
      if (b.getAttribute('data-gender') === newGender) {
        b.classList.remove('bg-white', 'text-[#252326]', 'dark:bg-[#252326]', 'dark:text-[#F8F4EF]');
        b.classList.add('bg-[#572B3A]', 'text-white', 'dark:bg-[#C88F91]', 'dark:text-[#252326]');
      } else {
        b.classList.remove('bg-[#572B3A]', 'text-white', 'dark:bg-[#C88F91]', 'dark:text-[#252326]');
        b.classList.add('bg-white', 'text-[#252326]', 'dark:bg-[#252326]', 'dark:text-[#F8F4EF]');
      }
    });
    updateGatewayActiveCard(newGender);
    filterAndRender();

    if (shouldScroll) {
      const collectionSection = document.getElementById('products-collection') || grid;
      if (collectionSection) {
        collectionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  genderPills.forEach(btn => {
    btn.addEventListener('click', () => {
      setGender(btn.getAttribute('data-gender'), false);
    });
  });

  // Gateway Cards Click (Men's & Women's Showcase Cards)
  gatewayCards.forEach(card => {
    card.addEventListener('click', () => {
      const g = card.getAttribute('data-gender');
      setGender(g, true);
    });
  });

  // Category Filter Pills
  const categoryPills = document.querySelectorAll('.category-filter-btn');
  categoryPills.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryPills.forEach(b => {
        b.classList.remove('border-[#572B3A]', 'text-[#572B3A]', 'dark:border-[#C88F91]', 'dark:text-[#C88F91]', 'font-semibold');
      });
      btn.classList.add('border-[#572B3A]', 'text-[#572B3A]', 'dark:border-[#C88F91]', 'dark:text-[#C88F91]', 'font-semibold');
      activeCategory = btn.getAttribute('data-category');
      filterAndRender();
    });
  });

  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      filterAndRender();
    });
  }

  // Price range dropdown
  const priceSelect = document.getElementById('price-filter-select');
  if (priceSelect) {
    priceSelect.addEventListener('change', (e) => {
      activePrice = e.target.value;
      filterAndRender();
    });
  }

  window.resetFilters = function() {
    activeGender = 'all';
    activeCategory = 'all';
    activeSort = 'popular';
    activePrice = 'all';
    if (sortSelect) sortSelect.value = 'popular';
    if (priceSelect) priceSelect.value = 'all';
    genderPills.forEach(b => {
      if (b.getAttribute('data-gender') === 'all') {
        b.classList.add('bg-[#572B3A]', 'text-white', 'dark:bg-[#C88F91]', 'dark:text-[#252326]');
        b.classList.remove('bg-white', 'text-[#252326]', 'dark:bg-[#252326]', 'dark:text-[#F8F4EF]');
      } else {
        b.classList.remove('bg-[#572B3A]', 'text-white', 'dark:bg-[#C88F91]', 'dark:text-[#252326]');
        b.classList.add('bg-white', 'text-[#252326]', 'dark:bg-[#252326]', 'dark:text-[#F8F4EF]');
      }
    });
    categoryPills.forEach(b => {
      if (b.getAttribute('data-category') === 'all') {
        b.classList.add('border-[#572B3A]', 'text-[#572B3A]', 'dark:border-[#C88F91]', 'dark:text-[#C88F91]', 'font-semibold');
      } else {
        b.classList.remove('border-[#572B3A]', 'text-[#572B3A]', 'dark:border-[#C88F91]', 'dark:text-[#C88F91]', 'font-semibold');
      }
    });
    updateGatewayActiveCard('all');
    filterAndRender();
  };

  // URL query param support (e.g. ?gender=men&category=bralettes)
  const params = new URLSearchParams(window.location.search);
  if (params.has('gender')) {
    setGender(params.get('gender'), false);
  }
  if (params.has('category')) {
    activeCategory = params.get('category');
    categoryPills.forEach(b => {
      if (b.getAttribute('data-category') === activeCategory) {
        b.classList.add('border-[#572B3A]', 'text-[#572B3A]', 'dark:border-[#C88F91]', 'dark:text-[#C88F91]', 'font-semibold');
      } else {
        b.classList.remove('border-[#572B3A]', 'text-[#572B3A]', 'dark:border-[#C88F91]', 'dark:text-[#C88F91]', 'font-semibold');
      }
    });
    filterAndRender();
  } else if (!params.has('gender')) {
    filterAndRender();
  }
}

// --- Interactive Size Calculator (Size Guide Page) ---
function initSizeCalculator() {
  const container = document.getElementById('size-calculator-container');
  if (!container) return;

  let activeTab = 'women'; // or 'men'
  let unit = 'inches'; // or 'cm'

  const tabWomen = document.getElementById('calc-tab-women');
  const tabMen = document.getElementById('calc-tab-men');
  const formWomen = document.getElementById('calc-form-women');
  const formMen = document.getElementById('calc-form-men');
  const unitToggles = document.querySelectorAll('.unit-toggle-btn');
  const resultCard = document.getElementById('calc-result-card');
  const resultText = document.getElementById('calc-result-size');
  const resultDesc = document.getElementById('calc-result-details');

  if (tabWomen && tabMen) {
    tabWomen.addEventListener('click', () => {
      activeTab = 'women';
      tabWomen.classList.add('bg-[#572B3A]', 'text-white', 'dark:bg-[#C88F91]', 'dark:text-[#252326]');
      tabMen.classList.remove('bg-[#572B3A]', 'text-white', 'dark:bg-[#C88F91]', 'dark:text-[#252326]');
      if (formWomen) formWomen.classList.remove('hidden');
      if (formMen) formMen.classList.add('hidden');
      if (resultCard) resultCard.classList.add('hidden');
    });

    tabMen.addEventListener('click', () => {
      activeTab = 'men';
      tabMen.classList.add('bg-[#572B3A]', 'text-white', 'dark:bg-[#C88F91]', 'dark:text-[#252326]');
      tabWomen.classList.remove('bg-[#572B3A]', 'text-white', 'dark:bg-[#C88F91]', 'dark:text-[#252326]');
      if (formMen) formMen.classList.remove('hidden');
      if (formWomen) formWomen.classList.add('hidden');
      if (resultCard) resultCard.classList.add('hidden');
    });
  }

  // Calculate Women's Bra & Panty Size
  const btnCalculateWomen = document.getElementById('btn-calc-women');
  if (btnCalculateWomen) {
    btnCalculateWomen.addEventListener('click', (e) => {
      e.preventDefault();
      const underbust = parseFloat(document.getElementById('women-underbust').value);
      const bust = parseFloat(document.getElementById('women-bust').value);
      const waist = parseFloat(document.getElementById('women-waist').value);
      const hip = parseFloat(document.getElementById('women-hip').value);

      if (!underbust || !bust) {
        showToast('Please enter both your snug underbust and full bust measurements.', 'info');
        return;
      }

      // Convert cm to inches if needed
      const isCm = document.querySelector('input[name="unit-radio"]:checked')?.value === 'cm';
      const uInches = isCm ? underbust / 2.54 : underbust;
      const bInches = isCm ? bust / 2.54 : bust;

      // Band size calculation (even number rounding)
      let band = Math.round(uInches);
      if (band % 2 !== 0) band += 1;

      // Cup size difference
      const diff = bInches - band;
      let cup = 'A';
      if (diff >= 0.5 && diff < 1.5) cup = 'A';
      else if (diff >= 1.5 && diff < 2.5) cup = 'B';
      else if (diff >= 2.5 && diff < 3.5) cup = 'C';
      else if (diff >= 3.5 && diff < 4.5) cup = 'D';
      else if (diff >= 4.5 && diff < 5.5) cup = 'DD / E';
      else if (diff >= 5.5) cup = 'F+';

      const braSize = `${band}${cup}`;

      // Panty size from hip/waist
      let pantySize = 'M (Medium)';
      const hInches = isCm && hip ? hip / 2.54 : hip;
      if (hInches) {
        if (hInches < 36) pantySize = 'XS (Extra Small)';
        else if (hInches <= 38) pantySize = 'S (Small)';
        else if (hInches <= 41) pantySize = 'M (Medium)';
        else if (hInches <= 44) pantySize = 'L (Large)';
        else pantySize = 'XL (Extra Large)';
      }

      if (resultCard && resultText && resultDesc) {
        resultText.textContent = braSize;
        resultDesc.innerHTML = `
          <div class="space-y-1">
            <p><strong>Recommended Bra Size:</strong> ${braSize}</p>
            <p><strong>Sister Sizes:</strong> ${band - 2}${nextCup(cup)} (tighter band) or ${band + 2}${prevCup(cup)} (looser band)</p>
            ${hip ? `<p><strong>Recommended Panty / Bottom Size:</strong> ${pantySize}</p>` : ''}
            <p class="text-xs text-stone-500 mt-2">Fabric note: For seamless styles, stick to ${pantySize}. For lace items, size up if between measurements.</p>
          </div>
        `;
        resultCard.classList.remove('hidden');
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  function nextCup(c) {
    if (c === 'A') return 'B';
    if (c === 'B') return 'C';
    if (c === 'C') return 'D';
    return 'DD';
  }
  function prevCup(c) {
    if (c === 'D') return 'C';
    if (c === 'C') return 'B';
    if (c === 'B') return 'A';
    return 'A';
  }

  // Calculate Men's Size
  const btnCalculateMen = document.getElementById('btn-calc-men');
  if (btnCalculateMen) {
    btnCalculateMen.addEventListener('click', (e) => {
      e.preventDefault();
      const waist = parseFloat(document.getElementById('men-waist').value);
      const chest = parseFloat(document.getElementById('men-chest').value);

      if (!waist) {
        showToast('Please enter your waist measurement.', 'info');
        return;
      }

      const isCm = document.querySelector('input[name="unit-radio"]:checked')?.value === 'cm';
      const wInches = isCm ? waist / 2.54 : waist;

      let trunkSize = 'M (Medium)';
      let vestSize = 'M (38-40")';

      if (wInches < 30) trunkSize = 'S (28-30")';
      else if (wInches <= 33) trunkSize = 'M (31-33")';
      else if (wInches <= 36) trunkSize = 'L (34-36")';
      else if (wInches <= 39) trunkSize = 'XL (37-39")';
      else trunkSize = 'XXL (40-42")';

      if (chest) {
        const cInches = isCm ? chest / 2.54 : chest;
        if (cInches < 37) vestSize = 'S (35-37")';
        else if (cInches <= 40) vestSize = 'M (38-40")';
        else if (cInches <= 43) vestSize = 'L (41-43")';
        else vestSize = 'XL (44-46")';
      }

      if (resultCard && resultText && resultDesc) {
        resultText.textContent = trunkSize.split(' ')[0];
        resultDesc.innerHTML = `
          <div class="space-y-1">
            <p><strong>Recommended Briefs / Trunks Size:</strong> ${trunkSize}</p>
            ${chest ? `<p><strong>Recommended Undershirt / Vest Size:</strong> ${vestSize}</p>` : ''}
            <p class="text-xs text-stone-500 mt-2">Fabric note: VELORA MicroModal has 4-way stretch. If you prefer a sculpted athletic fit, stay true to size; for relaxed sleepwear, consider one size up.</p>
          </div>
        `;
        resultCard.classList.remove('hidden');
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Reset calculator
  const btnReset = document.getElementById('calc-reset-btn');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (formWomen) formWomen.reset();
      if (formMen) formMen.reset();
      if (resultCard) resultCard.classList.add('hidden');
      showToast('Calculator cleared.', 'info');
    });
  }
}

// --- Accordions (FAQs) ---
window.toggleAccordionItem = function(btn) {
  if (!btn) return;
  const content = btn.nextElementSibling;
  if (!content) return;
  const icon = btn.querySelector('.accordion-icon') || btn.querySelector('svg');
  const isOpen = !content.classList.contains('hidden');

  // Close all in this group
  const parent = btn.closest('.accordion-group');
  if (parent) {
    parent.querySelectorAll('.accordion-content').forEach(c => c.classList.add('hidden'));
    parent.querySelectorAll('.accordion-icon, .accordion-btn svg').forEach(i => i.style.transform = 'rotate(0deg)');
  }

  if (!isOpen) {
    content.classList.remove('hidden');
    if (icon) icon.style.transform = 'rotate(180deg)';
  }
};

function initAccordions() {
  const accordionButtons = document.querySelectorAll('.accordion-btn');
  accordionButtons.forEach(btn => {
    btn.onclick = function() {
      window.toggleAccordionItem(this);
    };
  });
}

// --- Contact Form Submission ---
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('contact-status-msg');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !subject || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    // Submit animation simulation
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="inline-block animate-spin mr-2">⟳</span> Sending to Concierge...`;

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.innerHTML = originalText;
      if (statusEl) {
        statusEl.classList.remove('hidden');
        statusEl.innerHTML = `
          <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm">
            <h5 class="font-semibold text-base mb-1">Thank you, ${name}!</h5>
            <p>Your message has been assigned to a VELORA Private Client Concierge. We respond to all inquiries within 4 business hours.</p>
          </div>
        `;
      }
      showToast('Message sent successfully to VELORA Concierge.', 'success');
    }, 1200);
  });
}

// --- Global Forms (Newsletter) ---
function initGlobalForms() {
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value.trim()) {
        showToast('Welcome to VELORA Club. Check your inbox for your 15% VIP welcome code.', 'success');
        input.value = '';
      }
    });
  });
}

// --- Toast System ---
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm max-w-sm backdrop-blur-md transition-all duration-300';

  if (type === 'success') {
    toast.className += ' bg-white/95 dark:bg-[#252326]/95 border-emerald-400 text-[#252326] dark:text-[#F8F4EF]';
    toast.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5 text-emerald-500 shrink-0"></i> <span>${message}</span>`;
  } else if (type === 'error') {
    toast.className += ' bg-white/95 dark:bg-[#252326]/95 border-rose-400 text-[#252326] dark:text-[#F8F4EF]';
    toast.innerHTML = `<i data-lucide="alert-circle" class="w-5 h-5 text-rose-500 shrink-0"></i> <span>${message}</span>`;
  } else {
    toast.className += ' bg-white/95 dark:bg-[#252326]/95 border-[#C88F91] text-[#252326] dark:text-[#F8F4EF]';
    toast.innerHTML = `<i data-lucide="sparkles" class="w-5 h-5 text-[#C88F91] shrink-0"></i> <span>${message}</span>`;
  }

  container.appendChild(toast);
  initLucideIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

