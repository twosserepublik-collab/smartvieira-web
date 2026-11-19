const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const crypto = require('crypto');
const tls = require('tls');

// =========================================================================
// ENVIRONMENT CONFIGURATION & CONSTANTS
// =========================================================================
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_FILE = path.join(__dirname, 'database.json');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

const DEFAULT_COURIER_ACCESS_CODE = process.env.COURIER_ACCESS_CODE || 'VIEIRA-COURIER-2026';
const STRICT_SHELL_VALIDATION = process.env.STRICT_SHELL_VALIDATION === 'true';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('[SECURITY WARN] JWT_SECRET no definido en env; usando secreto efimero aleatorio.');
}

// =========================================================================
// PROCESS RESILIENCE & UNCAUGHT EXCEPTION ISOLATION (ANTI-CRASH)
// =========================================================================
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL UNCAUGHT EXCEPTION ISOLATED]', err.message, err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION ISOLATED]', reason);
});

// =========================================================================
// IN-MEMORY RATE LIMITER (ANTI-DOS / BRUTE FORCE PROTECTION)
// =========================================================================
const rateLimitMap = new Map();

function checkRateLimit(ip, maxRequests = 60, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count++;
  }
  rateLimitMap.set(ip, record);
  return record.count <= maxRequests;
}

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) rateLimitMap.delete(ip);
  }
}, 300000);

// =========================================================================
// SECURITY CRYPTO HELPERS (PBKDF2 SALTED HASHING & JWT TOKENS)
// =========================================================================
function hashPassword(password, existingSalt = null) {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  if (!hash || !salt || !password) return false;
  const calcHash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'utf8'), Buffer.from(calcHash, 'utf8'));
  } catch (e) {
    return false;
  }
}

function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now()/1000) + (86400 * 30) })).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  try {
    const a = Buffer.from(sig, 'utf8');
    const b = Buffer.from(expectedSig, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (parsed.exp && parsed.exp < Math.floor(Date.now()/1000)) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

// =========================================================================
// DATABASE STORAGE & AUTOMATIC PASSWORD MIGRATION
// =========================================================================
function loadDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = { pilgrims: [], couriers: [], reservations: [], emergencies: [], notifications: [], productOrders: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const db = JSON.parse(raw);
    
    // Auto-migrate legacy plaintext passwords to salted PBKDF2 hashes
    let migrated = false;
    (db.pilgrims || []).forEach(p => {
      if (p.passwordHash && !p.salt) {
        const { hash, salt } = hashPassword(p.passwordHash);
        p.passwordHash = hash;
        p.salt = salt;
        migrated = true;
      }
    });
    (db.couriers || []).forEach(c => {
      if (c.passwordHash && !c.salt) {
        const { hash, salt } = hashPassword(c.passwordHash);
        c.passwordHash = hash;
        c.salt = salt;
        migrated = true;
      }
    });

    db.customHostels = db.customHostels || [];
    db.productOrders = db.productOrders || [];
    if (!Array.isArray(db.shells)) {
      const defaultBatch = [
        'VIEIRA-SMARTSHELL-S3-9982',
        'VIEIRA-SMARTSHELL-S3-9983',
        'VIEIRA-SMARTSHELL-S3-1001',
        'VIEIRA-SMARTSHELL-S3-1002',
        'VIEIRA-SMARTSHELL-S3-1003',
        'VIEIRA-SMARTSHELL-S3-1004',
        'VIEIRA-SMARTSHELL-S3-1005',
        'VIEIRA-SMARTSHELL-S3-1006',
        'VIEIRA-SMARTSHELL-S3-1007',
        'VIEIRA-SMARTSHELL-S3-1008',
        'VIEIRA-SMARTSHELL-S3-1009',
        'VIEIRA-SMARTSHELL-S3-1010'
      ];
      db.shells = defaultBatch.map(id => ({ id, status: 'available', linkedEmail: null, batch: 'Inicial', createdAt: new Date().toISOString() }));
      migrated = true;
    }
    // Ensure any already-registered pilgrim shell IDs are tracked in db.shells
    (db.pilgrims || []).forEach(p => {
      const sid = (p.smartVieiraId || '').trim().toUpperCase();
      if (!sid) return;
      const found = db.shells.find(s => (s.id || '').toUpperCase() === sid);
      if (!found) {
        db.shells.push({ id: sid, status: 'linked', linkedEmail: p.email, batch: 'Migrada', createdAt: p.createdAt || new Date().toISOString() });
        migrated = true;
      } else if (found.status !== 'linked') {
        found.status = 'linked';
        found.linkedEmail = p.email;
        migrated = true;
      }
    });
    if (migrated) saveDb(db);
    return db;
  } catch (err) {
    console.error('[DB LOAD ERROR]', err);
    return { pilgrims: [], couriers: [], reservations: [] };
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB SAVE ERROR]', err);
  }
}

// =========================================================================
// STRIPE REST API CALLS
// =========================================================================
function callStripeApi(endpoint, postData) {
  return new Promise((resolve, reject) => {
    const payload = querystring.stringify(postData);
    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path: endpoint,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(parsed.error || { message: 'Stripe API error' });
          }
        } catch (e) {
          reject({ message: 'Invalid Stripe JSON response' });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

// =========================================================================
// SAFE PAYLOAD PARSER WITH SIZE LIMIT (MAX 100 KB)
// =========================================================================
// =========================================================================
// NATIVE TLS SMTP + HTTPS PORT 443 EMAIL SENDER (ZERO EXTERNAL DEPENDENCIES)
// =========================================================================
function sendSmtpEmail({ host, port = 465, user, pass, to, subject, bodyText }) {
  return new Promise((resolve, reject) => {
    const smtpHost = (host || 'smtp.gmail.com').trim();
    const cleanPass = (pass || '').trim();
    const resendKey = process.env.RESEND_API_KEY || (cleanPass.startsWith('re_') ? cleanPass : '');

    // 0. Resend HTTPS API Mode (Port 443 - works reliably on Render Free)
    if (resendKey && (smtpHost.toLowerCase() === 'resend' || cleanPass.startsWith('re_') || process.env.RESEND_API_KEY)) {
      const fromAddr = (user && user.includes('@')) ? user.trim() : 'SmartVieira <onboarding@resend.dev>';
      const payload = JSON.stringify({ from: fromAddr, to: [to], subject, text: bodyText });
      const req = https.request({
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + resendKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let respBody = '';
        res.on('data', c => respBody += c);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(true);
          } else {
            reject(new Error('Resend HTTP ' + res.statusCode + ': ' + respBody.slice(0, 180)));
          }
        });
      });
      req.on('error', err => reject(err));
      req.write(payload);
      req.end();
      return;
    }

    // 1. HTTPS Port 443 Bridge Mode (Google Apps Script / Webhook - bypasses Render Free SMTP port block)
    if (smtpHost.startsWith('https://')) {
      try {
        const parsedUrl = new URL(smtpHost);
        const payload = JSON.stringify({ to, subject, body: bodyText, from: user || 'SmartVieira' });
        const req = https.request({
          hostname: parsedUrl.hostname,
          port: 443,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (res) => {
          let respBody = '';
          res.on('data', c => respBody += c);
          res.on('end', () => {
            const loc = res.headers.location || '';
            if (loc.includes('accounts.google.com')) {
              return reject(new Error('En Google Apps Script debes elegir "Cualquier persona" en Quién tiene acceso'));
            }
            if (res.statusCode >= 200 && res.statusCode < 400) {
              resolve(true);
            } else {
              reject(new Error('HTTPS Relay HTTP ' + res.statusCode));
            }
          });
        });
        req.on('error', (err) => reject(err));
        req.write(payload);
        req.end();
      } catch (errUrl) {
        reject(errUrl);
      }
      return;
    }

    // 2. Standard Direct TLS SMTP (Port 465, forced IPv4)
    if (!user || !pass) {
      return reject(new Error('SMTP_NOT_CONFIGURED'));
    }
    const socket = tls.connect({
      port,
      host: smtpHost,
      servername: smtpHost,
      family: 4,
      rejectUnauthorized: false
    });
    let step = 0;
    let buffer = '';

    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('SMTP puerto 465 bloqueado por el servidor cloud (Render Free)'));
    }, 10000);

    const sendLine = (line) => {
      socket.write(line + '\r\n');
    };

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      if (!buffer.endsWith('\r\n')) return;
      const lines = buffer.trim().split('\r\n');
      const lastLine = lines[lines.length - 1];
      if (lastLine.length >= 4 && lastLine[3] === '-') return; // wait for multi-line end
      const code = parseInt(lastLine.substring(0, 3), 10);
      buffer = '';

      if (code >= 400) {
        clearTimeout(timeout);
        socket.end();
        return reject(new Error('SMTP error: ' + lastLine));
      }

      if (step === 0 && code === 220) {
        step = 1;
        sendLine('EHLO smartvieira.com');
      } else if (step === 1 && code === 250) {
        step = 2;
        sendLine('AUTH LOGIN');
      } else if (step === 2 && code === 334) {
        step = 3;
        sendLine(Buffer.from(user).toString('base64'));
      } else if (step === 3 && code === 334) {
        step = 4;
        sendLine(Buffer.from(pass.replace(/\s+/g, '')).toString('base64'));
      } else if (step === 4 && code === 235) {
        step = 5;
        sendLine('MAIL FROM:<' + user + '>');
      } else if (step === 5 && code === 250) {
        step = 6;
        sendLine('RCPT TO:<' + to + '>');
      } else if (step === 6 && code === 250) {
        step = 7;
        sendLine('DATA');
      } else if (step === 7 && code === 354) {
        step = 8;
        const msg = [
          'From: "SmartVieira Soporte" <' + user + '>',
          'To: <' + to + '>',
          'Subject: =?UTF-8?B?' + Buffer.from(subject).toString('base64') + '?=',
          'MIME-Version: 1.0',
          'Content-Type: text/plain; charset=UTF-8',
          'Content-Transfer-Encoding: 8bit',
          '',
          bodyText,
          '.'
        ].join('\r\n');
        sendLine(msg);
      } else if (step === 8 && code === 250) {
        step = 9;
        sendLine('QUIT');
        clearTimeout(timeout);
        socket.end();
        resolve(true);
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(err.message || err.code || 'Error de red SMTP'));
    });
  });
}

function parseRequestBody(req, maxBytes = 102400) {
  return new Promise((resolve, reject) => {
    let body = '';
    let received = 0;
    req.on('data', chunk => {
      received += chunk.length;
      if (received > maxBytes) {
        req.destroy();
        reject(new Error('PAYLOAD_TOO_LARGE'));
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', err => reject(err));
  });
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.apk': 'application/vnd.android.package-archive'
};

// =========================================================================
// HTTP SERVER & API ROUTES
// =========================================================================
const server = http.createServer(async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  // 1. Rate Limiting Check (Anti-DoS)
  if (!checkRateLimit(clientIp, 120, 60000)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, message: 'Demasiadas peticiones. Por favor espera un minuto.' }));
  }

  // 2. Set CORS & Security Headers
  const ALLOWED_ORIGINS = ['https://www.smartvieira.com', 'https://smartvieira.com', 'https://app.smartvieira.com', 'https://app.local', 'http://app.local', 'https://localhost', 'capacitor://localhost', 'http://localhost', 'http://127.0.0.1:3000', 'http://localhost:3000'];
  const reqOrigin = req.headers.origin;
  if (reqOrigin && (ALLOWED_ORIGINS.includes(reqOrigin) || reqOrigin.startsWith('http://localhost:') || reqOrigin.startsWith('http://127.0.0.1:'))) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.smartvieira.com');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(self), microphone=()');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const [reqPath, queryString] = req.url.split('?');
  const queryParams = querystring.parse(queryString || '');

  // ── HEALTH CHECK ENDPOINT (CLOUD LB & MONITORING) ────────────────────
  if (reqPath === '/health' || reqPath === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString(), uptime: process.uptime() }));
  }

  // ── 1. REGISTER PILGRIM ───────────────────────────────────────────────
  
  // ADMIN SECURE ENDPOINTS & CREDENTIALS
  const ADMIN_CREDENTIALS = {
    user: process.env.ADMIN_USER || 'admin',
    pass: process.env.ADMIN_PASS || 'admin'
  };
  if (ADMIN_CREDENTIALS.pass === 'admin') {
    console.warn('[SECURITY WARN] ADMIN_PASS usa valor por defecto; configura ADMIN_USER y ADMIN_PASS en producción.');
  }

  function getBearerDecoded(req, qParams = {}) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim() || qParams.token;
    return token ? verifyToken(token) : null;
  }

  function verifyAdminAuth(req, qParams = {}) {
    const decoded = getBearerDecoded(req, qParams);
    return !!(decoded && decoded.role === 'admin');
  }

  function verifyCourierAuth(req, targetCourierId = null, targetCompany = null) {
    const decoded = getBearerDecoded(req);
    if (!decoded) return { ok: false, decoded: null };
    if (decoded.role === 'admin') return { ok: true, decoded };
    if (decoded.role !== 'courier') return { ok: false, decoded };
    if (targetCourierId && decoded.id && decoded.id !== targetCourierId) return { ok: false, decoded };
    if (targetCompany && decoded.companyName && decoded.companyName.toLowerCase() !== String(targetCompany).trim().toLowerCase()) return { ok: false, decoded };
    return { ok: true, decoded };
  }

  function verifyPilgrimAuth(req, targetEmail = null) {
    const decoded = getBearerDecoded(req);
    if (!decoded) return { ok: false, decoded: null };
    if (decoded.role === 'admin') return { ok: true, decoded };
    if (decoded.role !== 'pilgrim') return { ok: false, decoded };
    if (targetEmail && decoded.email && decoded.email.toLowerCase() !== String(targetEmail).trim().toLowerCase()) return { ok: false, decoded };
    return { ok: true, decoded };
  }

  // Backwards compatibility alias
  function isAdminValid(req, qParams) {
    return verifyAdminAuth(req, qParams);
  }

  if (reqPath === '/api/admin/login' && req.method === 'POST') {
    if (!checkRateLimit('auth_admin_' + clientIp, 12, 900000)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Demasiados intentos de acceso. Espera 15 minutos.' }));
    }
    try {
      const body = await parseRequestBody(req);
      const user = (body.user || '').trim().toLowerCase();
      const pass = (body.pass || '').trim();
      const expectedUser = Buffer.from(ADMIN_CREDENTIALS.user.toLowerCase(), 'utf8');
      const gotUser = Buffer.from(user, 'utf8');
      const expectedPass = Buffer.from(ADMIN_CREDENTIALS.pass, 'utf8');
      const gotPass = Buffer.from(pass, 'utf8');
      const userOk = expectedUser.length === gotUser.length && crypto.timingSafeEqual(expectedUser, gotUser);
      const passOk = expectedPass.length === gotPass.length && crypto.timingSafeEqual(expectedPass, gotPass);
      if (userOk && passOk) {
        const token = generateToken({ role: 'admin', user: ADMIN_CREDENTIALS.user });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, token: token }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Credenciales incorrectas' }));
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Error del servidor' }));
    }
  }

  if (reqPath === '/api/admin/database-secure' && req.method === 'GET') {
    if (!isAdminValid(req, queryParams)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'No autorizado' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, database: loadDb() }));
  }

  if (reqPath === '/api/admin/backup-secure' && req.method === 'GET') {
    if (!verifyAdminAuth(req, queryParams)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'No autorizado' }));
    }
    try {
      const dbData = fs.readFileSync(DB_FILE, 'utf8');
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="smartvieira_backup_' + Date.now() + '.json"'
      });
      return res.end(dbData);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Error leyendo copia de seguridad' }));
    }
  }

  if (reqPath === '/api/admin/load-demo-db' && req.method === 'POST') {
    if (!isAdminValid(req, queryParams)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
    }
    try {
      const demoPath = path.join(PUBLIC_DIR, 'demo-database.json');
      const demoData = JSON.parse(fs.readFileSync(demoPath, 'utf8'));
      const currentDb = loadDb();

      const existingPilgrimEmails = new Set((currentDb.pilgrims || []).map(p => (p.email || '').toLowerCase().trim()));
      const existingCourierEmails = new Set((currentDb.couriers || []).map(c => (c.email || '').toLowerCase().trim()));
      const existingResIds = new Set((currentDb.reservations || []).map(r => r.id));

      let addedPilgrims = 0;
      (demoData.pilgrims || []).forEach(p => {
        const em = (p.email || '').toLowerCase().trim();
        if (em && !existingPilgrimEmails.has(em)) {
          currentDb.pilgrims.push(p);
          existingPilgrimEmails.add(em);
          addedPilgrims++;
        }
      });

      let addedCouriers = 0;
      (demoData.couriers || []).forEach(c => {
        const em = (c.email || '').toLowerCase().trim();
        if (em && !existingCourierEmails.has(em)) {
          currentDb.couriers.push(c);
          existingCourierEmails.add(em);
          addedCouriers++;
        }
      });

      (demoData.reservations || []).forEach(r => {
        if (r.id && !existingResIds.has(r.id)) {
          currentDb.reservations.push(r);
          existingResIds.add(r.id);
        }
      });

      saveDb(currentDb);
      loadDb(); // Sync any new shell IDs into db.shells
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        merged: true,
        addedCouriers,
        addedPilgrims,
        couriersCount: (currentDb.couriers || []).length,
        pilgrimsCount: (currentDb.pilgrims || []).length
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: e.message }));
    }
  }

  if (reqPath === '/api/admin/restore-secure' && req.method === 'POST') {
    if (!isAdminValid(req, queryParams)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'No autorizado' }));
    }
    try {
      const backupData = await parseRequestBody(req);
      if (!backupData.pilgrims || !backupData.couriers) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Formato de backup inv�lido' }));
      }
      const curDb = loadDb();
      if (!backupData.smtpConfig && curDb.smtpConfig) backupData.smtpConfig = curDb.smtpConfig;
      fs.writeFileSync(DB_FILE, JSON.stringify(backupData, null, 2), 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'Base de datos restaurada' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Error del servidor' }));
    }
  }


    if (reqPath === '/api/register/pilgrim' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { name, surname, language, email, password, smartVieiraId } = body;

      if (!name || !email || !password || !smartVieiraId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Faltan campos obligatorios (nombre, email, contraseña, ID de concha)' }));
      }

      const db = loadDb();
      const cleanShellId = String(smartVieiraId).trim().toUpperCase();
      let shellRecord = (db.shells || []).find(s => (s.id || '').trim().toUpperCase() === cleanShellId);
      if (!shellRecord) {
        if (STRICT_SHELL_VALIDATION) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, message: `El ID "${cleanShellId}" no corresponde a ninguna concha SmartVieira vendida.` }));
        }
        db.shells = db.shells || [];
        shellRecord = { id: cleanShellId, status: 'available', linkedEmail: null, batch: 'Prueba Cerrada', createdAt: new Date().toISOString() };
        db.shells.push(shellRecord);
      }
      if (STRICT_SHELL_VALIDATION && shellRecord.status === 'linked' && shellRecord.linkedEmail && shellRecord.linkedEmail.toLowerCase() !== email.toLowerCase().trim()) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: `La concha "${cleanShellId}" ya está vinculada a otra cuenta.` }));
      }

      const existing = db.pilgrims.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Este correo electrónico ya está registrado' }));
      }

      const { hash, salt } = hashPassword(password);
      const newPilgrim = {
        id: 'pilgrim-' + Date.now(),
        name: name.trim(),
        surname: (surname || '').trim(),
        phone: (body.phone || '').trim(),
        language: language || 'es',
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        salt: salt,
        smartVieiraId: cleanShellId,
        createdAt: new Date().toISOString()
      };

      db.pilgrims.push(newPilgrim);
      shellRecord.status = 'linked';
      shellRecord.linkedEmail = newPilgrim.email;
      shellRecord.linkedAt = new Date().toISOString();
      saveDb(db);

      const token = generateToken({ role: 'pilgrim', email: newPilgrim.email, id: newPilgrim.id });
      console.log(`[DB] Registered Pilgrim securely: ${email}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: '¡Registro de Peregrino completado con éxito!',
        token: token,
        user: {
          name: newPilgrim.name,
          surname: newPilgrim.surname,
          email: newPilgrim.email,
          language: newPilgrim.language,
          smartVieiraId: newPilgrim.smartVieiraId
        }
      }));
    } catch (err) {
      const code = err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 500;
      res.writeHead(code, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error procesando registro' }));
    }
  }

  // ── 2. LOGIN PILGRIM ──────────────────────────────────────────────────
  if (reqPath === '/api/login/pilgrim' && req.method === 'POST') {
    if (!checkRateLimit('auth_pilgrim_' + clientIp, 15, 900000)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Demasiados intentos de acceso. Espera unos minutos.' }));
    }
    try {
      const body = await parseRequestBody(req);
      const { email, password } = body;

      const db = loadDb();
      const pilgrim = db.pilgrims.find(p => p.email.toLowerCase() === (email || '').toLowerCase().trim());

      let valid = false;
      if (pilgrim) {
        if (pilgrim.passwordPlain && pilgrim.passwordPlain === password) {
          valid = true;
        } else if (pilgrim.salt) {
          valid = verifyPassword(password, pilgrim.passwordHash, pilgrim.salt);
        } else {
          valid = pilgrim.passwordHash === password;
        }
      }

      if (!valid) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Correo o contraseña incorrectos' }));
      }

      

      const token = generateToken({ role: 'pilgrim', email: pilgrim.email, id: pilgrim.id });
      console.log(`[DB] Pilgrim Secure Login: ${email}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: '¡Sesión iniciada correctamente!',
        token: token,
        user: {
          name: pilgrim.name,
          surname: pilgrim.surname,
          email: pilgrim.email,
          language: pilgrim.language,
          smartVieiraId: pilgrim.smartVieiraId
        }
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error procesando login' }));
    }
  }

  // ── 3. REGISTER COURIER (EMPRESA DE REPARTIDOR) ───────────────────────
  if (reqPath === '/api/register/courier' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { companyName, driverName, vehicle, routes, routeStart, routeEnd, accessCode, email, password, cif, pricePerBag, phone } = body;

      if (!companyName || !driverName || !email || !password || !accessCode) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Faltan campos obligatorios' }));
      }

      if ((accessCode || '').trim() !== DEFAULT_COURIER_ACCESS_CODE) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Código de acceso privado de empresa incorrecto' }));
      }

      const db = loadDb();
      const existing = db.couriers.find(c => c.email.toLowerCase() === email.toLowerCase().trim());
      if (existing) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Este correo de repartidor ya está registrado' }));
      }

      const { hash, salt } = hashPassword(password);
      const newCourier = {
        id: 'courier-' + Date.now(),
        companyName: companyName.trim(),
        driverName: driverName.trim(),
        vehicle: (vehicle || 'Furgón de Etapa').trim(),
        routes: routes || 'Camino Inglés',
        routeStart: (routeStart || '').trim(),
        routeEnd: (routeEnd || '').trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hash,
        salt: salt,
        accessCode: accessCode.trim(),
          cif: cif || '',
          pricePerBag: pricePerBag || 6.50,
          phone: (phone || '').trim(),
          isActive: true,
        createdAt: new Date().toISOString()
      };

      db.couriers.push(newCourier);
      saveDb(db);

      const token = generateToken({ role: 'courier', id: newCourier.id, email: newCourier.email, companyName: newCourier.companyName });
      console.log(`[DB] Registered Courier Company: ${companyName} (${driverName})`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: '¡Registro de Empresa Repartidora autorizado con éxito!',
        token: token,
        courier: {
          id: newCourier.id,
          companyName: newCourier.companyName,
          driverName: newCourier.driverName,
          vehicle: newCourier.vehicle,
          routes: newCourier.routes,
          routeStart: newCourier.routeStart,
          routeEnd: newCourier.routeEnd,
          email: newCourier.email,
          isActive: newCourier.isActive
        }
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error procesando registro de repartidor' }));
    }
  }

  // ── 4. LOGIN COURIER ──────────────────────────────────────────────────
  if (reqPath === '/api/login/courier' && req.method === 'POST') {
    if (!checkRateLimit('auth_courier_' + clientIp, 15, 900000)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Demasiados intentos de acceso. Espera unos minutos.' }));
    }
    try {
      const body = await parseRequestBody(req);
      const { email, password } = body;

      const db = loadDb();
      const courier = db.couriers.find(c => c.email.toLowerCase() === (email || '').toLowerCase().trim());

      let valid = false;
      if (courier) {
        if (courier.passwordPlain && courier.passwordPlain === password) {
          valid = true;
        } else if (courier.salt) {
          valid = verifyPassword(password, courier.passwordHash, courier.salt);
        } else {
          valid = courier.passwordHash === password;
        }
      }

      if (!valid) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Correo o contraseña de repartidor incorrectos' }));
      }

      

      const token = generateToken({ role: 'courier', id: courier.id, email: courier.email, companyName: courier.companyName });
      console.log(`[DB] Secure Courier Login: ${email}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: '¡Bienvenido al Panel de Transporte!',
        token: token,
        courier: {
          id: courier.id,
          companyName: courier.companyName,
          driverName: courier.driverName,
          vehicle: courier.vehicle,
          routes: courier.routes,
          email: courier.email,
          isActive: courier.isActive
        }
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error procesando login de repartidor' }));
    }
  }

  // ── PASSWORD RECOVERY (PILGRIM & COURIER) + EMAIL SENDING ───────────
  if (reqPath === '/api/recover-password' && req.method === 'POST') {
    if (!checkRateLimit('auth_recover_' + clientIp, 6, 900000)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Demasiadas solicitudes de recuperación. Espera 15 minutos.' }));
    }
    try {
      const body = await parseRequestBody(req);
      const email = (body.email || '').toLowerCase().trim();
      const role = body.role || 'any';

      if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Introduce tu correo electrónico.' }));
      }

      const db = loadDb();
      let targetUser = null;
      let userTypeLabel = 'Peregrino';

      if (role === 'courier') {
        targetUser = (db.couriers || []).find(c => (c.email || '').toLowerCase().trim() === email);
        userTypeLabel = 'Empresa Repartidora';
      } else if (role === 'pilgrim') {
        targetUser = (db.pilgrims || []).find(p => (p.email || '').toLowerCase().trim() === email);
        userTypeLabel = 'Peregrino';
      } else {
        targetUser = (db.pilgrims || []).find(p => (p.email || '').toLowerCase().trim() === email);
        if (!targetUser) {
          targetUser = (db.couriers || []).find(c => (c.email || '').toLowerCase().trim() === email);
          userTypeLabel = 'Empresa Repartidora';
        }
      }

      // Only overwrite password if email transport is actually configured and succeeds
      if (targetUser) {
        const smtpCfg = db.smtpConfig || {};
        const smtpUser = process.env.SMTP_USER || smtpCfg.user || '';
        const smtpPass = process.env.SMTP_PASS || smtpCfg.pass || '';
        const smtpHost = process.env.SMTP_HOST || smtpCfg.host || 'smtp.gmail.com';
        const hasMailTransport = Boolean(process.env.RESEND_API_KEY || (smtpPass && smtpPass.startsWith('re_')) || smtpHost.startsWith('https://') || (smtpUser && smtpPass));

        if (!hasMailTransport) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            message: 'El envío automático de correo aún no está configurado en el servidor. Configúralo en el Panel Admin (Resend / Google Script) o contacta soporte.'
          }));
        }

        const tempPassword = 'Vieira-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const displayName = targetUser.name || targetUser.driverName || targetUser.companyName || 'Usuario';
        const subject = 'Nueva Contraseña Temporal - SmartVieira (' + userTypeLabel + ')';
        const bodyText = [
          'Hola ' + displayName + ',',
          '',
          'Has solicitado recuperar el acceso a tu cuenta de SmartVieira (' + userTypeLabel + ').',
          '',
          '📧 Correo: ' + targetUser.email,
          '🔑 Tu Nueva Contraseña Temporal: ' + tempPassword,
          '',
          'Por seguridad, te recomendamos cambiarla tras iniciar sesión.',
          '¡Buen Camino!',
          'Equipo SmartVieira'
        ].join('\r\n');

        try {
          await sendSmtpEmail({
            host: smtpHost,
            port: 465,
            user: smtpUser,
            pass: smtpPass,
            to: targetUser.email,
            subject,
            bodyText
          });
          // Email delivered successfully -> now persist the new temporary password hash
          const { hash, salt } = hashPassword(tempPassword);
          targetUser.passwordHash = hash;
          targetUser.salt = salt;
          delete targetUser.passwordPlain;
          targetUser.lastPasswordRecoveryAt = new Date().toISOString();
          saveDb(db);
          console.log(`[AUTH] Email de recuperación enviado a: ${targetUser.email}`);
        } catch (errSmtp) {
          console.error('[AUTH SMTP ERROR]', errSmtp.message);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            message: 'No se pudo enviar el correo de recuperación (' + errSmtp.message + '). Tu contraseña actual sigue intacta.'
          }));
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: '✅ Si el correo está registrado en SmartVieira, te hemos enviado una nueva contraseña temporal. Revisa tu bandeja de entrada y Spam.'
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error procesando solicitud de recuperación.' }));
    }
  }

    if (reqPath === '/api/user/profile' && req.method === 'GET') {
    const email = queryParams.email;
    const db = loadDb();
    const pilgrim = db.pilgrims.find(p => p.email.toLowerCase() === (email || '').toLowerCase());

    const userReservations = db.reservations.filter(r => r.pilgrimEmail.toLowerCase() === (email || '').toLowerCase());

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      pilgrim: pilgrim ? {
        name: pilgrim.name,
        surname: pilgrim.surname,
        email: pilgrim.email,
        language: pilgrim.language,
        smartVieiraId: pilgrim.smartVieiraId
      } : null,
      reservations: userReservations
    }));
  }

  // ── 6. GET ALL ACTIVE RESERVATIONS (FOR COURIERS) ─────────────────────
  
  // -- COURIER STATUS UPDATE ---------------------------------------
  if (reqPath === '/api/courier/status' && req.method === 'POST') {
    let bodyObj;
    try { bodyObj = await parseRequestBody(req); } catch(e) { return res.end(JSON.stringify({success:false})); }
    if (!verifyCourierAuth(req, bodyObj.courierId).ok) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Sesión de repartidor no autorizada' }));
    }
    
    const db = loadDb();
    const courier = db.couriers.find(c => c.id === bodyObj.courierId);
    if(courier) {
      courier.isActive = bodyObj.isActive;
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true }));
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, message: 'Repartidor no encontrado' }));
  }

  // -- COURIER EMERGENCY -------------------------------------------
  if (reqPath === '/api/courier/emergency' && req.method === 'POST') {
    let bodyObj;
    try { bodyObj = await parseRequestBody(req); } catch(e) { return res.end(JSON.stringify({success:false})); }
    if (!verifyCourierAuth(req, bodyObj.courierId).ok) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Sesión de repartidor no autorizada' }));
    }

    const db = loadDb();
    const courier = db.couriers.find(c => c.id === bodyObj.courierId);
    if(courier) {
      db.emergencies = db.emergencies || [];
      db.emergencies.push({
        id: 'em_' + Date.now(),
        courierId: courier.id,
        companyName: courier.companyName,
        driverName: courier.driverName,
        phone: courier.phone,
        timestamp: new Date().toISOString(),
        resolved: false
      });
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true }));
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, message: 'Repartidor no encontrado' }));
  }

  if (reqPath === '/api/courier/reservations' && req.method === 'GET') {
    const authRes = verifyCourierAuth(req);
    if (!authRes.ok) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
    }
    const db = loadDb();
    const decoded = authRes.decoded;

    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const filterCompany = (urlObj.searchParams.get('companyName') || (decoded && decoded.companyName) || '').trim().toLowerCase();

    let list = db.reservations || [];
    // If admin token, return all. If courier company, return only their bookings
    if (decoded && decoded.role === 'admin') {
      // Return full list for admin
    } else if (filterCompany) {
      list = list.filter(r => {
        if (!r) return false;
        const rComp = (r.companyName || '').trim().toLowerCase();
        return rComp === filterCompany || rComp === 'empresa repartidora' || !rComp;
      });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      reservations: list
    }));
  }

  // ── COURIER PUSH SUBSCRIPTION REGISTRATION ────────────────────────
  if (reqPath === '/api/courier/push-subscription' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { courierId, companyName, subscription, permission } = body;
      const db = loadDb();
      db.courierPushSubscriptions = db.courierPushSubscriptions || [];

      // Remove existing for this courierId
      db.courierPushSubscriptions = db.courierPushSubscriptions.filter(s =>
        s.courierId !== courierId
      );

      db.courierPushSubscriptions.push({
        courierId: courierId || 'anonymous',
        companyName: (companyName || '').trim(),
        subscription: subscription || null,
        permission: permission || 'granted',
        updatedAt: new Date().toISOString()
      });

      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'Suscripción de avisos guardada con éxito' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error procesando suscripción' }));
    }
  }

  // ── GET COURIER PENDING NOTIFICATIONS & MORNING DIGEST (08:00 AM) ──
  if (reqPath === '/api/courier/pending-notifications' && req.method === 'GET') {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const companyName = (urlObj.searchParams.get('companyName') || '').trim();
      if (!verifyCourierAuth(req, null, companyName || null).ok) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
      }
      const db = loadDb();
      db.courierNotifications = db.courierNotifications || [];

      // 1. Morning Digest Generator (Active between 07:00 and 12:00)
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const morningDigestKey = `MORNING_${todayStr}_${companyName.toLowerCase()}`;

      if (companyName && now.getHours() >= 7 && now.getHours() <= 12) {
        db.morningDigestsDelivered = db.morningDigestsDelivered || [];
        if (!db.morningDigestsDelivered.includes(morningDigestKey)) {
          const todayBookings = (db.reservations || []).filter(r => {
            if (!r) return false;
            const rComp = r.companyName ? String(r.companyName).trim().toLowerCase() : '';
            const myComp = companyName.toLowerCase();
            return (rComp === myComp || rComp === 'empresa repartidora') && r.status !== 'ENTREGADA';
          });

          if (todayBookings.length > 0) {
            db.courierNotifications.push({
              id: 'DIGEST-' + Date.now(),
              targetCompany: companyName,
              title: '☀️ SmartVieira • Resumen Matutino (08:00 AM)',
              body: `¡Buenos días! Tienes ${todayBookings.length} mochila(s) contratadas para hoy en tu ruta.`,
              type: 'MORNING_DIGEST',
              createdAt: new Date().toISOString(),
              delivered: false
            });
            db.morningDigestsDelivered.push(morningDigestKey);
          }
        }
      }

      // 2. Filter pending notifications for this courier company
      const pending = db.courierNotifications.filter(n => {
        if (n.delivered) return false;
        if (!companyName) return true;
        const target = (n.targetCompany || '').trim().toLowerCase();
        return target === companyName.toLowerCase() || target === 'empresa repartidora' || !target;
      });

      // Mark as delivered and save
      if (pending.length > 0) {
        pending.forEach(n => { n.delivered = true; });
        saveDb(db);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        notifications: pending
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error obteniendo notificaciones' }));
    }
  }


  // ── COURIER PICKUP (MARK BACKPACKS EN_CAMINO & NOTIFY PILGRIM) ──
  if (reqPath === '/api/courier/pickup' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { courierId, smartVieiraIds } = body;
      if (!verifyCourierAuth(req, courierId).ok) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Sesión de repartidor no autorizada' }));
      }
      const db = loadDb();
      const courier = db.couriers.find(c => c.id === courierId);
      if (!courier) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Repartidor no encontrado' }));
      }

      const idsToPickup = (smartVieiraIds || []).map(id => id.trim().toUpperCase());
      db.notifications = db.notifications || [];
      let updatedCount = 0;
      const updatedReservations = [];

      db.reservations.forEach(r => {
        const rId = (r.smartVieiraId || '').trim().toUpperCase();
        if (idsToPickup.includes(rId) && r.status !== 'ENTREGADA') {
          r.status = 'EN_CAMINO';
          r.pickedUpAt = new Date().toISOString();
          r.courierId = courier.id;
          r.driverName = courier.driverName;
          r.courierCompanyName = courier.companyName;
          updatedCount++;
          updatedReservations.push(r.id);

          // Create Notification 1 for Pilgrim
          db.notifications.push({
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            pilgrimEmail: (r.pilgrimEmail || '').toLowerCase(),
            reservationId: r.id,
            smartVieiraId: r.smartVieiraId,
            type: 'PICKUP',
            title: '🎒 ¡Tu mochila está en camino!',
            body: 'El transportista (' + courier.driverName + ' - ' + courier.companyName + ') ha recogido tu SmartVieira (' + r.smartVieiraId + ') en ' + r.originAlbergue + ' y va en ruta hacia ' + r.destinationAlbergue + '.',
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      });

      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: 'Se han marcado ' + updatedCount + ' mochilas en camino.',
        updatedCount,
        updatedReservations
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: e.message }));
    }
  }

  // ── COURIER LIVE LOCATION UPDATE ────────────────────────────────
  if (reqPath === '/api/courier/location' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { courierId, lat, lng, accuracy } = body;
      if (!verifyCourierAuth(req, courierId).ok) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Sesión de repartidor no autorizada' }));
      }
      const db = loadDb();
      const courier = db.couriers.find(c => c.id === courierId);
      if (!courier) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Repartidor no encontrado' }));
      }

      const locObj = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        accuracy: parseFloat(accuracy) || 0,
        updatedAt: new Date().toISOString()
      };

      courier.currentLocation = locObj;

      let activeBackpacks = 0;
      db.reservations.forEach(r => {
        if (r.courierId === courierId && r.status === 'EN_CAMINO') {
          r.currentLocation = locObj;
          activeBackpacks++;
        }
      });

      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, activeBackpacks, location: locObj }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: e.message }));
    }
  }

  // ── COURIER DROPOFF / DELIVERY CONFIRMATION ─────────────────────
  if (reqPath === '/api/courier/delivery' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { courierId, destinationAlbergue, lat, lng } = body;
      if (!verifyCourierAuth(req, courierId).ok) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Sesión de repartidor no autorizada' }));
      }
      const db = loadDb();
      const courier = db.couriers.find(c => c.id === courierId);
      if (!courier) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Repartidor no encontrado' }));
      }

      const targetHostel = (destinationAlbergue || '').trim().toLowerCase();
      const nowIso = new Date().toISOString();
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      const deliveryLoc = {
        lat: (!isNaN(parsedLat) && parsedLat !== 0) ? parsedLat : (courier.currentLocation ? courier.currentLocation.lat : null),
        lng: (!isNaN(parsedLng) && parsedLng !== 0) ? parsedLng : (courier.currentLocation ? courier.currentLocation.lng : null),
        hostelName: destinationAlbergue,
        timestamp: nowIso
      };

      db.notifications = db.notifications || [];
      let deliveredCount = 0;
      const deliveredReservations = [];

      db.reservations.forEach(r => {
        const rDest = (r.destinationAlbergue || '').trim().toLowerCase();
        const isCourierMatch = (r.courierId === courierId) ||
          (!r.courierId && r.companyName && r.companyName.toLowerCase() === courier.companyName.toLowerCase());

        if (rDest === targetHostel && r.status === 'EN_CAMINO' && isCourierMatch) {
          r.status = 'ENTREGADA';
          r.deliveredAt = nowIso;
          r.deliveredLocation = deliveryLoc;
          delete r.currentLocation;
          deliveredCount++;
          deliveredReservations.push(r.id);

          // Create Notification 2 for Pilgrim
          db.notifications.push({
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            pilgrimEmail: (r.pilgrimEmail || '').toLowerCase(),
            reservationId: r.id,
            smartVieiraId: r.smartVieiraId,
            type: 'DELIVERY',
            title: '🏁 ¡Tu mochila ha sido entregada!',
            body: 'Tu SmartVieira (' + r.smartVieiraId + ') ha sido entregada con éxito en ' + destinationAlbergue + '. Puedes ver el punto de entrega en el mapa.',
            timestamp: nowIso,
            read: false
          });
        }
      });

      const remainingEnCamino = db.reservations.filter(r => r.courierId === courierId && r.status === 'EN_CAMINO').length;

      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: 'Se han entregado ' + deliveredCount + ' mochilas en ' + destinationAlbergue + '.',
        deliveredCount,
        deliveredReservations,
        remainingEnCamino,
        deliveryLoc
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: e.message }));
    }
  }

  // ── PILGRIM TRACKING DETAIL ─────────────────────────────────────
  if (reqPath === '/api/pilgrim/tracking' && req.method === 'GET') {
    const reservationId = queryParams.reservationId;
    const db = loadDb();
    const resv = db.reservations.find(r => r.id === reservationId);
    if (!resv) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Reserva no encontrada' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      reservation: {
        id: resv.id,
        smartVieiraId: resv.smartVieiraId,
        status: resv.status || 'PAID',
        originAlbergue: resv.originAlbergue,
        destinationAlbergue: resv.destinationAlbergue,
        companyName: resv.companyName,
        driverName: resv.driverName,
        pickedUpAt: resv.pickedUpAt,
        deliveredAt: resv.deliveredAt,
        currentLocation: resv.currentLocation,
        deliveredLocation: resv.deliveredLocation
      }
    }));
  }

  // ── PILGRIM NOTIFICATIONS ───────────────────────────────────────
  if (reqPath === '/api/pilgrim/notifications' && req.method === 'GET') {
    const email = (queryParams.email || '').toLowerCase();
    if (!verifyPilgrimAuth(req, email).ok) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Sesión de peregrino no autorizada' }));
    }
    const db = loadDb();
    const notifs = (db.notifications || []).filter(n => n.pilgrimEmail === email);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, notifications: notifs }));
  }

  // ── PILGRIM MARK NOTIFICATIONS READ ─────────────────────────────
  if (reqPath === '/api/pilgrim/notifications/read' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const email = (body.email || '').toLowerCase();
      if (!verifyPilgrimAuth(req, email).ok) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Sesión de peregrino no autorizada' }));
      }
      const notifIds = body.notificationIds || [];
      const db = loadDb();
      if (db.notifications) {
        db.notifications.forEach(n => {
          if (n.pilgrimEmail === email && (notifIds.length === 0 || notifIds.includes(n.id))) {
            n.read = true;
          }
        });
        saveDb(db);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true }));
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false }));
    }
  }

  // ── PILGRIM CUSTOM HOSTELS (PUBLIC API) ─────────────────────────
  if (reqPath === '/api/pilgrim/custom-hostel' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { name, formattedName, address, town, routeId, routeName, addedBy } = body;
      if (!name || !town) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'El nombre y la localidad son obligatorios' }));
      }
      const db = loadDb();
      db.customHostels = db.customHostels || [];

      const cleanName = String(name).trim();
      const cleanTown = String(town).trim();
      const cleanAddr = String(address || 'Personalizado').trim();
      const finalFormatted = String(formattedName || (cleanName + ' (' + cleanTown + ')')).trim();

      let existing = db.customHostels.find(h =>
        h.formattedName && h.formattedName.toLowerCase() === finalFormatted.toLowerCase() ||
        (h.name && h.name.toLowerCase() === cleanName.toLowerCase() && h.town && h.town.toLowerCase() === cleanTown.toLowerCase())
      );

      if (existing) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, hostel: existing, message: 'Alojamiento ya existente' }));
      }

      const newHostel = {
        id: 'HOSTEL-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: cleanName,
        formattedName: finalFormatted,
        address: cleanAddr,
        town: cleanTown,
        routeId: routeId || 'camino-ingles',
        routeName: routeName || 'Camino Inglés',
        addedBy: addedBy || 'peregrino',
        createdAt: new Date().toISOString(),
        verified: false
      };

      db.customHostels.push(newHostel);
      saveDb(db);

      console.log('[DB] Nuevo alojamiento añadido por peregrino:', newHostel.formattedName, 'en', newHostel.town);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, hostel: newHostel }));
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error procesando nuevo alojamiento' }));
    }
  }

  if (reqPath === '/api/pilgrim/custom-hostels' && req.method === 'GET') {
    try {
      const urlObj = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
      const routeId = urlObj.searchParams.get('routeId');
      const db = loadDb();
      let list = db.customHostels || [];
      if (routeId) {
        list = list.filter(h => h.routeId === routeId);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, hostels: list }));
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error obteniendo alojamientos' }));
    }
  }

  // ── ADMIN CUSTOM HOSTELS (EDIT, APPROVE, DELETE) ────────────────
  if (reqPath === '/api/admin/custom-hostel/update' && req.method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    if (!verifyAdminAuth(req, queryParams)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
    }
    try {
      const body = await parseRequestBody(req);
      const { hostelId, name, town, address } = body;
      const db = loadDb();
      db.customHostels = db.customHostels || [];
      const h = db.customHostels.find(x => x.id === hostelId);
      if (!h) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Alojamiento no encontrado' }));
      }
      if (name) h.name = String(name).trim();
      if (town) h.town = String(town).trim();
      if (address !== undefined) h.address = String(address).trim();
      h.formattedName = h.name + ' (' + h.town + ')';
      h.updatedAt = new Date().toISOString();
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, hostel: h }));
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error actualizando alojamiento' }));
    }
  }

  if (reqPath === '/api/admin/custom-hostel/approve' && req.method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    if (!verifyAdminAuth(req, queryParams)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
    }
    try {
      const body = await parseRequestBody(req);
      const { hostelId } = body;
      const db = loadDb();
      db.customHostels = db.customHostels || [];
      const h = db.customHostels.find(x => x.id === hostelId);
      if (!h) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Alojamiento no encontrado' }));
      }
      h.verified = true;
      h.verifiedAt = new Date().toISOString();
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, hostel: h }));
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error aprobando alojamiento' }));
    }
  }

  if (reqPath === '/api/admin/custom-hostel/delete' && req.method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    if (!verifyAdminAuth(req, queryParams)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
    }
    try {
      const body = await parseRequestBody(req);
      const { hostelId } = body;
      const db = loadDb();
      db.customHostels = db.customHostels || [];
      const prevLen = db.customHostels.length;
      db.customHostels = db.customHostels.filter(x => x.id !== hostelId);
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, deleted: db.customHostels.length < prevLen }));
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error eliminando alojamiento' }));
    }
  }

  // ── RESOLVE EMERGENCY ──────────────────────────────────────────
  if (reqPath === '/api/admin/emergency/resolve' && req.method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    if (!verifyAdminAuth(req, queryParams)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Acceso no autorizado al Panel de Administración' }));
    }
    try {
      const body = await parseRequestBody(req);
      const db = loadDb();
      if (!db.emergencies) db.emergencies = [];
      const em = db.emergencies.find(e => e.id === body.emergencyId);
      if (em) {
        em.resolved = true;
        saveDb(db);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Emergencia no encontrada' }));
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error procesando solicitud' }));
    }
  }

  // ── 6b. GET FULL DATABASE (PROTECTED FOR ADMIN PANEL) ─────────────────

  // ── PUBLIC COURIERS LISTING (PARA PLANIFICADOR DE PEREGRINO) ────────
  if (reqPath === '/api/couriers/public' && req.method === 'GET') {
    const db = loadDb();
    const safeCouriers = (db.couriers || [])
      .filter(c => c.isActive !== false)
      .map(c => ({
        id: c.id,
        companyName: c.companyName || '',
        driverName: c.driverName || '',
        vehicle: c.vehicle || 'Furgón de Etapa',
        routes: c.routes || 'Camino Inglés',
        routeStart: c.routeStart || '',
        routeEnd: c.routeEnd || '',
        pricePerBag: c.pricePerBag || 6.50,
        phone: c.phone || '',
        isActive: true
      }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      couriers: safeCouriers,
      database: { couriers: safeCouriers }
    }));
  }

  if (reqPath === '/api/admin/database' && req.method === 'GET') {
    if (!verifyAdminAuth(req, queryParams)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Acceso no autorizado al Panel de Administración' }));
    }

    const db = loadDb();
    // Return sanitized database without plain salt/hash
    const sanitizedDb = {
      pilgrims: (db.pilgrims || []).map(p => ({ ...p, passwordHash: '[PROTECTED]', passwordPlain: undefined, salt: undefined })),
      couriers: (db.couriers || []).map(c => ({ ...c, passwordHash: '[PROTECTED]', passwordPlain: undefined, salt: undefined })),
      reservations: db.reservations || [],
      emergencies: db.emergencies || []
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      database: sanitizedDb
    }));
  }

  // ── 7. CREATE STRIPE PAYMENT INTENT ──────────────────────────────────
  if (reqPath === '/api/create-payment-intent' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { amountEuros, currency = 'eur', pilgrimEmail, smartVieiraId, courierId, companyName } = body;

      const db = loadDb();
      // Server-side verification of tariff against registered courier
      let verifiedEuros = 6.50;
      let targetCourier = null;
      if (courierId) {
        targetCourier = (db.couriers || []).find(c => c.id === courierId);
      }
      if (!targetCourier && companyName) {
        targetCourier = (db.couriers || []).find(c => (c.companyName || '').toLowerCase() === companyName.toLowerCase());
      }
      if (targetCourier && targetCourier.pricePerBag) {
        const tariff = parseFloat(targetCourier.pricePerBag);
        verifiedEuros = Math.ceil(((tariff + 1.46) / 0.985) * 100) / 100;
      } else if (amountEuros && parseFloat(amountEuros) >= 6.00) {
        verifiedEuros = parseFloat(amountEuros);
      }

      const amountCents = Math.round(verifiedEuros * 100);

      const stripeData = {
        amount: amountCents,
        currency: currency.toLowerCase(),
        'automatic_payment_methods[enabled]': 'true',
        'automatic_payment_methods[allow_redirects]': 'always',
        'description': `Transporte SmartVieira [${smartVieiraId || 'SMARTSHELL'}] - ${pilgrimEmail || 'Peregrino'}`
      };

      console.log(`[STRIPE] Creating PaymentIntent for €${verifiedEuros} (${amountCents} cents)...`);
      const paymentIntent = await callStripeApi('/v1/payment_intents', stripeData);

      console.log(`[STRIPE] Created PaymentIntent ID: ${paymentIntent.id}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        publishableKey: STRIPE_PUBLISHABLE_KEY,
        amountEuros: verifiedEuros
      }));
    } catch (err) {
      console.error('[STRIPE PAYMENT ERROR]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        message: err.message || 'Error al conectar con la Pasarela de Pago de Stripe'
      }));
    }
  }

  // ── 8. CONFIRM RESERVATION & SAVE IN DB ──────────────────────────────
  if (reqPath === '/api/confirm-reservation' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const { paymentIntentId, pilgrimEmail, smartVieiraId, originAlbergue, destinationAlbergue, transportDate, luggageCount, amountEuros, companyName, routeName } = body;

      const db = loadDb();

      // Idempotency: avoid double registration
      if (paymentIntentId) {
        const existing = (db.reservations || []).find(r => r.paymentIntentId === paymentIntentId);
        if (existing) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: true,
            message: '¡Reserva ya confirmada y guardada en la Base de Datos!',
            reservation: existing
          }));
        }
      }

      // Payment verification when Stripe is configured
      if (STRIPE_SECRET_KEY) {
        if (!paymentIntentId || !paymentIntentId.startsWith('pi_') || paymentIntentId.startsWith('pi_direct_') || paymentIntentId.startsWith('pi_manual_')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            message: 'Error de validación: Se requiere un PaymentIntent válido verificado por Stripe.'
          }));
        }

        try {
          const verifiedPi = await callStripeApi(`/v1/payment_intents/${paymentIntentId}`, null, 'GET');
          if (verifiedPi.status !== 'succeeded' && verifiedPi.status !== 'processing') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
              success: false,
              message: `El pago no ha sido completado en Stripe (Estado: ${verifiedPi.status}).`
            }));
          }
        } catch (stripeErr) {
          console.error('[SECURITY AUDIT] Stripe payment verification failed:', stripeErr);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            message: 'No se pudo verificar el pago con Stripe: ' + (stripeErr.message || 'ID inválido')
          }));
        }
      }

      const newRes = {
        id: 'RES-' + Math.floor(100000 + Math.random() * 900000),
        pilgrimEmail: (pilgrimEmail || 'peregrino@smartvieira.com').trim(),
        smartVieiraId: (smartVieiraId || 'VIEIRA-SMARTSHELL-S3-9982').trim(),
        originAlbergue: originAlbergue || 'Betanzos (Albergue Casa Pousada)',
        destinationAlbergue: destinationAlbergue || 'Sigüeiro (Albergue de Bruma)',
        companyName: companyName || 'Empresa Repartidora',
        routeName: routeName || 'Camino Inglés',
        transportDate: transportDate || new Date().toISOString().split('T')[0],
        luggageCount: parseInt(luggageCount || 1),
        amountEuros: parseFloat(amountEuros || 6.50),
        status: 'PAID',
        paymentIntentId: paymentIntentId || ('pi_manual_' + Date.now()),
        createdAt: new Date().toISOString()
      };

      db.reservations.push(newRes);

      // Queue System-level Notification for the assigned courier
      db.courierNotifications = db.courierNotifications || [];
      db.courierNotifications.push({
        id: 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        targetCompany: newRes.companyName,
        title: '🔔 ¡Nueva Contratación de Servicio!',
        body: `Mochila asignada: ${newRes.originAlbergue} → ${newRes.destinationAlbergue} (${newRes.amountEuros ? newRes.amountEuros.toFixed(2) : '6.50'}€)`,
        type: 'NEW_BOOKING',
        reservationId: newRes.id,
        price: newRes.amountEuros,
        originAlbergue: newRes.originAlbergue,
        destinationAlbergue: newRes.destinationAlbergue,
        smartVieiraId: newRes.smartVieiraId,
        createdAt: new Date().toISOString(),
        delivered: false
      });

      saveDb(db);

      console.log(`[DB] New Reservation Confirmed & Saved: ${newRes.id} for ${newRes.pilgrimEmail} (Queued Courier Notification)`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: '¡Reserva confirmada y guardada en la Base de Datos!',
        reservation: newRes
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error guardando reserva' }));
    }
  }

  // ── 9. PRODUCT STORE: CREATE STRIPE PAYMENT INTENT ────────────────────
  if (reqPath === '/api/product/create-payment-intent' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const qty = Math.max(1, Math.min(50, parseInt(body.quantity, 10) || 1));
      const UNIT_PRICE = 15.00;
      const SHIPPING_PRICE = 2.00;
      const verifiedEuros = Number(((qty * UNIT_PRICE) + SHIPPING_PRICE).toFixed(2));
      const amountCents = Math.round(verifiedEuros * 100);
      const customerEmail = (body.customerEmail || '').trim();
      const customerName = (body.customerName || 'Peregrino').trim();

      if (!STRIPE_SECRET_KEY || !STRIPE_PUBLISHABLE_KEY) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          offlineFallback: true,
          amountEuros: verifiedEuros,
          unitPrice: UNIT_PRICE,
          shippingPrice: SHIPPING_PRICE,
          quantity: qty
        }));
      }

      const stripeData = {
        amount: amountCents,
        currency: 'eur',
        'automatic_payment_methods[enabled]': 'true',
        'automatic_payment_methods[allow_redirects]': 'always',
        'description': `Concha SmartVieira x${qty} + Envío - ${customerName} (${customerEmail})`
      };

      console.log(`[STRIPE PRODUCT] Creating PaymentIntent for €${verifiedEuros} (${qty} uds)...`);
      const paymentIntent = await callStripeApi('/v1/payment_intents', stripeData);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        publishableKey: STRIPE_PUBLISHABLE_KEY,
        amountEuros: verifiedEuros,
        unitPrice: UNIT_PRICE,
        shippingPrice: SHIPPING_PRICE,
        quantity: qty
      }));
    } catch (err) {
      console.error('[STRIPE PRODUCT ERROR]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        message: err.message || 'Error al conectar con la Pasarela de Pago de Stripe'
      }));
    }
  }

  // ── 10. PRODUCT STORE: CONFIRM ORDER & SAVE IN DB ─────────────────────
  if (reqPath === '/api/product/confirm-order' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const {
        paymentIntentId,
        customerName,
        customerEmail,
        phone,
        address,
        postalCode,
        city,
        country,
        quantity
      } = body;

      const qty = Math.max(1, Math.min(50, parseInt(quantity, 10) || 1));
      const UNIT_PRICE = 15.00;
      const SHIPPING_PRICE = 2.00;
      const verifiedEuros = Number(((qty * UNIT_PRICE) + SHIPPING_PRICE).toFixed(2));

      const db = loadDb();
      db.productOrders = db.productOrders || [];

      if (paymentIntentId) {
        const existing = db.productOrders.find(o => o.paymentIntentId === paymentIntentId);
        if (existing) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: true,
            message: '¡Pedido ya confirmado!',
            order: existing
          }));
        }
      }

      if (STRIPE_SECRET_KEY) {
        if (!paymentIntentId || !paymentIntentId.startsWith('pi_') || paymentIntentId.startsWith('pi_direct_') || paymentIntentId.startsWith('pi_manual_')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            message: 'Error de validación: Se requiere un pago verificado por Stripe.'
          }));
        }
        try {
          const verifiedPi = await callStripeApi(`/v1/payment_intents/${paymentIntentId}`, null, 'GET');
          if (verifiedPi.status !== 'succeeded' && verifiedPi.status !== 'processing') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
              success: false,
              message: `El pago no ha sido completado en Stripe (Estado: ${verifiedPi.status}).`
            }));
          }
        } catch (stripeErr) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            message: 'No se pudo verificar el pago con Stripe: ' + (stripeErr.message || 'ID inválido')
          }));
        }
      }

      const newOrder = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        customerName: (customerName || '').trim(),
        customerEmail: (customerEmail || '').trim(),
        phone: (phone || '').trim(),
        address: (address || '').trim(),
        postalCode: (postalCode || '').trim(),
        city: (city || '').trim(),
        country: (country || 'España').trim(),
        quantity: qty,
        unitPrice: UNIT_PRICE,
        shippingPrice: SHIPPING_PRICE,
        totalEuros: verifiedEuros,
        paymentIntentId: paymentIntentId || ('ORD_LOCAL_' + Date.now()),
        status: 'Pagado - Pendiente de Envío',
        createdAt: new Date().toISOString()
      };

      db.productOrders.push(newOrder);
      saveDb(db);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: '¡Pedido confirmado! Prepararemos el envío de tu SmartVieira.',
        order: newOrder
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error guardando el pedido' }));
    }
  }

  // ── SHELL INVENTORY VERIFICATION & ADMIN MANAGEMENT ───────────────────────
  if (reqPath === '/api/shells/verify' && (req.method === 'POST' || req.method === 'GET')) {
    try {
      let rawId = queryParams.id || queryParams.smartVieiraId || '';
      if (req.method === 'POST') {
        const body = await parseRequestBody(req);
        rawId = body.smartVieiraId || body.id || rawId;
      }
      const cleanId = String(rawId || '').trim().toUpperCase();
      if (!cleanId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, valid: false, message: 'Introduce un ID de concha SmartVieira.' }));
      }
      const db = loadDb();
      const shell = (db.shells || []).find(s => (s.id || '').trim().toUpperCase() === cleanId);
      if (!STRICT_SHELL_VALIDATION) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          valid: true,
          status: shell ? (shell.status || 'available') : 'available',
          smartVieiraId: shell ? shell.id : cleanId
        }));
      }
      if (!shell) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          valid: false,
          message: `El ID "${cleanId}" no está registrado como una concha SmartVieira vendida.`
        }));
      }
      if (shell.status === 'linked' && shell.linkedEmail) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          valid: false,
          status: 'linked',
          message: `La concha "${cleanId}" ya está vinculada a otra cuenta de peregrino.`
        }));
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        valid: true,
        status: shell.status || 'available',
        smartVieiraId: shell.id
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, valid: false, message: 'Error verificando concha SmartVieira.' }));
    }
  }

  if (reqPath === '/api/admin/shells/add' && req.method === 'POST') {
    if (!verifyAdminAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
    }
    try {
      const body = await parseRequestBody(req);
      const rawList = Array.isArray(body.ids) ? body.ids : String(body.ids || body.id || '').split(/[\s,;]+/);
      const batch = (body.batch || 'Venta').trim();
      const db = loadDb();
      db.shells = db.shells || [];
      let added = 0;
      let skipped = 0;
      for (const item of rawList) {
        const clean = String(item || '').trim().toUpperCase();
        if (!clean) continue;
        if (db.shells.some(s => (s.id || '').trim().toUpperCase() === clean)) {
          skipped++;
          continue;
        }
        db.shells.push({ id: clean, status: 'available', linkedEmail: null, batch, createdAt: new Date().toISOString() });
        added++;
      }
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, added, skipped, message: `Añadidas ${added} conchas (${skipped} ya existían).` }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error añadiendo conchas' }));
    }
  }

  if (reqPath === '/api/admin/shells/release' && req.method === 'POST') {
    if (!verifyAdminAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
    }
    try {
      const body = await parseRequestBody(req);
      const clean = String(body.id || '').trim().toUpperCase();
      const db = loadDb();
      const shell = (db.shells || []).find(s => (s.id || '').trim().toUpperCase() === clean);
      if (!shell) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Concha no encontrada' }));
      }
      shell.status = 'available';
      shell.linkedEmail = null;
      delete shell.linkedAt;
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: `Concha ${clean} liberada.` }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error liberando concha' }));
    }
  }

  if (reqPath === '/api/admin/shells/delete' && req.method === 'POST') {
    if (!verifyAdminAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
    }
    try {
      const body = await parseRequestBody(req);
      const clean = String(body.id || '').trim().toUpperCase();
      const db = loadDb();
      const prevLen = (db.shells || []).length;
      db.shells = (db.shells || []).filter(s => (s.id || '').trim().toUpperCase() !== clean);
      if (db.shells.length === prevLen) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Concha no encontrada' }));
      }
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: `Concha ${clean} eliminada.` }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error eliminando concha' }));
    }
  }

  // ── ADMIN SMTP / EMAIL CONFIG & TEST ──────────────────────────────────────
  if (reqPath === '/api/admin/smtp-config' && req.method === 'POST') {
    if (!verifyAdminAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
    }
    try {
      const body = await parseRequestBody(req);
      const host = String(body.host || 'smtp.gmail.com').trim();
      const user = String(body.user || '').trim();
      const pass = String(body.pass || '').trim();
      const db = loadDb();
      db.smtpConfig = {
        host,
        user,
        pass: pass || (db.smtpConfig && db.smtpConfig.pass) || '',
        updatedAt: new Date().toISOString()
      };
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'Configuración de correo guardada.' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error guardando configuración de correo' }));
    }
  }

  if (reqPath === '/api/admin/smtp-test' && req.method === 'POST') {
    if (!verifyAdminAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
    }
    try {
      const body = await parseRequestBody(req);
      const db = loadDb();
      const cfg = db.smtpConfig || {};
      const host = process.env.SMTP_HOST || cfg.host || 'smtp.gmail.com';
      const user = process.env.SMTP_USER || cfg.user || '';
      const pass = process.env.SMTP_PASS || cfg.pass || '';
      const to = String(body.to || user || '').trim();
      if (!to) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Indica un correo de destino para la prueba.' }));
      }
      await sendSmtpEmail({
        host,
        port: 465,
        user,
        pass,
        to,
        subject: 'Prueba de Correo SmartVieira',
        bodyText: 'Si lees este mensaje, el sistema de recuperación de contraseñas de SmartVieira funciona correctamente.'
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: `✅ Correo de prueba enviado a ${to}` }));
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error enviando correo de prueba: ' + err.message }));
    }
  }

  // =========================================================================
  // STATIC FILE SERVING
  // =========================================================================
  const seoRoutes = {
    '/camino-frances': '/caminos/camino-frances.html',
    '/camino-portugues': '/caminos/camino-portugues.html',
    '/camino-portugues-costa': '/caminos/camino-portugues-costa.html',
    '/camino-del-norte': '/caminos/camino-del-norte.html',
    '/camino-primitivo': '/caminos/camino-primitivo.html',
    '/camino-ingles': '/caminos/camino-ingles.html',
    '/camino-sanabres': '/caminos/camino-sanabres.html',
    '/camino-invierno': '/caminos/camino-invierno.html',
    '/camino-fisterra-muxia': '/caminos/camino-fisterra-muxia.html',
    '/transporte-mochilas-camino-santiago': '/transporte-mochilas-camino-santiago.html',
    '/como-conseguir-la-compostela': '/guias/como-conseguir-la-compostela.html',
    '/que-llevar-mochila-camino-santiago': '/guias/que-llevar-mochila-camino-santiago.html',
    '/cuanto-cuesta-hacer-el-camino-de-santiago': '/guias/cuanto-cuesta-hacer-el-camino-de-santiago.html',
    '/que-camino-de-santiago-elegir': '/guias/que-camino-de-santiago-elegir.html'
  };

  let staticUrl = reqPath.length > 1 && reqPath.endsWith('/') ? reqPath.slice(0, -1) : reqPath;
  let isSeoPage = false;
  if (staticUrl === '/') {
    staticUrl = '/index.html';
  } else if (staticUrl === '/downloads.html') {
    staticUrl = '/descargar.html';
  } else if (seoRoutes[staticUrl]) {
    staticUrl = seoRoutes[staticUrl];
    isSeoPage = true;
  }

  let filePath = path.join(PUBLIC_DIR, staticUrl);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
      isSeoPage = false;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('Error loading file');
      } else {
        const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.ico'].includes(ext);
        const headers = {
          'Content-Type': contentType,
          'Cache-Control': isImage
            ? 'public, max-age=604800, immutable'
            : (isSeoPage ? 'public, max-age=3600' : 'no-cache, no-store, must-revalidate')
        };
        if (!isImage && !isSeoPage) {
          headers['Pragma'] = 'no-cache';
          headers['Expires'] = '0';
        }
        if (filePath.endsWith('admin.html')) {
          headers['X-Robots-Tag'] = 'noindex, nofollow';
        }
        res.writeHead(200, headers);
        res.end(content);
      }
    });
  });
});

// Configure strict socket timeouts to prevent Slowloris & DoS attacks
server.headersTimeout = 5000;
server.requestTimeout = 10000;
server.keepAliveTimeout = 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[VIEIRA HARDENED SERVER] Running at http://0.0.0.0:${PORT}`);
  console.log(`[VIEIRA DB] Protected Database loaded at ${DB_FILE}`);
  console.log(`[VIEIRA SECURITY] Anti-DoS Rate Limiting, PBKDF2 Password Hashing & JWT Active.`);
});
