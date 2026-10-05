// Faruk's Counter Workstation Logic
// Real-time SSE listener, audio alerts, order status management, and stats

document.addEventListener('DOMContentLoaded', () => {
  let ordersList = [];
  let currentFilter = 'all';
  let soundEnabled = true;
  let currentLang = localStorage.getItem('ali_counter_lang') || 'bn';

  // Elements
  const ordersGrid = document.getElementById('ordersGrid');
  const filterTabs = document.querySelectorAll('.tab-btn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const langToggleBtn = document.getElementById('langToggleBtn');
  const liveStatusPill = document.getElementById('liveStatusPill');

  // Metrics elements
  const statPending = document.getElementById('statPending');
  const statReady = document.getElementById('statReady');
  const statToday = document.getElementById('statToday');
  const statRevenue = document.getElementById('statRevenue');

  const I18N = {
    en: {
      brandTitle: "Ali Internet & Xerox — Counter Workstation",
      brandSub: "Puncha (Opposite Krishi Farm) • Sekh Faruk Ali",
      tabAll: "All Orders",
      tabPending: "Pending",
      tabReady: "Ready for Pickup",
      tabCompleted: "Completed",
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
      soundOn: "🔊 Alert Sound: ON",
      soundOff: "🔇 Alert Sound: OFF"
    },
    bn: {
      brandTitle: "আলি ইন্টারনেট এন্ড জেরক্স — কাউন্টার ডেস্ক",
      brandSub: "পুঞ্চা (কৃষি ফার্মের বিপরীতে) • সেখ ফারুক আলি",
      tabAll: "সকল অর্ডার",
      tabPending: "অপেক্ষমান",
      tabReady: "প্রিন্ট রেডি",
      tabCompleted: "সম্পন্ন",
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
      soundOn: "🔊 সতর্কবার্তা: চালু",
      soundOff: "🔇 সতর্কবার্তা: বন্ধ"
    }
  };

  // Synthesized Web Audio Chime (Zero external mp3 needed)
  function playChime() {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      // Dual tone pleasant chime
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

  // 1. Fetch Orders from Backend
  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        ordersList = data.orders || [];
        renderOrders();
        updateStats();
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    }
  }

  // 2. Fetch Stats
  async function updateStats() {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        const s = data.stats;
        statPending.textContent = s.pendingCount;
        statReady.textContent = s.readyCount;
        statToday.textContent = s.todayCount;
        statRevenue.textContent = `₹${s.todayRevenue}`;
      }
    } catch (e) {
      // calculate from local list
      const pending = ordersList.filter(o => o.status === 'pending').length;
      const ready = ordersList.filter(o => o.status === 'ready').length;
      statPending.textContent = pending;
      statReady.textContent = ready;
      statToday.textContent = ordersList.length;
    }
  }

  // 3. Render Orders
  function renderOrders() {
    if (!ordersGrid) return;
    ordersGrid.innerHTML = '';

    const filtered = ordersList.filter(o => {
      if (currentFilter === 'all') return true;
      return o.status === currentFilter;
    });

    // Update Tab Badges
    const countPending = ordersList.filter(o => o.status === 'pending').length;
    const countReady = ordersList.filter(o => o.status === 'ready').length;
    const badgePending = document.getElementById('badgePending');
    const badgeReady = document.getElementById('badgeReady');
    const badgeAll = document.getElementById('badgeAll');
    if (badgePending) badgePending.textContent = countPending;
    if (badgeReady) badgeReady.textContent = countReady;
    if (badgeAll) badgeAll.textContent = ordersList.length;

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

      // WhatsApp notify message for customer
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

      // Event listeners for action buttons
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

  // 4. Update Status API Call
  async function updateOrderStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // update local list
        const idx = ordersList.findIndex(o => o.id === id);
        if (idx !== -1) {
          ordersList[idx].status = newStatus;
          renderOrders();
          updateStats();
        }
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  }

  // 5. Connect Realtime Server-Sent Events (SSE)
  function connectSSE() {
    const evtSource = new EventSource('/api/orders/stream');

    evtSource.addEventListener('connected', () => {
      if (liveStatusPill) {
        liveStatusPill.innerHTML = '<span class="live-dot"></span> <span>Live Connected</span>';
      }
    });

    evtSource.addEventListener('new_order', (e) => {
      try {
        const order = JSON.parse(e.data);
        ordersList.unshift(order);
        renderOrders();
        updateStats();
        playChime();
      } catch (err) {}
    });

    evtSource.addEventListener('order_updated', (e) => {
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

    evtSource.onerror = () => {
      if (liveStatusPill) {
        liveStatusPill.innerHTML = '<span style="color:#f43f5e">●</span> <span>Reconnecting...</span>';
      }
    };
  }

  // Helper: format time ago
  function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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
      soundToggleBtn.textContent = soundEnabled ? I18N[currentLang].soundOn : I18N[currentLang].soundOff;
      if (soundEnabled) playChime();
    });
  }

  // Language switch
  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('ali_counter_lang', lang);
    // Icon-only button: show the language you'd switch TO, keep full text for a11y
    langToggleBtn.textContent = lang === 'bn' ? 'EN' : 'বাং';
    langToggleBtn.setAttribute('aria-label', I18N[lang].switchLang);
    langToggleBtn.title = I18N[lang].switchLang;

    document.querySelectorAll('[data-ci18n]').forEach(el => {
      const key = el.getAttribute('data-ci18n');
      if (I18N[lang][key]) el.textContent = I18N[lang][key];
    });

    if (soundToggleBtn) {
      soundToggleBtn.textContent = soundEnabled ? I18N[lang].soundOn : I18N[lang].soundOff;
    }

    renderOrders();
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      setLang(currentLang === 'bn' ? 'en' : 'bn');
    });
  }

  // Init
  fetchOrders();
  connectSSE();
  setLang(currentLang);
  setInterval(fetchOrders, 10000); // Polling backup every 10s
});
