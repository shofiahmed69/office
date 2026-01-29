/**
 * Run all endpoint tests. Server must be running on PORT (default 3001).
 * Usage: node test-endpoints.js
 */
require('dotenv').config();
const http = require('http');

const BASE = `http://localhost:${process.env.PORT || 3001}`;
let profileId = null;
let tagId = null;
let aiSettingId = null;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = { method, hostname: url.hostname, port: url.port, path: url.pathname + url.search };
    opts.headers = { 'Content-Type': 'application/json', ...headers };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`  OK: ${name}`);
    return true;
  } catch (e) {
    console.log(`  FAIL: ${name}`);
    console.log(`    ${e.message}`);
    if (e.response) console.log(`    Response: ${JSON.stringify(e.response)}`);
    return false;
  }
}

async function main() {
  console.log('Testing endpoints at', BASE);
  console.log('');

  await test('GET /health', async () => {
    const r = await request('GET', '/health');
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (r.data && r.data.database !== 'connected') throw new Error('DB not connected');
  });

  await test('POST /profiles (create profile)', async () => {
    const r = await request('POST', '/profiles', {
      email: 'test@example.com',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      primary_role: 'Student',
    });
    if (r.status !== 201) throw new Error(`status ${r.status}: ${JSON.stringify(r.data)}`);
    if (!r.data || !r.data.id) throw new Error('No id in response');
    profileId = r.data.id;
  });

  if (!profileId) {
    console.log('Could not create profile; trying existing profile id 1 for remaining tests.');
    profileId = 1;
  }

  const me = (path, opts = {}) => request(opts.method || 'GET', path, opts.body, { 'X-User-Id': String(profileId) });

  await test('GET /api/users/me', async () => {
    const r = await me('/api/users/me');
    if (r.status !== 200) throw new Error(`status ${r.status}: ${JSON.stringify(r.data)}`);
    if (!r.data || !r.data.success || !r.data.data) throw new Error('Invalid response shape');
  });

  await test('PATCH /api/users/me', async () => {
    const r = await me('/api/users/me', { method: 'PATCH', body: { firstName: 'John', lastName: 'Doe', city: 'Mumbai', state: 'MH' } });
    if (r.status !== 200) throw new Error(`status ${r.status}: ${JSON.stringify(r.data)}`);
    if (!r.data || !r.data.success || r.data.data?.updated !== true) throw new Error('Expected { success: true, data: { updated: true } }');
  });

  await test('GET /api/users/me/roles', async () => {
    const r = await me('/api/users/me/roles');
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!r.data || !r.data.success || !Array.isArray(r.data.data?.roles)) throw new Error('Expected { success, data: { roles: [] } }');
  });

  await test('GET /api/users/me/permissions', async () => {
    const r = await me('/api/users/me/permissions');
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!r.data || !r.data.success || !Array.isArray(r.data.data?.permissions)) throw new Error('Expected { success, data: { permissions: [] } }');
  });

  await test('GET /api/users/me/preferences', async () => {
    const r = await me('/api/users/me/preferences');
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!r.data || !r.data.success) throw new Error('Expected success');
  });

  await test('PATCH /api/users/me/preferences', async () => {
    const r = await me('/api/users/me/preferences', {
      method: 'PATCH',
      body: { timezone: 'Asia/Kolkata', weeklyStudyHours: 12, learningStyle: 'auditory', availableTimes: [{ day: 'tue', start: '19:00', end: '22:00' }] },
    });
    if (r.status !== 200) throw new Error(`status ${r.status}: ${JSON.stringify(r.data)}`);
    if (!r.data || !r.data.success || r.data.data?.updated !== true) throw new Error('Expected { updated: true }');
  });

  await test('GET /api/users/me/tags', async () => {
    const r = await me('/api/users/me/tags');
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!r.data || !r.data.success || !r.data.data || !('tags' in r.data.data)) throw new Error('Expected { success, data: { tags } }');
  });

  await test('POST /api/users/me/tags', async () => {
    const r = await me('/api/users/me/tags', {
      method: 'POST',
      body: { tagName: 'JavaScript', tagValue: 'Intermediate', ratingScore: 7, sourceType: 'manual' },
    });
    if (r.status !== 201) throw new Error(`status ${r.status}: ${JSON.stringify(r.data)}`);
    if (!r.data || !r.data.success || r.data.data?.tagId == null) throw new Error('Expected { success, data: { tagId } }');
    tagId = r.data.data.tagId;
  });

  await test('GET /api/users/me/tags (with tag)', async () => {
    const r = await me('/api/users/me/tags');
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!r.data?.data?.tags?.length) throw new Error('Expected at least one tag');
  });

  if (tagId) {
    await test('DELETE /api/users/me/tags/:id', async () => {
      const r = await me(`/api/users/me/tags/${tagId}`, { method: 'DELETE' });
      if (r.status !== 200) throw new Error(`status ${r.status}: ${JSON.stringify(r.data)}`);
      if (!r.data || !r.data.success || r.data.data?.deleted !== true) throw new Error('Expected { deleted: true }');
    });
  }

  await test('GET /api/users/me/ai-settings', async () => {
    const r = await me('/api/users/me/ai-settings');
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    if (!r.data || !r.data.success || !Array.isArray(r.data.data)) throw new Error('Expected data to be array');
  });

  await test('POST /api/users/me/ai-settings', async () => {
    const r = await me('/api/users/me/ai-settings', {
      method: 'POST',
      body: { providerName: 'OpenAI', model: 'gpt-4', isActive: true },
    });
    if (r.status !== 201) throw new Error(`status ${r.status}: ${JSON.stringify(r.data)}`);
    if (!r.data || !r.data.success || !r.data.data?.id) throw new Error('Expected { success, data: { id } }');
    aiSettingId = r.data.data.id;
  });

  if (aiSettingId) {
    await test('PATCH /api/users/me/ai-settings/:id', async () => {
      const r = await me(`/api/users/me/ai-settings/${aiSettingId}`, { method: 'PATCH', body: { model: 'gpt-4-turbo', isActive: false } });
      if (r.status !== 200) throw new Error(`status ${r.status}: ${JSON.stringify(r.data)}`);
      if (!r.data || !r.data.success) throw new Error('Expected success');
    });
  }

  if (aiSettingId) {
    await test('DELETE /api/users/me/ai-settings/:id', async () => {
      const r = await me(`/api/users/me/ai-settings/${aiSettingId}`, { method: 'DELETE' });
      if (r.status !== 200) throw new Error(`status ${r.status}: ${JSON.stringify(r.data)}`);
      if (!r.data || !r.data.success || r.data.data?.deleted !== true) throw new Error('Expected { deleted: true }');
    });
  }

  await test('GET /api/users/me without auth (expect 401)', async () => {
    const r = await request('GET', '/api/users/me');
    if (r.status !== 401) throw new Error(`expected 401, got ${r.status}`);
  });

  console.log('');
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
