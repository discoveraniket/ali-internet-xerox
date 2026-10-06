// Faruk's Counter Workstation & Shop Control Center Logic
// Real-time SSE listener, operator auth PIN wall, settings manager, and compact sidebar navigation

document.addEventListener('DOMContentLoaded', () => {
  let ordersList = [];
  let currentFilter = 'all';
  let soundEnabled = true;
  let currentLang = localStorage.getItem('ali_counter_lang') || 'bn';
  let enteredPin = '';
  let selectedTheme = 'ocean-emerald';
  let selectedPhotoBase64 = null;
  let selectedPhotoName = '';
  let sseEventSource = null;

  // DOM Elements - Auth Wall
  const loginWall = document.getElementById('loginWall');
  const workstationWrapper = document.getElementById('workstationWrapper');
  const pinDots = document.querySelectorAll('.pin-dot');
  const numericKeypad = document.getElementById('numericKeypad');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const manualPinInput = document.getElementById('manualPinInput');
  const btnManualUnlock = document.getElementById('btnManualUnlock');

  // DOM Elements - Sidebar & Topbar
  const counterSidebar = document.getElementById('counterSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  const topbarTitle = document.getElementById('topbarTitle');
  const topbarIcon = document.getElementById('topbarIcon');
  const topbarSaveBtn = document.getElementById('topbarSaveBtn');
  const topbarLockBtn = document.getElementById('topbarLockBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundToggleIcon = document.getElementById('soundToggleIcon');
  const soundToggleText = document.getElementById('soundToggleText');
  const langToggleBtn = document.getElementById('langToggleBtn');
  const langToggleText = document.getElementById('langToggleText');
  const liveStatusPill = document.getElementById('liveStatusPill');

  // Navigation Items
  const tabOrdersView = document.getElementById('tabOrdersView');
  const tabSettingsView = document.getElementById('tabSettingsView');
  const viewOrders = document.getElementById('viewOrders');
  const viewSettings = document.getElementById('viewSettings');
  const navBadgePending = document.getElementById('navBadgePending');

  // DOM Elements - Orders View
  const ordersGrid = document.getElementById('ordersGrid');
  const filterTabs = document.querySelectorAll('.tab-btn');

  // Metrics elements
  const statPending = document.getElementById('statPending');
  const statReady = document.getElementById('statReady');
  const statToday = document.getElementById('statToday');
  const statRevenue = document.getElementById('statRevenue');

  // DOM Elements - Settings View
  const priceBwXerox = document.getElementById('priceBwXerox');
  const priceColorPrint = document.getElementById('priceColorPrint');
  const pricePhotoPassport = document.getElementById('pricePhotoPassport');
  const priceLamination = document.getElementById('priceLamination');
  const priceSpiralBinding = document.getElementById('priceSpiralBinding');
  const priceRubberStamp = document.getElementById('priceRubberStamp');

  const bannerActive = document.getElementById('bannerActive');
  const bannerTagBn = document.getElementById('bannerTagBn');
  const bannerMsgBn = document.getElementById('bannerMsgBn');
  const bannerMsgEn = document.getElementById('bannerMsgEn');
  const bannerActionLabel = document.getElementById('bannerActionLabel');
  const bannerActionUrl = document.getElementById('bannerActionUrl');

  const themeCards = document.querySelectorAll('.theme-select-card');

  const storefrontFileInput = document.getElementById('storefrontFileInput');
  const storefrontImgPreview = document.getElementById('storefrontImgPreview');
  const btnUploadStorefrontPhoto = document.getElementById('btnUploadStorefrontPhoto');
  const photoUploadFeedback = document.getElementById('photoUploadFeedback');

  const contactPhone = document.getElementById('contactPhone');
  const contactWhatsapp = document.getElementById('contactWhatsapp');
  const contactEmail = document.getElementById('contactEmail');
  const contactHoursBn = document.getElementById('contactHoursBn');
  const contactLandmarkBn = document.getElementById('contactLandmarkBn');

  const btnSaveAllSettingsTop = document.getElementById('btnSaveAllSettingsTop');
  const toastNotification = document.getElementById('toastNotification');

  const I18N = {
    en: {
      brandTitleShort: "Ali Internet",
      brandSubShort: "Counter Desk • Puncha",
      loginTitle: "Ali Internet Counter Security",
      loginSub: "Enter 4-digit Operator PIN to access Counter Desk & Settings",
      tabAll: "All Orders",
      tabPending: "Pending",
      tabReady: "Ready for Pickup",
      tabCompleted: "Completed",
      navOrders: "Live Orders Queue",
      navSettings: "Site Settings",
      statPendingLbl: "Pending in Queue",
      statReadyLbl: "Ready for Pickup",
      statTodayLbl: "Today's Total Orders",
      statRevenueLbl: "Today's Est. Revenue",
      btnPrint: "🖨️ Open / Print File",
      btnMarkReady: "🟢 Mark Ready",
      btnMarkComplete: "✅ Mark Handed Over",
      statusPending: "Pending",
      statusReady: "Ready",
      statusCompleted: "Completed",
      payUpi: "Paid via UPI",
      payCash: "Pay Cash at Counter",
      emptyMsg: "No print orders in this queue right now.",
      switchLang: "বাংলায় দেখুন",
      soundOn: "Sound: ON",
      soundOff: "Sound: OFF",
      themeLabel: "Theme",
      mainSiteLink: "Main Site",
      lockDesk: "Lock Desk",
      settingsTitle: "⚙️ Shop & Site Configuration",
      settingsSubtitle: "Configure service rates, urgent hero banner, color themes, and shop storefront photo.",
      btnSaveSettings: "Save All Settings"
    },
    bn: {
      brandTitleShort: "আলি ইন্টারনেট",
      brandSubShort: "কাউন্টার ডেস্ক • পুঞ্চা",
      loginTitle: "আলি ইন্টারনেট কাউন্টার সিকিউরিটি",
      loginSub: "কাউন্টার ডেস্ক ও সেটিংস পরিচালনার জন্য অপারেটর পিন (PIN) দিন",
      tabAll: "সকল অর্ডার",
      tabPending: "অপেক্ষমান",
      tabReady: "প্রিন্ট রেডি",
      tabCompleted: "সম্পন্ন",
      navOrders: "লাইভ অর্ডার কিউ",
      navSettings: "সাইট সেটিংস",
      statPendingLbl: "অপেক্ষমান অর্ডার",
      statReadyLbl: "ডেলিভারির জন্য রেডি",
      statTodayLbl: "আজকের মোট অর্ডার",
      statRevenueLbl: "আজকের আনুমানিক আয়",
      btnPrint: "🖨️ ফাইল ওপেন ও প্রিন্ট করুন",
      btnMarkReady: "🟢 রেডি চিহ্নিত করুন",
      btnMarkComplete: "✅ গ্রাহককে দেওয়া হয়েছে",
      statusPending: "অপেক্ষমান",
      statusReady: "রেডি",
      statusCompleted: "সম্পন্ন",
      payUpi: "ইউপিআই মাধ্যমে প্রদত্ত",
      payCash: "দোকানে এসে নগদ প্রদান",
      emptyMsg: "বর্তমানে কোনো অর্ডার নেই। নতুন অর্ডার এলে সরাসরি স্ক্রিনে ভেসে উঠবে।",
      switchLang: "Switch to English",
      soundOn: "সাউন্ড: চালু",
      soundOff: "সাউন্ড: বন্ধ",
      themeLabel: "থিম",
      mainSiteLink: "মূল সাইট",
      lockDesk: "লক করুন (Lock)",
      settingsTitle: "⚙️ দোকান ও সাইট কনফিগারেশন",
      settingsSubtitle: "এখানে মূল্য তালিকা, হিরো ব্যানার, কালার থিম ও দোকানের ছবি পরিবর্তন করুন।",
      btnSaveSettings: "সেটিংস সেভ করুন"
    }
  };

  // Toast Helper
  function showToast(msg, isError = false) {
    if (!toastNotification) return;
    toastNotification.textContent = msg;
    toastNotification.style.borderColor = isError ? 'var(--c-danger)' : 'var(--c-primary)';
    toastNotification.classList.add('show');
    setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3500);
  }

  // Synthesized Web Audio Chime
  function playChime() {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.65);
    } catch (e) {
      console.warn("Audio autoplay blocked or unsupported", e);
    }
  }

  // =========================================================================
  // 1. Operator Auth & Login Wall Handlers
  // =========================================================================

  function updatePinDisplay() {
    pinDots.forEach((dot, idx) => {
      if (idx < enteredPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
      dot.classList.remove('error');
    });
  }

  async function checkAuthStatus() {
    try {
      const res = await fetch('/api/auth/verify');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          unlockWorkstation();
          return;
        }
      }
    } catch (e) {
      console.error("Auth check failed", e);
    }
    lockWorkstation();
  }

  function unlockWorkstation() {
    if (loginWall) loginWall.style.display = 'none';
    if (workstationWrapper) workstationWrapper.style.display = 'block';
    enteredPin = '';
    updatePinDisplay();
    if (loginErrorMsg) loginErrorMsg.style.display = 'none';

    // Start workstation features
    fetchOrders();
    updateStats();
    loadSettings();
    connectSSE();
  }

  function lockWorkstation() {
    if (loginWall) loginWall.style.display = 'flex';
    if (workstationWrapper) workstationWrapper.style.display = 'none';
    enteredPin = '';
    updatePinDisplay();
    closeSidebar();
    if (sseEventSource) {
      sseEventSource.close();
      sseEventSource = null;
    }
  }

  async function attemptLogin(pinOrPass) {
    if (!pinOrPass) return;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinOrPass, password: pinOrPass })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        unlockWorkstation();
        showToast("🔓 স্বাগতম ফারুক! কাউন্টার ডেস্ক আনলক হয়েছে।");
      } else {
        triggerAuthError(data.error || "ভুল পিন! সঠিক পিন দিন।");
      }
    } catch (e) {
      triggerAuthError("লগইন সার্ভার সংযোগ ব্যর্থ। আবার চেষ্টা করুন।");
    }
  }

  function triggerAuthError(msg) {
    if (loginErrorMsg) {
      loginErrorMsg.textContent = msg;
      loginErrorMsg.style.display = 'block';
    }
    pinDots.forEach(dot => {
      dot.classList.add('error');
    });
    const card = document.querySelector('.login-card');
    if (card) {
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 450);
    }
    setTimeout(() => {
      enteredPin = '';
      updatePinDisplay();
    }, 800);
  }

  // Keypad clicks
  if (numericKeypad) {
    numericKeypad.addEventListener('click', (e) => {
      const btn = e.target.closest('.key-btn');
      if (!btn) return;
      const val = btn.getAttribute('data-val');

      if (val === 'clear') {
        enteredPin = '';
        updatePinDisplay();
      } else if (val === 'backspace') {
        enteredPin = enteredPin.slice(0, -1);
        updatePinDisplay();
      } else if (enteredPin.length < 4) {
        enteredPin += val;
        updatePinDisplay();
        if (enteredPin.length === 4) {
          attemptLogin(enteredPin);
        }
      }
    });
  }

  // Manual password/PIN input fallback
  if (btnManualUnlock && manualPinInput) {
    btnManualUnlock.addEventListener('click', () => {
      attemptLogin(manualPinInput.value.trim());
    });
    manualPinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        attemptLogin(manualPinInput.value.trim());
      }
    });
  }

  // Unified logout action
  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    lockWorkstation();
    showToast("🔒 কাউন্টার ডেস্ক সফলভাবে লক করা হয়েছে।");
  }

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (topbarLockBtn) topbarLockBtn.addEventListener('click', handleLogout);

  // =========================================================================
  // 2. Sidebar Navigation & Drawer Handlers
  // =========================================================================

  function openSidebar() {
    if (counterSidebar) counterSidebar.classList.add('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.add('open');
  }

  function closeSidebar() {
    if (counterSidebar) counterSidebar.classList.remove('open');
    if (sidebarBackdrop) sidebarBackdrop.classList.remove('open');
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);

  function switchView(target) {
    closeSidebar();
    if (target === 'orders') {
      if (tabOrdersView) tabOrdersView.classList.add('active');
      if (tabSettingsView) tabSettingsView.classList.remove('active');
      if (viewOrders) viewOrders.style.display = 'block';
      if (viewSettings) viewSettings.style.display = 'none';
      if (topbarTitle) topbarTitle.textContent = I18N[currentLang].navOrders;
      if (topbarIcon) topbarIcon.textContent = '🖨️';
      if (topbarSaveBtn) topbarSaveBtn.style.display = 'none';
      fetchOrders();
      updateStats();
    } else {
      if (tabOrdersView) tabOrdersView.classList.remove('active');
      if (tabSettingsView) tabSettingsView.classList.add('active');
      if (viewOrders) viewOrders.style.display = 'none';
      if (viewSettings) viewSettings.style.display = 'block';
      if (topbarTitle) topbarTitle.textContent = I18N[currentLang].navSettings;
      if (topbarIcon) topbarIcon.textContent = '⚙️';
      if (topbarSaveBtn) topbarSaveBtn.style.display = 'inline-flex';
      loadSettings();
    }
  }

  if (tabOrdersView) tabOrdersView.addEventListener('click', () => switchView('orders'));
  if (tabSettingsView) tabSettingsView.addEventListener('click', () => switchView('settings'));

  // =========================================================================
  // 3. Orders Management & Real-time Operations
  // =========================================================================

  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        ordersList = data.orders || [];
        renderOrders();
        updateStats();
      } else if (res.status === 401) {
        lockWorkstation();
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    }
  }

  async function updateStats() {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        const s = data.stats;
        if (statPending) statPending.textContent = s.pendingCount;
        if (statReady) statReady.textContent = s.readyCount;
        if (statToday) statToday.textContent = s.todayCount;
        if (statRevenue) statRevenue.textContent = `₹${s.todayRevenue}`;
        if (navBadgePending) navBadgePending.textContent = s.pendingCount;
      }
    } catch (e) {
      const pending = ordersList.filter(o => o.status === 'pending').length;
      const ready = ordersList.filter(o => o.status === 'ready').length;
      if (statPending) statPending.textContent = pending;
      if (statReady) statReady.textContent = ready;
      if (statToday) statToday.textContent = ordersList.length;
      if (navBadgePending) navBadgePending.textContent = pending;
    }
  }

  function renderOrders() {
    if (!ordersGrid) return;
    ordersGrid.innerHTML = '';

    const filtered = ordersList.filter(o => {
      if (currentFilter === 'all') return true;
      return o.status === currentFilter;
    });

    const countPending = ordersList.filter(o => o.status === 'pending').length;
    const countReady = ordersList.filter(o => o.status === 'ready').length;
    const badgePending = document.getElementById('badgePending');
    const badgeReady = document.getElementById('badgeReady');
    const badgeAll = document.getElementById('badgeAll');
    if (badgePending) badgePending.textContent = countPending;
    if (badgeReady) badgeReady.textContent = countReady;
    if (badgeAll) badgeAll.textContent = ordersList.length;
    if (navBadgePending) navBadgePending.textContent = countPending;

    if (filtered.length === 0) {
      ordersGrid.innerHTML = `
        <div class="empty-queue">
          <div class="empty-queue-icon">📥</div>
          <h3>${I18N[currentLang].emptyMsg}</h3>
        </div>
      `;
      return;
    }

    filtered.forEach(order => {
      const card = document.createElement('div');
      card.className = `order-card status-${order.status}`;

      const timeAgo = formatTimeAgo(order.createdAt);
      const isPending = order.status === 'pending';
      const isReady = order.status === 'ready';

      const customerMsg = currentLang === 'bn'
        ? `নমস্কার ${order.customerName}! আলি ইন্টারনেট ও জেরক্স (পুঞ্চা) থেকে ফারুক বলছি। আপনার প্রিন্ট অর্ডার (${order.token}) রেডি হয়ে গেছে। দোকানে এসে নিয়ে যেতে পারেন।`
        : `Hello ${order.customerName}! This is Faruk from Ali Internet & Xerox (Puncha). Your print order (${order.token}) is ready for pickup!`;

      const customerWaLink = order.customerPhone 
        ? `https://wa.me/91${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(customerMsg)}`
        : '#';

      card.innerHTML = `
        <div class="order-card-header">
          <div>
            <div class="order-token">${order.token}</div>
            <div class="order-time">${timeAgo}</div>
          </div>
          <span class="order-status-badge badge-${order.status}">
            ${order.status === 'pending' ? '⏳' : order.status === 'ready' ? '🟢' : '✅'} 
            ${I18N[currentLang]['status' + capitalize(order.status)] || order.status}
          </span>
        </div>

        <div class="order-customer-box">
          <div class="customer-info">
            <h4>${order.customerName || 'Anonymous Customer'}</h4>
            <p>📞 ${order.customerPhone || 'No Phone'}</p>
          </div>
          <div class="customer-actions">
            ${order.customerPhone ? `
              <a href="tel:${order.customerPhone}" class="c-icon-btn" title="Call Customer">📞</a>
              <a href="${customerWaLink}" target="_blank" rel="noopener" class="c-icon-btn btn-whatsapp" title="WhatsApp Customer">💬</a>
            ` : ''}
          </div>
        </div>

        <ul class="order-specs-list">
          <li class="spec-row">
            <span>Service</span>
            <span class="spec-val">${order.serviceName || order.serviceType}</span>
          </li>
          <li class="spec-row">
            <span>Copies / Pages</span>
            <span class="spec-val">${order.copies} Copies</span>
          </li>
          <li class="spec-row">
            <span>Size & Sides</span>
            <span class="spec-val">${order.paperSize} • ${order.sides === 'double' ? 'Both Sides' : 'Single Sided'}</span>
          </li>
          ${order.lamination ? `
            <li class="spec-row">
              <span>Lamination</span>
              <span class="spec-val" style="color: #34d399;">Yes (+₹20)</span>
            </li>
          ` : ''}
          ${order.spiralBinding ? `
            <li class="spec-row">
              <span>Spiral Binding</span>
              <span class="spec-val" style="color: #38bdf8;">Yes (+₹35)</span>
            </li>
          ` : ''}
        </ul>

        <div class="order-bill-row">
          <div class="order-amount">₹${order.totalAmount}</div>
          <span class="payment-tag ${order.paymentMethod === 'upi' ? 'pay-upi' : 'pay-cash'}">
            ${order.paymentMethod === 'upi' ? I18N[currentLang].payUpi : I18N[currentLang].payCash}
          </span>
        </div>

        ${order.fileUrl ? `
          <div class="order-file-action">
            <a href="${order.fileUrl}" target="_blank" rel="noopener" class="btn-print-file">
              <span>${I18N[currentLang].btnPrint}</span>
            </a>
          </div>
        ` : ''}

        <div class="order-actions-bar">
          ${isPending ? `
            <button type="button" class="btn-status-ready" data-action="ready" data-id="${order.id}">
              ${I18N[currentLang].btnMarkReady}
            </button>
          ` : ''}
          
          ${isReady || isPending ? `
            <button type="button" class="btn-status-complete" data-action="completed" data-id="${order.id}">
              ${I18N[currentLang].btnMarkComplete}
            </button>
          ` : ''}
        </div>
      `;

      const readyBtn = card.querySelector('[data-action="ready"]');
      if (readyBtn) {
        readyBtn.addEventListener('click', () => updateOrderStatus(order.id, 'ready'));
      }

      const completeBtn = card.querySelector('[data-action="completed"]');
      if (completeBtn) {
        completeBtn.addEventListener('click', () => updateOrderStatus(order.id, 'completed'));
      }

      ordersGrid.appendChild(card);
    });
  }

  async function updateOrderStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const idx = ordersList.findIndex(o => o.id === id);
        if (idx !== -1) {
          ordersList[idx].status = newStatus;
          renderOrders();
          updateStats();
        }
        showToast(`✅ অর্ডার স্ট্যাটাস আপডেট হয়েছে (${newStatus})`);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  }

  function connectSSE() {
    if (sseEventSource) return;
    sseEventSource = new EventSource('/api/orders/stream');

    sseEventSource.addEventListener('connected', () => {
      if (liveStatusPill) {
        liveStatusPill.innerHTML = '<span class="live-dot"></span> <span>Live Connected</span>';
      }
    });

    sseEventSource.addEventListener('new_order', (e) => {
      try {
        const order = JSON.parse(e.data);
        ordersList.unshift(order);
        renderOrders();
        updateStats();
        playChime();
        showToast(`🔔 নতুন প্রিন্ট অর্ডার এসেছে: ${order.token} (${order.customerName || 'গ্রাহক'})`);
      } catch (err) {}
    });

    sseEventSource.addEventListener('order_updated', (e) => {
      try {
        const order = JSON.parse(e.data);
        const idx = ordersList.findIndex(o => o.id === order.id);
        if (idx !== -1) {
          ordersList[idx] = order;
          renderOrders();
          updateStats();
        }
      } catch (err) {}
    });

    sseEventSource.onerror = () => {
      if (liveStatusPill) {
        liveStatusPill.innerHTML = '<span style="color:#f43f5e">●</span> <span>Reconnecting...</span>';
      }
    };
  }

  // =========================================================================
  // 4. Shop Settings Management Handlers
  // =========================================================================

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const s = data.settings;
        if (!s) return;

        // Pricing
        if (s.pricing) {
          if (priceBwXerox) priceBwXerox.value = s.pricing.bwXerox ?? 2;
          if (priceColorPrint) priceColorPrint.value = s.pricing.colorPrint ?? 10;
          if (pricePhotoPassport) pricePhotoPassport.value = s.pricing.photoPassport ?? 40;
          if (priceLamination) priceLamination.value = s.pricing.lamination ?? 20;
          if (priceSpiralBinding) priceSpiralBinding.value = s.pricing.spiralBinding ?? 35;
          if (priceRubberStamp) priceRubberStamp.value = s.pricing.rubberStamp ?? 120;
        }

        // Hero Banner
        if (s.heroBanner) {
          if (bannerActive) bannerActive.checked = Boolean(s.heroBanner.active);
          if (bannerTagBn) bannerTagBn.value = s.heroBanner.tag?.bn || '📢 জরুরী বিজ্ঞপ্তি';
          if (bannerMsgBn) bannerMsgBn.value = s.heroBanner.message?.bn || '';
          if (bannerMsgEn) bannerMsgEn.value = s.heroBanner.message?.en || '';
          if (bannerActionLabel) bannerActionLabel.value = s.heroBanner.actionLabel?.bn || 'কাগজপত্র দেখুন';
          if (bannerActionUrl) bannerActionUrl.value = s.heroBanner.actionUrl || '#documents';
        }

        // Theme
        if (s.theme) {
          selectedTheme = s.theme;
          applySelectedThemeUI(s.theme);
        }

        // Storefront Photo
        if (s.shopPhoto && storefrontImgPreview) {
          storefrontImgPreview.src = s.shopPhoto;
        }

        // Contact info
        if (s.contact) {
          if (contactPhone) contactPhone.value = s.contact.phone || '9734573323';
          if (contactWhatsapp) contactWhatsapp.value = s.contact.whatsapp || '9734573323';
          if (contactEmail) contactEmail.value = s.contact.email || 'allinternetpuncha@gmail.com';
          if (contactHoursBn) contactHoursBn.value = s.contact.hours?.bn || 'সোম – রবি: সকাল ৮:০০ টা – রাত ৯:০০ টা';
          if (contactLandmarkBn) contactLandmarkBn.value = s.contact.landmark?.bn || 'কৃষি ফার্মের বিপরীতে, পুঞ্চা, পুরুলিয়া';
        }
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }

  function applySelectedThemeUI(themeName) {
    themeCards.forEach(card => {
      if (card.getAttribute('data-theme-val') === themeName) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  // Theme selection
  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      const themeVal = card.getAttribute('data-theme-val');
      if (themeVal) {
        selectedTheme = themeVal;
        applySelectedThemeUI(themeVal);
      }
    });
  });

  // Storefront Photo Selection
  if (storefrontFileInput) {
    storefrontFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      selectedPhotoName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        selectedPhotoBase64 = reader.result;
        if (storefrontImgPreview) storefrontImgPreview.src = selectedPhotoBase64;
        if (btnUploadStorefrontPhoto) btnUploadStorefrontPhoto.disabled = false;
        if (photoUploadFeedback) photoUploadFeedback.textContent = `ছবি নির্বাচিত: ${file.name}`;
      };
      reader.readAsDataURL(file);
    });
  }

  // Upload Photo Button
  if (btnUploadStorefrontPhoto) {
    btnUploadStorefrontPhoto.addEventListener('click', async () => {
      if (!selectedPhotoBase64) return;
      btnUploadStorefrontPhoto.disabled = true;
      btnUploadStorefrontPhoto.textContent = "আপলোড হচ্ছে...";

      try {
        const res = await fetch('/api/settings/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: selectedPhotoBase64,
            fileName: selectedPhotoName
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          if (photoUploadFeedback) photoUploadFeedback.textContent = "✅ ছবি সফলভাবে আপলোড ও সেভ হয়েছে!";
          showToast("📸 দোকানের নতুন ছবি সফলভাবে সেভ হয়েছে!");
        } else {
          if (photoUploadFeedback) photoUploadFeedback.textContent = "❌ আপলোড ব্যর্থ হয়েছে।";
          showToast(data.error || "আপলোড ব্যর্থ", true);
        }
      } catch (err) {
        if (photoUploadFeedback) photoUploadFeedback.textContent = "❌ সংযোগ ত্রুটি।";
        showToast("সংযোগ ত্রুটি", true);
      } finally {
        btnUploadStorefrontPhoto.disabled = false;
        btnUploadStorefrontPhoto.textContent = "⬆️ আপলোড";
      }
    });
  }

  // Save All Settings
  async function saveAllSettings() {
    const payload = {
      theme: selectedTheme,
      pricing: {
        bwXerox: parseFloat(priceBwXerox?.value) || 2,
        colorPrint: parseFloat(priceColorPrint?.value) || 10,
        photoPassport: parseFloat(pricePhotoPassport?.value) || 40,
        lamination: parseFloat(priceLamination?.value) || 20,
        spiralBinding: parseFloat(priceSpiralBinding?.value) || 35,
        rubberStamp: parseFloat(priceRubberStamp?.value) || 120
      },
      heroBanner: {
        active: Boolean(bannerActive?.checked),
        tag: {
          bn: bannerTagBn?.value.trim() || '📢 জরুরী বিজ্ঞপ্তি',
          en: 'Important Notice'
        },
        message: {
          bn: bannerMsgBn?.value.trim() || '',
          en: bannerMsgEn?.value.trim() || ''
        },
        actionLabel: {
          bn: bannerActionLabel?.value.trim() || 'কাগজপত্র দেখুন',
          en: 'View Details'
        },
        actionUrl: bannerActionUrl?.value || '#documents'
      },
      contact: {
        phone: contactPhone?.value.trim() || '9734573323',
        whatsapp: contactWhatsapp?.value.trim() || '9734573323',
        email: contactEmail?.value.trim() || 'allinternetpuncha@gmail.com',
        hours: {
          bn: contactHoursBn?.value.trim() || 'সোম – রবি: সকাল ৮:০০ টা – রাত ৯:০০ টা',
          en: 'Monday – Sunday: 8:00 AM – 9:00 PM'
        },
        landmark: {
          bn: contactLandmarkBn?.value.trim() || 'কৃষি ফার্মের বিপরীতে, পুঞ্চা, পুরুলিয়া',
          en: 'Opposite Krishi Farm, Puncha, Purulia'
        }
      }
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("💾 সকল সাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
      } else {
        showToast(data.error || "সেটিংস সংরক্ষণ ব্যর্থ হয়েছে", true);
      }
    } catch (err) {
      showToast("সার্ভার সংযোগ ত্রুটি", true);
    }
  }

  if (btnSaveAllSettingsTop) btnSaveAllSettingsTop.addEventListener('click', saveAllSettings);
  if (topbarSaveBtn) topbarSaveBtn.addEventListener('click', saveAllSettings);

  // =========================================================================
  // 5. Utility & Filter Functions
  // =========================================================================

  function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  // Filter tab clicks
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-status');
      renderOrders();
    });
  });

  // Sound toggle button
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundToggleText) {
        soundToggleText.textContent = soundEnabled ? I18N[currentLang].soundOn : I18N[currentLang].soundOff;
      }
      if (soundToggleIcon) {
        soundToggleIcon.textContent = soundEnabled ? '🔊' : '🔇';
      }
      if (soundEnabled) playChime();
    });
  }

  // Language switch
  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('ali_counter_lang', lang);
    if (langToggleText) {
      langToggleText.textContent = lang === 'bn' ? 'EN' : 'বাং';
    }

    document.querySelectorAll('[data-ci18n]').forEach(el => {
      const key = el.getAttribute('data-ci18n');
      if (I18N[lang][key]) el.textContent = I18N[lang][key];
    });

    if (soundToggleText) {
      soundToggleText.textContent = soundEnabled ? I18N[lang].soundOn : I18N[lang].soundOff;
    }
    if (soundToggleIcon) {
      soundToggleIcon.textContent = soundEnabled ? '🔊' : '🔇';
    }

    // Update topbar title according to active tab
    if (tabSettingsView && tabSettingsView.classList.contains('active')) {
      if (topbarTitle) topbarTitle.textContent = I18N[lang].navSettings;
    } else {
      if (topbarTitle) topbarTitle.textContent = I18N[lang].navOrders;
    }

    renderOrders();
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      setLang(currentLang === 'bn' ? 'en' : 'bn');
    });
  }

  // Initialize
  setLang(currentLang);
  checkAuthStatus();
});
