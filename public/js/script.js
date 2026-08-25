// ============================================
// ÉLORIA - Luxury Perfume Brand JavaScript
// ============================================

// Tax and shipping configuration
const TAX_RATE = 0.18;
const FREE_SHIPPING_LIMIT = 5000;
const SHIPPING_CHARGE = 199;

document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  const preloader = document.querySelector('.preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 1500);
  });

  // Hero Slider
  const heroSlides = document.querySelectorAll('.hero-slide');
  const sliderDots = document.querySelectorAll('.slider-dot');
  const sliderPrev = document.querySelector('.slider-prev');
  const sliderNext = document.querySelector('.slider-next');
  let currentHeroSlide = 0;
  let heroSliderInterval;

  function showHeroSlide(index) {
    heroSlides.forEach((slide, i) => {
      slide.classList.remove('active');
      sliderDots[i].classList.remove('active');
      if (i === index) {
        slide.classList.add('active');
        sliderDots[i].classList.add('active');
      }
    });
    currentHeroSlide = index;
  }

  function nextHeroSlide() {
    const next = (currentHeroSlide + 1) % heroSlides.length;
    showHeroSlide(next);
  }

  function prevHeroSlide() {
    const prev = (currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
    showHeroSlide(prev);
  }

  // Auto-advance hero slider
  function startHeroSlider() {
    heroSliderInterval = setInterval(nextHeroSlide, 5000);
  }

  function stopHeroSlider() {
    clearInterval(heroSliderInterval);
  }

  // Slider navigation
  sliderPrev?.addEventListener('click', () => {
    stopHeroSlider();
    prevHeroSlide();
    startHeroSlider();
  });

  sliderNext?.addEventListener('click', () => {
    stopHeroSlider();
    nextHeroSlide();
    startHeroSlider();
  });

  sliderDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopHeroSlider();
      showHeroSlide(index);
      startHeroSlider();
    });
  });

  // Start hero slider
  if (heroSlides.length > 0) {
    startHeroSlider();
  }

  const heroSection = document.querySelector('.hero');
  const heroBottle = document.querySelector('.hero-perfume');
  const heroGlow = document.querySelector('.hero-image-wrapper');
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && heroSection) {
    const heroVideoScenes = [
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      'https://media.w3.org/2010/05/sintel/trailer.mp4',
      'https://media.w3.org/2010/05/bunny/trailer.mp4'
    ];
    let currentHeroVideo = 0;
    let heroVideoTimer;
    const playHeroVideoScene = () => {
      heroVideo.classList.remove('scene-visible');
      heroVideo.src = heroVideoScenes[currentHeroVideo];
      heroVideo.load();
      heroVideo.play().catch(() => heroSection.classList.add('video-fallback'));
    };
    heroVideo.addEventListener('canplay', () => heroSection.classList.add('video-ready'), { once: true });
    heroVideo.addEventListener('canplay', () => {
      heroSection.classList.remove('video-fallback');
      heroVideo.classList.add('scene-visible');
      clearTimeout(heroVideoTimer);
      heroVideoTimer = setTimeout(() => {
        currentHeroVideo = (currentHeroVideo + 1) % heroVideoScenes.length;
        playHeroVideoScene();
      }, 8000);
    });
    heroVideo.addEventListener('error', () => {
      heroSection.classList.add('video-fallback');
      clearTimeout(heroVideoTimer);
      heroVideoTimer = setTimeout(() => {
        currentHeroVideo = (currentHeroVideo + 1) % heroVideoScenes.length;
        playHeroVideoScene();
      }, 1000);
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      heroVideo.pause();
      heroSection.classList.add('video-fallback');
    } else {
      playHeroVideoScene();
    }
  }
  if (heroSection && heroBottle && heroGlow && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer: fine)').matches) {
    heroSection.addEventListener('mousemove', (event) => {
      const bounds = heroSection.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      heroBottle.style.transform = `translate(${x * 10}px, ${y * 8 - 5}px)`;
      heroGlow.style.setProperty('--hero-parallax-x', `${x * -14}px`);
      heroGlow.style.setProperty('--hero-parallax-y', `${y * -10}px`);
    });
    heroSection.addEventListener('mouseleave', () => {
      heroBottle.style.transform = '';
      heroGlow.style.setProperty('--hero-parallax-x', '0px');
      heroGlow.style.setProperty('--hero-parallax-y', '0px');
    });
  }

  document.querySelector('.hero-product-trigger')?.addEventListener('click', async () => {
    if (!allProducts.length) allProducts = await loadProducts();
    if (allProducts[0]) openProductModal(allProducts[0]._id);
  });

  // Custom Cursor
  const customCursor = document.querySelector('.custom-cursor');
  if (customCursor && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      customCursor.style.left = e.clientX + 'px';
      customCursor.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('a, button, .product-card, .ingredient-card').forEach(el => {
      el.addEventListener('mouseenter', () => customCursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => customCursor.classList.remove('hover'));
    });
  }

  // Scroll Progress
  const scrollProgress = document.querySelector('.scroll-progress');
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = progress + '%';
  });

  // Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Menu
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  mobileMenuClose.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Load Products from API
  async function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    const discoveryProducts = document.getElementById('discovery-products');

    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const result = await response.json();
      const products = result.success ? result.data : [];
      
      // Store products globally
      window.allProducts = products;
      
      // Render featured collection
      renderProducts(products, productsGrid);
      
      // Render discovery products
      renderProducts(products, discoveryProducts);
      
      return products;
    } catch (error) {
      console.error('Error loading products:', error);
      productsGrid.innerHTML = '<div class="error-state">Unable to load the collection. Please try again.</div>';
      discoveryProducts.innerHTML = '<div class="error-state">Unable to load the collection. Please try again.</div>';
      return [];
    }
  }

  function renderProducts(products, container) {
    if (!container) return;
    
    container.innerHTML = products.map(product => `
      <div class="product-card scroll-reveal" data-category="${product.category}" data-id="${product._id}" data-stock="${product.stock}">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <button class="wishlist-btn" data-id="${product._id}">
            <i class="far fa-heart"></i>
          </button>
        </div>
        <div class="product-info">
          <p class="product-family">${product.fragranceFamily}</p>
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.shortDescription || product.description.substring(0, 100)}...</p>
          <p class="stock-indicator ${product.stock === 0 ? 'out-of-stock' : product.stock <= 3 ? 'low-stock' : ''}">
            ${product.stock === 0 ? 'OUT OF STOCK' : product.stock <= 3 ? `Only ${product.stock} left` : `In Stock: ${product.stock}`}
          </p>
          <p class="product-price">₹${product.price.toLocaleString()}</p>
          <div class="product-actions">
            <button class="btn btn-primary btn-sm add-to-cart" data-id="${product._id}" ${product.stock === 0 ? 'disabled' : ''}>
              ${product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
            </button>
            <button class="btn btn-secondary btn-sm view-details" data-id="${product._id}">VIEW DETAILS</button>
          </div>
        </div>
      </div>
    `).join('');

    // Re-attach event listeners — scoped to this container only
    attachProductEventListeners(container);
    attachWishlistListeners(container);
    
    // Trigger scroll animations
    observeScrollAnimations();
  }

  function attachProductEventListeners(container) {
    const scope = container || document;
    // Add to cart buttons — scoped to container to avoid duplicate listeners
    scope.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.disabled) return;
        const productId = btn.dataset.id;
        addToCart(productId);
      });
    });

    // View details buttons
    scope.querySelectorAll('.view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = btn.dataset.id;
        openProductModal(productId);
      });
    });
  }

  function attachWishlistListeners(container) {
    const scope = container || document;
    scope.querySelectorAll('.wishlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.currentTarget.dataset.id;
        toggleWishlist(productId, e.currentTarget);
      });
    });
  }

  // Product Filtering
  const discoveryBtns = document.querySelectorAll('.discovery-btn');
  let allProducts = [];

  discoveryBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      discoveryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.dataset.category;
      const discoveryProducts = document.getElementById('discovery-products');
      
      if (allProducts.length === 0) {
        allProducts = await loadProducts();
      }
      
      const filteredProducts = category === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.category === category);
      
      renderProducts(filteredProducts, discoveryProducts);
    });
  });

  // Cart Functionality
  let cart = JSON.parse(localStorage.getItem('eloriaCart')) || [];
  let currentUser = null;
  let authReturnTo = '#collection';

  async function checkAuthentication() {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' });
      return await response.json();
    } catch (error) {
      return { authenticated: false, user: null };
    }
  }

  function updateAuthUI() {
    const label = document.querySelector('.account-label');
    const adminLink = document.querySelector('.admin-portal-link');
    if (adminLink) {
      adminLink.style.display = (currentUser && currentUser.role === 'admin') ? 'block' : 'none';
    }
    if (label) {
      if (currentUser && currentUser.firstName) {
        label.textContent = `Hi, ${currentUser.firstName}`;
      } else {
        label.textContent = 'SIGN IN';
      }
    }
  }

  function savePendingCartAction(productId, quantity = 1) {
    localStorage.setItem('eloriaPendingCartAction', JSON.stringify({ productId, quantity }));
  }

  async function requireAuthentication(returnTo = '#collection') {
    const auth = await checkAuthentication();
    if (auth.authenticated) {
      currentUser = auth.user;
      updateAuthUI();
      return true;
    }
    authReturnTo = returnTo;
    openAuthPanel('login');
    showToast('Please sign in to continue.', 'error');
    return false;
  }

  async function resumePendingCartAction() {
    const pending = JSON.parse(localStorage.getItem('eloriaPendingCartAction') || 'null');
    if (!pending) return;
    localStorage.removeItem('eloriaPendingCartAction');
    if (allProducts.length === 0) allProducts = await loadProducts();
    const product = allProducts.find(item => item._id === pending.productId);
    if (!product || product.stock < pending.quantity) {
      showToast('That fragrance is no longer available.', 'error');
      return;
    }
    for (let i = 0; i < pending.quantity; i++) performAddToCart(product._id);
  }

  async function addToCart(productId, quantity = 1) {
    if (!(await requireAuthentication())) {
      savePendingCartAction(productId, quantity);
      return;
    }
    if (allProducts.length === 0) {
      loadProducts().then(products => {
        allProducts = products;
        for (let i = 0; i < quantity; i++) performAddToCart(productId);
      });
    } else {
      for (let i = 0; i < quantity; i++) performAddToCart(productId);
    }
  }

  function performAddToCart(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    if (product.stock === 0) {
      showToast('This product is out of stock', 'error');
      return;
    }

    const existingItem = cart.find(item => item._id === productId);
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    if (currentQty >= product.stock) {
      showToast(`Only ${product.stock} available`, 'error');
      return;
    }

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    showToast(`${product.name} added to your collection`, 'success');
    openCartDrawer();
  }

  function removeFromCart(productId) {
    cart = cart.filter(item => item._id !== productId);
    updateCart();
    showToast('Removed from cart', 'success');
  }

  function updateQuantity(productId, change) {
    const item = cart.find(item => item._id === productId);
    const product = allProducts.find(p => p._id === productId);
    
    if (item && product) {
      const newQty = item.quantity + change;
      
      if (newQty <= 0) {
        removeFromCart(productId);
      } else if (newQty > product.stock) {
        showToast(`Only ${product.stock} bottles are currently available.`, 'error');
      } else {
        item.quantity = newQty;
        updateCart();
      }
    }
  }

  function updateCart() {
    localStorage.setItem('eloriaCart', JSON.stringify(cart));
    updateCartUI();
  }

  window.updateQuantity = updateQuantity;
  window.removeFromCart = removeFromCart;

  function calculateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Apply discount if coupon is applied
    let discount = 0;
    if (checkoutData.appliedCoupon) {
      const coupon = checkoutData.appliedCoupon;
      discount = coupon.discount ?? (coupon.discountType === 'percentage'
        ? Math.round(subtotal * (coupon.discountValue / 100))
        : coupon.discountValue);
    }
    
    const taxableAmount = subtotal - discount;
    const tax = Math.round(taxableAmount * TAX_RATE);
    const shipping = subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_CHARGE;
    const total = taxableAmount + tax + shipping;
    
    return { subtotal, discount, tax, shipping, total };
  }

  function updateCartUI() {
    const cartBadge = document.querySelector('.cart-badge');
    const cartItems = document.getElementById('cart-items');
    const cartTotalAmount = document.querySelector('.cart-total-amount');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const { total } = calculateCartTotals();
    
    cartBadge.textContent = totalItems;
    cartTotalAmount.textContent = '₹' + total.toLocaleString();
    
    if (cart.length === 0) {
      cartItems.innerHTML = '<div class="cart-empty-state"><h3>Your Collection Awaits</h3><p>Discover a fragrance that becomes your signature.</p><button class="btn btn-secondary explore-cart">EXPLORE ÉLORIA</button></div>';
      cartItems.querySelector('.explore-cart').addEventListener('click', () => { closeCartDrawer(); document.querySelector('#collection').scrollIntoView({ behavior: 'smooth' }); });
    } else {
      const { subtotal, tax, shipping } = calculateCartTotals();
      cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <p class="cart-item-price">₹${item.price.toLocaleString()}</p>
            <p class="cart-item-total">Item Total: ₹${(item.price * item.quantity).toLocaleString()}</p>
            <div class="cart-item-quantity">
              <button class="quantity-btn" onclick="updateQuantity('${item._id}', -1)">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-btn" onclick="updateQuantity('${item._id}', 1)">+</button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart('${item._id}')">Remove</button>
        </div>
      `).join('') + `
        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>₹${subtotal.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>Tax (18%)</span>
            <span>₹${tax.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>₹${shipping === 0 ? 'FREE' : shipping.toLocaleString()}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>₹${total.toLocaleString()}</span>
          </div>
        </div>
      `;
    }
  }

  // Checkout Modal - Define BEFORE cart checkout button
  const checkoutModal = document.querySelector('.checkout-modal');
  const checkoutClose = document.querySelector('.checkout-content .modal-close');
  const orderConfirmationModal = document.querySelector('.order-confirmation-modal');
  const confirmationClose = document.querySelector('.confirmation-content .modal-close');
  
  console.log('Checkout modal element:', checkoutModal);
  console.log('Checkout close element:', checkoutClose);
  console.log('Order confirmation modal:', orderConfirmationModal);
  console.log('Confirmation close element:', confirmationClose);
  
  // Checkout state
  let currentStep = 1;
  let checkoutData = {
    customer: {},
    shippingAddress: {},
    paymentMethod: 'cod',
    transactionId: null,
    appliedCoupon: null
  };
  let isProcessingOrder = false;

  function openCheckoutModal() {
    console.log('Opening checkout modal');
    console.log('checkoutModal:', checkoutModal);
    
    if (!checkoutModal) {
      console.error('Checkout modal element not found');
      return;
    }
    
    checkoutModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    currentStep = 1;
    updateCheckoutUI();
    loadCheckoutData();
    renderOrderSummary();
    
    console.log('Modal classes after open:', checkoutModal.className);
    console.log('Modal display:', window.getComputedStyle(checkoutModal).display);
    console.log('Modal visibility:', window.getComputedStyle(checkoutModal).visibility);
    console.log('Modal opacity:', window.getComputedStyle(checkoutModal).opacity);
  }

  function closeCheckoutModal() {
    checkoutModal.classList.remove('open');
    document.body.style.overflow = '';
    resetCheckout();
  }

  function closeOrderConfirmation() {
    orderConfirmationModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  checkoutClose?.addEventListener('click', closeCheckoutModal);
  checkoutModal?.querySelector('.modal-overlay')?.addEventListener('click', closeCheckoutModal);
  confirmationClose?.addEventListener('click', closeOrderConfirmation);
  orderConfirmationModal?.querySelector('.modal-overlay')?.addEventListener('click', closeOrderConfirmation);

  // Load saved checkout data
  function loadCheckoutData() {
    const savedData = localStorage.getItem('eloriaCheckoutData');
    if (savedData) {
      checkoutData = JSON.parse(savedData);
      
      // Populate customer form
      if (checkoutData.customer.name) document.getElementById('customer-name').value = checkoutData.customer.name;
      if (checkoutData.customer.email) document.getElementById('customer-email').value = checkoutData.customer.email;
      if (checkoutData.customer.phone) document.getElementById('customer-phone').value = checkoutData.customer.phone;
      
      // Populate shipping form
      if (checkoutData.shippingAddress.address) document.getElementById('shipping-address').value = checkoutData.shippingAddress.address;
      if (checkoutData.shippingAddress.landmark) document.getElementById('shipping-landmark').value = checkoutData.shippingAddress.landmark;
      if (checkoutData.shippingAddress.city) document.getElementById('shipping-city').value = checkoutData.shippingAddress.city;
      if (checkoutData.shippingAddress.state) document.getElementById('shipping-state').value = checkoutData.shippingAddress.state;
      if (checkoutData.shippingAddress.pincode) document.getElementById('shipping-pincode').value = checkoutData.shippingAddress.pincode;
      
      // Set payment method
      checkoutData.paymentMethod = checkoutData.paymentMethod || 'cod';
      updatePaymentSelection();
      
      // Load coupon
      if (checkoutData.appliedCoupon) {
        document.getElementById('coupon-input').value = checkoutData.appliedCoupon.code;
        showAppliedCoupon();
      }
    }
  }

  function saveCheckoutData() {
    localStorage.setItem('eloriaCheckoutData', JSON.stringify(checkoutData));
  }

  function resetCheckout() {
    currentStep = 1;
    checkoutData = {
      customer: {},
      shippingAddress: {},
      paymentMethod: 'cod',
      transactionId: null,
      appliedCoupon: null
    };
    document.getElementById('customer-form').reset();
    document.getElementById('shipping-form').reset();
    document.getElementById('terms-checkbox').checked = false;
    document.getElementById('coupon-input').value = '';
    hideCouponMessages();
    hideDiscountRows();
    localStorage.removeItem('eloriaCheckoutData');
  }

  // Update checkout UI
  function updateCheckoutUI() {
    // Update progress steps
    document.querySelectorAll('.step-item').forEach(step => {
      const stepNum = parseInt(step.dataset.step);
      step.classList.remove('active', 'completed');
      
      if (stepNum === currentStep) {
        step.classList.add('active');
      } else if (stepNum < currentStep) {
        step.classList.add('completed');
        step.querySelector('.step-number').textContent = '✓';
      } else {
        step.querySelector('.step-number').textContent = stepNum < 10 ? `0${stepNum}` : stepNum;
      }
    });
    
    // Show current step
    document.querySelectorAll('.checkout-step').forEach(step => {
      step.classList.remove('active');
      if (parseInt(step.dataset.step) === currentStep) {
        step.classList.add('active');
      }
    });
    
    // Update back button
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
      btn.disabled = currentStep === 1;
    });
  }

  // Step navigation
  document.querySelectorAll('.continue-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateCurrentStep()) {
        saveCurrentStepData();
        currentStep++;
        updateCheckoutUI();
        if (currentStep === 4) {
          populateReviewData();
          renderOrderSummary();
        }
      }
    });
  });

  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateCheckoutUI();
      }
    });
  });

  // Edit buttons in review
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const editSection = btn.dataset.edit;
      if (editSection === 'customer') currentStep = 1;
      else if (editSection === 'shipping') currentStep = 2;
      else if (editSection === 'payment') currentStep = 3;
      updateCheckoutUI();
    });
  });

  // Validate current step
  function validateCurrentStep() {
    clearErrors();
    
    if (currentStep === 1) {
      return validateCustomerForm();
    } else if (currentStep === 2) {
      return validateShippingForm();
    } else if (currentStep === 3) {
      return validatePaymentStep();
    } else if (currentStep === 4) {
      return validateReviewStep();
    }
    return true;
  }

  function saveCurrentStepData() {
    if (currentStep === 1) {
      checkoutData.customer = {
        name: document.getElementById('customer-name').value.trim(),
        email: document.getElementById('customer-email').value.trim(),
        phone: document.getElementById('customer-phone').value.trim()
      };
    } else if (currentStep === 2) {
      checkoutData.shippingAddress = {
        address: document.getElementById('shipping-address').value.trim(),
        landmark: document.getElementById('shipping-landmark').value.trim(),
        city: document.getElementById('shipping-city').value.trim(),
        state: document.getElementById('shipping-state').value.trim(),
        pincode: document.getElementById('shipping-pincode').value.trim(),
        country: document.getElementById('shipping-country').value.trim()
      };
    }
    saveCheckoutData();
  }

  // Validation functions
  function validateCustomerForm() {
    const name = document.getElementById('customer-name').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    
    let isValid = true;
    
    if (name.length < 2) {
      showError('customer-name', 'Please enter your full name');
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('customer-email', 'Please enter a valid email address');
      isValid = false;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      showError('customer-phone', 'Please enter a valid 10-digit phone number');
      isValid = false;
    }
    
    return isValid;
  }

  function validateShippingForm() {
    const address = document.getElementById('shipping-address').value.trim();
    const city = document.getElementById('shipping-city').value.trim();
    const state = document.getElementById('shipping-state').value.trim();
    const pincode = document.getElementById('shipping-pincode').value.trim();
    
    let isValid = true;
    
    if (!address) {
      showError('shipping-address', 'Please enter your address');
      isValid = false;
    }
    
    if (!city) {
      showError('shipping-city', 'Please enter your city');
      isValid = false;
    }
    
    if (!state) {
      showError('shipping-state', 'Please enter your state');
      isValid = false;
    }
    
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
      showError('shipping-pincode', 'Please enter a valid 6-digit pincode');
      isValid = false;
    }
    
    return isValid;
  }

  function validatePaymentStep() {
    // Payment method is always selected (default COD)
    checkoutData.paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    return true;
  }

  function validateReviewStep() {
    const termsChecked = document.getElementById('terms-checkbox').checked;
    
    if (!termsChecked) {
      document.getElementById('terms-error').textContent = 'Please accept the Terms & Conditions';
      return false;
    }
    
    return true;
  }

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
      errorSpan.textContent = message;
    }
  }

  function clearErrors() {
    document.querySelectorAll('.error-message').forEach(span => {
      span.textContent = '';
    });
  }

  // Payment selection
  document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      const radio = option.querySelector('input[type="radio"]');
      radio.checked = true;
      
      const method = option.dataset.method;
      checkoutData.paymentMethod = method;
      
      const demoSection = document.getElementById('demo-payment-section');
      const continueBtn = document.getElementById('payment-continue-btn');
      
      if (method !== 'cod') {
        demoSection.style.display = 'block';
        continueBtn.disabled = true;
        updateDemoPaymentAmount();
      } else {
        demoSection.style.display = 'none';
        continueBtn.disabled = false;
        checkoutData.transactionId = null;
      }
    });
  });

  function updatePaymentSelection() {
    document.querySelectorAll('.payment-option').forEach(opt => {
      opt.classList.remove('selected');
      if (opt.dataset.method === checkoutData.paymentMethod) {
        opt.classList.add('selected');
        opt.querySelector('input[type="radio"]').checked = true;
      }
    });
    const demoSection = document.getElementById('demo-payment-section');
    const continueBtn = document.getElementById('payment-continue-btn');
    const digitalPayment = checkoutData.paymentMethod !== 'cod';
    demoSection.style.display = digitalPayment ? 'block' : 'none';
    continueBtn.disabled = digitalPayment && !checkoutData.transactionId;
    if (digitalPayment) updateDemoPaymentAmount();
  }

  function updateDemoPaymentAmount() {
    const { total } = calculateCartTotals();
    document.querySelector('.demo-total').textContent = `₹${total.toLocaleString()}`;
    document.getElementById('demo-pay-btn').textContent = `PAY ₹${total.toLocaleString()}`;
  }

  // Demo payment simulation
  document.getElementById('demo-pay-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('demo-pay-btn');
    const status = document.getElementById('demo-payment-status');
    
    btn.disabled = true;
    status.textContent = 'Processing secure payment...';
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate transaction ID
    const transactionId = `TXN-ELR-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    checkoutData.transactionId = transactionId;
    
    status.textContent = 'Payment Successful';
    status.style.color = '#4CAF50';
    
    document.getElementById('payment-continue-btn').disabled = false;
  });

  // Coupon functionality
  document.getElementById('apply-coupon-btn')?.addEventListener('click', async () => {
    const code = document.getElementById('coupon-input').value.trim().toUpperCase();
    
    if (!code) {
      showCouponError('Please enter a coupon code');
      return;
    }
    
    const { subtotal } = calculateCartTotals();
    
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderValue: subtotal })
      });
      
      const result = await response.json();
      
      if (result.success) {
        checkoutData.appliedCoupon = result.data;
        showCouponSuccess(`${result.data.code} applied successfully`);
        showAppliedCoupon();
        updateOrderSummary();
        saveCheckoutData();
      } else {
        showCouponError(result.message);
      }
    } catch (error) {
      showCouponError('Failed to validate coupon');
    }
  });

  document.getElementById('remove-coupon-btn')?.addEventListener('click', () => {
    checkoutData.appliedCoupon = null;
    document.getElementById('coupon-input').value = '';
    hideCouponMessages();
    hideAppliedCoupon();
    updateOrderSummary();
    saveCheckoutData();
  });

  function showCouponError(message) {
    document.getElementById('coupon-error').textContent = message;
    document.getElementById('coupon-success').textContent = '';
  }

  function showCouponSuccess(message) {
    document.getElementById('coupon-success').textContent = message;
    document.getElementById('coupon-error').textContent = '';
  }

  function hideCouponMessages() {
    document.getElementById('coupon-error').textContent = '';
    document.getElementById('coupon-success').textContent = '';
  }

  function showAppliedCoupon() {
    document.getElementById('remove-coupon-btn').style.display = 'block';
    document.getElementById('apply-coupon-btn').style.display = 'none';
    document.getElementById('coupon-input').disabled = true;
  }

  function hideAppliedCoupon() {
    document.getElementById('remove-coupon-btn').style.display = 'none';
    document.getElementById('apply-coupon-btn').style.display = 'block';
    document.getElementById('coupon-input').disabled = false;
  }

  function hideDiscountRows() {
    document.getElementById('summary-discount-row').style.display = 'none';
    document.getElementById('review-discount-row').style.display = 'none';
  }

  // Terms checkbox
  document.getElementById('terms-checkbox')?.addEventListener('change', (e) => {
    const placeOrderBtn = document.getElementById('place-order-btn');
    const termsError = document.getElementById('terms-error');
    
    if (e.target.checked) {
      termsError.textContent = '';
      placeOrderBtn.disabled = false;
    } else {
      placeOrderBtn.disabled = true;
    }
  });

  // Place order
  document.getElementById('place-order-btn')?.addEventListener('click', async () => {
    if (isProcessingOrder) return;
    
    if (!validateReviewStep()) return;
    
    isProcessingOrder = true;
    const placeOrderBtn = document.getElementById('place-order-btn');
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'PLACING YOUR ORDER...';
    
    // Populate review data
    populateReviewData();
    
    const items = cart.map(item => ({
      productId: item._id,
      quantity: item.quantity
    }));
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: checkoutData.customer,
          shippingAddress: checkoutData.shippingAddress,
          paymentMethod: checkoutData.paymentMethod,
          couponCode: checkoutData.appliedCoupon?.code,
          transactionId: checkoutData.transactionId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        cart = [];
        updateCart();
        closeCheckoutModal();
        showOrderConfirmation(result.data);
        resetCheckout();
      } else {
        showToast(result.message || 'Failed to place order', 'error');
        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'PLACE ORDER';
      }
    } catch (error) {
      showToast('Failed to place order. Please try again.', 'error');
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'PLACE ORDER';
    }
    
    isProcessingOrder = false;
  });

  // Populate review data
  function populateReviewData() {
    // Customer
    document.getElementById('review-customer').innerHTML = `
      <div class="detail-item">
        <span>Name</span>
        <span>${checkoutData.customer.name}</span>
      </div>
      <div class="detail-item">
        <span>Email</span>
        <span>${checkoutData.customer.email}</span>
      </div>
      <div class="detail-item">
        <span>Phone</span>
        <span>${checkoutData.customer.phone}</span>
      </div>
    `;
    
    // Shipping
    const sa = checkoutData.shippingAddress;
    document.getElementById('review-shipping').innerHTML = `
      <div class="detail-item full">
        ${sa.address}${sa.landmark ? ', ' + sa.landmark : ''}<br>
        ${sa.city}, ${sa.state} - ${sa.pincode}<br>
        ${sa.country}
      </div>
    `;
    
    // Payment
    document.getElementById('review-payment').innerHTML = `
      <div class="detail-item">
        <span>Method</span>
        <span>${checkoutData.paymentMethod === 'cod' ? 'Cash on Delivery' : checkoutData.paymentMethod === 'upi' ? 'UPI Payment' : 'Card Payment'}</span>
      </div>
      ${checkoutData.transactionId ? `
      <div class="detail-item">
        <span>Transaction ID</span>
        <span>${checkoutData.transactionId}</span>
      </div>
      ` : ''}
    `;
    
    // Products
    document.getElementById('review-products').innerHTML = cart.map(item => `
      <div class="review-item">
        <img src="${item.image}" alt="${item.name}" class="review-item-image">
        <div class="review-item-info">
          <h5>${item.name}</h5>
          <p>₹${item.price.toLocaleString()}</p>
        </div>
        <div class="review-item-qty">Qty: ${item.quantity}</div>
      </div>
    `).join('');
    
    // Order summary
    const { subtotal, discount, tax, shipping, total } = calculateCartTotals();
    document.getElementById('review-subtotal').textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById('review-tax').textContent = `₹${tax.toLocaleString()}`;
    document.getElementById('review-shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`;
    document.getElementById('review-total').textContent = `₹${total.toLocaleString()}`;
    
    if (discount > 0) {
      document.getElementById('review-discount-row').style.display = 'flex';
      document.getElementById('review-discount').textContent = `-₹${discount.toLocaleString()}`;
    }
  }

  // Render order summary
  function renderOrderSummary() {
    const { subtotal, discount, tax, shipping, total } = calculateCartTotals();
    
    // Order items
    document.getElementById('order-items-summary').innerHTML = cart.map(item => `
      <div class="order-summary-item">
        <img src="${item.image}" alt="${item.name}" class="order-summary-item-image">
        <div class="order-summary-item-info">
          <h5>${item.name}</h5>
          <p>₹${item.price.toLocaleString()}</p>
        </div>
        <div class="order-summary-item-qty">x${item.quantity}</div>
      </div>
    `).join('');
    
    // Summary totals
    document.getElementById('summary-subtotal').textContent = `₹${subtotal.toLocaleString()}`;
    document.getElementById('summary-tax').textContent = `₹${tax.toLocaleString()}`;
    document.getElementById('summary-shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`;
    document.getElementById('summary-total').textContent = `₹${total.toLocaleString()}`;
    
    if (discount > 0) {
      document.getElementById('summary-discount-row').style.display = 'flex';
      document.getElementById('summary-discount').textContent = `-₹${discount.toLocaleString()}`;
    } else {
      hideDiscountRows();
    }
  }

  function updateOrderSummary() {
    renderOrderSummary();
  }

  // Order confirmation
  function showOrderConfirmation(order) {
    orderConfirmationModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    document.getElementById('confirmation-order-number').textContent = order.orderNumber;
    document.getElementById('conf-order-number').textContent = order.orderNumber;
    
    if (order.transactionId) {
      document.getElementById('conf-transaction-row').style.display = 'flex';
      document.getElementById('conf-transaction-id').textContent = order.transactionId;
    }
    
    document.getElementById('conf-payment-method').textContent = order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'upi' ? 'UPI Payment' : 'Card Payment';
    document.getElementById('conf-order-status').textContent = order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);
    
    document.getElementById('conf-shipping-address').innerHTML = order.shippingAddress.address + 
      (order.shippingAddress.landmark ? ', ' + order.shippingAddress.landmark : '') + ', ' +
      order.shippingAddress.city + ', ' +
      order.shippingAddress.state + ' - ' +
      order.shippingAddress.pincode;
    
    document.getElementById('conf-order-items').innerHTML = order.items.map(item => `
      <div class="conf-order-item">
        <img src="${item.image}" alt="${item.name}" class="conf-order-item-image">
        <div class="conf-order-item-info">
          <h5>${item.name}</h5>
          <p>₹${item.price.toLocaleString()}</p>
        </div>
        <div class="conf-order-item-qty">x${item.quantity}</div>
      </div>
    `).join('');
    
    document.getElementById('conf-subtotal').textContent = `₹${order.subtotal.toLocaleString()}`;
    
    if (order.discount > 0) {
      document.getElementById('conf-discount-row').style.display = 'flex';
      document.getElementById('conf-discount').textContent = `-₹${order.discount.toLocaleString()}`;
    }
    
    document.getElementById('conf-tax').textContent = `₹${order.tax.toLocaleString()}`;
    document.getElementById('conf-shipping').textContent = order.shipping === 0 ? 'FREE' : `₹${order.shipping.toLocaleString()}`;
    document.getElementById('conf-total').textContent = `₹${order.total.toLocaleString()}`;
  }

  document.querySelector('.continue-shopping-btn')?.addEventListener('click', () => {
    closeOrderConfirmation();
    location.reload();
  });

  // Cart Drawer
  const cartIcon = document.querySelector('.cart-icon');
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartClose = document.querySelector('.cart-close');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartCheckout = document.querySelector('.cart-checkout');

  cartIcon.addEventListener('click', openCartDrawer);
  cartClose.addEventListener('click', closeCartDrawer);
  cartOverlay.addEventListener('click', closeCartDrawer);
  
  if (cartCheckout) {
    cartCheckout.addEventListener('click', () => {
      console.log('Checkout button clicked');
      console.log('Cart items:', cart);
      
      if (cart.length === 0) {
        showToast('Your collection is empty. Add a fragrance before continuing.', 'error');
        return;
      }
      
      requireAuthentication('#checkout').then(authenticated => {
        if (!authenticated) return;
        closeCartDrawer();
        openCheckoutModal();
      });
    });
  } else {
    console.error('Cart checkout button not found');
  }

  function openCartDrawer() {
    cartDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    cartDrawer.classList.remove('open');
    document.body.style.overflow = '';
  }

  const clearCartButton = document.querySelector('.cart-clear');
  const confirmModal = document.querySelector('.confirm-modal');
  const closeConfirmModal = () => { confirmModal.classList.remove('open'); document.body.style.overflow = ''; };
  clearCartButton?.addEventListener('click', () => { if (cart.length) { confirmModal.classList.add('open'); document.body.style.overflow = 'hidden'; } });
  document.querySelector('.keep-cart')?.addEventListener('click', closeConfirmModal);
  document.querySelector('.confirm-overlay')?.addEventListener('click', closeConfirmModal);
  document.querySelector('.confirm-clear-cart')?.addEventListener('click', () => { cart = []; updateCart(); closeConfirmModal(); showToast('Your collection has been cleared.', 'success'); });

  // Product Modal
  const productModal = document.querySelector('.product-modal');
  const modalClose = document.querySelector('.modal-close');
  const modalOverlay = document.querySelector('.modal-overlay');
  let currentModalProduct = null;

  async function openProductModal(productId) {
    if (allProducts.length === 0) {
      allProducts = await loadProducts();
    }
    
    currentModalProduct = allProducts.find(p => p._id === productId);
    if (!currentModalProduct) return;

    document.getElementById('modal-image').src = currentModalProduct.image;
    document.getElementById('modal-image').alt = currentModalProduct.name;
    document.getElementById('modal-category').textContent = currentModalProduct.category;
    document.getElementById('modal-title').textContent = currentModalProduct.name;
    document.getElementById('modal-price').textContent = '₹' + currentModalProduct.price.toLocaleString();
    document.getElementById('modal-description').textContent = currentModalProduct.description;
    document.getElementById('modal-top-notes').textContent = currentModalProduct.topNotes.join(', ');
    document.getElementById('modal-heart-notes').textContent = currentModalProduct.heartNotes.join(', ');
    document.getElementById('modal-base-notes').textContent = currentModalProduct.baseNotes.join(', ');
    modalQty = 1;
    document.getElementById('modal-quantity').textContent = '1';

    productModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  modalClose.addEventListener('click', closeProductModal);
  modalOverlay.addEventListener('click', closeProductModal);

  function closeProductModal() {
    productModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Modal Quantity
  const quantityMinus = document.querySelector('.quantity-minus');
  const quantityPlus = document.querySelector('.quantity-plus');
  const modalQuantity = document.getElementById('modal-quantity');
  let modalQty = 1;

  quantityMinus.addEventListener('click', () => {
    if (modalQty > 1) {
      modalQty--;
      modalQuantity.textContent = modalQty;
    }
  });

  quantityPlus.addEventListener('click', () => {
    if (currentModalProduct && modalQty < currentModalProduct.stock) {
      modalQty++;
      modalQuantity.textContent = modalQty;
    } else {
      showToast(`Only ${currentModalProduct.stock} bottles are currently available.`, 'error');
    }
  });

  // Modal Add to Cart
  const modalAddCart = document.querySelector('.modal-add-cart');
  modalAddCart.addEventListener('click', async () => {
    if (currentModalProduct) {
      if (!(await requireAuthentication('#collection'))) {
        savePendingCartAction(currentModalProduct._id, modalQty);
        closeProductModal();
        return;
      }
      for (let i = 0; i < modalQty; i++) {
        performAddToCart(currentModalProduct._id);
      }
      closeProductModal();
      modalQty = 1;
      openCartDrawer();
    }
  });

  // Search Functionality
  const searchIcon = document.querySelector('.nav-icon[aria-label="Search"]');
  const searchModal = document.querySelector('.search-modal');
  const searchClose = document.querySelector('.search-close');
  const searchInput = document.querySelector('.search-input');
  const searchResults = document.querySelector('.search-results');
  let searchTimeout;

  searchIcon?.addEventListener('click', () => {
    searchModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    searchInput.focus();
  });

  searchClose?.addEventListener('click', closeSearchModal);
  searchModal?.querySelector('.modal-overlay')?.addEventListener('click', closeSearchModal);

  function closeSearchModal() {
    searchModal.classList.remove('open');
    document.body.style.overflow = '';
    searchInput.value = '';
    searchResults.innerHTML = '';
  }

  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }
    
    searchTimeout = setTimeout(() => performSearch(query), 300);
  });

  async function performSearch(query) {
    try {
      searchResults.innerHTML = '<div class="loading-state">Searching...</div>';
      
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
      const result = await response.json();
      const products = result.success ? result.data : [];
      
      if (products.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">No fragrance matched your search.</div>';
      } else {
        searchResults.innerHTML = products.map(product => `
          <div class="search-result-item" onclick="openProductModal('${product._id}'); closeSearchModal();">
            <img src="${product.image}" alt="${product.name}" class="search-result-image">
            <div class="search-result-info">
              <h4>${product.name}</h4>
              <p>${product.fragranceFamily} • ₹${product.price.toLocaleString()}</p>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      searchResults.innerHTML = '<div class="search-no-results">Unable to search. Please try again.</div>';
    }
  }

  // Wishlist Functionality
  let wishlist = JSON.parse(localStorage.getItem('eloriaWishlist')) || [];

  function toggleWishlist(productId, btn) {
    const index = wishlist.indexOf(productId);
    const icon = btn.querySelector('i');
    
    if (index > -1) {
      wishlist.splice(index, 1);
      icon.classList.remove('fas');
      icon.classList.add('far');
      btn.classList.remove('active');
      showToast('Removed from wishlist', 'success');
    } else {
      wishlist.push(productId);
      icon.classList.remove('far');
      icon.classList.add('fas');
      btn.classList.add('active');
      showToast('Added to wishlist', 'success');
    }
    
    localStorage.setItem('eloriaWishlist', JSON.stringify(wishlist));
    updateWishlistUI();
  }

  function updateWishlistUI() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
      const productId = btn.dataset.id;
      const icon = btn.querySelector('i');
      
      if (wishlist.includes(productId)) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        btn.classList.add('active');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        btn.classList.remove('active');
      }
    });
  }

  // Toast Notifications
  function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  // Authentication UI
  const authModal = document.querySelector('.auth-modal');
  const authPanels = {
    login: document.querySelector('.auth-login-panel'),
    signup: document.querySelector('.auth-signup-panel'),
    forgot: document.querySelector('.auth-forgot-panel'),
    reset: document.querySelector('.auth-reset-panel')
  };

  function openAuthPanel(panel = 'login') {
    Object.entries(authPanels).forEach(([name, element]) => { element.hidden = name !== panel; });
    authModal.classList.add('open');
    authModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeAuthModal() {
    authModal.classList.remove('open');
    authModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelector('.account-trigger')?.addEventListener('click', async () => {
    if (!currentUser) return openAuthPanel('login');
    document.querySelector('.account-menu').hidden = !document.querySelector('.account-menu').hidden;
  });
  document.querySelector('.auth-close')?.addEventListener('click', closeAuthModal);
  document.querySelector('.auth-overlay')?.addEventListener('click', closeAuthModal);
  document.querySelector('.signup-link')?.addEventListener('click', () => openAuthPanel('signup'));
  document.querySelectorAll('.login-link').forEach(link => link.addEventListener('click', () => openAuthPanel('login')));
  document.querySelector('.forgot-link')?.addEventListener('click', () => openAuthPanel('forgot'));
  document.querySelectorAll('.toggle-password').forEach(button => button.addEventListener('click', () => {
    const input = button.parentElement.querySelector('input');
    input.type = input.type === 'password' ? 'text' : 'password';
    button.querySelector('i').classList.toggle('fa-eye-slash');
  }));

  async function submitAuthForm(form, endpoint, successMessage) {
    const formData = Object.fromEntries(new FormData(form));
    if (endpoint === 'reset-password') formData.token = localStorage.getItem('eloriaResetToken') || '';
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify(formData)
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Unable to connect. Please try again.');
    return result;
  }

  document.getElementById('login-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      const result = await submitAuthForm(event.target, 'login', 'Welcome back to ÉLORIA.');
      console.log('Login result:', result);
      console.log('Login result.user:', result.user);
      currentUser = result.user; 
      updateAuthUI(); 
      closeAuthModal(); 
      showToast('Welcome back to ÉLORIA.', 'success');
      await resumePendingCartAction();
      if (authReturnTo === '#checkout' && cart.length) {
        openCheckoutModal();
      } else if (authReturnTo === '#account') {
        showAccountView('profile');
      }
    } catch (error) { showToast(error.message, 'error'); }
  });

  document.getElementById('signup-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(data.password)) return showToast('Password must include uppercase, lowercase, and a number.', 'error');
    if (data.password !== data.confirmPassword) return showToast('Passwords do not match.', 'error');
    try {
      const result = await submitAuthForm(event.target, 'register');
      currentUser = result.user; updateAuthUI(); closeAuthModal(); showToast('Your ÉLORIA account has been created.', 'success'); await resumePendingCartAction();
    } catch (error) { showToast(error.message, 'error'); }
  });

  document.getElementById('forgot-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      const result = await submitAuthForm(event.target, 'forgot-password');
      showToast(result.message, 'success');
      if (result.resetToken) { localStorage.setItem('eloriaResetToken', result.resetToken); openAuthPanel('reset'); }
    } catch (error) { showToast('Unable to connect. Please try again.', 'error'); }
  });

  document.getElementById('reset-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    try {
      await submitAuthForm(event.target, 'reset-password', '');
      localStorage.removeItem('eloriaResetToken'); openAuthPanel('login'); showToast('Password updated successfully. Please sign in again.', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  });

  document.getElementById('reset-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    try {
      await submitAuthForm(event.target, 'reset-password', '');
      localStorage.removeItem('eloriaResetToken'); openAuthPanel('login'); showToast('Password updated successfully. Please sign in again.', 'success');
    } catch (error) { showToast(error.message, 'error'); }
  });

  // Account Portal State Variables
  let currentAccountTab = 'profile';
  let currentOrderFilter = 'all';
  let currentOrderPage = 1;

  // Account Logout Handler
  document.getElementById('account-logout-btn')?.addEventListener('click', handleLogout);
  document.querySelector('.logout-button')?.addEventListener('click', handleLogout);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      currentUser = null;
      updateAuthUI();
      document.querySelector('.account-menu').hidden = true;
      closeAccountModal();
      showToast('You have been signed out.', 'success');
      // Redirect to homepage/reload if required
      window.location.hash = '';
    } catch (error) {
      showToast('Failed to sign out. Please try again.', 'error');
    }
  }

  const accountModal = document.getElementById('account-modal');
  
  function closeAccountModal() {
    if (!accountModal) return;
    accountModal.classList.remove('open');
    accountModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openAccountView() {
    if (!accountModal) return;
    accountModal.classList.add('open');
    accountModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // Show account tab and fetch relevant data
  async function showAccountView(tab) {
    if (!(await requireAuthentication('#account'))) return;
    document.querySelector('.account-menu').hidden = true;
    
    currentAccountTab = tab || 'profile';
    openAccountView();

    // Set Welcome Header
    const welcomeHeading = document.getElementById('account-welcome-heading');
    if (welcomeHeading && currentUser) {
      welcomeHeading.innerHTML = `WELCOME BACK, <span id="account-user-name">${currentUser.firstName.toUpperCase()}</span>`;
    }

    // Toggle active classes on Nav Sidebar
    document.querySelectorAll('.account-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === currentAccountTab);
    });

    // Toggle Tab Panels
    document.querySelectorAll('.account-tab-panel').forEach(panel => {
      panel.hidden = panel.id !== `tab-${currentAccountTab}`;
      panel.classList.toggle('active', panel.id === `tab-${currentAccountTab}`);
    });

    // Load Tab specific data
    if (currentAccountTab === 'profile') {
      await loadUserProfile();
    } else if (currentAccountTab === 'orders') {
      await loadMyOrders(currentOrderFilter, currentOrderPage);
    } else if (currentAccountTab === 'wishlist') {
      await loadWishlistInAccount();
    } else if (currentAccountTab === 'security') {
      resetPasswordForm();
    }

    // Refresh general counts for summary cards
    await refreshAccountSummaryStats();
  }

  // Refresh Summary Cards
  async function refreshAccountSummaryStats() {
    try {
      const res = await fetch('/api/orders/my-orders?limit=1', { credentials: 'include' });
      const result = await res.json();
      if (res.ok && result.success) {
        document.getElementById('stat-total-orders').textContent = result.stats?.totalOrders || 0;
        document.getElementById('stat-completed-orders').textContent = result.stats?.completedOrders || 0;
        document.getElementById('stat-pending-orders').textContent = result.stats?.pendingOrders || 0;
      }
    } catch (err) {
      console.error('Error fetching summary order stats:', err);
    }
    
    // Update Wishlist Count
    document.getElementById('stat-wishlist-count').textContent = wishlist.length || 0;
  }

  // Profile management
  async function loadUserProfile() {
    try {
      const res = await fetch('/api/users/profile', { credentials: 'include' });
      const result = await res.json();
      
      if (res.ok && result.success) {
        const u = result.data;
        // Populate display view
        document.getElementById('prof-display-firstname').textContent = u.firstName || 'Not provided';
        document.getElementById('prof-display-lastname').textContent = u.lastName || 'Not provided';
        document.getElementById('prof-display-email').textContent = u.email;
        document.getElementById('prof-display-phone').textContent = u.phone || 'Not provided';
        document.getElementById('prof-display-created').textContent = new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        // Populate edit form
        document.getElementById('edit-prof-firstname').value = u.firstName || '';
        document.getElementById('edit-prof-lastname').value = u.lastName || '';
        document.getElementById('edit-prof-email').value = u.email;
        document.getElementById('edit-prof-phone').value = u.phone || '';
      } else {
        showToast(result.message || 'Unable to retrieve profile data.', 'error');
      }
    } catch (err) {
      showToast('Connection error. Failed to retrieve profile.', 'error');
    }
  }

  // Toggle Edit Profile View
  const toggleEditProfileBtn = document.getElementById('btn-toggle-edit-profile');
  const cancelEditProfileBtn = document.getElementById('btn-cancel-edit-profile');
  const profileViewMode = document.getElementById('profile-view-mode');
  const profileEditForm = document.getElementById('profile-edit-form');

  toggleEditProfileBtn?.addEventListener('click', () => {
    profileViewMode.hidden = true;
    profileEditForm.hidden = false;
    toggleEditProfileBtn.style.display = 'none';
  });

  cancelEditProfileBtn?.addEventListener('click', () => {
    profileViewMode.hidden = false;
    profileEditForm.hidden = true;
    toggleEditProfileBtn.style.display = 'inline-flex';
  });

  profileEditForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('edit-prof-firstname').value.trim();
    const lastName = document.getElementById('edit-prof-lastname').value.trim();
    const phone = document.getElementById('edit-prof-phone').value.trim();

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstName, lastName, phone })
      });
      const result = await res.json();

      if (res.ok && result.success) {
        showToast('Profile information updated successfully.', 'success');
        currentUser.firstName = firstName;
        currentUser.lastName = lastName;
        currentUser.phone = phone;
        updateAuthUI();

        // Refresh views
        profileViewMode.hidden = false;
        profileEditForm.hidden = true;
        toggleEditProfileBtn.style.display = 'inline-flex';
        await loadUserProfile();
      } else {
        showToast(result.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast('Error saving profile changes.', 'error');
    }
  });

  // Password & Security Management
  const changePasswordForm = document.getElementById('change-password-form');
  const passwordFeedback = document.getElementById('password-feedback-msg');

  function resetPasswordForm() {
    if (changePasswordForm) {
      changePasswordForm.reset();
    }
    if (passwordFeedback) {
      passwordFeedback.hidden = true;
      passwordFeedback.className = 'password-feedback';
      passwordFeedback.textContent = '';
    }
  }

  changePasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('pwd-current').value;
    const newPassword = document.getElementById('pwd-new').value;
    const confirmPassword = document.getElementById('pwd-confirm').value;

    if (passwordFeedback) {
      passwordFeedback.hidden = true;
      passwordFeedback.textContent = '';
    }

    if (newPassword !== confirmPassword) {
      showFeedback('Passwords do not match.', 'error');
      return;
    }

    // Password validation pattern (min 8 chars, 1 uppercase, 1 lowercase, 1 digit)
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      showFeedback('Password must be at least 8 characters, and include uppercase, lowercase, and a number.', 'error');
      return;
    }

    try {
      const btn = document.getElementById('btn-update-pwd');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

      const res = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });
      const result = await res.json();

      btn.disabled = false;
      btn.innerHTML = originalText;

      if (res.ok && result.success) {
        showToast('Password changed successfully.', 'success');
        showFeedback('Your password has been changed successfully.', 'success');
        changePasswordForm.reset();
      } else {
        showFeedback(result.message || 'Failed to change password.', 'error');
      }
    } catch (err) {
      showFeedback('Network error. Please try again.', 'error');
    }
  });

  function showFeedback(msg, type) {
    if (!passwordFeedback) return;
    passwordFeedback.textContent = msg;
    passwordFeedback.className = `password-feedback ${type}`;
    passwordFeedback.hidden = false;
  }

  // Password Visibility Toggle
  document.querySelectorAll('.pwd-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });

  // Orders Management & Filtering
  async function loadMyOrders(filter = 'all', page = 1) {
    currentOrderFilter = filter;
    currentOrderPage = page;
    const container = document.getElementById('account-orders-container');
    container.innerHTML = `
      <div class="account-loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading your orders...</p>
      </div>
    `;

    try {
      const res = await fetch(`/api/orders/my-orders?status=${filter}&page=${page}&limit=5`, { credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        if (!result.data || result.data.length === 0) {
          container.innerHTML = `
            <div class="account-empty-state">
              <div class="empty-state-icon"><i class="fas fa-bag-shopping"></i></div>
              <h3>YOUR FRAGRANCE JOURNEY BEGINS HERE</h3>
              <p>“You haven't placed an order yet.”</p>
              <button class="btn btn-primary" onclick="closeAccountModal(); window.location.hash='#collection';">EXPLORE COLLECTION</button>
            </div>
          `;
          document.getElementById('orders-pagination').hidden = true;
          return;
        }

        container.innerHTML = result.data.map(order => {
          const itemPreview = order.items.map(item => `
            <div class="order-item-row">
              <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name || 'Fragrance'}">
              <div class="order-item-meta">
                <span class="item-name">${item.name || 'Luxury Fragrance'}</span>
                <span class="item-sub">Qty: ${item.quantity} &times; ₹${item.price.toLocaleString()}</span>
              </div>
              <span class="item-total">₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
            </div>
          `).join('');

          return `
            <div class="account-order-card">
              <div class="order-card-header">
                <div class="order-card-num-date">
                  <span class="order-num">${order.orderNumber || 'N/A'}</span>
                  <span class="order-dt">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div class="order-card-badges">
                  <span class="badge status-${(order.orderStatus || 'pending').toLowerCase()}">${order.orderStatus}</span>
                  <span class="badge payment-${(order.paymentStatus || 'pending').toLowerCase()}">Payment: ${order.paymentStatus}</span>
                </div>
              </div>
              
              <div class="order-items-preview">
                ${itemPreview}
              </div>

              <div class="order-card-footer">
                <div class="order-card-grand-total">
                  Total: <strong>₹${(order.total || 0).toLocaleString()}</strong>
                </div>
                <div class="order-card-actions">
                  <button class="btn btn-outline btn-sm" onclick="openClientOrderModal('${order._id}')">
                    <i class="fas fa-file-invoice"></i> View Details
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');

        renderOrdersPagination(result.pagination);
      } else {
        container.innerHTML = `<p class="account-feedback error">We couldn't load your orders. ${result.message || ''}</p>`;
      }
    } catch (err) {
      container.innerHTML = `<p class="account-feedback error">We couldn't load your orders. Please check your connection.</p>`;
    }
  }

  // Render Pagination
  function renderOrdersPagination(p) {
    const pag = document.getElementById('orders-pagination');
    if (!p || p.pages <= 1) {
      pag.hidden = true;
      return;
    }

    let html = '';
    for (let i = 1; i <= p.pages; i++) {
      html += `<button class="pagination-btn ${p.page === i ? 'active' : ''}" onclick="loadMyOrders('${currentOrderFilter}', ${i})">${i}</button>`;
    }
    pag.innerHTML = html;
    pag.hidden = false;
  }

  // Filter Buttons Event Listeners
  document.querySelectorAll('.order-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.order-filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      loadMyOrders(e.target.dataset.filter, 1);
    });
  });

  // Client Detailed Order Dossier Modal
  const clientOrderModal = document.getElementById('client-order-modal');

  window.openClientOrderModal = async function(orderId) {
    if (!clientOrderModal) return;
    
    const body = document.getElementById('modal-client-order-body');
    const footer = document.getElementById('modal-client-order-footer');
    const title = document.getElementById('modal-client-order-number');
    const dateSp = document.getElementById('modal-client-order-date');
    const orderStatusBadge = document.getElementById('modal-client-order-status-badge');
    const paymentBadge = document.getElementById('modal-client-payment-badge');
    const timelineWrapper = document.getElementById('order-timeline-wrapper');

    title.textContent = 'Order Dossier';
    dateSp.textContent = '';
    orderStatusBadge.className = 'badge';
    orderStatusBadge.textContent = '';
    paymentBadge.className = 'badge';
    paymentBadge.textContent = '';
    timelineWrapper.innerHTML = '';
    
    body.innerHTML = `
      <div class="account-loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading order details...</p>
      </div>
    `;

    clientOrderModal.classList.add('open');
    clientOrderModal.setAttribute('aria-hidden', 'false');

    try {
      const res = await fetch(`/api/orders/${orderId}`, { credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        const o = result.data;
        title.textContent = `Order: ${o.orderNumber || 'N/A'}`;
        dateSp.textContent = new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        orderStatusBadge.textContent = o.orderStatus;
        orderStatusBadge.className = `badge status-${(o.orderStatus || 'pending').toLowerCase()}`;
        
        paymentBadge.textContent = `Payment: ${o.paymentStatus}`;
        paymentBadge.className = `badge payment-${(o.paymentStatus || 'pending').toLowerCase()}`;

        // Render visual timeline
        renderVisualTimeline(o.orderStatus, timelineWrapper);

        // Product list HTML
        const itemsHtml = o.items.map(item => `
          <tr>
            <td>
              <div class="dossier-item-cell">
                <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name || 'Product'}">
                <div>
                  <strong>${item.name || 'Fragrance'}</strong>
                </div>
              </div>
            </td>
            <td>₹${(item.price || 0).toLocaleString()}</td>
            <td>${item.quantity || 1}</td>
            <td class="text-right"><strong>₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</strong></td>
          </tr>
        `).join('');

        // Address & summary Dossier HTML
        const addr = o.shippingAddress || {};
        body.innerHTML = `
          <div class="dossier-section">
            <h4>ACQUIRED CREATIONS</h4>
            <table class="dossier-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="dossier-summary-grid">
            <!-- Shipping Details -->
            <div class="dossier-info-box">
              <h4>SHIPPING DOSSIER</h4>
              <p><strong>Recipient:</strong> ${o.customer?.name || ''}</p>
              <p><strong>Address:</strong> ${addr.address || ''}${addr.landmark ? ', ' + addr.landmark : ''}</p>
              <p><strong>Location:</strong> ${addr.city || ''}, ${addr.state || ''} — ${addr.pincode || ''}</p>
              <p><strong>Country:</strong> ${addr.country || 'India'}</p>
              <p><strong>Contact:</strong> ${o.customer?.phone || ''}</p>
            </div>

            <!-- Price Summary details -->
            <div class="dossier-info-box">
              <h4>PRICE RECIPES</h4>
              <div class="detail-item"><span>Subtotal:</span><span>₹${(o.subtotal || 0).toLocaleString()}</span></div>
              ${o.discount ? `<div class="detail-item text-success"><span>Discount ${o.coupon?.code ? `(${o.coupon.code})` : ''}:</span><span>−₹${(o.discount || 0).toLocaleString()}</span></div>` : ''}
              <div class="detail-item"><span>Tax (GST 18%):</span><span>₹${(o.tax || 0).toLocaleString()}</span></div>
              <div class="detail-item"><span>Shipping:</span><span>${o.shipping === 0 ? 'Free' : '₹' + (o.shipping || 0).toLocaleString()}</span></div>
              <div class="detail-item total"><span>Grand Total:</span><span class="text-gold">₹${(o.total || 0).toLocaleString()}</span></div>
            </div>
          </div>

          <div class="dossier-section" style="margin-top: 1.5rem;">
            <h4>PAYMENT AUDIT</h4>
            <div class="dossier-info-box">
              <p><strong>Method:</strong> ${(o.paymentMethod || 'COD').toUpperCase()}</p>
              <p><strong>Status:</strong> ${o.paymentStatus || 'Pending'}</p>
              ${o.transactionId ? `<p><strong>Audit Ref/Transaction ID:</strong> <code>${o.transactionId}</code></p>` : ''}
            </div>
          </div>
        `;

        // Render Reorder / buy again button if delivered
        let footerHtml = '';
        if (o.orderStatus?.toLowerCase() === 'delivered') {
          footerHtml = `
            <button class="btn btn-primary" onclick="handleReorder('${o._id}')">
              <i class="fas fa-rotate-left"></i> BUY AGAIN / REORDER
            </button>
          `;
        }
        footerHtml += `<button class="btn btn-outline" onclick="closeClientOrderModal()">Close Dossier</button>`;
        footer.innerHTML = footerHtml;

      } else {
        body.innerHTML = `<p class="account-feedback error">This order details could not be loaded: ${result.message || ''}</p>`;
      }
    } catch (err) {
      body.innerHTML = '<p class="account-feedback error">Unable to establish connection to order registry.</p>';
    }
  };

  window.closeClientOrderModal = function() {
    if (!clientOrderModal) return;
    clientOrderModal.classList.remove('open');
    clientOrderModal.setAttribute('aria-hidden', 'true');
  };

  document.querySelector('.order-modal-close')?.addEventListener('click', closeClientOrderModal);
  document.querySelector('.order-modal-overlay')?.addEventListener('click', closeClientOrderModal);

  // Render Visual Timeline
  function renderVisualTimeline(status, wrapper) {
    const st = (status || 'pending').toLowerCase();
    
    if (st === 'cancelled') {
      wrapper.innerHTML = `
        <div class="timeline-cancelled-box">
          <i class="fas fa-circle-xmark"></i>
          <div>
            <strong>Order Cancelled</strong>
            <p style="font-size:0.75rem; margin:0; color:#c62828;">This order has been cancelled and is not being fulfilled.</p>
          </div>
        </div>
      `;
      return;
    }

    const steps = ['confirmed', 'processing', 'shipped', 'delivered'];
    const labels = {
      confirmed: 'Order Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered'
    };

    let currentIndex = steps.indexOf(st);
    if (currentIndex === -1 && st === 'pending') {
      currentIndex = 0; // fallback to first step active
    }

    const stepsHtml = steps.map((step, index) => {
      let stepClass = '';
      let icon = `<i class="fas fa-circle"></i>`;

      if (index < currentIndex) {
        stepClass = 'completed';
        icon = `<i class="fas fa-check"></i>`;
      } else if (index === currentIndex) {
        stepClass = 'active';
        icon = `<i class="fas fa-circle-dot fa-pulse"></i>`;
      }

      return `
        <div class="timeline-step ${stepClass}">
          <div class="timeline-icon">${icon}</div>
          <span class="timeline-label">${labels[step]}</span>
        </div>
      `;
    }).join('');

    wrapper.innerHTML = `<div class="timeline-steps">${stepsHtml}</div>`;
  }

  // Buy Again / Reorder function
  window.handleReorder = async function(orderId) {
    try {
      showToast('Auditing stock for reorder...', 'info');
      // 1. Fetch current order items
      const orderRes = await fetch(`/api/orders/${orderId}`, { credentials: 'include' });
      const orderResult = await orderRes.json();
      if (!orderRes.ok || !orderResult.success) throw new Error('Failed to retrieve past order items.');

      const pastItems = orderResult.data.items || [];

      // 2. Fetch fresh catalog from MongoDB
      const prodRes = await fetch('/api/products?limit=100');
      const prodResult = await prodRes.json();
      if (!prodRes.ok || !prodResult.success) throw new Error('Failed to retrieve catalog status.');

      const freshProducts = prodResult.data || [];
      let addedCount = 0;
      let unavailableNames = [];

      // 3. Match items, verify existence and stock
      for (const item of pastItems) {
        const matchedProd = freshProducts.find(p => p._id === item.productId || p.name === item.name);
        
        if (!matchedProd) {
          unavailableNames.push(item.name || 'Unidentified item');
          continue;
        }

        if (matchedProd.stock <= 0) {
          unavailableNames.push(`${matchedProd.name} (Out of Stock)`);
          continue;
        }

        // Add to cart with current MongoDB price
        const quantityToAdd = Math.min(item.quantity || 1, matchedProd.stock);
        addToCartLocally(matchedProd, quantityToAdd);
        addedCount += quantityToAdd;
      }

      // Show notifications
      if (addedCount > 0) {
        showToast(`${addedCount} fragrances were added to your collection.`, 'success');
      }

      if (unavailableNames.length > 0) {
        unavailableNames.forEach(name => {
          showToast(`${name} is currently unavailable.`, 'error');
        });
      }

      // Close modal and open cart drawer
      closeClientOrderModal();
      closeAccountModal();
      openCartDrawer();

    } catch (err) {
      showToast(err.message || 'Error processing reorder request.', 'error');
    }
  };

  // Local Cart add helper
  function addToCartLocally(product, qty) {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock);
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
        quantity: qty
      });
    }
    localStorage.setItem('eloriaCart', JSON.stringify(cart));
    updateCartUI();
  }

  // Wishlist Tab Render inside Account
  async function loadWishlistInAccount() {
    const container = document.getElementById('account-wishlist-container');
    const headerCount = document.getElementById('wishlist-header-count');
    
    container.innerHTML = `
      <div class="account-loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading saved fragrances...</p>
      </div>
    `;

    try {
      if (!allProducts || allProducts.length === 0) {
        allProducts = await loadProducts();
      }

      const saved = allProducts.filter(p => wishlist.includes(p._id));
      headerCount.textContent = `${saved.length} items`;

      if (saved.length === 0) {
        container.innerHTML = `
          <div class="account-empty-state" style="grid-column: span 3;">
            <div class="empty-state-icon"><i class="fas fa-heart"></i></div>
            <h3>YOUR WISHLIST IS EMPTY</h3>
            <p>Save fragrances while browsing to view them here.</p>
            <button class="btn btn-primary" onclick="closeAccountModal(); window.location.hash='#collection';">EXPLORE COLLECTION</button>
          </div>
        `;
        return;
      }

      container.innerHTML = saved.map(p => `
        <div class="account-wishlist-card">
          <img src="${p.image || '/images/placeholder.jpg'}" alt="${p.name || ''}" onerror="this.src='/images/placeholder.jpg'">
          <h4>${p.name}</h4>
          <p class="wishlist-price">₹${(p.price || 0).toLocaleString()}</p>
          <span class="badge ${p.stock > 0 ? 'status-delivered' : 'status-cancelled'}" style="margin-bottom:0.75rem;">
            ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          <div class="wishlist-actions">
            <button class="btn btn-primary btn-sm" onclick="handleWishlistAddToCart('${p._id}')" ${p.stock <= 0 ? 'disabled' : ''}>
              <i class="fas fa-shopping-bag"></i> ADD TO CART
            </button>
            <button class="btn btn-outline btn-sm" onclick="handleWishlistRemove('${p._id}')">
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      container.innerHTML = '<p class="account-feedback error">Error loading wishlist creations.</p>';
    }
  }

  // Wishlist Action Wrappers
  window.handleWishlistAddToCart = function(productId) {
    const p = allProducts.find(prod => prod._id === productId);
    if (p) {
      addToCartLocally(p, 1);
      showToast(`${p.name} added to cart.`, 'success');
    }
  };

  window.handleWishlistRemove = function(productId) {
    toggleWishlist(productId);
    loadWishlistInAccount();
    refreshAccountSummaryStats();
  };

  // Click handler to route My Account sidebar clicks
  document.querySelectorAll('.account-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.tab;
      if (tab) {
        showAccountView(tab);
      }
    });
  });

  // Account Menu items clicks
  document.querySelectorAll('.account-view-link').forEach(link => {
    link.addEventListener('click', () => {
      showAccountView(link.dataset.tab);
    });
  });

  // Modal Closures
  document.querySelector('.account-close')?.addEventListener('click', closeAccountModal);
  document.querySelector('.account-overlay')?.addEventListener('click', closeAccountModal);

  // Link clicks inside user summary stat cards
  document.querySelectorAll('.account-stat-card').forEach(card => {
    card.addEventListener('click', () => {
      const action = card.dataset.action;
      if (action === 'filter-orders') {
        showAccountView('orders');
        const status = card.dataset.status;
        const filterBtn = document.querySelector(`.order-filter-btn[data-filter="${status}"]`);
        if (filterBtn) filterBtn.click();
      } else if (action === 'view-wishlist') {
        showAccountView('wishlist');
      }
    });
  });

  // Testimonials Slider
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');
  const testimonialDots = document.querySelectorAll('.testimonial-dot');
  let currentSlide = 0;

  function showSlide(index) {
    testimonialSlides.forEach((slide, i) => {
      slide.classList.remove('active');
      testimonialDots[i].classList.remove('active');
      if (i === index) {
        slide.classList.add('active');
        testimonialDots[i].classList.add('active');
      }
    });
    currentSlide = index;
  }

  testimonialDots.forEach((dot, index) => {
    dot.addEventListener('click', () => showSlide(index));
  });

  // Auto-advance testimonials
  setInterval(() => {
    const nextSlide = (currentSlide + 1) % testimonialSlides.length;
    showSlide(nextSlide);
  }, 5000);

  // Newsletter Form
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterMessage = document.querySelector('.newsletter-message');

  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        newsletterMessage.textContent = 'Welcome to the world of ÉLORIA.';
        newsletterMessage.className = 'newsletter-message success';
        newsletterForm.reset();
        showToast('Welcome to the ÉLORIA journal', 'success');
      } else {
        newsletterMessage.textContent = data.message || 'Subscription failed. Please try again.';
        newsletterMessage.className = 'newsletter-message error';
      }
    } catch (error) {
      newsletterMessage.textContent = 'An error occurred. Please try again.';
      newsletterMessage.className = 'newsletter-message error';
    }
  });

  // Contact Form
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message')
      };
      
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          showToast('Your message has been received. ÉLORIA will be in touch soon.', 'success');
          contactForm.reset();
        } else {
          showToast(data.message || 'Failed to send message', 'error');
        }
      } catch (error) {
        showToast('Failed to send message. Please try again.', 'error');
      }
    });
  }

  // Scroll Animations
  function observeScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale').forEach(el => {
      observer.observe(el);
    });
  }

  // Back to Top Button
  const backToTop = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Initialize
  loadProducts();
  updateCartUI();
  updateWishlistUI();
  observeScrollAnimations();
  
  function handleHashRoute() {
    const hash = window.location.hash;
    if (hash === '#account') {
      showAccountView('profile');
    }
  }

  // Check authentication on page load
  checkAuthentication().then(auth => {
    console.log('Auth check on load:', auth);
    if (auth.authenticated && auth.user) {
      currentUser = auth.user;
      console.log('Current user set:', currentUser);
      updateAuthUI();
      handleHashRoute();
    } else if (window.location.hash === '#account') {
      requireAuthentication('#account');
    }
  });

  window.addEventListener('hashchange', handleHashRoute);
});

// Make search and modal functions globally accessible
window.closeSearchModal = function() {
  const searchModal = document.querySelector('.search-modal');
  if (searchModal) {
    searchModal.classList.remove('open');
    document.body.style.overflow = '';
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
  }
};

window.openProductModal = function(productId) {
  // This will be handled by the existing modal functionality
  const event = new CustomEvent('openProductModal', { detail: productId });
  document.dispatchEvent(event);
};

window.openCheckoutModal = function() {
  const checkoutModal = document.querySelector('.checkout-modal');
  if (checkoutModal) {
    checkoutModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else {
    console.error('Checkout modal not found');
  }
};

