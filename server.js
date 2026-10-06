const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'orders.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');
const SESSIONS_FILE = path.join(__dirname, 'data', 'sessions.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Operator Credentials (Default PIN: 7332, can be overridden by env vars)
const COUNTER_PIN = process.env.COUNTER_PIN || '7332';
const COUNTER_PASSWORD = process.env.COUNTER_PASSWORD || 'faruk7332';

// Ensure data directory & files exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ nextToken: 101, orders: [] }, null, 2));
}

const DEFAULT_SETTINGS = {
  theme: "ocean-emerald",
  shopPhoto: "/assets/shop-front.jpeg",
  contact: {
    phone: "9734573323",
    phoneFormatted: "+91 97345 73323",
    whatsapp: "9734573323",
    email: "allinternetpuncha@gmail.com",
    landmark: {
      bn: "কৃষি ফার্মের বিপরীতে, পুঞ্চা, পুরুলিয়া",
      en: "Opposite Krishi Farm, Puncha, Purulia"
    },
    hours: {
      bn: "সোম – রবি: সকাল ৮:০০ টা – রাত ৯:০০ টা",
      en: "Monday – Sunday: 8:00 AM – 9:00 PM"
    }
  },
  heroBanner: {
    active: false,
    tag: {
      bn: "জরুরী বিজ্ঞপ্তি",
      en: "Urgent Notice"
    },
    message: {
      bn: "পিএম কিষাণ সম্মান নিধি এবং কৃষক বন্ধু আবেদন চলছে! শেষ তারিখের আগে দোকানে এসে যোগাযোগ করুন।",
      en: "PM-Kisan & Krishak Bandhu eKYC is open! Visit the shop before the deadline."
    },
    actionUrl: "#documents",
    actionLabel: {
      bn: "কাগজপত্র দেখুন",
      en: "Check Documents"
    }
  },
  pricing: {
    bwXerox: 2,
    colorPrint: 10,
    photoPassport: 40,
    lamination: 20,
    spiralBinding: 35,
    rubberStamp: 120
  }
};

if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
}

if (!fs.existsSync(SESSIONS_FILE)) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}, null, 2), 'utf8');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

// SSE active clients
let sseClients = [];

function broadcastOrderEvent(type, data) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch (e) {
      // client dropped
    }
  });
}

function readOrdersData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { nextToken: 101, orders: [] };
  }
}

function writeOrdersData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function readSettingsData() {
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

function writeSettingsData(data) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function readSessions() {
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function writeSessions(sessions) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf8');
}

// Authentication Helpers
function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies['ali_counter_session'];
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = bearerToken || cookieToken;

  if (!token) return false;

  const sessions = readSessions();
  const session = sessions[token];
  if (!session) return false;

  // Session expiry check (30 days)
  const now = Date.now();
  if (session.expiresAt && session.expiresAt < now) {
    delete sessions[token];
    writeSessions(sessions);
    return false;
  }
  return true;
}

function createSession() {
  const token = crypto.randomBytes(32).toString('hex');
  const sessions = readSessions();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  sessions[token] = {
    createdAt: Date.now(),
    expiresAt: Date.now() + thirtyDaysMs,
    user: 'Faruk'
  };
  writeSessions(sessions);
  return { token, maxAge: 30 * 24 * 60 * 60 };
}

function destroySession(token) {
  if (!token) return;
  const sessions = readSessions();
  if (sessions[token]) {
    delete sessions[token];
    writeSessions(sessions);
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS for flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // =========================================================================
  // 1. Auth APIs
  // =========================================================================

  // Login: POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { pin, password } = JSON.parse(body || '{}');
        const isValidPin = pin && String(pin).trim() === String(COUNTER_PIN).trim();
        const isValidPassword = password && String(password).trim() === String(COUNTER_PASSWORD).trim();

        if (isValidPin || isValidPassword) {
          const { token, maxAge } = createSession();
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Set-Cookie': `ali_counter_session=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`
          });
          res.end(JSON.stringify({ success: true, token, message: 'Authenticated successfully' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid PIN or password' }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Malformed request' }));
      }
    });
    return;
  }

  // Verify: GET /api/auth/verify
  if (pathname === '/api/auth/verify' && method === 'GET') {
    const auth = isAuthenticated(req);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, authenticated: auth }));
    return;
  }

  // Logout: POST /api/auth/logout
  if (pathname === '/api/auth/logout' && method === 'POST') {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies['ali_counter_session'];
    if (token) destroySession(token);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': 'ali_counter_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'
    });
    res.end(JSON.stringify({ success: true, message: 'Logged out successfully' }));
    return;
  }

  // =========================================================================
  // 2. Settings APIs (Public GET / Protected POST & Photo Upload)
  // =========================================================================

  // Get Settings: GET /api/settings (Public - read by index.html and counter.html)
  if (pathname === '/api/settings' && method === 'GET') {
    const settings = readSettingsData();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify({ success: true, settings }));
    return;
  }

  // Update Settings: POST /api/settings (Protected)
  if (pathname === '/api/settings' && method === 'POST') {
    if (!isAuthenticated(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized. Operator PIN required.' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const update = JSON.parse(body || '{}');
        const current = readSettingsData();
        const merged = {
          ...current,
          ...update,
          contact: { ...current.contact, ...(update.contact || {}) },
          heroBanner: { ...current.heroBanner, ...(update.heroBanner || {}) },
          pricing: { ...current.pricing, ...(update.pricing || {}) }
        };
        writeSettingsData(merged);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, settings: merged }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid settings payload' }));
      }
    });
    return;
  }

  // Upload Storefront Photo: POST /api/settings/photo (Protected)
  if (pathname === '/api/settings/photo' && method === 'POST') {
    if (!isAuthenticated(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) { // 20MB limit
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const { fileData, fileName } = JSON.parse(body || '{}');
        if (!fileData) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing image data' }));
          return;
        }

        const ext = path.extname(fileName || 'photo.jpeg') || '.jpeg';
        const diskName = `storefront_${Date.now()}${ext.toLowerCase()}`;
        const filePath = path.join(UPLOADS_DIR, diskName);
        const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');

        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        const photoUrl = `/uploads/${diskName}`;

        const settings = readSettingsData();
        settings.shopPhoto = photoUrl;
        writeSettingsData(settings);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, photoUrl }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to save photo' }));
      }
    });
    return;
  }

  // =========================================================================
  // 3. Orders APIs & SSE Stream
  // =========================================================================

  // SSE: GET /api/orders/stream (Protected)
  if (pathname === '/api/orders/stream') {
    if (!isAuthenticated(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('event: connected\ndata: {"status":"connected"}\n\n');

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    sseClients.push(newClient);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c.id !== clientId);
    });
    return;
  }

  // Get Orders: GET /api/orders (Protected)
  if (pathname === '/api/orders' && method === 'GET') {
    if (!isAuthenticated(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized. Operator PIN required.' }));
      return;
    }

    const db = readOrdersData();
    const statusFilter = parsedUrl.searchParams.get('status');
    let list = db.orders;
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(o => o.status === statusFilter);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: list.length, orders: list }));
    return;
  }

  // Create Order: POST /api/orders (Public - customer places from website)
  if (pathname === '/api/orders' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) { // 25MB limit
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const orderInput = JSON.parse(body);
        const db = readOrdersData();
        const tokenId = `#P-${db.nextToken}`;
        db.nextToken += 1;

        let savedFilePath = '';
        let originalFileName = orderInput.fileName || 'document.pdf';

        if (orderInput.fileData) {
          const safeName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
          const diskFileName = `${tokenId.replace('#', '')}_${Date.now()}_${safeName}`;
          savedFilePath = path.join(UPLOADS_DIR, diskFileName);

          const base64Data = orderInput.fileData.replace(/^data:[^;]+;base64,/, '');
          fs.writeFileSync(savedFilePath, Buffer.from(base64Data, 'base64'));
          savedFilePath = `/uploads/${diskFileName}`;
        }

        const newOrder = {
          id: 'ord_' + Date.now(),
          token: tokenId,
          customerName: orderInput.customerName || 'Customer',
          customerPhone: orderInput.customerPhone || '',
          serviceType: orderInput.serviceType || 'bwXerox',
          serviceName: orderInput.serviceName || 'B&W Xerox',
          copies: parseInt(orderInput.copies, 10) || 1,
          paperSize: orderInput.paperSize || 'A4',
          sides: orderInput.sides || 'single',
          lamination: Boolean(orderInput.lamination),
          spiralBinding: Boolean(orderInput.spiralBinding),
          totalAmount: parseFloat(orderInput.totalAmount) || 0,
          paymentMethod: orderInput.paymentMethod || 'cash_at_counter',
          paymentStatus: orderInput.paymentMethod === 'upi' ? 'paid_online' : 'pending_at_counter',
          status: 'pending', // pending -> in_progress -> ready -> completed -> cancelled
          fileName: originalFileName,
          fileUrl: savedFilePath,
          createdAt: new Date().toISOString()
        };

        db.orders.unshift(newOrder);
        writeOrdersData(db);

        // Broadcast to Faruk's dashboard in realtime
        broadcastOrderEvent('new_order', newOrder);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, order: newOrder }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid order payload' }));
      }
    });
    return;
  }

  // Update Order: PATCH /api/orders/:id (Protected)
  if (pathname.startsWith('/api/orders/') && method === 'PATCH') {
    if (!isAuthenticated(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      return;
    }

    const orderId = pathname.replace('/api/orders/', '');
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const updateData = JSON.parse(body);
        const db = readOrdersData();
        const orderIdx = db.orders.findIndex(o => o.id === orderId || o.token === orderId);

        if (orderIdx === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Order not found' }));
          return;
        }

        if (updateData.status) {
          db.orders[orderIdx].status = updateData.status;
        }
        if (updateData.cancelReason !== undefined) {
          db.orders[orderIdx].cancelReason = updateData.cancelReason;
        }
        if (updateData.paymentStatus) {
          db.orders[orderIdx].paymentStatus = updateData.paymentStatus;
        }

        db.orders[orderIdx].updatedAt = new Date().toISOString();
        writeOrdersData(db);

        broadcastOrderEvent('order_updated', db.orders[orderIdx]);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, order: db.orders[orderIdx] }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Failed to update order' }));
      }
    });
    return;
  }

  // Dashboard Stats: GET /api/stats (Protected)
  if (pathname === '/api/stats' && method === 'GET') {
    if (!isAuthenticated(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      return;
    }

    const db = readOrdersData();
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = db.orders.filter(o => o.createdAt && o.createdAt.slice(0, 10) === today);

    const stats = {
      todayCount: todayOrders.length,
      pendingCount: db.orders.filter(o => o.status === 'pending').length,
      inProgressCount: db.orders.filter(o => o.status === 'in_progress').length,
      readyCount: db.orders.filter(o => o.status === 'ready').length,
      completedCount: db.orders.filter(o => o.status === 'completed').length,
      cancelledCount: db.orders.filter(o => o.status === 'cancelled').length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      todayUpi: todayOrders.filter(o => o.paymentStatus === 'paid_online' || o.paymentMethod === 'upi').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      todayCash: todayOrders.filter(o => o.paymentStatus === 'paid_cash').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      todayDue: todayOrders.filter(o => o.paymentStatus === 'pending_at_counter').reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, stats }));
    return;
  }

  // Serve Uploaded Files: GET /uploads/*
  if (pathname.startsWith('/uploads/')) {
    const fileName = path.basename(pathname);
    const safeFilePath = path.join(UPLOADS_DIR, fileName);

    fs.stat(safeFilePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File Not Found');
        return;
      }
      const ext = path.extname(safeFilePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`
      });
      fs.createReadStream(safeFilePath).pipe(res);
    });
    return;
  }

  // Static Assets and HTML Routes
  let reqPath = decodeURI(pathname);
  if (reqPath === '/counter' || reqPath === '/counter/') {
    reqPath = '/counter.html';
  } else if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(__dirname, reqPath);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Ali Internet & Xerox Platform running at http://localhost:${PORT}/`);
  console.log(`Faruk's Counter Dashboard available at http://localhost:${PORT}/counter`);
});
