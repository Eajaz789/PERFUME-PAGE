/**
 * ÉLORIA — Luxury Atelier Admin Portal Script
 * Comprehensive Real-Time MongoDB Management
 */

(function () {
  'use strict';

  // API Base
  const API_BASE = '/api/admin';
  const AUTH_BASE = '/api/auth';

  // Application State
  const state = {
    user: null,
    currentView: 'dashboard',
    dashboardData: null,
    salesPeriod: 'today',
    
    // Pagination & Filter states
    products: { page: 1, limit: 10, total: 0, pages: 1, search: '', category: 'all', stockStatus: '' },
    inventory: { page: 1, limit: 10, total: 0, pages: 1, search: '', stockStatus: '' },
    orders: { page: 1, limit: 10, total: 0, pages: 1, search: '', orderStatus: 'all', paymentStatus: 'all' },
    customers: { page: 1, limit: 10, total: 0, pages: 1, search: '' },
    subscribers: { page: 1, limit: 10, total: 0, pages: 1, search: '' },
    messages: { page: 1, limit: 10, total: 0, pages: 1, search: '', isRead: 'all' },

    // Pending delete action
    deleteTarget: { type: null, id: null, name: '' }
  };

  // DOM Elements Cache
  const el = {
    authView: document.getElementById('admin-auth-view'),
    appView: document.getElementById('admin-app'),
    loginForm: document.getElementById('admin-login-form'),
    authError: document.getElementById('auth-error-msg'),
    sidebar: document.getElementById('admin-sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    mobileToggle: document.getElementById('mobile-toggle-btn'),
    sidebarClose: document.getElementById('sidebar-close-btn'),
    pageTitle: document.getElementById('header-page-title'),
    navItems: document.querySelectorAll('.nav-item'),
    contentViews: document.querySelectorAll('.content-view'),
    liveClock: document.getElementById('current-time'),
    adminName: document.getElementById('admin-display-name'),
    adminAvatar: document.getElementById('admin-avatar-char'),
    logoutBtns: [document.getElementById('admin-logout-btn'), document.getElementById('header-logout-btn')],
    toastContainer: document.getElementById('toast-container')
  };

  // ==========================================================================
  // 1. INITIALIZATION & AUTHENTICATION
  // ==========================================================================
  async function init() {
    startClock();
    setupEventListeners();
    await checkAdminAuth();
  }

  // Check Authentication Status
  async function checkAdminAuth() {
    try {
      const res = await fetch(`${AUTH_BASE}/me`, { credentials: 'include' });
      const data = await res.json();

      if (data.authenticated && data.user && data.user.role === 'admin') {
        state.user = data.user;
        showApp();
      } else {
        showAuth();
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      showAuth();
    }
  }

  function showAuth() {
    el.authView.style.display = 'flex';
    el.appView.style.display = 'none';
    el.authView.hidden = false;
    el.appView.hidden = true;
  }

  function showApp() {
    el.authView.style.display = 'none';
    el.appView.style.display = 'flex';
    el.authView.hidden = true;
    el.appView.hidden = false;
    
    if (state.user) {
      el.adminName.textContent = `${state.user.firstName || 'Éloria'} ${state.user.lastName || 'Admin'}`;
      el.adminAvatar.textContent = (state.user.firstName || 'A').charAt(0).toUpperCase();
    }
    
    // Load default view
    switchView(state.currentView);
  }

  // Admin Login Handler
  el.loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    el.authError.hidden = true;
    
    const submitBtn = document.getElementById('admin-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;

    try {
      const res = await fetch(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (data.user?.role !== 'admin') {
          showToast('Access Denied: Customer accounts cannot access Atelier Administration.', 'error');
          el.authError.textContent = 'Access Denied. Admin privileges required.';
          el.authError.hidden = false;
          // Sign out non-admin
          await fetch(`${AUTH_BASE}/logout`, { method: 'POST', credentials: 'include' });
          return;
        }

        state.user = data.user;
        showToast('Welcome to ÉLORIA Atelier Admin Portal', 'success');
        showApp();
      } else {
        el.authError.textContent = data.message || 'Invalid administrative credentials';
        el.authError.hidden = false;
      }
    } catch (err) {
      el.authError.textContent = 'Connection error. Please try again.';
      el.authError.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  // Logout Handler
  async function handleLogout() {
    try {
      await fetch(`${AUTH_BASE}/logout`, { method: 'POST', credentials: 'include' });
      state.user = null;
      showToast('You have signed out of Atelier Administration.', 'info');
      showAuth();
    } catch (err) {
      window.location.reload();
    }
  }

  // ==========================================================================
  // 2. NAVIGATION & ROUTING
  // ==========================================================================
  window.switchView = function (viewName) {
    state.currentView = viewName;

    // Update Nav Active State
    el.navItems.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update Views Visibility
    el.contentViews.forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewName}`);
    });

    // Update Header Page Title
    const titleMap = {
      dashboard: 'Dashboard Overview',
      products: 'Fragrance Catalog',
      inventory: 'Inventory & Stock Reserves',
      orders: 'Client Orders',
      customers: 'Clientele Management',
      coupons: 'Promotional Coupons',
      subscribers: 'Journal Subscribers',
      messages: 'Concierge Inquiries',
      settings: 'Atelier Settings'
    };
    el.pageTitle.textContent = titleMap[viewName] || 'Admin';

    // Close Mobile Drawer
    closeMobileSidebar();

    // Trigger View Data Fetch
    loadViewData(viewName);
  };

  function loadViewData(viewName) {
    switch (viewName) {
      case 'dashboard': loadDashboard(); break;
      case 'products': loadProducts(); break;
      case 'inventory': loadInventory(); break;
      case 'orders': loadOrders(); break;
      case 'customers': loadCustomers(); break;
      case 'coupons': loadCoupons(); break;
      case 'subscribers': loadSubscribers(); break;
      case 'messages': loadMessages(); break;
      case 'settings': loadSettings(); break;
    }
  }

  // ==========================================================================
  // 3. VIEW: DASHBOARD
  // ==========================================================================
  async function loadDashboard() {
    try {
      const res = await fetch(`${API_BASE}/dashboard`, { credentials: 'include' });
      const result = await res.json();
      
      if (!result.success) throw new Error(result.message);
      
      const { cards, salesOverview, recentOrders, lowStockList, chartData } = result.data;
      state.dashboardData = result.data;

      // Update Key Cards
      document.getElementById('card-total-sales').textContent = `₹${(cards.totalSales || 0).toLocaleString()}`;
      document.getElementById('card-total-orders').textContent = cards.totalOrders || 0;
      document.getElementById('card-total-products').textContent = cards.totalProducts || 0;
      document.getElementById('card-total-customers').textContent = cards.totalCustomers || 0;
      document.getElementById('card-low-stock').textContent = cards.lowStock || 0;
      document.getElementById('card-pending-orders').textContent = cards.pendingOrders || 0;

      // Update Badges on Sidebar
      const lowStockBadge = document.getElementById('badge-low-stock');
      if (cards.lowStock > 0) {
        lowStockBadge.textContent = cards.lowStock;
        lowStockBadge.hidden = false;
      } else {
        lowStockBadge.hidden = true;
      }

      const pendingBadge = document.getElementById('badge-pending-orders');
      if (cards.pendingOrders > 0) {
        pendingBadge.textContent = cards.pendingOrders;
        pendingBadge.hidden = false;
      } else {
        pendingBadge.hidden = true;
      }

      // Update Sales Stats row
      updateSalesPeriodStats(state.salesPeriod);

      // Render Sales Chart
      renderSalesChart(chartData);

      // Render Recent Orders
      renderDashRecentOrders(recentOrders);

      // Render Low Stock List
      renderDashLowStock(lowStockList);

    } catch (err) {
      console.error('Dashboard load error:', err);
      showToast('Unable to load dashboard data.', 'error');
    }
  }

  function updateSalesPeriodStats(period) {
    if (!state.dashboardData?.salesOverview) return;
    const stats = state.dashboardData.salesOverview[period] || { revenue: 0, orders: 0, avgOrderValue: 0 };
    document.getElementById('stat-period-revenue').textContent = `₹${(stats.revenue || 0).toLocaleString()}`;
    document.getElementById('stat-period-orders').textContent = stats.orders || 0;
    document.getElementById('stat-period-aov').textContent = `₹${(stats.avgOrderValue || 0).toLocaleString()}`;
  }

  function renderSalesChart(chartData) {
    const wrapper = document.getElementById('sales-chart-wrapper');
    
    // Generate full past 7 days to ensure a complete continuous curve
    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      daysMap[dateStr] = { revenue: 0, orders: 0 };
    }

    if (Array.isArray(chartData)) {
      chartData.forEach(item => {
        if (daysMap[item._id]) {
          daysMap[item._id] = { revenue: item.revenue || 0, orders: item.orders || 0 };
        }
      });
    }

    const fullChartData = Object.keys(daysMap).map(date => ({
      _id: date,
      revenue: daysMap[date].revenue,
      orders: daysMap[date].orders
    }));

    const maxRevenue = Math.max(...fullChartData.map(d => d.revenue), 5000);
    const height = 200;
    const width = 800;
    const padding = 40;

    const points = fullChartData.map((d, i) => {
      const x = padding + (i * (width - 2 * padding) / Math.max(fullChartData.length - 1, 1));
      const y = height - padding - ((d.revenue / maxRevenue) * (height - 2 * padding));
      return { x, y, date: d._id, revenue: d.revenue, orders: d.orders };
    });

    const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    let dotsHtml = '';
    points.forEach(p => {
      dotsHtml += `
        <g class="chart-point-group">
          <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#b99a63" stroke="#fff" stroke-width="2">
            <title>${p.date}: ₹${(p.revenue || 0).toLocaleString()} (${p.orders} orders)</title>
          </circle>
          <text x="${p.x}" y="${height - 15}" font-size="10" font-family="Montserrat" fill="#888" text-anchor="middle">${p.date.slice(5)}</text>
        </g>
      `;
    });

    wrapper.innerHTML = `
      <svg class="svg-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#b99a63" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#b99a63" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        <!-- Grid lines -->
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(0,0,0,0.08)" />
        <line x1="${padding}" y1="${height - padding - (height - 2*padding)/2}" x2="${width - padding}" y2="${height - padding - (height - 2*padding)/2}" stroke="rgba(0,0,0,0.04)" stroke-dasharray="4" />
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(0,0,0,0.04)" stroke-dasharray="4" />
        <!-- Area -->
        <path d="${areaD}" fill="url(#chartGrad)" />
        <!-- Line -->
        <path d="${pathD}" fill="none" stroke="#b99a63" stroke-width="2.5" stroke-linecap="round" />
        <!-- Points -->
        ${dotsHtml}
      </svg>
    `;
  }

  function renderDashRecentOrders(orders) {
    const tbody = document.getElementById('dash-recent-orders-body');
    if (!orders || !orders.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="table-empty">No orders placed yet.</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const itemsSnippet = (o.items || []).map(i => `${i.quantity}x ${i.name || 'Item'}`).join(', ');
      return `
      <tr>
        <td><strong style="font-family:var(--font-serif); font-size:0.95rem;">${o.orderNumber || 'N/A'}</strong></td>
        <td>
          <div class="product-meta-cell">
            <span style="font-weight:600;">${o.customer?.name || 'Customer'}</span>
            <span style="font-size:0.72rem; color:var(--text-muted);">${o.customer?.email || ''}</span>
          </div>
        </td>
        <td style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${itemsSnippet}">
          <span style="font-size:0.78rem;">${itemsSnippet || `${o.items?.length || 0} items`}</span>
        </td>
        <td><strong>₹${(o.total || 0).toLocaleString()}</strong></td>
        <td><span class="badge payment-${(o.paymentStatus || 'pending').toLowerCase()}">${o.paymentStatus || 'pending'}</span></td>
        <td><span class="badge status-${(o.orderStatus || 'pending').toLowerCase()}">${o.orderStatus || 'pending'}</span></td>
        <td>${new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
        <td class="text-right">
          <button class="action-btn" title="View Full Order" onclick="viewOrderDetails('${o._id}')">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `}).join('');
  }

  function renderDashLowStock(products) {
    const tbody = document.getElementById('dash-low-stock-body');
    if (!products || !products.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">All reserves are currently abundant.</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <img src="${p.image || '/images/placeholder.jpg'}" class="product-cell-img" alt="${p.name || ''}">
            <div class="product-meta-cell">
              <span class="product-meta-name">${p.name || 'Product'}</span>
              <span class="product-meta-sku">${p.sku || p.slug || ''}</span>
            </div>
          </div>
        </td>
        <td><span class="badge-tag">${p.category || 'Luxury'}</span></td>
        <td><strong>₹${(p.price || 0).toLocaleString()}</strong></td>
        <td><strong>${p.stock !== undefined ? p.stock : 0}</strong> units</td>
        <td><span class="badge ${p.stock === 0 ? 'outofstock' : 'lowstock'}">${p.stock === 0 ? 'Out of Stock' : 'Low Stock'}</span></td>
        <td class="text-right">
          <button class="btn btn-outline btn-sm" onclick="switchView('inventory')">
            <i class="fas fa-boxes-stacked"></i> Restock
          </button>
        </td>
      </tr>
    `).join('');
  }

  // ==========================================================================
  // 4. VIEW: PRODUCTS
  // ==========================================================================
  async function loadProducts() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Loading catalog...</td></tr>';

    try {
      const { page, limit, search, category, stockStatus } = state.products;
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);
      if (stockStatus) params.append('stockStatus', stockStatus);

      const res = await fetch(`${API_BASE}/products?${params}`, { credentials: 'include' });
      const result = await res.json();
      
      if (!result.success) throw new Error(result.message);

      state.products.total = result.pagination.total;
      state.products.pages = result.pagination.pages;

      if (!result.data.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="table-empty">No fragrances match your filter criteria.</td></tr>';
      } else {
        tbody.innerHTML = result.data.map(p => `
          <tr>
            <td>
              <img src="${p.image}" class="product-cell-img" alt="${p.name}" onerror="this.src='/images/placeholder.jpg'">
            </td>
            <td>
              <div class="product-meta-cell">
                <span class="product-meta-name">${p.name}</span>
                <span class="product-meta-sku">${p.sku || p.slug}</span>
              </div>
            </td>
            <td><span class="badge-tag">${p.category}</span></td>
            <td><strong>₹${(p.price || 0).toLocaleString()}</strong></td>
            <td>
              <span class="badge ${p.stock === 0 ? 'outofstock' : p.stock <= 3 ? 'lowstock' : 'instock'}">
                ${p.stock !== undefined ? p.stock : 0} units
              </span>
            </td>
            <td>
              ${p.featured ? '<span class="badge-tag" style="color:var(--gold); border-color:var(--gold)">Featured</span>' : ''}
              ${p.bestSeller ? '<span class="badge-tag">Bestseller</span>' : ''}
              ${p.newArrival ? '<span class="badge-tag">New</span>' : ''}
            </td>
            <td class="text-right">
              <div class="action-btn-group">
                <button class="action-btn" title="Edit Fragrance" onclick="openEditProductModal('${p._id}')">
                  <i class="fas fa-pen-to-square"></i>
                </button>
                <button class="action-btn delete-btn" title="Remove Fragrance" onclick="confirmDelete('product', '${p._id}', '${p.name.replace(/'/g, "\\'")}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      }

      renderPagination('products-pagination', state.products, (newPage) => {
        state.products.page = newPage;
        loadProducts();
      });

    } catch (err) {
      console.error('Load products error:', err);
      tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Error loading products. Please try again.</td></tr>';
    }
  }

  // Product Add / Edit Modal
  window.openAddProductModal = function () {
    document.getElementById('modal-product-title').textContent = 'Add New Fragrance';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('prod-rating').value = '4.8';
    document.getElementById('prod-stock').value = '10';
    openModal('modal-product');
  };

  window.openEditProductModal = async function (id) {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { credentials: 'include' });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      const p = result.data;
      document.getElementById('modal-product-title').textContent = `Edit ${p.name}`;
      document.getElementById('product-id').value = p._id;
      document.getElementById('prod-name').value = p.name || '';
      document.getElementById('prod-sku').value = p.sku || '';
      document.getElementById('prod-slug').value = p.slug || '';
      document.getElementById('prod-category').value = p.category || 'woody';
      document.getElementById('prod-gender').value = p.gender || 'unisex';
      document.getElementById('prod-family').value = p.fragranceFamily || '';
      document.getElementById('prod-price').value = p.price || '';
      document.getElementById('prod-orig-price').value = p.originalPrice || '';
      document.getElementById('prod-stock').value = p.stock !== undefined ? p.stock : 10;
      document.getElementById('prod-short-desc').value = p.shortDescription || '';
      document.getElementById('prod-desc').value = p.description || '';
      document.getElementById('prod-top-notes').value = Array.isArray(p.topNotes) ? p.topNotes.join(', ') : '';
      document.getElementById('prod-heart-notes').value = Array.isArray(p.heartNotes) ? p.heartNotes.join(', ') : '';
      document.getElementById('prod-base-notes').value = Array.isArray(p.baseNotes) ? p.baseNotes.join(', ') : '';
      document.getElementById('prod-image').value = p.image || '';
      document.getElementById('prod-rating').value = p.rating || 4.8;
      document.getElementById('prod-featured').checked = Boolean(p.featured);
      document.getElementById('prod-bestseller').checked = Boolean(p.bestSeller);
      document.getElementById('prod-newarrival').checked = Boolean(p.newArrival);

      openModal('modal-product');
    } catch (err) {
      showToast('Failed to load fragrance details.', 'error');
    }
  };

  // Product Form Submit Handler
  document.getElementById('product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save-product');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const id = document.getElementById('product-id').value;
    const payload = {
      name: document.getElementById('prod-name').value.trim(),
      sku: document.getElementById('prod-sku').value.trim(),
      slug: document.getElementById('prod-slug').value.trim(),
      category: document.getElementById('prod-category').value,
      gender: document.getElementById('prod-gender').value,
      fragranceFamily: document.getElementById('prod-family').value.trim(),
      price: Number(document.getElementById('prod-price').value),
      originalPrice: document.getElementById('prod-orig-price').value ? Number(document.getElementById('prod-orig-price').value) : undefined,
      stock: Number(document.getElementById('prod-stock').value),
      shortDescription: document.getElementById('prod-short-desc').value.trim(),
      description: document.getElementById('prod-desc').value.trim(),
      topNotes: document.getElementById('prod-top-notes').value,
      heartNotes: document.getElementById('prod-heart-notes').value,
      baseNotes: document.getElementById('prod-base-notes').value,
      image: document.getElementById('prod-image').value.trim(),
      rating: Number(document.getElementById('prod-rating').value),
      featured: document.getElementById('prod-featured').checked,
      bestSeller: document.getElementById('prod-bestseller').checked,
      newArrival: document.getElementById('prod-newarrival').checked
    };

    try {
      const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (res.ok && result.success) {
        showToast(id ? 'Product updated successfully.' : 'Product created successfully.', 'success');
        closeModal('modal-product');
        loadProducts();
      } else {
        showToast(result.message || 'Failed to save product.', 'error');
      }
    } catch (err) {
      showToast('Error communicating with server.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Fragrance';
    }
  });

  // ==========================================================================
  // 5. VIEW: INVENTORY
  // ==========================================================================
  async function loadInventory() {
    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Loading inventory reserves...</td></tr>';

    try {
      const { page, limit, search, stockStatus } = state.inventory;
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (stockStatus) params.append('stockStatus', stockStatus);

      const res = await fetch(`${API_BASE}/products?${params}`, { credentials: 'include' });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      state.inventory.total = result.pagination.total;
      state.inventory.pages = result.pagination.pages;

      if (!result.data.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No matching products found.</td></tr>';
      } else {
        tbody.innerHTML = result.data.map(p => {
          const statusText = p.stock === 0 ? 'Out of Stock' : p.stock <= 3 ? 'Low Stock' : 'In Stock';
          const statusClass = p.stock === 0 ? 'outofstock' : p.stock <= 3 ? 'lowstock' : 'instock';
          return `
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <img src="${p.image}" class="product-cell-img" alt="${p.name}">
                  <div class="product-meta-cell">
                    <span class="product-meta-name">${p.name}</span>
                    <span class="product-meta-sku">SKU: ${p.sku || p.slug}</span>
                  </div>
                </div>
              </td>
              <td><span class="badge-tag">${p.category}</span></td>
              <td><strong id="stock-val-${p._id}">${p.stock}</strong> units</td>
              <td><span class="badge ${statusClass}">${statusText}</span></td>
              <td>
                <div class="stock-adjust-cell">
                  <input type="number" id="input-stock-${p._id}" class="stock-adjust-input" value="${p.stock}" min="0">
                  <button class="btn btn-primary btn-sm" onclick="saveQuickStock('${p._id}')">Update</button>
                </div>
              </td>
              <td>${new Date(p.updatedAt || p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            </tr>
          `;
        }).join('');
      }

      renderPagination('inventory-pagination', state.inventory, (newPage) => {
        state.inventory.page = newPage;
        loadInventory();
      });

    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Failed to load inventory.</td></tr>';
    }
  }

  window.saveQuickStock = async function (id) {
    const input = document.getElementById(`input-stock-${id}`);
    const newStock = parseInt(input.value, 10);
    if (isNaN(newStock) || newStock < 0) {
      showToast('Stock must be 0 or greater.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stock: newStock })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showToast(result.message || 'Stock updated.', 'success');
        loadInventory();
      } else {
        showToast(result.message || 'Stock update failed.', 'error');
      }
    } catch (err) {
      showToast('Error updating stock.', 'error');
    }
  };

  // ==========================================================================
  // 6. VIEW: ORDERS
  // ==========================================================================
  async function loadOrders() {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '<tr><td colspan="8" class="table-empty">Loading orders...</td></tr>';

    try {
      const { page, limit, search, orderStatus, paymentStatus } = state.orders;
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (orderStatus && orderStatus !== 'all') params.append('orderStatus', orderStatus);
      if (paymentStatus && paymentStatus !== 'all') params.append('paymentStatus', paymentStatus);

      const res = await fetch(`${API_BASE}/orders?${params}`, { credentials: 'include' });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      state.orders.total = result.pagination.total;
      state.orders.pages = result.pagination.pages;

      if (!result.data.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="table-empty">No orders found.</td></tr>';
      } else {
        tbody.innerHTML = result.data.map(o => `
          <tr>
            <td><strong>${o.orderNumber || 'N/A'}</strong></td>
            <td>
              <div class="product-meta-cell">
                <span style="font-weight:600;">${o.customer?.name || 'Customer'}</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">${o.customer?.email || ''}</span>
              </div>
            </td>
            <td>${o.items?.length || 0} items</td>
            <td><strong>₹${(o.total || 0).toLocaleString()}</strong></td>
            <td>
              <span class="badge payment-${(o.paymentStatus || 'pending').toLowerCase()}">${o.paymentStatus || 'pending'}</span>
            </td>
            <td>
              <span class="badge status-${(o.orderStatus || 'pending').toLowerCase()}">${o.orderStatus || 'pending'}</span>
            </td>
            <td>${new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td class="text-right">
              <button class="action-btn" title="View Full Order" onclick="viewOrderDetails('${o._id}')">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }

      renderPagination('orders-pagination', state.orders, (newPage) => {
        state.orders.page = newPage;
        loadOrders();
      });

    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="8" class="table-empty">Failed to load orders.</td></tr>';
    }
  }

  window.viewOrderDetails = async function (id) {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, { credentials: 'include' });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      const o = result.data;
      document.getElementById('modal-order-number').textContent = `Order: ${o.orderNumber || 'N/A'}`;

      const addr = o.shippingAddress || {};
      const itemsHtml = (o.items || []).map(item => `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <img src="${item.image || '/images/placeholder.jpg'}" class="product-cell-img" alt="${item.name || ''}">
              <span>${item.name || 'Product'}</span>
            </div>
          </td>
          <td>₹${(item.price || 0).toLocaleString()}</td>
          <td>${item.quantity || 1}</td>
          <td class="text-right">₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
        </tr>
      `).join('');

      document.getElementById('modal-order-content').innerHTML = `
        <div class="order-details-grid">
          <div class="order-detail-box">
            <h4>CUSTOMER DETAILS</h4>
            <p><strong>${o.customer?.name || ''}</strong></p>
            <p><i class="fas fa-envelope"></i> ${o.customer?.email || ''}</p>
            <p><i class="fas fa-phone"></i> ${o.customer?.phone || ''}</p>
          </div>
          <div class="order-detail-box">
            <h4>SHIPPING ADDRESS</h4>
            <p>${addr.address || ''}${addr.landmark ? ', ' + addr.landmark : ''}</p>
            <p>${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}</p>
            <p>${addr.country || 'India'}</p>
          </div>
        </div>

        <table class="order-items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Unit Price</th>
              <th>Qty</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="order-details-grid">
          <div class="order-detail-box">
            <h4>PAYMENT INFORMATION</h4>
            <p>Method: <strong>${(o.paymentMethod || 'COD').toUpperCase()}</strong></p>
            <p>Payment Status: <span class="badge payment-${(o.paymentStatus || 'pending').toLowerCase()}">${o.paymentStatus || 'pending'}</span></p>
            ${o.transactionId ? `<p>Transaction ID: <code>${o.transactionId}</code></p>` : ''}
          </div>
          <div class="order-detail-box">
            <h4>ORDER SUMMARY</h4>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;"><span>Subtotal:</span><span>₹${(o.subtotal || 0).toLocaleString()}</span></div>
            ${o.discount ? `<div style="display:flex; justify-content:space-between; color:var(--success); margin-bottom:0.25rem;"><span>Discount${o.coupon?.code ? ` (${o.coupon.code})` : ''}:</span><span>−₹${(o.discount || 0).toLocaleString()}</span></div>` : ''}
            <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;"><span>Tax (GST):</span><span>₹${(o.tax || 0).toLocaleString()}</span></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;"><span>Shipping:</span><span>${o.shipping === 0 ? 'Free' : '₹' + (o.shipping || 0).toLocaleString()}</span></div>
            <div style="display:flex; justify-content:space-between; font-weight:700; font-size:1.1rem; border-top:1px solid var(--ivory-border); padding-top:0.5rem;"><span>Total:</span><span>₹${(o.total || 0).toLocaleString()}</span></div>
          </div>
        </div>

        <div class="order-status-update-bar">
          <span style="font-weight:600;">Update Status:</span>
          <select id="modal-order-status-select" class="form-select">
            <option value="pending" ${o.orderStatus === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${o.orderStatus === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="processing" ${o.orderStatus === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${o.orderStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${o.orderStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${o.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>

          <select id="modal-payment-status-select" class="form-select">
            <option value="pending" ${o.paymentStatus === 'pending' ? 'selected' : ''}>Payment: Pending</option>
            <option value="paid" ${o.paymentStatus === 'paid' ? 'selected' : ''}>Payment: Paid</option>
            <option value="failed" ${o.paymentStatus === 'failed' ? 'selected' : ''}>Payment: Failed</option>
            <option value="refunded" ${o.paymentStatus === 'refunded' ? 'selected' : ''}>Payment: Refunded</option>
          </select>

          <button class="btn btn-primary" onclick="saveOrderStatus('${o._id}')">Save Status</button>
        </div>
      `;

      openModal('modal-order');
    } catch (err) {
      showToast('Error loading order details.', 'error');
    }
  };

  window.saveOrderStatus = async function (id) {
    const orderStatus = document.getElementById('modal-order-status-select').value;
    const paymentStatus = document.getElementById('modal-payment-status-select').value;

    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderStatus, paymentStatus })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showToast(result.message || 'Order status updated.', 'success');
        closeModal('modal-order');
        loadOrders();
      } else {
        showToast(result.message || 'Failed to update order.', 'error');
      }
    } catch (err) {
      showToast('Error updating order.', 'error');
    }
  };

  // ==========================================================================
  // 7. VIEW: CUSTOMERS
  // ==========================================================================
  async function loadCustomers() {
    const tbody = document.getElementById('customers-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Loading clientele...</td></tr>';

    try {
      const { page, limit, search } = state.customers;
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/customers?${params}`, { credentials: 'include' });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      state.customers.total = result.pagination.total;
      state.customers.pages = result.pagination.pages;
      document.getElementById('customers-count-badge').textContent = `${result.pagination.total} Customers`;

      if (!result.data.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No clients registered matching search.</td></tr>';
      } else {
        tbody.innerHTML = result.data.map(c => `
          <tr>
            <td>
              <div class="product-meta-cell">
                <span class="product-meta-name">${c.firstName || ''} ${c.lastName || ''}</span>
                <span class="product-meta-sku">${c.email}</span>
              </div>
            </td>
            <td>${c.phone || '<span style="color:#aaa;">Not provided</span>'}</td>
            <td>${new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td><strong>${c.orderCount || 0}</strong> orders</td>
            <td><strong>₹${(c.totalSpent || 0).toLocaleString()}</strong></td>
            <td class="text-right">
              <button class="action-btn" title="View Client Dossier" onclick="viewCustomerDetails('${c._id}')">
                <i class="fas fa-user-tag"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }

      renderPagination('customers-pagination', state.customers, (newPage) => {
        state.customers.page = newPage;
        loadCustomers();
      });

    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Failed to load customer directory.</td></tr>';
    }
  }

  window.viewCustomerDetails = async function (id) {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, { credentials: 'include' });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      const { customer, orderCount, totalSpent, orders } = result.data;
      document.getElementById('modal-customer-name').textContent = `${customer.firstName} ${customer.lastName}`;

      const ordersListHtml = (orders || []).map(o => `
        <div style="display:flex; justify-content:space-between; padding:0.65rem 0; border-bottom:1px solid var(--ivory-border); font-size:0.82rem;">
          <div>
            <strong>${o.orderNumber}</strong> • ${new Date(o.createdAt).toLocaleDateString('en-IN')}
          </div>
          <div>
            <strong>₹${o.total.toLocaleString()}</strong> • <span class="badge status-${o.orderStatus}">${o.orderStatus}</span>
          </div>
        </div>
      `).join('') || '<p style="color:#888; font-style:italic;">No orders placed yet.</p>';

      document.getElementById('modal-customer-content').innerHTML = `
        <div class="order-details-grid" style="margin-bottom:1.5rem;">
          <div class="order-detail-box">
            <h4>PROFILE INFORMATION</h4>
            <p><strong>${customer.firstName} ${customer.lastName}</strong></p>
            <p><i class="fas fa-envelope"></i> ${customer.email}</p>
            <p><i class="fas fa-phone"></i> ${customer.phone || 'None'}</p>
            <p>Joined: ${new Date(customer.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
          <div class="order-detail-box">
            <h4>LIFETIME VALUE</h4>
            <p>Total Orders Placed: <strong>${orderCount}</strong></p>
            <p>Total Revenue Spent: <strong style="color:var(--gold); font-size:1.1rem;">₹${totalSpent.toLocaleString()}</strong></p>
          </div>
        </div>

        <h4 style="font-size:0.75rem; letter-spacing:0.1em; color:var(--gold); margin-bottom:0.75rem;">ORDER HISTORY</h4>
        <div style="max-height:220px; overflow-y:auto;">
          ${ordersListHtml}
        </div>
      `;

      openModal('modal-customer');
    } catch (err) {
      showToast('Failed to load customer profile.', 'error');
    }
  };

  // ==========================================================================
  // 8. VIEW: COUPONS
  // ==========================================================================
  async function loadCoupons() {
    const tbody = document.getElementById('coupons-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Loading promotional codes...</td></tr>';

    try {
      const res = await fetch(`${API_BASE}/coupons`, { credentials: 'include' });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      if (!result.data.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="table-empty">No coupons active. Create one to begin promotions.</td></tr>';
      } else {
        tbody.innerHTML = result.data.map(c => `
          <tr>
            <td><strong style="letter-spacing:0.06em; font-family:var(--font-serif); font-size:1.05rem;">${c.code}</strong></td>
            <td>${c.discountType === 'percentage' ? `${c.discountValue}% Off` : `₹${c.discountValue} Off`}</td>
            <td>₹${(c.minimumOrderValue || 0).toLocaleString()}</td>
            <td>${c.usedCount || 0} / ${c.usageLimit ? c.usageLimit : '∞'}</td>
            <td>${new Date(c.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td>
              <span class="badge ${c.active ? 'instock' : 'outofstock'}">${c.active ? 'Active' : 'Disabled'}</span>
            </td>
            <td class="text-right">
              <div class="action-btn-group">
                <button class="action-btn" title="Edit Coupon" onclick="openEditCouponModal('${c._id}')">
                  <i class="fas fa-pen-to-square"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete Coupon" onclick="confirmDelete('coupon', '${c._id}', '${c.code}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="7" class="table-empty">Failed to load coupons.</td></tr>';
    }
  }

  window.openAddCouponModal = function () {
    document.getElementById('modal-coupon-title').textContent = 'Create Coupon';
    document.getElementById('coupon-form').reset();
    document.getElementById('coupon-id').value = '';
    document.getElementById('coup-active').checked = true;
    openModal('modal-coupon');
  };

  window.openEditCouponModal = async function (id) {
    try {
      const res = await fetch(`${API_BASE}/coupons`, { credentials: 'include' });
      const result = await res.json();
      const coupon = result.data.find(c => c._id === id);
      if (!coupon) return;

      document.getElementById('modal-coupon-title').textContent = `Edit Coupon ${coupon.code}`;
      document.getElementById('coupon-id').value = coupon._id;
      document.getElementById('coup-code').value = coupon.code;
      document.getElementById('coup-type').value = coupon.discountType;
      document.getElementById('coup-value').value = coupon.discountValue;
      document.getElementById('coup-min-order').value = coupon.minimumOrderValue || 0;
      document.getElementById('coup-max-discount').value = coupon.maximumDiscount || '';
      document.getElementById('coup-expiry').value = new Date(coupon.expiryDate).toISOString().split('T')[0];
      document.getElementById('coup-limit').value = coupon.usageLimit || '';
      document.getElementById('coup-active').checked = Boolean(coupon.active);

      openModal('modal-coupon');
    } catch (err) {
      showToast('Error opening coupon modal.', 'error');
    }
  };

  document.getElementById('coupon-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('coupon-id').value;
    const payload = {
      code: document.getElementById('coup-code').value.trim(),
      discountType: document.getElementById('coup-type').value,
      discountValue: Number(document.getElementById('coup-value').value),
      minimumOrderValue: Number(document.getElementById('coup-min-order').value) || 0,
      maximumDiscount: document.getElementById('coup-max-discount').value ? Number(document.getElementById('coup-max-discount').value) : null,
      expiryDate: document.getElementById('coup-expiry').value,
      usageLimit: document.getElementById('coup-limit').value ? Number(document.getElementById('coup-limit').value) : null,
      active: document.getElementById('coup-active').checked
    };

    try {
      const url = id ? `${API_BASE}/coupons/${id}` : `${API_BASE}/coupons`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showToast(result.message || 'Coupon saved.', 'success');
        closeModal('modal-coupon');
        loadCoupons();
      } else {
        showToast(result.message || 'Failed to save coupon.', 'error');
      }
    } catch (err) {
      showToast('Network error saving coupon.', 'error');
    }
  });

  // ==========================================================================
  // 9. VIEW: SUBSCRIBERS
  // ==========================================================================
  async function loadSubscribers() {
    const tbody = document.getElementById('subscribers-table-body');
    tbody.innerHTML = '<tr><td colspan="3" class="table-empty">Loading subscribers...</td></tr>';

    try {
      const { page, limit, search } = state.subscribers;
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);

      const res = await fetch(`${API_BASE}/subscribers?${params}`, { credentials: 'include' });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      state.subscribers.total = result.pagination.total;
      state.subscribers.pages = result.pagination.pages;
      document.getElementById('subscribers-count-badge').textContent = `${result.pagination.total} Subscribers`;

      if (!result.data.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No subscribers found.</td></tr>';
      } else {
        tbody.innerHTML = result.data.map(s => `
          <tr>
            <td><strong>${s.email}</strong></td>
            <td>${new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td class="text-right">
              <button class="action-btn delete-btn" title="Remove Subscriber" onclick="confirmDelete('subscriber', '${s._id}', '${s.email}')">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }

      renderPagination('subscribers-pagination', state.subscribers, (newPage) => {
        state.subscribers.page = newPage;
        loadSubscribers();
      });

    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="3" class="table-empty">Failed to load subscriber list.</td></tr>';
    }
  }

  // ==========================================================================
  // 10. VIEW: CONTACT MESSAGES
  // ==========================================================================
  async function loadMessages() {
    const tbody = document.getElementById('messages-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Loading inquiries...</td></tr>';

    try {
      const { page, limit, search, isRead } = state.messages;
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (isRead !== 'all') params.append('isRead', isRead);

      const res = await fetch(`${API_BASE}/messages?${params}`, { credentials: 'include' });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      state.messages.total = result.pagination.total;
      state.messages.pages = result.pagination.pages;
      
      const unreadBadge = document.getElementById('badge-unread-messages');
      if (result.unreadCount > 0) {
        unreadBadge.textContent = result.unreadCount;
        unreadBadge.hidden = false;
        document.getElementById('messages-unread-badge').textContent = `${result.unreadCount} Unread`;
      } else {
        unreadBadge.hidden = true;
        document.getElementById('messages-unread-badge').textContent = 'All Inquiries Addressed';
      }

      if (!result.data.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No concierge inquiries received.</td></tr>';
      } else {
        tbody.innerHTML = result.data.map(m => `
          <tr>
            <td>
              <span class="badge ${m.isRead ? 'payment-refunded' : 'instock'}">${m.isRead ? 'Read' : 'New'}</span>
            </td>
            <td><strong>${m.name}</strong></td>
            <td>
              <div class="product-meta-cell">
                <span>${m.email}</span>
                <span style="font-size:0.72rem; color:var(--text-muted);">${m.phone || ''}</span>
              </div>
            </td>
            <td style="max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${m.message}
            </td>
            <td>${new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
            <td class="text-right">
              <div class="action-btn-group">
                <button class="action-btn" title="View Inquiry" onclick="viewMessageDetails('${m._id}', '${m.name.replace(/'/g, "\\'")}', '${m.email}', '${m.phone}', '${m.message.replace(/'/g, "\\'").replace(/\n/g, '<br>')}', '${m.createdAt}', ${m.isRead})">
                  <i class="fas fa-envelope-open"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete Inquiry" onclick="confirmDelete('message', '${m._id}', '${m.name.replace(/'/g, "\\'")}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('');
      }

      renderPagination('messages-pagination', state.messages, (newPage) => {
        state.messages.page = newPage;
        loadMessages();
      });

    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">Failed to load inquiries.</td></tr>';
    }
  }

  window.viewMessageDetails = async function (id, name, email, phone, message, date, isRead) {
    document.getElementById('modal-msg-sender').textContent = `Inquiry from ${name}`;
    document.getElementById('modal-message-content').innerHTML = `
      <div class="order-detail-box" style="margin-bottom:1.25rem;">
        <h4>SENDER DETAILS</h4>
        <p><strong>${name}</strong></p>
        <p><i class="fas fa-envelope"></i> <a href="mailto:${email}" style="color:var(--gold);">${email}</a></p>
        <p><i class="fas fa-phone"></i> ${phone || 'Not provided'}</p>
        <p>Received: ${new Date(date).toLocaleString('en-IN')}</p>
      </div>

      <div class="order-detail-box">
        <h4>MESSAGE CONTENT</h4>
        <p style="font-family:var(--font-serif); font-size:1.05rem; line-height:1.7; color:var(--charcoal);">${message}</p>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem;">
        <a href="mailto:${email}?subject=Regarding your ÉLORIA inquiry" class="btn btn-primary btn-sm">
          <i class="fas fa-reply"></i> Reply via Email
        </a>
        <button class="btn btn-outline btn-sm" onclick="toggleMessageRead('${id}', ${!isRead})">
          ${isRead ? 'Mark as Unread' : 'Mark as Read'}
        </button>
      </div>
    `;

    openModal('modal-message');

    // Auto mark as read if unread
    if (!isRead) {
      toggleMessageRead(id, true, false);
    }
  };

  window.toggleMessageRead = async function (id, isRead, refresh = true) {
    try {
      await fetch(`${API_BASE}/messages/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isRead })
      });
      if (refresh) {
        closeModal('modal-message');
        loadMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================================================
  // 11. VIEW: SETTINGS
  // ==========================================================================
  async function loadSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings`, { credentials: 'include' });
      const result = await res.json();
      if (result.success && result.data) {
        const s = result.data;
        document.getElementById('set-store-name').value = s.storeName || 'ÉLORIA Luxury Parfums';
        document.getElementById('set-tagline').value = s.tagline || 'A Fragrance That Becomes Your Signature.';
        document.getElementById('set-contact-email').value = s.contactEmail || 'concierge@eloria.com';
        document.getElementById('set-support-phone').value = s.supportPhone || '+91 98765 43210';
        document.getElementById('set-tax-rate').value = s.taxRate !== undefined ? s.taxRate : 18;
        document.getElementById('set-free-shipping').value = s.freeShippingLimit !== undefined ? s.freeShippingLimit : 5000;
        document.getElementById('set-shipping-charge').value = s.shippingCharge !== undefined ? s.shippingCharge : 199;
      }
    } catch (err) {
      console.error('Settings load error:', err);
    }
  }

  document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      storeName: document.getElementById('set-store-name').value,
      tagline: document.getElementById('set-tagline').value,
      contactEmail: document.getElementById('set-contact-email').value,
      supportPhone: document.getElementById('set-support-phone').value,
      taxRate: Number(document.getElementById('set-tax-rate').value),
      freeShippingLimit: Number(document.getElementById('set-free-shipping').value),
      shippingCharge: Number(document.getElementById('set-shipping-charge').value)
    };

    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showToast('Atelier settings updated successfully.', 'success');
      } else {
        showToast(result.message || 'Failed to update settings.', 'error');
      }
    } catch (err) {
      showToast('Error updating settings.', 'error');
    }
  });

  // ==========================================================================
  // 12. GENERIC DELETE CONFIRMATION MODAL
  // ==========================================================================
  window.confirmDelete = function (type, id, name) {
    state.deleteTarget = { type, id, name };
    const titleMap = {
      product: `Are you sure you want to remove "${name}"?`,
      coupon: `Are you sure you want to delete coupon "${name}"?`,
      subscriber: `Are you sure you want to remove "${name}" from journal?`,
      message: `Are you sure you want to delete message from "${name}"?`
    };
    document.getElementById('delete-confirm-title').textContent = titleMap[type] || 'Confirm removal?';
    openModal('modal-delete-confirm');
  };

  document.getElementById('btn-confirm-delete-action')?.addEventListener('click', async () => {
    const { type, id } = state.deleteTarget;
    if (!type || !id) return;

    const btn = document.getElementById('btn-confirm-delete-action');
    btn.disabled = true;
    btn.textContent = 'DELETING...';

    try {
      let endpoint = '';
      if (type === 'product') endpoint = `${API_BASE}/products/${id}`;
      else if (type === 'coupon') endpoint = `${API_BASE}/coupons/${id}`;
      else if (type === 'subscriber') endpoint = `${API_BASE}/subscribers/${id}`;
      else if (type === 'message') endpoint = `${API_BASE}/messages/${id}`;

      const res = await fetch(endpoint, { method: 'DELETE', credentials: 'include' });
      const result = await res.json();

      if (res.ok && result.success) {
        showToast(result.message || 'Item deleted successfully.', 'success');
        closeModal('modal-delete-confirm');
        
        // Refresh active view
        if (type === 'product') { loadProducts(); if (state.currentView === 'inventory') loadInventory(); }
        else if (type === 'coupon') loadCoupons();
        else if (type === 'subscriber') loadSubscribers();
        else if (type === 'message') loadMessages();
      } else {
        showToast(result.message || 'Delete failed.', 'error');
      }
    } catch (err) {
      showToast('Network error during deletion.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'DELETE';
    }
  });

  // ==========================================================================
  // 13. UI HELPERS, MODALS & EVENT LISTENERS
  // ==========================================================================
  window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  function renderPagination(containerId, paginationState, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { page, total, limit, pages } = paginationState;
    if (total === 0) {
      container.innerHTML = '<span>0 records</span>';
      return;
    }

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    let buttons = `
      <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="changePage('${containerId}', ${page - 1})">
        <i class="fas fa-chevron-left"></i>
      </button>
    `;

    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
        buttons += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="changePage('${containerId}', ${i})">${i}</button>`;
      } else if (i === page - 2 || i === page + 2) {
        buttons += `<span style="padding:0 4px;">...</span>`;
      }
    }

    buttons += `
      <button class="page-btn" ${page >= pages ? 'disabled' : ''} onclick="changePage('${containerId}', ${page + 1})">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;

    container.innerHTML = `
      <span>Showing ${start}–${end} of ${total} records</span>
      <div class="pagination-controls">${buttons}</div>
    `;

    // Attach global page change listener
    window[`_pageCallback_${containerId}`] = onPageChange;
  }

  window.changePage = function (containerId, newPage) {
    if (window[`_pageCallback_${containerId}`]) {
      window[`_pageCallback_${containerId}`](newPage);
    }
  };

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-info';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function startClock() {
    function update() {
      const now = new Date();
      el.liveClock.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    update();
    setInterval(update, 1000);
  }

  function debounce(fn, delay = 350) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function setupEventListeners() {
    // Sidebar Nav
    el.navItems.forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Mobile Drawer
    el.mobileToggle?.addEventListener('click', () => {
      el.sidebar.classList.add('open');
      el.sidebarOverlay.classList.add('active');
    });
    el.sidebarClose?.addEventListener('click', closeMobileSidebar);
    el.sidebarOverlay?.addEventListener('click', closeMobileSidebar);

    // Logout
    el.logoutBtns.forEach(btn => btn?.addEventListener('click', handleLogout));

    // Password toggle
    document.querySelector('.password-toggle-btn')?.addEventListener('click', () => {
      const pwd = document.getElementById('admin-password');
      const icon = document.querySelector('.password-toggle-btn i');
      if (pwd.type === 'password') {
        pwd.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        pwd.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });

    // Sales Period buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.salesPeriod = btn.dataset.period;
        updateSalesPeriodStats(state.salesPeriod);
      });
    });

    // Products Search & Filters
    document.getElementById('products-search-input')?.addEventListener('input', debounce((e) => {
      state.products.search = e.target.value.trim();
      state.products.page = 1;
      loadProducts();
    }));

    document.getElementById('products-category-filter')?.addEventListener('change', (e) => {
      state.products.category = e.target.value;
      state.products.page = 1;
      loadProducts();
    });

    document.getElementById('products-stock-filter')?.addEventListener('change', (e) => {
      state.products.stockStatus = e.target.value;
      state.products.page = 1;
      loadProducts();
    });

    document.getElementById('btn-add-product')?.addEventListener('click', openAddProductModal);

    // Inventory Search & Filters
    document.getElementById('inventory-search-input')?.addEventListener('input', debounce((e) => {
      state.inventory.search = e.target.value.trim();
      state.inventory.page = 1;
      loadInventory();
    }));

    document.getElementById('inventory-filter-status')?.addEventListener('change', (e) => {
      state.inventory.stockStatus = e.target.value;
      state.inventory.page = 1;
      loadInventory();
    });

    // Orders Filter Tabs
    document.querySelectorAll('.order-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.order-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.orders.orderStatus = tab.dataset.status;
        state.orders.page = 1;
        loadOrders();
      });
    });

    document.getElementById('orders-search-input')?.addEventListener('input', debounce((e) => {
      state.orders.search = e.target.value.trim();
      state.orders.page = 1;
      loadOrders();
    }));

    document.getElementById('orders-payment-filter')?.addEventListener('change', (e) => {
      state.orders.paymentStatus = e.target.value;
      state.orders.page = 1;
      loadOrders();
    });

    // Customers Search
    document.getElementById('customers-search-input')?.addEventListener('input', debounce((e) => {
      state.customers.search = e.target.value.trim();
      state.customers.page = 1;
      loadCustomers();
    }));

    // Coupons Add
    document.getElementById('btn-add-coupon')?.addEventListener('click', openAddCouponModal);

    // Subscribers Search
    document.getElementById('subscribers-search-input')?.addEventListener('input', debounce((e) => {
      state.subscribers.search = e.target.value.trim();
      state.subscribers.page = 1;
      loadSubscribers();
    }));

    // Messages Search & Filters
    document.getElementById('messages-search-input')?.addEventListener('input', debounce((e) => {
      state.messages.search = e.target.value.trim();
      state.messages.page = 1;
      loadMessages();
    }));

    document.getElementById('messages-status-filter')?.addEventListener('change', (e) => {
      state.messages.isRead = e.target.value;
      state.messages.page = 1;
      loadMessages();
    });
  }

  function closeMobileSidebar() {
    el.sidebar?.classList.remove('open');
    el.sidebarOverlay?.classList.remove('active');
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
