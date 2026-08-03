# Payment UI — Field Reference & PCI-DSS Compliance Guide

> This document explains every field on the payment checkout form, the PCI-DSS requirement it satisfies,
> and how automated UI tests verify compliance.

---

## The Payment Form

The mock payment UI is served at `http://localhost:3000` by the Express mock server.  
It simulates a real-world card-not-present (CNP) checkout form.

---

## Field Specifications

### 1. Cardholder Name

| Property | Value |
|----------|-------|
| `id` | `cardholderName` |
| `data-testid` | `cardholder-name` |
| `type` | `text` |
| `autocomplete` | `cc-name` |
| `maxlength` | 64 |
| `required` | Yes |
| **PCI Requirement** | 6.4.3 (form field standards) |

**Purpose:** Identifies the card account holder.  
**PCI Note:** Not classified as Sensitive Authentication Data (SAD). `cc-name` autocomplete is permitted — it does not expose financial data.  

---

### 2. Card Number (PAN)

| Property | Value |
|----------|-------|
| `id` | `cardNumber` |
| `data-testid` | `card-number` |
| `type` | `text` |
| `autocomplete` | `off` ← **Required by PCI** |
| `inputmode` | `numeric` |
| `maxlength` | `19` (16 digits + 3 spaces) |
| `required` | Yes |
| **PCI Requirement** | 3.3, 6.4.3 |

**Purpose:** The Primary Account Number (PAN) — 16-digit card identifier.  
**PCI Note:**
- `autocomplete="off"` is **mandatory** — prevents browser from caching the PAN
- JavaScript formats input as `XXXX XXXX XXXX XXXX` for readability
- Full PAN must **never** appear in: DOM after submission, localStorage, sessionStorage, cookies, page source, server responses, or logs

**Display after submission:** `**** **** **** 1111` (last 4 only)

---

### 3. Expiry Date

| Property | Value |
|----------|-------|
| `id` | `expiry` |
| `data-testid` | `expiry-date` |
| `type` | `text` |
| `autocomplete` | `off` ← **Required by PCI** |
| `maxlength` | `5` (MM/YY) |
| `placeholder` | `MM/YY` |
| `required` | Yes |
| **PCI Requirement** | 3.3, 6.4.3 |

**Purpose:** Card validity period.  
**PCI Note:**
- Expiry date is considered **Cardholder Data (CHD)** when stored with PAN
- Alone (without PAN) it has limited risk, but `autocomplete="off"` still required
- JavaScript auto-inserts `/` separator after MM entry

---

### 4. CVV / Security Code

| Property | Value |
|----------|-------|
| `id` | `cvv` |
| `data-testid` | `cvv` |
| `type` | `password` ← **Required by PCI** |
| `autocomplete` | `off` ← **Required by PCI** |
| `maxlength` | `4` |
| `placeholder` | `•••` |
| `required` | Yes |
| **PCI Requirement** | 3.3.2, 6.4.3 |

**Purpose:** Card Verification Value — 3-digit (Visa/MC) or 4-digit (Amex) code.  
**PCI Note — this is the most sensitive field:**
- CVV is **Sensitive Authentication Data (SAD)** — must **never** be stored anywhere after authorisation
- Must use `type="password"` so characters are visually masked
- Must be `autocomplete="off"` — browsers must not store it
- Must be **cleared from the field** after successful payment (our JS does this)
- Must **never** appear in: API responses, logs, DOM, localStorage, sessionStorage, or cookies

---

### 5. Pay Button

| Property | Value |
|----------|-------|
| `id` | `payBtn` |
| `data-testid` | `pay-button` |
| `type` | `submit` |

**Behaviour:**
1. Authenticates with mock server (obtains JWT, stores in sessionStorage only)
2. POSTs card data to `/api/payments`
3. Displays masked result (or error)
4. Clears CVV and card number fields

---

### 6. Result Panel

| Property | Value |
|----------|-------|
| `id` | `result` |
| `data-testid` | `result-panel` |
| `role` | `alert` |
| `aria-live` | `polite` |

**Displays:**
- Transaction ID
- **Masked PAN** (`**** **** **** XXXX`) — never full PAN
- Amount and currency
- Error messages (no internal detail)

**PCI Note:** Result panel must only display `maskedPan` from the API response, never the full card number.

---