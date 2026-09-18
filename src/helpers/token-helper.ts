/**
 * Token Helper
 * JWT generation, manipulation, and validation utilities for auth testing
 * PCI-DSS Req 8 — Authentication and access control
 */

import jwt from 'jsonwebtoken';
import { JWTPayload, UserRole } from '../types';

const TEST_SECRET = 'pci-test-secret-key-not-for-production';