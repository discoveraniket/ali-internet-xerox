// Faruk's Counter Workstation & Shop Control Center Logic
// Real-time SSE listener, operator auth PIN wall, settings manager, and compact sidebar navigation

document.addEventListener('DOMContentLoaded', () => {
  let ordersList = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let paymentFilter = 'all';
  let queueSort = 'fifo';
  let currentPreviewOrder = null;
  let currentWaOrder = null;
  let cancellingOrderId = null;

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

  // DOM Elements - Orders View & Queue Controls
  const ordersGrid = document.getElementById('ordersGrid');
  const filterTabs = document.querySelectorAll('.tab-btn');
  const queueSearchInput = document.getElementById('queueSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const paymentFilterSelect = document.getElementById('paymentFilterSelect');
  const queueSortSelect = document.getElementById('queueSortSelect');
  const btnOpenEodModal = document.getElementById('btnOpenEodModal');
  const metricCardRevenue = document.getElementById('metricCardRevenue');

  // Metrics elements
  const statPending = document.getElementById('statPending');
  const statInProgress = document.getElementById('statInProgress');
  const statReady = document.getElementById('statReady');
  const statToday = document.getElementById('statToday');
  const statRevenue = document.getElementById('statRevenue');
  const statSubUpi = document.getElementById('statSubUpi');
  const statSubCash = document.getElementById('statSubCash');
  const statSubDue = document.getElementById('statSubDue');

  // Badges
  const badgeAll = document.getElementById('badgeAll');
  const badgePending = document.getElementById('badgePending');
  const badgeInProgress = document.getElementById('badgeInProgress');
  const badgeReady = document.getElementById('badgeReady');
  const badgeCompleted = document.getElementById('badgeCompleted');
  const badgeCancelled = document.getElementById('badgeCancelled');

  // DOM Elements - Modals
  // 1. Document Preview Modal
  const docPreviewModal = document.getElementById('docPreviewModal');
  const previewModalToken = document.getElementById('previewModalToken');
  const previewModalCustomer = document.getElementById('previewModalCustomer');
  const previewModalSpecs = document.getElementById('previewModalSpecs');
  const btnModalDirectPrint = document.getElementById('btnModalDirectPrint');
  const btnModalDownloadFile = document.getElementById('btnModalDownloadFile');
  const btnClosePreviewModal = document.getElementById('btnClosePreviewModal');
  const docPdfIframe = document.getElementById('docPdfIframe');
  const docImgWrapper = document.getElementById('docImgWrapper');
  const docImgPreview = document.getElementById('docImgPreview');
  const docFallbackView = document.getElementById('docFallbackView');
  const docFallbackFileName = document.getElementById('docFallbackFileName');
  const docLoadingSpinner = document.getElementById('docLoadingSpinner');
  const modalBtnInProgress = document.getElementById('modalBtnInProgress');
  const modalBtnReady = document.getElementById('modalBtnReady');
  const modalBtnCompleted = document.getElementById('modalBtnCompleted');
  const modalBtnCancel = document.getElementById('modalBtnCancel');
  const modalBtnWhatsApp = document.getElementById('modalBtnWhatsApp');
  const silentPrintIframe = document.getElementById('silentPrintIframe');

  // 2. WhatsApp Modal
  const whatsappModal = document.getElementById('whatsappModal');
  const waModalTarget = document.getElementById('waModalTarget');
  const btnCloseWaModal = document.getElementById('btnCloseWaModal');
  const btnCancelWaModal = document.getElementById('btnCancelWaModal');
  const waPreviewReady = document.getElementById('waPreviewReady');
  const waPreviewInProgress = document.getElementById('waPreviewInProgress');
  const waPreviewUnclear = document.getElementById('waPreviewUnclear');
  const waPreviewDue = document.getElementById('waPreviewDue');
  const waCustomMessage = document.getElementById('waCustomMessage');
  const btnSendCustomWa = document.getElementById('btnSendCustomWa');
  const waTemplateCards = document.querySelectorAll('.wa-template-card');

  // 3. EOD Cash Summary Modal
  const eodSummaryModal = document.getElementById('eodSummaryModal');
  const eodDateSubtitle = document.getElementById('eodDateSubtitle');
  const btnCloseEodModal = document.getElementById('btnCloseEodModal');
  const btnCloseEodFooter = document.getElementById('btnCloseEodFooter');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const eodTotalOrders = document.getElementById('eodTotalOrders');
  const eodTotalRevenue = document.getElementById('eodTotalRevenue');
  const eodUpiCollected = document.getElementById('eodUpiCollected');
  const eodCashCollected = document.getElementById('eodCashCollected');
  const eodDueAmount = document.getElementById('eodDueAmount');
  const eodServiceBreakdown = document.getElementById('eodServiceBreakdown');

  // 4. Cancel Reason Modal
  const cancelReasonModal = document.getElementById('cancelReasonModal');
  const cancelModalOrderRef = document.getElementById('cancelModalOrderRef');
  const cancelReasonSelect = document.getElementById('cancelReasonSelect');
  const btnCloseCancelModal = document.getElementById('btnCloseCancelModal');
  const btnDismissCancelModal = document.getElementById('btnDismissCancelModal');
  const btnConfirmCancel = document.getElementById('btnConfirmCancel');

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
      tabInProgress: "In Progress",
      tabReady: "Ready for Pickup",
      tabCompleted: "Completed",
      tabCancelled: "Cancelled",
      navOrders: "Live Orders Queue",
      navSettings: "Site Settings",
      statPendingLbl: "Pending in Queue",
      statInProgressLbl: "In Progress",
      statReadyLbl: "Ready for Pickup",
      statTodayLbl: "Today's Total Orders",
      statRevenueLbl: "Today's Total Revenue",
      btnCashSummary: "Cash Summary & CSV",
      btnPrint: "🖨️ View & Print",
      btnMarkReady: "🟢 Mark Ready",
      btnMarkComplete: "✅ Handed Over",
      btnMarkInProgress: "⚙️ Start Printing",
      statusPending: "Pending",
      statusInProgress: "In Progress",
      statusReady: "Ready",
      statusCompleted: "Completed",
      statusCancelled: "Cancelled",
      payUpi: "Paid via UPI",
      payCash: "Cash Due at Counter",
      payCashPaid: "Cash Collected",
      emptyMsg: "No print orders match the current filter or search.",
      switchLang: "বাংলায় দেখুন",
      soundOn: "Sound: ON",
      soundOff: "Sound: OFF",
      themeLabel: "Theme",
      mainSiteLink: "Main Site",
      lockDesk: "Lock Desk",
      settingsTitle: "⚙️ Shop & Site Configuration",
      settingsSubtitle: "Configure service rates, urgent hero banner, color themes, and shop storefront photo.",
      btnSaveSettings: "Save All Settings",
      modalPrintBtn: "Print (1-Click)",
      modalDownloadBtn: "Download File"
    },
    bn: {
      brandTitleShort: "আলি ইন্টারনেট",
      brandSubShort: "কাউন্টার ডেস্ক • পুঞ্চা",
      loginTitle: "আলি ইন্টারনেট কাউন্টার সিকিউরিটি",
      loginSub: "কাউন্টার ডেস্ক ও সেটিংস পরিচালনার জন্য অপারেটর পিন (PIN) দিন",
      tabAll: "সকল অর্ডার",
      tabPending: "অপেক্ষমান",
      tabInProgress: "কাজ চলছে",
      tabReady: "প্রিন্ট রেডি",
      tabCompleted: "সম্পন্ন",
      tabCancelled: "বাতিল",
      navOrders: "লাইভ অর্ডার কিউ",
      navSettings: "সাইট সেটিংস",
      statPendingLbl: "অপেক্ষমান অর্ডার",
      statInProgressLbl: "কাজ চলছে",
      statReadyLbl: "ডেলিভারির জন্য রেডি",
      statTodayLbl: "আজকের মোট অর্ডার",
      statRevenueLbl: "আজকের মোট আয়",
      btnCashSummary: "ক্যাশ হিসাব ও CSV",
      btnPrint: "🖨️ ভিউ ও প্রিন্ট",
      btnMarkReady: "🟢 রেডি",
      btnMarkComplete: "✅ ডেলিভার্ড",
      btnMarkInProgress: "⚙️ কাজ শুরু",
      statusPending: "অপেক্ষমান",
      statusInProgress: "কাজ চলছে",
      statusReady: "প্রিন্ট রেডি",
      statusCompleted: "সম্পন্ন",
      statusCancelled: "বাতিল",
      payUpi: "ইউপিআই মাধ্যমে প্রদত্ত",
      payCash: "নগদ বাকি (কাউন্টারে)",
      payCashPaid: "নগদ ক্যাশ আদায়",
      emptyMsg: "বর্তমানে কোনো অর্ডার নেই বা সার্চের সাথে মেলেনি।",
      switchLang: "Switch to English",
      soundOn: "সাউন্ড: চালু",
      soundOff: "সাউন্ড: বন্ধ",
      themeLabel: "থিম",
      mainSiteLink: "মূল সাইট",
      lockDesk: "লক করুন (Lock)",
      settingsTitle: "⚙️ দোকান ও সাইট কনফিগারেশন",
      settingsSubtitle: "এখানে মূল্য তালিকা, হিরো ব্যানার, কালার থিম ও দোকানের ছবি পরিবর্তন করুন।",
      btnSaveSettings: "সেটিংস সেভ করুন",
      modalPrintBtn: "প্রিন্ট করুন (Print)",
      modalDownloadBtn: "ডাউনলোড"
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
        if (statPending) statPending.textContent = s.pendingCount ?? 0;
        if (statInProgress) statInProgress.textContent = s.inProgressCount ?? 0;
        if (statReady) statReady.textContent = s.readyCount ?? 0;
        if (statToday) statToday.textContent = s.todayCount ?? 0;
        if (statRevenue) statRevenue.textContent = `₹${s.todayRevenue ?? 0}`;
        if (statSubUpi) statSubUpi.textContent = `📱 UPI: ₹${s.todayUpi ?? 0}`;
        if (statSubCash) statSubCash.textContent = `💵 ক্যাশ: ₹${s.todayCash ?? 0}`;
        if (statSubDue) statSubDue.textContent = `⚠️ বাকি: ₹${s.todayDue ?? 0}`;
        if (navBadgePending) navBadgePending.textContent = s.pendingCount ?? 0;
      }
    } catch (e) {
      const pending = ordersList.filter(o => o.status === 'pending').length;
      const inProg = ordersList.filter(o => o.status === 'in_progress').length;
      const ready = ordersList.filter(o => o.status === 'ready').length;
      if (statPending) statPending.textContent = pending;
      if (statInProgress) statInProgress.textContent = inProg;
      if (statReady) statReady.textContent = ready;
      if (statToday) statToday.textContent = ordersList.length;
      if (navBadgePending) navBadgePending.textContent = pending;
    }
  }

  function getFilteredOrders() {
    return ordersList.filter(o => {
      // Status filter
      if (currentFilter !== 'all' && o.status !== currentFilter) return false;

      // Payment filter
      if (paymentFilter === 'paid_online') {
        if (o.paymentStatus !== 'paid_online' && o.paymentMethod !== 'upi') return false;
      } else if (paymentFilter === 'paid_cash') {
        if (o.paymentStatus !== 'paid_cash') return false;
      } else if (paymentFilter === 'pending_at_counter') {
        if (o.paymentStatus !== 'pending_at_counter' && o.paymentMethod === 'upi') return false;
      }

      // Search query filter (Token, Name, Phone)
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchToken = (o.token || '').toLowerCase().includes(q);
        const matchName = (o.customerName || '').toLowerCase().includes(q);
        const matchPhone = (o.customerPhone || '').replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
        if (!matchToken && !matchName && !matchPhone) return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return queueSort === 'fifo' ? timeA - timeB : timeB - timeA;
    });
  }

  function updateFilterBadges() {
    const cAll = ordersList.length;
    const cPending = ordersList.filter(o => o.status === 'pending').length;
    const cInProg = ordersList.filter(o => o.status === 'in_progress').length;
    const cReady = ordersList.filter(o => o.status === 'ready').length;
    const cCompleted = ordersList.filter(o => o.status === 'completed').length;
    const cCancelled = ordersList.filter(o => o.status === 'cancelled').length;

    if (badgeAll) badgeAll.textContent = cAll;
    if (badgePending) badgePending.textContent = cPending;
    if (badgeInProgress) badgeInProgress.textContent = cInProg;
    if (badgeReady) badgeReady.textContent = cReady;
    if (badgeCompleted) badgeCompleted.textContent = cCompleted;
    if (badgeCancelled) badgeCancelled.textContent = cCancelled;
    if (navBadgePending) navBadgePending.textContent = cPending;
  }

  function renderOrders() {
    if (!ordersGrid) return;
    ordersGrid.innerHTML = '';

    updateFilterBadges();
    const filtered = getFilteredOrders();

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
      const isInProgress = order.status === 'in_progress';
      const isReady = order.status === 'ready';
      const isCompleted = order.status === 'completed';
      const isCancelled = order.status === 'cancelled';

      const isPaidOnline = order.paymentStatus === 'paid_online' || order.paymentMethod === 'upi';
      const isPaidCash = order.paymentStatus === 'paid_cash';
      const isCashDue = !isPaidOnline && !isPaidCash;

      let paymentTagHtml = '';
      if (isPaidOnline) {
        paymentTagHtml = `<span class="payment-tag pay-upi">${I18N[currentLang].payUpi}</span>`;
      } else if (isPaidCash) {
        paymentTagHtml = `<span class="payment-tag pay-cash-paid">${I18N[currentLang].payCashPaid}</span>`;
      } else {
        paymentTagHtml = `
          <div style="display: flex; gap: 0.35rem; align-items: center;">
            <span class="payment-tag pay-cash">${I18N[currentLang].payCash}</span>
            <button type="button" class="btn-collect-cash" data-action="collect-cash" data-id="${order.id}" title="নগদ টাকা জমা নিন">
              💵 নগদ আদায়
            </button>
          </div>
        `;
      }

      let statusBadgeLabel = '';
      let statusIcon = '';
      if (isPending) { statusIcon = '⏳'; statusBadgeLabel = I18N[currentLang].statusPending; }
      else if (isInProgress) { statusIcon = '⚙️'; statusBadgeLabel = I18N[currentLang].statusInProgress; }
      else if (isReady) { statusIcon = '🟢'; statusBadgeLabel = I18N[currentLang].statusReady; }
      else if (isCompleted) { statusIcon = '✅'; statusBadgeLabel = I18N[currentLang].statusCompleted; }
      else if (isCancelled) { statusIcon = '❌'; statusBadgeLabel = I18N[currentLang].statusCancelled; }

      card.innerHTML = `
        <div class="order-card-header">
          <div>
            <div class="order-token">${order.token}</div>
            <div class="order-time">${timeAgo}</div>
          </div>
          <span class="order-status-badge badge-${order.status}">
            ${statusIcon} ${statusBadgeLabel}
          </span>
        </div>

        ${isCancelled && order.cancelReason ? `
          <div style="background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.25); border-radius: 6px; padding: 0.35rem 0.6rem; font-size: 0.73rem; color: #fb7185; margin-bottom: 0.65rem;">
            ⚠️ বাতিলের কারণ: <strong>${order.cancelReason}</strong>
          </div>
        ` : ''}

        <div class="order-customer-box">
          <div class="customer-info">
            <h4>${order.customerName || 'Anonymous Customer'}</h4>
            <p>📞 ${order.customerPhone || 'No Phone'}</p>
          </div>
          <div class="customer-actions">
            ${order.customerPhone ? `
              <a href="tel:${order.customerPhone}" class="c-icon-btn" title="Call Customer">📞</a>
              <button type="button" class="c-icon-btn btn-whatsapp" data-action="whatsapp" data-id="${order.id}" title="WhatsApp Multi-Template">💬</button>
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
            <span class="spec-val">${order.paperSize} • ${order.sides === 'double' ? 'উভয় পিঠ (Double Sided)' : 'এক পিঠ (Single Sided)'}</span>
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
          ${paymentTagHtml}
        </div>

        <div class="order-card-footer">
          ${order.fileUrl ? `
            <div class="order-file-action">
              <button type="button" class="btn-print-file" data-action="preview" data-id="${order.id}">
                <span>${I18N[currentLang].btnPrint}</span>
              </button>
            </div>
          ` : ''}

          <div class="order-actions-bar">
            ${isPending ? `
              <button type="button" class="btn-status-progress" data-action="in_progress" data-id="${order.id}">
                ${I18N[currentLang].btnMarkInProgress}
              </button>
              <button type="button" class="btn-status-ready" data-action="ready" data-id="${order.id}">
                ${I18N[currentLang].btnMarkReady}
              </button>
            ` : ''}

            ${isInProgress ? `
              <button type="button" class="btn-status-ready" data-action="ready" data-id="${order.id}">
                ${I18N[currentLang].btnMarkReady}
              </button>
              <button type="button" class="btn-status-complete" data-action="completed" data-id="${order.id}">
                ${I18N[currentLang].btnMarkComplete}
              </button>
            ` : ''}

            ${isReady ? `
              <button type="button" class="btn-status-complete" data-action="completed" data-id="${order.id}">
                ${I18N[currentLang].btnMarkComplete}
              </button>
              <button type="button" class="btn-card-restore" data-action="pending" data-id="${order.id}" title="পেন্ডিংয়ে ফেরত পাঠান">
                ↩️ ফেরত
              </button>
            ` : ''}

            ${isCompleted || isCancelled ? `
              <button type="button" class="btn-card-restore" data-action="ready" data-id="${order.id}">
                ↩️ ফেরত
              </button>
            ` : ''}

            ${order.customerPhone ? `
              <button type="button" class="btn-card-wa" data-action="whatsapp" data-id="${order.id}" title="WhatsApp message">
                💬
              </button>
            ` : ''}

            ${!isCancelled && !isCompleted ? `
              <button type="button" class="btn-card-cancel" data-action="cancel-dialog" data-id="${order.id}" title="অর্ডার বাতিল করুন">
                ✕
              </button>
            ` : ''}
          </div>
        </div>
      `;

      // Event listener bindings on the card
      const btnPreview = card.querySelector('[data-action="preview"]');
      if (btnPreview) {
        btnPreview.addEventListener('click', () => openDocumentPreview(order));
      }

      const btnProg = card.querySelector('[data-action="in_progress"]');
      if (btnProg) {
        btnProg.addEventListener('click', () => updateOrderStatus(order.id, 'in_progress'));
      }

      const btnReady = card.querySelector('[data-action="ready"]');
      if (btnReady) {
        btnReady.addEventListener('click', () => updateOrderStatus(order.id, 'ready'));
      }

      const btnComp = card.querySelector('[data-action="completed"]');
      if (btnComp) {
        btnComp.addEventListener('click', () => updateOrderStatus(order.id, 'completed'));
      }

      const btnRestorePending = card.querySelector('[data-action="pending"]');
      if (btnRestorePending) {
        btnRestorePending.addEventListener('click', () => updateOrderStatus(order.id, 'pending'));
      }

      const btnCancelDialog = card.querySelector('[data-action="cancel-dialog"]');
      if (btnCancelDialog) {
        btnCancelDialog.addEventListener('click', () => openCancelModal(order.id, order.token));
      }

      const btnCashCollect = card.querySelector('[data-action="collect-cash"]');
      if (btnCashCollect) {
        btnCashCollect.addEventListener('click', () => collectCashOrder(order.id));
      }

      const waBtns = card.querySelectorAll('[data-action="whatsapp"]');
      waBtns.forEach(b => {
        b.addEventListener('click', () => openWhatsAppModal(order));
      });

      ordersGrid.appendChild(card);
    });
  }

  // =========================================================================
  // Phase 2 Modal Handlers: Document Preview, WhatsApp, EOD Cash & Cancel
  // =========================================================================

  // 1. In-Modal Document Preview & 1-Click Print
  function openDocumentPreview(order) {
    if (!order) return;
    currentPreviewOrder = order;

    if (previewModalToken) previewModalToken.textContent = order.token;
    if (previewModalCustomer) previewModalCustomer.textContent = order.customerName || 'গ্রাহক নথি';
    if (previewModalSpecs) {
      const specs = [
        `${order.copies} Copies`,
        order.paperSize || 'A4',
        order.sides === 'double' ? 'উভয় পিঠ (2-Sided)' : 'এক পিঠ (1-Sided)',
        order.serviceName || order.serviceType || '',
        order.lamination ? '+ল্যামিনেশন' : '',
        order.spiralBinding ? '+বাইন্ডিং' : '',
        `বিল: ₹${order.totalAmount}`
      ].filter(Boolean);
      previewModalSpecs.innerHTML = specs.map(s => `<span class="spec-pill">${s}</span>`).join('');
    }

    if (btnModalDownloadFile) {
      btnModalDownloadFile.href = order.fileUrl || '#';
      btnModalDownloadFile.setAttribute('download', order.fileName || 'document.pdf');
    }

    // Reset status buttons state
    [modalBtnInProgress, modalBtnReady, modalBtnCompleted].forEach(b => {
      if (b) b.classList.remove('active');
    });
    if (order.status === 'in_progress' && modalBtnInProgress) modalBtnInProgress.classList.add('active');
    if (order.status === 'ready' && modalBtnReady) modalBtnReady.classList.add('active');
    if (order.status === 'completed' && modalBtnCompleted) modalBtnCompleted.classList.add('active');

    // Document renderer
    if (docLoadingSpinner) docLoadingSpinner.style.display = 'flex';
    if (docPdfIframe) { docPdfIframe.style.display = 'none'; docPdfIframe.src = ''; }
    if (docImgWrapper) { docImgWrapper.style.display = 'none'; }
    if (docFallbackView) { docFallbackView.style.display = 'none'; }

    const fileUrl = order.fileUrl;
    if (!fileUrl) {
      if (docLoadingSpinner) docLoadingSpinner.style.display = 'none';
      if (docFallbackView) {
        docFallbackView.style.display = 'block';
        if (docFallbackFileName) docFallbackFileName.textContent = 'কোনো ফাইল সংযুক্ত নেই';
      }
    } else {
      const ext = (fileUrl.split('.').pop() || '').toLowerCase();
      if (ext === 'pdf') {
        docPdfIframe.src = fileUrl;
        docPdfIframe.onload = () => {
          if (docLoadingSpinner) docLoadingSpinner.style.display = 'none';
          docPdfIframe.style.display = 'block';
        };
      } else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) {
        docImgPreview.src = fileUrl;
        docImgPreview.onload = () => {
          if (docLoadingSpinner) docLoadingSpinner.style.display = 'none';
          docImgWrapper.style.display = 'flex';
        };
      } else {
        if (docLoadingSpinner) docLoadingSpinner.style.display = 'none';
        if (docFallbackView) {
          docFallbackView.style.display = 'block';
          if (docFallbackFileName) docFallbackFileName.textContent = order.fileName || `file.${ext}`;
        }
      }
    }

    if (docPreviewModal) docPreviewModal.style.display = 'flex';
  }

  function closeDocumentPreview() {
    if (docPreviewModal) docPreviewModal.style.display = 'none';
    if (docPdfIframe) docPdfIframe.src = '';
    currentPreviewOrder = null;
  }

  function handleDirectPrint() {
    if (!currentPreviewOrder || !currentPreviewOrder.fileUrl) {
      showToast('প্রিন্ট করার মতো ফাইল পাওয়া যায়নি', true);
      return;
    }
    const ext = (currentPreviewOrder.fileUrl.split('.').pop() || '').toLowerCase();

    if (ext === 'pdf') {
      if (docPdfIframe && docPdfIframe.contentWindow) {
        try {
          docPdfIframe.contentWindow.focus();
          docPdfIframe.contentWindow.print();
          showToast('🖨️ প্রিন্ট ডায়ালগ ওপেন হয়েছে');
          return;
        } catch (e) {}
      }
      if (silentPrintIframe) {
        silentPrintIframe.src = currentPreviewOrder.fileUrl;
        silentPrintIframe.onload = () => {
          try {
            silentPrintIframe.contentWindow.focus();
            silentPrintIframe.contentWindow.print();
          } catch (e) {
            window.open(currentPreviewOrder.fileUrl, '_blank');
          }
        };
      }
    } else {
      // Print image popup
      const printWin = window.open('', '_blank', 'width=800,height=600');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Print ${currentPreviewOrder.token}</title>
            <style>
              @page { margin: 10mm; size: auto; }
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
              img { max-width: 100%; max-height: 98vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${currentPreviewOrder.fileUrl}" onload="window.print(); setTimeout(() => window.close(), 500);" />
          </body>
          </html>
        `);
        printWin.document.close();
      } else {
        window.open(currentPreviewOrder.fileUrl, '_blank');
      }
    }
  }

  // 2. WhatsApp Multi-Template Presets Sender
  function openWhatsAppModal(order) {
    if (!order) return;
    currentWaOrder = order;

    if (waModalTarget) {
      waModalTarget.textContent = `গ্রাহক: ${order.customerName || 'গ্রাহক'} (${order.customerPhone || 'মোবাইল নেই'})`;
    }

    const token = order.token;
    const name = order.customerName || 'গ্রাহক';
    const amount = order.totalAmount || 0;

    const templates = {
      ready: `নমস্কার ${name}! আলি ইন্টারনেট ও জেরক্স (পুঞ্চা) থেকে ফারুক বলছি। আপনার প্রিন্ট/জেরক্স অর্ডার (${token}) রেডি হয়ে গেছে। দোকানে এসে নিয়ে যান। মোট দেয়: ₹${amount}`,
      in_progress: `নমস্কার ${name}, আলি ইন্টারনেট থেকে জানানো হচ্ছে আপনার অর্ডার (${token})-এর প্রিন্ট কাজ শুরু হয়েছে। কিছুক্ষণের মধ্যে রেডি হয়ে যাবে।`,
      unclear_file: `নমস্কার ${name}, আলি ইন্টারনেট থেকে বলছি। আপনার পাঠানো ফাইলটি (${token}) অস্পষ্ট বা খোলা যাচ্ছে না। দয়া করে পরিষ্কার ফাইল বা ফটো হোয়াটসঅ্যাপে আবার পাঠান।`,
      cash_due: `নমস্কার ${name}, আলি ইন্টারনেট থেকে আপনার অর্ডার (${token})-এর জন্য ₹${amount} পেমেন্ট বাকি আছে। দোকানে এসে ক্যাশ দিতে পারেন বা ইউপিআই করতে পারেন।`
    };

    if (waPreviewReady) waPreviewReady.textContent = templates.ready;
    if (waPreviewInProgress) waPreviewInProgress.textContent = templates.in_progress;
    if (waPreviewUnclear) waPreviewUnclear.textContent = templates.unclear_file;
    if (waPreviewDue) waPreviewDue.textContent = templates.cash_due;

    // Default template based on order status
    let defaultKey = 'ready';
    if (order.status === 'in_progress') defaultKey = 'in_progress';
    else if (!order.fileUrl) defaultKey = 'unclear_file';
    else if (order.paymentStatus === 'pending_at_counter') defaultKey = 'cash_due';

    if (waCustomMessage) waCustomMessage.value = templates[defaultKey];

    waTemplateCards.forEach(card => {
      const key = card.getAttribute('data-template');
      if (key === defaultKey) card.classList.add('active');
      else card.classList.remove('active');

      card.onclick = () => {
        waTemplateCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        if (waCustomMessage) waCustomMessage.value = templates[key];
      };
    });

    if (whatsappModal) whatsappModal.style.display = 'flex';
  }

  function closeWhatsAppModal() {
    if (whatsappModal) whatsappModal.style.display = 'none';
    currentWaOrder = null;
  }

  function sendCustomWhatsApp() {
    if (!currentWaOrder || !currentWaOrder.customerPhone) {
      showToast('গ্রাহকের মোবাইল নম্বর নেই', true);
      return;
    }
    const phone = currentWaOrder.customerPhone.replace(/[^0-9]/g, '');
    const cleanPhone = phone.length === 10 ? '91' + phone : phone;
    const msg = waCustomMessage ? waCustomMessage.value.trim() : '';
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    closeWhatsAppModal();
  }

  // 3. Cash Drawer & End-of-Day Reconciliation + CSV Export
  function openEodSummaryModal() {
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = ordersList.filter(o => o.createdAt && o.createdAt.slice(0, 10) === today);

    const totalOrders = todayOrders.length;
    const totalRev = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const upiCollected = todayOrders.filter(o => o.paymentStatus === 'paid_online' || o.paymentMethod === 'upi').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const cashCollected = todayOrders.filter(o => o.paymentStatus === 'paid_cash').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const dueAmount = todayOrders.filter(o => o.paymentStatus === 'pending_at_counter').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    if (eodDateSubtitle) eodDateSubtitle.textContent = `তারিখ: ${new Date().toLocaleDateString('bn-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    if (eodTotalOrders) eodTotalOrders.textContent = totalOrders;
    if (eodTotalRevenue) eodTotalRevenue.textContent = `₹${totalRev}`;
    if (eodUpiCollected) eodUpiCollected.textContent = `₹${upiCollected}`;
    if (eodCashCollected) eodCashCollected.textContent = `₹${cashCollected}`;
    if (eodDueAmount) eodDueAmount.textContent = `₹${dueAmount}`;

    // Service breakdown
    if (eodServiceBreakdown) {
      const breakdown = {};
      todayOrders.forEach(o => {
        const name = o.serviceName || o.serviceType || 'General Service';
        if (!breakdown[name]) breakdown[name] = { count: 0, amount: 0 };
        breakdown[name].count += 1;
        breakdown[name].amount += (o.totalAmount || 0);
      });

      const keys = Object.keys(breakdown);
      if (keys.length === 0) {
        eodServiceBreakdown.innerHTML = `<p class="field-sub" style="text-align: center; padding: 1rem;">আজকে এখনও কোনো সম্পন্ন কাজ নেই।</p>`;
      } else {
        eodServiceBreakdown.innerHTML = keys.map(k => `
          <div class="service-breakdown-item">
            <span class="s-name">${k}</span>
            <div class="s-meta">
              <span>${breakdown[k].count} টি কাজ</span>
              <span class="s-amount">₹${breakdown[k].amount}</span>
            </div>
          </div>
        `).join('');
      }
    }

    if (eodSummaryModal) eodSummaryModal.style.display = 'flex';
  }

  function closeEodSummaryModal() {
    if (eodSummaryModal) eodSummaryModal.style.display = 'none';
  }

  function exportOrdersToCsv() {
    const today = new Date().toISOString().slice(0, 10);
    const headers = ['Token', 'Date & Time', 'Customer Name', 'Phone', 'Service', 'Copies', 'Paper Size', 'Sides', 'Lamination', 'Spiral Binding', 'Total (INR)', 'Payment Method', 'Payment Status', 'Status', 'Cancel Reason'];

    const rows = ordersList.map(o => [
      o.token,
      o.createdAt ? new Date(o.createdAt).toLocaleString() : '',
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      o.customerPhone || '',
      `"${(o.serviceName || o.serviceType || '').replace(/"/g, '""')}"`,
      o.copies || 1,
      o.paperSize || 'A4',
      o.sides || 'single',
      o.lamination ? 'Yes' : 'No',
      o.spiralBinding ? 'Yes' : 'No',
      o.totalAmount || 0,
      o.paymentMethod || '',
      o.paymentStatus || '',
      o.status || '',
      `"${(o.cancelReason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ali_Internet_Orders_${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("📥 CSV রিপোর্ট ডাউনলোড শুরু হয়েছে");
  }

  // 4. Cancel Reason Modal
  function openCancelModal(orderId, orderToken) {
    cancellingOrderId = orderId;
    if (cancelModalOrderRef) cancelModalOrderRef.textContent = `টোকেন: ${orderToken}`;
    if (cancelReasonModal) cancelReasonModal.style.display = 'flex';
  }

  function closeCancelModal() {
    if (cancelReasonModal) cancelReasonModal.style.display = 'none';
    cancellingOrderId = null;
  }

  function confirmCancelOrder() {
    if (!cancellingOrderId) return;
    const reason = cancelReasonSelect ? cancelReasonSelect.value : 'বাতিল করা হয়েছে';
    updateOrderStatus(cancellingOrderId, 'cancelled', reason);
    closeCancelModal();
    if (currentPreviewOrder && currentPreviewOrder.id === cancellingOrderId) {
      closeDocumentPreview();
    }
  }

  // 1-Click Collect Cash
  async function collectCashOrder(id) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid_cash' })
      });
      if (res.ok) {
        const idx = ordersList.findIndex(o => o.id === id);
        if (idx !== -1) {
          ordersList[idx].paymentStatus = 'paid_cash';
          renderOrders();
          updateStats();
        }
        showToast("💵 নগদ ক্যাশ আদায় সম্পন্ন ও নথিভুক্ত হয়েছে!");
      }
    } catch (e) {
      showToast("ক্যাশ স্ট্যাটাস সংরক্ষণে ত্রুটি", true);
    }
  }

  async function updateOrderStatus(id, newStatus, reason = null) {
    try {
      const bodyPayload = { status: newStatus };
      if (reason) bodyPayload.cancelReason = reason;

      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      if (res.ok) {
        const idx = ordersList.findIndex(o => o.id === id);
        if (idx !== -1) {
          ordersList[idx].status = newStatus;
          if (reason) ordersList[idx].cancelReason = reason;
          renderOrders();
          updateStats();

          // If current order is open in preview modal, update it
          if (currentPreviewOrder && currentPreviewOrder.id === id) {
            currentPreviewOrder.status = newStatus;
            openDocumentPreview(currentPreviewOrder);
          }
        }
        showToast(`✅ অর্ডার স্ট্যাটাস আপডেট: ${newStatus}`);
      }
    } catch (e) {
      console.error("Failed to update status", e);
      showToast("স্ট্যাটাস আপডেট ব্যর্থ", true);
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

  // Search input & clear button
  if (queueSearchInput) {
    queueSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      }
      renderOrders();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (queueSearchInput) queueSearchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      renderOrders();
    });
  }

  // Payment filter select
  if (paymentFilterSelect) {
    paymentFilterSelect.addEventListener('change', (e) => {
      paymentFilter = e.target.value;
      renderOrders();
    });
  }

  // Queue sort select (FIFO / LIFO)
  if (queueSortSelect) {
    queueSortSelect.addEventListener('change', (e) => {
      queueSort = e.target.value;
      renderOrders();
    });
  }

  // EOD Cash Summary Modal listeners
  if (btnOpenEodModal) btnOpenEodModal.addEventListener('click', openEodSummaryModal);
  if (metricCardRevenue) metricCardRevenue.addEventListener('click', openEodSummaryModal);
  if (btnCloseEodModal) btnCloseEodModal.addEventListener('click', closeEodSummaryModal);
  if (btnCloseEodFooter) btnCloseEodFooter.addEventListener('click', closeEodSummaryModal);
  if (btnExportCsv) btnExportCsv.addEventListener('click', exportOrdersToCsv);

  // Document Preview Modal listeners
  if (btnClosePreviewModal) btnClosePreviewModal.addEventListener('click', closeDocumentPreview);
  const btnMobileClosePreviewModal = document.getElementById('btnMobileClosePreviewModal');
  if (btnMobileClosePreviewModal) btnMobileClosePreviewModal.addEventListener('click', closeDocumentPreview);
  if (btnModalDirectPrint) btnModalDirectPrint.addEventListener('click', handleDirectPrint);
  if (modalBtnInProgress) modalBtnInProgress.addEventListener('click', () => {
    if (currentPreviewOrder) updateOrderStatus(currentPreviewOrder.id, 'in_progress');
  });
  if (modalBtnReady) modalBtnReady.addEventListener('click', () => {
    if (currentPreviewOrder) updateOrderStatus(currentPreviewOrder.id, 'ready');
  });
  if (modalBtnCompleted) modalBtnCompleted.addEventListener('click', () => {
    if (currentPreviewOrder) updateOrderStatus(currentPreviewOrder.id, 'completed');
  });
  if (modalBtnCancel) modalBtnCancel.addEventListener('click', () => {
    if (currentPreviewOrder) openCancelModal(currentPreviewOrder.id, currentPreviewOrder.token);
  });
  if (modalBtnWhatsApp) modalBtnWhatsApp.addEventListener('click', () => {
    if (currentPreviewOrder) openWhatsAppModal(currentPreviewOrder);
  });

  // WhatsApp Modal listeners
  if (btnCloseWaModal) btnCloseWaModal.addEventListener('click', closeWhatsAppModal);
  if (btnCancelWaModal) btnCancelWaModal.addEventListener('click', closeWhatsAppModal);
  if (btnSendCustomWa) btnSendCustomWa.addEventListener('click', sendCustomWhatsApp);

  // Cancel Reason Modal listeners
  if (btnCloseCancelModal) btnCloseCancelModal.addEventListener('click', closeCancelModal);
  if (btnDismissCancelModal) btnDismissCancelModal.addEventListener('click', closeCancelModal);
  if (btnConfirmCancel) btnConfirmCancel.addEventListener('click', confirmCancelOrder);

  // Close modals on Escape key & backdrop click
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDocumentPreview();
      closeWhatsAppModal();
      closeEodSummaryModal();
      closeCancelModal();
    }
  });

  [docPreviewModal, whatsappModal, eodSummaryModal, cancelReasonModal].forEach(modalEl => {
    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          modalEl.style.display = 'none';
        }
      });
    }
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
