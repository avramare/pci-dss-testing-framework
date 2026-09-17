/**
 * Audit Log Route — /api/audit-logs
 * PCI-DSS Req 10 — Log and monitor all access to system components
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { auditLogs } from '../data/store';

const router = Router();

// GET /api/audit-logs — admin only (PCI Req 10)
router.get('/', requireAuth, requireRole('admin'), (req: Request, res: Response) => {
  const { action, userId, from, to } = req.query;

  let filtered = [...auditLogs];

  if (action) filtered = filtered.filter(l => l.action === action);
  if (userId) filtered = filtered.filter(l => l.userId === userId);
  if (from) filtered = filtered.filter(l => new Date(l.timestamp) >= new Date(from as string));
  if (to) filtered = filtered.filter(l => new Date(l.timestamp) <= new Date(to as string));

  return res.status(200).json({
    success: true,
    data: filtered,
    meta: {
      requestId: `req_${Date.now()}`,
      timestamp: new Date().toISOString(),
      version: '1.0',
      total: filtered.length
    }
  });
});

// GET /api/audit-logs/:id
router.get('/:id', requireAuth, requireRole('admin'), (req: Request, res: Response) => {
  const log = auditLogs.find(l => l.id === req.params.id);

  if (!log) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Audit log entry not found' }
    });
  }

  return res.status(200).json({ success: true, data: log });
});

// DELETE not permitted — logs are immutable (PCI Req 10.3)
router.delete('*', requireAuth, (_req: Request, res: Response) => {
  return res.status(405).json({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Audit logs are immutable and cannot be deleted (PCI-DSS Req 10.3)'
    }
  });
});

export default router;