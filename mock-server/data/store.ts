/**
 * In-Memory Data Store for Mock Payment Server
 * Simulates a payment processor database, resets on restart
 */

import { AuditLogEntry, PaymentResponse, TestUser } from '../../src/types';

// ─── Users ────────────────────────────────────────────────────────────────────

export const mockUsers: TestUser[] = [
  { id: 'usr_admin_001', username: 'admin@pcitest.local', password: 'Admin$ecure#2024', role: 'admin' },
  { id: 'usr_merchant_001', username: 'merchant@pcitest.local', password: 'Merchant$ecure#2024', role: 'merchant' },
  { id: 'usr_readonly_001', username: 'readonly@pcitest.local', password: 'Readonly$ecure#2024', role: 'readonly' },
  { id: 'usr_guest_001', username: 'guest@pcitest.local', password: 'Guest$ecure#2024', role: 'guest' }
];

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const auditLogs: AuditLogEntry[] = [];

export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const log: AuditLogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString()
  };
  auditLogs.push(log);
  return log;
}

// ─── Failed Login Tracker (for lockout — PCI Req 8.3) ────────────────────────

export const failedLoginAttempts: Map<string, number> = new Map();
export const lockedAccounts: Set<string> = new Set();

export const LOCKOUT_THRESHOLD = 6;

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactions: PaymentResponse[] = [];

// ─── Reset (for test isolation) ───────────────────────────────────────────────

export function resetStore(): void {
  transactions.length = 0;
  auditLogs.length = 0;
  failedLoginAttempts.clear();
  lockedAccounts.clear();
}