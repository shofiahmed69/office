/**
 * Database schema used by the backend.
 * If your existing DB uses different table/column names, change them here.
 */
module.exports = {
  table: 'users',
  columns: {
    id: 'id',
    email: 'email',
    passwordHash: 'password_hash',
    name: 'name',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    otp: 'otp',
    otpExpiresAt: 'otp_expires_at',
  },
};
