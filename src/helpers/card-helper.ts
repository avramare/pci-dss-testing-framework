/**
 * Card Helper Utilities
 * PAN masking verification, Luhn validation, and card data sanitization checks
 * PCI-DSS Req 3 — Protect Stored Account Data
 */

/**
 * Verifies a PAN is properly masked
 * PCI-DSS 3.3: Display no more than first 6 / last 4 digits
 * Accepts: **** **** **** 4242 or ************4242
 */
export function isMaskedCorrectly(masked: string): boolean { 
  const pattern = /^[\*\s]{12,}\d{4}$/;
  return pattern.test(masked.replace(/\s/g, ''));
}

/**
 * Luhn algorithm validation
 * Used to generate valid-looking test PANs that pass format checks
 */
export function isValidLuhn(pan: string): boolean {
  const digits = pan.replace(/\D/g, '').split('').reverse().map(Number);
  const sum = digits.reduce((acc, digit, i) => {
    if (i % 2 !== 0) {
      const doubled = digit * 2;
      return acc + (doubled > 9 ? doubled - 9 : doubled);
    }
    return acc + digit;
  }, 0);
  return sum % 10 === 0;
}

/**
 * Checks that a full PAN does NOT appear in a given string (API response, log, etc.)
 * Critical for ensuring no accidental PAN leakage
 */
export function containsFullPan(text: string, pan: string): boolean {
  return text.includes(pan);
}

/**
 * Checks that CVV does not appear in a response string
 */
export function containsCvv(text: string, cvv: string): boolean {
  return text.includes(cvv);
}

/**
 * Extract last 4 digits from a PAN or masked PAN
 */
export function extractLastFour(pan: string): string {
  const clean = pan.replace(/\D/g, '');
  return clean.slice(-4);
}

/**
 * Verify a response object contains no sensitive fields
 * Used across API tests to assert clean responses
 */
export function assertNoPanLeakage(responseBody: unknown, fullPan: string): void {
  const bodyString = JSON.stringify(responseBody);
  if (bodyString.includes(fullPan)) {
    throw new Error(
      `PCI VIOLATION: Full PAN "${fullPan.slice(0, 6)}...${fullPan.slice(-4)}" found in response body`
    );
  }
}

export function assertNoCvvLeakage(responseBody: unknown, cvv: string): void {
  const bodyString = JSON.stringify(responseBody);
  // Simple check — real implementation would need context-aware search
  if (bodyString.includes(`"cvv":"${cvv}"`) || bodyString.includes(`"cvv": "${cvv}"`)) {
    throw new Error(`PCI VIOLATION: CVV found in response body`);
  }
}