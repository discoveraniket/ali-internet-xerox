const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'orders.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ nextToken: 101, orders: [] }, null, 2));
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
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

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS for flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API: Server-Sent Events (Live Order Stream for Faruk's Counter)
  if (pathname === '/api/orders/stream') {
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

  // 2. API: Get Orders List
  if (pathname === '/api/orders' && method === 'GET') {
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

  // 3. API: Create New Print Order (with File Data)
  if (pathname === '/api/orders' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const orderInput = JSON.parse(body);
        const db = readOrdersData();
        const tokenId = `#P-${db.nextToken}`;
        db.nextToken += 1;

        let savedFilePath = '';
        let originalFileName = orderInput.fileName || 'document.pdf';

        if (orderInput.fileData) {
          // File data expected as base64 string
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
          status: 'pending', // pending -> ready -> completed -> cancelled
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

  // 4. API: Update Order Status (Mark Ready, Mark Completed, Reject)
  if (pathname.startsWith('/api/orders/') && method === 'PATCH') {
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

  // 5. API: Dashboard Summary Statistics
  if (pathname === '/api/stats' && method === 'GET') {
    const db = readOrdersData();
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = db.orders.filter(o => o.createdAt && o.createdAt.slice(0, 10) === today);

    const stats = {
      todayCount: todayOrders.length,
      pendingCount: db.orders.filter(o => o.status === 'pending').length,
      readyCount: db.orders.filter(o => o.status === 'ready').length,
      completedCount: db.orders.filter(o => o.status === 'completed').length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, stats }));
    return;
  }

  // 6. Serve Uploaded Documents
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

  // 7. Route `/counter` -> Counter Dashboard
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
