/**
 * Core TypeScript types for PCI-DSS Automation Framework
 * All cardholder data structures aligned with PCI-DSS v4.0 terminology
 */

// ─── Cardholder Data ──────────────────────────────────────────────────────────

export interface CardData {
  pan: string;           // Primary Account Number (full, for test input only)
  maskedPan: string;     // e.g. **** **** **** 4242
  lastFour: string;      // e.g. 4242
  expiryMonth: string;   // MM
  expiryYear: string;    // YYYY
  cardholderName: string;
  brand: CardBrand;
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover';

export interface CardInput extends CardData {
  cvv: string;
}

// ─── Authentication ───────────────────────────────────────────────────────────

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;     // seconds
  issuedAt: number;      // unix timestamp
}

export interface JWTPayload {
  sub: string;           // user ID
  role: UserRole;
  iat: number;
  exp: number;
}

export type UserRole = 'admin' | 'merchant' | 'readonly' | 'guest';

// ─── Payment Transaction ──────────────────────────────────────────────────────

export interface PaymentRequest {
  amount: number;
  currency: string;
  card: CardInput;
  description?: string;
  merchantId: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  maskedPan: string;     // MUST be masked in response — PCI Req 3
  lastFour: string;
  timestamp: string;
  merchantId: string;
}

export type TransactionStatus = 'approved' | 'declined' | 'pending' | 'error';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: AuditAction;
  resource: string;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure';
  details?: Record<string, string>;
}

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_COMPLETED'
  | 'CARD_DATA_ACCESSED'
  | 'CONFIG_CHANGED'
  | 'AUTH_FAILED'
  | 'PERMISSION_DENIED';

// ─── API Response Wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  version: string;
}

// ─── Test Utilities ───────────────────────────────────────────────────────────

export interface TestUser {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface PCITestContext {
  token?: string;
  userId?: string;
  role?: UserRole;
  transactionId?: string;
}