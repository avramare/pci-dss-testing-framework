# PCI-DSS v4.0 Requirements Guide

> A practical reference for QA engineers and automation testers.  
> This document explains what each PCI-DSS requirement means, **why it exists**, and **how we test it** in this framework.

---

## What is PCI-DSS?

**Payment Card Industry Data Security Standard (PCI-DSS)** is a set of security requirements established by the PCI Security Standards Council (Visa, Mastercard, Amex, Discover, JCB) to protect cardholder data.

Any organisation that **stores, processes, or transmits** payment card data must comply. Non-compliance can result in fines, card scheme bans, and reputational damage.

---

## The 12 Requirements — Full Reference

###  Req 1 — Install and Maintain Network Security Controls
**What:** Firewalls, network segmentation, rules that restrict traffic between payment systems and untrusted networks.  
**Why:** Prevents attackers from reaching card data systems through unprotected network paths.  

---

###  Req 2 — Apply Secure Configurations to All System Components
**What:** No vendor-default passwords. Remove unnecessary services. Harden all system components.  
**Why:** Default credentials and exposed services are the first thing attackers exploit.  

---

###  Req 3 — Protect Stored Account Data
**What:** PAN (card number) must be masked or encrypted at rest. CVV must **never** be stored after authorisation. PAN must not appear in logs.  
**Why:** If a database is breached, unmasked PANs are immediately usable for fraud.

---

###  Req 4 — Protect Cardholder Data with Strong Cryptography During Transmission
**What:** All PAN transmission must use TLS 1.2 or higher. No card data over HTTP. HSTS enforced.  
**Why:** Man-in-the-middle attacks can intercept unencrypted payment data in transit.

---

###  Req 5 — Protect All Systems and Networks from Malicious Software
**What:** Anti-malware on all systems that could be affected by malware. Regular scans.  
**Why:** Malware (keyloggers, skimmers) can capture card data before encryption.

---

###  Req 6 — Develop and Maintain Secure Systems and Software
**What:** Patch management, secure SDLC, code review, OWASP Top 10 protections. No injection vulnerabilities. Security headers required.  
**Why:** Unpatched and insecure applications are the most common attack vector.  
**OWASP coverage required:**
- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection (SQL, XSS, NoSQL)
- A05: Security Misconfiguration
- A07: Identification/Authentication Failures

---

###  Req 7 — Restrict Access to System Components and Cardholder Data by Business Need
**What:** Least-privilege access. Role-based access control. No unnecessary access to card systems.  
**Why:** Limiting who can access what reduces blast radius of both external attacks and insider threats.

---

###  Req 8 — Identify Users and Authenticate Access to System Components
**What:** Unique IDs for all users. Strong passwords. MFA. Account lockout. Token expiry. No shared credentials.  
**Why:** Shared or weak credentials make it impossible to attribute actions to specific individuals.  
**Key controls:**
- Lockout after ≤ 6 failed attempts (Req 8.3.4)
- Passwords ≥ 12 characters
- Session idle timeout ≤ 15 minutes
- Tokens must expire

---

###  Req 9 — Restrict Physical Access to Cardholder Data
**What:** Physical security of data centres, POS terminals, server rooms, paper records.  
**Why:** Physical access to hardware bypasses all software security.

---

###  Req 10 — Log and Monitor All Access to System Components and Cardholder Data
**What:** Audit logs for all sensitive actions. Logs must include: who, what, when, where, outcome. Logs must be tamper-evident and retained ≥ 12 months.  
**Why:** Without logs, you can't detect breaches, investigate incidents, or prove compliance.  
**Required log events:**
- All logins (success + failure)
- All cardholder data access
- All admin actions
- All auth failures and permission denials

---

###  Req 11 — Test Security of Systems and Networks Regularly
**What:** Vulnerability scanning (quarterly), penetration testing (annual), intrusion detection.  
**Why:** New vulnerabilities emerge constantly — periodic testing catches what wasn't a problem before.

---

###  Req 12 — Support Information Security with Organizational Policies
**What:** Written security policies. Risk assessments. Vendor management. Incident response plans. Security awareness training.  
**Why:** Technical controls alone aren't enough — people and processes must support them.

---