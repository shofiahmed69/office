import { pool } from './pool.js';

const sql = `
-- Master countries
CREATE TABLE IF NOT EXISTS master_countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country_phone_code VARCHAR(20)
);

-- Master states
CREATE TABLE IF NOT EXISTS master_states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  master_country_id INTEGER NOT NULL REFERENCES master_countries(id)
);

-- Master cities
CREATE TABLE IF NOT EXISTS master_cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  master_state_id INTEGER NOT NULL REFERENCES master_states(id)
);

-- Master timezones
CREATE TABLE IF NOT EXISTS master_timezones (
  id SERIAL PRIMARY KEY,
  timezone_name VARCHAR(255) NOT NULL,
  utc_offset_minutes INTEGER NOT NULL
);

-- Master languages
CREATE TABLE IF NOT EXISTS master_languages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Master hubs
CREATE TABLE IF NOT EXISTS master_hubs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  master_country_id INTEGER REFERENCES master_countries(id),
  master_state_id INTEGER REFERENCES master_states(id),
  master_city_id INTEGER REFERENCES master_cities(id)
);

-- Master tag groups
CREATE TABLE IF NOT EXISTS master_tag_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Master tag categories
CREATE TABLE IF NOT EXISTS master_tag_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  master_tag_group_id INTEGER NOT NULL REFERENCES master_tag_groups(id)
);

-- Master tags
CREATE TABLE IF NOT EXISTS master_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  master_tag_category_id INTEGER NOT NULL REFERENCES master_tag_categories(id)
);

-- Master AI models
CREATE TABLE IF NOT EXISTS master_ai_models (
  id SERIAL PRIMARY KEY,
  model_name VARCHAR(255) NOT NULL,
  provider_name VARCHAR(255) NOT NULL
);

-- Master AI prompts
CREATE TABLE IF NOT EXISTS master_ai_prompts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_states_country ON master_states(master_country_id);
CREATE INDEX IF NOT EXISTS idx_cities_state ON master_cities(master_state_id);
CREATE INDEX IF NOT EXISTS idx_hubs_country ON master_hubs(master_country_id);
CREATE INDEX IF NOT EXISTS idx_hubs_state ON master_hubs(master_state_id);
CREATE INDEX IF NOT EXISTS idx_hubs_city ON master_hubs(master_city_id);
CREATE INDEX IF NOT EXISTS idx_tag_categories_group ON master_tag_categories(master_tag_group_id);
CREATE INDEX IF NOT EXISTS idx_tags_category ON master_tags(master_tag_category_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_category ON master_ai_prompts(category);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Migration completed.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
