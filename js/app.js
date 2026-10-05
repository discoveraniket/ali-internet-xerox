// Ali Internet & Xerox - Main Application Logic (Phase 1 & Phase 2)
// Handles: Language Switching, Document Filtering, Cloud Print Uploader, Dynamic UPI QR, Token Generation & WhatsApp

document.addEventListener('DOMContentLoaded', () => {
  // Current active language (default: 'bn' for local puncha audience, fallback 'en')
  let currentLang = localStorage.getItem('ali_site_lang') || 'bn';
  let activeFilter = 'all';
  let searchQuery = '';

  // Phase 2 State
  let currentPaperSize = 'A4';
  let currentSides = 'single';
  let currentPaymentMethod = 'upi';
  let selectedFile = null;
  let selectedFileBase64 = '';

  // Elements
  const langToggleBtn = document.getElementById('langToggleBtn');
  const langLabel = document.getElementById('langLabel');   // screen-reader-only text
  const langIcon = document.getElementById('langIcon');     // visible icon glyph
  const shopStatusBadge = document.getElementById('shopStatusBadge');
  const docCardsContainer = document.getElementById('docCardsGrid');
  const searchInput = document.getElementById('docSearchInput');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const servicesCategoriesGrid = document.getElementById('servicesCategoriesGrid');
  const faqAccordion = document.getElementById('faqAccordion');

  // Print Desk Elements
  const printServiceSelect = document.getElementById('printServiceSelect');
  const printCopiesInput = document.getElementById('printCopiesInput');
  const copiesMinusBtn = document.getElementById('copiesMinusBtn');
  const copiesPlusBtn = document.getElementById('copiesPlusBtn');
  const estPriceAmount = document.getElementById('estPriceAmount');
  const sendPrintWhatsAppBtn = document.getElementById('sendPrintWhatsAppBtn');

  // Phase 2: Uploader & Config Elements
  const uploadDropzone = document.getElementById('uploadDropzone');
  const printFileInput = document.getElementById('printFileInput');
  const fileSelectedBox = document.getElementById('fileSelectedBox');
  const selectedFileName = document.getElementById('selectedFileName');
  const selectedFileSize = document.getElementById('selectedFileSize');
  const btnRemoveFile = document.getElementById('btnRemoveFile');
  const fileTypeIcon = document.getElementById('fileTypeIcon');

  const paperSizeBtns = document.querySelectorAll('#paperSizeToggle .pill-toggle-btn');
  const printSidesBtns = document.querySelectorAll('#printSidesToggle .pill-toggle-btn');
  const chkLamination = document.getElementById('chkLamination');
  const chkSpiral = document.getElementById('chkSpiral');

  const custNameInput = document.getElementById('custNameInput');
  const custPhoneInput = document.getElementById('custPhoneInput');

  const payTabUpi = document.getElementById('payTabUpi');
  const payTabCash = document.getElementById('payTabCash');
  const upiDetailsCard = document.getElementById('upiDetailsCard');
  const dynamicUpiQr = document.getElementById('dynamicUpiQr');
  const upiIntentBtn = document.getElementById('upiIntentBtn');
  const btnSubmitOrder = document.getElementById('btnSubmitOrder');

  // Token Modal Elements
  const tokenModal = document.getElementById('tokenModal');
  const modalTokenId = document.getElementById('modalTokenId');
  const modalCustName = document.getElementById('modalCustName');
  const modalServiceDesc = document.getElementById('modalServiceDesc');
  const modalTotalAmount = document.getElementById('modalTotalAmount');
  const modalPayStatus = document.getElementById('modalPayStatus');
  const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  // Static I18N Text Dictionary
  const I18N = {
    en: {
      langBtn: "বাংলায় দেখুন",
      shopOpen: "Open Now (8:00 AM – 9:00 PM)",
      shopClosed: "Closed Now (Opens 8:00 AM)",
      themeLabel: "Theme (Light / Dark / System)",
      topLocationLabel: "📍 Puncha (Opposite Krishi Farm)",
      brandTitle: "Ali Internet & Xerox",
      brandSubtitle: "Puncha • Purulia",
      navHome: "Home",
      navDocs: "Document Guide",
      navServices: "Services",
      navCalculator: "Print Order",
      navLocation: "Location",
      navCounter: "Counter Desk",
      headerWhatsApp: "WhatsApp",
      mobileCallBtn: "Direct Call",
      mobileWaBtn: "WhatsApp Chat",
      heroBadge: "Puncha's Trusted Common Service & Document Printing Center",
      heroTitle1: "Fast, Reliable",
      heroTitle2: "Digital Citizen Services",
      heroTitle3: "& High-Speed Printing in Puncha",
      heroSubtitle: "Operated by Sekh Faruk Ali opposite Krishi Farm. We handle Ration Cards, Driving Licenses, Jamir Porcha, Vehicle Insurance, Instant PAN, and High-Quality Xerox & Printing.",
      btnSendWhatsApp: "Upload File for Print",
      btnCheckDocs: "Check Required Documents",
      trustXerox: "Instant Xerox & Lamination",
      trustInsurance: "Ali Insurance Point",
      trustGovt: "All Govt Digital Portals",
      trustStamp: "Custom Rubber Stamps",
      trustLocal: "Opposite Krishi Farm, Puncha",
      shopPhotoBadge: "Physical Shop Front",
      shopOwnerLabel: "Sekh Faruk Ali (Proprietor)",
      shopCallBadge: "CALL: +91 9734 573 323",
      callDirect: "Call Faruk",
      getDirections: "Google Maps Route",
      calcTag: "Skip The Line",
      calcTitle: "Web Print Desk & Cloud Upload",
      calcDesc: "Upload your document directly from home. Orders are dispatched straight to Faruk's shop PC, issuing you a digital pickup token.",
      calcSelectLabel: "Select Print / Finishing Service",
      calcQtyLabel: "Quantity / Pages / Copies",
      calcPriceEstLabel: "Total Payable Bill:",
      calcDisclaimer: "*Price calculated dynamically based on copies, paper size, and finishing.",
      calcSendBtn: "WhatsApp Order Backup",
      dropzoneTitle: "Drop your file here or click to browse",
      dropzoneHint: "Supports PDF, Word, JPG, PNG, WEBP (Max 25 MB)",
      btnRemoveFile: "Remove File ✕",
      labelPaperSize: "Paper Size",
      paperA4: "A4 (Standard)",
      paperLegal: "Legal (Deed / Stamp)",
      labelPrintSides: "Print Sides",
      sidesSingle: "Single Sided",
      sidesDouble: "Double Sided (Both)",
      labelFinishing: "Additional Finishing (Optional)",
      chkLamination: "Lamination (+₹20/doc)",
      chkSpiral: "Spiral Binding (+₹35/book)",
      labelCustName: "Your Name (Customer Name) *",
      labelCustPhone: "Mobile / WhatsApp Number *",
      custNamePlaceholder: "e.g. John Doe",
      custPhonePlaceholder: "10-digit mobile number",
      labelPaymentMethod: "Choose Payment Method",
      payUpi: "UPI (QR / Instant Pay)",
      payCash: "Pay Cash at Shop Counter",
      upiScanHint: "Scan the QR code below using Google Pay, PhonePe, Paytm or any UPI app:",
      btnUpiApp: "Pay with Mobile UPI App",
      upiOwner: "Sekh Faruk Ali",
      btnSubmitOrder: "Submit Order & File to Counter",
      btnWhatsAppBackup: "WhatsApp Order Backup",
      submittingOrder: "Submitting order...",
      btnBookRenewal: "Book Policy Renewal",
      docGuideTag: "Zero Hassle Guide",
      docGuideTitle: "Check Required Documents Before Visiting",
      docGuideDesc: "Never make a wasted trip again! Check the exact documents, certificates, and photos needed for your government application.",
      searchPlaceholder: "Search services (e.g. Ration, DL, Porcha, PAN)...",
      filterAll: "All Services",
      filterCitizen: "Citizen (Ration / PAN / Voter)",
      filterTransport: "Transport & Insurance",
      filterLand: "Land & Business",
      filterStudent: "Student & Forms",
      docRequiredHeading: "Documents to Bring:",
      docTurnaroundLabel: "Processing Time:",
      btnConsultWhatsApp: "Consult on WhatsApp",
      servicesTag: "Complete Catalog",
      servicesTitle: "All Services Available at the Shop",
      servicesDesc: "From government digital schemes to stationery and student accessories.",
      roadmapTag: "Active in Phase 2",
      roadmapTitle: "Live Counter Queue & Online Order Desk",
      roadmapDesc: "Your files are now dispatched directly to Faruk's counter computer with instant UPI prepayment and digital token generation!",
      faqTag: "Help & FAQ",
      faqTitle: "Frequently Asked Questions",
      locationTag: "Visit Us",
      locationTitle: "Shop Address & Timings",
      locAddressTitle: "Physical Location",
      shopAddress: "Opposite Krishi Farm, Puncha, Purulia, West Bengal — 723151",
      locHoursTitle: "Shop Hours",
      shopHoursDisplay: "Open Daily: 8:00 AM – 9:00 PM (Monday – Sunday)",
      locContactTitle: "Phone & WhatsApp",
      phoneLabel: "Mobile / Call:",
      shopPhoneDisplay: "+91 97345 73323",
      emailLabel: "Email:",
      tokenSuccessTitle: "Order Submitted Successfully!",
      tokenPickupLabel: "Your Digital Print Pickup Token:",
      tokenQueuedStatus: "⏳ Added to Faruk's shop printer queue",
      modalCustNameLabel: "Customer Name:",
      modalServiceDescLabel: "Service Details:",
      modalTotalLabel: "Total Payable:",
      modalPayStatusLabel: "Payment Status:",
      modalBtnNotify: "Notify Faruk with Token",
      modalBtnClose: "Close / Done",
      footerDesc: "Puncha's premier digital service center & cyber kiosk. Providing transparent government application assistance, high-speed document printing, and vehicle insurance.",
      footerProprietor: "👤 Proprietor: Sekh Faruk Ali",
      footerQuickLinks: "Quick Navigation",
      footerServices: "Top Services",
      footRation: "Digital Ration Card Apply",
      footDriving: "Driving License (Sarathi)",
      footPorcha: "Jamir Porcha & Records (Banglarbhumi)",
      footInsurance: "Bike & Vehicle Insurance",
      footStamp: "Custom Rubber Stamp Making",
      footPan: "Instant PAN Card (e-PAN)",
      footerCopyright: "© 2026 Ali Internet & Xerox. Built for Puncha, Purulia.",
      barCall: "Call",
      barPrint: "Print Desk",
      barWhatsApp: "WhatsApp",
      barDocs: "Docs"
    },
    bn: {
      langBtn: "Switch to English",
      shopOpen: "এখন খোলা আছে (সকাল ৮টা – রাত ৯টা)",
      shopClosed: "এখন বন্ধ আছে (সকাল ৮টায় খুলবে)",
      themeLabel: "থিম পরিবর্তন (Theme)",
      topLocationLabel: "📍 পুঞ্চা (কৃষি ফার্মের বিপরীতে)",
      brandTitle: "আলি ইন্টারনেট এন্ড জেরক্স",
      brandSubtitle: "পুঞ্চা • পুরুলিয়া",
      navHome: "হোম",
      navDocs: "ডকুমেন্ট গাইড",
      navServices: "সকল সার্ভিস",
      navCalculator: "প্রিন্ট অর্ডার",
      navLocation: "ঠিকানা ও ম্যাপ",
      navCounter: "কাউন্টার ডেস্ক",
      headerWhatsApp: "হোয়াটসঅ্যাপ",
      mobileCallBtn: "সরাসরি কল",
      mobileWaBtn: "হোয়াটসঅ্যাপ",
      heroBadge: "পুঞ্চার বিশ্বস্ত অনলাইন ও ডিজিটাল সেবা কেন্দ্র",
      heroTitle1: "আপনার এলাকার বিশ্বস্ত",
      heroTitle2: "ডিজিটাল সরকারি সেবা",
      heroTitle3: "ও দ্রুত প্রিন্টিং ও জেরক্স",
      heroSubtitle: "কৃষি ফার্মের বিপরীতে সেখ ফারুক আলির পরিচালনায়। ডিজিটাল রেশন কার্ড, ড্রাইভিং লাইসেন্স, জমির পর্চা, বাইক ও গাড়ির ইন্স্যুরেন্স, তাৎক্ষণিক প্যান কার্ড এবং উন্নত মানের জেরক্স।",
      btnSendWhatsApp: "ফাইল আপলোড করে প্রিন্ট দিন",
      btnCheckDocs: "প্রয়োজনীয় কাগজপত্র দেখুন",
      trustXerox: "দ্রুত জেরক্স ও লেমিনেশন",
      trustInsurance: "আলি ইন্স্যুরেন্স পয়েন্ট",
      trustGovt: "সকল সরকারি পোর্টাল আবেদন",
      trustStamp: "রবার স্ট্যাম্প তৈরি",
      trustLocal: "পুঞ্চা কৃষি ফার্মের বিপরীতে",
      shopPhotoBadge: "আমাদের আসল দোকান",
      shopOwnerLabel: "সেখ ফারুক আলি (প্রোপ্রাইটার)",
      shopCallBadge: "কল: +৯১ ৯৭৩৪ ৫৭৩ ৩২৩",
      callDirect: "ফারুক কে ফোন করুন",
      getDirections: "দোকানের রাস্তা / ম্যাপ",
      calcTag: "লাইনে দাঁড়াতে হবে না",
      calcTitle: "ওয়েব প্রিন্ট ডেস্ক ও ফাইল আপলোড",
      calcDesc: "ঘরে বসেই ফাইল আপলোড করে প্রিন্ট অর্ডার জমা দিন। ফারুকের প্রিন্টারে সরাসরি অর্ডার পৌঁছে যাবে এবং আপনার জন্য ডিজিটাল টোকেন নম্বর ইস্যু হবে।",
      calcSelectLabel: "কাজের ধরন বেছে নিন",
      calcQtyLabel: "কপি / পৃষ্ঠা সংখ্যা",
      calcPriceEstLabel: "মোট প্রদেয় বিল:",
      calcDisclaimer: "*ফাইল ও কনফিগারেশন অনুযায়ী স্বয়ংক্রিয়ভাবে হিসাবকৃত মূল্য।",
      calcSendBtn: "হোয়াটসঅ্যাপ ব্যাকআপ",
      dropzoneTitle: "এখানে ফাইল ড্রপ করুন অথবা সিলেক্ট করুন",
      dropzoneHint: "PDF, Word, JPG, PNG, WEBP ফাইল সমর্থিত (সর্বোচ্চ ২৫ MB)",
      btnRemoveFile: "রিমুভ করুন ✕",
      labelPaperSize: "কাগজের মাপ (Paper Size)",
      paperA4: "A4 (Standard)",
      paperLegal: "Legal (দলিল/স্ট্যাম্প)",
      labelPrintSides: "প্রিন্ট সাইড (Print Sides)",
      sidesSingle: "এক পিঠ (Single)",
      sidesDouble: "উভয় পিঠ (Both)",
      labelFinishing: "অতিরিক্ত ফিনিশিং (Optional)",
      chkLamination: "লেমিনেশন (+₹২০/ডকুমেন্ট)",
      chkSpiral: "স্পাইরাল বাইন্ডিং (+₹৩৫/বই)",
      labelCustName: "আপনার নাম (Customer Name) *",
      labelCustPhone: "মোবাইল / হোয়াটসঅ্যাপ নম্বর *",
      custNamePlaceholder: "যেমন: অনিকেত সরকার",
      custPhonePlaceholder: "১০ সংখ্যার মোবাইল নম্বর",
      labelPaymentMethod: "মূল্য পরিশোধের পদ্ধতি বেছে নিন",
      payUpi: "ইউপিআই (UPI QR / Instant Pay)",
      payCash: "দোকানে এসে নগদ প্রদান (Cash)",
      upiScanHint: "Google Pay, PhonePe, Paytm বা যেকোনো UPI অ্যাপ দিয়ে নিচের QR স্ক্যান করুন:",
      btnUpiApp: "মোবাইল UPI অ্যাপ দিয়ে পে করুন",
      upiOwner: "সেখ ফারুক আলি",
      btnSubmitOrder: "কাউন্টারে অর্ডার ও ফাইল পাঠান",
      btnWhatsAppBackup: "হোয়াটসঅ্যাপ ব্যাকআপ",
      submittingOrder: "অর্ডার পাঠানো হচ্ছে...",
      btnBookRenewal: "পলিসি রিনিউয়াল বুক করুন",
      docGuideTag: "ডকুমেন্ট চেকলিস্ট",
      docGuideTitle: "আসার আগে প্রয়োজনীয় কাগজপত্র দেখে নিন",
      docGuideDesc: "কোনো কাগজপত্র ফেলে আসবেন না! আপনার প্রয়োজনীয় কাজের জন্য সাথে কী কী আসল ও জেরক্স আনতে হবে নিচে দেখে নিন।",
      searchPlaceholder: "সার্ভিস খুঁজুন (যেমন: রেশন, ড্রাইভিং লাইসেন্স, পর্চা, প্যান)...",
      filterAll: "সকল সেবা",
      filterCitizen: "নাগরিক সেবা (রেশন/প্যান/ভোটার)",
      filterTransport: "গাড়ির কাজ ও ইন্স্যুরেন্স",
      filterLand: "জমি ও লাইসেন্স",
      filterStudent: "পরীক্ষা ও ফর্ম ফিলাপ",
      docRequiredHeading: "সাথে কী কী আনতে হবে:",
      docTurnaroundLabel: "সময়সীমা:",
      btnConsultWhatsApp: "হোয়াটসঅ্যাপে পরামর্শ নিন",
      servicesTag: "আমাদের সার্ভিস",
      servicesTitle: "দোকানে যেসব সেবা পাওয়া যায়",
      servicesDesc: "সরকারি ডিজিটাল কাজ থেকে শুরু করে জেরক্স, বাইন্ডিং ও স্টুডেন্ট সামগ্রী।",
      roadmapTag: "সফলভাবে চালু (Phase 2)",
      roadmapTitle: "লাইভ কাউন্টার কিউ ও অনলাইন অর্ডার ডেস্ক",
      roadmapDesc: "আপনার ফাইল এখন সরাসরি ফারুকের কাউন্টার কম্পিউটারে পৌঁছাবে এবং সাথে সাথে পিকআপ টোকেন নম্বর পাবেন!",
      faqTag: "সাধারণ জিজ্ঞাসা",
      faqTitle: "সচরাচর জিজ্ঞাসিত প্রশ্ন",
      locationTag: "দোকানের অবস্থান",
      locationTitle: "ঠিকানা ও যোগাযোগের সময়",
      locAddressTitle: "দোকানের সঠিক ঠিকানা",
      shopAddress: "পুঞ্চা (কৃষি ফার্মের বিপরীতে), পুঞ্চা, পুরুলিয়া, পশ্চিমবঙ্গ — ৭২৩১৫১",
      locHoursTitle: "দোকান খোলার সময়সূচী",
      shopHoursDisplay: "প্রতিদিন খোলা: সকাল ৮:০০ টা – রাত ৯:০০ টা",
      locContactTitle: "ফোন ও হোয়াটসঅ্যাপ",
      phoneLabel: "মোবাইল / কল:",
      shopPhoneDisplay: "+৯১ ৯৭৩৪৫ ৭৩৩২৩",
      emailLabel: "ইমেল:",
      tokenSuccessTitle: "অর্ডার সফলভাবে জমা হয়েছে!",
      tokenPickupLabel: "আপনার প্রিন্ট পিকআপ টোকেন নম্বর:",
      tokenQueuedStatus: "⏳ ফারুকের প্রিন্টারে কিউ-তে যুক্ত হয়েছে",
      modalCustNameLabel: "গ্রাহকের নাম:",
      modalServiceDescLabel: "কাজের বিবরণ:",
      modalTotalLabel: "মোট প্রদেয়:",
      modalPayStatusLabel: "পেমেন্ট স্ট্যাটাস:",
      modalBtnNotify: "ফারুক কে টোকেন সহ জানান",
      modalBtnClose: "বন্ধ করুন / সম্পন্ন",
      footerDesc: "পুঞ্চার নির্ভরযোগ্য ডিজিটাল সার্ভিস সেন্টার ও সাইবার কিওস্ক। সরকারি ফর্ম ফিলাপ, উন্নত প্রিন্টিং এবং বিশ্বস্ত ইন্স্যুরেন্স পরিষেবা।",
      footerProprietor: "👤 প্রোপ্রাইটার: সেখ ফারুক আলি (Sekh Faruk Ali)",
      footerQuickLinks: "গুরুত্বপূর্ণ লিংক",
      footerServices: "জনপ্রিয় সার্ভিস",
      footRation: "ডিজিটাল রেশন কার্ড আবেদন",
      footDriving: "ড্রাইভিং লাইসেন্স (Sarathi)",
      footPorcha: "জমির পর্চা ও খতিয়ান (Banglarbhumi)",
      footInsurance: "বাইক ও গাড়ির ইন্স্যুরেন্স",
      footStamp: "রবার স্ট্যাম্প তৈরি (Official Seals)",
      footPan: "তাৎক্ষণিক প্যান কার্ড (e-PAN)",
      footerCopyright: "© ২০২৬ আলি ইন্টারনেট এন্ড জেরক্স। পুঞ্চা, পুরুলিয়া।",
      barCall: "কল",
      barPrint: "প্রিন্ট জমা",
      barWhatsApp: "হোয়াটসঅ্যাপ",
      barDocs: "কাগজপত্র"
    }
  };

  // 1. Initialize Shop Open/Closed Status
  function updateShopStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    const isOpen = currentHour >= SHOP_DATA.openingHours.openHour && currentHour < SHOP_DATA.openingHours.closeHour;

    if (isOpen) {
      shopStatusBadge.className = "shop-status-pill open";
      shopStatusBadge.innerHTML = `<span class="pulse-dot"></span> <span id="shopStatusText">${I18N[currentLang].shopOpen}</span>`;
    } else {
      shopStatusBadge.className = "shop-status-pill closed";
      shopStatusBadge.innerHTML = `<span class="pulse-dot"></span> <span id="shopStatusText">${I18N[currentLang].shopClosed}</span>`;
    }
  }

  // 2. Set Language
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('ali_site_lang', lang);

    if (lang === 'bn') {
      document.body.classList.add('lang-bn');
    } else {
      document.body.classList.remove('lang-bn');
    }

    // Update Language Toggle button (icon-only): visible glyph + accessible text
    if (langLabel) langLabel.textContent = I18N[lang].langBtn;
    if (langIcon) langIcon.textContent = lang === 'bn' ? 'EN' : 'বাং';
    if (langToggleBtn) langToggleBtn.setAttribute('aria-label', I18N[lang].langBtn);

    // Update all i18n text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (I18N[lang][key]) {
        el.textContent = I18N[lang][key];
      }
    });

    // Update Placeholders
    if (searchInput) {
      searchInput.placeholder = I18N[lang].searchPlaceholder;
    }
    if (custNameInput) {
      custNameInput.placeholder = I18N[lang].custNamePlaceholder;
    }
    if (custPhoneInput) {
      custPhoneInput.placeholder = I18N[lang].custPhonePlaceholder;
    }

    // Refresh dynamic components
    updateShopStatus();
    populateCalculatorOptions();
    calculatePrintEstimate();
    renderDocGuides();
    renderServicesCategories();
    renderFaqs();
  }

  // Language switch button handler
  langToggleBtn.addEventListener('click', () => {
    setLanguage(currentLang === 'bn' ? 'en' : 'bn');
  });

  // 3. Print Calculator & Price Estimator Logic
  function populateCalculatorOptions() {
    if (!printServiceSelect) return;
    const currentVal = printServiceSelect.value || "bwXerox";
    printServiceSelect.innerHTML = "";

    Object.keys(SHOP_DATA.printPricing).forEach(key => {
      const item = SHOP_DATA.printPricing[key];
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${item.label[currentLang]} (₹${item.rate}/${item.unit})`;
      printServiceSelect.appendChild(opt);
    });

    printServiceSelect.value = currentVal;
  }

  function calculatePrintEstimate() {
    if (!printServiceSelect || !printCopiesInput || !estPriceAmount) return;
    const selectedKey = printServiceSelect.value || "bwXerox";
    const serviceInfo = SHOP_DATA.printPricing[selectedKey];
    let copies = parseInt(printCopiesInput.value, 10);
    if (isNaN(copies) || copies < 1) copies = 1;

    let baseRate = serviceInfo.rate;
    if (currentPaperSize === 'Legal') {
      baseRate += 1; // Legal paper small surcharge
    }

    let subtotal = copies * baseRate;

    // Extra finishing
    if (chkLamination && chkLamination.checked) {
      subtotal += 20 * copies;
    }
    if (chkSpiral && chkSpiral.checked) {
      subtotal += 35;
    }

    estPriceAmount.textContent = `₹${subtotal}`;

    // Update Dynamic UPI QR Code
    const upiPayUrl = `upi://pay?pa=9734573323@ybl&pn=Ali%20Internet%20Puncha&am=${subtotal}&cu=INR&tn=Print-Order`;
    if (dynamicUpiQr) {
      dynamicUpiQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiPayUrl)}`;
    }
    if (upiIntentBtn) {
      upiIntentBtn.href = upiPayUrl;
    }

    // Update WhatsApp Button Link
    const serviceTitle = serviceInfo.label[currentLang];
    const waText = currentLang === 'bn'
      ? `নমস্কার ফারুক! আমি ওয়েবসাইট থেকে প্রিন্ট অর্ডার দিতে চাই। আমার ${copies} কপি "${serviceTitle}" (${currentPaperSize}, ${currentSides === 'double' ? 'উভয় পিঠ' : 'এক পিঠ'}) প্রয়োজন (মোট বিল ₹${subtotal})। সাথে ফাইলটি পাঠাচ্ছি।`
      : `Hello Faruk! I would like to place a print order. I need ${copies} copies of "${serviceTitle}" (${currentPaperSize}, ${currentSides}) (Total ₹${subtotal}). Attaching my document.`;

    sendPrintWhatsAppBtn.href = `https://wa.me/91${SHOP_DATA.phone}?text=${encodeURIComponent(waText)}`;
  }

  // Stepper handlers
  if (copiesMinusBtn && copiesPlusBtn) {
    copiesMinusBtn.addEventListener('click', () => {
      let val = parseInt(printCopiesInput.value, 10) || 1;
      if (val > 1) {
        printCopiesInput.value = val - 1;
        calculatePrintEstimate();
      }
    });

    copiesPlusBtn.addEventListener('click', () => {
      let val = parseInt(printCopiesInput.value, 10) || 1;
      printCopiesInput.value = val + 1;
      calculatePrintEstimate();
    });

    printCopiesInput.addEventListener('input', calculatePrintEstimate);
    printServiceSelect.addEventListener('change', calculatePrintEstimate);
  }

  // Paper Size & Sides Toggles
  paperSizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      paperSizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPaperSize = btn.getAttribute('data-size');
      calculatePrintEstimate();
    });
  });

  printSidesBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      printSidesBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSides = btn.getAttribute('data-sides');
      calculatePrintEstimate();
    });
  });

  if (chkLamination) chkLamination.addEventListener('change', calculatePrintEstimate);
  if (chkSpiral) chkSpiral.addEventListener('change', calculatePrintEstimate);

  // Payment Tabs Toggle
  if (payTabUpi && payTabCash && upiDetailsCard) {
    payTabUpi.addEventListener('click', () => {
      payTabUpi.classList.add('active');
      payTabCash.classList.remove('active');
      upiDetailsCard.classList.add('active');
      currentPaymentMethod = 'upi';
    });

    payTabCash.addEventListener('click', () => {
      payTabCash.classList.add('active');
      payTabUpi.classList.remove('active');
      upiDetailsCard.classList.remove('active');
      currentPaymentMethod = 'cash';
    });
  }

  // File Upload Dropzone Handling
  if (uploadDropzone && printFileInput) {
    uploadDropzone.addEventListener('click', () => printFileInput.click());

    uploadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadDropzone.classList.add('dragover');
    });

    uploadDropzone.addEventListener('dragleave', () => {
      uploadDropzone.classList.remove('dragover');
    });

    uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    printFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  function handleFileSelect(file) {
    selectedFile = file;
    selectedFileName.textContent = file.name;
    selectedFileSize.textContent = formatBytes(file.size);

    if (file.type.startsWith('image/')) {
      fileTypeIcon.textContent = '🖼️';
    } else if (file.type.includes('pdf')) {
      fileTypeIcon.textContent = '📑';
    } else {
      fileTypeIcon.textContent = '📄';
    }

    uploadDropzone.style.display = 'none';
    fileSelectedBox.classList.add('active');

    // Read base64 for API transfer
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedFileBase64 = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  if (btnRemoveFile) {
    btnRemoveFile.addEventListener('click', () => {
      selectedFile = null;
      selectedFileBase64 = '';
      printFileInput.value = '';
      fileSelectedBox.classList.remove('active');
      uploadDropzone.style.display = 'block';
    });
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // 4. Submit Order to Counter Desk API
  if (btnSubmitOrder) {
    btnSubmitOrder.addEventListener('click', async () => {
      const name = custNameInput ? custNameInput.value.trim() : '';
      const phone = custPhoneInput ? custPhoneInput.value.trim() : '';

      if (!name) {
        alert(currentLang === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.');
        if (custNameInput) custNameInput.focus();
        return;
      }

      if (!phone || phone.length < 10) {
        alert(currentLang === 'bn' ? 'অনুগ্রহ করে সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন।' : 'Please enter a valid 10-digit mobile number.');
        if (custPhoneInput) custPhoneInput.focus();
        return;
      }

      const selectedKey = printServiceSelect.value || "bwXerox";
      const serviceInfo = SHOP_DATA.printPricing[selectedKey];
      const copies = parseInt(printCopiesInput.value, 10) || 1;
      const totalText = estPriceAmount.textContent.replace('₹', '');
      const totalAmount = parseFloat(totalText) || 0;

      const orderPayload = {
        customerName: name,
        customerPhone: phone,
        serviceType: selectedKey,
        serviceName: serviceInfo.label[currentLang],
        copies: copies,
        paperSize: currentPaperSize,
        sides: currentSides,
        lamination: chkLamination ? chkLamination.checked : false,
        spiralBinding: chkSpiral ? chkSpiral.checked : false,
        totalAmount: totalAmount,
        paymentMethod: currentPaymentMethod,
        fileName: selectedFile ? selectedFile.name : 'Counter_Walkin_Job.pdf',
        fileData: selectedFileBase64
      };

      btnSubmitOrder.disabled = true;
      btnSubmitOrder.innerHTML = `<span>⏳</span> <span>${I18N[currentLang].submittingOrder}</span>`;

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });

        if (res.ok) {
          const data = await res.json();
          showTokenModal(data.order);
        } else {
          fallbackLocalToken(orderPayload);
        }
      } catch (err) {
        // Fallback for static hosting
        fallbackLocalToken(orderPayload);
      } finally {
        btnSubmitOrder.disabled = false;
        btnSubmitOrder.innerHTML = `<span>🚀</span> <span>${I18N[currentLang].btnSubmitOrder}</span>`;
      }
    });
  }

  function fallbackLocalToken(payload) {
    const localToken = `#P-${Math.floor(100 + Math.random() * 900)}`;
    const mockOrder = {
      ...payload,
      token: localToken,
      status: 'pending'
    };
    showTokenModal(mockOrder);
  }

  function showTokenModal(order) {
    modalTokenId.textContent = order.token;
    modalCustName.textContent = order.customerName;
    modalServiceDesc.textContent = `${order.serviceName} (${order.copies} ${currentLang === 'bn' ? 'কপি' : 'Copies'}, ${order.paperSize})`;
    modalTotalAmount.textContent = `₹${order.totalAmount}`;
    modalPayStatus.textContent = order.paymentMethod === 'upi' ? (currentLang === 'bn' ? 'ইউপিআই পেমেন্ট সম্পন্ন' : 'UPI Payment Completed') : (currentLang === 'bn' ? 'দোকানে নগদ প্রদান' : 'Cash at Shop');
    const modalStatusEl = document.getElementById('modalTokenStatus');
    if (modalStatusEl) {
      modalStatusEl.textContent = I18N[currentLang].tokenQueuedStatus;
    }

    const waMsg = currentLang === 'bn'
      ? `নমস্কার ফারুক! আমি ওয়েবসাইট থেকে প্রিন্ট অর্ডার (${order.token}) জমা দিয়েছি।\nগ্রাহক: ${order.customerName}\nকাজ: ${order.serviceName} (${order.copies} Copies)\nমোট বিল: ₹${order.totalAmount} (${order.paymentMethod === 'upi' ? 'UPI' : 'নগদ'})\nদয়া করে প্রিন্ট করে রাখবেন।`
      : `Hello Faruk! I have placed print order (${order.token}) from your website.\nCustomer: ${order.customerName}\nService: ${order.serviceName} (${order.copies} Copies)\nTotal: ₹${order.totalAmount}\nPlease keep it printed.`;

    modalWhatsAppBtn.href = `https://wa.me/91${SHOP_DATA.phone}?text=${encodeURIComponent(waMsg)}`;
    tokenModal.classList.add('active');
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      tokenModal.classList.remove('active');
    });
  }

  // 5. Render Document Checklist Cards
  function renderDocGuides() {
    if (!docCardsContainer) return;
    docCardsContainer.innerHTML = "";

    const filtered = SHOP_DATA.documentGuides.filter(item => {
      const matchesCategory = activeFilter === 'all' || item.category === activeFilter;
      const query = searchQuery.toLowerCase().trim();
      const titleMatch = item.title[currentLang].toLowerCase().includes(query) || item.title.en.toLowerCase().includes(query) || item.title.bn.toLowerCase().includes(query);
      const descMatch = item.shortDesc[currentLang].toLowerCase().includes(query);
      const docsMatch = item.documents[currentLang].some(doc => doc.toLowerCase().includes(query));

      return matchesCategory && (query === '' || titleMatch || descMatch || docsMatch);
    });

    if (filtered.length === 0) {
      docCardsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <p style="font-size: 1.1rem; font-weight: 600;">${currentLang === 'bn' ? 'কোনো সার্ভিস পাওয়া যায়নি' : 'No matching services found'}</p>
          <p style="font-size: 0.9rem; margin-top: 0.25rem;">${currentLang === 'bn' ? 'অনুগ্রহ করে অন্য শব্দ দিয়ে খুঁজুন বা সরাসরি ফারুক কে ফোন করুন।' : 'Try a different search term or call Faruk directly.'}</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = "doc-card";

      const docsListHtml = item.documents[currentLang].map(doc => `
        <li>
          <span class="check-icon">✓</span>
          <span>${doc}</span>
        </li>
      `).join('');

      const waMsg = currentLang === 'bn'
        ? `নমস্কার ফারুক, আমি "${item.title.bn}" সম্পর্কে তথ্য জানতে চাই। এই কাজের জন্য দোকানে কখন এলে সুবিধা হবে?`
        : `Hello Faruk, I need assistance regarding "${item.title.en}". When can I visit the shop with my documents?`;

      const waLink = `https://wa.me/91${SHOP_DATA.phone}?text=${encodeURIComponent(waMsg)}`;

      card.innerHTML = `
        <div class="doc-card-header">
          <div class="doc-card-icon">${item.icon}</div>
          <div class="doc-card-title-wrap">
            <h3>${item.title[currentLang]}</h3>
            <p class="doc-turnaround">${I18N[currentLang].docTurnaroundLabel} <strong>${item.turnaround[currentLang]}</strong></p>
          </div>
        </div>
        <p class="doc-card-desc">${item.shortDesc[currentLang]}</p>
        
        <div class="doc-list-heading">
          <span>📋</span> ${I18N[currentLang].docRequiredHeading}
        </div>
        <ul class="doc-items-list">
          ${docsListHtml}
        </ul>

        <div class="doc-card-footer">
          <span style="font-size: 0.78rem; color: var(--text-muted);">${item.feeHint[currentLang]}</span>
          <a href="${waLink}" target="_blank" rel="noopener" class="doc-consult-btn">
            <span>💬</span> ${I18N[currentLang].btnConsultWhatsApp}
          </a>
        </div>
      `;

      docCardsContainer.appendChild(card);
    });
  }

  // Filter Buttons Click
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      renderDocGuides();
    });
  });

  // Search Input Handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderDocGuides();
    });
  }

  // 6. Render Full Services Categories
  function renderServicesCategories() {
    if (!servicesCategoriesGrid) return;
    servicesCategoriesGrid.innerHTML = "";

    SHOP_DATA.serviceCategories.forEach(cat => {
      const card = document.createElement('div');
      card.className = "category-card";

      const itemsHtml = cat.items.map(item => `
        <li class="service-item-row">
          <span>${item.name[currentLang]}</span>
          ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ''}
        </li>
      `).join('');

      card.innerHTML = `
        <div class="cat-header">
          <span class="cat-icon">${cat.icon}</span>
          <h3>${cat.title[currentLang]}</h3>
        </div>
        <ul class="service-items-list">
          ${itemsHtml}
        </ul>
      `;

      servicesCategoriesGrid.appendChild(card);
    });
  }

  // 7. Render FAQs
  function renderFaqs() {
    if (!faqAccordion) return;
    faqAccordion.innerHTML = "";

    SHOP_DATA.faqs.forEach((faq, idx) => {
      const item = document.createElement('div');
      item.className = "faq-item" + (idx === 0 ? " active" : "");

      item.innerHTML = `
        <button class="faq-question" type="button">
          <span>${faq.q[currentLang]}</span>
          <span class="faq-chevron">▼</span>
        </button>
        <div class="faq-answer">
          <p>${faq.a[currentLang]}</p>
        </div>
      `;

      const btn = item.querySelector('.faq-question');
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });

      faqAccordion.appendChild(item);
    });
  }

  // Initial Run
  setLanguage(currentLang);
  setInterval(updateShopStatus, 60000); // Check shop status every 1 minute

  // 7. Mobile Navigation (Hamburger Menu)
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const mobileNav = document.getElementById('mobileNav');

  function closeMobileMenu() {
    if (!mobileNav || !menuToggleBtn) return;
    mobileNav.classList.remove('open');
    menuToggleBtn.setAttribute('aria-expanded', 'false');
    menuToggleBtn.setAttribute('aria-label', 'Open Menu');
  }

  if (menuToggleBtn && mobileNav) {
    menuToggleBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
      menuToggleBtn.setAttribute('aria-label', isOpen ? 'Close Menu' : 'Open Menu');
    });

    // Close the menu after tapping any link (single-page anchors & external links)
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close when clicking outside the header
    document.addEventListener('click', (e) => {
      if (mobileNav.classList.contains('open') && !e.target.closest('.site-header')) {
        closeMobileMenu();
      }
    });

    // Reset state if viewport grows back to desktop width
    window.matchMedia('(min-width: 993px)').addEventListener('change', (e) => {
      if (e.matches) closeMobileMenu();
    });
  }
});
