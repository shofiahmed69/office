import { pool } from '../db/pool.js';

function success(items) {
  return { success: true, data: { items } };
}

export async function getCountries(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, country_phone_code AS "countryPhoneCode" FROM master_countries ORDER BY name'
    );
    res.json(success(rows));
  } catch (err) {
    next(err);
  }
}

export async function getStates(req, res, next) {
  try {
    const { countryId } = req.query;
    let query = 'SELECT id, name, master_country_id AS "masterCountryId" FROM master_states';
    const params = [];
    if (countryId) {
      params.push(countryId);
      query += ' WHERE master_country_id = $1';
    }
    query += ' ORDER BY name';
    const { rows } = await pool.query(query, params);
    res.json(success(rows));
  } catch (err) {
    next(err);
  }
}

export async function getCities(req, res, next) {
  try {
    const { stateId } = req.query;
    let query = 'SELECT id, name, master_state_id AS "masterStateId" FROM master_cities';
    const params = [];
    if (stateId) {
      params.push(stateId);
      query += ' WHERE master_state_id = $1';
    }
    query += ' ORDER BY name';
    const { rows } = await pool.query(query, params);
    res.json(success(rows));
  } catch (err) {
    next(err);
  }
}

export async function getTimezones(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, timezone_name AS "timezoneName", utc_offset_minutes AS "utcOffsetMinutes" FROM master_timezones ORDER BY utc_offset_minutes'
    );
    res.json(success(rows));
  } catch (err) {
    next(err);
  }
}

export async function getLanguages(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT id, name FROM master_languages ORDER BY name');
    res.json(success(rows));
  } catch (err) {
    next(err);
  }
}

export async function getHubs(req, res, next) {
  try {
    const { countryId, stateId, cityId } = req.query;
    let query =
      'SELECT id, name, master_country_id AS "masterCountryId", master_state_id AS "masterStateId", master_city_id AS "masterCityId" FROM master_hubs WHERE 1=1';
    const params = [];
    let i = 1;
    if (countryId) {
      params.push(countryId);
      query += ` AND master_country_id = $${i++}`;
    }
    if (stateId) {
      params.push(stateId);
      query += ` AND master_state_id = $${i++}`;
    }
    if (cityId) {
      params.push(cityId);
      query += ` AND master_city_id = $${i++}`;
    }
    query += ' ORDER BY name';
    const { rows } = await pool.query(query, params);
    res.json(success(rows));
  } catch (err) {
    next(err);
  }
}

export async function getTagGroups(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT id, name FROM master_tag_groups ORDER BY name');
    res.json(success(rows));
  } catch (err) {
    next(err);
  }
}

export async function getTagCategories(req, res, next) {
  try {
    const { groupId } = req.query;
    let query =
      'SELECT id, name, master_tag_group_id AS "masterTagGroupId" FROM master_tag_categories';
    const params = [];
    if (groupId) {
      params.push(groupId);
      query += ' WHERE master_tag_group_id = $1';
    }
    query += ' ORDER BY name';
    const { rows } = await pool.query(query, params);
    res.json(success(rows));
  } catch (err) {
    next(err);
  }
}

export async function getTags(req, res, next) {
  try {
    const { categoryId } = req.query;
    let query =
      'SELECT id, name, master_tag_category_id AS "masterTagCategoryId" FROM master_tags';
    const params = [];
    if (categoryId) {
      params.push(categoryId);
      query += ' WHERE master_tag_category_id = $1';
    }
    query += ' ORDER BY name';
    const { rows } = await pool.query(query, params);
    res.json(success(rows));
  } catch (err) {
    next(err);
  }
}

export async function getAiModels(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT id, model_name AS "modelName", provider_name AS "providerName" FROM master_ai_models ORDER BY provider_name, model_name'
    );
    res.json(success(rows));
  } catch (err) {
    next(err);
  }
}

export async function getAiPrompts(req, res, next) {
  try {
    const { category } = req.query;
    let query = 'SELECT id, title, category FROM master_ai_prompts';
    const params = [];
    if (category) {
      params.push(category);
      query += ' WHERE category = $1';
    }
    query += ' ORDER BY title';
    const { rows } = await pool.query(query, params);
    res.json(success(rows));
  } catch (err) {
    next(err);
  }
}
