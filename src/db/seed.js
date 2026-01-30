import { pool } from './pool.js';

const now = new Date().toISOString();

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM master_tags');
    await client.query('DELETE FROM master_tag_categories');
    await client.query('DELETE FROM master_tag_groups');
    await client.query('DELETE FROM master_ai_prompts');
    await client.query('DELETE FROM master_ai_models');
    await client.query('DELETE FROM master_hubs');
    await client.query('DELETE FROM master_cities');
    await client.query('DELETE FROM master_states');
    await client.query('DELETE FROM master_countries');
    await client.query('DELETE FROM master_timezones');
    await client.query('DELETE FROM master_languages');

    await client.query(`
      INSERT INTO master_countries (id, name, country_phone_code, created_at, updated_at) VALUES
      (104, 'India', '+91', $1, $1);
    `, [now]);
    await client.query(`SELECT setval(pg_get_serial_sequence('master_countries', 'id'), (SELECT COALESCE(MAX(id), 1) FROM master_countries));`);

    await client.query(`
      INSERT INTO master_states (id, name, master_country_id, created_at, updated_at) VALUES
      (1, 'Maharashtra', 104, $1, $1);
    `, [now]);
    await client.query(`SELECT setval(pg_get_serial_sequence('master_states', 'id'), (SELECT COALESCE(MAX(id), 1) FROM master_states));`);

    await client.query(`
      INSERT INTO master_cities (id, name, master_state_id, created_at, updated_at) VALUES
      (10, 'Mumbai', 1, $1, $1);
    `, [now]);
    await client.query(`SELECT setval(pg_get_serial_sequence('master_cities', 'id'), (SELECT COALESCE(MAX(id), 1) FROM master_cities));`);

    await client.query(`
      INSERT INTO master_timezones (id, timezone_name, utc_offset_minutes) VALUES
      (1, 'India Standard Time (UTC+5:30)', 330);
    `);
    await client.query(`SELECT setval(pg_get_serial_sequence('master_timezones', 'id'), (SELECT COALESCE(MAX(id), 1) FROM master_timezones));`);

    await client.query(`
      INSERT INTO master_languages (id, name, created_at, updated_at) VALUES
      (1, 'English', $1, $1);
    `, [now]);
    await client.query(`SELECT setval(pg_get_serial_sequence('master_languages', 'id'), (SELECT COALESCE(MAX(id), 1) FROM master_languages));`);

    await client.query(`
      INSERT INTO master_hubs (id, name, master_country_id) VALUES
      (1, 'Mumbai Hub', 104);
    `);
    await client.query(`SELECT setval(pg_get_serial_sequence('master_hubs', 'id'), (SELECT COALESCE(MAX(id), 1) FROM master_hubs));`);

    await client.query(`
      INSERT INTO master_tag_groups (id, name, is_public_or_private_tag, created_at, updated_at) VALUES
      (29, 'Skill Tags', true, $1, $1);
    `, [now]);
    await client.query(`SELECT setval(pg_get_serial_sequence('master_tag_groups', 'id'), (SELECT COALESCE(MAX(id), 1) FROM master_tag_groups));`);

    await client.query(`
      INSERT INTO master_tag_categories (id, name, master_tag_group_id, is_public_or_private_tag, created_at, updated_at) VALUES
      (60, 'Skill Level', 29, true, $1, $1);
    `, [now]);
    await client.query(`SELECT setval(pg_get_serial_sequence('master_tag_categories', 'id'), (SELECT COALESCE(MAX(id), 1) FROM master_tag_categories));`);

    await client.query(`
      INSERT INTO master_tags (id, name, master_tag_category_id, created_at, updated_at) VALUES
      (999, 'Beginner', 60, $1, $1);
    `, [now]);
    await client.query(`SELECT setval(pg_get_serial_sequence('master_tags', 'id'), (SELECT COALESCE(MAX(id), 1) FROM master_tags));`);

    await client.query(`
      INSERT INTO master_ai_models (id, model_name, provider_name, is_active, created_at, updated_at) VALUES
      (1, 'GPT-4o', 'OpenAI', true, $1, $1);
    `, [now]);
    await client.query(`SELECT setval(pg_get_serial_sequence('master_ai_models', 'id'), (SELECT COALESCE(MAX(id), 1) FROM master_ai_models));`);

    await client.query(`
      INSERT INTO master_ai_prompts (id, title, category) VALUES
      (1, 'Generate Course Outline', 'course');
    `);
    await client.query(`SELECT setval(pg_get_serial_sequence('master_ai_prompts', 'id'), (SELECT COALESCE(MAX(id), 1) FROM master_ai_prompts));`);

    console.log('Seed completed.');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
