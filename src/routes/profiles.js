const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');

// GET /profiles - list all profiles
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, user_id, name, email, avatar_url, bio, created_at, updated_at FROM profiles ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// GET /profiles/:id - get one profile with preferences and tags
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profileResult = await pool.query(
      'SELECT id, user_id, name, email, avatar_url, bio, created_at, updated_at FROM profiles WHERE id = $1',
      [id]
    );
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const profile = profileResult.rows[0];

    const prefsResult = await pool.query(
      'SELECT key, value FROM preferences WHERE profile_id = $1',
      [id]
    );
    profile.preferences = prefsResult.rows.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    const tagsResult = await pool.query(
      'SELECT t.id, t.name, t.slug FROM tags t JOIN profile_tags pt ON t.id = pt.tag_id WHERE pt.profile_id = $1',
      [id]
    );
    profile.tags = tagsResult.rows;

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /profiles - create profile (supports /api/users/me fields)
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      name,
      email,
      avatar_url,
      bio,
      username,
      first_name,
      last_name,
      profile_picture_url,
      master_hub_id,
      master_country_id,
      primary_role,
      city,
      state,
    } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO profiles (
         user_id, name, email, avatar_url, bio,
         username, first_name, last_name, profile_picture_url,
         master_hub_id, master_country_id, primary_role, city, state
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, user_id, username, email, first_name, last_name, profile_picture_url, avatar_url, primary_role, created_at, updated_at`,
      [
        user_id || null,
        name || null,
        email || null,
        avatar_url || null,
        bio || null,
        username || null,
        first_name || null,
        last_name || null,
        profile_picture_url || null,
        master_hub_id ?? null,
        master_country_id ?? null,
        primary_role || null,
        city || null,
        state || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') res.status(409).json({ error: 'Profile with this user_id or username already exists' });
    else res.status(500).json({ error: 'Failed to create profile' });
  }
});

// PATCH /profiles/:id - update profile
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, avatar_url, bio } = req.body;
    const { rows } = await pool.query(
      `UPDATE profiles SET name = COALESCE($2, name), email = COALESCE($3, email),
       avatar_url = COALESCE($4, avatar_url), bio = COALESCE($5, bio)
       WHERE id = $1 RETURNING id, user_id, name, email, avatar_url, bio, created_at, updated_at`,
      [id, name, email, avatar_url, bio]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE /profiles/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM profiles WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Profile not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

module.exports = router;
