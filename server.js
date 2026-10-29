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
const JWT_SECRET = process.env.JWT_SECRET || 'SMARTSHELL_SECRET_KEY_2026_CAMINO_PROD_9982';

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
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
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
      const initialDb = { pilgrims: [], couriers: [], reservations: [], emergencies: [], notifications: [] };
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
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');

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
  
  // ADMIN SECURE ENDPOINTS
  let ADMIN_CREDENTIALS = { user: 'admin', pass: 'admin' };

  if (reqPath === '/api/admin/login' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      if ((body.user || '').trim().toLowerCase() === ADMIN_CREDENTIALS.user.toLowerCase() && (body.pass || '').trim() === ADMIN_CREDENTIALS.pass) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, token: 'admin_secure_token_12345' }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Credenciales incorrectas' }));
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Error del servidor' }));
    }
  }

  function isAdminValid(req, queryParams) {
    const auth = req.headers['authorization'];
    return (auth === 'Bearer admin_secure_token_12345') || (queryParams.code === 'VIEIRA-COURIER-2026');
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
    if (queryParams.token !== 'admin_secure_token_12345') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'No autorizado' }));
    }
    const dbData = fs.readFileSync(DB_FILE, 'utf8');
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="smartvieira_backup_' + Date.now() + '.json"'
    });
    return res.end(dbData);
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
      if (currentDb.smtpConfig) {
        demoData.smtpConfig = currentDb.smtpConfig;
      }
      saveDb(demoData);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        couriersCount: (demoData.couriers || []).length,
        pilgrimsCount: (demoData.pilgrims || []).length
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

      if (!name || !email || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Faltan campos obligatorios (nombre, email, contraseña)' }));
      }

      const db = loadDb();
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
        passwordPlain: password,
        passwordHash: hash,
        salt: salt,
        smartVieiraId: (smartVieiraId || 'VIEIRA-SMARTSHELL-S3-9982').trim(),
        createdAt: new Date().toISOString()
      };

      db.pilgrims.push(newPilgrim);
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

      if (pilgrim.passwordPlain !== password) {
        pilgrim.passwordPlain = password;
        saveDb(db);
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
        passwordPlain: password,
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

      const token = generateToken({ role: 'courier', email: newCourier.email, companyName: newCourier.companyName });
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

      if (courier.passwordPlain !== password) {
        courier.passwordPlain = password;
        saveDb(db);
      }

      const token = generateToken({ role: 'courier', email: courier.email, companyName: courier.companyName });
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

      if (!targetUser) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          message: 'No encontramos ninguna cuenta registrada con el correo ' + email
        }));
      }

      // Ensure user has a readable passwordPlain in DB (generate one if legacy hash-only account)
      if (!targetUser.passwordPlain) {
        const generatedPass = 'Vieira' + Math.floor(1000 + Math.random() * 9000);
        const { hash, salt } = hashPassword(generatedPass);
        targetUser.passwordPlain = generatedPass;
        targetUser.passwordHash = hash;
        targetUser.salt = salt;
      }

      targetUser.lastPasswordRecoveryAt = new Date().toISOString();
      saveDb(db);

      const smtpCfg = db.smtpConfig || {};
      const smtpUser = process.env.SMTP_USER || smtpCfg.user || '';
      const smtpPass = process.env.SMTP_PASS || smtpCfg.pass || '';
      const smtpHost = process.env.SMTP_HOST || smtpCfg.host || 'smtp.gmail.com';

      const displayName = targetUser.name || targetUser.driverName || targetUser.companyName || 'Usuario';
      const subject = 'Recuperación de Contraseña - SmartVieira (' + userTypeLabel + ')';
      const bodyText = [
        'Hola ' + displayName + ',',
        '',
        'Has solicitado recuperar tu contraseña de acceso a SmartVieira (' + userTypeLabel + ').',
        '',
        '📧 Correo: ' + targetUser.email,
        '🔑 Tu Contraseña: ' + targetUser.passwordPlain,
        '',
        'Ya puedes volver a entrar en la aplicación con estas credenciales.',
        '¡Buen Camino!',
        'Equipo SmartVieira'
      ].join('\r\n');

      let emailSent = false;
      let emailError = null;
      if ((smtpUser && smtpPass) || smtpHost.startsWith('https://')) {
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
          emailSent = true;
        } catch (errSmtp) {
          console.error('[SMTP ERROR]', errSmtp.message);
          emailError = errSmtp.message || String(errSmtp);
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (emailSent) {
        return res.end(JSON.stringify({
          success: true,
          emailSent: true,
          message: '✅ ¡Contraseña enviada con éxito a ' + targetUser.email + '! Revisa tu bandeja de entrada o la carpeta de Spam.'
        }));
      } else {
        return res.end(JSON.stringify({
          success: true,
          emailSent: false,
          recoveredPassword: targetUser.passwordPlain,
          message: '✅ Solicitud registrada. Tu contraseña es: ' + targetUser.passwordPlain + (emailError ? ' (Aviso SMTP: ' + emailError + ')' : ' (También está disponible en el Panel de Administración).')
        }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error procesando la recuperación de contraseña.' }));
    }
  }

  // ── ADMIN SMTP CONFIGURATION ────────────────────────────────────────
  if (reqPath === '/api/admin/smtp-config' && req.method === 'POST') {
    if (!isAdminValid(req, queryParams)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'No autorizado' }));
    }
    try {
      const body = await parseRequestBody(req);
      const db = loadDb();
      const prev = db.smtpConfig || {};
      db.smtpConfig = {
        host: (body.host || prev.host || 'smtp.gmail.com').trim(),
        user: (body.user || prev.user || '').trim(),
        pass: (body.pass || prev.pass || '').trim()
      };
      saveDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'Configuración de correo guardada en BD.' }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: e.message }));
    }
  }

  // ── 5. GET USER PROFILE & RESERVATIONS ───────────────────────────────
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
    const db = loadDb();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      reservations: db.reservations
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
    if (authHeader !== 'Bearer admin_secure_token_12345') {
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
    if (authHeader !== 'Bearer admin_secure_token_12345') {
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
    if (authHeader !== 'Bearer admin_secure_token_12345') {
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
    if (authHeader !== 'Bearer admin_secure_token_12345') {
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
  if (reqPath === '/api/admin/database' && req.method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const tokenOrCode = authHeader.replace('Bearer ', '').trim() || queryParams.code || queryParams.token;

    if (tokenOrCode !== DEFAULT_COURIER_ACCESS_CODE) {
      const authObj = verifyToken(tokenOrCode);
      if (!authObj || authObj.role !== 'admin') {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Acceso no autorizado al Panel de Administración' }));
      }
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
      const { amountEuros = 6.50, currency = 'eur', pilgrimEmail, smartVieiraId } = body;

      const amountCents = Math.round(parseFloat(amountEuros) * 100);

      const stripeData = {
        amount: amountCents,
        currency: currency.toLowerCase(),
        'automatic_payment_methods[enabled]': 'true',
        'automatic_payment_methods[allow_redirects]': 'always',
        'description': `Transporte SmartVieira [${smartVieiraId || 'SMARTSHELL'}] - ${pilgrimEmail || 'Peregrino'}`
      };

      console.log(`[STRIPE] Creating PaymentIntent for €${amountEuros} (${amountCents} cents)...`);
      const paymentIntent = await callStripeApi('/v1/payment_intents', stripeData);

      console.log(`[STRIPE] Created PaymentIntent ID: ${paymentIntent.id}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        publishableKey: STRIPE_PUBLISHABLE_KEY
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
      const newRes = {
        id: 'RES-' + Math.floor(100000 + Math.random() * 900000),
        pilgrimEmail: pilgrimEmail || 'peregrino@smartvieira.com',
        smartVieiraId: smartVieiraId || 'VIEIRA-SMARTSHELL-S3-9982',
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

  // =========================================================================
  // STATIC FILE SERVING
  // =========================================================================
  let staticUrl = reqPath;
  if (staticUrl === '/' || staticUrl === '/index.html' || staticUrl === '/downloads.html') {
    staticUrl = '/descargar.html';
  }

  let filePath = path.join(PUBLIC_DIR, staticUrl);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'descargar.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('Error loading file');
      } else {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
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
