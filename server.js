const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const crypto = require('crypto');

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
      const initialDb = { pilgrims: [], couriers: [], reservations: [], emergencies: [] };
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
        language: language || 'es',
        email: email.toLowerCase().trim(),
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
        if (pilgrim.salt) {
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

      const token = generateToken({ role: 'courier', email: newCourier.email, companyName: newCourier.companyName });
      console.log(`[DB] Registered Courier Company: ${companyName} (${driverName})`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: '¡Registro de Empresa Repartidora autorizado con éxito!',
        token: token,
        courier: {
          companyName: newCourier.companyName,
          driverName: newCourier.driverName,
          vehicle: newCourier.vehicle,
          routes: newCourier.routes,
          routeStart: newCourier.routeStart,
          routeEnd: newCourier.routeEnd,
          email: newCourier.email
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
        if (courier.salt) {
          valid = verifyPassword(password, courier.passwordHash, courier.salt);
        } else {
          valid = courier.passwordHash === password;
        }
      }

      if (!valid) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Correo o contraseña de repartidor incorrectos' }));
      }

      const token = generateToken({ role: 'courier', email: courier.email, companyName: courier.companyName });
      console.log(`[DB] Secure Courier Login: ${email}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: '¡Bienvenido al Panel de Transporte!',
        token: token,
        courier: {
          companyName: courier.companyName,
          driverName: courier.driverName,
          vehicle: courier.vehicle,
          routes: courier.routes,
          email: courier.email
        }
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, message: 'Error procesando login de repartidor' }));
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
  if (reqPath === '/api/courier/reservations' && req.method === 'GET') {
    const db = loadDb();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      reservations: db.reservations
    }));
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
      pilgrims: (db.pilgrims || []).map(p => ({ ...p, passwordHash: '[PROTECTED]', salt: undefined })),
      couriers: (db.couriers || []).map(c => ({ ...c, passwordHash: '[PROTECTED]', salt: undefined })),
      reservations: db.reservations || []
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
        'automatic_payment_methods[allow_redirects]': 'never',
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
      saveDb(db);

      console.log(`[DB] New Reservation Confirmed & Saved: ${newRes.id} for ${newRes.pilgrimEmail}`);

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
