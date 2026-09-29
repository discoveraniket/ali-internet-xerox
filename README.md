# Ali Internet & Xerox (আলি ইন্টারনেট এন্ড জেরক্স)
### Modern Digital Citizen Services & Document Printing Web Platform
**Location:** Puncha (Opposite Krishi Farm), Purulia, West Bengal — 723151  
**Proprietor:** Sekh Faruk Ali (সেখ ফারুক আলি) | 📞 +91 97345 73323

---

## 🌟 Overview
This project is a high-speed, mobile-first, bilingual (Bengali/English) web platform built for **Ali Internet & Xerox**, a rural Common Service Center (CSC) and printing hub in Puncha, Purulia.

The platform eliminates shop counter bottlenecks, provides an interactive **Document Checklist Guide** so customers bring the right papers on their first visit, and features an **Instant WhatsApp Print Order Calculator** that lets users send print jobs ahead of time.

---

## 🚀 Key Features Delivered

### Phase 1: Digital Presence & Guidance
- 🌐 **Instant Bilingual Toggle:** Seamless switch between **বাংলা (Bengali)** and **English** with saved preferences.
- 🕒 **Live Shop Status:** Real-time indicator displaying whether the shop is currently open or closed (8:00 AM – 9:00 PM).
- 📋 **Required Documents Checklist:** Comprehensive guide for 18+ services (Digital Ration Cards, Driving Licenses, Jamir Porcha, Instant PAN, Vehicle Insurance, and Trade Licenses).
- 🔍 **Real-Time Service Search & Filter:** Filter by Citizen Services, Transport & Insurance, Land & Business, and Student Forms.
- 📍 **One-Tap Contact & Navigation:** Direct phone calling, WhatsApp consultation, and Google Maps GPS navigation opposite Krishi Farm.

### Phase 2: Web-to-Counter Cloud Print Desk & Workstation
- 📁 **Cloud Document Uploader:** Drag-and-drop or select PDF, Word documents, and photos directly from home or mobile.
- ⚙️ **Custom Print Configuration:**
  - Print types: B&W Xerox (₹2), Color Print (₹10), Photo Print (₹40).
  - Paper Size: A4 vs. Legal (for court deeds/stamps).
  - Print Sides: Single-sided vs. Back-to-Back.
  - Extra Finishing: Lamination (+₹20) and Spiral Binding (+₹35).
- ⚡ **Dynamic Bharat UPI Prepayment:** Generates instant UPI QR code encoded with the exact bill amount (PhonePe, Google Pay, Paytm, BHIM) + mobile 1-tap UPI intent link, or "Pay Cash at Counter".
- 🎫 **Digital Pickup Token Slip:** Instant unique Token ID (e.g. `#P-101`) with direct WhatsApp order notification for Faruk.
- 💻 **Faruk's Live Counter Workstation (`/counter`):**
  - Real-time Server-Sent Events (SSE) stream — new orders appear on Faruk's screen instantly with zero manual refresh.
  - Synthesized audio chime alerting Faruk when a customer places an order.
  - 1-click **"Open / Print File"** button to dispatch documents straight to the physical printer.
  - Lifecycle buttons: **"Mark Ready"** (with 1-click WhatsApp customer alert) and **"Mark Completed"**.
  - Metrics banner tracking Pending orders, Ready orders, and Today's Revenue.

---

## 📂 Project Structure
```
faruk/
├── index.html                  # Semantic, SEO-optimized HTML5 structure
├── css/
│   └── style.css               # Modern glassmorphism & responsive design system
├── js/
│   ├── data.js                 # Bilingual database of services, checklists & pricing
│   └── app.js                  # Language switcher, calculator & search logic
├── assets/
│   └── shop-front.jpeg         # Real storefront photo of the physical shop
├── server.js                   # Lightweight zero-dependency local preview server
├── FOUNDING_DOCUMENT.md        # Complete strategic roadmap & architecture blueprint
└── README.md                   # Project documentation
```

---

## 🛠️ Running Locally
To run the website locally:

```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🚀 Free Deployment Guide

### Option 1: Render.com (Recommended for Full Backend & Counter Workstation) 🏆
To have the **Cloud Print Uploader**, **File Storage**, **Realtime SSE alerts**, and **Faruk's Counter Workstation** fully live online for free:

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial release of Ali Internet platform"
   git remote add origin https://github.com/YOUR_USERNAME/faruk.git
   git push -u origin main
   ```
2. Log in to [Render.com](https://render.com) (free account).
3. Click **New +** -> **Web Service**.
4. Select your `faruk` GitHub repository.
5. Render will automatically detect Node.js:
   - **Environment:** Node
   - **Build Command:** *(leave empty or `npm install`)*
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
6. Click **Deploy Web Service**.
7. In ~2 minutes, your website will be live at `https://ali-internet-xxxx.onrender.com` with free HTTPS/SSL!

---

### Option 2: GitHub Pages (Static Client-Side Fallback)
If you only need the public-facing storefront and WhatsApp ordering without the live Node backend:
1. In your GitHub repo, go to **Settings > Pages**.
2. Under **Branch**, select `main` and root `/`.
3. Click **Save**. It will be live at `https://YOUR_USERNAME.github.io/faruk/`.

*For detailed architectural plans, business growth levers, and Phase 2/3 roadmap, see [FOUNDING_DOCUMENT.md](FOUNDING_DOCUMENT.md).*
