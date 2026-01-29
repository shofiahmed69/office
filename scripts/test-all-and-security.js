/**
 * Full endpoint + security test. Run: node scripts/test-all-and-security.js
 * Requires server on PORT from .env (default 3001).
 */
require('dotenv').config();
const base = `http://localhost:${process.env.PORT || 3001}`;

const results = { passed: 0, failed: 0, tests: [] };

function log(name, status, detail) {
  const ok = status === 'PASS';
  results[ok ? 'passed' : 'failed']++;
  results.tests.push({ name, status: ok ? 'PASS' : 'FAIL', detail });
  const icon = ok ? '✓' : '✗';
  console.log(`${icon} ${name}: ${ok ? 'PASS' : 'FAIL'}${detail ? ' – ' + detail : ''}`);
}

async function request(method, path, body = null, token = null, contentType = 'application/json') {
  const opts = { method, headers: {} };
  if (contentType) opts.headers['Content-Type'] = contentType;
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body && contentType === 'application/json') opts.body = JSON.stringify(body);
  else if (body) opts.body = body;
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
  console.log('========== ENDPOINT & SECURITY TESTS ==========\n');

  const testEmail = `sec-test-${Date.now()}@example.com`;
  const password = 'SecurePass123!';
  let accessToken, refreshToken, resetToken, otp;

  // ---- Public / Health ----
  let r = await request('GET', '/health');
  log('GET /health', r.status === 200 && r.data?.success ? 'PASS' : 'FAIL', r.data?.message);

  r = await request('GET', '/api/db/test');
  log('GET /api/db/test', r.status === 200 && r.data?.success ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Register ----
  r = await request('POST', '/api/auth/register', { email: testEmail, password, name: 'Security Test' });
  const regOk = r.status === 201 && r.data?.success && r.data?.data?.user && r.data?.data?.accessToken;
  log('POST /api/auth/register', regOk ? 'PASS' : 'FAIL', r.data?.message);
  if (regOk) {
    accessToken = r.data.data.accessToken;
    refreshToken = r.data.data.refreshToken;
  }
  if (r.data?.data?.user?.password_hash) log('Register does not expose password_hash', 'FAIL', 'password_hash in response');
  else if (regOk) log('Register does not expose password_hash', 'PASS');

  // ---- Validation: register missing email ----
  r = await request('POST', '/api/auth/register', { password: 'valid123' });
  log('Register rejects missing email', r.status === 400 ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Validation: register invalid email ----
  r = await request('POST', '/api/auth/register', { email: 'notanemail', password: 'valid123' });
  log('Register rejects invalid email', r.status === 400 ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Validation: short password ----
  r = await request('POST', '/api/auth/register', { email: 'a@b.com', password: '12345' });
  log('Register rejects short password (<6)', r.status === 400 ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Duplicate register ----
  r = await request('POST', '/api/auth/register', { email: testEmail, password: 'otherpass123' });
  log('Register rejects duplicate email (409)', r.status === 409 ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Login ----
  r = await request('POST', '/api/auth/login', { email: testEmail, password });
  const loginOk = r.status === 200 && r.data?.success && r.data?.data?.accessToken;
  log('POST /api/auth/login', loginOk ? 'PASS' : 'FAIL', r.data?.message);
  if (loginOk) {
    accessToken = r.data.data.accessToken;
    refreshToken = r.data.data.refreshToken;
  }

  // ---- Login wrong password ----
  r = await request('POST', '/api/auth/login', { email: testEmail, password: 'WrongPassword123' });
  log('Login rejects wrong password (401)', r.status === 401 ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Login non-existent user ----
  r = await request('POST', '/api/auth/login', { email: 'nonexistent@example.com', password: 'any' });
  log('Login rejects non-existent email (401)', r.status === 401 ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Protected: /me with token ----
  r = await request('GET', '/api/auth/me', null, accessToken);
  log('GET /api/auth/me with valid token', r.status === 200 && r.data?.data?.user ? 'PASS' : 'FAIL', r.data?.data?.user?.email);

  // ---- Protected: /me without token ----
  r = await request('GET', '/api/auth/me');
  log('GET /api/auth/me without token returns 401', r.status === 401 ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Protected: /me with invalid token (401 or 403 = rejected) ----
  r = await request('GET', '/api/auth/me', null, 'invalid.jwt.token');
  log('GET /api/auth/me with invalid token rejected (401/403)', (r.status === 401 || r.status === 403) ? 'PASS' : 'FAIL', r.data?.code || r.data?.message);

  // ---- Refresh ----
  r = await request('POST', '/api/auth/refresh', { refreshToken });
  const refreshOk = r.status === 200 && r.data?.success && r.data?.data?.accessToken;
  log('POST /api/auth/refresh', refreshOk ? 'PASS' : 'FAIL', refreshOk ? 'new accessToken' : r.data?.message);
  if (refreshOk) accessToken = r.data.data.accessToken;

  // ---- Refresh with invalid token ----
  r = await request('POST', '/api/auth/refresh', { refreshToken: 'invalid' });
  log('Refresh rejects invalid token (403)', r.status === 403 ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Logout (protected) ----
  r = await request('POST', '/api/auth/logout', null, accessToken);
  log('POST /api/auth/logout', r.status === 200 && r.data?.success ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Forgot password ----
  r = await request('POST', '/api/auth/forgot-password', { email: testEmail });
  const forgotOk = r.status === 200 && r.data?.success;
  log('POST /api/auth/forgot-password', forgotOk ? 'PASS' : 'FAIL', r.data?.message);
  if (r.data?.otp) otp = r.data.otp;

  // ---- Forgot password invalid email (still 200, no user enumeration) ----
  r = await request('POST', '/api/auth/forgot-password', { email: 'nonexistent@test.com' });
  log('Forgot-password does not reveal if email exists (200)', r.status === 200 ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Verify OTP ----
  r = await request('POST', '/api/auth/verify-otp', { email: testEmail, otp: otp || '000000' });
  const verifyOk = r.status === 200 && r.data?.success && r.data?.data?.resetToken;
  log('POST /api/auth/verify-otp', verifyOk ? 'PASS' : 'FAIL', r.data?.message);
  if (verifyOk) resetToken = r.data.data.resetToken;

  // ---- Verify OTP wrong OTP ----
  r = await request('POST', '/api/auth/verify-otp', { email: testEmail, otp: '999999' });
  log('Verify-OTP rejects wrong OTP (401)', r.status === 401 ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Reset password ----
  const newPassword = 'NewSecurePass456!';
  r = await request('POST', '/api/auth/reset-password', { resetToken: resetToken || 'x', newPassword });
  log('POST /api/auth/reset-password', r.status === 200 && r.data?.success ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Reset password invalid token ----
  r = await request('POST', '/api/auth/reset-password', { resetToken: 'invalid', newPassword: 'valid123' });
  log('Reset-password rejects invalid token (401)', r.status === 401 ? 'PASS' : 'FAIL', r.data?.message);

  // ---- Login with new password ----
  r = await request('POST', '/api/auth/login', { email: testEmail, password: newPassword });
  log('Login with new password after reset', r.status === 200 && r.data?.success ? 'PASS' : 'FAIL', r.data?.message);

  // ---- SQL injection attempt (email) ----
  r = await request('POST', '/api/auth/login', {
    email: "admin'--",
    password: 'anything',
  });
  log('Login SQL injection in email (safe)', r.status === 401 || r.status === 400 ? 'PASS' : 'FAIL', 'parameterized query');

  // ---- 404 for unknown route ----
  r = await request('GET', '/api/auth/nonexistent');
  log('Unknown route returns 404', r.status === 404 ? 'PASS' : 'FAIL', r.data?.message);

  console.log('\n========== SUMMARY ==========');
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Total:  ${results.passed + results.failed}`);
  if (results.failed > 0) {
    console.log('\nFailed tests:');
    results.tests.filter((t) => t.status === 'FAIL').forEach((t) => console.log('  -', t.name, t.detail));
    process.exit(1);
  }
  console.log('\nAll tests passed.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
