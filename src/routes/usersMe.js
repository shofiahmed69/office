const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');
const { getCurrentUser } = require('../middleware/auth');

// All routes require current user
router.use(getCurrentUser);

function ok(data) {
  return { success: true, data };
}

// ---- GET /api/users/me ----
router.get('/', async (req, res) => {
  try {
    const id = req.user.id;
    const { rows } = await pool.query(
      `SELECT id, username, email, first_name AS "firstName", last_name AS "lastName",
       COALESCE(profile_picture_url, avatar_url) AS "profilePictureUrl",
       master_hub_id AS "masterHubId", master_country_id AS "masterCountryId", primary_role AS "primaryRole"
       FROM profiles WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Profile not found' });
    const row = rows[0];
    res.json(ok(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// ---- PATCH /api/users/me ----
router.patch('/', async (req, res) => {
  try {
    const id = req.user.id;
    const { firstName, lastName, profilePictureUrl, city, state } = req.body;
    const { rows } = await pool.query(
      `UPDATE profiles SET
         first_name = COALESCE($2, first_name), last_name = COALESCE($3, last_name),
         profile_picture_url = COALESCE($4, profile_picture_url),
         city = COALESCE($5, city), state = COALESCE($6, state),
         updated_at = NOW()
       WHERE id = $1 RETURNING id`,
      [id, firstName, lastName, profilePictureUrl, city, state]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Profile not found' });
    res.json(ok({ updated: true }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// ---- GET /api/users/me/roles ----
router.get('/roles', async (req, res) => {
  try {
    const id = req.user.id;
    const { rows } = await pool.query('SELECT role FROM user_roles WHERE profile_id = $1', [id]);
    const roles = rows.map((r) => r.role);
    res.json(ok({ roles }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch roles' });
  }
});

// ---- GET /api/users/me/permissions ----
router.get('/permissions', async (req, res) => {
  try {
    const id = req.user.id;
    const { rows } = await pool.query('SELECT permission FROM user_permissions WHERE profile_id = $1', [id]);
    const permissions = rows.map((r) => r.permission);
    res.json(ok({ permissions }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch permissions' });
  }
});

// ---- GET /api/users/me/preferences ----
router.get('/preferences', async (req, res) => {
  try {
    const id = req.user.id;
    const { rows } = await pool.query('SELECT key, value FROM preferences WHERE profile_id = $1', [id]);
    const prefs = {};
    for (const { key, value } of rows) {
      if (key === 'availableTimes') {
        try {
          prefs.availableTimes = value ? JSON.parse(value) : [];
        } catch {
          prefs.availableTimes = [];
        }
      } else {
        prefs[key] = value;
      }
    }
    res.json(ok(prefs));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
  }
});

// ---- PATCH /api/users/me/preferences ----
router.patch('/preferences', async (req, res) => {
  try {
    const id = req.user.id;
    const { timezone, weeklyStudyHours, learningStyle, availableTimes } = req.body;
    const client = await pool.connect();
    try {
      const updates = [
        [timezone, 'timezone'],
        [weeklyStudyHours != null ? String(weeklyStudyHours) : null, 'weeklyStudyHours'],
        [learningStyle, 'learningStyle'],
        [availableTimes != null ? JSON.stringify(availableTimes) : null, 'availableTimes'],
      ];
      for (const [value, key] of updates) {
        if (value === undefined) continue;
        await client.query(
          `INSERT INTO preferences (profile_id, key, value) VALUES ($1, $2, $3)
           ON CONFLICT (profile_id, key) DO UPDATE SET value = $3, updated_at = NOW()`,
          [id, key, value == null ? '' : value]
        );
      }
      res.json(ok({ updated: true }));
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
});

// ---- GET /api/users/me/tags ----
router.get('/tags', async (req, res) => {
  try {
    const id = req.user.id;
    const { rows } = await pool.query(
      `SELECT pt.tag_id AS id, t.name AS "tagName", COALESCE(pt.tag_value, '') AS "tagValue",
       COALESCE(pt.rating_score, 0) AS "ratingScore"
       FROM profile_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.profile_id = $1 ORDER BY t.name`,
      [id]
    );
    res.json(ok({ tags: rows }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch tags' });
  }
});

// ---- POST /api/users/me/tags ----
router.post('/tags', async (req, res) => {
  try {
    const id = req.user.id;
    const { tagName, tagValue, ratingScore, sourceType } = req.body;
    if (!tagName || !String(tagName).trim()) {
      return res.status(400).json({ success: false, error: 'tagName is required' });
    }
    const slug = tagName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') || 'tag';
    const client = await pool.connect();
    try {
      const tagResult = await client.query(
        'INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = $1 RETURNING id',
        [tagName.trim(), slug]
      );
      const tagId = tagResult.rows[0].id;
      await client.query(
        `INSERT INTO profile_tags (profile_id, tag_id, tag_value, rating_score, source_type)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (profile_id, tag_id) DO UPDATE SET tag_value = $3, rating_score = $4, source_type = $5`,
        [id, tagId, tagValue ?? '', ratingScore ?? 0, sourceType ?? 'manual']
      );
      res.status(201).json(ok({ tagId }));
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to add tag' });
  }
});

// ---- DELETE /api/users/me/tags/:id ----
router.delete('/tags/:id', async (req, res) => {
  try {
    const profileId = req.user.id;
    const tagId = req.params.id;
    const result = await pool.query(
      'DELETE FROM profile_tags WHERE profile_id = $1 AND tag_id = $2 RETURNING 1',
      [profileId, tagId]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Tag link not found' });
    res.json(ok({ deleted: true }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete tag' });
  }
});

// ---- GET /api/users/me/ai-settings ----
router.get('/ai-settings', async (req, res) => {
  try {
    const id = req.user.id;
    const { rows } = await pool.query(
      'SELECT id, provider_name AS "providerName", model, is_active AS "isActive", created_at AS "createdAt" FROM user_ai_settings WHERE profile_id = $1 ORDER BY id',
      [id]
    );
    res.json(ok(rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch AI settings' });
  }
});

// ---- POST /api/users/me/ai-settings ----
router.post('/ai-settings', async (req, res) => {
  try {
    const id = req.user.id;
    const { providerName, apiKeyEncrypted, model, isActive } = req.body;
    if (!providerName || !String(providerName).trim()) {
      return res.status(400).json({ success: false, error: 'providerName is required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO user_ai_settings (profile_id, provider_name, api_key_encrypted, model, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, provider_name AS "providerName", model, is_active AS "isActive", created_at AS "createdAt"`,
      [id, providerName.trim(), apiKeyEncrypted ?? null, model ?? null, isActive !== false]
    );
    res.status(201).json(ok(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create AI setting' });
  }
});

// ---- PATCH /api/users/me/ai-settings/:id ----
router.patch('/ai-settings/:id', async (req, res) => {
  try {
    const profileId = req.user.id;
    const settingId = req.params.id;
    const { providerName, apiKeyEncrypted, model, isActive } = req.body;
    const { rows } = await pool.query(
      `UPDATE user_ai_settings SET
         provider_name = COALESCE($3, provider_name), api_key_encrypted = COALESCE($4, api_key_encrypted),
         model = COALESCE($5, model), is_active = COALESCE($6, is_active), updated_at = NOW()
       WHERE id = $1 AND profile_id = $2
       RETURNING id, provider_name AS "providerName", model, is_active AS "isActive", updated_at AS "updatedAt"`,
      [settingId, profileId, providerName, apiKeyEncrypted, model, isActive]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'AI setting not found' });
    res.json(ok(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update AI setting' });
  }
});

// ---- DELETE /api/users/me/ai-settings/:id ----
router.delete('/ai-settings/:id', async (req, res) => {
  try {
    const profileId = req.user.id;
    const settingId = req.params.id;
    const result = await pool.query('DELETE FROM user_ai_settings WHERE id = $1 AND profile_id = $2 RETURNING 1', [
      settingId,
      profileId,
    ]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'AI setting not found' });
    res.json(ok({ deleted: true }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete AI setting' });
  }
});

module.exports = router;
