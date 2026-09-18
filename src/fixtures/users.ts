/**
 * Test User Fixtures
 * All users are mock/fake — for testing RBAC and auth scenarios (PCI Req 7, 8)
 */

import { TestUser } from '../types';

export const users: Record<string, TestUser> = {
  admin: {
    id: 'usr_admin_001',
    username: 'admin@pcitest.local',
    password: 'Admin$ecure#2024',
    role: 'admin'
  },
  merchant: {
    id: 'usr_merchant_001',
    username: 'merchant@pcitest.local',
    password: 'Merchant$ecure#2024',
    role: 'merchant'
  },
  readonly: {
    id: 'usr_readonly_001',
    username: 'readonly@pcitest.local',
    password: 'Readonly$ecure#2024',
    role: 'readonly'
  },
  guest: {
    id: 'usr_guest_001',
    username: 'guest@pcitest.local',
    password: 'Guest$ecure#2024',
    role: 'guest'
  }
};

// PCI Req 8.3 - brute force lockout simulation
export const invalidCredentials = [
  { username: 'admin@pcitest.local', password: 'wrongpassword1' },
  { username: 'admin@pcitest.local', password: 'wrongpassword2' },
  { username: 'admin@pcitest.local', password: 'wrongpassword3' },
  { username: 'admin@pcitest.local', password: 'wrongpassword4' },
  { username: 'admin@pcitest.local', password: 'wrongpassword5' },
  { username: 'admin@pcitest.local', password: 'wrongpassword6' } // Should trigger lockout
];

// PCI Req 2.1 - weak credentials should be rejected (e.g., too short, common passwords)
export const defaultCredentials = [
  { username: 'admin', password: 'admin' },
  { username: 'admin', password: 'password' },
  { username: 'root', password: 'root' },
  { username: 'test', password: 'test' },
  { username: 'admin', password: '1234' }
];