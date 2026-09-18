/**
 * Test Card Fixtures
 * (PCI Req 3)
 * Do not use these in production or with real card data.
 */

import { CardData, CardInput } from '../types';

// ─── Valid Test Cards ─────────────────────────────────────────────────────────

export const validCards: CardInput[] = [
  {
    pan: '4111111111111111',
    maskedPan: '**** **** **** 1111',
    lastFour: '1111',
    expiryMonth: '12',
    expiryYear: '2027',
    cardholderName: 'John Doe',
    cvv: '123',
    brand: 'visa'
  },
  {
    pan: '4242424242424242',
    maskedPan: '**** **** **** 4242',
    lastFour: '4242',
    expiryMonth: '08',
    expiryYear: '2026',
    cardholderName: 'Jane Smith',
    cvv: '456',
    brand: 'visa'
  },
  {
    pan: '5500005555555559',
    maskedPan: '**** **** **** 5559',
    lastFour: '5559',
    expiryMonth: '03',
    expiryYear: '2028',
    cardholderName: 'Bob Johnson',
    cvv: '789',
    brand: 'mastercard'
  }
];

// ─── Invalid / Expired Cards ──────────────────────────────────────────────────

export const expiredCard: CardInput = {
  pan: '4111111111111111',
  maskedPan: '**** **** **** 1111',
  lastFour: '1111',
  expiryMonth: '01',
  expiryYear: '2020',
  cardholderName: 'Old User',
  cvv: '000',
  brand: 'visa'
};

export const invalidLuhnCard: CardInput = {
  pan: '4111111111111112', // Fails Luhn check
  maskedPan: '**** **** **** 1112',
  lastFour: '1112',
  expiryMonth: '12',
  expiryYear: '2027',
  cardholderName: 'Bad Card',
  cvv: '123',
  brand: 'visa'
};

// ─── Masking Reference ────────────────────────────────────────────────────────
// Used for API response verification never return full PAN in production, only masked PAN and last four digits.

export const maskingExpectations: Record<string, string> = {
  '4111111111111111': '**** **** **** 1111',
  '4242424242424242': '**** **** **** 4242',
  '5500005555555559': '**** **** **** 5559'
};

// ─── Cards Without CVV ────────────────────────────────────────────────────────
// Stripped versions so responses never echo back CVV values.
export const sanitizedCards: CardData[] = validCards.map(({ cvv, ...card }) => card);