/**
 * Tests all master data and courses endpoints and verifies they hit the main database.
 * Run: node scripts/test-endpoints.js
 * Base URL is read from BASE_URL env or http://localhost:3001
 */

const BASE = process.env.BASE_URL || 'http://localhost:3001';

const tests = [
  {
    name: 'GET /api/master/countries',
    method: 'GET',
    url: `${BASE}/api/master/countries`,
    expectFromDb: (data) =>
      data.success &&
      Array.isArray(data.data?.items) &&
      data.data.items.some((c) => c.id === 104 && c.name === 'India' && c.countryPhoneCode === '+91'),
  },
  {
    name: 'GET /api/master/states?countryId=104',
    method: 'GET',
    url: `${BASE}/api/master/states?countryId=104`,
    expectFromDb: (data) =>
      data.success &&
      Array.isArray(data.data?.items) &&
      data.data.items.some((s) => s.id === 1 && s.name === 'Maharashtra' && s.masterCountryId === 104),
  },
  {
    name: 'GET /api/master/cities?stateId=1',
    method: 'GET',
    url: `${BASE}/api/master/cities?stateId=1`,
    expectFromDb: (data) =>
      data.success &&
      Array.isArray(data.data?.items) &&
      data.data.items.some((c) => c.id === 10 && c.name === 'Mumbai' && c.masterStateId === 1),
  },
  {
    name: 'GET /api/master/timezones',
    method: 'GET',
    url: `${BASE}/api/master/timezones`,
    expectFromDb: (data) =>
      data.success &&
      Array.isArray(data.data?.items) &&
      data.data.items.some(
        (t) => t.id === 1 && t.utcOffsetMinutes === 330 && t.timezoneName?.includes('India')
      ),
  },
  {
    name: 'GET /api/master/languages',
    method: 'GET',
    url: `${BASE}/api/master/languages`,
    expectFromDb: (data) =>
      data.success &&
      Array.isArray(data.data?.items) &&
      data.data.items.some((l) => l.id === 1 && l.name === 'English'),
  },
  {
    name: 'GET /api/master/hubs',
    method: 'GET',
    url: `${BASE}/api/master/hubs`,
    expectFromDb: (data) =>
      data.success &&
      Array.isArray(data.data?.items) &&
      data.data.items.some((h) => h.id === 1 && h.name === 'Mumbai Hub' && h.masterCountryId === 104),
  },
  {
    name: 'GET /api/master/hubs?countryId=104',
    method: 'GET',
    url: `${BASE}/api/master/hubs?countryId=104`,
    expectFromDb: (data) =>
      data.success && Array.isArray(data.data?.items) && data.data.items.length >= 1,
  },
  {
    name: 'GET /api/master/tags/groups',
    method: 'GET',
    url: `${BASE}/api/master/tags/groups`,
    expectFromDb: (data) =>
      data.success &&
      Array.isArray(data.data?.items) &&
      data.data.items.some((g) => g.id === 29 && g.name === 'Skill Tags'),
  },
  {
    name: 'GET /api/master/tags/categories?groupId=29',
    method: 'GET',
    url: `${BASE}/api/master/tags/categories?groupId=29`,
    expectFromDb: (data) =>
      data.success &&
      Array.isArray(data.data?.items) &&
      data.data.items.some((c) => c.id === 60 && c.name === 'Skill Level' && c.masterTagGroupId === 29),
  },
  {
    name: 'GET /api/master/tags?categoryId=60',
    method: 'GET',
    url: `${BASE}/api/master/tags?categoryId=60`,
    expectFromDb: (data) =>
      data.success &&
      Array.isArray(data.data?.items) &&
      data.data.items.some((t) => t.id === 999 && t.name === 'Beginner' && t.masterTagCategoryId === 60),
  },
  {
    name: 'GET /api/master/ai-models',
    method: 'GET',
    url: `${BASE}/api/master/ai-models`,
    expectFromDb: (data) =>
      data.success &&
      Array.isArray(data.data?.items) &&
      data.data.items.some((m) => m.id === 1 && m.modelName === 'GPT-4o' && m.providerName === 'OpenAI'),
  },
  {
    name: 'GET /api/master/ai-prompts',
    method: 'GET',
    url: `${BASE}/api/master/ai-prompts`,
    expectFromDb: (data) =>
      data.success &&
      Array.isArray(data.data?.items) &&
      data.data.items.some((p) => p.id === 1 && p.title === 'Generate Course Outline' && p.category === 'course'),
  },
  {
    name: 'GET /api/master/ai-prompts?category=course',
    method: 'GET',
    url: `${BASE}/api/master/ai-prompts?category=course`,
    expectFromDb: (data) =>
      data.success && Array.isArray(data.data?.items) && data.data.items.length >= 1,
  },
  {
    name: 'POST /api/courses/generate',
    method: 'POST',
    url: `${BASE}/api/courses/generate`,
    body: {},
    expectFromDb: (data) => data.success === true && data.data && Array.isArray(data.data.items),
  },
];

async function runOne(test) {
  const options = {
    method: test.method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (test.body !== undefined) options.body = JSON.stringify(test.body);
  const res = await fetch(test.url, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, status: res.status, error: 'Invalid JSON', body: text.slice(0, 200) };
  }
  const dbOk = test.expectFromDb(json);
  return {
    ok: res.ok,
    status: res.status,
    dbConnected: dbOk,
    data: json,
  };
}

async function main() {
  console.log('Testing base URL:', BASE);
  console.log('---\n');
  let passed = 0;
  let failed = 0;
  const results = [];
  for (const test of tests) {
    try {
      const result = await runOne(test);
      const success = result.ok && result.dbConnected;
      if (success) passed++;
      else failed++;
      results.push({ name: test.name, ...result });
      const icon = success ? 'PASS' : 'FAIL';
      const dbNote = result.ok && !result.dbConnected ? ' (response OK but data not from main DB?)' : '';
      console.log(`${icon} ${test.name} [${result.status}]${dbNote}`);
      if (!result.ok && result.body) console.log('   Body:', result.body);
    } catch (err) {
      failed++;
      results.push({ name: test.name, error: err.message });
      console.log('FAIL', test.name, err.message);
    }
  }
  console.log('\n---');
  console.log(`Total: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log('\nFailed or unexpected:');
    results.filter((r) => r.error || !r.ok || !r.dbConnected).forEach((r) => {
      console.log(' ', r.name, r.error || r.status || (r.dbConnected === false ? 'data check failed' : ''));
    });
    process.exit(1);
  }
  console.log('\nAll endpoints OK and returning data from the main database.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
