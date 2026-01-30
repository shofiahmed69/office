/**
 * Test all admin API endpoints and DB connectivity.
 * Run: node scripts/test-endpoints.js
 * Requires server running on PORT (default 3001).
 */
const BASE = process.env.API_BASE || 'http://localhost:3001';

const REQUEST_TIMEOUT_MS = 15000;

async function request(method, path, body) {
  const url = path.startsWith('http') ? path : BASE + path;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  opts.signal = controller.signal;
  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    clearTimeout(timeoutId);
    return { status: 0, ok: false, data: { error: err.message || 'Request failed' } };
  }
  clearTimeout(timeoutId);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  const results = [];
  const log = (name, r) => {
    const ok = r.ok ? 'OK' : 'FAIL';
    const status = r.status;
    const dbRelated = r.data?.data?.items !== undefined || r.data?.data?.pagination !== undefined || r.data?.data?.updated !== undefined || r.data?.data?.promptId !== undefined || r.data?.data?.published !== undefined || r.data?.data?.retried !== undefined;
    results.push({ name, ok, status, dbRelated, data: r.data });
    console.log(`  ${ok} ${status}  ${name}`);
    if (!r.ok && r.data?.error) console.log('      error:', r.data.error);
  };

  console.log('\n--- Health & connectivity ---\n');
  const health = await request('GET', '/health');
  log('GET /health', health);
  if (!health.ok) {
    console.error('Server not responding at', BASE);
    process.exit(1);
  }

  console.log('\n--- Admin endpoints (DB/Redis) ---\n');
  log('GET /api/admin/users?page=1&limit=5', await request('GET', '/api/admin/users?page=1&limit=5'));
  log('GET /api/admin/audit-logs?page=1&limit=5', await request('GET', '/api/admin/audit-logs?page=1&limit=5'));
  log('GET /api/admin/jobs', await request('GET', '/api/admin/jobs'));
  log('POST /api/admin/prompts', await request('POST', '/api/admin/prompts', {
    title: 'Test Prompt',
    category: 'test',
    promptTemplate: 'Hello {{name}}',
    isPublished: false,
  }));
  let promptId = results.find(r => r.name.startsWith('POST /api/admin/prompts'))?.data?.data?.promptId;
  if (promptId) {
    log('PATCH /api/admin/prompts/' + promptId + '/publish', await request('PATCH', `/api/admin/prompts/${promptId}/publish`, { isPublished: true }));
  }
  const usersRes = await request('GET', '/api/admin/users?page=1&limit=1');
  log('GET /api/admin/users (list)', usersRes);
  const userId = usersRes.data?.data?.items?.[0]?.id;
  if (userId) {
    log('PATCH /api/admin/users/' + userId + '/lock', await request('PATCH', `/api/admin/users/${userId}/lock`, { locked: false, reason: 'test' }));
  } else {
    results.push({ name: 'PATCH /api/admin/users/:id/lock', ok: 'SKIP', status: '-', dbRelated: true, data: 'No users in DB' });
    console.log('  SKIP -   PATCH /api/admin/users/:id/lock (no users)');
  }
  log('POST /api/admin/jobs/job_123/retry', await request('POST', '/api/admin/jobs/job_123/retry'));

  console.log('\n--- Summary ---\n');
  const failed = results.filter(r => r.ok === 'FAIL');
  const passed = results.filter(r => r.ok === 'OK');
  const skipped = results.filter(r => r.ok === 'SKIP');
  console.log(`Passed: ${passed.length}, Failed: ${failed.length}, Skipped: ${skipped.length}`);
  console.log('\nDatabase-connected: GET/PATCH users (app_users), GET audit-logs (audit_logs), POST/PATCH prompts (master_ai_prompt_libraries)');
  console.log('Redis-connected: GET jobs, POST jobs/:jobId/retry (returns empty/ok when Redis down)');
  if (failed.length) {
    failed.forEach(r => console.log('  FAIL:', r.name, r.data));
    process.exit(1);
  }
  console.log('\nAll endpoint tests passed.\n');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
