import authService from './auth.service';
import { query } from '../config/database';
import { comparePassword } from '../utils/password.utils';
import { AppError } from '../middleware/error.middleware';

// Mock dependencies
jest.mock('../config/database');
jest.mock('../utils/password.utils');
jest.mock('../utils/jwt.utils');

const mockQuery = query as jest.Mock;
const mockComparePassword = comparePassword as jest.Mock;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password_hash: 'hashedPassword',
      role_name: 'Student',
      access_failed_count: 4, // 1 more fail will reach 5
      account_lock: false,
      active_or_archive: true,
    };

    it('should lock account after 5th failed attempt', async () => {
      // Mock finding user
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      // Mock invalid password
      mockComparePassword.mockResolvedValue(false);

      // Mock the update query (which we expect to verify)
      mockQuery.mockResolvedValueOnce({ rows: [] });

      try {
        await authService.login('test@example.com', 'wrongpassword');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).message).toBe('Account is locked');
      }

      // Verify queries
      // 1. Find user
      expect(mockQuery).toHaveBeenNthCalledWith(1,
        expect.stringContaining('SELECT u.*'),
        ['test@example.com']
      );

      // 2. Update failed count (and hopefully lock)
      // Current implementation only increments count
      // We want to VERIFY that it attempts to lock (which should fail now)

      const updateCall = mockQuery.mock.calls[1];
      expect(updateCall).toBeDefined();

      // With current implementation, it just updates count
      // 'UPDATE app_users SET access_failed_count = access_failed_count + 1 WHERE id = $1'

      const updateQuery = updateCall[0];

      // In the new implementation, we expect 'account_lock = true'
      // So checking for it now should FAIL
      expect(updateQuery).toContain('account_lock = true');
    });
  });
});
