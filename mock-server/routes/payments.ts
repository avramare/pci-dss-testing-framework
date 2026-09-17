/**
 * Payment Routes — /api/payments
 * PCI-DSS Req 3 & 4 — Data protection and transmission security
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { transactions, addAuditLog } from '../data/store';
import { PaymentRequest, PaymentResponse } from '../../src/types';

const router = Router();

function maskPan(pan: string): string {
  const clean = pan.replace(/\s/g, '');
  return `**** **** **** ${clean.slice(-4)}`;
}

function getLastFour(pan: string): string {
  return pan.replace(/\s/g, '').slice(-4);
}

// POST /api/payments
router.post('/', requireAuth, requireRole('admin', 'merchant'), (req: Request, res: Response) => {
  
  const SECURE_MODE = process.env.SECURE_MODE !== 'false';

  const body = req.body as PaymentRequest;

  if (!body.card || !body.amount || !body.currency) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PAYLOAD', message: 'amount, currency, and card are required' }
    });
  }

  const { card, amount, currency, merchantId } = body;

  if (!card.pan || !card.cvv || !card.expiryMonth || !card.expiryYear) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_CARD', message: 'Card pan, cvv, expiryMonth, expiryYear are required' }
    });
  }

  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const safeResponse: PaymentResponse = {
    transactionId,
    status: 'approved',
    amount,
    currency,
    maskedPan: maskPan(card.pan),
    lastFour: getLastFour(card.pan),
    timestamp: new Date().toISOString(),
    merchantId: merchantId || 'merchant_default'
  };

  // INSECURE MODE — intentionally leak PAN and CVV to demonstrate PCI violations
  if (!SECURE_MODE) {
    (safeResponse as unknown as Record<string, unknown>)['fullPan'] = card.pan;  // PCI VIOLATION
    (safeResponse as unknown as Record<string, unknown>)['cvv'] = card.cvv;      // PCI VIOLATION
  }

  transactions.push(safeResponse);

  addAuditLog({
    userId: req.user?.sub || 'unknown',
    action: 'PAYMENT_INITIATED',
    resource: '/api/payments',
    ipAddress: req.ip || '0.0.0.0',
    userAgent: req.headers['user-agent'] || 'unknown',
    outcome: 'success',
    details: {
      transactionId,
      maskedPan: maskPan(card.pan),
      amount: String(amount),
      currency
    }
  });

  return res.status(201).json({
    success: true,
    data: safeResponse,
    meta: {
      requestId: `req_${Date.now()}`,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  });
});

// GET /api/payments
router.get('/', requireAuth, requireRole('admin', 'merchant', 'readonly'), (req: Request, res: Response) => {
  addAuditLog({
    userId: req.user?.sub || 'unknown',
    action: 'CARD_DATA_ACCESSED',
    resource: '/api/payments',
    ipAddress: req.ip || '0.0.0.0',
    userAgent: req.headers['user-agent'] || 'unknown',
    outcome: 'success'
  });

  return res.status(200).json({
    success: true,
    data: transactions,
    meta: {
      requestId: `req_${Date.now()}`,
      timestamp: new Date().toISOString(),
      version: '1.0',
      total: transactions.length
    }
  });
});

// GET /api/payments/:id
router.get('/:id', requireAuth, requireRole('admin', 'merchant', 'readonly'), (req: Request, res: Response) => {
  const txn = transactions.find(t => t.transactionId === req.params.id);

  if (!txn) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Transaction ${req.params.id} not found` }
    });
  }

  addAuditLog({
    userId: req.user?.sub || 'unknown',
    action: 'CARD_DATA_ACCESSED',
    resource: `/api/payments/${req.params.id}`,
    ipAddress: req.ip || '0.0.0.0',
    userAgent: req.headers['user-agent'] || 'unknown',
    outcome: 'success',
    details: { transactionId: req.params.id as string }
  });

  return res.status(200).json({
    success: true,
    data: txn,
    meta: {
      requestId: `req_${Date.now()}`,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  });
});

// DELETE /api/payments/:id — admin only
router.delete('/:id', requireAuth, requireRole('admin'), (req: Request, res: Response) => {
  const index = transactions.findIndex(t => t.transactionId === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Transaction ${req.params.id} not found` }
    });
  }

  transactions.splice(index, 1);

  return res.status(200).json({
    success: true,
    data: { message: `Transaction ${req.params.id} deleted` }
  });
});

export default router;