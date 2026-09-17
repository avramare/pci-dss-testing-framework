/**
 * Auth Routes — /api/auth
 * PCI-DSS Req 8 — Identify and authenticate access to system components
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
    mockUsers,
    failedLoginAttempts,
    lockedAccounts,
    LOCKOUT_THRESHOLD,
    addAuditLog
} from '../data/store';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pci-test-secret-key';

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
    // Read dynamically so tests can toggle SECURE_MODE
    const SECURE_MODE = process.env.SECURE_MODE !== 'false';

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: { code: 'MISSING_CREDENTIALS', message: 'Username and password are required' }
        });
    }

    // PCI Req 8.3.4 — Account lockout after repeated failures
    if (SECURE_MODE && lockedAccounts.has(username)) {
        addAuditLog({
            userId: username,
            action: 'AUTH_FAILED',
            resource: '/api/auth/login',
            ipAddress: req.ip || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown',
            outcome: 'failure',
            details: { reason: 'account_locked' }
        });
        return res.status(423).json({
            success: false,
            error: { code: 'ACCOUNT_LOCKED', message: 'Account locked due to too many failed attempts' }
        });
    }

    // Reject default/weak credentials (PCI Req 2.1)
    const weakPasswords = ['admin', 'password', 'root', '1234', 'test'];
    if (SECURE_MODE && weakPasswords.includes(password.toLowerCase())) {
        return res.status(401).json({
            success: false,
            error: { code: 'WEAK_CREDENTIALS', message: 'Default credentials are not permitted' }
        });
    }

    const user = mockUsers.find(u => u.username === username && u.password === password);

    if (!user) {
        const attempts = (failedLoginAttempts.get(username) || 0) + 1;
        failedLoginAttempts.set(username, attempts);

        if (SECURE_MODE && attempts >= LOCKOUT_THRESHOLD) {
            lockedAccounts.add(username);
        }

        addAuditLog({
            userId: username,
            action: 'AUTH_FAILED',
            resource: '/api/auth/login',
            ipAddress: req.ip || '0.0.0.0',
            userAgent: req.headers['user-agent'] || 'unknown',
            outcome: 'failure',
            details: { attempts: String(attempts) }
        });

        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' }
        });
    }

    failedLoginAttempts.delete(username);

    // PCI Req 8.6 — Tokens must expire (15 min in secure mode)
    const expiresIn = SECURE_MODE ? 900 : 999999;

    const token = jwt.sign(
        { sub: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn }
    );

    addAuditLog({
        userId: user.id,
        action: 'LOGIN',
        resource: '/api/auth/login',
        ipAddress: req.ip || '0.0.0.0',
        userAgent: req.headers['user-agent'] || 'unknown',
        outcome: 'success'
    });

    return res.status(200).json({
        success: true,
        data: {
            accessToken: token,
            tokenType: 'Bearer',
            expiresIn,
            issuedAt: Math.floor(Date.now() / 1000)
        },
        meta: {
            requestId: `req_${Date.now()}`,
            timestamp: new Date().toISOString(),
            version: '1.0'
        }
    });
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || 'unknown';

    addAuditLog({
        userId,
        action: 'LOGOUT',
        resource: '/api/auth/logout',
        ipAddress: req.ip || '0.0.0.0',
        userAgent: req.headers['user-agent'] || 'unknown',
        outcome: 'success'
    });

    return res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' }
    });
});

export default router;