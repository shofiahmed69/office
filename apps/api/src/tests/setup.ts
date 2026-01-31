// Test setup and global mocks
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
// Must be at least 32 chars
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production-at-all';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-very-long-enough-now';
