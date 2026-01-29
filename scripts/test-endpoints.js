/**
 * Test all API endpoints. Run: node scripts/test-endpoints.js
 * Requires server running on PORT from .env (default 3001).
 */
require('dotenv').config();
const base = `http://localhost:${process.env.PORT || 3001}`;

async function request(method, path, body = null, token = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${base}${path}`, opts);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

async function run() {
  console.log('=== Testing all endpoints ===\n');
  let accessToken, refreshToken, resetToken;
  const testEmail = `test-${Date.now()}@example.com`;
  const password = 'password123';

  // 1. Health
  const h = await request('GET', '/health');
  console.log('1. GET /health', h.status, h.data.success ? 'OK' : 'FAIL', JSON.stringify(h.data));

  // 2. DB test
  const db = await request('GET', '/api/db/test');
  console.log('2. GET /api/db/test', db.status, db.data.success ? 'OK' : 'FAIL', JSON.stringify(db.data));

  // 3. Register
  const reg = await request('POST', '/api/auth/register', {
    email: testEmail,
    password,
    name: 'Test User',
  });
  if (reg.data.success && reg.data.data) {
    accessToken = reg.data.data.accessToken;
    refreshToken = reg.data.data.refreshToken;
  }
  console.log('3. POST /api/auth/register', reg.status, reg.data.success ? 'OK' : 'FAIL', reg.data.message || reg.data.message);

  // 4. Register duplicate (should fail 409)
  const regDup = await request('POST', '/api/auth/register', { email: testEmail, password: 'other123' });
  console.log('4. POST /api/auth/register (duplicate)', regDup.status, regDup.status === 409 ? 'OK (conflict)' : 'CHECK', regDup.data.message);

  // 5. Login
  const login = await request('POST', '/api/auth/login', { email: testEmail, password });
  if (login.data.success && login.data.data) {
    accessToken = login.data.data.accessToken;
    refreshToken = login.data.data.refreshToken;
  }
  console.log('5. POST /api/auth/login', login.status, login.data.success ? 'OK' : 'FAIL', login.data.message);

  // 6. Me (protected)
  const me = await request('GET', '/api/auth/me', null, accessToken);
  console.log('6. GET /api/auth/me', me.status, me.data.success ? 'OK' : 'FAIL', me.data.data?.user?.email || me.data.message);

  // 7. Refresh
  const ref = await request('POST', '/api/auth/refresh', { refreshToken });
  if (ref.data.success && ref.data.data) accessToken = ref.data.data.accessToken;
  console.log('7. POST /api/auth/refresh', ref.status, ref.data.success ? 'OK' : 'FAIL', ref.data.message || ref.data.data?.expiresIn);

  // 8. Logout
  const logout = await request('POST', '/api/auth/logout', null, accessToken);
  console.log('8. POST /api/auth/logout', logout.status, logout.data.success ? 'OK' : 'FAIL', logout.data.message);

  // 9. Forgot password (request OTP)
  const forgot = await request('POST', '/api/auth/forgot-password', { email: testEmail });
  const otp = forgot.data.otp; // dev returns OTP
  console.log('9. POST /api/auth/forgot-password', forgot.status, forgot.data.success ? 'OK' : 'FAIL', forgot.data.message, otp ? `(OTP: ${otp})` : '');

  // 10. Verify OTP
  const verify = await request('POST', '/api/auth/verify-otp', { email: testEmail, otp: otp || '000000' });
  if (verify.data.success && verify.data.data) resetToken = verify.data.data.resetToken;
  console.log('10. POST /api/auth/verify-otp', verify.status, verify.data.success ? 'OK' : 'FAIL', verify.data.message);

  // 11. Reset password
  const newPassword = 'newpassword456';
  const reset = await request('POST', '/api/auth/reset-password', { resetToken: resetToken || 'invalid', newPassword });
  console.log('11. POST /api/auth/reset-password', reset.status, reset.data.success ? 'OK' : 'FAIL', reset.data.message);

  // 12. Login with new password
  const loginNew = await request('POST', '/api/auth/login', { email: testEmail, password: newPassword });
  console.log('12. POST /api/auth/login (new password)', loginNew.status, loginNew.data.success ? 'OK' : 'FAIL', loginNew.data.message);

  // 13. Me without token – protected route must return 401 when no token
  const meNoToken = await request('GET', '/api/auth/me');
  console.log('13. GET /api/auth/me (no token)', meNoToken.status, meNoToken.status === 401 ? 'OK (unauthorized as expected)' : 'CHECK', meNoToken.data?.hint || '');

  console.log('\n=== Done ===');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
