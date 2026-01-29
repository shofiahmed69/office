const express = require('express');
const router = express.Router({ mergeParams: true });
const { pool } = require('../db/pool');

// GET /profiles/:profileId/preferences - get all preferences for a profile
router.get('/', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { rows } = await pool.query(
      'SELECT key, value FROM preferences WHERE profile_id = $1',
      [profileId]
    );
    const prefs = rows.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
    res.json(prefs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// PUT /profiles/:profileId/preferences - set one or more preferences (merge)
router.put('/', async (req, res) => {
  try {
    const { profileId } = req.params;
    const prefs = req.body;
    if (!prefs || typeof prefs !== 'object') {
      return res.status(400).json({ error: 'Body must be an object of key-value preferences' });
    }
    const client = await pool.connect();
    try {
      for (const [key, value] of Object.entries(prefs)) {
        await client.query(
          `INSERT INTO preferences (profile_id, key, value) VALUES ($1, $2, $3)
           ON CONFLICT (profile_id, key) DO UPDATE SET value = $3, updated_at = NOW()`,
          [profileId, key, value == null ? '' : String(value)]
        );
      }
      const { rows } = await client.query(
        'SELECT key, value FROM preferences WHERE profile_id = $1',
        [profileId]
      );
      const out = rows.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {});
      res.json(out);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// DELETE /profiles/:profileId/preferences/:key - remove one preference
router.delete('/:key', async (req, res) => {
  try {
    const { profileId, key } = req.params;
    const result = await pool.query(
      'DELETE FROM preferences WHERE profile_id = $1 AND key = $2 RETURNING key',
      [profileId, key]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Preference not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete preference' });
  }
});

module.exports = router;
