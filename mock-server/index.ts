import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import authRoutes from './routes/auth';
import paymentRoutes from './routes/payments';
import auditLogRoutes from './routes/audit-logs';
import { resetStore } from './data/store';

const app = express();
const PORT = process.env.PORT || 3000;
const SECURE_MODE = process.env.SECURE_MODE !== 'false';

console.log('PCI-DSS Mock Server starting in ...')

//Start
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(` Payment UI  → http://localhost:${PORT}`);
    console.log(` API Base    → http://localhost:${PORT}/api`);
    console.log(`  Health     → http://localhost:${PORT}/api/health\n`);
  });
}

// ─── Security Headers (PCI Req 6 / Req 2) ────────────────────────────────────
if (SECURE_MODE) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    frameguard: { action: 'deny' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));
} else {
  // Insecure mode — no security headers
  app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Express/5.2.1'); // PCI violation: leaks server info
    next();
  });
}

// ─── Rate Limiting (PCI Req 6 / Req 8) ───────────────────────────────────────
if (SECURE_MODE) {
  app.use('/api/auth/login', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, 
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts' } }
  }));
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ─── Serve Payment UI ─────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    secureMode: SECURE_MODE,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default app;